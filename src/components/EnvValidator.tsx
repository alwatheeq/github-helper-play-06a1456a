import React from 'react';
import { AlertCircle } from 'lucide-react';

export const EnvValidator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="min-h-screen bg-page-light dark:bg-page-dark flex items-center justify-center p-4">
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-red-100 p-3 rounded-full dark:bg-red-900/30">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <h1 className="font-display text-[24px] font-bold text-ink dark:text-ink-on-dark text-center mb-4">
            Configuration Error
          </h1>

          <p className="text-secondary-ink dark:text-muted-ink-on-dark text-center mb-6">
            The application is missing required environment variables.
          </p>

          <div className="bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark p-4 mb-6">
            <h2 className="font-semibold text-ink dark:text-ink-on-dark mb-2">Missing Variables:</h2>
            <ul className="space-y-1 text-sm text-secondary-ink dark:text-muted-ink-on-dark">
              {!supabaseUrl && <li>• VITE_SUPABASE_URL</li>}
              {!supabaseAnonKey && <li>• VITE_SUPABASE_ANON_KEY</li>}
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 dark:bg-blue-950/40 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 mb-2 dark:text-blue-200">To fix this:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside dark:text-blue-200">
              <li>Create a .env file in the project root</li>
              <li>Add the required environment variables</li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
