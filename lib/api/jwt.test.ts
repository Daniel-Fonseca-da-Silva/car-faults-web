import { resolveTokenExpirySeconds } from "./jwt";

function buildToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256" })).toString(
    "base64url"
  );
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.signature`;
}

describe("resolveTokenExpirySeconds", () => {
  it("returns the seconds remaining until the exp claim", () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = buildToken({ sub: "user-1", exp });

    const result = resolveTokenExpirySeconds(token);

    expect(result).toBeGreaterThan(3590);
    expect(result).toBeLessThanOrEqual(3600);
  });

  it("clamps to zero for an already-expired token", () => {
    const exp = Math.floor(Date.now() / 1000) - 60;
    const token = buildToken({ sub: "user-1", exp });

    expect(resolveTokenExpirySeconds(token)).toBe(0);
  });

  it("returns undefined when the token has no payload segment", () => {
    expect(resolveTokenExpirySeconds("not-a-jwt")).toBeUndefined();
  });

  it("returns undefined when exp is missing", () => {
    const token = buildToken({ sub: "user-1" });

    expect(resolveTokenExpirySeconds(token)).toBeUndefined();
  });

  it("returns undefined when the payload segment is not valid base64/JSON", () => {
    expect(resolveTokenExpirySeconds("header.%%%.signature")).toBeUndefined();
  });

  it("returns undefined when exp is not a number", () => {
    const token = buildToken({ sub: "user-1", exp: "not-a-number" });

    expect(resolveTokenExpirySeconds(token)).toBeUndefined();
  });
});
