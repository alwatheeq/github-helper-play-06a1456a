import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../Toast/Toast';
import { Shield, Search, Download, Calendar, User, Activity, Eye } from 'lucide-react';
import { ErrorLogger } from '../../utils/errorLogger';
import { useDebounce } from '../../hooks/useDebounce';


interface AuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action_type: string;
  table_name: string | null;
  record_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface AuditStats {
  total_actions: number;
  unique_admins: number;
  by_action_type: Record<string, number>;
  by_table: Record<string, number>;
  most_active_admin: {
    email: string;
    actions: number;
  };
}

export const AuditLogPage: React.FC = React.memo(() => {
  const toast = useToast();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [filterActionType, setFilterActionType] = useState<string>('');
  const [filterTable, setFilterTable] = useState<string>('');
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);

      let startDate = null;
      if (dateRange !== 'all') {
        const days = dateRange === 'today' ? 1 : dateRange === '7days' ? 7 : 30;
        const date = new Date();
        date.setDate(date.getDate() - days);
        startDate = date.toISOString();
      }

      const { data, error } = await supabase.rpc('get_admin_audit_log', {
        p_limit: 200,
        p_offset: 0,
        p_action_type: filterActionType || null,
        p_table_name: filterTable || null,
        p_start_date: startDate,
        p_end_date: null
      });

      if (error) throw error;

      setAuditLogs(data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      ErrorLogger.error(error, { component: 'AuditLogPage', action: 'fetchAuditLogs' });
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [filterActionType, filterTable, dateRange, toast]);

  const fetchAuditStats = useCallback(async () => {
    try {
      let startDate = null;
      if (dateRange !== 'all') {
        const days = dateRange === 'today' ? 1 : dateRange === '7days' ? 7 : 30;
        const date = new Date();
        date.setDate(date.getDate() - days);
        startDate = date.toISOString();
      }

      const { data, error } = await supabase.rpc('get_audit_log_stats', {
        p_start_date: startDate,
        p_end_date: null
      });

      if (error) throw error;

      setStats(data || null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      ErrorLogger.error(error, { component: 'AuditLogPage', action: 'fetchStats' });
    }
  }, [dateRange]);

  useEffect(() => {
    void fetchAuditLogs();
    void fetchAuditStats();
  }, [fetchAuditLogs, fetchAuditStats]);

  const exportToCSV = () => {
    try {
      const headers = ['Date', 'Admin', 'Action', 'Table', 'Description', 'IP Address'];
      const rows = filteredLogs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.admin_email,
        log.action_type,
        log.table_name || '-',
        log.description || '-',
        log.ip_address || '-'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Audit log exported successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      ErrorLogger.error(error, { component: 'AuditLogPage', action: 'exportAuditLog' });
      toast.error('Failed to export audit log');
    }
  };

  const getActionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      UPDATE: 'bg-accent-gold-soft text-accent-gold dark:bg-accent-gold-soft/20',
      DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      VIEW: 'bg-subtle dark:bg-subtle-on-dark text-muted-ink dark:text-muted-ink-on-dark',
      LOGIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      LOGOUT: 'bg-subtle dark:bg-subtle-on-dark text-muted-ink dark:text-muted-ink-on-dark',
      EXPORT: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
    };
    return colors[type] || 'bg-subtle dark:bg-subtle-on-dark text-muted-ink dark:text-muted-ink-on-dark';
  };

  const filteredLogs = useMemo(() =>
    auditLogs.filter(log =>
      log.admin_email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (log.description && log.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
    ),
    [auditLogs, debouncedSearchQuery]
  );

  const uniqueTables = Array.from(new Set(auditLogs.map(log => log.table_name).filter(Boolean))) as string[];

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
          <h1 className="text-3xl font-bold text-ink dark:text-ink-on-dark flex items-center">
            <Shield className="h-8 w-8 mr-3 text-accent-gold" />
            Audit Log
          </h1>
          <p className="text-secondary-ink dark:text-muted-ink-on-dark mt-1">
            Comprehensive log of all admin actions and system events
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-5 py-2.5 bg-accent-gold text-ink-on-dark hover:opacity-90 transition"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mb-1">Total Actions</p>
                <p className="text-3xl font-bold text-ink dark:text-ink-on-dark mt-1">{stats.total_actions.toLocaleString()}</p>
              </div>
              <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark">
                <Activity className="h-8 w-8 text-accent-gold" />
              </div>
            </div>
          </div>

          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mb-1">Active Admins</p>
                <p className="text-3xl font-bold text-ink dark:text-ink-on-dark mt-1">{stats.unique_admins}</p>
              </div>
              <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark">
                <User className="h-8 w-8 text-accent-gold" />
              </div>
            </div>
          </div>

          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mb-1">Most Active</p>
                <p className="text-sm font-bold text-ink dark:text-ink-on-dark mt-1 truncate">
                  {stats.most_active_admin?.email || 'N/A'}
                </p>
                <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark mt-1">
                  {stats.most_active_admin?.actions || 0} actions
                </p>
              </div>
              <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark">
                <Shield className="h-8 w-8 text-accent-gold" />
              </div>
            </div>
          </div>

          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mb-1">Period</p>
                <p className="text-2xl font-bold text-ink dark:text-ink-on-dark mt-1">
                  {dateRange === 'today' ? 'Today' : dateRange === '7days' ? '7 Days' : dateRange === '30days' ? '30 Days' : 'All Time'}
                </p>
              </div>
              <div className="bg-accent-gold-soft p-3 border border-divider dark:border-divider-on-dark">
                <Calendar className="h-8 w-8 text-accent-gold" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-ink dark:text-muted-ink-on-dark" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by admin or description..."
                className="w-full pl-10 pr-4 py-2 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] text-ink dark:text-muted-ink-on-dark placeholder:text-muted-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">
              Action Type
            </label>
            <select
              value={filterActionType}
              onChange={(e) => setFilterActionType(e.target.value)}
              className="w-full px-5 py-2.5 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] text-ink dark:text-muted-ink-on-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="VIEW">View</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="EXPORT">Export</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">
              Table
            </label>
            <select
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="w-full px-5 py-2.5 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] text-ink dark:text-muted-ink-on-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <option value="">All Tables</option>
              {uniqueTables.map(table => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'today' || value === '7days' || value === '30days' || value === 'all') {
                  setDateRange(value);
                }
              }}
              className="w-full px-5 py-2.5 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[12px] text-ink dark:text-muted-ink-on-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-subtle dark:bg-subtle-on-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider dark:divide-divider-on-dark">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-subtle/50 dark:hover:bg-subtle-on-dark/30 transition">
                  <td className="px-6 py-6 whitespace-nowrap text-sm text-ink dark:text-ink-on-dark">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap text-sm text-ink dark:text-ink-on-dark">
                    {log.admin_email}
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionTypeColor(log.action_type)}`}>
                      {log.action_type}
                    </span>
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                    {log.table_name || '-'}
                  </td>
                  <td className="px-6 py-6 text-sm text-secondary-ink dark:text-muted-ink-on-dark max-w-md truncate">
                    {log.description || '-'}
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                    {log.ip_address || '-'}
                  </td>
                  <td className="px-6 py-6 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-accent-gold hover:opacity-80"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-ink dark:text-muted-ink-on-dark">No audit logs found</p>
            </div>
          )}
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-divider dark:border-divider-on-dark">
              <h3 className="text-xl font-bold text-ink dark:text-ink-on-dark">Audit Log Details</h3>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark">Timestamp</label>
                <p className="text-ink dark:text-ink-on-dark mt-1">{new Date(selectedLog.created_at).toLocaleString()}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark">Admin</label>
                <p className="text-ink dark:text-ink-on-dark mt-1">{selectedLog.admin_email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark">Action Type</label>
                <p className="mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionTypeColor(selectedLog.action_type)}`}>
                    {selectedLog.action_type}
                  </span>
                </p>
              </div>

              {selectedLog.table_name && (
                <div>
                  <label className="text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark">Table</label>
                  <p className="text-ink dark:text-ink-on-dark mt-1">{selectedLog.table_name}</p>
                </div>
              )}

              {selectedLog.description && (
                <div>
                  <label className="text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark">Description</label>
                  <p className="text-ink dark:text-ink-on-dark mt-1">{selectedLog.description}</p>
                </div>
              )}

              {selectedLog.old_values && (
                <div>
                  <label className="text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark">Old Values</label>
                  <pre className="text-xs bg-subtle dark:bg-subtle-on-dark p-3 mt-1 overflow-x-auto">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <label className="text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark">New Values</label>
                  <pre className="text-xs bg-subtle dark:bg-subtle-on-dark p-3 mt-1 overflow-x-auto">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.ip_address && (
                <div>
                  <label className="text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark">IP Address</label>
                  <p className="text-ink dark:text-ink-on-dark mt-1">{selectedLog.ip_address}</p>
                </div>
              )}

              {selectedLog.user_agent && (
                <div>
                  <label className="text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark">User Agent</label>
                  <p className="text-xs text-secondary-ink dark:text-muted-ink-on-dark mt-1">{selectedLog.user_agent}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-divider dark:border-divider-on-dark">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full px-5 py-2.5 bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark hover:opacity-80 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
