import { describe, expect, it } from 'vitest'
import { similarSearchTerms } from './reportForm'

describe('similarSearchTerms', () => {
  it('merr deri në dy fjalët e para me të paktën 4 shkronja', () => {
    expect(similarSearchTerms('Gropë e madhe në rrugën kryesore')).toBe('Gropë madhe')
  })

  it('heq shenjat e pikësimit', () => {
    expect(similarSearchTerms('Ndriçimi, i prishur!')).toBe('Ndriçimi prishur')
  })

  it('kthen bosh kur nuk ka fjalë të mjaftueshme', () => {
    expect(similarSearchTerms('')).toBe('')
    expect(similarSearchTerms('në te do')).toBe('')
  })
})
