'use client'

import PhoneInput from 'react-phone-number-input'
import { cn } from '@/lib/utils'

interface PhoneFieldProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  ariaInvalid?: boolean
  className?: string
}

export function PhoneField({
  id,
  value,
  onChange,
  placeholder,
  ariaInvalid,
  className,
}: PhoneFieldProps) {
  return (
    <PhoneInput
      id={id}
      defaultCountry="PT"
      international
      value={value || undefined}
      onChange={(v) => onChange(v ?? '')}
      placeholder={placeholder}
      aria-invalid={ariaInvalid || undefined}
      className={cn(
        'flex h-8 w-full min-w-0 items-center rounded-lg border border-input bg-transparent px-2.5 text-base transition-colors outline-none placeholder:text-muted-foreground has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        className
      )}
    />
  )
}
