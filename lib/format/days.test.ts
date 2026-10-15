import type { Transaction } from '@/types/api'
import { groupByDay } from './days'

const tx = (id: string, createdAt: Date) => ({ id, createdAt: createdAt.toISOString() }) as Transaction

describe('groupByDay', () => {
  it('labels today and yesterday in local time and keeps order', () => {
    const now = new Date(2026, 9, 14, 9, 0)
    const groups = groupByDay(
      [
        tx('a', new Date(2026, 9, 14, 8, 0)),
        tx('b', new Date(2026, 9, 13, 23, 30)),
        tx('c', new Date(2026, 9, 13, 0, 5)),
        tx('d', new Date(2026, 9, 5, 10, 15)),
      ],
      now
    )
    expect(groups.map((g) => [g.label, g.transactions.map((t) => t.id)])).toEqual([
      ['Today', ['a']],
      ['Yesterday', ['b', 'c']],
      ['Mon, 5 Oct 2026', ['d']],
    ])
  })
})
