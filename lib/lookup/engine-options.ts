// Mirrors the API's accepted engine values (car-faults-api normalize-engine
// util): displacements in litres with one decimal, from 0.6 to 8.0. A fixed
// list keeps users from typing the model name or variants like "1,6 TDI",
// which would split one engine across several vehicles and AI lookups.
const MIN_ENGINE_TENTHS = 6;
const MAX_ENGINE_TENTHS = 80;

export const ENGINE_OPTIONS: readonly string[] = Array.from(
  { length: MAX_ENGINE_TENTHS - MIN_ENGINE_TENTHS + 1 },
  (_, index) => ((MIN_ENGINE_TENTHS + index) / 10).toFixed(1)
);
