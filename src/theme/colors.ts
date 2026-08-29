export const colors = {
  primary: '#3b74f5',
  primaryDark: '#1d4ed8',
  navy: '#0d1b3e',
  cyan: '#09b6e8',
  background: '#ffffff',
  surface: '#f0f4f8',
  border: '#dde5f0',
  muted: '#64748b',
  text: '#0f172a',
  destructive: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
} as const;

export type ColorKey = keyof typeof colors;
