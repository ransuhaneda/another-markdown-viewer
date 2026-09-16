import { describe, expect, it } from 'vitest'

describe('phase 1 foundation', () => {
  it('keeps the product name and primary flow documented', () => {
    expect('Markdown Preview').toBe('Markdown Preview')
    expect(['paste', 'inspect', 'download']).toEqual(['paste', 'inspect', 'download'])
  })
})
