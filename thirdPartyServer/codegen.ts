import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: {
        'src/graphql/typeDefs/**/*.ts': {
            commentDescriptions: true,
        }
    },
    require: ['ts-node/register'],
    generates: {
        'src/graphql/typeDefs/index.ts': {
            plugins: ['typescript', 'typescript-resolvers']
        },
    },
};
export default config;
