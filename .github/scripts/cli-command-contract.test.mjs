/** Guards the executable CLI package name across authored documentation. */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import assert from 'node:assert/strict'
import test from 'node:test'

const contentRoot = join(process.cwd(), 'src', 'content')
const canonicalInvocation = 'npx --yes @thallylabs/cli@latest'

/** Collect authored MDX recursively without inspecting generated runtime output. */
function collectMdxFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return collectMdxFiles(path)
    return entry.isFile() && entry.name.endsWith('.mdx') ? [path] : []
  })
}

test('authored docs never invoke the unpublished unscoped package', () => {
  for (const file of collectMdxFiles(contentRoot)) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /\bnpx thally\b/, file)
  }
})

for (const relativePath of [
  'quickstart.mdx',
  'guides/cli-overview.mdx',
  'guides/cli-reference.mdx',
  'guides/troubleshooting.mdx',
  'components/agent-prompt.mdx',
]) {
  test(`${relativePath} uses the executable scoped CLI`, () => {
    const source = readFileSync(join(contentRoot, relativePath), 'utf8')
    assert.ok(source.includes(canonicalInvocation))
  })
}
