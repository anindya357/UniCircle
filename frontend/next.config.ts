import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "app.cuet.ac.bd",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "app.cuet.ac.bd",
        pathname: "/assets/images/avatar/**",
      },
    ],
  },
};

export default nextConfig;
