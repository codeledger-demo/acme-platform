/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@acme/api-client',
    '@acme/design-tokens',
    '@acme/shared-utils',
  ],
  reactStrictMode: true,
};

export default nextConfig;
