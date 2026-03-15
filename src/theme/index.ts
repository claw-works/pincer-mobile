/**
 * Pincer theme system
 * dark = default (geek dark), light = clean light
 */
export type Theme = 'dark' | 'light';

export interface ThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  accent: string;        // geek green in dark, indigo in light
  bubbleMine: string;
  bubbleTheirs: string;
  bubbleMineText: string;
  bubbleTheirsText: string;
  inputBg: string;
  inputBorder: string;
  tabBarBg: string;
  headerBg: string;
  statusBar: 'light-content' | 'dark-content';
}

export const darkTheme: ThemeColors = {
  bg: '#0d1117',           // GitHub dark bg
  surface: '#161b22',      // card bg
  surface2: '#21262d',     // input / secondary surface
  border: '#30363d',
  text: '#e6edf3',
  textSecondary: '#8b949e',
  textMuted: '#484f58',
  primary: '#00ff87',      // matrix green
  primaryText: '#0d1117',
  accent: '#00ff87',
  bubbleMine: '#00b894',   // teal-green bubble
  bubbleTheirs: '#21262d',
  bubbleMineText: '#0d1117',
  bubbleTheirsText: '#e6edf3',
  inputBg: '#161b22',
  inputBorder: '#30363d',
  tabBarBg: '#161b22',
  headerBg: '#161b22',
  statusBar: 'light-content',
};

export const lightTheme: ThemeColors = {
  bg: '#f9fafb',
  surface: '#ffffff',
  surface2: '#f3f4f6',
  border: '#e5e7eb',
  text: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#d1d5db',
  primary: '#6366f1',
  primaryText: '#ffffff',
  accent: '#6366f1',
  bubbleMine: '#6366f1',
  bubbleTheirs: '#e5e7eb',
  bubbleMineText: '#ffffff',
  bubbleTheirsText: '#1f2937',
  inputBg: '#f9fafb',
  inputBorder: '#e5e7eb',
  tabBarBg: '#ffffff',
  headerBg: '#ffffff',
  statusBar: 'dark-content',
};

export const themes = { dark: darkTheme, light: lightTheme };
