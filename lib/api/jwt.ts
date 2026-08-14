/**
 * Reads the `exp` claim without verifying the signature - only used to size
 * the web session cookie's maxAge. The API re-validates the token on every request.
 */
export function resolveTokenExpirySeconds(token: string): number | undefined {
  const payloadSegment = token.split(".")[1];
  if (!payloadSegment) {
    return undefined;
  }

  try {
    const json = Buffer.from(payloadSegment, "base64url").toString("utf8");
    const { exp } = JSON.parse(json) as { exp?: unknown };

    if (typeof exp !== "number") {
      return undefined;
    }

    return Math.max(Math.floor(exp - Date.now() / 1000), 0);
  } catch {
    return undefined;
  }
}
