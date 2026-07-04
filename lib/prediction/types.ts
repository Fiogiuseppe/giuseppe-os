/**
 * Prediction Engine — generate predictions, later compare to reality, calibrate.
 */

export interface Prediction {
  id: string;
  generatedAt: string;
  hypothesis: string;
  horizon: 'weeks' | 'months' | 'years';
  confidence: 'high' | 'medium' | 'low';
  basis: string[];
}

export interface PredictionCalibration {
  predictionId: string;
  evaluatedAt: string;
  outcome: 'confirmed' | 'partial' | 'wrong' | 'too_early';
  lesson: string;
}
