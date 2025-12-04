import { RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { router } from './utils/routes';
import { queryClient } from './lib/queryClient';
import { DarkModeProvider } from './context/DarkModeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { EmojiProvider } from './context/EmojiContext';
import { KeepAliveProvider } from './context/KeepAliveContext';
import { ToastProvider } from './context/ToastContext';
import { MonthProvider } from './context/MonthContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <ToastProvider>
          <AuthProvider>
            <MonthProvider>
              <KeepAliveProvider maxCachedPages={10} cacheTTL={30 * 60 * 1000}>
                <EmojiProvider>
                  <NotificationProvider>
                    <RouterProvider router={router} />
                  </NotificationProvider>
                </EmojiProvider>
              </KeepAliveProvider>
            </MonthProvider>
          </AuthProvider>
        </ToastProvider>
      </DarkModeProvider>
      {/* Only show devtools in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;