import pino from 'pino';

// Configure different loggers for different environments
const isDevelopment = process.env.NODE_ENV === 'development';

// Base logger configuration
const baseLogger = pino({
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
  },
});

// Create namespaced loggers for different parts of the application
export const logger = {
  // Server-side logger
  server: baseLogger.child({ context: 'server' }),
  
  // API logger
  api: baseLogger.child({ context: 'api' }),
  
  // Database logger
  db: baseLogger.child({ context: 'database' }),
  
  // Auth logger
  auth: baseLogger.child({ context: 'auth' }),
  
  // Client-side logger (with limited functionality in browser)
  client: {
    info: (message: string, data?: any) => {
      if (typeof window !== 'undefined') {
        console.info(`[INFO] ${message}`, data);
      } else {
        baseLogger.child({ context: 'client' }).info(data, message);
      }
    },
    error: (message: string, error?: any) => {
      if (typeof window !== 'undefined') {
        console.error(`[ERROR] ${message}`, error);
        // Here you could also send errors to a monitoring service
        // like Sentry or LogRocket in a real application
      } else {
        baseLogger.child({ context: 'client' }).error({ error }, message);
      }
    },
    warn: (message: string, data?: any) => {
      if (typeof window !== 'undefined') {
        console.warn(`[WARN] ${message}`, data);
      } else {
        baseLogger.child({ context: 'client' }).warn(data, message);
      }
    },
    debug: (message: string, data?: any) => {
      if (typeof window !== 'undefined' && isDevelopment) {
        console.debug(`[DEBUG] ${message}`, data);
      } else if (isDevelopment) {
        baseLogger.child({ context: 'client' }).debug(data, message);
      }
    },
  },
};

// Helper function to log API request details
export function logApiRequest(req: Request, context: string) {
  const url = new URL(req.url);
  logger.api.info({
    method: req.method,
    path: url.pathname,
    query: Object.fromEntries(url.searchParams.entries()),
    context,
  }, 'API request received');
}

// Helper function to log API response details
export function logApiResponse(
  status: number,
  duration: number,
  context: string,
  error?: any
) {
  if (error) {
    logger.api.error(
      {
        status,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : error,
        context,
      },
      'API request failed'
    );
  } else {
    logger.api.info(
      {
        status,
        duration: `${duration}ms`,
        context,
      },
      'API request completed'
    );
  }
}

// Helper function to create API handlers with automatic logging
export function withLogging<T>(
  handler: (req: Request) => Promise<Response>,
  context: string
) {
  return async (req: Request): Promise<Response> => {
    const startTime = performance.now();
    logApiRequest(req, context);
    
    try {
      const response = await handler(req);
      const duration = Math.round(performance.now() - startTime);
      logApiResponse(response.status, duration, context);
      return response;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      logApiResponse(500, duration, context, error);
      
      // Return a proper error response
      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };
}

export default logger;
