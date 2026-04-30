import type { NextConfig } from "next";
import { normalizeApiBaseUrl } from "./lib/services/api-base-url";

const proxyTarget = normalizeApiBaseUrl(
  process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "https://daoleme-dev.jxare.cn",
);
const apiRequestMode =
  process.env.API_REQUEST_MODE ??
  process.env.NEXT_PUBLIC_API_REQUEST_MODE ??
  "proxy";
const isDevelopment = process.env.NODE_ENV === "development";
const enableDevProxy =
  isDevelopment && apiRequestMode === "proxy" && Boolean(proxyTarget);

const nextConfig: NextConfig = {
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["127.0.0.1", "localhost", "172.16.1.0"],
};

if (!isDevelopment) {
  nextConfig.output = "export";
}

if (enableDevProxy) {
  nextConfig.rewrites = async () => [
    {
      source: "/api/:path*",
      destination: `${proxyTarget}/api/:path*`,
    },
  ];
}

export default nextConfig;
