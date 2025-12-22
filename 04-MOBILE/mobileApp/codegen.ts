import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:8085/shop-api',
  documents: ['src/graphql/**/*.{ts,tsx,graphql}'],
  generates: {
    'src/graphql/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
        skipTypename: false,
        apolloReactHooksImportFrom: '@apollo/client/react',
        scalars: {
          DateTime: 'string',
          Money: 'number',
          JSON: 'Record<string, any>',
          Upload: 'File',
        },
      },
    },
  },
  hooks: {
    afterOneFileWrite: ['prettier --write'],
  },
};

export default config;
