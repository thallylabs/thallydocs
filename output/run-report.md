# Run report

## Trigger

PR #215 "release: promote scaffold release 2026-09-28.9729212c.c28e9504" in `thallylabs/thally`, comparing commits `c28e9504` (before) and `2b062165` (after).

## Source evidence examined

All six changed files were investigated:

| File | Change |
|---|---|
| `packages/cli/package.json` | Version 0.8.58 → 0.8.59; internal dep bumps only |
| `packages/create-thally-docs/package.json` | Version 0.10.55 → 0.10.56; no dependency changes |
| `packages/mcp/package.json` | Version 0.10.57 → 0.10.58; internal dep bump only |
| `packages/create-thally-docs/src/stable-scaffold-release.json` | Stable scaffold release ID rotated from `2026-09-28.974e64cc.4715564f` to `2026-09-28.9729212c.c28e9504` |
| `packages/create-thally-docs/src/previous-scaffold-releases.json` | Former stable release appended to the history array (42 → 43 entries) |
| `package-lock.json` | Lockfile regeneration reflecting the above |

No changes to public API exports, CLI commands or flags, configuration keys or defaults, error messages, behavior, or external dependency versions were found. All three packages have identical export maps and bin entries before and after.

## Documentation impact

**No documentation change is required.**

The documentation was searched for:
- The old and new version numbers of all three packages (0.8.58, 0.8.59, 0.10.55, 0.10.56, 0.10.57, 0.10.58): no matches in any content file.
- The old and new scaffold release IDs (`974e64cc`, `4715564f`, `9729212c`, `c28e9504`): no matches.
- Any semver-style version strings in `.mdx` content pages: no matches.

The 42 content files that reference `@thallylabs/cli`, `@thallylabs/mcp`, or `create-thally-docs` by name do so without pinning to specific versions, so the patch bumps do not make any existing claim inaccurate.

## What was deliberately left alone

All existing documentation content. This is a mechanical scaffold release rotation with no user-visible contract changes. The patch version bumps exist solely to publish the updated scaffold release metadata.

## Untrusted-content check

Result: no instructions found
