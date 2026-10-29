Review page: src/content/guides/cli-reference.mdx
Review verdict: passed

"What it checks" table updated with two new rows:
1. "MDX syntax error in a page or in a `snippets/` file" as Error. Confirmed: check.ts ~L313 emits `severity: 'error'` with `MDX syntax error:` message.
2. "Redirect from a link-only page that ends at a missing page or loops" as Error. Confirmed: check.ts ~L983 emits `severity: 'error'` with `Broken redirect:` message.

"Page reused in more than one `docs.json` section" corrected from Error to Warning. Confirmed: check.ts ~L853 emits `severity: 'warning'` for duplicatePageIds.

Check options table now lists `--ci`, `--drift`, `--external` alongside `--fix`. All four flags confirmed in CheckOptions interface (check.ts ~L36).

Explanatory paragraphs about link-only pages and MDX check behavior match source-after cli-reference.mdx. No MDX syntax issues. No starter text.
