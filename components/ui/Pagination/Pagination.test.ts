import { pageItems } from './Pagination'

describe('pageItems', () => {
  it('shows the edges and the neighbours of the current page', () => {
    expect(pageItems(1, 12)).toEqual([1, 2, 3, '…', 12])
    expect(pageItems(6, 12)).toEqual([1, '…', 5, 6, 7, '…', 12])
    expect(pageItems(12, 12)).toEqual([1, '…', 10, 11, 12])
    expect(pageItems(3, 5)).toEqual([1, 2, 3, 4, 5])
  })
})
