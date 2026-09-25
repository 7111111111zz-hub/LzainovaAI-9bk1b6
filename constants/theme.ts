// Lzainova AI - Design System
export const Colors = {
  // Backgrounds
  bg: '#070A14',
  bgCard: '#101528',
  bgField: '#12182B',
  bgSurface: '#0D1220',
  bgElevated: '#151D30',

  // Borders
  border: '#1E2D4A',
  borderAccent: '#2A3F6B',
  borderGlow: '#3B5299',

  // Brand
  primary: '#5B6EF5',
  primaryDark: '#4558D4',
  primaryLight: '#7B8EFF',
  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',
  accent: '#3B82F6',

  // Text
  textPrimary: '#F0F4FF',
  textSecondary: '#7A8FC4',
  textMuted: '#4A5A80',
  textInverse: '#0D1220',

  // Semantic
  success: '#10B981',
  successBg: '#0D2B22',
  successBorder: '#1A4A38',
  warning: '#F59E0B',
  warningBg: '#2B1F0A',
  error: '#EF4444',
  errorBg: '#2B0A0A',
  info: '#3B82F6',
  infoBg: '#0A1528',

  // Agent States
  running: '#8B5CF6',
  pending: '#4A5A80',
  done: '#10B981',
  failed: '#EF4444',
  skipped: '#F59E0B',

  // Modes
  modeChat: '#3B82F6',
  modeCode: '#8B5CF6',
  modeTask: '#F59E0B',
  modeVision: '#10B981',
  modeMemory: '#06B6D4',

  // Light Mode
  lightBg: '#F0F4FF',
  lightCard: '#FFFFFF',
  lightField: '#E8ECFF',
  lightBorder: '#C8D4F0',
  lightTextPrimary: '#0D1220',
  lightTextSecondary: '#4A5A80',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 34,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#5B6EF5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#5B6EF5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#5B6EF5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};
