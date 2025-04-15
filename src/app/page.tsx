import Layout from "@/components/layout/Layout";
import HeadlinesSection from "@/components/layout/HeadlinesSection";
import HeroSection from "@/components/layout/HeroSection";
import LatestArticles from "@/components/layout/LatestArticles";
import TabbedLatestArticles from "@/components/layout/TabbedLatestArticles";
import CheatSheet from "@/components/layout/CheatSheet";
import HomeJsonLd from "@/components/seo/HomeJsonLd";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import LatestNewsSection from "@/components/layout/LatestNewsSection";
import PopularStoriesList from "@/components/layout/PopularStoriesList";
import { client } from "@/lib/sanity.client"; // Import the client
import { groq } from "next-sanity"; // Import groq
import { Metadata } from 'next';
import { defaultMetadata } from '@/lib/metadata';

// Import types from sanity.ts
import { Post, Category } from "@/types/sanity";

// Define metadata for the home page
export const metadata: Metadata = {
  ...defaultMetadata,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    ...defaultMetadata.openGraph,
    url: '/',
  }
};

// Fetch categories
async function getCategories(): Promise<Category[]> {
  const query = groq`*[_type == "category"]{
    _id,
    title,
    slug
  }`;
  // Add error handling for the fetch
  try {
    console.log("Fetching categories from Sanity...");
    const categories = await client.fetch(query, {}, {
      // Add cache: false to ensure fresh data during development
      cache: 'no-store'
    });
    console.log("Fetched categories:", categories?.length || 0);
    return categories || []; // Return empty array if fetch returns null/undefined
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    // Return some default categories to prevent UI failures
    return [
      { _id: 'default-news', title: 'News', slug: { current: 'news', _type: 'slug' } },
      { _id: 'default-crime', title: 'Crime News', slug: { current: 'crime-news', _type: 'slug' } },
      { _id: 'default-court', title: 'Court News', slug: { current: 'court-news', _type: 'slug' } },
      { _id: 'default-commentary', title: 'Legal Commentary', slug: { current: 'legal-commentary', _type: 'slug' } },
      { _id: 'default-watch', title: 'Justice Watch', slug: { current: 'justice-watch', _type: 'slug' } }
    ];
  }
}

// Fetch latest posts for carousel
async function getLatestPosts(): Promise<Post[]> {
  const query = groq`*[_type == "post"] | order(publishedAt desc)[0...4]{
    _id,
    title,
    slug,
    mainImage {
      asset->{
        url
      }
    },
    categories[]->{
      _id,
      title
    }
  }`;
  
  try {
    console.log("Fetching latest posts from Sanity...");
    const posts = await client.fetch(query, {}, {
      // Add cache: false to ensure fresh data during development
      cache: 'no-store'
    });
    console.log("Fetched posts:", posts?.length || 0);
    
    // Check if posts have the expected structure and filter out invalid ones
    if (posts && posts.length > 0) {
      // Log warnings for debugging but don't display them in production
      posts.forEach((post: Post, index: number) => {
        if (!post.mainImage || !post.mainImage.asset || !post.mainImage.asset.url) {
          console.warn(`Post ${index} (${post.title || 'null'}) is missing mainImage.asset.url`);
        }
        if (!post.categories || post.categories.length === 0) {
          console.warn(`Post ${index} (${post.title || 'null'}) has no categories`);
        }
      });
      
      // Filter out posts with missing required data
      const validPosts = posts.filter((post: Post) => {
        // Ensure post has a title
        if (!post.title) return false;
        
        // Ensure post has a valid mainImage
        if (!post.mainImage || !post.mainImage.asset || !post.mainImage.asset.url) {
          // Add a placeholder image for posts without images
          post.mainImage = {
            asset: {
              url: '/images/placeholder-news.jpg'
            }
          };
        }
        
        // Ensure post has categories
        if (!post.categories || post.categories.length === 0) {
          // Add a default category for posts without categories
          post.categories = [{
            _id: 'default-news',
            title: 'News',
            slug: { current: 'news', _type: 'slug' }
          }];
        }
        
        return true;
      });
      
      return validPosts;
    } else {
      console.warn("No posts returned from Sanity");
      return []; // Return empty array if no posts
    }
  } catch (error) {
    console.error("Failed to fetch latest posts:", error);
    // Return some default posts to prevent UI failures
    return [
      {
        _id: 'default-post-1',
        title: 'Sample Article 1',
        slug: { current: 'sample-article-1', _type: 'slug' },
        publishedAt: new Date().toISOString()
      },
      {
        _id: 'default-post-2',
        title: 'Sample Article 2',
        slug: { current: 'sample-article-2', _type: 'slug' },
        publishedAt: new Date().toISOString()
      }
    ];
  }
}

