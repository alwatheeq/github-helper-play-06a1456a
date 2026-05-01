import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Shield, Menu, LogOut, User } from 'lucide-react';

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ toggleSidebar }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <header className="bg-card-light dark:bg-card-dark border-b border-divider dark:border-divider-on-dark sticky top-0 z-40 shadow-[var(--scholar-shadow-sm)]">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-muted-ink dark:text-muted-ink-on-dark hover:text-ink dark:hover:text-ink-on-dark hover:bg-subtle transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="bg-chip p-2 rounded-md border border-divider dark:border-divider-on-dark">
                <Shield className="h-6 w-6 text-accent-gold" />
              </div>
              <div>
                <h1 className="font-display text-xl text-ink dark:text-ink-on-dark">
                  Admin Portal
                </h1>
                <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark">
                  System Administration
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-chip rounded-md border border-divider dark:border-divider-on-dark">
              <User className="h-4 w-4 text-muted-ink dark:text-muted-ink-on-dark" />
              <div className="text-sm">
                <p className="font-medium text-ink dark:text-ink-on-dark">{user?.email}</p>
                <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark">Administrator</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-ink dark:text-ink-on-dark border border-divider dark:border-divider-on-dark rounded-md hover:bg-subtle transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
