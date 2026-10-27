Review page: src/content/components/param-field.mdx
Review verdict: passed

Props table matches source-after ParamFieldProps interface (api-fields.tsx ~L91): `body?: boolean | string` documented as `string` (preferred form), `deprecated?: boolean`, `placeholder?: string`, `default?: ReactNode` documented as `any`. The `id` prop is internal (set by heading pass), correctly omitted.

"Linking to a field" section matches source-after's authoritative param-field.mdx: anchor format `param-<kebab-name>`, numbering from `-1`, Expandable auto-open behavior confirmed by expandable-hash.test.tsx and field-anchor.ts.

Examples use the preferred `body="name"` form. Intro notes the older boolean + name form remains supported. No MDX syntax issues. No starter text.
