import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ArtGallery",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
