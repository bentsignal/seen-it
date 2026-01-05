# Seen It

A browser extension that allows you to hide YouTube videos you've already watched.

## Features

- Toggle to show/hide previously watched videos
- Adjustable watch percentage threshold (0-100%)
- Works on YouTube home, search, subscriptions, and channel pages

### Setup

```bash
# Install dependencies
bun install

# Generate icons (only needed once or after changing icon design)
bun run icons

# Start development server with hot reloading
bun run build
```

### Loading the Extension

#### Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder in this project

The extension will automatically reload when you make changes.
