export type { TrajectoryDirection, TrajectoryEvaluation, TrajectoryReport } from './types';
export {
  applyTrajectoryToBriefing
} from './briefingFilter';
export {
  evaluateTrajectoryRecommendations,
  filterRelevanceByTrajectory,
  runTrajectoryEngine,
  type TrajectoryContext
} from './engine';
