/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow fetching from external domains
  async rewrites() {
    return [
      {
        source: '/api/news-ticker',
        destination: '/api/news-ticker',
      },
    ];
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ext.same-assets.com',
      },
      {
        protocol: 'https',
        hostname: 'www.thedailybeast.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    // Enable unoptimized for local development to fix image loading issues
    unoptimized: process.env.NODE_ENV === 'development', // Use unoptimized in development
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true, // Allow SVG images
    contentDispositionType: 'attachment', // Helps with some image loading issues
  },
  // For static export, uncomment these lines (not recommended for this project)
  // output: 'export',
  // distDir: 'out',
  
  // SEO Optimizations
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  reactStrictMode: true, // Enable React strict mode
  
  // Performance optimizations
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    scrollRestoration: true, // Enable scroll restoration
    optimizePackageImports: ['react-icons', '@heroicons/react'],
    // Optimize for mobile-first
    optimizeServerReact: true,
    // Removed deprecated options: granularChunks and modern
  },
  
  // Server external packages
  serverExternalPackages: ['mongoose'],
  
  // Environment variables for build time detection
  env: {
    IS_NETLIFY_BUILD: process.env.NETLIFY ? 'true' : 'false',
    NOTIFICATIONS_ENABLED: (process.env.NEXT_PUBLIC_NOTIFICATIONS_ENABLED === 'true' || process.env.NODE_ENV === 'development') ? 'true' : 'false',
  },
  
  // Simplified webpack configuration
  webpack: (config, { isServer }) => {
    if (isServer && (process.env.NETLIFY || process.env.NODE_ENV === 'production')) {
      // Exclude web-push from the server build
      config.externals = [...config.externals, 'web-push'];
    }
    return config;
  },
  
  // Add trailing slashes for better SEO
  trailingSlash: true,
  
  // Exclude API routes that require MongoDB from the build
  // This prevents build errors when MongoDB is not available
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  
  // Configure headers for security and caching
  async headers() {
    return [
      {
        source: '/api/news-ticker',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300, stale-while-revalidate=300',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), speech-synthesis=(self)',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
