import { timingSafeEqual } from "node:crypto";

export const OAUTH_STATE_COOKIE_NAME = "oauth_state";
export const OAUTH_STATE_COOKIE_PATH = "/api/auth";
export const OAUTH_STATE_MAX_AGE_SECONDS = 10 * 60;

export function oauthStatesMatch(
  expected: string | undefined,
  actual: string | null
): boolean {
  if (!expected || !actual) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}
