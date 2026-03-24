import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  // Use Vendure Shop API for customer-facing frontend
  schema: 'http://localhost:8085/shop-api',
  // Only process Vendure-compatible GraphQL files
  documents: ['src/graphql/vendure/**/*.graphql'],
  generates: {
    'src/graphql/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
        skipTypename: false,
        // Vendure-specific scalar mappings
        scalars: {
          DateTime: 'string',
          JSON: 'Record<string, any>',
          Money: 'number',
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
