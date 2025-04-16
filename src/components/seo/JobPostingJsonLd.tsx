import React from 'react';
import Script from 'next/script';

interface JobLocation {
  streetAddress?: string;
  addressLocality: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry: string;
  remote?: boolean;
}

interface JobPostingJsonLdProps {
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'TEMPORARY' | 'INTERN' | 'VOLUNTEER' | 'PER_DIEM' | 'OTHER';
  hiringOrganization: {
    name: string;
    sameAs: string;
    logo?: string;
  };
  jobLocation: JobLocation;
  baseSalary?: {
    currency: string;
    value: number | string;
    unitText: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  };
  applicantLocationRequirements?: string[];
  jobLocationType?: 'TELECOMMUTE' | 'WORK_FROM_HOME' | 'OTHER';
  skills?: string[];
  qualifications?: string[];
  educationRequirements?: string[];
  experienceRequirements?: string[];
  applicationUrl?: string;
}

/**
 * JobPosting Schema Component for Google Rich Results
 * 
 * This component generates structured data for job postings following Google's guidelines.
 * Adding this to job listing pages can enable rich results in Google Search.
 * 
 * @see https://developers.google.com/search/docs/data-types/job-posting
 */
export default function JobPostingJsonLd({
  title,
  description,
  datePosted,
  validThrough,
  employmentType,
  hiringOrganization,
  jobLocation,
  baseSalary,
  applicantLocationRequirements,
  jobLocationType,
  skills,
  qualifications,
  educationRequirements,
  experienceRequirements,
  applicationUrl
}: JobPostingJsonLdProps) {
  // Format the date in ISO format
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toISOString();
    } catch (e) {
      return dateString; // Return as is if it's already in ISO format
    }
  };

  // Create the JSON-LD schema
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": title,
    "description": description,
    "datePosted": formatDate(datePosted),
    "employmentType": employmentType,
    "hiringOrganization": {
      "@type": "Organization",
      "name": hiringOrganization.name,
      "sameAs": hiringOrganization.sameAs
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": jobLocation.addressLocality,
        "addressCountry": jobLocation.addressCountry
      }
    }
  };

  // Add optional properties if provided
  if (validThrough) {
    jsonLd.validThrough = formatDate(validThrough);
  }

  if (hiringOrganization.logo) {
    jsonLd.hiringOrganization.logo = hiringOrganization.logo;
  }

  // Add detailed address information if provided
  if (jobLocation.streetAddress) {
    jsonLd.jobLocation.address.streetAddress = jobLocation.streetAddress;
  }

  if (jobLocation.addressRegion) {
    jsonLd.jobLocation.address.addressRegion = jobLocation.addressRegion;
  }

  if (jobLocation.postalCode) {
    jsonLd.jobLocation.address.postalCode = jobLocation.postalCode;
  }

  // Add remote work information
  if (jobLocation.remote === true) {
    jsonLd.jobLocationType = "TELECOMMUTE";
  } else if (jobLocationType) {
    jsonLd.jobLocationType = jobLocationType;
  }

  // Add applicant location requirements if provided
  if (applicantLocationRequirements && applicantLocationRequirements.length > 0) {
    jsonLd.applicantLocationRequirements = applicantLocationRequirements.map(location => ({
      "@type": "Country",
      "name": location
    }));
  }

  // Add salary information if provided
  if (baseSalary) {
    jsonLd.baseSalary = {
      "@type": "MonetaryAmount",
      "currency": baseSalary.currency,
      "value": {
        "@type": "QuantitativeValue",
        "value": baseSalary.value,
        "unitText": baseSalary.unitText
      }
    };
  }

  // Add skills if provided
  if (skills && skills.length > 0) {
    jsonLd.skills = skills.join(", ");
  }

  // Add qualifications if provided
  if (qualifications && qualifications.length > 0) {
    jsonLd.qualifications = qualifications.join(", ");
  }

  // Add education requirements if provided
  if (educationRequirements && educationRequirements.length > 0) {
    jsonLd.educationRequirements = {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": educationRequirements.join(", ")
    };
  }

  // Add experience requirements if provided
  if (experienceRequirements && experienceRequirements.length > 0) {
    jsonLd.experienceRequirements = {
      "@type": "OccupationalExperienceRequirements",
      "monthsOfExperience": experienceRequirements.join(", ")
    };
  }

  // Add application URL if provided
  if (applicationUrl) {
    jsonLd.applicationUrl = applicationUrl;
  }

  return (
    <Script id="job-posting-jsonld" type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(jsonLd)}
    </Script>
  );
}
