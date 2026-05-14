import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, FileText, MessageSquare, TrendingUp, Calendar } from 'lucide-react';
import { ErrorLogger } from '../../utils/errorLogger';


interface Stats {
  totalUsers: number;
  activeUsersThisMonth: number;
  totalFeedback: number;
  pendingFeedback: number;
  totalSummaries: number;
  totalLibraryItems: number;
}

interface RecentActivity {
  type: string;
  user_email: string;
  created_at: string;
  details: string;
}

export const OverviewPage: React.FC = React.memo(() => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsersThisMonth: 0,
    totalFeedback: 0,
    pendingFeedback: 0,
    totalSummaries: 0,
    totalLibraryItems: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [
        usersResult,
        activeUsersResult,
        feedbackResult,
        pendingFeedbackResult,
        summariesResult,
        libraryResult,
      ] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('updated_at', startOfMonth.toISOString()),
        supabase.from('user_feedback').select('id', { count: 'exact', head: true }),
        supabase.from('user_feedback').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('user_history').select('id', { count: 'exact', head: true }),
        supabase.from('user_library_items').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        activeUsersThisMonth: activeUsersResult.count || 0,
        totalFeedback: feedbackResult.count || 0,
        pendingFeedback: pendingFeedbackResult.count || 0,
        totalSummaries: summariesResult.count || 0,
        totalLibraryItems: libraryResult.count || 0,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'OverviewPage', action: 'fetchStats' });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: recentFeedback } = await supabase
        .from('user_feedback')
        .select('user_email, created_at, feedback_type')
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: RecentActivity[] = (recentFeedback || []).map(fb => ({
        type: 'feedback',
        user_email: fb.user_email,
        created_at: fb.created_at,
        details: `Submitted ${fb.feedback_type}`,
      }));

      setRecentActivity(activities);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      ErrorLogger.error(err, { component: 'OverviewPage', action: 'fetchRecentActivity' });
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    trend?: string;
  }> = ({ title, value, icon, trend }) => (
    <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-ink dark:text-muted-ink-on-dark mb-1">{title}</p>
          <p className="text-3xl font-bold text-ink dark:text-ink-on-dark">{value.toLocaleString()}</p>
          {trend && (
            <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark mt-2">{trend}</p>
          )}
        </div>
        <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark text-accent-gold">
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink dark:text-ink-on-dark">Dashboard Overview</h1>
        <p className="text-secondary-ink dark:text-muted-ink-on-dark mt-1">Monitor platform statistics and user activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Active This Month"
          value={stats.activeUsersThisMonth}
          icon={<TrendingUp className="h-6 w-6" />}
          trend="Users with activity"
        />
        <StatCard
          title="Total Feedback"
          value={stats.totalFeedback}
          icon={<MessageSquare className="h-6 w-6" />}
          trend={`${stats.pendingFeedback} pending`}
        />
        <StatCard
          title="Generated Summaries"
          value={stats.totalSummaries}
          icon={<FileText className="h-6 w-6" />}
        />
        <StatCard
          title="Library Items"
          value={stats.totalLibraryItems}
          icon={<FileText className="h-6 w-6" />}
        />
        <StatCard
          title="Pending Feedback"
          value={stats.pendingFeedback}
          icon={<MessageSquare className="h-6 w-6" />}
          trend="Needs review"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
          <h3 className="text-lg font-semibold text-ink dark:text-ink-on-dark mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-accent-gold" />
            Recent Activity
          </h3>
          <div className="space-y-6">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark"
                >
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-accent-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink dark:text-ink-on-dark">
                      {activity.user_email}
                    </p>
                    <p className="text-sm text-secondary-ink dark:text-muted-ink-on-dark">{activity.details}</p>
                    <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark mt-1">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-ink dark:text-muted-ink-on-dark text-center py-8">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
          <h3 className="text-lg font-semibold text-ink dark:text-ink-on-dark mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <div className="p-6 bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark">
              <h4 className="text-sm font-semibold text-ink dark:text-ink-on-dark mb-1">
                {stats.pendingFeedback} Pending Feedback
              </h4>
              <p className="text-xs text-secondary-ink dark:text-muted-ink-on-dark">
                Review user feedback and suggestions to improve the platform
              </p>
            </div>

            <div className="p-6 bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark">
              <h4 className="text-sm font-semibold text-ink dark:text-ink-on-dark mb-1">
                {stats.activeUsersThisMonth} Active Users
              </h4>
              <p className="text-xs text-secondary-ink dark:text-muted-ink-on-dark">
                Users who have been active this month
              </p>
            </div>

            <div className="p-6 bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark">
              <h4 className="text-sm font-semibold text-ink dark:text-ink-on-dark mb-1">
                {stats.totalSummaries} Total Summaries
              </h4>
              <p className="text-xs text-secondary-ink dark:text-muted-ink-on-dark">
                Content generated by users across all time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
