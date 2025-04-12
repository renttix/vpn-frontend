import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";
export const dynamic = 'force-dynamic';

// Define the image type for sitemap
interface ImageData {
  url: string;
  title: string;
  caption?: string;
  articleSlug: string;
  articleTitle: string;
  publishedAt: string;
  license?: string;
  geoLocation?: string;
}

// Default license for images
const DEFAULT_LICENSE = "https://creativecommons.org/licenses/by/4.0/";

export async function GET(request: Request) {
  // Get page number from URL query parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 1000; // Google recommends max 1000 URLs per sitemap
  const skip = (page - 1) * pageSize;
  try {
    // Query all articles with images (both main images and inline images)
    const articlesWithImages = await client.fetch<any[]>(
      groq`*[_type == "post"] | order(publishedAt desc) {
        title,
        "slug": slug.current,
        publishedAt,
        mainImage {
          asset->{
            "url": url,
            "alt": alt
          },
          alt
        },
        // Extract images from the body content
        "bodyImages": body[]{
          _type == "image" => {
            "url": asset->url,
            "alt": asset->alt
          }
        }
      }`
    );
    
    // Format the data for the sitemap
    const images: ImageData[] = [];
    
    // Process each article
    articlesWithImages.forEach(article => {
      // Add main image if it exists
      if (article.mainImage?.asset?.url) {
        images.push({
          url: article.mainImage.asset.url,
          title: article.title,
          caption: article.mainImage.asset.alt || article.mainImage.alt || article.title,
          articleSlug: article.slug,
          articleTitle: article.title,
          publishedAt: article.publishedAt,
          license: DEFAULT_LICENSE,
          // Add geo_location if available in the future
          geoLocation: article.mainImage.geoLocation || undefined
        });
      }
      
      // Add body images if they exist
      if (article.bodyImages) {
        article.bodyImages.forEach((img: any, index: number) => {
          if (img && img.url) {
            images.push({
              url: img.url,
              title: `${article.title} - Image ${index + 1}`,
              caption: img.alt || `Image ${index + 1} from ${article.title}`,
              articleSlug: article.slug,
              articleTitle: article.title,
              publishedAt: article.publishedAt,
              license: DEFAULT_LICENSE,
              // Add geo_location if available in the future
              geoLocation: img.geoLocation || undefined
            });
          }
        });
      }
    });
    
    // Apply pagination
    const totalImages = images.length;
    const totalPages = Math.ceil(totalImages / pageSize);
    const paginatedImages = images.slice(skip, skip + pageSize);
    
    // If page 1 is requested and there are multiple pages, return a sitemap index
    if (page === 1 && totalPages > 1) {
      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => `
          <sitemap>
            <loc>https://vpnnews.com/image-sitemap.xml?page=${pageNum}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
          </sitemap>
        `).join('')}
      </sitemapindex>`;
      
      return new Response(sitemapIndex, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600'
        }
      });
    }
    
    // If the requested page doesn't exist, return a 404
    if (page > totalPages) {
      return new Response("Page not found", { status: 404 });
    }
    
    // Generate the XML sitemap for the requested page
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
      ${paginatedImages.map(image => `
        <url>
          <loc>https://vpnnews.com/${image.articleSlug}</loc>
          <lastmod>${new Date(image.publishedAt).toISOString()}</lastmod>
          <image:image>
            <image:loc>${image.url}</image:loc>
            <image:title><![CDATA[${image.title}]]></image:title>
            <image:caption><![CDATA[${image.caption}]]></image:caption>
            ${image.license ? `<image:license>${image.license}</image:license>` : ''}
            ${image.geoLocation ? `<image:geo_location>${image.geoLocation}</image:geo_location>` : ''}
          </image:image>
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
    console.error("Error generating image sitemap:", error);
    return new Response("Error generating image sitemap", { status: 500 });
  }
}
