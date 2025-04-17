import { MetadataRoute } from 'next';
export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/_next/',
        '/private/',
      ],
    },
    sitemap: [
      'https://www.vpnnews.co.uk/sitemap.xml',
      'https://www.vpnnews.co.uk/news-sitemap.xml',
    ],
    host: 'https://www.vpnnews.co.uk',
  };
}
