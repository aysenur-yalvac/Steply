import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  async redirects() {
    return [
      {
        source: "/signup",
        destination: "/auth/register",
        permanent: false,
      },
      {
        source: "/register",
        destination: "/auth/register",
        permanent: false,
      },
      {
        source: "/login",
        destination: "/auth/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
