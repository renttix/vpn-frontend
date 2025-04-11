import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import logger from './logger';

/**
 * Default fetcher function for SWR
 * @param url - URL to fetch
 * @returns Parsed JSON response
 */
export const defaultFetcher = async (url: string) => {
  const startTime = performance.now();
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = new Error(`API error: ${response.status}`);
      // Add response details to the error object
      (error as any).status = response.status;
      (error as any).info = await response.text();
      throw error;
    }
    
    const data = await response.json();
    
    // Log successful response
    const duration = Math.round(performance.now() - startTime);
    logger.client.debug(`Fetched ${url} in ${duration}ms`);
    
    return data;
  } catch (error) {
    // Log error
    const duration = Math.round(performance.now() - startTime);
    logger.client.error(`Error fetching ${url} after ${duration}ms`, error);
    throw error;
  }
};

/**
 * Default SWR configuration
 */
export const defaultConfig: SWRConfiguration = {
  fetcher: defaultFetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000, // 5 seconds
  errorRetryCount: 3,
  errorRetryInterval: 5000, // 5 seconds
  suspense: false,
};

/**
 * Enhanced useSWR hook with default configuration and error logging
 * @param key - SWR key
 * @param config - SWR configuration
 * @returns SWR response
 */
export function useData<Data = any, Error = any>(
  key: string | null,
  config: SWRConfiguration = {}
): SWRResponse<Data, Error> {
  const result = useSWR<Data, Error>(
    key,
    // Merge default config with provided config
    {
      ...defaultConfig,
      ...config,
    }
  );
  
  // Log errors
  if (result.error) {
    logger.client.error(`SWR error for ${key}:`, result.error);
  }
  
  return result;
}

/**
 * Enhanced useSWR hook for POST requests
 * @param key - SWR key
 * @param body - Request body
 * @param config - SWR configuration
 * @returns SWR response
 */
export function usePostData<Data = any, Error = any>(
  key: string | null,
  body: any,
  config: SWRConfiguration = {}
): SWRResponse<Data, Error> {
  return useData<Data, Error>(
    key,
    {
      ...config,
      fetcher: async (url: string) => {
        const startTime = performance.now();
        
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });
          
          if (!response.ok) {
            const error = new Error(`API error: ${response.status}`);
            (error as any).status = response.status;
            (error as any).info = await response.text();
            throw error;
          }
          
          const data = await response.json();
          
          // Log successful response
          const duration = Math.round(performance.now() - startTime);
          logger.client.debug(`POST to ${url} in ${duration}ms`);
          
          return data;
        } catch (error) {
          // Log error
          const duration = Math.round(performance.now() - startTime);
          logger.client.error(`Error POSTing to ${url} after ${duration}ms`, error);
          throw error;
        }
      },
    }
  );
}
