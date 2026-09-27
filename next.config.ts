import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/myClass",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
