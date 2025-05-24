export type Theme = 'light' | 'dark';

export interface ThemeState {
  theme: Theme;
  showSettings: boolean;
}

export interface ThemeClassNames {
  container: string;
  card: string;
  input: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
} 