import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next จะมองหา lockfile ที่ ~/package-lock.json แล้วตี root ผิด
  // ทำให้โฟลเดอร์ public ของแอปนี้ไม่ถูกใช้ → /logo-archd.png ได้ null → Image 400
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
