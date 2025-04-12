/**
 * Utility functions for handling sorting in the application
 */

/**
 * Translates a sort parameter into a GROQ order statement
 * @param sortBy The sort parameter (e.g., 'date_desc', 'title_asc')
 * @returns A GROQ order statement (e.g., 'publishedAt desc', 'title asc')
 */
export function getSortOrder(sortBy: string = 'date_desc'): string {
  // Default sort order
  let postOrder = 'publishedAt desc';
  
  // Map sort parameters to GROQ order statements
  switch (sortBy) {
    case 'title_asc':
      postOrder = 'title asc';
      break;
    case 'title_desc':
      postOrder = 'title desc';
      break;
    case 'date_asc':
      postOrder = 'publishedAt asc';
      break;
    case 'author_asc':
      postOrder = 'author.name asc';
      break;
    case 'author_desc':
      postOrder = 'author.name desc';
      break;
    case 'date_desc':
    default:
      postOrder = 'publishedAt desc';
      break;
  }
  
  return postOrder;
}

/**
 * Validates a sort parameter
 * @param sortBy The sort parameter to validate
 * @returns A valid sort parameter
 */
export function validateSortParam(sortBy: string | undefined): string {
  const validSortParams = [
    'date_desc',
    'date_asc',
    'title_asc',
    'title_desc',
    'author_asc',
    'author_desc'
  ];
  
  return validSortParams.includes(sortBy as string) ? sortBy as string : 'date_desc';
}
