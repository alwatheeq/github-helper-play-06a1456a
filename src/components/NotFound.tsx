import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen bg-page-light dark:bg-page-dark flex items-center justify-center p-4`}>
      <div className="bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] border border-divider dark:border-divider-on-dark dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-[var(--s4-shadow-hairline)] p-8 max-w-md w-full text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
            <FileQuestion className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-ink dark:text-ink-on-dark mb-4">404</h1>

        <h2 className="s4-h2 text-ink dark:text-ink-on-dark mb-4">
          Page Not Found
        </h2>

        <p className="text-secondary-ink dark:text-muted-ink mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 px-6 py-3 bg-subtle dark:bg-card-dark text-secondary-ink dark:text-muted-ink-on-dark rounded-[var(--s4-radius-card)] hover:bg-subtle dark:hover:bg-card-dark transition duration-[var(--s4-dur-fast)] w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-[var(--s4-radius-card)] hover:bg-blue-700 transition duration-[var(--s4-dur-fast)] w-full sm:w-auto justify-center"
          >
            <Home className="h-5 w-5" />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
