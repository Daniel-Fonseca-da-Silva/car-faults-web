const PLACEHOLDER_SLOT_PATTERN = /^0*$/;

export function isConfiguredAdSlot(slot: string | undefined): boolean {
  if (!slot) return false;
  return !PLACEHOLDER_SLOT_PATTERN.test(slot);
}
