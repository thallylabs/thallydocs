# Run report

## Summary

PR #219 "fix: preserve content across docs migrations" (commits 4ca040836df95a1c766145ebc470c1bee7554d8e to 7f16574beefb0fdd91bc5bdaa322d3e7dc527c61) improves migration content fidelity and heading anchor behavior across five packages. No documentation changes are required because the product changes do not make any existing documentation claim inaccurate.

## Source evidence examined

### Package version bumps

| Package | Before | After |
|---------|--------|-------|
| `@thallylabs/cli` | 0.8.61 | 0.8.62 |
| `@thallylabs/core` | 0.2.8 | 0.2.9 |
| `create-thally-docs` | 0.10.58 | 0.10.59 |
| `@thallylabs/mcp` | 0.10.60 | 0.10.61 |
| `@thallylabs/migrate` | 0.2.9 | 0.2.10 |

No version numbers for any of these packages appear in the destination documentation, so no version edits are needed.

### Unicode heading anchors (packages/core/src/slugify.ts)

- **Before:** `value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')`
- **After:** `value.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/(^-|-$)/g, '')`
- The heading ID algorithm now preserves Unicode letters and marks instead of stripping them to hyphens. For example, a heading with non-ASCII characters now retains them in the anchor ID.
- **Documentation impact:** The destination docs do not describe the heading ID algorithm. The "Heading anchor links" section in guides/writing-content.mdx (lines 197-201) says "Every h2 and h3 heading is a permalink" and describes the click-to-copy behavior. Neither claim is affected by the Unicode change. No update needed.

### Heading permalink with nested links (src/components/mdx/heading-anchor.tsx)

- **Before:** Every heading was wrapped in a single anchor permalink element.
- **After:** When a heading already contains a link element, the component renders the heading text in a span with a separate screen-reader-only permalink, avoiding invalid nested anchor elements.
- **Documentation impact:** guides/writing-content.mdx (line 199) says "Selecting the heading copies the section URL." This is still accurate for the vast majority of headings. For the narrow edge case of headings containing links, the click-to-copy behavior moves to a screen-reader-only element. The overall claim that every h2 and h3 heading is a permalink remains true since the permalink anchor is always present. No update needed for this edge case.

### thally check heading anchor matching (packages/create-thally-docs/src/check.ts)

- **Before:** `const base = slugify(heading[1])` (line 169) fed raw heading Markdown (including JSX tags) into the slug function.
- **After:** `const base = slugify(renderedHeadingText(heading[1]))` (line 193) now strips HTML/JSX tags to their visible text before slugifying, matching the runtime's actual heading ID generation.
- This is a bug fix: headings containing JSX previously generated incorrect IDs in the check, potentially causing false broken-anchor warnings.
- **Documentation impact:** The "What it checks" descriptions in guides/ci-checks.mdx and guides/cli-reference.mdx describe the check as verifying that "every #heading anchor exists." This description is still accurate; the fix improves accuracy of the anchor matching without changing what is checked. No update needed.

### Remote OpenAPI spec hydration (packages/migrate/src/remote-api.ts, new file)

- **Before:** Mintlify repository migrations that referenced remote OpenAPI specs (HTTPS URLs) emitted a warning: "The remote OpenAPI spec ... was not downloaded. Download it manually..." (source-before repository.ts, line 1041).
- **After:** The new hydrateRemoteApiSpecs function downloads remote specs with SSRF-safe DNS pinning, validates them as OpenAPI 3.x, attaches them as public assets, and wires them into API tabs. Source-link redirects from Mintlify tag/summary routes are also generated when operations can be uniquely identified.
- The CLI discoverMigration function now calls hydrateRemoteApiSpecs after repository migration (source-after create-thally-docs/src/migrate/index.ts, line 116).
- **Documentation impact:** guides/migrating.mdx (line 108) says Mintlify migrations read "OpenAPI references." guides/cli-reference.mdx (line 179) says "OpenAPI spec files (.json, .yaml) are detected and wired up." The first claim is vague enough to cover remote references. The second refers to local files, which is still true. The new remote downloading capability is additive. Neither claim is made false by this change. No update needed.

### Migration type additions (packages/migrate/src/types.ts)

- MigrationNavbarConfig.logo now accepts null for text-only branding when the source has no logo.
- MigrationDocsConfig gained appearance and background optional fields.
- MigrationBundle gained remoteApiSpecs field.
- These are internal migration bundle types consumed by the engine and the CLI. They are not documented docs.json configuration fields. No update needed.

### Fern external navigation links (packages/migrate/src/fern.ts)

- **Before:** Fern link navigation nodes emitted a warning and were dropped.
- **After:** External links are collected in context.externalLinks and appended to navbar links when valid (HTTPS, no credentials).
- **Documentation impact:** No destination documentation mentions Fern migration. The --platform flag documentation already omits fern as a valid value (this was a pre-existing omission: the source-before already accepted fern at line 22 of prompts.ts). This improvement does not make any existing claim false. No update needed.

### Docusaurus migration improvements (packages/migrate/src/docusaurus.ts)

- Category card preservation, sidebar order, translated headings, and asset handling improvements.
- **Documentation impact:** The Docusaurus migration section in guides/migrating.mdx (lines 112-117) lists what is preserved. The new capabilities are additive improvements. No existing claim is contradicted. No update needed.

## Destination pages edited

None. The documentation working tree was left untouched.

## Pre-existing documentation omissions observed (not in scope)

These inaccuracies pre-date this PR and are not caused by the compared source change:

1. **--platform fern missing from docs**: Both guides/migrating.mdx (line 202) and guides/cli-reference.mdx (line 190) list --platform as accepting mintlify, docusaurus, or auto. The CLI source accepted fern before this PR (source-before prompts.ts line 22). The CLI help text in source-before also said "Use mintlify, docusaurus, fern, or auto" (source-before index.ts line 98).

2. **Fern missing from detection table**: guides/migrating.mdx (lines 211-221) lists platform detection files but omits fern/docs.yml. The detectRepositoryPlatform function in source-before already detected Fern (source-before repository.ts line 738).

3. **"Dedicated adapters: Mintlify and Docusaurus"**: guides/cli-reference.mdx (lines 139-140) omits Fern as a dedicated adapter. Fern was a dedicated adapter before this PR.

4. **Incomplete check table in cli-reference.mdx**: The "What it checks" table (lines 240-248) lists only seven issue types. The actual check command (both before and after) also validates broken internal links (error), broken anchors (warning), missing images (warning), and OpenAPI spec structure. The ci-checks.mdx page correctly describes link/anchor and OpenAPI checking, but the cli-reference table is incomplete. This pre-dates the PR.

5. **Duplicate page ID severity**: cli-reference.mdx line 243 lists "Duplicate page ID in docs.json" as "Error" but the source code (both before and after) emits it as "Warning" (severity: 'warning', check.ts line 376).

## Decision

No documentation edits. The product changes are internal migration quality improvements, bug fixes, and a Unicode-aware heading slugify enhancement. No existing public-facing documentation claim is made inaccurate by these changes.

## Untrusted-content check

Result: no instructions found
