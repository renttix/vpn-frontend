import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";

// Define the post type for RSS feed
interface RssPost {
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
  categories?: string[];
  author?: string;
}

export async function GET() {
  try {
    const posts = await client.fetch<RssPost[]>(
      groq`*[_type == "post"] | order(publishedAt desc)[0...50]{
        title,
        "slug": slug.current,
        publishedAt,
        excerpt,
        "categories": categories[]->title,
        "author": author->name
      }`
    );
    
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <channel>
        <title>Video Production News</title>
        <link>https://vpnnews.com</link>
        <description>Reporting the Truth from the Courtroom Out</description>
        <language>en</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${posts.map((post: RssPost) => `
          <item>
            <title><![CDATA[${post.title}]]></title>
            <link>https://vpnnews.com/${post.slug}</link>
            <guid>https://vpnnews.com/${post.slug}</guid>
            <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
            <description><![CDATA[${post.excerpt || ''}]]></description>
            ${post.categories && post.categories.length > 0 ? `<category>${post.categories[0]}</category>` : ''}
            <dc:creator><![CDATA[${post.author || 'VPN Editorial Team'}]]></dc:creator>
          </item>
        `).join('')}
      </channel>
    </rss>`;
    
    return new Response(rss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return new Response("Error generating RSS feed", { status: 500 });
  }
}
