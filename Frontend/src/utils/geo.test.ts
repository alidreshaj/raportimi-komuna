import { describe, expect, it } from 'vitest'
import { isInsideKosovo } from './geo'

describe('isInsideKosovo', () => {
  it('pranon qytete brenda Kosovës', () => {
    expect(isInsideKosovo(42.6629, 21.1655)).toBe(true) // Prishtina
    expect(isInsideKosovo(42.66, 20.29)).toBe(true) // Peja
    expect(isInsideKosovo(42.37, 20.43)).toBe(true) // Gjakova
  })

  it('refuzon pika jashtë Kosovës', () => {
    expect(isInsideKosovo(41.33, 19.82)).toBe(false) // Tirana
    expect(isInsideKosovo(41.99, 21.43)).toBe(false) // Shkupi
    expect(isInsideKosovo(0, 0)).toBe(false)
  })
})
