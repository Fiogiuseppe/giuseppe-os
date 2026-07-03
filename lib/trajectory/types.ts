export type TrajectoryDirection = 'strengthens' | 'weakens' | 'unclear';

export interface TrajectoryEvaluation {
  id: string;
  recommendation: string;
  direction: TrajectoryDirection;
  confidence: 'high' | 'medium' | 'low';
  tenYearGratitude: boolean | 'unclear';
  rationale: string;
  approved: boolean;
}

export interface TrajectoryReport {
  generatedAt: string;
  trajectoryQuestion: string;
  tenYearQuestion: string;
  evaluations: TrajectoryEvaluation[];
  approvedCount: number;
  filteredCount: number;
  trajectoryNote: string;
}
