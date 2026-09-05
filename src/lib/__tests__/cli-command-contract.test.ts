/** Guards the executable CLI package name across authored documentation. */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const contentRoot = join(process.cwd(), 'src', 'content')
const canonicalInvocation = 'npx --yes @thallylabs/cli@latest'

/** Collect authored MDX recursively without inspecting generated runtime output. */
function collectMdxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return collectMdxFiles(path)
    return entry.isFile() && entry.name.endsWith('.mdx') ? [path] : []
  })
}

describe('CLI documentation contract', () => {
  it('never invokes the unpublished unscoped package', () => {
    for (const file of collectMdxFiles(contentRoot)) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/\bnpx thally\b/)
    }
  })

  it.each([
    'quickstart.mdx',
    'guides/cli-overview.mdx',
    'guides/cli-reference.mdx',
    'guides/troubleshooting.mdx',
    'components/agent-prompt.mdx',
  ])('uses the executable scoped CLI in %s', (relativePath) => {
    const source = readFileSync(join(contentRoot, relativePath), 'utf8')
    expect(source).toContain(canonicalInvocation)
  })
})
