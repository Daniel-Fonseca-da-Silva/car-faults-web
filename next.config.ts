import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // next-intl/use-intl ship ESM-only builds; transpiling them lets
  // next/jest's SWC transform (rather than raw node) load them in tests.
  transpilePackages: ["next-intl", "use-intl"],
};

export default withNextIntl(nextConfig);
