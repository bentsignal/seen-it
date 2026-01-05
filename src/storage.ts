import browser from "webextension-polyfill";
import type { Settings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

export async function getSettings(): Promise<Settings> {
  const result = await browser.storage.local.get("settings");
  return (result.settings as Settings | undefined) ?? DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await browser.storage.local.set({ settings });
}
