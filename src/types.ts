export interface Settings {
  hideEnabled: boolean;
  watchThreshold: number; // 0-100 percentage
}

export const DEFAULT_SETTINGS: Settings = {
  hideEnabled: true,
  watchThreshold: 50,
};

export interface Message {
  type: 'SETTINGS_UPDATED';
  settings: Settings;
}
