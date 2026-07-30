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
