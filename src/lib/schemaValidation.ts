/**
 * Schema Validation Utility
 * 
 * This utility provides functions to validate JSON-LD schema markup against Google's requirements.
 * It helps ensure that structured data is properly formatted and contains all required fields.
 */

// Type for validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Type for field requirement
interface FieldRequirement {
  required: boolean;
  type: string | string[];
  validator?: (value: any) => boolean;
  message?: string;
}

// Type for schema requirements
interface SchemaRequirements {
  [key: string]: FieldRequirement;
}

/**
 * Validates a schema object against the specified requirements
 * 
 * @param schema The schema object to validate
 * @param requirements The requirements to validate against
 * @returns A validation result object
 */
export function validateSchema(schema: any, requirements: SchemaRequirements): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check if schema is an object
  if (!schema || typeof schema !== 'object') {
    result.isValid = false;
    result.errors.push('Schema must be an object');
    return result;
  }

  // Check if schema has @context and @type
  if (!schema['@context']) {
    result.isValid = false;
    result.errors.push('Schema must have @context property');
  }

  if (!schema['@type']) {
    result.isValid = false;
    result.errors.push('Schema must have @type property');
  }

  // Check each required field
  for (const [field, requirement] of Object.entries(requirements)) {
    const value = schema[field];

    // Check if required field is present
    if (requirement.required && (value === undefined || value === null)) {
      result.isValid = false;
      result.errors.push(`Required field "${field}" is missing`);
      continue;
    }

    // Skip validation if field is not present and not required
    if (value === undefined || value === null) {
      continue;
    }

    // Check field type
    const types = Array.isArray(requirement.type) ? requirement.type : [requirement.type];
    const typeMatches = types.some(type => {
      if (type === 'string') return typeof value === 'string';
      if (type === 'number') return typeof value === 'number';
      if (type === 'boolean') return typeof value === 'boolean';
      if (type === 'array') return Array.isArray(value);
      if (type === 'object') return typeof value === 'object' && !Array.isArray(value);
      if (type === 'date') {
        try {
          return !isNaN(new Date(value).getTime());
        } catch (e) {
          return false;
        }
      }
      return false;
    });

    if (!typeMatches) {
      result.isValid = false;
      result.errors.push(`Field "${field}" must be of type ${types.join(' or ')}`);
    }

    // Run custom validator if provided
    if (requirement.validator && !requirement.validator(value)) {
      result.isValid = false;
      result.errors.push(requirement.message || `Field "${field}" failed validation`);
    }
  }

  return result;
}

/**
 * Article schema requirements
 */
export const articleRequirements: SchemaRequirements = {
  'headline': {
    required: true,
    type: 'string',
    validator: (value) => value.length <= 110,
    message: 'Headline must be 110 characters or less'
  },
  'image': {
    required: true,
    type: ['string', 'array'],
    validator: (value) => {
      if (typeof value === 'string') return value.length > 0;
      return Array.isArray(value) && value.length > 0;
    },
    message: 'At least one image is required'
  },
  'datePublished': {
    required: true,
    type: ['string', 'date'],
    validator: (value) => {
      try {
        return !isNaN(new Date(value).getTime());
      } catch (e) {
        return false;
      }
    },
    message: 'datePublished must be a valid date'
  },
  'author': {
    required: true,
    type: 'object'
  },
  'publisher': {
    required: true,
    type: 'object'
  }
};

/**
 * FAQ schema requirements
 */
export const faqRequirements: SchemaRequirements = {
  'mainEntity': {
    required: true,
    type: 'array',
    validator: (value) => Array.isArray(value) && value.length > 0,
    message: 'At least one question is required'
  }
};

/**
 * Product schema requirements
 */
export const productRequirements: SchemaRequirements = {
  'name': {
    required: true,
    type: 'string'
  },
  'image': {
    required: true,
    type: ['string', 'array']
  },
  'description': {
    required: true,
    type: 'string'
  }
};

/**
 * Event schema requirements
 */
export const eventRequirements: SchemaRequirements = {
  'name': {
    required: true,
    type: 'string'
  },
  'startDate': {
    required: true,
    type: ['string', 'date'],
    validator: (value) => {
      try {
        return !isNaN(new Date(value).getTime());
      } catch (e) {
        return false;
      }
    },
    message: 'startDate must be a valid date'
  },
  'location': {
    required: true,
    type: 'object'
  }
};

