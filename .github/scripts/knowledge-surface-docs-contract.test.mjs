/** Keeps public Knowledge-surface explanations anchored to one canonical guide. */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

const contentRoot = join(process.cwd(), 'src', 'content')
const canonicalHref = '/guides/knowledge-surfaces'

const linkedSurfaces = [
  'quickstart.mdx',
  'guides/thally-track.mdx',
  'guides/thally-cloud.mdx',
  'product-change-pipeline.mdx',
  'introduction.mdx',
  'architecture.mdx',
]

for (const relativePath of linkedSurfaces) {
  test(`${relativePath} links to the canonical behavior`, () => {
    const source = readFileSync(join(contentRoot, relativePath), 'utf8')
    assert.ok(source.includes(canonicalHref))
  })
}

test('the canonical guide covers every enforced destination boundary', () => {
  const source = readFileSync(
    join(contentRoot, 'guides', 'knowledge-surfaces.mdx'),
    'utf8',
  ).replace(/\s+/gu, ' ')

  for (const expected of [
    'primary documentation run',
    'separate run for every Knowledge surface',
    'exact files or directories Track may change',
    'Existing JSX or TSX files can receive visible prose edits only',
    "Track never installs a destination's dependencies",
    'Managed Thally preview URLs apply only to the primary documentation repository',
    'Track opens normal ready-for-review GitHub pull requests and never merges them',
  ]) {
    assert.ok(source.includes(expected), expected)
  }
})

test('public surfaces exclude the retired contradictory explanations', () => {
  const combined = linkedSurfaces
    .map((relativePath) =>
      readFileSync(join(contentRoot, relativePath), 'utf8'),
    )
    .join('\n')

  assert.ok(!combined.includes('These connections are separate from Track'))
  assert.ok(
    !combined.includes(
      "opens review pull requests only in the site's primary documentation repository",
    ),
  )
  assert.ok(!combined.includes('scoped draft pull requests'))
})
