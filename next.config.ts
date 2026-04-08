import type { NextConfig } from "next";

const nextConfig = {
  /**
   * public 下作品集素材（PDF/视频/大图等）体积可达数百 MB。
   * 这些文件应由 CDN 静态提供，不能被打进 Serverless Function，否则会触发 Vercel 250MB 上限。
   * @see https://vercel.com/guides/troubleshooting-function-250mb-limit
   */
  outputFileTracingExcludes: {
    "*": ["./public/**/*", "public/**/*"],
  },
} satisfies NextConfig;

export default nextConfig;
