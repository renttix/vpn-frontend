export interface AuthorType {
  slug: string;
  name: string;
  bio: string;
  imageUrl?: string; // Optional author image
  twitterHandle?: string; // Store handle, construct URL in component
  linkedinUrl?: string;
  email?: string;
}

// Sample authors data
const authors: AuthorType[] = [
  {
    slug: "sarah-blackwell",
    name: "Sarah Blackwell",
    bio: "Sarah Blackwell is a senior investigative reporter specializing in corporate finance and technology. She has been covering the intersection of business and crime for over a decade.",
    imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=2070&auto=format&fit=crop", // Example image
    twitterHandle: "SarahBInvestigates",
    linkedinUrl: "https://www.linkedin.com/in/sarahblackwellreporter", // Example URL
    email: "sarah.blackwell@example-news.com",
  },
  {
    slug: "michael-torres",
    name: "Michael Torres",
    bio: "Michael Torres is a legal affairs correspondent with expertise in antitrust law and corporate regulation. He has covered major tech industry cases for the past 8 years.",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop",
    twitterHandle: "MikeTorresLegal",
    linkedinUrl: "https://www.linkedin.com/in/michaeltorresreporter",
    email: "michael.torres@example-news.com",
  },
  {
    slug: "rebecca-chen",
    name: "Rebecca Chen",
    bio: "Rebecca Chen specializes in cybersecurity and intellectual property reporting. She has a background in computer science and has been covering tech industry legal issues since 2018.",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop",
    twitterHandle: "RebeccaCTech",
    linkedinUrl: "https://www.linkedin.com/in/rebeccachenreporter",
    email: "rebecca.chen@example-news.com",
  },
  {
    slug: "alicia-washington",
    name: "Alicia Washington",
    bio: "Alicia Washington covers cybercrime and digital security. Her investigative work has helped expose several major data breach cases and online fraud schemes.",
    imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1974&auto=format&fit=crop",
    twitterHandle: "AliciaWCrime",
    linkedinUrl: "https://www.linkedin.com/in/aliciawashingtonreporter",
    email: "alicia.washington@example-news.com",
  }
];

/**
 * Get author by slug
 */
export function getAuthorBySlug(slug: string): AuthorType | undefined {
  return authors.find(author => author.slug === slug);
}

/**
 * Get all authors
 */
export function getAllAuthors(): AuthorType[] {
  return authors;
}
