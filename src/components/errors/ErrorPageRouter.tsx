import { useRouteError, isRouteErrorResponse } from 'react-router';
import { Error404 } from './Error404';
import { Error403 } from './Error403';
import { Error500 } from './Error500';
import { Error502 } from './Error502';

/**
 * Enhanced Error Page Router
 * Routes to appropriate futuristic error page based on error status
 */

export function ErrorPageRouter() {
  const error = useRouteError();
  
  // Determine error status
  let errorStatus: number | undefined;
  
  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
  } else if (error instanceof Error && 'status' in error) {
    errorStatus = (error as any).status;
  }

  // Log error for debugging (only in development)
  if (import.meta.env.DEV) {
    console.error('Route Error:', error);
  }

  // Route to appropriate error page
  switch (errorStatus) {
    case 403:
      return <Error403 />;
    case 404:
      return <Error404 />;
    case 500:
      return <Error500 />;
    case 502:
    case 503:
    case 504:
      return <Error502 />;
    default:
      // Default to 404 for unknown errors
      return <Error404 />;
  }
}
