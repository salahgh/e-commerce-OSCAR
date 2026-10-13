import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/graphql/schema.graphql',
  documents: ['src/graphql/**/*.graphql', '!src/graphql/schema.graphql'],
  ignoreNoDocuments: true,
  generates: {
    './src/graphql/generated/': {
      preset: 'client',
      // Plain result types: components read fragment fields directly (no useFragment).
      presetConfig: { fragmentMasking: false },
      config: {
        useTypeImports: true,
      },
    },
  },
};

export default config;
