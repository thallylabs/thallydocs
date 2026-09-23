# Run report

## Summary

The product change (PR #57, "chore: sync Thally runtime 8b7fcde8b460") introduces three new user-facing `docs.json` configuration features:

1. **`appearance.default`** and **`appearance.showToggle`** — control the reader's initial color mode and whether the theme toggle is visible.
2. **`background`** — a new top-level object that adds site-wide background images and decoration patterns.

These are new public configuration keys with documented types, defaults, and behavior that affect the author-facing `docs.json` schema. Documentation updates are required.

## Source evidence

- `src/data/docs.ts` (before vs after): The `DocsJsonConfig.appearance` object gained `default?: 'system' | 'light' | 'dark'` and `showToggle?: boolean`. A new `background?: { image?: string; imageDark?: string; decoration?: 'none' | 'grid' | 'gradient' }` object was added.
- `src/lib/site-appearance.ts` (new): Defines `SiteAppearance` and `SiteBackground` interfaces, resolution logic with defaults (`default: 'system'`, `showToggle: true`, `decoration: 'none'`), background image validation, and `lockedAppearanceScript()`.
- `src/components/theme/theme-switch.tsx`: Now reads `showToggle` from `useReaderTheme()` and returns `null` when `false`.
- `src/app/providers.tsx`: Now accepts an `appearance` prop with `default` and `showToggle`. When `showToggle` is `false`, uses `forcedTheme` and isolated storage key.
- `src/app/layout.tsx`: Now calls `getBuildSiteAppearance()` for appearance/background config; renders locked-appearance script and background CSS when applicable. Sets `data-site-background` and `data-site-background-image` data attributes on `<html>`.
- `src/styles/docs-handoff.css`: Added CSS rules for `[data-site-background='enabled']` pseudo-elements rendering images and decorations behind the document.

## Commits

- Before: 7f5355b0755e9830b1b54b61834b39574c7efac6
- After: 15baa2294ecfd9df6a8248a1b2063933547d5f7c

## Documentation edits

### 1. `src/content/guides/branding-and-theming.mdx`
- Replaced the "Dark mode" section (which stated dark mode is always toggleable via `next-themes`) with "Dark mode and appearance locking" documenting `appearance.default`, `appearance.showToggle`, and `appearance.contentIcons` configuration keys with types, defaults, and behavior.
- Added new "Background images and decoration" section documenting the `background` config object with `image`, `imageDark`, and `decoration` fields, including types, defaults, and rendering behavior.

### 2. `src/content/guides/docs-json-reference.mdx`
- Added `appearance` and `background` rows to the "Appearance and site chrome" table.
- Added two new sub-sections ("Appearance" and "Background") with configuration examples and field reference tables for all new keys.

### 3. `src/content/es/guides/branding-and-theming.mdx`
- Replaced the "Modo oscuro" section with "Modo oscuro y bloqueo de apariencia" matching the English page's new appearance locking documentation.
- Added new "Imágenes de fondo y decoración" section matching the English background documentation.

## Coverage review

After editing, searched all MDX files for `next-themes`, `showToggle`, `contentIcons`, `background.*image`, `decoration.*grid`, `theme switch`, and `toggle.*theme`. All occurrences are in the three edited files and are accurate. No stale claims remain.

The existing `docs.json` at the repository root already uses `"appearance": { "contentIcons": "accent" }` — this is consistent with the documented schema since `contentIcons` was an existing field and the new `default` and `showToggle` fields are optional.

## Deliberately left alone

- **Cloud-link appearance merging** (`src/lib/cloud-link/appearance.ts`): Internal implementation of how Thally Cloud overrides merge with repo config. The docs mention Cloud can override these settings per-field; the implementation details are internal.
- **`useReaderTheme` hook** (`src/components/theme/reader-theme.tsx`): Internal component API, not user-facing configuration.
- **`starter-release.json`**: Only the runtime commit SHA changed; no package version change. No version claims need updating.
- **Spanish locale pre-existing gaps**: The verification agent identified pre-existing parity issues in the Spanish branding page (stale logo guidance referencing direct component editing, stale font instructions referencing layout.tsx imports, incomplete color token table, stale analytics section). These all predate this product change and are outside the scope of this update.

## Untrusted-content check

Result: no instructions found