// Fetch latest crime news posts
async function getLatestCrimeNews(): Promise<Post[]> {
  const query = groq`*[_type == "post" && references(*[_type == "category" && title == "Crime News"]._id)] | order(publishedAt desc)[0...3]{
    _id,
    title,
    slug,
    mainImage {
      asset->{
        url
      }
    },
    categories[]->{
      _id,
      title
    },
    excerpt,
    isBreakingNews
  }`;
  
  try {
    console.log("Fetching latest crime news from Sanity...");
    const posts = await client.fetch(query, {}, {
      // Add cache: false to ensure fresh data during development
      cache: 'no-store'
    });
    console.log("Fetched crime news posts:", posts?.length || 0);
    
    // Check if posts have the expected structure and filter out invalid ones
    if (posts && posts.length > 0) {
      // Filter out posts with missing required data
      const validPosts = posts.filter((post: Post) => {
        // Ensure post has a title
        if (!post.title) return false;
        
        // Ensure post has a valid mainImage
        if (!post.mainImage || !post.mainImage.asset || !post.mainImage.asset.url) {
          // Add a placeholder image for posts without images
          post.mainImage = {
            asset: {
              url: '/images/placeholder-news.jpg'
            }
          };
        }
        
        // Ensure post has categories
        if (!post.categories || post.categories.length === 0) {
          // Add a default category for posts without categories
          post.categories = [{
            _id: 'default-crime',
            title: 'Crime News',
            slug: { current: 'crime-news', _type: 'slug' }
          }];
        }
        
        return true;
      });
      
      return validPosts;
    } else {
      console.warn("No crime news posts returned from Sanity");
      return []; // Return empty array if no posts
    }
  } catch (error) {
    console.error("Failed to fetch latest crime news:", error);
    // Return some default crime news posts to prevent UI failures
    return [
      {
        _id: 'default-crime-1',
        title: 'Sample Crime Article 1',
        slug: { current: 'sample-crime-article-1', _type: 'slug' },
        excerpt: 'This is a sample crime news article to display when Sanity connection fails.',
        isBreakingNews: true,
        publishedAt: new Date().toISOString()
      },
      {
        _id: 'default-crime-2',
        title: 'Sample Crime Article 2',
        slug: { current: 'sample-crime-article-2', _type: 'slug' },
        excerpt: 'Another sample crime news article for fallback display.',
        isBreakingNews: false,
        publishedAt: new Date().toISOString()
      }
    ];
  }
}

