export type YouTubeView =
  | "home"
  | "subscriptions"
  | "watchLater"
  | "playlists"
  | "search"
  | "channel"
  | "suggestions";

export interface ViewSettings {
  home: boolean;
  subscriptions: boolean;
  watchLater: boolean;
  playlists: boolean;
  search: boolean;
  channel: boolean;
  suggestions: boolean;
}

export interface Settings {
  viewSettings: ViewSettings;
  watchThreshold: number; // 0-100 percentage
}

export const DEFAULT_SETTINGS: Settings = {
  viewSettings: {
    home: true,
    subscriptions: true,
    watchLater: true,
    playlists: false,
    search: false,
    channel: false,
    suggestions: true,
  },
  watchThreshold: 70,
};

export interface Message {
  type: "SETTINGS_UPDATED";
  settings: Settings;
}
