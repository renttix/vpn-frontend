import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";

// Define Post type
interface Post {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  mainImage?: {
    asset: {
      url: string;
    };
  };
  categories?: {
    _id: string;
    title: string;
    slug?: {
      current: string;
    };
  }[];
  publishedAt?: string;
}

// Fetch latest Court News posts
async function getLatestCourtNews(): Promise<Post[]> {
  const query = groq`*[_type == "post" && references(*[_type == "category" && title == "Court News"]._id)] | order(publishedAt desc)[0...3]{
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
    console.log("Fetching latest Court News from Sanity...");
    const posts = await client.fetch(query);
    return posts || [];
  } catch (error) {
    console.error("Failed to fetch latest Court News:", error);
    return [];
  }
}

// Assign appropriate tag based on index
function getTagForIndex(index: number): string {
  if (index === 0) return "COURT DECISION";
  if (index === 1) return "VIDEO EVIDENCE";
  if (index === 2) return "LEGAL ANALYSIS";
  return "";
}

export default async function HeroSection() {
  // Fetch the latest Court News posts
  const courtNewsPosts = await getLatestCourtNews();
  
  // Fallback if no posts are found
  if (courtNewsPosts.length === 0) {
    return (
      <section className="bg-vpn-bg dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-headline font-bold text-vpn-blue dark:text-yellow-500 uppercase mb-6 pb-2 border-b border-gray-300 dark:border-gray-700 tracking-wider">
            Latest Court Reports
          </h2>
          <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-500 dark:text-gray-400">No Court News articles available</p>
          </div>
          <div className="text-center mt-8">
            <a 
              className="inline-block bg-vpn-blue text-white font-medium py-2 px-6 rounded hover:bg-opacity-90 transition dark:bg-blue-700" 
              href="/category/court-news"
            >
              View All Court Reports
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-vpn-bg dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-headline font-bold text-vpn-blue dark:text-yellow-500 uppercase mb-6 pb-2 border-b border-gray-300 dark:border-gray-700 tracking-wider">
          Latest Court Reports
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courtNewsPosts.map((post, index) => {
            const categorySlug = post.categories && post.categories.length > 0 && post.categories[0].slug
              ? post.categories[0].slug.current
              : "court-news";
                
            return (
              <div key={post._id} className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <article className="group relative">
                  <a className="block overflow-hidden" href={`/${post.slug.current}`}>
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img 
                        alt={post.title} 
                        loading="lazy" 
                        decoding="async" 
                        data-nimg="fill" 
                        className="object-cover transition-transform duration-300 group-hover:scale-105" 
                        style={{position: 'absolute', height: '100%', width: '100%', left: 0, top: 0, right: 0, bottom: 0, color: 'transparent'}} 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                        src={post.mainImage?.asset.url || "/images/placeholder-news.jpg"}
                      />
                    </div>
                    <span className="absolute top-0 left-0 bg-vpn-red text-white text-xs px-2 py-1 uppercase font-bold">
                      {getTagForIndex(index)}
                    </span>
                  </a>
                  <div className="mt-3">
                    <a className="uppercase text-xs font-bold text-vpn-blue dark:text-blue-400 mb-1 block transition-colors duration-200" href="/category/court-news">
                      COURT NEWS
                    </a>
                    <a className="group" href={`/${post.slug.current}`}>
                      <h2 className="font-headline font-bold text-vpn-gray dark:text-gray-100 text-base md:text-lg leading-tight group-hover:text-vpn-blue dark:group-hover:text-yellow-500 transition-colors duration-200 mb-2">
                        {post.title}
                      </h2>
                    </a>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-8">
          <a 
            className="inline-block bg-vpn-blue text-white font-medium py-2 px-6 rounded hover:bg-opacity-90 transition dark:bg-blue-700" 
            href="/category/court-news"
          >
            View All Court Reports
          </a>
        </div>
      </div>
    </section>
  );
}
