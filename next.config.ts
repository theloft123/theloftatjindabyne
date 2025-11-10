import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hjixtvrbeqthaepwltqh.supabase.co",
      },
    ],
  },
};

export default nextConfig;
