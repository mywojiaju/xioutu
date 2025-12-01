export enum FeatureType {
  RECOGNITION = 'RECOGNITION',
  SMOOTH_SKIN = 'SMOOTH_SKIN',
  FACE_SWAP = 'FACE_SWAP',
  CHANGE_CLOTHES = 'CHANGE_CLOTHES',
  CHANGE_BACKGROUND = 'CHANGE_BACKGROUND'
}

export interface ProcessResult {
  type: 'text' | 'image';
  content: string; // Text description or Base64 Image string
}

export interface FeatureConfig {
  id: FeatureType;
  label: string;
  icon: string;
  description: string;
  defaultPrompt: string;
  requiresInput: boolean; // If true, allows user to customize the prompt
  inputLabel?: string;
}
