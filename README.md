# Seen It

A browser extension that allows you to hide YouTube videos you've already watched.

## Features

- Toggle to show/hide previously watched videos
- Adjustable watch percentage threshold (0-100%)
- Works on YouTube home, search, subscriptions, and channel pages

### Setup

```bash
bun install

# only needed once or after changing icon design
bun run icons

bun run build
```

### Loading the Extension

#### Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder in this project

#### Firefox

1. Open `about:debugging`
2. Go to "This Firefox"
3. Click "Load temporary addon"
4. Select the `manifest.json` file inside `dist/firefox`
