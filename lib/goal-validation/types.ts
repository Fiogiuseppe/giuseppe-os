/**
 * Goal Validation Engine — never blindly optimize stated goals.
 * Sometimes the best advice is: "You are optimizing the wrong goal."
 */

export interface GoalValidationInput {
  statedGoal: string;
  context: string;
  evidence: string[];
}

export interface GoalValidationReport {
  generatedAt: string;
  statedGoal: string;
  underlyingNeed: string | null;
  wrongGoalRisk: boolean;
  challengeRecommended: boolean;
  respectfulChallenge: string | null;
  rationale: string;
  confidence: 'high' | 'medium' | 'low';
}
