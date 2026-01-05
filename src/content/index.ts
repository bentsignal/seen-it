import browser from 'webextension-polyfill';
import { Settings, DEFAULT_SETTINGS, Message } from '../types';

let currentSettings: Settings = DEFAULT_SETTINGS;

// Load initial settings
async function loadSettings() {
  const result = await browser.storage.local.get('settings');
  currentSettings = result.settings ?? DEFAULT_SETTINGS;
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
  // Try the newer class-based progress bar (home page, etc.)
  const newProgressBar = videoElement.querySelector('.ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment');
  if (newProgressBar instanceof HTMLElement) {
    const widthStyle = newProgressBar.style.width;
    if (widthStyle && widthStyle.endsWith('%')) {
      return parseFloat(widthStyle);
    }
  }

  // Try the older ID-based progress bar (playlists, watch later, etc.)
  const oldProgressBar = videoElement.querySelector('#progress');
  if (oldProgressBar instanceof HTMLElement) {
    const widthStyle = oldProgressBar.style.width;
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

  if (currentSettings.hideEnabled && progress !== null && progress >= currentSettings.watchThreshold) {
    videoElement.style.display = 'none';
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
