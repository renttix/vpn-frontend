import React from 'react';
import Script from 'next/script';

interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

interface HowToTool {
  name: string;
  description?: string;
  url?: string;
  image?: string;
}

interface HowToSupply {
  name: string;
  description?: string;
  url?: string;
  image?: string;
}

interface HowToJsonLdProps {
  name: string;
  description: string;
  image?: string;
  totalTime?: string; // Format: PT1H30M15S (ISO 8601 duration format)
  estimatedCost?: {
    currency: string;
    value: string | number;
  };
  supply?: HowToSupply[];
  tool?: HowToTool[];
  step: HowToStep[];
  yield?: string;
  url?: string;
}

/**
 * HowTo Schema Component for SEO
 * 
 * This component generates structured data for how-to content following Google's guidelines.
 * Adding this helps how-to content appear in rich results in Google Search.
 * 
 * @see https://developers.google.com/search/docs/appearance/structured-data/how-to
 */
export default function HowToJsonLd({
  name,
  description,
  image,
  totalTime,
  estimatedCost,
  supply,
  tool,
  step,
  yield: howToYield,
  url
}: HowToJsonLdProps) {
  // Don't render if no steps provided
  if (!step || step.length === 0) {
    return null;
  }

  // Create the JSON-LD schema with proper typing
  const jsonLd: {
    "@context": string;
    "@type": string;
    "name": string;
    "description": string;
    "image"?: string;
    "totalTime"?: string;
    "estimatedCost"?: {
      "@type": string;
      "currency": string;
      "value": string | number;
    };
    "supply"?: Array<{
      "@type": string;
      "name": string;
      "description"?: string;
      "url"?: string;
      "image"?: string;
    }>;
    "tool"?: Array<{
      "@type": string;
      "name": string;
      "description"?: string;
      "url"?: string;
      "image"?: string;
    }>;
    "step": Array<{
      "@type": string;
      "name": string;
      "text": string;
      "url"?: string;
      "image"?: string;
    }>;
    "yield"?: string;
    "mainEntityOfPage"?: {
      "@type": string;
      "@id": string;
    };
  } = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "step": step.map((s, index) => ({
      "@type": "HowToStep",
      "name": s.name,
      "text": s.text,
      ...(s.url && { "url": s.url }),
      ...(s.image && { "image": s.image })
    }))
  };

  // Add optional properties if provided
  if (image) jsonLd.image = image;
  if (totalTime) jsonLd.totalTime = totalTime;
  
  if (estimatedCost) {
    jsonLd.estimatedCost = {
      "@type": "MonetaryAmount",
      "currency": estimatedCost.currency,
      "value": estimatedCost.value
    };
  }
  
  if (supply && supply.length > 0) {
    jsonLd.supply = supply.map(s => ({
      "@type": "HowToSupply",
      "name": s.name,
      ...(s.description && { "description": s.description }),
      ...(s.url && { "url": s.url }),
      ...(s.image && { "image": s.image })
    }));
  }
  
  if (tool && tool.length > 0) {
    jsonLd.tool = tool.map(t => ({
      "@type": "HowToTool",
      "name": t.name,
      ...(t.description && { "description": t.description }),
      ...(t.url && { "url": t.url }),
      ...(t.image && { "image": t.image })
    }));
  }
  
  if (howToYield) jsonLd.yield = howToYield;
  
  if (url) {
    jsonLd.mainEntityOfPage = {
      "@type": "WebPage",
      "@id": url
    };
  }

  return (
    <Script id="howto-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}

/**
 * Helper function to extract HowTo steps from article content
 * 
 * This function analyzes Portable Text content to find steps based on
 * numbered lists or headings with sequential content.
 * 
 * @param content Portable Text content array
 * @returns Array of HowToStep objects
 */
export function extractHowToStepsFromContent(content: any[]): HowToStep[] {
  if (!content || !Array.isArray(content)) {
    return [];
  }

  const steps: HowToStep[] = [];
  let currentStepName = '';
  let currentStepText = '';
  let inNumberedList = false;
  let stepNumber = 1;

  // Look for patterns like numbered lists or h3/h4 followed by paragraphs
  for (let i = 0; i < content.length; i++) {
    const block = content[i];
    
    // Check if this is a heading that might be a step
    if (block._type === 'block' && 
        (block.style === 'h3' || block.style === 'h4') && 
        block.children && 
        block.children.length > 0) {
      
      // If we were already collecting a step, save it
      if (currentStepName && currentStepText) {
        steps.push({
          name: currentStepName,
          text: currentStepText
        });
      }
      
      // Start a new step
      currentStepName = block.children
        .map((child: any) => child.text)
        .join('')
        .trim();
      currentStepText = '';
      inNumberedList = false;
    }
    // Check if this is a numbered list item
    else if (block._type === 'block' && 
             block.listItem === 'number' && 
             block.children && 
             block.children.length > 0) {
      
      // If this is the first numbered item, reset
      if (!inNumberedList) {
        inNumberedList = true;
        stepNumber = 1;
      }
      
      // If we were already collecting a step, save it
      if (currentStepName && currentStepText) {
        steps.push({
          name: currentStepName,
          text: currentStepText
        });
      }
      
      // Extract the text
      const text = block.children
        .map((child: any) => child.text)
        .join('')
        .trim();
      
      // Create a step name if none exists
      currentStepName = `Step ${stepNumber}`;
      currentStepText = text;
      stepNumber++;
    }
    // Check if this is a paragraph following a step heading
    else if (block._type === 'block' && 
             block.style === 'normal' && 
             block.children && 
             block.children.length > 0 && 
             currentStepName) {
      
      // Add to the current step text
      const text = block.children
        .map((child: any) => child.text)
        .join('')
        .trim();
      
      if (currentStepText) {
        currentStepText += ' ' + text;
      } else {
        currentStepText = text;
      }
    }
  }
  
  // Add the last step if there is one
  if (currentStepName && currentStepText) {
    steps.push({
      name: currentStepName,
      text: currentStepText
    });
  }

  return steps;
}

/**
 * Helper function to detect if content is likely a how-to guide
 * 
 * @param content Portable Text content array
 * @param title Article title
 * @returns Boolean indicating if content is likely a how-to guide
 */
export function isLikelyHowToContent(content: any[], title: string): boolean {
  if (!content || !Array.isArray(content)) {
    return false;
  }
  
  // Check title for how-to indicators
  const howToTitlePattern = /how\s+to|guide|tutorial|steps|instructions|learn|diy/i;
  if (howToTitlePattern.test(title)) {
    return true;
  }
  
  // Count numbered list items
  let numberedListItems = 0;
  
  // Count step-like headings
  let stepHeadings = 0;
  
  for (const block of content) {
    // Count numbered list items
    if (block._type === 'block' && block.listItem === 'number') {
      numberedListItems++;
    }
    
    // Count step-like headings
    if (block._type === 'block' && 
        (block.style === 'h2' || block.style === 'h3' || block.style === 'h4') && 
        block.children && 
        block.children.length > 0) {
      
      const headingText = block.children
        .map((child: any) => child.text)
        .join('')
        .trim();
      
      if (/step|part|phase|stage|\d+[.:)]/i.test(headingText)) {
        stepHeadings++;
      }
    }
  }
  
  // If we have a significant number of numbered list items or step headings, it's likely a how-to
  return numberedListItems >= 3 || stepHeadings >= 3;
}
