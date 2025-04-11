import React from 'react';
import { Post } from '@/types/sanity';
import { getRelatedArticles } from '@/lib/articles';

interface AmpArticleProps {
  article: Post;
  canonicalUrl: string;
}

export default function AmpArticle({ article, canonicalUrl }: AmpArticleProps) {
  // Get related articles
  const relatedArticles = article._id ? getRelatedArticles(article._id) : [];
  // Format the date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  // Get the category name if available
  const categoryName = article.categories && article.categories.length > 0
    ? article.categories[0].title
    : "News";

  // Get the author name if available
  const authorName = article.author?.name || "VPN Editorial Team";

  // Convert Portable Text to plain text (simplified version)
  const getPlainText = (blocks: any[] = []) => {
    return blocks
      .filter(block => block._type === 'block' && block.children)
      .map(block => 
        block.children
          .filter((child: any) => child._type === 'span')
          .map((span: any) => span.text)
          .join('')
      )
      .join('\n\n');
  };

  // Extract plain text content from the article body
  const articleContent = article.body ? getPlainText(article.body) : '';

  return (
    <html amp="true" lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
        <link rel="canonical" href={canonicalUrl} />
        <title>{article.title} | Video Production News</title>
        
        {/* AMP boilerplate */}
        <style amp-boilerplate>{`body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`}</style>
        <noscript>
          <style amp-boilerplate>{`body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}`}</style>
        </noscript>
        
        {/* AMP runtime script */}
        <script async src="https://cdn.ampproject.org/v0.js"></script>
        
        {/* AMP components */}
        <script async custom-element="amp-social-share" src="https://cdn.ampproject.org/v0/amp-social-share-0.1.js"></script>
        
        {/* Custom styles */}
        <style amp-custom>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 16px;
          }
          header {
            margin-bottom: 24px;
            text-align: center;
          }
          .logo {
            max-width: 200px;
            margin-bottom: 16px;
          }
          h1 {
            font-size: 28px;
            line-height: 1.2;
            margin-bottom: 16px;
          }
          .meta {
            font-size: 14px;
            color: #666;
            margin-bottom: 24px;
          }
          .category {
            display: inline-block;
            background-color: #1e40af;
            color: white;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-right: 8px;
          }
          .featured-image {
            margin-bottom: 24px;
          }
          .article-content {
            margin-bottom: 32px;
          }
          .social-share {
            display: flex;
            justify-content: center;
            margin-bottom: 32px;
          }
          .social-share > * {
            margin: 0 4px;
          }
          footer {
            border-top: 1px solid #eee;
            padding-top: 16px;
            font-size: 14px;
            color: #666;
            text-align: center;
          }
        `}</style>
      </head>
      <body>
        <header>
          <a href="https://vpnnews.com">
            <amp-img
              src="https://cdn.sanity.io/images/g7f0f6rs/production/7c647c54f6f6997b2d1ae4301f5b9bac3587b478-1000x525.jpg"
              width="200"
              height="40"
              layout="responsive"
              alt="Video Production News"
              class="logo"
            ></amp-img>
          </a>
        </header>
        
        <main>
          <article>
            <h1>{article.title}</h1>
            
            <div className="meta">
              <span className="category">{categoryName}</span>
              <span>By {authorName}</span>
              {article.publishedAt && (
                <span> • {formatDate(article.publishedAt)}</span>
              )}
            </div>
            
            {article.mainImage?.asset?.url && (
              <div className="featured-image">
                <amp-img
                  src={article.mainImage.asset.url}
                  width="800"
                  height="450"
                  layout="responsive"
                  alt={article.mainImage.asset.alt || article.title}
                ></amp-img>
                {/* Caption is conditionally rendered if available */}
                {article.mainImage?.caption && (
                  <figcaption className="text-sm text-gray-600 mt-2">
                    {article.mainImage.caption}
                    {article.mainImage?.attribution && <span className="text-gray-500"> • {article.mainImage.attribution}</span>}
                  </figcaption>
                )}
              </div>
            )}
            
            <div className="article-content">
              {articleContent.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            
            {/* Related Articles Section */}
            {relatedArticles.length > 0 && (
              <div className="related-articles" style={{
                marginBottom: '32px',
                padding: '16px',
                border: '1px solid #eee',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '16px'
                }}>Related Stories</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {relatedArticles.map((relatedArticle) => (
                    <div key={relatedArticle.id} style={{ display: 'flex', gap: '12px' }}>
                      {relatedArticle.imageUrl && (
                        <div style={{ flexShrink: 0 }}>
                          <a href={`https://vpnnews.com/${relatedArticle.slug}`}>
                            <amp-img
                              src={relatedArticle.imageUrl}
                              width="80"
                              height="45"
                              alt={relatedArticle.title}
                              layout="fixed"
                            ></amp-img>
                          </a>
                        </div>
                      )}
                      
                      <div style={{ flex: 1 }}>
                        <a 
                          href={`https://vpnnews.com/${relatedArticle.slug}`}
                          style={{
                            fontWeight: 'medium',
                            fontSize: '14px',
                            color: '#333',
                            textDecoration: 'none'
                          }}
                        >
                          {relatedArticle.title}
                        </a>
                        {relatedArticle.excerpt && (
                          <p style={{
                            fontSize: '12px',
                            color: '#666',
                            margin: '4px 0'
                          }}>
                            {relatedArticle.excerpt}
                          </p>
                        )}
                        <p style={{
                          fontSize: '12px',
                          color: '#888',
                          margin: '4px 0 0 0'
                        }}>
                          {relatedArticle.author}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="social-share">
              <amp-social-share type="twitter" width="40" height="40"></amp-social-share>
              <amp-social-share type="facebook" width="40" height="40"></amp-social-share>
              <amp-social-share type="linkedin" width="40" height="40"></amp-social-share>
              <amp-social-share type="email" width="40" height="40"></amp-social-share>
            </div>
          </article>
        </main>
        
        <footer>
          <p>&copy; {new Date().getFullYear()} Video Production News. All rights reserved.</p>
          <p>
            <a href="https://vpnnews.com/terms-of-use">Terms of Use</a> | 
            <a href="https://vpnnews.com/privacy-policy">Privacy Policy</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
