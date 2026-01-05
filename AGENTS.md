# AGENTS.md - Seen It Browser Extension

## Project Overview

Seen It is a Chrome/Firefox browser extension built with React 19, TypeScript, and Vite that hides YouTube videos based on watch progress threshold. The extension uses Manifest V3, Tailwind CSS v4, and webextension-polyfill for cross-browser compatibility.

## Build & Development Commands

```bash
# Install dependencies
bun install

# Start development server with hot reloading (HMR on port 5173)
bun dev

# Build production extension for Chrome (outputs to dist/)
bun run build

# Build production extension for Firefox
bun run build:firefox

# Preview built extension
bun run preview

# Run linting (ESLint)
bun run lint

# Generate extension icons from SVG to PNG
bun run icons
```

**Note:** This project has no test framework configured. If adding tests, prefer Vitest (aligned with Vite) and use `.test.ts` / `.test.tsx` file naming.

## Code Style Guidelines

### TypeScript Conventions

- Enable `strict: true` in TypeScript config - all types must be explicit
- Use `interface` for object shapes (e.g., `Settings`, `Message` interfaces)
- Use `type` for unions, intersections, or primitives only
- Enable `noUnusedLocals: true` and `noUnusedParameters: true`
- Export interfaces and constants separately for better tree-shaking
- Use explicit return types on exported async functions

```typescript
// Good
export interface Settings {
  hideEnabled: boolean;
  watchThreshold: number;
}

export async function getSettings(): Promise<Settings> {
  const result = await browser.storage.local.get('settings');
  return result.settings ?? DEFAULT_SETTINGS;
}
```

### React Patterns

- Use functional components with hooks (`useState`, `useEffect`, etc.)
- Name components with PascalCase: `function App() {}`
- Use explicit types for props if component is reusable
- Default exports for page-level components, named exports for utilities
- Use React.StrictMode in development (wrap root in StrictMode)

### Import Organization

Organize imports in this order with blank lines between groups:

1. External packages (React, libraries)
2. webextension-polyfill
3. Internal relative imports (types, storage, components)

```typescript
import { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';
import { Settings, DEFAULT_SETTINGS } from './types';
import { getSettings, saveSettings } from './storage';
```

### Naming Conventions

- **Files:** kebab-case for utilities (`generate-icons.ts`), PascalCase for components (`App.tsx`)
- **Variables/functions:** camelCase (`handleToggle`, `currentSettings`)
- **Constants:** UPPER_SNAKE_CASE for config constants, camelCase for values
- **Interfaces/Types:** PascalCase (`Settings`, `Message`)
- **Boolean props/variables:** Prefix with `is`, `has`, `can`, or similar (`hideEnabled`)

### Error Handling

- Use `.catch()` with empty callback only for non-critical errors
- Always add a comment explaining why the error can be safely ignored
- For critical errors, log to console with context or throw
- In content scripts, silently handle errors that occur during YouTube DOM manipulation

```typescript
// Good - non-critical error with explanation
browser.tabs.sendMessage(tab.id, message).catch(() => {
  // Tab might not have content script loaded yet
});
```

### Formatting & Style

- Use single quotes for strings (`'react'`, `'./types'`)
- Add blank line after import groups
- Use trailing commas in multi-line objects/arrays
- Add inline comments to explain non-obvious logic (DOM selectors, YouTube-specific code)
- Use descriptive variable names that indicate purpose

### Browser Extension Specifics

- Use `webextension-polyfill` for all browser API calls (not `chrome.*` directly)
- Keep content scripts minimal - they inject into YouTube pages
- Background service worker handles storage initialization and cross-tab communication
- Use `browser.runtime.onMessage` for content/background communication
- Use `browser.storage.local` for settings persistence

## Project Structure

```
src/
  main.tsx          # React app entry point
  App.tsx           # Popup UI component
  index.css         # Tailwind imports + popup sizing
  types.ts          # TypeScript interfaces
  storage.ts        # Storage utilities
  content/          # Content script (injected into YouTube)
  background/       # Service worker (MV3)
scripts/
  generate-icons.ts # Icon generation script
dist/               # Build output
public/icons/       # Extension icons (PNG)
```

## Testing Guidance

If adding tests:
- Use Vitest (integrates with Vite): `bun add -D vitest`
- Place tests alongside source files: `src/components/App.test.tsx`
- Mock `webextension-polyfill` in tests
- Test content script logic by mocking YouTube DOM structure
- Run single test: `bun vitest run --testNamePattern="test name"`
