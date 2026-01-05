import { useEffect, useState } from 'react';
import { Settings, DEFAULT_SETTINGS } from './types';
import { getSettings, saveSettings } from './storage';

function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleToggle = async () => {
    const newSettings = { ...settings, hideEnabled: !settings.hideEnabled };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const handleThresholdChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSettings = { ...settings, watchThreshold: parseInt(e.target.value, 10) };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[200px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-900 min-h-[200px]">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Seen It
      </h1>

      <div className="space-y-4">
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            settings.hideEnabled
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {settings.hideEnabled ? 'Show Watched Videos' : 'Hide Watched Videos'}
        </button>

        {/* Threshold Slider */}
        <div className="space-y-2">
          <label className="block text-sm text-gray-700 dark:text-gray-300">
            Hide videos you have seen at least {settings.watchThreshold}% of
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
