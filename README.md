# Thally Docs

**The product knowledge layer for software teams.**

This repository contains the official Thally documentation. Thally keeps your
docs, website, and help center aligned as your product changes. The pages,
navigation, and site settings stay in Git so every update remains reviewable.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3040](http://localhost:3040). The next available port is
used automatically when 3040 is occupied.

## Update the docs

- Edit pages in `src/content/`.
- Organize navigation and features in `docs.json`.
- Update site identity, links, and versioned brand defaults in `src/data/site.ts`.
- Add an OpenAPI specification and enable an API tab when your docs need an API reference.
- Add logos or favicons in `public/` and reference them from your site settings.

Content icons are neutral by default. Set `appearance.contentIcons` to `accent`
in `docs.json`, or add `iconColor="accent"` to an individual card or tile.
Public page URLs ending in `.md` are disabled by default; enable them explicitly
with `markdown.enabled` when that distribution surface fits your access model.

## Validate changes

```bash
npm test
npm run build
npm ci --ignore-scripts --prefix .github/thally-tooling
.github/thally-tooling/node_modules/.bin/thally check --ci .
```

## Deploy

Deploy through Thally Cloud, Vercel, the included Cloudflare Workers/OpenNext
contract, or the documented Docker recipe. The Thally CLI supports Vercel and
Cloudflare; `open-next.config.ts` and `wrangler.jsonc` provide the Cloudflare
configuration. The starter does not ship a Netlify build contract.

Copy `.env.example` to `.env.local` only when you need optional services. Never
commit real credentials.

## License

[MIT](LICENSE)
