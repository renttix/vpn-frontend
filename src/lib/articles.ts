export interface ArticleType {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  author: string;
  authorSlug: string;
  date: string;
  imageUrl: string;
  imageAlt?: string;
  excerpt: string;
  content: string[];
  category: string;
  categorySlug: string;
  tags?: string[];
  relatedArticles?: string[];
}

// Sample articles data
const articles: ArticleType[] = [
  {
    id: "cfo-embezzlement",
    title: "Former CFO Charged with Embezzling $5M from Tech Startup",
    subtitle: "Prosecutors allege elaborate accounting schemes were used to hide the theft over three years",
    slug: "cfo-charged-embezzlement",
    author: "Sarah Blackwell",
    authorSlug: "sarah-blackwell",
    date: "2025-03-01T09:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop",
    imageAlt: "Person signing financial documents",
    excerpt: "Prosecutors allege the executive used elaborate accounting schemes to hide the theft over three years.",
    content: [
      "Former Chief Financial Officer James Donovan of rising tech startup TechVision has been charged with embezzling over $5 million from the company over a three-year period, according to court documents filed yesterday.",
      "Donovan, 42, who served as CFO from 2021 until his termination in late 2024, allegedly orchestrated a sophisticated scheme involving falsified financial records, fabricated vendor payments, and offshore accounts to conceal the systematic theft of company funds.",
      "\"This was not a momentary lapse in judgment, but a calculated, long-term criminal operation designed to enrich Mr. Donovan at the expense of the company and its shareholders,\" said District Attorney Eleanor Martinez at a press conference announcing the charges.",
      "According to the indictment, Donovan created a network of shell companies that appeared to provide legitimate services to TechVision. As CFO, he had the authority to approve payments to these vendors without additional oversight for amounts under $250,000.",
      "The scheme began to unravel when a routine audit by the company's new accounting firm flagged unusual payment patterns. An internal investigation followed, eventually leading to Donovan's termination in November 2024 and a referral to law enforcement.",
      "TechVision CEO Michael Chen expressed shock at the allegations. \"James was a trusted member of our executive team who helped guide our financial strategy during a period of rapid growth. These charges, if true, represent an extraordinary breach of trust.\"",
      "The company, which specializes in artificial intelligence solutions for healthcare providers, has reassured investors that the alleged embezzlement, while significant, will not threaten its overall financial stability. TechVision completed a successful Series C funding round of $75 million in January 2025.",
      "Forensic accountants working with prosecutors have traced approximately $3.2 million to accounts directly controlled by Donovan, including property purchases and investments. Authorities believe the remaining funds may be held in accounts overseas.",
      "\"White-collar crime of this magnitude harms not just the immediate victim—the company—but also employees whose jobs and benefits may be affected, investors who trusted in the company's financial statements, and ultimately the public's faith in corporate governance,\" Martinez added.",
      "Donovan's attorney, Patricia Reynolds, issued a brief statement maintaining her client's innocence. \"Mr. Donovan categorically denies these allegations and looks forward to presenting his side of the story in court, not in the media.\"",
      "If convicted on all counts, Donovan faces up to 20 years in prison. He was released on $1 million bail following his arraignment and is scheduled to appear in court again on April 15.",
      "The case highlights the critical importance of financial controls and oversight, particularly in rapidly growing companies where systems may struggle to keep pace with expansion. Corporate governance experts note that the alleged fraud continued despite TechVision having standard financial controls in place.",
      "\"This case demonstrates that even sophisticated companies can be vulnerable to determined insiders with the right access and knowledge,\" said Professor Jonathan Winters, who specializes in corporate governance at State University. \"It's a reminder that oversight needs to evolve as companies grow.\"",
      "TechVision has since implemented additional financial safeguards, including a restructured approval process for vendor payments and enhanced audit procedures.",
    ],
    category: "Crime News",
    categorySlug: "crime-news",
    tags: ["White Collar Crime", "Embezzlement", "Tech Industry", "Corporate Fraud"],
    relatedArticles: ["tech-ceo-testifies-antitrust", "corporate-espionage-trade-secrets", "identity-theft-ring-dismantled"]
  },
  {
    id: "tech-ceo-antitrust",
    title: "Tech CEO Testifies in Landmark Antitrust Case",
    slug: "tech-ceo-testifies-antitrust",
    author: "Michael Torres",
    authorSlug: "michael-torres",
    date: "2025-02-15T14:30:00Z",
    imageUrl: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop",
    imageAlt: "Tech executive testifying in court",
    excerpt: "The high-profile testimony marks a critical moment in the government's case against the tech giant.",
    content: ["This is a sample article content for the Tech CEO Antitrust case."],
    category: "Court News",
    categorySlug: "court-news",
    tags: ["Antitrust", "Tech Industry", "Legal Proceedings"],
    relatedArticles: ["corporate-espionage-trade-secrets", "cfo-charged-embezzlement", "identity-theft-ring-dismantled"]
  },
  {
    id: "corporate-espionage",
    title: "Corporate Espionage: Trade Secrets Stolen from AI Firm",
    slug: "corporate-espionage-trade-secrets",
    author: "Rebecca Chen",
    authorSlug: "rebecca-chen",
    date: "2025-01-20T10:15:00Z",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop",
    imageAlt: "Computer code with lock symbol",
    excerpt: "Former employees allegedly stole proprietary algorithms valued at over $100 million.",
    content: ["This is a sample article content for the Corporate Espionage case."],
    category: "Crime News",
    categorySlug: "crime-news",
    tags: ["Corporate Espionage", "Intellectual Property", "Tech Industry"],
    relatedArticles: ["tech-ceo-testifies-antitrust", "cfo-charged-embezzlement", "identity-theft-ring-dismantled"]
  },
  {
    id: "identity-theft-ring",
    title: "International Identity Theft Ring Dismantled After Two-Year Investigation",
    slug: "identity-theft-ring-dismantled",
    author: "Alicia Washington",
    authorSlug: "alicia-washington",
    date: "2025-02-05T09:45:00Z",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop",
    imageAlt: "Handcuffs on computer keyboard",
    excerpt: "Authorities arrested 12 individuals across three countries in connection with the scheme.",
    content: ["This is a sample article content for the Identity Theft Ring case."],
    category: "Crime News",
    categorySlug: "crime-news",
    tags: ["Identity Theft", "Cybercrime", "International Crime"],
    relatedArticles: ["corporate-espionage-trade-secrets", "cfo-charged-embezzlement", "tech-ceo-testifies-antitrust"]
  }
];

