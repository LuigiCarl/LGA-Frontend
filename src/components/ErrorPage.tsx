import { useRouteError, isRouteErrorResponse, Link } from 'react-router';
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';

export default function ErrorPage() {
  const error = useRouteError();
  let errorMessage: string;
  let errorStatus: number | undefined;

  // Determine error type and extract message
  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || 'An error occurred';
    
    // Custom messages for common HTTP errors
    if (error.status === 404) {
      errorMessage = 'Page not found';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized access';
    } else if (error.status === 403) {
      errorMessage = 'Forbidden';
    } else if (error.status === 500) {
      errorMessage = 'Internal server error';
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Unknown error occurred';
  }

  // Log error for debugging (only in development)
  if (import.meta.env.DEV) {
    console.error('Route Error:', error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0A0A0A] px-4">
      <div className="max-w-md w-full bg-white dark:bg-[#1A1A1A] rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        {errorStatus && (
          <div className="text-center mb-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              {errorStatus}
            </span>
          </div>
        )}
        
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          {errorStatus === 404 ? 'Page Not Found' : 'Something Went Wrong'}
        </h1>
        
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          {errorMessage}
        </p>

        {import.meta.env.DEV && error instanceof Error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
            <p className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">
              Error Details (Development Only):
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 font-mono break-all">
              {error.stack}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#5558E3] text-white rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
