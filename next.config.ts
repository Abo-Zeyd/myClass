import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.LOCAL_ADMIN_DASHBOARD === "1"
    ? { distDir: ".next-admin" }
    : { output: "export" }),
  basePath: "/myClass",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
