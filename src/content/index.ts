import browser from 'webextension-polyfill';
import { Settings, DEFAULT_SETTINGS, Message } from '../types';

let currentSettings: Settings = DEFAULT_SETTINGS;

console.log('[Seen It] Content script loaded');

// Load initial settings
async function loadSettings() {
  const result = await browser.storage.local.get('settings');
  currentSettings = result.settings ?? DEFAULT_SETTINGS;
  console.log('[Seen It] Settings loaded:', currentSettings);
  processVideos();
}

// Listen for settings updates from background script
browser.runtime.onMessage.addListener((message: Message) => {
  if (message.type === 'SETTINGS_UPDATED') {
    currentSettings = message.settings;
    processVideos();
  }
});

// Get watch progress for a video from YouTube's progress bar overlay
function getWatchProgress(videoElement: Element): number | null {
  // Look for the progress bar within the video thumbnail
  const progressBar = videoElement.querySelector('#progress');
  if (progressBar instanceof HTMLElement) {
    const widthStyle = progressBar.style.width;
    if (widthStyle && widthStyle.endsWith('%')) {
      return parseFloat(widthStyle);
    }
  }
  return null;
}

// Process all video elements on the page
function processVideos() {
  // Find all video renderers (works for home, search, subscriptions, playlists, etc.)
  const videoSelectors = [
    'ytd-rich-item-renderer',
    'ytd-video-renderer',
    'ytd-grid-video-renderer',
    'ytd-compact-video-renderer',
    'ytd-playlist-video-renderer',
  ];

  for (const selector of videoSelectors) {
    const videos = document.querySelectorAll(selector);
    for (const video of videos) {
      processVideo(video as HTMLElement);
    }
  }
}

function processVideo(videoElement: HTMLElement) {
  const progress = getWatchProgress(videoElement);

  if (progress !== null) {
    console.log('[Seen It] Video progress:', progress, '%, threshold:', currentSettings.watchThreshold, '%');
  }

  if (currentSettings.hideEnabled && progress !== null && progress >= currentSettings.watchThreshold) {
    videoElement.style.display = 'none';
    console.log('[Seen It] Hiding video with', progress, '% progress');
  } else {
    videoElement.style.display = '';
  }
}

// Set up MutationObserver to handle dynamically loaded content
const observer = new MutationObserver((mutations) => {
  let shouldProcess = false;
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      shouldProcess = true;
      break;
    }
  }
  if (shouldProcess) {
    processVideos();
  }
});

// Start observing once DOM is ready
function init() {
  loadSettings();

  // Observe the main content area for changes
  const targetNode = document.body;
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
  });

  // Also listen for YouTube's navigation events (SPA navigation)
  window.addEventListener('yt-navigate-finish', () => {
    processVideos();
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
