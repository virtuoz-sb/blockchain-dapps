const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  experimental: {
    images: {
      unoptimized: true,
    },
  },
  pageExtensions: ['ts', 'tsx', 'js', 'jsx']
    .map(extension => {
      const isProd = process.env.NODE_ENV === 'production';

      // only build pages that DO NOT have the .hidden in page filename
      const visibleExtension = `(?<!hidden\.)${extension}`;

      return isProd ? visibleExtension : extension;
    })
    .flat(),
  reactStrictMode: true,
};

module.exports = withBundleAnalyzer(nextConfig);
