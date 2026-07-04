/**
 * Voice DNA — learn how Giuseppe writes, speaks, and inspires.
 * Future suggestions must sound like Giuseppe, not like an AI.
 */

export interface VoiceDnaDimensions {
  howHeWrites: string[];
  howHeSpeaks: string[];
  howHeTellsStories: string[];
  howHeJokes: string[];
  howHeInspires: string[];
}

export interface VoiceDnaModel {
  version: string;
  updatedAt: string;
  confidence: 'high' | 'medium' | 'low';
  dimensions: VoiceDnaDimensions;
  sampleSources: string[];
  note: string;
}
