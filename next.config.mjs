/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the site URL from environment variables
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['localhost', 'nestboxapp.com', 'pquafubwzmdmesghxxyq.supabase.co'],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'nestboxapp.com',
          },
        ],
        destination: 'https://nestboxapp.com/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
