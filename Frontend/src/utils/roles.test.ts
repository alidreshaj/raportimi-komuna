import { describe, expect, it } from 'vitest'
import { homePathFor, reportPathFor } from './roles'

describe('roles', () => {
  it('çdo rol ka faqen e vet kryesore', () => {
    expect(homePathFor('Admin')).toBe('/admin/raportet')
    expect(homePathFor('Citizen')).toBe('/raportet')
  })

  it('njoftimi hap raportin te faqja e rolit të duhur', () => {
    expect(reportPathFor('Admin', 7)).toBe('/admin/raportet/7')
    expect(reportPathFor('Citizen', 7)).toBe('/raportet/7')
  })
})