/**
 * LocalBusiness schema requirements
 */
export const localBusinessRequirements: SchemaRequirements = {
  'name': {
    required: true,
    type: 'string'
  },
  'address': {
    required: true,
    type: 'object'
  },
  'telephone': {
    required: false,
    type: 'string'
  }
};

/**
 * JobPosting schema requirements
 */
export const jobPostingRequirements: SchemaRequirements = {
  'title': {
    required: true,
    type: 'string'
  },
  'description': {
    required: true,
    type: 'string'
  },
  'hiringOrganization': {
    required: true,
    type: 'object'
  },
  'datePosted': {
    required: true,
    type: ['string', 'date']
  },
  'validThrough': {
    required: false,
    type: ['string', 'date']
  },
  'jobLocation': {
    required: true,
    type: 'object'
  }
};

/**
 * ClaimReview schema requirements
 */
export const claimReviewRequirements: SchemaRequirements = {
  'claimReviewed': {
    required: true,
    type: 'string'
  },
  'reviewRating': {
    required: true,
    type: 'object'
  },
  'author': {
    required: true,
    type: 'object'
  },
  'publisher': {
    required: true,
    type: 'object'
  }
};

/**
 * LiveBlogPosting schema requirements
 */
export const liveBlogPostingRequirements: SchemaRequirements = {
  'headline': {
    required: true,
    type: 'string',
    validator: (value) => value.length <= 110,
    message: 'Headline must be 110 characters or less'
  },
  'coverageStartTime': {
    required: true,
    type: ['string', 'date']
  },
  'liveBlogUpdate': {
    required: false,
    type: 'array'
  }
};

/**
 * WebSite schema requirements
 */
export const webSiteRequirements: SchemaRequirements = {
  'name': {
    required: true,
    type: 'string'
  },
  'url': {
    required: true,
    type: 'string'
  }
};

/**
 * Validates an Article schema
 * 
 * @param schema The Article schema to validate
 * @returns A validation result object
 */
export function validateArticleSchema(schema: any): ValidationResult {
  return validateSchema(schema, articleRequirements);
}

/**
 * Validates a FAQ schema
 * 
 * @param schema The FAQ schema to validate
 * @returns A validation result object
 */
export function validateFaqSchema(schema: any): ValidationResult {
  return validateSchema(schema, faqRequirements);
}

/**
 * Validates a Product schema
 * 
 * @param schema The Product schema to validate
 * @returns A validation result object
 */
export function validateProductSchema(schema: any): ValidationResult {
  return validateSchema(schema, productRequirements);
}

/**
 * Validates an Event schema
 * 
 * @param schema The Event schema to validate
 * @returns A validation result object
 */
export function validateEventSchema(schema: any): ValidationResult {
  return validateSchema(schema, eventRequirements);
}

/**
 * Validates a LocalBusiness schema
 * 
 * @param schema The LocalBusiness schema to validate
 * @returns A validation result object
 */
export function validateLocalBusinessSchema(schema: any): ValidationResult {
  return validateSchema(schema, localBusinessRequirements);
}

/**
 * Validates a JobPosting schema
 * 
 * @param schema The JobPosting schema to validate
 * @returns A validation result object
 */
export function validateJobPostingSchema(schema: any): ValidationResult {
  return validateSchema(schema, jobPostingRequirements);
}

/**
 * Validates a ClaimReview schema
 * 
 * @param schema The ClaimReview schema to validate
 * @returns A validation result object
 */
export function validateClaimReviewSchema(schema: any): ValidationResult {
  return validateSchema(schema, claimReviewRequirements);
}

/**
 * Validates a LiveBlogPosting schema
 * 
 * @param schema The LiveBlogPosting schema to validate
 * @returns A validation result object
 */
export function validateLiveBlogPostingSchema(schema: any): ValidationResult {
  return validateSchema(schema, liveBlogPostingRequirements);
}

/**
 * Validates a WebSite schema
 * 
 * @param schema The WebSite schema to validate
 * @returns A validation result object
 */
export function validateWebSiteSchema(schema: any): ValidationResult {
  return validateSchema(schema, webSiteRequirements);
}
