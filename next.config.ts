import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
    // devIndicators: false,
  experimental: {
    serverActions: {
      // Equipment images are sent to a Server Action before being forwarded to ImgBB.
      bodySizeLimit: "10mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};






export default nextConfig;
