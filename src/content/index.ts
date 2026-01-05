import browser from 'webextension-polyfill';
import type { Settings, Message, YouTubeView } from '../types';
import { DEFAULT_SETTINGS } from '../types';

let currentSettings: Settings = DEFAULT_SETTINGS;
let currentView: YouTubeView | null = null;

// Detect the current YouTube view based on URL
function getCurrentView(): YouTubeView | null {
  const url = new URL(window.location.href);
  const pathname = url.pathname;
  const searchParams = url.searchParams;

  // Watch page (suggestions sidebar)
  if (pathname === '/watch') {
    return 'suggestions';
  }

  // Home page
  if (pathname === '/' || pathname === '') {
    return 'home';
  }

  // Subscriptions
  if (pathname === '/feed/subscriptions') {
    return 'subscriptions';
  }

  // Playlists
  if (pathname === '/playlist') {
    const listId = searchParams.get('list');
    if (listId === 'WL') {
      return 'watchLater';
    }
    return 'playlists';
  }

  // Search results
  if (pathname === '/results') {
    return 'search';
  }

  // Channel pages (multiple URL patterns)
  if (
    pathname.startsWith('/@') ||
    pathname.startsWith('/channel/') ||
    pathname.startsWith('/c/') ||
    pathname.startsWith('/user/')
  ) {
    return 'channel';
  }

  // Unknown view - don't hide anything
  return null;
}

// Load initial settings
async function loadSettings() {
  const result = await browser.storage.local.get('settings');
  currentSettings = (result.settings as Settings | undefined) ?? DEFAULT_SETTINGS;
  processVideos();
}

// Listen for settings updates from background script
browser.runtime.onMessage.addListener((message: unknown) => {
  const msg = message as Message;
  if (msg.type === 'SETTINGS_UPDATED') {
    currentSettings = msg.settings;
    processVideos();
  }
});

// Get watch progress for a video from YouTube's progress bar overlay
function getWatchProgress(videoElement: Element): number | null {
  // Try the newer class-based progress bar (home page, suggestions, etc.)
  const newProgressBar = videoElement.querySelector(
    '.ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment'
  );
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
    'ytd-rich-item-renderer', // Home, subscriptions (grid)
    'ytd-video-renderer', // Search, channel videos
    'ytd-grid-video-renderer', // Channel grid
    'ytd-compact-video-renderer', // Old sidebar recommendations
    'ytd-playlist-video-renderer', // Playlists, Watch Later
    'yt-lockup-view-model', // New suggestions sidebar, home page
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

  // Only hide if: view is known, view hiding is enabled, and threshold is met
  const shouldHide =
    currentView !== null &&
    currentSettings.viewSettings[currentView] &&
    progress !== null &&
    progress >= currentSettings.watchThreshold;

  videoElement.style.display = shouldHide ? 'none' : '';
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
  // Detect current view
  currentView = getCurrentView();

  // Load settings
  loadSettings();

  // Observe the main content area for changes
  const targetNode = document.body;
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
  });

  // Also listen for YouTube's navigation events (SPA navigation)
  window.addEventListener('yt-navigate-finish', () => {
    currentView = getCurrentView();
    processVideos();
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
