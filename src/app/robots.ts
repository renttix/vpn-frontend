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
      'https://vpnnews.com/sitemap.xml',
      'https://vpnnews.com/news-sitemap.xml',
      'https://vpnnews.com/image-sitemap.xml',
    ],
    host: 'https://vpnnews.com',
  };
}
