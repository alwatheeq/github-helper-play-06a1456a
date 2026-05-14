import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { ErrorLogger } from '../../utils/errorLogger';
import { formatCurrency } from '../../utils/subscriptionHelpers';

import {
  TrendingUp, Users, DollarSign, Activity, Calendar, BarChart3, ArrowUp, ArrowDown
} from 'lucide-react';

interface UserGrowth {
  date: string;
  total_users: number;
  new_users: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  transactions: number;
}

interface SubscriptionStats {
  tier: string;
  count: number;
  revenue: number;
}

export const AnalyticsPage: React.FC = React.memo(() => {
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [totalTokenUsage, setTotalTokenUsage] = useState(0);
  const [avgTokenUsage, setAvgTokenUsage] = useState(0);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      const startDateStr = startDate.toISOString();

      const [
        { count: usersCount },
        { data: profiles },
        { data: transactions },
        { data: subscriptions },
        { data: tokenData },
      ] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('created_at').gte('created_at', startDateStr).order('created_at'),
        supabase.from('transactions').select('created_at, amount, status').eq('status', 'succeeded').gte('created_at', startDateStr).order('created_at'),
        supabase.from('subscriptions').select('subscription_tier, status').eq('status', 'active'),
        supabase.rpc('admin_get_users_with_usage'),
      ]);

      setTotalUsers(usersCount || 0);

      const growthMap = new Map<string, number>();
      profiles?.forEach(profile => {
        const date = new Date(profile.created_at).toISOString().split('T')[0];
        growthMap.set(date, (growthMap.get(date) || 0) + 1);
      });
      const cumulativeTotal = usersCount || 0;
      const growthData: UserGrowth[] = Array.from(growthMap.entries()).map(([date, newUsers]) => ({
        date,
        total_users: cumulativeTotal,
        new_users: newUsers,
      }));
      setUserGrowth(growthData);

      const revenueMap = new Map<string, { revenue: number; count: number }>();
      let totalRev = 0;
      transactions?.forEach(trans => {
        const date = new Date(trans.created_at).toISOString().split('T')[0];
        const existing = revenueMap.get(date) || { revenue: 0, count: 0 };
        existing.revenue += Number(trans.amount);
        existing.count += 1;
        revenueMap.set(date, existing);
        totalRev += Number(trans.amount);
      });
      setTotalRevenue(totalRev);
      const revData: RevenueData[] = Array.from(revenueMap.entries()).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        transactions: data.count,
      }));
      setRevenueData(revData);

      const subsMap = new Map<string, number>();
      subscriptions?.forEach(sub => {
        subsMap.set(sub.subscription_tier, (subsMap.get(sub.subscription_tier) || 0) + 1);
      });
      setActiveSubscriptions(subscriptions?.length || 0);
      const subsStats: SubscriptionStats[] = Array.from(subsMap.entries()).map(([tier, count]) => ({
        tier,
        count,
        revenue: 0,
      }));
      setSubscriptionStats(subsStats);

      if (tokenData) {
        const totalTokens = tokenData.reduce((sum: number, user: { tokens_used: number }) => sum + user.tokens_used, 0);
        const avgTokens = tokenData.length > 0 ? totalTokens / tokenData.length : 0;
        setTotalTokenUsage(totalTokens);
        setAvgTokenUsage(avgTokens);
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      ErrorLogger.error(error, { component: 'AnalyticsPage', action: 'fetchAnalytics' });
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const getTierDisplayName = (tier: string) => {
    const names: Record<string, string> = {
      trial_1day: 'Legacy 1-day',
      trial_7day: '7-Day Trial',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      biannual: 'Biannual',
      standard: 'Standard',
      none: 'None',
    };
    return names[tier] || tier;
  };

  const calculateGrowthRate = () => {
    if (userGrowth.length < 2) return 0;
    const first = userGrowth[0]?.new_users || 0;
    const last = userGrowth[userGrowth.length - 1]?.new_users || 0;
    if (first === 0) return 0;
    return ((last - first) / first) * 100;
  };

  const calculateRevenueGrowth = () => {
    if (revenueData.length < 2) return 0;
    const first = revenueData[0]?.revenue || 0;
    const last = revenueData[revenueData.length - 1]?.revenue || 0;
    if (first === 0) return 0;
    return ((last - first) / first) * 100;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
      </div>
    );
  }

  const growthRate = calculateGrowthRate();
  const revenueGrowth = calculateRevenueGrowth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink dark:text-ink-on-dark">Analytics Dashboard</h1>
          <p className="text-secondary-ink dark:text-muted-ink-on-dark mt-1">Track platform performance and growth metrics</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '7' || value === '30' || value === '90') {
              setDateRange(value);
            }
          }}
          className="px-5 py-2.5 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] text-ink dark:text-muted-ink-on-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mb-1">Total Users</p>
              <p className="text-3xl font-bold text-ink dark:text-ink-on-dark mt-1">{totalUsers.toLocaleString()}</p>
              <div className="flex items-center space-x-1 mt-2 text-muted-ink dark:text-muted-ink-on-dark">
                {growthRate >= 0 ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {Math.abs(growthRate).toFixed(1)}% growth
                </span>
              </div>
            </div>
            <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark">
              <Users className="h-8 w-8 text-accent-gold" />
            </div>
          </div>
        </div>

        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-ink dark:text-ink-on-dark mt-1">{formatCurrency(totalRevenue / 100)}</p>
              <div className="flex items-center space-x-1 mt-2 text-muted-ink dark:text-muted-ink-on-dark">
                {revenueGrowth >= 0 ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {Math.abs(revenueGrowth).toFixed(1)}% growth
                </span>
              </div>
            </div>
            <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark">
              <DollarSign className="h-8 w-8 text-accent-gold" />
            </div>
          </div>
        </div>

        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mb-1">Active Subscriptions</p>
              <p className="text-3xl font-bold text-ink dark:text-ink-on-dark mt-1">{activeSubscriptions.toLocaleString()}</p>
              <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark mt-2">
                {totalUsers > 0 ? ((activeSubscriptions / totalUsers) * 100).toFixed(1) : 0}% conversion
              </p>
            </div>
            <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark">
              <TrendingUp className="h-8 w-8 text-accent-gold" />
            </div>
          </div>
        </div>

        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mb-1">Token Usage</p>
              <p className="text-3xl font-bold text-ink dark:text-ink-on-dark mt-1">{(totalTokenUsage / 1000000).toFixed(2)}M</p>
              <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark mt-2">
                {(avgTokenUsage / 1000).toFixed(1)}K avg/user
              </p>
            </div>
            <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark">
              <Activity className="h-8 w-8 text-accent-gold" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
        <h3 className="text-lg font-semibold text-ink dark:text-ink-on-dark mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-accent-gold" />
          User Growth
        </h3>

        {userGrowth.length > 0 ? (
          <div className="space-y-3">
            {userGrowth.slice(-10).map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark">
                <div className="text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                  {new Date(data.date).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-ink dark:text-ink-on-dark">
                      +{data.new_users} new
                    </div>
                    <div className="text-xs text-muted-ink dark:text-muted-ink-on-dark">
                      {data.total_users} total
                    </div>
                  </div>
                  <div className="w-32 bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark rounded-full h-2">
                    <div
                      className="bg-accent-gold h-2 rounded-full"
                      style={{ width: `${Math.min((data.new_users / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-ink dark:text-muted-ink-on-dark text-center py-8">No user growth data available</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
          <h3 className="text-lg font-semibold text-ink dark:text-ink-on-dark mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-accent-gold" />
            Revenue Trend
          </h3>

          {revenueData.length > 0 ? (
            <div className="space-y-3">
              {revenueData.slice(-7).map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark">
                  <div className="text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                    {new Date(data.date).toLocaleDateString()}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-ink dark:text-ink-on-dark">
                      {formatCurrency(data.revenue / 100)}
                    </div>
                    <div className="text-xs text-muted-ink dark:text-muted-ink-on-dark">
                      {data.transactions} transactions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-ink dark:text-muted-ink-on-dark text-center py-8">No revenue data available</p>
          )}
        </div>

        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
          <h3 className="text-lg font-semibold text-ink dark:text-ink-on-dark mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-accent-gold" />
            Subscription Distribution
          </h3>

          {subscriptionStats.length > 0 ? (
            <div className="space-y-3">
              {subscriptionStats.map((stat, index) => {
                const percentage = activeSubscriptions > 0 ? (stat.count / activeSubscriptions) * 100 : 0;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ink dark:text-ink-on-dark">
                        {getTierDisplayName(stat.tier)}
                      </span>
                      <span className="text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                        {stat.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-subtle dark:bg-subtle-on-dark rounded-full h-2">
                      <div
                        className="bg-accent-gold h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-ink dark:text-muted-ink-on-dark text-center py-8">No subscription data available</p>
          )}
        </div>
      </div>
    </div>
  );
});
