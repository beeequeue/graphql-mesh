import type { DocumentNode } from 'graphql';
import { print } from 'graphql';
import { getDocumentString } from '@envelop/core';
import type { TransportGetSubgraphExecutor } from '@graphql-mesh/transport-common';
import { buildGraphQLWSExecutor } from '@graphql-tools/executor-graphql-ws';
import { buildHTTPExecutor, type HTTPExecutorOptions } from '@graphql-tools/executor-http';

export type HTTPTransportOptions = Pick<
  HTTPExecutorOptions,
  'useGETForQueries' | 'method' | 'timeout' | 'credentials' | 'retry'
> & {
  subscriptions?: {
    ws?: {
      subgraphs?: {
        [subgraph: '*' | string]: {
          path: string;
        };
      };
    };
  };
};

// Use Envelop's print/parse cache to avoid parsing the same document multiple times
// TODO: Maybe a shared print/parse cache in the future?
function printFnForHTTPExecutor(document: DocumentNode) {
  return getDocumentString(document, print);
}

export const getSubgraphExecutor: TransportGetSubgraphExecutor<'http', HTTPTransportOptions> =
  function getHTTPSubgraphExecutor({ transportEntry, fetch }) {
    let headers: Record<string, string> | undefined;
    if (typeof transportEntry.headers === 'string') {
      headers = JSON.parse(transportEntry.headers);
    }
    if (Array.isArray(transportEntry.headers)) {
      headers = Object.fromEntries(transportEntry.headers);
    }

    const httpExecutor = buildHTTPExecutor({
      endpoint: transportEntry.location,
      headers,
      fetch,
      print: printFnForHTTPExecutor,
      ...transportEntry.options,
    });

    return function HTTPExecutor(request) {
      if (request.operationType === 'subscription') {
        const wsOpts =
          transportEntry.options?.subscriptions?.ws?.subgraphs?.[transportEntry.subgraph] ||
          transportEntry.options?.subscriptions?.ws?.subgraphs?.['*'];
        if (wsOpts) {
          const hostname = /\/\/(.+?)\//.exec(transportEntry.location)[1];
          if (!hostname) {
            throw new Error(`Unable to extract hostname from "${transportEntry.location}"`);
          }

          let protocol = 'ws';
          if (transportEntry.location.startsWith('https')) {
            protocol = 'wss';
          }

          // apollo federation passes the HTTP `Authorization` header through `connectionParams.token`
          // see https://www.apollographql.com/docs/router/executing-operations/subscription-support/#websocket-auth-support
          const headers = request.context?.request?.headers;
          let token = headers.authorization;
          if (!token && 'get' in headers && typeof headers.get === 'function') {
            // TODO: why do I have to do this for graphql-sse? shouldnt headers be normalised?
            token = headers.get('authorization');
          }

          // TODO: dont recreate on each execute
          return buildGraphQLWSExecutor({
            url: `${protocol}://${hostname}${wsOpts.path}`,
            connectionParams: token ? { token } : undefined,
            retryAttempts: transportEntry.options?.retry,
          })(request);
        }
      }

      return httpExecutor(request);
    };
  };
