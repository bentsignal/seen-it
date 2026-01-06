# AGENTS.md - Seen It Browser Extension

## Project Overview

Seen It is a Chrome/Firefox browser extension built with React 19, TypeScript, and Vite that hides YouTube videos based on watch progress threshold. The extension uses Manifest V3, Tailwind CSS v4, and webextension-polyfill for cross-browser compatibility.

## Build & Development Commands

```bash
# Install dependencies
bun install

# Development with hot reloading (HMR on port 5173)
bun dev                    # Chrome (default)
bun dev:chrome             # Chrome explicitly
bun dev:firefox            # Firefox

# Production builds (outputs to dist/)
bun run build              # Both Chrome and Firefox
bun run build:chrome       # Chrome only
bun run build:firefox      # Firefox only

# Linting (uses oxlint, NOT ESLint)
bun run lint               # Check for issues
bun run lint:fix           # Auto-fix issues

# Formatting (Prettier)
bun run format             # Format all src/ files
bun run format:check       # Check formatting without changes

# Other commands
bun run preview            # Preview built extension
```

**Testing:** No test framework is configured. If adding tests:

- Install Vitest: `bun add -D vitest`
- Use `.test.ts` / `.test.tsx` naming convention
- Run single test: `bun vitest run --testNamePattern="test name"`

## Code Style Guidelines

### TypeScript Conventions

- **Strict mode enabled** - all types must be explicit
- Use `interface` for object shapes (Settings, Message, ViewSettings)
- Use `type` for unions only (e.g., `type YouTubeView = "home" | "subscriptions"`)
- Explicit return types on exported async functions
- Use `type` imports: `import type { Settings } from './types'`
- Cast unknown values with type guards: `(result.settings as Settings | undefined) ?? DEFAULT_SETTINGS`

```typescript
// Types go in src/types.ts
export interface Settings {
  viewSettings: ViewSettings;
  watchThreshold: number;
}

// Explicit return types on async functions
export async function getSettings(): Promise<Settings> {
  const result = await browser.storage.local.get("settings");
  return (result.settings as Settings | undefined) ?? DEFAULT_SETTINGS;
}
```

### Import Organization

Group imports in this order (no blank lines between groups in this codebase):

1. React and external packages
2. webextension-polyfill
3. Type imports (using `import type`)
4. Value imports from local modules

```typescript
import { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import type { Settings, ViewSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";
import { getSettings, saveSettings } from "./storage";
```

### Naming Conventions

- **Files:** PascalCase for components (`App.tsx`, `Switch.tsx`), lowercase for modules (`storage.ts`, `types.ts`)
- **Variables/functions:** camelCase (`handleToggle`, `currentSettings`, `processVideos`)
- **Constants:** UPPER_SNAKE_CASE (`DEFAULT_SETTINGS`, `VIEW_LABELS`, `VIEW_ORDER`)
- **Interfaces/Types:** PascalCase (`Settings`, `Message`, `YouTubeView`)
- **React handlers:** Prefix with `handle` (`handleViewToggle`, `handleThresholdChange`)

### React Patterns

- Functional components with hooks only
- Default exports for page components (`App.tsx`), named exports for reusable components
- Use `React.StrictMode` wrapper in `main.tsx`
- Define prop interfaces inline above component when simple

```typescript
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) { ... }
```

### Error Handling

- Empty `.catch()` only for non-critical errors - always add explanatory comment
- Content scripts: silently handle DOM manipulation errors
- Use optional chaining for potentially undefined values

```typescript
browser.tabs.sendMessage(tab.id, message).catch(() => {
  // Tab might not have content script loaded yet
});
```

### Formatting (Prettier)

- **Double quotes** for strings (not single quotes)
- Trailing commas in multi-line structures
- 2-space indentation
- No semicolon enforcement (Prettier default)

### Browser Extension Architecture

- **Content script** (`src/content/index.ts`): Injected into YouTube pages, handles DOM manipulation
- **Background script** (`src/background/index.ts`): Service worker for storage init and cross-tab messaging
- **Popup** (`src/App.tsx`): React UI for user settings
- Use `webextension-polyfill` for all browser APIs (never raw `chrome.*`)
- Message passing: `browser.runtime.onMessage` / `browser.tabs.sendMessage`
- Storage: `browser.storage.local` for persistence

## Project Structure

```
src/
  main.tsx              # React entry point
  App.tsx               # Popup UI (default export)
  index.css             # Tailwind imports + popup sizing
  types.ts              # Shared TypeScript interfaces/types
  storage.ts            # Storage helper functions
  components/
    Switch.tsx          # Reusable toggle component (named export)
  content/
    index.ts            # Content script (YouTube DOM manipulation)
  background/
    index.ts            # Service worker (MV3)
public/
  icons/                # Extension icons (PNG)
vite.config.base.ts     # Shared Vite configuration
vite.config.chrome.ts   # Chrome-specific build config
vite.config.firefox.ts  # Firefox-specific build config
manifest.json           # Base extension manifest
dist/                   # Build output (gitignored)
```

## Key Implementation Details

### YouTube View Detection (`src/content/index.ts`)

The content script detects YouTube views by URL pattern:

- `/` or empty → home
- `/feed/subscriptions` → subscriptions
- `/playlist?list=WL` → watchLater
- `/playlist` → playlists
- `/results` → search
- `/@*`, `/channel/*`, `/c/*`, `/user/*` → channel
- `/watch` → suggestions (sidebar)

### Video Element Selectors

Multiple selectors for different YouTube layouts:

- `ytd-rich-item-renderer` - Home, subscriptions grid
- `ytd-video-renderer` - Search, channel videos
- `ytd-playlist-video-renderer` - Playlists
- `yt-lockup-view-model` - New suggestions/home

### Progress Bar Detection

Two methods for reading watch progress:

1. `.ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment` (newer)
2. `#progress` (older playlists/watch later)
