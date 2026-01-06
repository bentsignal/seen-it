import { useEffect, useState } from "react";
import type { Settings, ViewSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";
import { getSettings, saveSettings } from "./storage";
import { Switch } from "./components/Switch";

// View labels for display in the UI
const VIEW_LABELS: Record<keyof ViewSettings, string> = {
  home: "Home",
  subscriptions: "Subscriptions",
  watchLater: "Watch Later",
  playlists: "Playlists",
  search: "Search Results",
  channel: "Channel Pages",
  suggestions: "Suggestions",
};

// Order of views in the UI
const VIEW_ORDER: (keyof ViewSettings)[] = [
  "home",
  "subscriptions",
  "watchLater",
  "playlists",
  "search",
  "channel",
  "suggestions",
];

function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleViewToggle = async (view: keyof ViewSettings) => {
    const newSettings: Settings = {
      ...settings,
      viewSettings: {
        ...settings.viewSettings,
        [view]: !settings.viewSettings[view],
      },
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleEnableAll = async () => {
    const newViewSettings: ViewSettings = {
      home: true,
      subscriptions: true,
      watchLater: true,
      playlists: true,
      search: true,
      channel: true,
      suggestions: true,
    };
    const newSettings: Settings = {
      ...settings,
      viewSettings: newViewSettings,
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleDisableAll = async () => {
    const newViewSettings: ViewSettings = {
      home: false,
      subscriptions: false,
      watchLater: false,
      playlists: false,
      search: false,
      channel: false,
      suggestions: false,
    };
    const newSettings: Settings = {
      ...settings,
      viewSettings: newViewSettings,
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleThresholdChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newSettings: Settings = {
      ...settings,
      watchThreshold: parseInt(e.target.value, 10),
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[380px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-900 min-h-[380px]">
      <div className="space-y-4">
        {/* Enable/Disable All Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleEnableAll}
            className="flex-1 py-1.5 px-3 text-sm rounded-md font-medium transition-colors bg-blue-500 hover:bg-blue-600 text-white"
          >
            Hide All
          </button>
          <button
            onClick={handleDisableAll}
            className="flex-1 py-1.5 px-3 text-sm rounded-md font-medium transition-colors bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          >
            Show All
          </button>
        </div>

        {/* View Toggles */}
        <div className="space-y-0.5">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Hide watched videos on:
          </p>
          {VIEW_ORDER.map((view) => (
            <Switch
              key={view}
              label={VIEW_LABELS[view]}
              checked={settings.viewSettings[view]}
              onChange={() => handleViewToggle(view)}
            />
          ))}
        </div>

        {/* Threshold Slider */}
        <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            Hide a video if you've watched at least {settings.watchThreshold}%
            of it
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.watchThreshold}
            onChange={handleThresholdChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
