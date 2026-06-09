/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The content library lives outside the app (../content). It is read at
  // build/request time by lib/content. Nothing is copied into the app.
};

export default nextConfig;
