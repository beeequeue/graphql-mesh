import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { defineConfig as defineComposeConfig } from '@graphql-mesh/compose-cli';
import { defineConfig as defineServeConfig } from '@graphql-mesh/serve-cli';

export const composeConfig = defineComposeConfig({
  subgraphs: [
    {
      sourceHandler: () => ({
        name: 'helloworld',
        schema$: new GraphQLSchema({
          query: new GraphQLObjectType({
            name: 'Query',
            fields: {
              hello: {
                type: GraphQLString,
                resolve: () => 'world',
              },
            },
          }),
        }),
      }),
    },
  ],
});

export const serveConfig = defineServeConfig({
  additionalResolvers: {
    Query: {
      hello() {
        return 'world';
      },
    },
  },
});