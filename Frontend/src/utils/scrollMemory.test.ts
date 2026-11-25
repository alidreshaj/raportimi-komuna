import { describe, expect, it } from 'vitest'
import { createScrollMemory } from './scrollMemory'

describe('createScrollMemory', () => {
  it('kthen pozicionin e ruajtur për çdo hyrje', () => {
    const memory = createScrollMemory()
    memory.save('a', 420)
    memory.save('b', 0)

    expect(memory.get('a')).toBe(420)
    expect(memory.get('b')).toBe(0)
    expect(memory.get('c')).toBeUndefined()
  })

  it('ruan vlerën e fundit dhe nuk pranon numra negativë ose me presje', () => {
    const memory = createScrollMemory()
    memory.save('a', 100)
    memory.save('a', 250.6)
    memory.save('b', -30)

    expect(memory.get('a')).toBe(251)
    expect(memory.get('b')).toBe(0)
  })

  it('harron hyrjet më të vjetra kur kalon kufirin', () => {
    const memory = createScrollMemory(2)
    memory.save('a', 1)
    memory.save('b', 2)
    memory.save('a', 3) // "a" bëhet përsëri e fundit
    memory.save('c', 4)

    expect(memory.size).toBe(2)
    expect(memory.get('b')).toBeUndefined()
    expect(memory.get('a')).toBe(3)
    expect(memory.get('c')).toBe(4)
  })
})
