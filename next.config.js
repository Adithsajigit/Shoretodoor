/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    API_KEY: process.env.GEMINI_API_KEY,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix for pdfkit in Next.js
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
      
      // Externalize pdfkit and its deps so Node can load bundled AFM files
      config.externals = [
        ...(config.externals || []),
        'canvas',
        'pdfkit',
        'svg-to-pdfkit'
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
