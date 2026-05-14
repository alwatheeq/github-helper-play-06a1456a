import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, Download, DollarSign, TrendingUp, CreditCard, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

import { ErrorLogger } from '../../utils/errorLogger';
import { formatCurrency } from '../../utils/subscriptionHelpers';
import { downloadCSV } from '../../utils/csvHelpers';

interface Transaction {
  id: string;
  user_id: string;
  subscription_id: string | null;
  stripe_payment_intent_id: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  transaction_type: string;
  receipt_url: string | null;
  created_at: string;
  user_email?: string;
}

interface TransactionStats {
  total_revenue: number;
  successful_transactions: number;
  failed_transactions: number;
  pending_transactions: number;
  avg_transaction_amount: number;
}

const STATUS_BADGE_STYLES: Record<string, string> = {
  succeeded: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  pending: 'bg-subtle dark:bg-subtle-on-dark text-muted-ink dark:text-muted-ink-on-dark',
  refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  canceled: 'bg-subtle dark:bg-subtle-on-dark text-muted-ink dark:text-muted-ink-on-dark',
};

export const TransactionsPage: React.FC = React.memo(() => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    total_revenue: 0,
    successful_transactions: 0,
    failed_transactions: 0,
    pending_transactions: 0,
    avg_transaction_amount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const { data: transactionsData, error: transError } = await supabase
        .from('transactions')
        .select(`
          *,
          user_profiles!inner(email)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (transError) throw transError;

      const transactionsWithEmail = (transactionsData || []).map(t => ({
        ...t,
        user_email: t.user_profiles?.email || 'Unknown'
      }));

      setTransactions(transactionsWithEmail);

      const successful = transactionsWithEmail.filter(t => t.status === 'succeeded');
      const failed = transactionsWithEmail.filter(t => t.status === 'failed');
      const pending = transactionsWithEmail.filter(t => t.status === 'pending');

      const totalRevenue = successful.reduce((sum, t) => sum + Number(t.amount), 0);
      const avgAmount = successful.length > 0 ? totalRevenue / successful.length : 0;

      setStats({
        total_revenue: totalRevenue,
        successful_transactions: successful.length,
        failed_transactions: failed.length,
        pending_transactions: pending.length,
        avg_transaction_amount: avgAmount
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      ErrorLogger.error(error, { component: 'TransactionsPage', action: 'fetchTransactions' });
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() =>
    transactions.filter(trans => {
      const matchesSearch =
        trans.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trans.stripe_payment_intent_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trans.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || trans.status === statusFilter;

      return matchesSearch && matchesStatus;
    }),
    [transactions, searchTerm, statusFilter]
  );

  const getStatusBadge = (status: string) =>
    STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.pending;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'User Email', 'Amount', 'Currency', 'Status', 'Type', 'Payment Intent ID'];
    const rows = filteredTransactions.map(trans => [
      new Date(trans.created_at).toLocaleString(),
      trans.user_email || 'Unknown',
      trans.amount.toString(),
      trans.currency.toUpperCase(),
      trans.status,
      trans.transaction_type,
      trans.stripe_payment_intent_id || 'N/A',
    ]);
    downloadCSV(`transactions-${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink dark:text-ink-on-dark">Transaction History</h1>
          <p className="text-secondary-ink dark:text-muted-ink-on-dark mt-1">Monitor payment transactions and revenue</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-5 py-2.5 bg-accent-gold text-ink-on-dark hover:opacity-90 transition"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-ink dark:text-ink-on-dark mt-1">
                {formatCurrency(stats.total_revenue / 100)}
              </p>
            </div>
            <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark">
              <DollarSign className="h-8 w-8 text-accent-gold" />
            </div>
          </div>
        </div>

        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mb-1">Successful</p>
              <p className="text-2xl font-bold text-ink dark:text-ink-on-dark mt-1">{stats.successful_transactions}</p>
            </div>
            <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark">
              <CheckCircle className="h-8 w-8 text-accent-gold" />
            </div>
          </div>
        </div>

        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mb-1">Failed</p>
              <p className="text-2xl font-bold text-ink dark:text-ink-on-dark mt-1">{stats.failed_transactions}</p>
            </div>
            <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark">
              <XCircle className="h-8 w-8 text-accent-gold" />
            </div>
          </div>
        </div>

        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mb-1">Avg Amount</p>
              <p className="text-2xl font-bold text-ink dark:text-ink-on-dark mt-1">
                {formatCurrency(stats.avg_transaction_amount / 100)}
              </p>
            </div>
            <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark">
              <TrendingUp className="h-8 w-8 text-accent-gold" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-ink dark:text-muted-ink-on-dark" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] text-ink dark:text-muted-ink-on-dark placeholder:text-muted-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-ink dark:text-muted-ink-on-dark" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] text-ink dark:text-muted-ink-on-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-focus appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="succeeded">Succeeded</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-ink dark:text-muted-ink-on-dark" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] text-ink dark:text-muted-ink-on-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-focus appearance-none"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-divider dark:divide-divider-on-dark">
            <thead className="bg-subtle dark:bg-subtle-on-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody className="bg-card-light dark:bg-card-dark divide-y divide-divider dark:divide-divider-on-dark">
              {filteredTransactions.map((trans) => (
                <tr key={trans.id} className="hover:bg-subtle/50 dark:hover:bg-subtle-on-dark/30 transition">
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="text-sm text-ink dark:text-ink-on-dark">
                      {new Date(trans.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-ink dark:text-muted-ink-on-dark">
                      {new Date(trans.created_at).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="text-sm font-medium text-ink dark:text-ink-on-dark">
                      {trans.user_email}
                    </div>
                    <div className="text-xs text-muted-ink dark:text-muted-ink-on-dark">
                      ID: {trans.user_id.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="text-sm font-bold text-ink dark:text-ink-on-dark">
                      {formatCurrency(trans.amount / 100, trans.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="text-sm text-ink dark:text-ink-on-dark">
                      {trans.transaction_type.replace(/_/g, ' ')}
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex items-center space-x-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadge(trans.status)}`}>
                      {getStatusIcon(trans.status)}
                      <span>{trans.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-muted-ink dark:text-muted-ink-on-dark" />
                      <span className="text-sm text-ink dark:text-ink-on-dark">
                        {trans.payment_method || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    {trans.receipt_url ? (
                      <a
                        href={trans.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-gold hover:opacity-80 text-sm"
                      >
                        View Receipt
                      </a>
                    ) : (
                      <span className="text-sm text-muted-ink dark:text-muted-ink-on-dark">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-ink dark:text-muted-ink-on-dark">No transactions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
