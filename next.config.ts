import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/minimal-art-gallery",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
