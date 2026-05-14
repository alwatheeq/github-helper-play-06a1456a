import React, { useState, useMemo } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, XCircle, Timer } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { PomodoroTimer } from './PomodoroTimer';

type NotificationTab = 'alerts' | 'timer';

export const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NotificationTab>('alerts');

  const visibleNotifications = useMemo(
    () => notifications.filter((n) => n.notification_type !== 'trial_expiring'),
    [notifications]
  );

  const visibleUnreadCount = useMemo(
    () => visibleNotifications.filter((n) => !n.is_read).length,
    [visibleNotifications]
  );

  // Severity colors preserved (semantic notification palette)
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'subscription_renewed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'trial_expiring':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'subscription_canceled':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'admin_notification':
        return <Info className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-ink dark:text-muted-ink-on-dark" />;
    }
  };

  const handleNotificationClick = (notification: { id: string; action_url?: string }) => {
    markAsRead(notification.id);
    if (notification.action_url) {
      navigate(notification.action_url);
      setIsOpen(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setActiveTab('alerts');
        }}
        className="relative p-2 hover:opacity-60 transition duration-200"
      >
        <Bell className="h-6 w-6 text-secondary-ink dark:text-muted-ink-on-dark" />
        {visibleUnreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-accent-gold text-sidebar text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {visibleUnreadCount > 9 ? '9+' : visibleUnreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark z-50 max-h-[min(600px,80vh)] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-divider dark:border-divider-on-dark space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-ink dark:text-ink-on-dark">Notifications</h3>
                {activeTab === 'alerts' && visibleUnreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-accent-gold hover:opacity-80 font-medium flex items-center space-x-1 shrink-0"
                  >
                    <Check className="h-4 w-4" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
              <div
                className="flex p-0.5 bg-accent-gold-soft/10 border border-divider dark:border-divider-on-dark"
                role="tablist"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'alerts'}
                  onClick={() => setActiveTab('alerts')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-sm font-medium transition ${
                    activeTab === 'alerts'
                      ? 'bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark'
                      : 'text-muted-ink dark:text-muted-ink-on-dark hover:opacity-80'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  Alerts
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'timer'}
                  onClick={() => setActiveTab('timer')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-sm font-medium transition ${
                    activeTab === 'timer'
                      ? 'bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark'
                      : 'text-muted-ink dark:text-muted-ink-on-dark hover:opacity-80'
                  }`}
                >
                  <Timer className="h-4 w-4" />
                  Timer
                </button>
              </div>
              {activeTab === 'alerts' && visibleUnreadCount > 0 && (
                <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">{visibleUnreadCount} unread</p>
              )}
            </div>

            {activeTab === 'alerts' ? (
              <>
                <div className="flex-1 overflow-y-auto min-h-0">
                  {visibleNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="h-12 w-12 text-muted-ink dark:text-muted-ink-on-dark mx-auto mb-3" />
                      <p className="text-muted-ink dark:text-muted-ink-on-dark">No notifications</p>
                      <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mt-1">
                        You're all caught up!
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-divider dark:divide-divider-on-dark">
                      {visibleNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 hover:opacity-60 transition cursor-pointer ${
                            !notification.is_read ? 'bg-accent-gold-soft/10' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.notification_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${
                                !notification.is_read
                                  ? 'font-semibold text-ink dark:text-ink-on-dark'
                                  : 'text-secondary-ink dark:text-muted-ink-on-dark'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark mt-1">
                                {formatTimeAgo(notification.created_at)}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              {!notification.is_read && (
                                <div className="h-2 w-2 bg-accent-gold rounded-full" />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="ml-2 p-1 hover:opacity-60 rounded transition"
                              >
                                <X className="h-4 w-4 text-muted-ink dark:text-muted-ink-on-dark" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {visibleNotifications.length > 0 && (
                  <div className="p-3 border-t border-divider dark:border-divider-on-dark text-center">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-sm text-secondary-ink dark:text-muted-ink-on-dark hover:opacity-80"
                    >
                      Close
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 overflow-y-auto min-h-0 p-4">
                <PomodoroTimer variant="embedded" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
