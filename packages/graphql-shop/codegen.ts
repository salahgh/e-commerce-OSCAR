import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  // Override with SHOP_SCHEMA_URL=https://api.oscarfashion.dz/shop-api when no local backend runs.
  schema: process.env.SHOP_SCHEMA_URL ?? 'http://localhost:8085/shop-api',
  documents: ['src/operations/**/*.graphql'],
  generates: {
    'src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
        skipTypename: false,
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
