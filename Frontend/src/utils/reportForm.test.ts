import { describe, expect, it } from 'vitest'
import { EMPTY_REPORT_FORM, toReportInput, validateReportForm } from './reportForm'

const valid = {
  title: ' Gropë ',
  categoryId: '3',
  description: ' Gropë e madhe ',
  location: ' Rruga A ',
  point: null,
}

describe('validateReportForm', () => {
  it('kërkon çdo fushë të detyrueshme, sipas radhës', () => {
    expect(validateReportForm(EMPTY_REPORT_FORM)).toBe('Shkruaj titullin.')
    expect(validateReportForm({ ...valid, categoryId: '' })).toBe('Zgjidh kategorinë.')
    expect(validateReportForm({ ...valid, description: '   ' })).toBe('Shkruaj përshkrimin.')
    expect(validateReportForm({ ...valid, location: '' })).toBe('Shkruaj vendin.')
  })

  it('pranon formën e plotë', () => {
    expect(validateReportForm(valid)).toBeNull()
  })
})

describe('toReportInput', () => {
  it('heq hapësirat dhe e kthen kategorinë në numër', () => {
    expect(toReportInput(valid)).toEqual({
      title: 'Gropë',
      description: 'Gropë e madhe',
      location: 'Rruga A',
      categoryId: 3,
      latitude: null,
      longitude: null,
    })
  })

  it('dërgon koordinatat kur ka pikë', () => {
    const input = toReportInput({ ...valid, point: { latitude: 42.66, longitude: 21.16 } })
    expect(input.latitude).toBe(42.66)
    expect(input.longitude).toBe(21.16)
  })
})
