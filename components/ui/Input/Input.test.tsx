import { render, screen } from '@testing-library/react'
import { Select } from '../Select'
import { Input } from './Input'

describe('Field labels', () => {
  it('name their controls and describe inputs with the hint', () => {
    render(
      <>
        <Input label="Amount" hint="Balance: $10.00" />
        <Select label="Type" options={[{ value: '', label: 'All types' }]} />
      </>
    )
    expect(screen.getByRole('textbox', { name: 'Amount' })).toHaveAccessibleDescription('Balance: $10.00')
    expect(screen.getByRole('combobox', { name: 'Type' })).toBeInTheDocument()
  })
})
