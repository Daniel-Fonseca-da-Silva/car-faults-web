import { render, screen } from '@testing-library/react'
import { Button, buttonVariants } from './button'

jest.mock('@base-ui/react/button', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

describe('buttonVariants', () => {
  it('includes base inline-flex class', () => {
    expect(buttonVariants()).toContain('inline-flex')
  })

  it('applies destructive variant classes', () => {
    expect(buttonVariants({ variant: 'destructive' })).toContain('bg-destructive')
  })

  it('applies outline variant classes', () => {
    expect(buttonVariants({ variant: 'outline' })).toContain('border-border')
  })

  it('applies sm size classes', () => {
    expect(buttonVariants({ size: 'sm' })).toContain('h-7')
  })

  it('applies icon size classes', () => {
    expect(buttonVariants({ size: 'icon' })).toContain('size-8')
  })

  it('merges a custom className', () => {
    expect(buttonVariants({ className: 'my-class' })).toContain('my-class')
  })
})

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('carries data-slot="button"', () => {
    render(<Button>x</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'button')
  })

  it('applies variant class to className', () => {
    render(<Button variant="destructive">Del</Button>)
    expect(screen.getByRole('button').className).toContain('bg-destructive')
  })

  it('applies size class to className', () => {
    render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button').className).toContain('h-7')
  })

  it('merges custom className', () => {
    render(<Button className="custom-btn">Test</Button>)
    expect(screen.getByRole('button').className).toContain('custom-btn')
  })
})
