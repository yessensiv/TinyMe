import type { NextConfig } from "next";
const config: NextConfig = { devIndicators: false, distDir: process.env.TINYME_TEST_BUILD === "1" ? ".next-test" : ".next" };
export default config;
