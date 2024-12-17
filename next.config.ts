import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // This is where you can add your custom server-side logic
  experimental: {
    serverActions: {
      bodySizeLimit: '100MB',
    },
  },
  // to render the images from third party libraries we use config like this as below.:
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com', // Add this line for freepik.com images
      },
    ],
  },
};

export default nextConfig;
