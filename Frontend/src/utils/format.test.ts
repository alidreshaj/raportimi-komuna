import { afterEach, describe, expect, it, vi } from 'vitest'
import { initialsOf, percentOf, pluralize, timeAgo } from './format'

describe('format', () => {
  afterEach(() => vi.useRealTimers())

  it('pluralize', () => {
    expect(pluralize(1, 'raport', 'raporte')).toBe('1 raport')
    expect(pluralize(0, 'raport', 'raporte')).toBe('0 raporte')
    expect(pluralize(4, 'raport', 'raporte')).toBe('4 raporte')
  })

  it('percentOf nuk jep NaN kur totali është 0', () => {
    expect(percentOf(1, 4)).toBe(25)
    expect(percentOf(5, 0)).toBe(0)
  })

  it('initialsOf', () => {
    expect(initialsOf('Ali Test')).toBe('AT')
    expect(initialsOf('  ali  ')).toBe('A')
    expect(initialsOf('Ali Pjetër Test')).toBe('AP')
    expect(initialsOf('')).toBe('?')
  })

  it('timeAgo', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
    expect(timeAgo('2026-06-15T11:59:30Z')).toBe('tani')
    expect(timeAgo('2026-06-15T11:55:00Z')).toBe('para 5 minutash')
    expect(timeAgo('2026-06-15T09:00:00Z')).toBe('para 3 orësh')
    expect(timeAgo('2026-06-12T12:00:00Z')).toBe('para 3 ditësh')
  })
})
