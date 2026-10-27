# Run report

**Trigger:** PR #350 "fix: migration parity fixes for Dub, Turso, ScrapeGraphAI, Firecrawl, Lightdash and Infisical"
**Before:** 22af65e937ec883a4dfd6cadf6dfa280e9fb825f
**After:** eb94ed84eb259edec00be75871b9cb97498c6d37

## Status: documentation changes needed

Three source documentation pages changed between the before and after commits, introducing user-visible feature additions that made previous documentation incomplete or inaccurate.

## What changed and why

### 1. ParamField anchor IDs and updated props (new feature)

**Source evidence:** `src/components/mdx/api-fields.tsx` adds an `id` prop to `ParamFieldProps` (set automatically by the heading pass). `src/lib/field-anchor.ts` (new file) generates `param-<kebab-name>` anchors for every `ParamField` and `ResponseField`. `src/components/mdx/expandable-hash.test.tsx` (new file) confirms that linking to a field inside a collapsed `Expandable` opens it. The authoritative source docs page `src/content/components/param-field.mdx` updated its examples to the preferred `body="name"` form (string, not boolean), added `deprecated` and `placeholder` to the props table, and added a "Linking to a field" section.

**Docs edits:**
- `src/content/components/param-field.mdx`: Updated intro, examples, and props table to preferred string form. Added `deprecated`, `placeholder` props. Added "Linking to a field" section.
- `src/content/es/components/param-field.mdx`: Matching Spanish translation.

### 2. Step `id` prop (new feature)

**Source evidence:** `src/components/mdx/steps.tsx` now accepts `id` on `<Step>`. The authoritative source docs page `src/content/components/steps.mdx` added it to the props table.

**Docs edits:**
- `src/content/components/steps.mdx`: Added `id` prop row.
- `src/content/es/components/steps.mdx`: Matching Spanish translation.

### 3. `thally check` new diagnostics (new feature)

**Source evidence:** `packages/create-thally-docs/src/check.ts` adds two new check categories not present in source-before:
- MDX syntax error check (~L309-316): parses every page and snippet with the renderer's parser; emits `severity: 'error'` with `MDX syntax error: <reason>`.
- Broken redirect check (~L976-987): validates that link-only page redirects resolve; emits `severity: 'error'` with `Broken redirect: ...` for loops and missing targets.

The authoritative source docs page `src/content/guides/cli-reference.mdx` added these two rows to the "What it checks" table, changed "Page reused" from Error to Warning (matching the source's `severity: 'warning'` at ~L853), added explanatory paragraphs, and added `--ci`, `--drift`, `--external` to the check options table.

**Docs edits:**
- `src/content/guides/cli-reference.mdx`: Added two new check rows, corrected duplicate-page severity to Warning, added explanatory paragraphs about link-only pages and MDX check scope, added `--ci`/`--drift`/`--external` flags to options table.
- `src/content/guides/ci-checks.mdx`: Added MDX syntax and redirect checks to the "What it checks" bullet list.
- `src/content/es/guides/cli-reference.mdx`: Matching Spanish translation.

### Adjacent correction

The docs repo previously listed "Duplicate page ID in `docs.json`" as Error severity. The source code (both before and after) emits this as `severity: 'warning'`. Since this row is in the same table being edited for the new check rows, correcting it to Warning prevents the updated table from being internally inconsistent.

The `--ci`, `--drift`, and `--external` flags existed before this change but were missing from the docs check options table. Since the new MDX syntax error check and the new explanatory paragraph both reference `--ci` behavior, adding these flags prevents the updated passage from being incomplete.

## What was deliberately left alone

- **French translations** (`fr/components/param-field.mdx`, `fr/components/steps.mdx`, `fr/guides/cli-reference.mdx`, `fr/guides/ci-checks.mdx`): These carry `thally:ai-translation` markers and will auto-refresh from the updated English source. The old `body name=` syntax and "ID de page dupliqué" as "Erreur" remain in the French CLI reference but will be corrected by the next auto-refresh.
- **Spanish CI checks** (`es/guides/ci-checks.mdx`): Carries a `thally:ai-translation` marker; will auto-refresh.
- **`response-field.mdx`** and **`expandable.mdx`**: The "Linking to a field" feature is documented on the param-field page (which covers both components). These pages were not changed by the source, and no false claim exists in them.
- **Migration-related changes** (redirect handling, snippet indentation, asset budgets, etc.): These are internal migrator improvements. The existing docs describe the migrate command at a level that remains accurate. The source docs page for CLI reference was not changed in ways that make the destination's migration section false.
- **Version bumps** (core 0.2.18, migrate 0.2.44, create-thally-docs 0.10.122, mcp 0.10.124, cli 0.8.125): No version numbers are cited in the destination documentation.
- **Runtime rendering fixes** (Step without title, remote MDX improvements, API panel allOf handling, etc.): These are bug fixes with no docs-facing contract change.

## Stale claim sweep

After edits, searched the entire `src/content` tree:
- `body name=` / `query name=` / `path name=` / `header name=`: Found only in `fr/components/param-field.mdx` (auto-translated, will refresh).
- `Duplicate page ID`: Zero matches anywhere.
- `body` typed as `boolean` in param-field docs: Found only in `fr/components/param-field.mdx` (auto-translated, will refresh).

## Navigation check

All edited pages appear in docs.json navigation. No new pages were created, so no docs.json changes were needed. No orphan pages found on disk.

## Review receipts

- `output/briefs/review-components-param-field.md` — passed
- `output/briefs/review-components-steps.md` — passed
- `output/briefs/review-guides-cli-reference.md` — passed
- `output/briefs/review-guides-ci-checks.md` — passed
- `output/briefs/review-es-components-param-field.md` — passed
- `output/briefs/review-es-components-steps.md` — passed
- `output/briefs/review-es-guides-cli-reference.md` — passed

## Untrusted-content check

Result: no instructions found
