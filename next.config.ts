import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

function r2PublicRemotePattern() {
  const publicBaseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL;
  if (!publicBaseUrl) return null;

  try {
    const url = new URL(publicBaseUrl);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

const r2Pattern = r2PublicRemotePattern();

const nextConfig: NextConfig = {
  // next-intl/use-intl ship ESM-only builds; transpiling them lets
  // next/jest's SWC transform (rather than raw node) load them in tests.
  transpilePackages: ["next-intl", "use-intl"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.example.com",
        pathname: "/avatars/**",
      },
      ...(r2Pattern ? [r2Pattern] : []),
    ],
  },
};

export default withNextIntl(nextConfig);
