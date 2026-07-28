/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async rewrites() {
    const up = process.env.EXPRESS_BACKEND_URL || "http://localhost:4000";
    return [
      // Express auth routes (NOT NextAuth — those stay on Next.js)
      { source: "/api/auth/login", destination: `${up}/api/auth/login` },
      { source: "/api/auth/register", destination: `${up}/api/auth/register` },
      { source: "/api/auth/refresh", destination: `${up}/api/auth/refresh` },
      { source: "/api/auth/recuperar/:path*", destination: `${up}/api/auth/recuperar/:path*` },
      { source: "/api/auth/mfa/:path*", destination: `${up}/api/auth/mfa/:path*` },
      // Express business routes
      { source: "/api/appointments/:path*", destination: `${up}/api/appointments/:path*` },
      { source: "/api/clients/:path*", destination: `${up}/api/clients/:path*` },
      { source: "/api/services/:path*", destination: `${up}/api/services/:path*` },
      { source: "/api/colaboradores/:path*", destination: `${up}/api/colaboradores/:path*` },
      { source: "/api/inventory/:path*", destination: `${up}/api/inventory/:path*` },
      { source: "/api/products", destination: `${up}/api/products` },
      { source: "/api/products/:path*", destination: `${up}/api/products/:path*` },
      { source: "/api/orders", destination: `${up}/api/orders` },
      { source: "/api/orders/:path*", destination: `${up}/api/orders/:path*` },
      { source: "/api/commissions/:path*", destination: `${up}/api/commissions/:path*` },
      { source: "/api/cash-registers/:path*", destination: `${up}/api/cash-registers/:path*` },
      { source: "/api/reports/:path*", destination: `${up}/api/reports/:path*` },
      { source: "/api/settings/:path*", destination: `${up}/api/settings/:path*` },
      { source: "/api/loyalty/:path*", destination: `${up}/api/loyalty/:path*` },
      { source: "/api/reviews/:path*", destination: `${up}/api/reviews/:path*` },
      { source: "/api/audit/:path*", destination: `${up}/api/audit/:path*` },
      { source: "/api/health", destination: `${up}/api/health` },
      // Telegram bot webhook
      { source: "/api/telegram/:path*", destination: `${up}/api/telegram/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
