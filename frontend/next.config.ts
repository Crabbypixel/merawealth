import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,

    allowedDevOrigins: [
        "merawealth.in",
        "www.merawealth.in",
        "crabbyfeet.online",
        "www.crabbyfeet.online",
        "3.109.232.12",
    ],

    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "merawealth.in",
                pathname: "/api/uploads/**",
            },
        ],
    },
};

export default nextConfig;