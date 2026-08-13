export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;

  audioVisualizerType?: 'bar' | 'wave' | 'grid' | 'radial' | 'aura';
  audioVisualizerColor?: `#${string}`;
  audioVisualizerColorDark?: `#${string}`;
  audioVisualizerColorShift?: number;
  audioVisualizerBarCount?: number;
  audioVisualizerGridRowCount?: number;
  audioVisualizerGridColumnCount?: number;
  audioVisualizerRadialBarCount?: number;
  audioVisualizerRadialRadius?: number;
  audioVisualizerWaveLineWidth?: number;

  agentName?: string;
  sandboxId?: string;
}

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Learning Companion',
  pageTitle: 'Learning Companion - Voice Learning Platform',
  pageDescription:
    'A voice-first learning platform with tutoring, consent memory, teacher handoff, and live analytics.',

  supportsChatInput: true,
  supportsVideoInput: false,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,

  logo: '/murf-logo.svg',
  accent: '#2DD4BF',
  logoDark: '/murf-logo-dark.svg',
  accentDark: '#5EEAD4',
  startButtonText: 'Start voice session',

  audioVisualizerType: 'aura',
  audioVisualizerColor: '#2DD4BF',
  audioVisualizerColorDark: '#5EEAD4',
  audioVisualizerColorShift: 0.38,

  agentName: process.env.AGENT_NAME ?? undefined,
  sandboxId: undefined,
};
