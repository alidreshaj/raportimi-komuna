import { describe, expect, it } from 'vitest'
import { MAX_PHOTO_BYTES, formatSize, validatePhoto } from './photos'

function file(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type })
}

describe('validatePhoto', () => {
  it('pranon JPG dhe PNG normale', () => {
    expect(validatePhoto(file('a.jpg', 'image/jpeg', 1000))).toBeNull()
    expect(validatePhoto(file('B.PNG', 'image/png', 1000))).toBeNull()
  })

  it('refuzon formate të tjera', () => {
    expect(validatePhoto(file('a.gif', 'image/gif', 1000))).toContain('JPG ose PNG')
    expect(validatePhoto(file('a.jpg', 'text/plain', 1000))).toContain('JPG ose PNG')
  })

  it('refuzon file bosh dhe file mbi 5 MB', () => {
    expect(validatePhoto(file('a.jpg', 'image/jpeg', 0))).toContain('bosh')
    expect(validatePhoto(file('a.jpg', 'image/jpeg', MAX_PHOTO_BYTES + 1))).toContain('5 MB')
  })
})

describe('formatSize', () => {
  it('shfaq KB ose MB', () => {
    expect(formatSize(204800)).toBe('200 KB')
    expect(formatSize(1887436)).toBe('1.8 MB')
    expect(formatSize(10)).toBe('1 KB')
  })
})
