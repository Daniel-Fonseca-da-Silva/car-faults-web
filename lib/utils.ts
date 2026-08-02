import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const COMBINING_DIACRITICS_PATTERN = new RegExp("[\\u0300-\\u036f]", "g")

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS_PATTERN, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function formatYearRange(yearFrom: number, yearTo: number | null): string {
  return yearTo && yearTo !== yearFrom ? `${yearFrom} – ${yearTo}` : String(yearFrom)
}

export function formatLongDate(date: string | Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

const RELATIVE_TIME_UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
]

export function formatRelativeTime(date: string | Date, locale: string): string {
  const target = new Date(date).getTime()
  const diffMs = target - Date.now()
  const absMs = Math.abs(diffMs)
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  for (const { unit, ms } of RELATIVE_TIME_UNITS) {
    if (absMs >= ms) {
      return formatter.format(Math.round(diffMs / ms), unit)
    }
  }

  return formatter.format(Math.round(diffMs / 1000), "second")
}

const COMPACT_NOTATION_THRESHOLD = 1_000_000

export function formatCompactCount(value: number, locale: string): string {
  const formatter =
    value >= COMPACT_NOTATION_THRESHOLD
      ? new Intl.NumberFormat(locale, {
          notation: "compact",
          maximumFractionDigits: 1,
        })
      : new Intl.NumberFormat(locale)

  // ICU compact suffixes vary by case across runtimes (e.g. "1.2m" vs "1.2M").
  return `${formatter.format(value).toLocaleUpperCase(locale)}+`
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}
