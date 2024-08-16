import type { Transport } from '@graphql-mesh/transport-common';
import { getNeo4JExecutor } from './executor.js';

export * from './auth.js';
export * from './driver.js';
export * from './eventEmitterForPubSub.js';
export * from './executor.js';

export const neo4jTransport = {
  getSubgraphExecutor({ subgraph, pubsub, logger }) {
    return getNeo4JExecutor({
      schema: subgraph,
      pubsub,
      logger,
    });
  },
} satisfies Transport;

export default neo4jTransport;
