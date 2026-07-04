export {
  IDENTITY_EDGE_KINDS,
  IDENTITY_EDGE_KIND_LABELS,
  IDENTITY_NODE_KINDS,
  IDENTITY_NODE_KIND_LABELS,
  isIdentityEdgeKind,
  isIdentityNodeKind
} from './schema';

export {
  createEmptyIdentityGraph,
  addNode,
  addEdge,
  removeNode,
  removeEdge,
  getNode,
  getOutgoingEdges,
  getIncomingEdges,
  validateIdentityGraph,
  subgraph,
  touchIdentityGraph
} from './graph';

export { queryIdentityGraph } from './query';

export {
  createInMemoryIdentityGraphStore,
  emptyIdentityGraphStore,
  type IdentityGraphStore
} from './store';

export {
  createIdentityGraphProvider,
  identityGraphProvider,
  type IdentityGraphProvider
} from './provider';

export { formatIdentityGraphForBrain, formatIdentityGraphSummary } from './brainContext';

export { EXAMPLE_IDENTITY_CHAIN_LABELS, buildExampleIdentityChainGraph } from './fixtures';

export { resolveIdentityContextForBrain } from './executiveBrain';

export type {
  IdentityGraph,
  IdentityNode,
  IdentityEdge,
  IdentityNodeKind,
  IdentityEdgeKind,
  IdentityNodeStatus,
  IdentitySourceRef,
  IdentitySourceType,
  IdentityQuery,
  IdentityQueryResult,
  IdentityGraphValidationIssue,
  IdentityGraphValidationReport,
  IdentityInterpretation,
  MemoryFact
} from './types';

export { IDENTITY_GRAPH_VERSION } from './types';
