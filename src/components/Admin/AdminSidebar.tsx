import React from 'react';
import { LayoutDashboard, Users, MessageSquare, Folder, Tag, CreditCard, BarChart3, Activity, Pin, PinOff, Shield, Receipt, FileText, TrendingUp, Coins, Settings } from 'lucide-react';
import type { AdminView } from './AdminDashboard';
import { useMouseProximity } from '../../hooks/useMouseProximity';

interface AdminSidebarProps {
  currentView: AdminView;
  onNavigate: (view: AdminView) => void;
  isSidebarOpen: boolean;
}

interface NavItem {
  id: AdminView;
  label: string;
  icon: React.ReactNode;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentView,
  onNavigate,
  isSidebarOpen,
}) => {
  const [isPinned, setIsPinned] = React.useState(() => {
    const saved = localStorage.getItem('admin-sidebar-pinned');
    return saved ? JSON.parse(saved) : false;
  });
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  const { isNearEdge } = useMouseProximity({
    threshold: 50,
    delay: 100,
    enabled: !isMobile && !isPinned,
  });

  React.useEffect(() => {
    localStorage.setItem('admin-sidebar-pinned', JSON.stringify(isPinned));
  }, [isPinned]);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const shouldBeOpen = isMobile ? isSidebarOpen : (isPinned || isHovered || isNearEdge);

  const togglePin = () => setIsPinned(!isPinned);

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="h-5 w-5" /> },
    { id: 'user-activity', label: 'User Activity', icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'admin-users', label: 'Admin Users', icon: <Shield className="h-5 w-5" /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'transactions', label: 'Transactions', icon: <Receipt className="h-5 w-5" /> },
    { id: 'token-usage', label: 'Token Usage', icon: <Activity className="h-5 w-5" /> },
    { id: 'credits', label: 'Credit Management', icon: <Coins className="h-5 w-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
    { id: 'audit-log', label: 'Audit Log', icon: <FileText className="h-5 w-5" /> },
    { id: 'app-settings', label: 'App Settings', icon: <Settings className="h-5 w-5" /> },
    { id: 'folders', label: 'Folders', icon: <Folder className="h-5 w-5" /> },
    { id: 'tags', label: 'Tags', icon: <Tag className="h-5 w-5" /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="h-5 w-5" /> },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-sidebar border-r border-divider-on-dark transition-all duration-200 ease-in-out ${
        shouldBeOpen ? 'w-64' : 'w-16'
      } overflow-hidden z-30`}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      <div className="p-6 border-b border-divider-on-dark">
        <div className="flex items-center justify-between">
          {shouldBeOpen && (
            <h2 className="font-display text-lg text-ink-on-dark">Admin Panel</h2>
          )}
          {!isMobile && (
            <button
              onClick={togglePin}
              className={`p-2 rounded-md transition-colors duration-150 text-muted-ink-on-dark hover:text-ink-on-dark hover:bg-white/5 ${
                !shouldBeOpen ? 'mx-auto block' : ''
              }`}
              title={isPinned ? 'Unpin Sidebar' : 'Pin Sidebar'}
            >
              {isPinned ? <Pin className="h-5 w-5" /> : <PinOff className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const baseClasses = `relative flex items-center transition-colors duration-150 rounded-md ${
            shouldBeOpen ? 'w-full space-x-3 px-4 py-2.5' : 'w-10 h-10 justify-center mx-auto'
          }`;
          const stateClasses = isActive
            ? `bg-accent-gold/15 text-accent-gold ${shouldBeOpen ? 'border-l-2 border-accent-gold' : ''}`
            : 'text-muted-ink-on-dark hover:text-ink-on-dark hover:bg-white/5';
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`${baseClasses} ${stateClasses}`}
              title={!shouldBeOpen ? item.label : undefined}
            >
              <span className={isActive ? 'text-accent-gold' : ''}>{item.icon}</span>
              {shouldBeOpen && (
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
