const fs = require('fs');
const https = require('https');
const http = require('http');

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:8085/graphql';

// Standard GraphQL introspection query
const introspectionQuery = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type { ...TypeRef }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

function makeRequest(url, data) {
  const urlObj = new URL(url);
  const client = urlObj.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(body);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function fetchSchema() {
  console.log(`Fetching GraphQL schema from ${GRAPHQL_ENDPOINT}...`);

  const payload = JSON.stringify({
    query: introspectionQuery,
  });

  try {
    const response = await makeRequest(GRAPHQL_ENDPOINT, payload);
    const result = JSON.parse(response);

    if (result.errors) {
      console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2));
      process.exit(1);
    }

    if (!result.data) {
      console.error('No data in response:', response);
      process.exit(1);
    }

    // Save introspection result
    const introspectionPath = 'schema-introspection.json';
    fs.writeFileSync(introspectionPath, JSON.stringify(result, null, 2));
    console.log(`✓ Saved introspection result to ${introspectionPath}`);

    // Convert to SDL format
    const { buildClientSchema, printSchema } = require('graphql');
    const schema = buildClientSchema(result.data);
    const sdl = printSchema(schema);

    // Save SDL format
    const sdlPath = 'schema.graphql';
    fs.writeFileSync(sdlPath, sdl);
    console.log(`✓ Saved GraphQL SDL to ${sdlPath}`);

    console.log('\nSchema fetched successfully!');
    console.log(`Query type: ${result.data.__schema.queryType?.name || 'N/A'}`);
    console.log(`Mutation type: ${result.data.__schema.mutationType?.name || 'N/A'}`);
    console.log(`Subscription type: ${result.data.__schema.subscriptionType?.name || 'N/A'}`);
    console.log(`Total types: ${result.data.__schema.types.length}`);
  } catch (error) {
    console.error('Error fetching schema:', error.message);
    process.exit(1);
  }
}

fetchSchema();
