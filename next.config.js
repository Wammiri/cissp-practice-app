/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static export so the app can be served from any static host (or opened
  // via a simple static server). Data is loaded at runtime from /public/data.
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  images: { unoptimized: true },
  // Build-trace collection is only used for server/standalone deployments and
  // is unnecessary for a static export. Disabling it also avoids a Windows
  // ENOENT during `collectBuildTraces` (file-system rename race in .next).
  outputFileTracing: false,
};

module.exports = nextConfig;
