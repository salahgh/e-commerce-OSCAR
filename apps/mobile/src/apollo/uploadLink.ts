import { ApolloLink, Observable } from '@apollo/client';
import { print } from 'graphql';

// A minimal Apollo terminal link implementing the graphql-multipart-request-spec
// (https://github.com/jaydenseric/graphql-multipart-request-spec) for React Native.
//
// Why not apollo-upload-client? v17 (which still exports `createUploadLink`) peer-depends on
// Apollo Client v3, and v19 (Apollo v4-compatible) renamed the API to `UploadHttpLink` and
// ships pure-ESM subpath exports that Metro's default resolver can't follow. A tiny inline
// link avoids the dependency entirely: it behaves like HttpLink for normal operations and
// switches to multipart/form-data when a variable carries a file. RN file descriptors are
// `{ uri, name, type }` objects (what expo-image-picker produces), which RN's FormData streams.

function isFileValue(value: unknown): boolean {
  if (!value) return false;
  if (typeof File !== 'undefined' && value instanceof File) return true;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return true;
  // React Native file descriptor
  return typeof value === 'object' && typeof (value as { uri?: unknown }).uri === 'string';
}

interface ExtractedFile {
  path: string;
  file: unknown;
}

// Walk variables, pull out file values (replacing them with null in a deep clone), and record
// each file's object path (e.g. "variables.file") for the multipart `map`.
function extractFiles(variables: Record<string, unknown>): {
  clone: Record<string, unknown>;
  files: ExtractedFile[];
} {
  const files: ExtractedFile[] = [];
  function recurse(val: unknown, currentPath: string): unknown {
    if (isFileValue(val)) {
      files.push({ path: currentPath, file: val });
      return null;
    }
    if (Array.isArray(val)) {
      return val.map((item, i) => recurse(item, `${currentPath}.${i}`));
    }
    if (val && typeof val === 'object') {
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(val as Record<string, unknown>)) {
        out[key] = recurse((val as Record<string, unknown>)[key], `${currentPath}.${key}`);
      }
      return out;
    }
    return val;
  }
  const clone = recurse(variables, 'variables') as Record<string, unknown>;
  return { clone, files };
}

export function createRNUploadLink({
  uri: defaultUri,
  credentials: defaultCredentials,
}: {
  uri: string;
  credentials?: string;
}): ApolloLink {
  return new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        const context = operation.getContext();
        const uri: string = context.uri || defaultUri;
        const credentials: string | undefined = context.credentials || defaultCredentials;
        const headers: Record<string, string> = { ...(context.headers || {}) };

        const { clone, files } = extractFiles(
          (operation.variables as Record<string, unknown>) ?? {}
        );
        const requestBody = {
          operationName: operation.operationName,
          query: print(operation.query),
          variables: clone,
        };

        let body: BodyInit;
        if (files.length > 0) {
          const form = new FormData();
          form.append('operations', JSON.stringify(requestBody));
          const map: Record<string, string[]> = {};
          files.forEach((f, i) => {
            map[String(i)] = [f.path];
          });
          form.append('map', JSON.stringify(map));
          files.forEach((f, i) => {
            // RN FormData accepts the { uri, name, type } descriptor as a file part.
            form.append(String(i), f.file as unknown as Blob);
          });
          body = form;
          // Let fetch set the multipart boundary; drop any JSON content-type.
          delete headers['content-type'];
          delete headers['Content-Type'];
          // Apollo Server CSRF-prevention requires a preflight marker on multipart requests.
          headers['Apollo-Require-Preflight'] = 'true';
        } else {
          body = JSON.stringify(requestBody);
          headers['content-type'] = 'application/json';
          headers.accept = headers.accept || '*/*';
        }

        let aborted = false;
        fetch(uri, {
          method: 'POST',
          headers,
          body,
          credentials: credentials as RequestCredentials | undefined,
        })
          .then(async (response) => {
            // Expose the raw response so the afterware link can read the vendure-token header.
            operation.setContext({ response });
            const json = await response.json();
            if (aborted) return;
            observer.next(json);
            observer.complete();
          })
          .catch((error) => {
            if (!aborted) observer.error(error);
          });

        return () => {
          aborted = true;
        };
      })
  );
}
