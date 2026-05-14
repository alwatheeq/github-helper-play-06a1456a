import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Search, Download, Users, AlertTriangle, BarChart3, RefreshCw, Calendar, Activity
} from 'lucide-react';
import { getTierDisplayInfo, getStatusDisplayInfo, formatTokenUsage } from '../../utils/subscriptionHelpers';
import { useToast } from '../Toast/Toast';
import { ErrorLogger } from '../../utils/errorLogger';
import { useDebounce } from '../../hooks/useDebounce';

interface UserWithUsage {
  user_id: string;
  email: string;
  subscription_tier: string;
  subscription_status: string;
  tokens_used: number;
  token_limit: number;
  usage_percentage: number;
  billing_cycle_end: string | null;
  days_remaining: number;
  created_at: string;
}

interface UsageHistory {
  cycle_start: string;
  cycle_end: string;
  tokens_used: number;
  token_limit: number;
  usage_percentage: number;
  subscription_tier: string;
  archived_at: string;
}

export const TokenUsagePage: React.FC = React.memo(() => {
  const { error: showErrorToast } = useToast();
  const [users, setUsers] = useState<UserWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [usageFilter, setUsageFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userHistory, setUserHistory] = useState<UsageHistory[]>([]);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.rpc('admin_get_users_with_usage');

      if (error) throw error;

      setUsers(data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      ErrorLogger.error(error, { component: 'TokenUsagePage', action: 'fetchUsageData' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsageData();
    setRefreshing(false);
  };

  const viewHistory = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase.rpc('get_user_usage_history', {
        p_user_id: userId,
        p_limit: 12
      });

      if (error) throw error;

      setUserHistory(data || []);
      setSelectedUser(email);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      ErrorLogger.error(error, {
        component: 'TokenUsagePage',
        action: 'fetchUserHistory',
        metadata: { email }
      });
      showErrorToast('Failed to load usage history');
    }
  };

  const filteredUsers = useMemo(() =>
    users.filter(user => {
      const matchesSearch = user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      let matchesUsage = true;
      if (usageFilter === 'high') {
        matchesUsage = user.usage_percentage >= 80;
      } else if (usageFilter === 'medium') {
        matchesUsage = user.usage_percentage >= 50 && user.usage_percentage < 80;
      } else if (usageFilter === 'low') {
        matchesUsage = user.usage_percentage < 50;
      } else if (usageFilter === 'active') {
        matchesUsage = user.subscription_status === 'active';
      }

      return matchesSearch && matchesUsage;
    }),
    [users, debouncedSearchTerm, usageFilter]
  );

  const getUsageTextColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 80) return 'text-orange-400';
    if (percentage >= 50) return 'text-secondary-ink dark:text-muted-ink-on-dark';
    return 'text-green-400';
  };

  const getUsageBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500/20';
    if (percentage >= 80) return 'bg-orange-500/20';
    if (percentage >= 50) return 'bg-subtle dark:bg-subtle-on-dark';
    return 'bg-green-500/20';
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Tier', 'Status', 'Tokens Used', 'Token Limit', 'Usage %', 'Days Remaining', 'Cycle End'];
    const rows = filteredUsers.map(user => [
      user.email,
      user.subscription_tier,
      user.subscription_status,
      user.tokens_used.toString(),
      user.token_limit.toString(),
      user.usage_percentage.toFixed(2) + '%',
      user.days_remaining.toString(),
      user.billing_cycle_end ? new Date(user.billing_cycle_end).toLocaleDateString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `token-usage-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const stats = {
    total_users: users.length,
    active_users: users.filter(u => u.subscription_status === 'active').length,
    high_usage: users.filter(u => u.usage_percentage >= 80).length,
    avg_usage: users.length > 0
      ? (users.reduce((sum, u) => sum + u.usage_percentage, 0) / users.length).toFixed(1)
      : '0'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink dark:text-ink-on-dark">Token Usage Monitoring</h1>
          <p className="text-secondary-ink dark:text-muted-ink-on-dark mt-1">Track and monitor user token consumption</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-5 py-2.5 bg-accent-gold text-ink-on-dark hover:opacity-90 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark">
              <Users className="h-6 w-6 text-accent-gold" />
            </div>
          </div>
          <h3 className="text-muted-ink dark:text-muted-ink-on-dark text-sm mb-1">Total Users</h3>
          <p className="text-3xl font-bold text-ink dark:text-ink-on-dark">{stats.total_users}</p>
        </div>

        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark">
              <Activity className="h-6 w-6 text-accent-gold" />
            </div>
          </div>
          <h3 className="text-muted-ink dark:text-muted-ink-on-dark text-sm mb-1">Active Users</h3>
          <p className="text-3xl font-bold text-ink dark:text-ink-on-dark">{stats.active_users}</p>
        </div>

        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark">
              <AlertTriangle className="h-6 w-6 text-accent-gold" />
            </div>
          </div>
          <h3 className="text-muted-ink dark:text-muted-ink-on-dark text-sm mb-1">High Usage (80%+)</h3>
          <p className="text-3xl font-bold text-ink dark:text-ink-on-dark">{stats.high_usage}</p>
        </div>

        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark">
              <BarChart3 className="h-6 w-6 text-accent-gold" />
            </div>
          </div>
          <h3 className="text-muted-ink dark:text-muted-ink-on-dark text-sm mb-1">Average Usage</h3>
          <p className="text-3xl font-bold text-ink dark:text-ink-on-dark">{stats.avg_usage}%</p>
        </div>
      </div>

      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-ink dark:text-muted-ink-on-dark" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] text-ink dark:text-muted-ink-on-dark placeholder:text-muted-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
          </div>

          <select
            value={usageFilter}
            onChange={(e) => setUsageFilter(e.target.value)}
            className="px-5 py-2.5 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] text-ink dark:text-muted-ink-on-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <option value="all">All Users</option>
            <option value="active">Active Only</option>
            <option value="high">High Usage (80%+)</option>
            <option value="medium">Medium Usage (50-80%)</option>
            <option value="low">Low Usage (&lt;50%)</option>
          </select>

          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-5 py-2.5 bg-accent-gold text-ink-on-dark hover:opacity-90 transition"
          >
            <Download className="h-5 w-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-subtle dark:bg-subtle-on-dark">
              <tr>
                <th className="px-6 py-6 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-6 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-6 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-6 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-6 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Tokens
                </th>
                <th className="px-6 py-6 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Cycle End
                </th>
                <th className="px-6 py-6 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider dark:divide-divider-on-dark">
              {filteredUsers.map((user) => {
                const tierInfo = getTierDisplayInfo(user.subscription_tier);

                const statusInfo = getStatusDisplayInfo(user.subscription_status);
                return (
                  <tr key={user.user_id} className="hover:bg-subtle/50 dark:hover:bg-subtle-on-dark/30">
                    <td className="px-6 py-6 whitespace-nowrap">
                      <p className="text-sm font-medium text-ink dark:text-ink-on-dark">{user.email}</p>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tierInfo.bgColor} ${tierInfo.color}`}>
                        {tierInfo.name}
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}>
                        {statusInfo.name}
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-subtle dark:bg-subtle-on-dark h-[3px] w-24">
                          <div
                            className={`h-[3px] ${getUsageBgColor(user.usage_percentage)}`}
                            style={{ width: `${Math.min(100, user.usage_percentage)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold ${getUsageTextColor(user.usage_percentage)}`}>
                          {user.usage_percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                      {formatTokenUsage(user.tokens_used)} / {formatTokenUsage(user.token_limit)}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      {user.billing_cycle_end ? (
                        <div>
                          <p className="text-sm text-secondary-ink dark:text-muted-ink-on-dark">{new Date(user.billing_cycle_end).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark">{user.days_remaining} days remaining</p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-ink dark:text-muted-ink-on-dark">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <button
                        onClick={() => viewHistory(user.user_id, user.email)}
                        className="flex items-center space-x-1 px-3 py-1 bg-accent-gold text-ink-on-dark text-sm hover:opacity-90 transition"
                      >
                        <Calendar className="h-4 w-4" />
                        <span>History</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-ink dark:text-muted-ink-on-dark">No users found</p>
          </div>
        )}
      </div>

      {selectedUser && userHistory.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card-light dark:bg-card-dark border-b border-divider dark:border-divider-on-dark px-6 py-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-ink dark:text-ink-on-dark">Usage History - {selectedUser}</h3>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setUserHistory([]);
                }}
                className="p-2 hover:bg-subtle dark:hover:bg-subtle-on-dark transition"
              >
                <span className="text-muted-ink dark:text-muted-ink-on-dark text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {userHistory.map((record, idx) => (
                  <div key={idx} className="bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark mb-1">Billing Cycle</p>
                        <p className="text-sm text-ink dark:text-ink-on-dark">{new Date(record.cycle_start).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark">to {new Date(record.cycle_end).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark mb-1">Tier</p>
                        <p className="text-sm text-ink dark:text-ink-on-dark">{getTierDisplayInfo(record.subscription_tier).name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark mb-1">Usage</p>
                        <p className="text-sm text-ink dark:text-ink-on-dark">
                          {formatTokenUsage(record.tokens_used)} / {formatTokenUsage(record.token_limit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark mb-1">Percentage</p>
                        <p className={`text-sm font-semibold ${getUsageTextColor(record.usage_percentage)}`}>
                          {record.usage_percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
