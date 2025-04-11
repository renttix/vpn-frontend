import { notFound } from "next/navigation";
import Layout from "@/components/layout/Layout";
import ArticleContent from "@/components/article/ArticleContent";
import RelatedArticles from "@/components/article/RelatedArticles";
import CommentSection from "@/components/article/CommentSection";
import { getArticleBySlug, ArticleType } from "@/lib/articles";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function ArticlePage({ params }: any) {
  // In a real app, we would fetch article data from an API
  // For now, we'll use our mock data
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  return (
    <Layout categories={[]}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main content area */}
          <div className="md:col-span-2">
            <ArticleContent article={article as any} />
            <CommentSection articleId={article.id} />
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <RelatedArticles currentArticleId={article.id} />

            {/* Newsletter Signup */}
            <div className="bg-white border border-gray-200 p-4 mt-8">
              <h3 className="font-bold text-lg mb-2">Newsletter</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get caught up in minutes with our speedy summary of today's must-read stories.
              </p>

              <form className="space-y-3">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-beast-red text-white font-bold py-2 px-4 rounded text-sm hover:bg-red-700"
                >
                  SUBSCRIBE
                </button>
              </form>

              <p className="text-xs text-gray-500 mt-3">
                By subscribing, you agree to our Terms of Use and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
