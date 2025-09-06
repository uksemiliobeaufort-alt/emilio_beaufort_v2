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
  // Enable image optimization for better performance
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache for better performance
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    loader: 'default',
    path: '/_next/image',
    domains: [],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/" },
      { protocol: "https", hostname: "plus.unsplash.com", pathname: "/" },
      { protocol: "https", hostname: "images.pexels.com", pathname: "/" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/" },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/sign/**",
      },
      // Add specific Supabase project domains (common patterns)
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/sign/**",
      },
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/**" },
      { protocol: "https", hostname: "*.firebasestorage.googleapis.com", pathname: "/**" },
    ],
  },

  // Compression for better performance
  compress: true,

  // Power by header removal for security
  poweredByHeader: false,

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react", "react-fast-marquee"],
    optimizeCss: true,
  },

  // Turbopack configuration (moved from experimental)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Enable tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Bundle analyzer (uncomment to analyze bundles)
      // if (process.env.ANALYZE === 'true') {
      //   const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      //   config.plugins.push(
      //     new BundleAnalyzerPlugin({
      //       analyzerMode: 'server',
      //       openAnalyzer: true,
      //     })
      //   );
      // }

      // Enhanced split chunks for better caching and smaller bundles
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          // React and React DOM
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: "react",
            chunks: "all",
            priority: 20,
          },
          // Framer Motion
          framer: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: "framer-motion",
            chunks: "all",
            priority: 15,
          },
          // Firebase
          firebase: {
            test: /[\\/]node_modules[\\/]@firebase[\\/]/,
            name: "firebase",
            chunks: "all",
            priority: 12,
          },
          // UI Libraries
          ui: {
            test: /[\\/]node_modules[\\/](lucide-react|sonner|react-hot-toast)[\\/]/,
            name: "ui-libs",
            chunks: "all",
            priority: 10,
          },
          // Other vendors
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 5,
          },
        },
      };

      // Enable module concatenation
      config.optimization.concatenateModules = true;
    }

    return config;
  },

  // Headers for SEO, security, and performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Robots-Tag", value: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
        ],
      },
      {
        source: "/_next/image(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Vary", value: "Accept" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate" },
          { key: "Content-Type", value: "application/xml" },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate" },
          { key: "Content-Type", value: "text/plain" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/images/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
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