import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/challenges",
        destination: "/blog?type=challenge",
        permanent: true,
      },
      {
        source: "/challenges/:slug",
        destination: "/blog/:slug",
        permanent: true,
      },
      {
        source: "/challenges/category/:category",
        destination: "/blog/category/:category",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
