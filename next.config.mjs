import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep config minimal in dev; Turbopack root overrides caused intermittent
  // manifest/chunk resolution errors in local hot-reload sessions.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