// Fetch latest news posts (excluding those shown in Headlines)
async function getLatestNewsPosts(headlinesCount: number = 6): Promise<Post[]> {
  const query = groq`*[_type == "post"] | order(publishedAt desc)[${headlinesCount}...${headlinesCount + 24}]{
    _id,
    title,
    slug,
    mainImage {
      asset->{
        url
      }
    },
    categories[]->{
      _id,
      title,
      slug
    },
    author->{
      _id,
      name,
      slug
    },
    publishedAt,
    excerpt,
    body
  }`;
  
  try {
    console.log("Fetching latest news posts from Sanity...");
    const posts = await client.fetch(query, {}, {
      // Add cache: false to ensure fresh data during development
      cache: 'no-store'
    });
    console.log("Fetched latest news posts:", posts?.length || 0);
    
    // Check if posts have the expected structure and filter out invalid ones
    if (posts && posts.length > 0) {
      // Filter out posts with missing required data
      const validPosts = posts.filter((post: Post) => {
        // Ensure post has a title
        if (!post.title) return false;
        
        // Ensure post has a valid mainImage
        if (!post.mainImage || !post.mainImage.asset || !post.mainImage.asset.url) {
          // Add a placeholder image for posts without images
          post.mainImage = {
            asset: {
              url: '/images/placeholder-news.jpg'
            }
          };
        }
        
        // Ensure post has categories
        if (!post.categories || post.categories.length === 0) {
          // Add a default category for posts without categories
          post.categories = [{
            _id: 'default-news',
            title: 'News',
            slug: { current: 'news', _type: 'slug' }
          }];
        }
        
        return true;
      });
      
      return validPosts;
    } else {
      console.warn("No latest news posts returned from Sanity");
      return []; // Return empty array if no posts
    }
  } catch (error) {
    console.error("Failed to fetch latest news posts:", error);
    // Return some default news posts to prevent UI failures
    return Array(12).fill(0).map((_, i) => ({
      _id: `default-news-${i+1}`,
      title: `Sample News Article ${i+1}`,
      slug: { current: `sample-news-article-${i+1}`, _type: 'slug' },
      excerpt: `This is a sample news article ${i+1} to display when Sanity connection fails.`,
      publishedAt: new Date().toISOString()
    }));
  }
}

// Fetch latest posts for tabbed section
async function getLatestPostsForTabs(count: number = 6): Promise<Post[]> {
  const query = groq`*[_type == "post"] | order(publishedAt desc)[0...${count}]{
    _id,
    title,
    slug,
    mainImage {
      asset->{
        url
      }
    },
    categories[]->{
      _id,
      title,
      slug
    },
    publishedAt
  }`;
  
  try {
    console.log("Fetching latest posts for tabs from Sanity...");
    const posts = await client.fetch(query, {}, {
      // Add cache: false to ensure fresh data during development
      cache: 'no-store'
    });
    console.log("Fetched posts for tabs:", posts?.length || 0);
    
    // Check if posts have the expected structure and filter out invalid ones
    if (posts && posts.length > 0) {
      // Filter out posts with missing required data
      const validPosts = posts.filter((post: Post) => {
        // Ensure post has a title
        if (!post.title) return false;
        
        // Ensure post has a valid mainImage
        if (!post.mainImage || !post.mainImage.asset || !post.mainImage.asset.url) {
          // Add a placeholder image for posts without images
          post.mainImage = {
            asset: {
              url: '/images/placeholder-news.jpg'
            }
          };
        }
        
        // Ensure post has categories
        if (!post.categories || post.categories.length === 0) {
          // Add a default category for posts without categories
          post.categories = [{
            _id: 'default-news',
            title: 'News',
            slug: { current: 'news', _type: 'slug' }
          }];
        }
        
        return true;
      });
      
      return validPosts;
    } else {
      console.warn("No posts for tabs returned from Sanity");
      return []; // Return empty array if no posts
    }
  } catch (error) {
    console.error("Failed to fetch latest posts for tabs:", error);
    // Return some default posts to prevent UI failures
    return Array(count).fill(0).map((_, i) => ({
      _id: `default-tab-post-${i+1}`,
      title: `Sample Tab Article ${i+1}`,
      slug: { current: `sample-tab-article-${i+1}`, _type: 'slug' },
      publishedAt: new Date().toISOString()
    }));
  }
}

