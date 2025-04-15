import React from 'react';
import { formatDate, calculateReadingTime } from '@/lib/utils';

// Define the Sanity Article type (or import if defined elsewhere)
interface Article {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: { asset: { url: string; alt?: string } };
  author?: { _id: string; name: string; slug?: { current: string }; bio?: any; image?: { asset: { url: string; alt?: string } } };
  publishedAt: string;
  lastUpdatedAt?: string; // Date when the post was last updated
  body?: any; // Portable Text type
  subtitle?: string;
  categories?: { _id: string; title: string; slug: { current: string } }[];
  tags?: { _id: string; title: string; slug: { current: string } }[];
}

interface AmpArticleContentProps {
  article: Article;
}

// Helper function to extract headings from Portable Text blocks
function extractHeadings(blocks: any[]): { id: string; text: string; level: number }[] {
  if (!blocks || !Array.isArray(blocks)) {
    return [];
  }

  const headings: { id: string; text: string; level: number }[] = [];
  
  blocks.forEach((block, index) => {
    if (block._type === 'block' && ['h2', 'h3', 'h4'].includes(block.style)) {
      const text = block.children
        .map((child: any) => child.text)
        .join('');
      
      // Generate an ID from the heading text
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `heading-${index}`;
      
      // Get heading level from style (h2 -> 2, h3 -> 3, etc.)
      const level = parseInt(block.style.substring(1), 10);
      
      headings.push({ id, text, level });
    }
  });
  
  return headings;
}

// Helper function to convert Portable Text to AMP-compatible HTML
function portableTextToAmpHtml(blocks: any[]): string {
  if (!blocks || !Array.isArray(blocks)) {
    return '<p>Article content is missing.</p>';
  }

  return blocks.map((block) => {
    // Handle different block types
    switch (block._type) {
      case 'block':
        // Handle different block styles
        const style = block.style || 'normal';
        const text = block.children
          .map((child: any) => {
            // Handle marks (formatting)
            let content = child.text;
            if (child.marks && child.marks.length > 0) {
              child.marks.forEach((mark: string) => {
                if (mark === 'strong') {
                  content = `<strong>${content}</strong>`;
                } else if (mark === 'em') {
                  content = `<em>${content}</em>`;
                } else if (mark === 'link' && child.markDefs) {
                  const linkDef = child.markDefs.find((def: any) => def._key === mark);
                  if (linkDef && linkDef.href) {
                    content = `<a href="${linkDef.href}" target="_blank" rel="noopener noreferrer">${content}</a>`;
                  }
                }
              });
            }
            return content;
          })
          .join('');

        // Return the appropriate HTML tag based on block style
        // Add IDs to headings for the table of contents
        switch (style) {
          case 'h1':
            return `<h1>${text}</h1>`;
          case 'h2': {
            const id = text
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '') || `heading-${block._key}`;
            return `<h2 id="${id}">${text}</h2>`;
          }
          case 'h3': {
            const id = text
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '') || `heading-${block._key}`;
            return `<h3 id="${id}">${text}</h3>`;
          }
          case 'h4': {
            const id = text
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '') || `heading-${block._key}`;
            return `<h4 id="${id}">${text}</h4>`;
          }
          case 'blockquote':
            return `<blockquote>${text}</blockquote>`;
          default:
            return `<p>${text}</p>`;
        }

      case 'image':
        if (block.asset && block.asset._ref) {
          // Convert Sanity image reference to URL
          // This is a simplified version - in a real implementation, you'd use Sanity's image URL builder
          const imageUrl = block.asset.url || `/api/sanity/image/${block.asset._ref}`;
          const alt = block.alt || 'Article image';
          return `
            <figure>
              <amp-img
                src="${imageUrl}"
                width="700"
                height="400"
                layout="responsive"
                alt="${alt}"
              ></amp-img>
              ${block.caption ? `<figcaption>${block.caption}</figcaption>` : ''}
            </figure>
          `;
        }
        return '';

      case 'youtube':
        if (block.url) {
          // Extract YouTube video ID from URL
          const getYouTubeId = (url: string) => {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
            const match = url.match(regExp);
            return match && match[2].length === 11 ? match[2] : null;
          };

          const videoId = getYouTubeId(block.url);
          if (videoId) {
            return `
              <amp-youtube
                data-videoid="${videoId}"
                layout="responsive"
                width="480"
                height="270"
              ></amp-youtube>
            `;
          }
        }
        return '';

      default:
        return '';
    }
  }).join('');
}

