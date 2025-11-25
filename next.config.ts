import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Some native deps (e.g. node-pre-gyp) ship HTML helpers that Webpack tries to parse; treat them as raw text.
    config.module.rules.push({
      test: /\.html$/,
      type: 'asset/source',
    });

    // Ignore optional/mock AWS deps pulled in by node-pre-gyp (used by bcrypt); they are not needed in this app.
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      'mock-aws-s3': false,
      'aws-sdk': false,
      nock: false,
    };

    return config;
  },
};

export default nextConfig;
