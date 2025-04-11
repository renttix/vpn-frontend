import React from "react";
import Link from "next/link";
import { client } from "@/lib/sanity.client";
import { groq } from "next-sanity";

interface Author {
  name?: string;
}

interface LegalCommentaryItem {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  author?: Author;
  categories?: {
    title: string;
  }[];
}

// Fetch Legal Commentary posts from Sanity
async function getLegalCommentaryPosts(): Promise<LegalCommentaryItem[]> {
  const query = groq`*[_type == "post" && references(*[_type == "category" && title == "Legal Commentary"]._id)] | order(publishedAt desc)[0...5]{
    _id,
    title,
    slug,
    author->{
      name
    },
    categories[]->{
      title
    }
  }`;
  
  try {
    const posts = await client.fetch(query);
    return posts || [];
  } catch (error) {
    console.error("Failed to fetch Legal Commentary posts:", error);
    return [];
  }
}

export default async function CheatSheet() {
  // Fetch Legal Commentary posts
  const legalCommentaryPosts = await getLegalCommentaryPosts();
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-headline font-bold text-vpn-blue dark:text-yellow-500 text-xl uppercase tracking-wider">Legal Commentary</h2>
        <p className="text-sm text-vpn-gray dark:text-gray-400 mt-1">Expert Analysis & Opinion</p>
      </div>

      <ul className="space-y-4">
        {legalCommentaryPosts.length > 0 ? (
          legalCommentaryPosts.map((post) => (
            <li key={post._id} className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
              <Link href={`/${post.slug.current}`} className="group block">
                <div>
                  <h3 className="font-headline font-bold text-sm text-vpn-gray dark:text-gray-100 group-hover:text-vpn-blue dark:group-hover:text-yellow-500 transition-colors duration-200">
                    {post.title}
                  </h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-vpn-blue dark:text-blue-400 font-medium">
                      {post.author?.name || "VPN Staff"}
                    </span>
                    <span className="text-xs text-vpn-red dark:text-red-400 uppercase font-bold">
                      {post.categories && post.categories[0] ? post.categories[0].title.toUpperCase() : "LEGAL"}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))
        ) : (
          // Fallback content if no posts are found
          <li className="text-center py-4 text-vpn-gray dark:text-gray-400">
            <p>No legal commentary articles available</p>
          </li>
        )}
      </ul>

      <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700 text-center">
        <Link
          href="/category/legal-commentary"
          className="text-sm font-medium text-vpn-blue dark:text-blue-400 hover:text-opacity-80 dark:hover:text-yellow-500 transition-colors duration-200"
        >
          View All Commentary
        </Link>
      </div>
    </div>
  );
}