// Fetch latest posts by category
async function getLatestPostsByCategory(categoryTitle: string, count: number = 6): Promise<Post[]> {
  const query = groq`*[_type == "post" && references(*[_type == "category" && title == $categoryTitle]._id)] | order(publishedAt desc)[0...${count}]{
    _id,
    title,
    slug,
    mainImage {
      asset->{
        url
      }
    },
    categories[]->{
      _id,
      title,
      slug
    },
    publishedAt
  }`;
  
  try {
    console.log(`Fetching latest ${categoryTitle} posts from Sanity...`);
    const posts = await client.fetch(query, { categoryTitle }, {
      // Add cache: false to ensure fresh data during development
      cache: 'no-store'
    });
    console.log(`Fetched ${categoryTitle} posts:`, posts?.length || 0);
    
    // Check if posts have the expected structure and filter out invalid ones
    if (posts && posts.length > 0) {
      // Filter out posts with missing required data
      const validPosts = posts.filter((post: Post) => {
        // Ensure post has a title
        if (!post.title) return false;
        
        // Ensure post has a valid mainImage
        if (!post.mainImage || !post.mainImage.asset || !post.mainImage.asset.url) {
          // Add a placeholder image for posts without images
          post.mainImage = {
            asset: {
              url: '/images/placeholder-news.jpg'
            }
          };
        }
        
        // Ensure post has categories
        if (!post.categories || post.categories.length === 0) {
          // Add a default category for posts without categories
          post.categories = [{
            _id: `default-${categoryTitle.toLowerCase().replace(/\s+/g, '-')}`,
            title: categoryTitle,
            slug: { current: categoryTitle.toLowerCase().replace(/\s+/g, '-'), _type: 'slug' }
          }];
        }
        
        return true;
      });
      
      return validPosts;
    } else {
      console.warn(`No ${categoryTitle} posts returned from Sanity`);
      return []; // Return empty array if no posts
    }
  } catch (error) {
    console.error(`Failed to fetch latest ${categoryTitle} posts:`, error);
    // Return some default posts to prevent UI failures
    return Array(count).fill(0).map((_, i) => ({
      _id: `default-${categoryTitle.toLowerCase().replace(/\s+/g, '-')}-${i+1}`,
      title: `Sample ${categoryTitle} Article ${i+1}`,
      slug: { current: `sample-${categoryTitle.toLowerCase().replace(/\s+/g, '-')}-article-${i+1}`, _type: 'slug' },
      publishedAt: new Date().toISOString()
    }));
  }
}

export default async function Home() { // Make the component async
  const categories = await getCategories(); // Fetch categories
  const latestPosts = await getLatestPosts(); // Fetch latest posts for carousel
  const latestCrimeNews = await getLatestCrimeNews(); // Fetch latest crime news posts
  const latestNewsPosts = await getLatestNewsPosts(6); // Fetch latest news posts (after headlines)
  
  // Fetch data for tabbed latest articles section
  const allLatestPosts = await getLatestPostsForTabs(6);
  const latestCrimePosts = await getLatestPostsByCategory("Crime News", 6);
  const latestCourtPosts = await getLatestPostsByCategory("Court News", 6);
  const latestCommentaryPosts = await getLatestPostsByCategory("Legal Commentary", 6);

  return (
    // Pass categories to Layout
    <Layout categories={categories}>
      <HomeJsonLd />
      <OrganizationJsonLd />

      <HeadlinesSection />
      
      {/* Latest News Section */}
      <LatestNewsSection posts={latestNewsPosts} />
      
      {/* Latest Court Reports Section */}
      <HeroSection />

      {/* Spacer */}
      <div className="container mx-auto px-4 pt-8">
        <div className="mb-8"></div>
      </div>

      {/* Tabbed Latest Articles Section */}
      <div className="container mx-auto px-4 mb-8">
        <TabbedLatestArticles 
          allPosts={allLatestPosts}
          crimePosts={latestCrimePosts}
          courtPosts={latestCourtPosts}
          commentaryPosts={latestCommentaryPosts}
        />
      </div>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 pb-8"> {/* Changed py-8 to pb-8 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="content-section">
              <LatestArticles />
            </div>

            {/* Popular Stories Section */}
            <div className="content-section mt-8">
              <PopularStoriesList />
            </div>

            {/* Spacer */}
            <div className="mt-8"></div>
          </div>

          <div className="md:col-span-1">
            <CheatSheet />

            <div className="content-section p-4 mt-8">
              <h3 className="font-bold text-lg mb-2">Newsletter</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Get caught up in minutes with our speedy summary of today's must-read stories.
              </p>

              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-sm"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-vpn-blue text-white font-bold py-2 px-4 rounded text-sm hover:bg-opacity-90"
                >
                  SUBSCRIBE
                </button>
              </form>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                By subscribing, you agree to our Terms of Use and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
