import { client } from "@/lib/sanity.client";
export const dynamic = 'force-dynamic';
import { groq } from "next-sanity";

// Define the post type for news sitemap
interface NewsPost {
  title: string;
  slug: string;
  publishedAt: string;
  categories?: string[];
  mainImage?: {
    asset: {
      url: string;
      alt?: string;
    };
  };
}

export async function GET() {
  try {
    const posts = await client.fetch<NewsPost[]>(
      groq`*[_type == "post"] | order(publishedAt desc)[0...1000]{
        title,
        "slug": slug.current,
        publishedAt,
        "categories": categories[]->title,
        mainImage {
          asset->{
            "url": url,
            "alt": alt
          },
          alt
        }
      }`
    );
    
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
            xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
      ${posts.map((post: NewsPost) => `
        <url>
          <loc>https://vpnnews.com/${post.slug}</loc>
          <news:news>
            <news:publication>
              <news:name>Video Production News</news:name>
              <news:language>en</news:language>
            </news:publication>
            <news:publication_date>${new Date(post.publishedAt).toISOString()}</news:publication_date>
            <news:title><![CDATA[${post.title}]]></news:title>
            ${post.categories && post.categories.length > 0 ? `<news:keywords>${post.categories.join(', ')}</news:keywords>` : ''}
          </news:news>
          ${post.mainImage?.asset?.url ? `
          <image:image>
            <image:loc>${post.mainImage.asset.url}</image:loc>
            <image:title>${post.title}</image:title>
            ${post.mainImage.asset.alt ? `<image:caption>${post.mainImage.asset.alt}</image:caption>` : ''}
          </image:image>
          ` : ''}
        </url>
      `).join('')}
    </urlset>`;
    
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error("Error generating news sitemap:", error);
    return new Response("Error generating news sitemap", { status: 500 });
  }
}