export default function AmpArticleContent({ article }: AmpArticleContentProps) {
  // Calculate reading time
  const readingTime = article.body ? calculateReadingTime(article.body) : 1;
  
  // Extract headings for table of contents
  const headings = article.body ? extractHeadings(article.body) : [];
  
  // Convert the first paragraph to a lead paragraph
  const leadParagraph = article.body && article.body[0]?.children?.[0]?.text 
    ? `<p class="article-lead">${article.body[0].children[0].text}</p>` 
    : '';

  // Convert the rest of the body to AMP-compatible HTML
  const bodyContent = article.body && article.body.length > 1 
    ? portableTextToAmpHtml(article.body.slice(1)) 
    : '';
    
  // Generate table of contents HTML
  const tocHtml = headings.length >= 4 && article.body && article.body.length > 15
    ? `
      <div class="toc">
        <div class="toc-header">
          <span class="toc-title">Jump to section</span>
        </div>
        <div class="toc-content">
          ${headings.map(heading => 
            `<a href="#${heading.id}" class="toc-item">${heading.text}</a>`
          ).join('')}
        </div>
      </div>
      `
    : '';

  return (
    <article>
      {/* Article Header */}
      <header>
        <h1 className="article-title">{article.title}</h1>

        {article.subtitle && (
          <p className="article-subtitle">{article.subtitle}</p>
        )}

        <div className="article-meta">
          {/* Author */}
          <span>
            By {article.author?.name || 'VPN News Team'}
          </span>
          
          {/* Publication date */}
          <span> • </span>
          <time dateTime={article.publishedAt} itemProp="datePublished">
            {formatDate(article.publishedAt)}
          </time>
          
          {/* Show last updated date if available and different from published date */}
          {article.lastUpdatedAt && new Date(article.lastUpdatedAt).getTime() > new Date(article.publishedAt).getTime() + 86400000 && (
            <>
              <span> • </span>
              <span>
                <time dateTime={article.lastUpdatedAt} itemProp="dateModified">
                  Updated: {formatDate(article.lastUpdatedAt)}
                </time>
              </span>
            </>
          )}
          
          {/* Categories */}
          {article.categories && article.categories.length > 0 && (
            <>
              <span> • </span>
              <span>
                {article.categories.map((category, index) => (
                  <React.Fragment key={category._id}>
                    {index > 0 && ', '}
                    <a href={`/category/${category.slug?.current || ''}`}>
                      {category.title}
                    </a>
                  </React.Fragment>
                ))}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Hero Image */}
      {article.mainImage?.asset?.url && (
        <div className="article-image">
          <amp-img
            src={article.mainImage.asset.url}
            alt={article.mainImage.asset.alt || article.title}
            width="700"
            height="400"
            layout="responsive"
          ></amp-img>
        </div>
      )}

      {/* Accessibility Tools */}
      <div className="accessibility-tools">
        {/* Reading time */}
        <div className="reading-time">
          {readingTime} min read
        </div>
        
        {/* Text-to-Speech button - using dangerouslySetInnerHTML for AMP-specific attributes */}
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <button 
                class="listen-button"
                on="tap:AMP.navigateTo(url='/listen?id=${article._id}')"
                aria-label="Listen to this article"
              >
                Listen to this article
              </button>
            `
          }}
        />
        
        {/* Text Size Controls - using dangerouslySetInnerHTML for AMP-specific attributes */}
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <div class="text-size-controls">
                <span class="text-size-label">Text Size:</span>
                <div class="text-size-buttons">
                  <button 
                    on="tap:AMP.setState({textSize: 'small'})" 
                    class="text-size-button" 
                    [class]="'text-size-button ' + (textSize == 'small' ? 'active' : '')"
                  >A</button>
                  <button 
                    on="tap:AMP.setState({textSize: 'medium'})" 
                    class="text-size-button" 
                    [class]="'text-size-button ' + (textSize == 'medium' ? 'active' : '')"
                  >A</button>
                  <button 
                    on="tap:AMP.setState({textSize: 'large'})" 
                    class="text-size-button" 
                    [class]="'text-size-button ' + (textSize == 'large' ? 'active' : '')"
                  >A</button>
                  <button 
                    on="tap:AMP.setState({textSize: 'x-large'})" 
                    class="text-size-button" 
                    [class]="'text-size-button ' + (textSize == 'x-large' ? 'active' : '')"
                  >A</button>
                </div>
              </div>
            `
          }}
        />
      </div>

      {/* Article Content */}
      <div className="article-content">
        {/* Lead paragraph */}
        <div dangerouslySetInnerHTML={{ __html: leadParagraph }} />
        
        {/* Table of Contents - only for longer articles */}
        {headings.length >= 4 && article.body && article.body.length > 15 && (
          <div dangerouslySetInnerHTML={{ __html: tocHtml }} />
        )}
        
        {/* Rest of the content */}
        <div dangerouslySetInnerHTML={{ __html: bodyContent }} />
      </div>

      {/* Social sharing */}
      <div className="social-share">
        <amp-social-share type="twitter" width="40" height="40"></amp-social-share>
        <amp-social-share type="facebook" width="40" height="40"></amp-social-share>
        <amp-social-share type="linkedin" width="40" height="40"></amp-social-share>
        <amp-social-share type="email" width="40" height="40"></amp-social-share>
      </div>

      {/* Categories - Mobile only */}
      {article.categories && article.categories.length > 0 && (
        <div className="article-categories">
          <h3>Filed Under:</h3>
          <div className="category-tags">
            {article.categories.map((category) => (
              <a
                key={category._id}
                href={`/category/${category.slug?.current || ''}`}
                className="category-tag"
              >
                {category.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
