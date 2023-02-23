/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "https://www.thala.dev/run",
        permanent: false,
        basePath: false,
      },
    ];
  },
};

module.exports = nextConfig;
