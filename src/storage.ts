import browser from 'webextension-polyfill';
import { Settings, DEFAULT_SETTINGS } from './types';

export async function getSettings(): Promise<Settings> {
  const result = await browser.storage.local.get('settings');
  return result.settings ?? DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await browser.storage.local.set({ settings });
}
