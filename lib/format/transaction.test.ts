import { initials } from './transaction'

describe('initials', () => {
  it('takes the first letter of the first two words, splitting on hyphens', () => {
    expect(initials('Kwame Mensah')).toBe('KM')
    expect(initials('Okonkwo-Adeyemi Logistics & Haulage International Ltd')).toBe('OA')
    expect(initials('  ada ')).toBe('A')
  })
})