/**
 * Get all articles
 */
export function getAllArticles(): ArticleType[] {
  return articles;
}

/**
 * Get article by slug
 */
export function getArticleBySlug(slug: string): ArticleType | undefined {
  return articles.find(article => article.slug === slug);
}

/**
 * Get related articles for an article
 */
export function getRelatedArticles(articleId: string): ArticleType[] {
  // For mock data
  if (articleId.indexOf('_') === -1) {
    // This is a mock article ID (not a Sanity ID which contains underscores)
    const article = articles.find(a => a.id === articleId);
    if (!article || !article.relatedArticles) return [];
    
    return articles.filter(a => article.relatedArticles?.includes(a.id));
  }
  
  // For Sanity data, we would fetch related posts based on the relatedPosts field
  // This would be implemented when integrating with Sanity
  // For now, return some sample related articles
  return articles.slice(0, 3); // Return first 3 articles as related
}

/**
 * Add excerpt to article if it doesn't exist
 */
export function ensureArticleExcerpt(article: any): any {
  if (!article.excerpt && article.content && article.content.length > 0) {
    // Create an excerpt from the first paragraph of content
    const firstParagraph = article.content[0];
    article.excerpt = firstParagraph.length > 150 
      ? firstParagraph.substring(0, 147) + '...'
      : firstParagraph;
  }
  return article;
}
