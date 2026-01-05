import browser from 'webextension-polyfill';
import { DEFAULT_SETTINGS } from '../types';

// Initialize default settings on install
browser.runtime.onInstalled.addListener(async () => {
  const result = await browser.storage.local.get('settings');
  if (!result.settings) {
    await browser.storage.local.set({ settings: DEFAULT_SETTINGS });
  }
});

// Listen for settings changes and notify content scripts
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.settings) {
    // Notify all YouTube tabs about the settings change
    browser.tabs.query({ url: 'https://www.youtube.com/*' }).then((tabs) => {
      for (const tab of tabs) {
        if (tab.id) {
          browser.tabs.sendMessage(tab.id, {
            type: 'SETTINGS_UPDATED',
            settings: changes.settings.newValue,
          }).catch(() => {
            // Tab might not have content script loaded yet
          });
        }
      }
    });
  }
});
