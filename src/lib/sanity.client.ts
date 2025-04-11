import { createClient } from 'next-sanity';

// Use the Project ID and Dataset found in your sanity.config.ts file
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'g7f0f6rs';
const dataset = 'production';
const apiVersion = '2023-05-03'; // Use a recent API version

// Make sure the token is accessible in both client and server environments
// Server-side code can access SANITY_API_TOKEN, client-side can only access NEXT_PUBLIC_ variables
const token = process.env.SANITY_API_TOKEN;

export const client = createClient({
  projectId,
  dataset,
  apiVersion, // https://www.sanity.io/docs/api-versioning
  useCdn: process.env.NODE_ENV === 'production', // Use CDN in production for better performance
  token, // Use the token from environment variables
});

// Add CORS allowed origins to your Sanity project
// Go to https://www.sanity.io/manage/personal/project/g7f0f6rs/api
// and add the following to the CORS origins:
// - http://localhost:3000 (for local development)
// - Your Netlify domain (e.g., https://vpnnews.netlify.app or your custom domain)
