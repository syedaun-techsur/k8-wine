// next.config.mjs  — MUST be .mjs, never .ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // SAMEORIGIN allows iframe embedding from same origin (sandbox preview)
          // Never use DENY — app must render inside iframe
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
