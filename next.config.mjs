import nextIntlPlugin from 'next-intl/plugin';

const withNextIntl = nextIntlPlugin('./i18n.ts');

const nextConfig = {
    // Optimize images
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'randomuser.me',
                port: '',
                pathname: '/api/portraits/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'loremflickr.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'img.youtube.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'cdn.freesound.org',
                port: '',
                pathname: '/**',
            },
            
            // Portfolio hosting platforms
            {
                protocol: 'https',
                hostname: 'i.ytimg.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'img.youtube.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'www.youtube.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'i.vimeocdn.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'vumbnail.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'storage.googleapis.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.amazonaws.com',
                port: '',
                pathname: '/**',
            },
            // Stock media APIs - Pexels
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'www.pexels.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'videos.pexels.com',
                port: '',
                pathname: '/**',
            },
            // Stock media APIs - Pixabay
            {
                protocol: 'https',
                hostname: 'pixabay.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'cdn.pixabay.com',
                port: '',
                pathname: '/**',
            },
            // Avatar generators - DiceBear
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
                port: '',
                pathname: '/**',
            },
            // Video thumbnails - Vimeo (for Pixabay videos)
            {
                protocol: 'https',
                hostname: '*.vimeocdn.com',
                port: '',
                pathname: '/**',
            },
            // Sample videos
            {
                protocol: 'https',
                hostname: 'sample-videos.com',
                port: '',
                pathname: '/**',
            },
            // Getty Images
            {
                protocol: 'https',
                hostname: 'media.gettyimages.com',
                port: '',
                pathname: '/**',
            },
            // Voice over and media sites
            {
                protocol: 'https',
                hostname: 'www.jmcvoiceover.com',
                port: '',
                pathname: '/**',
            },
            // Webflow and website builders
            {
                protocol: 'https',
                hostname: 'cdn.prod.website-files.com',
                pathname: '/**',
            },
            // Local uploads (development and self-hosted)
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/uploads/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'localhost',
                pathname: '/uploads/**',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    // Enable compression
    compress: true,
    // Optimize production builds
    // swcMinify: true, // Removed in Next.js 16 as it's default
    // Enable React strict mode for better performance
    reactStrictMode: true,
    // Enable instrumentation for cache warming on startup
    // instrumentationHook: true, // Now default if instrumentation.ts exists
    // experimental: {
    // },
    // eslint: {
    //     // Temporarily ignore ESLint during production builds so we can focus on runtime issues.
    //     ignoreDuringBuilds: true,
    // },
    // turbo: {
    //     enabled: false,
    // },
    typescript: {
        // Temporarily ignore TypeScript build errors so we can iterate on runtime and
        // server/client boundary issues first. Remove this once types are fixed.
        ignoreBuildErrors: true,
    },
};

export default withNextIntl(nextConfig);
