import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    allowedDevOrigins: [
        "crabbyfeet.online",
    ],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "crabbyfeet.online",
                pathname: "/api/uploads/**",
            },
        ],
    },
};

export default nextConfig;
