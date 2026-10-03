import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90, 100],
  },
  // The old consultation page is gone: every "Закажи консултација" goes to the Контакт page. Query values
  // (project, building, apartment) are passed through, so old links keep their reference.
  redirects() {
    return [{ source: "/consultation", destination: "/contact", permanent: true }];
  },
};

export default nextConfig;
