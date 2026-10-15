import { render, screen } from '@testing-library/react'
import { Money } from './Money'

describe('Money', () => {
  it('formats minor units with the sign before the symbol', () => {
    render(
      <>
        <Money amount={150050} currency="NGN" sign="credit" />
        <Money amount={4599} currency="USD" sign="debit" />
        <Money amount={85020} currency="GHS" />
      </>
    )
    expect(screen.getByText('+₦1,500.50')).toBeInTheDocument()
    expect(screen.getByText('-$45.99')).toBeInTheDocument()
    expect(screen.getByText('GH₵850.20')).toBeInTheDocument()
  })
})
