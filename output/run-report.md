# Run report

## Summary

PR #209 "feat: harden multilingual indexing and discovery" (commits 121b18b4 → 7402c8f3) changed how Thally handles localized pages in crawlable indexes, search APIs, and agent discovery surfaces. Three destination documentation pages were updated to reflect the new behavior.

## Source evidence examined

### Fallback behavior: orphaned translations now return 404
- **Source file:** `src/lib/i18n/translation-source.ts`, `findDocSource` function (lines 146-153)
- **Before:** Fallback always served source-language content. The function did not exist.
- **After:** When `primaryPath` is null (source page deleted), the function returns null, producing a 404 for the orphaned translation.
- **Destination claim fixed:** "Thally never returns a 404 for a missing translation" → "A translation left behind after its source page is deleted returns 404."

### Stale detection: SHA-256 provenance hash replaces timestamp comparison
- **Source file:** `src/lib/i18n/translation-source.ts`, `isTranslationStale` function (lines 74-95)
- **Before:** No staleness detection existed in this form; timestamp comparison was used elsewhere.
- **After:** For files with a `thally:ai-translation` marker, computes SHA-256 of the source content and compares it to the recorded `source-sha`. Files without the marker return `false` (freshness unknown, not stale).
- **Destination claim fixed:** "the primary-language file was updated after the translation was last generated" → "a generated translation's recorded source hash differs from the current source content." The source-after product docs page also mentions timestamp comparison for unmarked files, but the code returns `false` unconditionally for those, so the destination omits that inaccurate clause.

### hreflang and sitemap: hidden/noindex exclusion
- **Source file:** `src/lib/i18n/translation-source.ts`, `getIndexableDocTranslation` (line 61)
- **Before:** `getContentI18nConfig` filtered locales by MDX file existence only.
- **After:** `getIndexableDocTranslation` additionally checks `data.noindex`, `data.hidden`, `sourceData.noindex`, `sourceData.hidden`, returning null if any are true.
- **Destination claim fixed:** "When a translation exists, Thally automatically adds hreflang" → "A locale is added to hreflang and the sitemap only when that page has a translated MDX file and neither the source nor the translation is hidden or marked noindex."

### Locale-aware search and docs APIs
- **Source files:** `src/app/api/search/route.ts` (line 28: `locale` param), `src/app/api/docs-index/route.ts` (line 12: `locale` param, line 84: `locale` response field), `src/app/api/docs/[...slug]/route.ts` (line 65: `resolveDocRoute` parses locale from slug), `src/lib/agent-discovery.ts` (lines 44-46: `Docs-Locale-Index`, `Docs-Locale-Search`, `Docs-Locale-Page`)
- **Before:** None of these endpoints accepted a locale parameter. ai.txt did not advertise locale endpoints. Search and docs-index responses had no `locale` field.
- **After:** All three endpoints support locale queries. ai.txt advertises the three locale-specific URI templates when multiple locales are configured. Responses include `locale` field.
- **Destination additions:** New paragraphs in multi-language.mdx SEO section and ai-features.mdx Page index, Content negotiation, and Discovery file sections.

### Package versions
- `@thallylabs/core`: 0.2.7 → 0.2.8
- `@thallylabs/cli`: 0.8.53 → 0.8.54
- Root `thally` package: 0.1.0 (unchanged, private)
- No version claims exist in the destination docs for these packages, so no version edits were needed.

## Destination pages edited

### `src/content/guides/multi-language.mdx`
- Card 1: "every locale gets its own indexable URL" → "Each published translation has its own crawlable URL"
- Card 3: "informative banners instead of 404s" → "Missing translations show the original with a notice"
- Fallback section: removed "never returns a 404" claim; added orphaned-translation 404 behavior
- Stale detection: replaced timestamp description with SHA-256 hash description
- Removed fallback-section noindex paragraph (content now in SEO section)
- SEO section intro: added hidden/noindex condition for hreflang/sitemap
- SEO section: replaced canonicalization paragraph with expanded version covering noindex fallbacks, lang attribute, and locale-aware APIs

### `src/content/guides/ai-features.mdx`
- Page index section: added `GET /api/docs-index?locale=es` example, locale parameter description, and `locale` field in response JSON
- Content negotiation section: added locale-prefixed slug explanation and curl example
- Discovery file section: added locale-specific endpoints block (`Docs-Locale-Index`, `Docs-Locale-Search`, `Docs-Locale-Page`)

### `src/content/es/guides/multi-language.mdx`
- Fallback section: replaced "Thally sirve el contenido en el idioma principal" with orphaned-translation 404 behavior
- Stale detection: replaced timestamp description with hash-based description
- SEO section: replaced "para todos los locales configurados" with hidden/noindex condition; replaced canonicalization paragraph with noindex fallback description

## Deliberately left alone

- **Pre-existing description frontmatter drift** in multi-language.mdx ("build-time generation" vs source's "server-rendered routing"): pre-dates this PR; source-before already had the newer wording. Not in scope.
- **Pre-existing Setup step titles** (docs says "Choose languages in Thally Cloud" vs source's "Choose languages in Settings"): pre-dates this PR.
- **Pre-existing em dashes** used as prose punctuation throughout all three files: pre-date this PR and are not affected by the product change.
- **Pre-existing heading case** ("API Reference" title case): pre-dates this PR.
- **agent-manifests.mdx table**: High-level endpoint descriptions ("A structured JSON index", "Ranked page discovery") remain accurate; locale support is additive and does not contradict these summaries.
- **docs-json-reference.mdx i18n section**: Cross-reference to multi-language guide is accurate.
- **seo-and-visibility.mdx**: Discusses `noindex` frontmatter behavior for regular pages, not locale-specific behavior. Not affected.
- **deploy-cloudflare.mdx, managed-hosting.mdx, mcp-server.mdx, remote-mcp.mdx, provenance.mdx**: Mention `/api/search` or `/api/docs-index` in passing without making claims contradicted by the locale additions.

## Coverage verification

Searched the destination content tree for all old claims after editing:
- `"never returns a 404 for a missing translation"` → 0 remaining occurrences
- `"primary-language file was updated after"` → 0 remaining occurrences
- `"hreflang.*for all|para todos.*hreflang|automatically adds.*hreflang"` → 0 remaining occurrences
- `"instead of 404|indexable URL|every locale gets"` → 0 remaining occurrences
- `"canonicalized to the English page"` → 0 remaining occurrences
- `"Reciprocal.*hreflang.*include only authored"` → 0 remaining occurrences

## Verification findings and repairs

The repository-investigator verified all three edited files against source code. One substantive error was found and fixed:

- **Stale detection timestamp clause**: The initial edit said "or an unmarked translation's file timestamp predates the source," mirroring the source-after product docs. However, the actual code in `isTranslationStale` returns `false` unconditionally for files without the provenance marker (lines 91-94 of `translation-source.ts`). The clause was removed from both the English and Spanish pages. The destination docs are now accurate against the code.

Navigation completeness: all 75 page IDs in docs.json have matching `.mdx` files. No orphaned pages on disk.

MDX validity: no bare braces or angle brackets outside code spans. No import/export statements added.

## Untrusted-content check

Result: no instructions found
