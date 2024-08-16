import type { Transport } from '@graphql-mesh/transport-common';
import { getThriftExecutor } from './execution.js';

export { getThriftExecutor };

export * from './types.js';

export const thriftTransport = {
  getSubgraphExecutor({ subgraph }) {
    return getThriftExecutor(subgraph);
  },
} satisfies Transport;

export default thriftTransport;
