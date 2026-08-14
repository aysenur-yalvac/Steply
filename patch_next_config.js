const fs = require('fs');
const content = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
`;
fs.writeFileSync('next.config.ts', content, 'utf8');
