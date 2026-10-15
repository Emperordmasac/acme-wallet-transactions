import { parseQuery, toSearch } from './query'

const params = (search: string) => new URLSearchParams(search)

describe('parseQuery', () => {
  it('reads valid values and falls back to defaults for invalid ones', () => {
    expect(parseQuery(params('q=%20netflix%20&type=card_payment&status=failed&page=3&tx=txn_1'))).toEqual({
      q: 'netflix',
      type: 'card_payment',
      status: 'failed',
      page: 3,
      tx: 'txn_1',
    })
    expect(parseQuery(params('type=reversed&status=nope&page=abc'))).toEqual({ q: '', page: 1 })
    expect(parseQuery(params('page=-2')).page).toBe(1)
    expect(parseQuery(params('page=1.5')).page).toBe(1)
  })
})

describe('toSearch', () => {
  it('resets the page on a filter change and keeps unrelated params', () => {
    expect(toSearch(params('__scenario=slow&page=4&q=old'), { type: 'deposit' })).toBe(
      '?__scenario=slow&q=old&type=deposit'
    )
  })

  it('drops defaults and keeps the page when only the page changes', () => {
    expect(toSearch(params('q=x&page=2'), { page: 3 })).toBe('?q=x&page=3')
    expect(toSearch(params('q=x&page=2'), { page: 1 })).toBe('?q=x')
    expect(toSearch(params('q=x&type=deposit'), { q: '', type: undefined })).toBe('')
  })
})
