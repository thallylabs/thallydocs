# Run report

## Summary

PR #199 "feat(migrate): add Fern adapter and fix Mintlify/Docusaurus migration bugs" (commits 4d512d46 to 4715564f) adds a Fern adapter to `thally migrate` and fixes crash and data-loss bugs in Mintlify and Docusaurus migrations. The user-visible public contract changes that require documentation updates are:

1. **New `--platform fern` value**: The `--platform` CLI flag and MCP `platform` parameter now accept `fern` in addition to `mintlify`, `docusaurus`, and `auto`.
2. **New Fern platform auto-detection**: Repositories containing both `docs.yml` and `fern.config.json` in the same directory are auto-detected as Fern. Detection order is mintlify, fern, thally, docusaurus, and so on.
3. **New Fern component mappings**: Fern-specific components (`CodeBlocks`, `Cards`, `ParameterField`, `Callout intent`, `Success`, `Launch`, `Files`) are mapped to Thally equivalents.
4. **Interactive prompt update**: The platform selection prompt now lists Fern as a choice between Docusaurus and auto-detection.
5. **Non-interactive fallback**: Running in a non-interactive shell falls back to auto-detection with a warning instead of hanging.

The Mintlify and Docusaurus bug fixes (project root detection, component handling, escaping, cloning retries, symlink following, and others) are internal improvements that do not change the documented public contract for those adapters. No documentation edits are needed for them.

## Source evidence examined

- `packages/migrate/src/types.ts`: `MigrationPlatform` union now includes `'fern'`
- `packages/create-thally-docs/src/prompts.ts` line 22: `parseMigrationPlatform` accepts `'fern'`; error message says `--platform must be mintlify, docusaurus, fern, or auto.`; interactive choices at lines 53-60 include `{ name: 'Fern', value: 'fern' }`; non-TTY fallback at lines 38-50
- `packages/migrate/src/repository.ts` lines 300-305: `hasFernConfig` requires both `docs.yml` and `fern.config.json` in the same directory
- `packages/migrate/src/repository.ts` lines 668-691: detection order is mintlify, fern, thally, docusaurus, and so on
- `packages/migrate/src/fern.ts`: 670-line new file implementing the Fern adapter, reading `docs.yml` for tabs, sections, pages, navbar links, redirects; multi-product sites as separate tabs; `api:` sections resolved from `generators.yml` by `api-name`; only pages referenced from `docs.yml` are imported
- `packages/migrate/src/mdx.ts` lines 1242-1258: Fern tag renames (`CodeBlocks` to `CodeGroup`, `ParameterField` to `ParamField`, `Cards` to `CardGroup`, `Success` to `Tip`, `Launch` to `Note`, `Files` stripped)
- `packages/migrate/src/mdx.ts` lines 806-825: Fern `Callout intent` normalization (`warning` to `Warning`, `success`/`tip` to `Tip`, `error`/`danger` to `Error`, others to `Note`)
- `src/content/guides/cli-reference.mdx` (source repo): Updated `--platform` description to include `fern` and added Fern example

## Destination pages edited

### English

#### `src/content/guides/migrating.mdx`
- Line 61: Interactive prompt platform list now includes Fern
- Lines 110-114: New "Fern migrations" section describing the adapter behavior, including `docs.yml` parsing, multi-product imports, `generators.yml` API resolution, page-only import scope, and AsyncAPI/OpenRPC/Fern Definition warnings
- Line 208: `--platform` option description updated to include `fern`
- Line 220: Detection table now includes Fern row (`docs.yml` and `fern.config.json` in the same directory)

#### `src/content/guides/cli-reference.mdx`
- Line 139: "Dedicated adapters" text updated from "Mintlify and Docusaurus" to "Mintlify, Docusaurus, and Fern"
- Lines 160-161: New Fern migration example added
- Line 180: Navigation detection text updated to include Fern configuration (`docs.yml`)
- Line 193: `--platform` option description updated to include `fern`
- Lines 222-231: Component mapping table extended with 10 Fern component entries

#### `src/content/guides/getting-started.mdx`
- Line 80: Interactive flow platform list updated to include Fern

#### `src/content/guides/mcp-server.mdx`
- Line 179: MCP `platform` parameter updated to include `fern`

### Spanish

#### `src/content/es/guides/migrating.mdx`
- Line 3: Description frontmatter updated to include Fern
- Line 24: Interactive prompt platform list and `--platform` values updated
- Line 41: Detection table includes Fern row
- Lines 108-116: New "Fern" section with adapter description
- Line 165: `--platform` option updated

#### `src/content/es/guides/cli-reference.mdx`
- Line 54: Supported platforms list updated to include Fern
- Line 86: Navigation detection text updated
- Line 98: `--platform` option updated
- Line 109: Component mapping introduction updated
- Lines 127-136: Component mapping table extended with 10 Fern entries

#### `src/content/es/guides/mcp-server.mdx`
- Line 169: MCP `platform` parameter updated

#### `src/content/es/introduction.mdx`
- Line 40: Migration feature list updated to include Fern; em dash replaced with a colon to satisfy the prose punctuation rule on the edited line

## Coverage verification

Searched the destination content tree for all old claims after editing:

- `mintlify, docusaurus, or auto` (without fern) in `--platform` descriptions: 0 remaining occurrences
- `mintlify or docusaurus` (without fern) in MCP platform descriptions: 0 remaining occurrences
- `Dedicated adapters: Mintlify and Docusaurus` (without Fern): 0 remaining occurrences
- Every occurrence listing migration adapters or `--platform` values now includes Fern

All 10 places where the old two-adapter claim appeared were updated. No remaining stale claim was found.

## Deliberately left alone

- **Mintlify/Docusaurus bug fixes** (project root detection, component handling, escaping, cloning retries, symlink following, and others): These are internal behavior improvements that do not change the documented public contract. The existing adapter descriptions remain accurate.
- **Pre-existing divergences in the Spanish detection table** (different config filenames for Docusaurus, GitBook, VitePress, Starlight vs the English table): Pre-date this PR and are outside the scope of this change.
- **Pre-existing em dashes** used as prose punctuation in Spanish files: Pre-date this PR.
- **`src/content/introduction.mdx`**: Does not list migration platforms and is not affected by this change.
- **`src/content/guides/cli-overview.mdx`**: References migration at a high level ("Imports a repository or public docs site") without naming specific platforms. Not affected.
- **`src/content/guides/thally-cloud.mdx`**, **`src/content/guides/redirects.mdx`**, **`src/content/guides/environment-variables.mdx`**, **`src/content/quickstart.mdx`**: Mention migration in passing without listing supported platform adapters. Not affected.
- **`docs.json` navigation**: No new pages were created, so no navigation changes are needed.

## Verification

The repository-investigator subagent verified all 8 edited files against the source evidence. Every Fern-related claim (platform lists, detection table entries, component mappings, adapter behavior descriptions) was confirmed accurate. Navigation completeness was checked: all page IDs in `docs.json` resolve to `.mdx` files on disk, and no orphan English content files exist. No stale two-platform-only strings remain in any `.mdx` file.

## Untrusted-content check

Result: no instructions found
