// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // Enable image optimization for better performance
//   images: {
//     unoptimized: false, // Enable image optimization
//     formats: ['image/webp', 'image/avif'],
//     deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
//     imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
//     minimumCacheTTL: 60,
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'images.unsplash.com',
//         port: '',
//         pathname: '/**',
//       },
//       {
//         protocol: 'https',
//         hostname: 'plus.unsplash.com',
//         port: '',
//         pathname: '/**',
//       },
//       {
//         protocol: 'https',
//         hostname: 'images.pexels.com',
//         port: '',
//         pathname: '/**',
//       },
//       {
//         protocol: 'https',
//         hostname: 'picsum.photos',
//         port: '',
//         pathname: '/**',
//       },
//       {
//         protocol: 'https',
//         hostname: '*.supabase.co',
//         port: '',
//         pathname: '/storage/v1/object/public/**',
//       },
//       {
//         protocol: 'https',
//         hostname: '*.supabase.co',
//         port: '',
//         pathname: '/storage/v1/object/sign/**',
//       },
//       // Add Firebase Storage domains
//       {
//         protocol: 'https',
//         hostname: '*.firebasestorage.googleapis.com',
//         port: '',
//         pathname: '/**',
//       },
//       {
//         protocol: 'https',
//         hostname: 'firebasestorage.googleapis.com',
//         port: '',
//         pathname: '/**',
//       }
//     ],
//   },

//   // Compression for better performance
//   compress: true,
  
//   // Power by header removal for security
//   poweredByHeader: false,

//   // Enable experimental features for better performance
//   experimental: {
//     optimizePackageImports: ['framer-motion', 'lucide-react'],
//     turbo: {
//       rules: {
//         '*.svg': {
//           loaders: ['@svgr/webpack'],
//           as: '*.js',
//         },
//       },
//     },
//   },

//   // Webpack optimization
//   webpack: (config, { dev, isServer }) => {
//     if (!dev && !isServer) {
//       // Enable tree shaking
//       config.optimization.usedExports = true;
//       config.optimization.sideEffects = false;
      
//       // Split chunks for better caching
//       config.optimization.splitChunks = {
//         chunks: 'all',
//         cacheGroups: {
//           vendor: {
//             test: /[\\/]node_modules[\\/]/,
//             name: 'vendors',
//             chunks: 'all',
//           },
//           framer: {
//             test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
//             name: 'framer-motion',
//             chunks: 'all',
//             priority: 10,
//           },
//         },
//       };
//     }
//     return config;
//   },

//   // Headers for SEO, security, and performance
//   async headers() {
//     return [
//       {
//         source: '/(.*)',
//         headers: [
//           {
//             key: 'X-Content-Type-Options',
//             value: 'nosniff'
//           },
//           {
//             key: 'Referrer-Policy',
//             value: 'origin-when-cross-origin'
//           },
//           // Add performance headers
//           {
//             key: 'Cache-Control',
//             value: 'public, max-age=31536000, immutable'
//           }
//         ],
//       },
//       {
//         source: '/sitemap.xml',
//         headers: [
//           {
//             key: 'Cache-Control',
//             value: 'public, max-age=86400, stale-while-revalidate'
//           }
//         ]
//       },
//       {
//         source: '/robots.txt',
//         headers: [
//           {
//             key: 'Cache-Control',
//             value: 'public, max-age=86400, stale-while-revalidate'
//           }
//         ]
//       },
//       // Cache static assets
//       {
//         source: '/_next/static/(.*)',
//         headers: [
//           {
//             key: 'Cache-Control',
//             value: 'public, max-age=31536000, immutable'
//           }
//         ]
//       },
//       {
//         source: '/images/(.*)',
//         headers: [
//           {
//             key: 'Cache-Control',
//             value: 'public, max-age=31536000, immutable'
//           }
//         ]
//       }
//     ];
//   },

//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
// };

// export default nextConfig; 


// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization for better SEO and performance
  images: {
    unoptimized: true, // Disable image optimization to avoid Vercel billing issues
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        port: '',
        pathname: '/',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/',
      }
    ],
  },

  // Compression for better performance
  compress: true,
  
  // Power by header removal for security
  poweredByHeader: false,

  // Enable experimental features for better performance (commented out for stable deployment)
  // experimental: {
  //   optimizePackageImports: ['framer-motion', 'lucide-react'],
  // },

  // Headers for SEO and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Removed X-Frame-Options to allow iframe embedding from any domain
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate'
          }
        ]
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate'
          }
        ]
      }
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;