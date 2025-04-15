import React from 'react';
import Script from 'next/script';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqJsonLdProps {
  faqs: FaqItem[];
  url?: string;
}

/**
 * FAQ Schema Component for Google Rich Results
 * 
 * This component generates structured data for FAQ content following Google's guidelines.
 * Adding this to pages with FAQ sections can enable rich results in Google Search.
 * 
 * @see https://developers.google.com/search/docs/data-types/faqpage
 */
export default function FaqJsonLd({ faqs, url = '' }: FaqJsonLdProps) {
  // Don't render if no FAQs provided
  if (!faqs || faqs.length === 0) {
    return null;
  }

  // Create the JSON-LD schema with proper typing
  const jsonLd: {
    "@context": string;
    "@type": string;
    "mainEntity": Array<{
      "@type": string;
      "name": string;
      "acceptedAnswer": {
        "@type": string;
        "text": string;
      };
    }>;
    "url"?: string; // Make url optional in the type
  } = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  // Add URL if provided
  if (url) {
    jsonLd.url = url; // Now TypeScript knows url is a valid property
  }

  return (
    <Script id="faq-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}

/**
 * Helper function to extract FAQ items from article content
 * 
 * This function analyzes Portable Text content to find FAQ sections
 * based on heading patterns and following paragraphs.
 * 
 * @param content Portable Text content array
 * @returns Array of FAQ items
 */
export function extractFaqsFromContent(content: any[]): FaqItem[] {
  if (!content || !Array.isArray(content)) {
    return [];
  }

  const faqs: FaqItem[] = [];
  let currentQuestion = '';

  // Look for patterns like h2/h3 followed by paragraphs
  for (let i = 0; i < content.length; i++) {
    const block = content[i];
    
    // Check if this is a heading that might be a question
    if (block._type === 'block' && 
        (block.style === 'h2' || block.style === 'h3') && 
        block.children && 
        block.children.length > 0) {
      
      // Extract the question text
      const questionText = block.children
        .map((child: any) => child.text)
        .join('')
        .trim();
      
      // Check if it looks like a question (ends with ? or contains question words)
      const isQuestion = questionText.endsWith('?') || 
                         /\b(what|how|why|when|where|who|which|can|do|is|are|will|should)\b/i.test(questionText);
      
      if (isQuestion) {
        currentQuestion = questionText;
        
        // Look for the answer in the following blocks
        let answerBlocks = [];
        let j = i + 1;
        
        // Collect paragraphs until we hit another heading or run out of blocks
        while (j < content.length && 
               !(content[j]._type === 'block' && 
                 (content[j].style === 'h2' || content[j].style === 'h3'))) {
          
          if (content[j]._type === 'block' && content[j].style === 'normal') {
            answerBlocks.push(content[j]);
          }
          j++;
        }
        
        // If we found answer paragraphs, add this as a FAQ
        if (answerBlocks.length > 0) {
          const answerText = answerBlocks
            .map(block => 
              block.children
                .map((child: any) => child.text)
                .join('')
            )
            .join(' ')
            .trim();
          
          if (answerText) {
            faqs.push({
              question: currentQuestion,
              answer: answerText
            });
          }
        }
      }
    }
  }

  return faqs;
}
