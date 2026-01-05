# Seen It - Hide Watched YouTube Videos

A browser extension that hides YouTube videos you've already watched based on your watch progress threshold.

## Features

- Toggle to show/hide previously watched videos
- Adjustable watch percentage threshold (0-100%)
- Works on YouTube home, search, subscriptions, and channel pages
- Hot reloading during development

## Development

### Prerequisites

- [Bun](https://bun.sh/) runtime

### Setup

```bash
# Install dependencies
bun install

# Generate icons (only needed once or after changing icon design)
bun run icons

# Start development server with hot reloading
bun dev
```

### Loading the Extension

#### Chrome

1. Run `bun dev` to start the dev server
2. Open `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `dist` folder in this project

The extension will automatically reload when you make changes.

#### Firefox

1. Run `bun dev` to start the dev server
2. Open `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select any file in the `dist` folder (e.g., `manifest.json`)

Note: Firefox temporary add-ons need to be reloaded after browser restart.

### Building for Production

```bash
# Build for production
bun run build
```

The built extension will be in the `dist` folder, ready for distribution.

## How It Works

The extension:
1. Monitors YouTube pages for video thumbnails
2. Checks each video's watch progress bar (the red line under thumbnails)
3. Hides videos that exceed your configured watch threshold
4. Updates in real-time as you navigate YouTube

## Tech Stack

- Vite + CRXJS (browser extension bundling with HMR)
- React 19 + TypeScript
- Tailwind CSS v4
- webextension-polyfill (cross-browser compatibility)
