import { render, screen, fireEvent } from '@testing-library/react'
import { PhoneField } from './phone-field'

afterEach(() => jest.clearAllMocks())

describe('PhoneField', () => {
  it('renders a phone number input', () => {
    render(<PhoneField value="" onChange={jest.fn()} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('assigns the given id to the number input', () => {
    render(<PhoneField id="phone" value="" onChange={jest.fn()} />)
    expect(document.getElementById('phone')).toBeInTheDocument()
  })

  it('shows the placeholder', () => {
    render(<PhoneField value="" onChange={jest.fn()} placeholder="912 345 678" />)
    expect(screen.getByPlaceholderText('912 345 678')).toBeInTheDocument()
  })

  it('calls onChange with the entered value', () => {
    const onChange = jest.fn()
    render(<PhoneField value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '912345678' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('calls onChange with empty string when the value is cleared', () => {
    const onChange = jest.fn()
    render(<PhoneField value="+351912345678" onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('applies aria-invalid when ariaInvalid is true', () => {
    render(<PhoneField value="" onChange={jest.fn()} ariaInvalid />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when ariaInvalid is false', () => {
    render(<PhoneField value="" onChange={jest.fn()} ariaInvalid={false} />)
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
  })
})
