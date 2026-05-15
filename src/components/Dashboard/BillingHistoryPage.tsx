import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Download, Receipt, CheckCircle, XCircle, Clock, ArrowLeft, RotateCcw } from 'lucide-react';
import { formatCurrency } from '../../utils/subscriptionHelpers';
import { useToast } from '../Toast/Toast';
import { handleApiError, handleSupabaseError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';

interface Transaction {
  id: string;
  subscription_id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transaction_type: string;
  receipt_url: string | null;
  created_at: string;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  succeeded: <CheckCircle className="h-[13px] w-[13px] text-accent-gold" />,
  failed:    <XCircle    className="h-[13px] w-[13px] text-red-600 dark:text-red-400" />,
  pending:   <Clock      className="h-[13px] w-[13px] text-amber-600 dark:text-amber-400" />,
  refunded:  <RotateCcw  className="h-[13px] w-[13px] text-muted-ink dark:text-muted-ink-on-dark" />,
};

const STATUS_LABEL: Record<string, string> = {
  succeeded: 'Paid', failed: 'Failed', pending: 'Pending', refunded: 'Refunded',
};

const STATUS_BORDER: Record<string, string> = {
  succeeded: 'border-l-accent-gold',
  failed:    'border-l-red-600',
  pending:   'border-l-amber-500',
  refunded:  'border-l-muted-ink',
};

const STATUS_TEXT_COLOR: Record<string, string> = {
  succeeded: 'text-accent-gold',
  failed:    'text-red-600 dark:text-red-400',
  pending:   'text-amber-600 dark:text-amber-400',
  refunded:  'text-muted-ink dark:text-muted-ink-on-dark',
};

const TX_TYPE_LABEL: Record<string, string> = {
  subscription_payment: 'Subscription',
  trial_conversion:     'Trial Upgrade',
  refund:               'Refund',
};

export const BillingHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { error: showErrorToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;

    if (isOffline()) {
      handleOfflineError(showErrorToast);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // RLS: users can SELECT own rows where user_id = auth.uid() (see DB policies).
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        const message = handleSupabaseError(error, { component: 'BillingHistoryPage', action: 'fetchTransactions' });
        showErrorToast(message);
        ErrorLogger.error(error, { component: 'BillingHistoryPage', action: 'fetchTransactions' });
        return;
      }

      setTransactions(data || []);
    } catch (err) {
      const message = handleApiError(err, { component: 'BillingHistoryPage', action: 'fetchTransactions' });
      showErrorToast(message);
      ErrorLogger.error(err, { component: 'BillingHistoryPage', action: 'fetchTransactions' });
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (transaction: Transaction) => {
    setDownloadingReceipt(transaction.id);

    try {
      const receiptContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">Payment Receipt</h1>
            <p style="color: #6b7280; font-size: 14px;">Thank you for your payment</p>
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Receipt Number:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold;">${transaction.id.slice(0, 8).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Date:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold;">${new Date(transaction.created_at).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Payment Method:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold;">${transaction.payment_method === 'card' ? 'Credit Card' : transaction.payment_method}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Status:</td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #10b981;">${transaction.status.toUpperCase()}</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #374151; font-size: 18px; margin-bottom: 15px;">Payment Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                  <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 14px;">Description</th>
                  <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 14px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 15px 12px;">Subscription Payment</td>
                  <td style="padding: 15px 12px; text-align: right; font-weight: bold;">${formatCurrency(transaction.amount, transaction.currency.toUpperCase())}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style="background: #f9fafb;">
                  <td style="padding: 15px 12px; font-weight: bold; font-size: 16px;">Total Paid</td>
                  <td style="padding: 15px 12px; text-align: right; font-weight: bold; font-size: 18px; color: #1e40af;">${formatCurrency(transaction.amount, transaction.currency.toUpperCase())}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="color: #1e40af; margin: 0; font-size: 14px;">
              <strong>Note:</strong> This receipt is for your records. For any questions about your subscription, please contact our support team.
            </p>
          </div>

          <div style="text-align: center; color: #9ca3af; font-size: 12px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
            <p style="margin-top: 10px;">Transaction ID: ${transaction.stripe_payment_intent_id || transaction.id}</p>
          </div>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `receipt-${transaction.id.slice(0, 8)}-${new Date(transaction.created_at).toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };

      const element = document.createElement('div');
      element.innerHTML = receiptContent;

      const { default: html2pdf } = await import('html2pdf.js');
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      const message = handleApiError(err, { component: 'BillingHistoryPage', action: 'downloadReceipt', transactionId: transaction.id });
      showErrorToast(message);
      ErrorLogger.error(err, { component: 'BillingHistoryPage', action: 'downloadReceipt', transactionId: transaction.id });
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const byMonth = useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    for (const tx of transactions) {
      const key = new Date(tx.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(tx);
    }
    return groups;
  }, [transactions]);

  const succeededTxs = useMemo(() => transactions.filter(tx => tx.status === 'succeeded'), [transactions]);
  const totalPaid = useMemo(() => succeededTxs.reduce((sum, tx) => sum + tx.amount, 0), [succeededTxs]);

  const currency = transactions[0]?.currency?.toUpperCase() ?? 'USD';

  if (loading) {
    return (
      <div className="min-h-screen bg-page-light dark:bg-page-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold mx-auto" />
          <p className="mt-4 text-muted-ink dark:text-muted-ink-on-dark">Loading billing history…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-light dark:bg-page-dark p-6">
      <div className="max-w-5xl mx-auto">

        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-ink dark:text-muted-ink-on-dark hover:opacity-75 transition mb-5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-[12px]">Back to Subscription</span>
        </button>

        {/* ── v4 dark ink header ─────────────────────────────────────── */}
        <div className="bg-sidebar px-7 py-5 mb-6">
          <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase mb-1.5">Account</div>
          <div className="flex items-end justify-between">
            <div className="font-display text-[28px] font-semibold text-ink-on-dark tracking-[-0.4px]">Billing History.</div>
            {transactions.length > 0 && (
              <div className="text-right">
                <div className="font-display text-[24px] font-bold text-ink-on-dark">{formatCurrency(totalPaid, currency)}</div>
                <div className="text-[10px] text-ink-on-dark/40">total charged · {succeededTxs.length} payments</div>
              </div>
            )}
          </div>
        </div>

        {transactions.length === 0 ? (
          /* ── Empty state ─────────────────────────────────────────────── */
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark flex flex-col items-center justify-center py-[60px] text-center">
            <div className="w-14 h-14 bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark rounded-full flex items-center justify-center mb-5">
              <Receipt className="h-6 w-6 text-muted-ink dark:text-muted-ink-on-dark" />
            </div>
            <div className="font-display text-[20px] font-semibold text-ink dark:text-ink-on-dark mb-2">No billing history</div>
            <div className="text-[13px] text-muted-ink dark:text-muted-ink-on-dark leading-relaxed max-w-[340px]">
              Your transactions will appear here once you've made a payment. Free plan users don't have billing history.
            </div>
          </div>
        ) : (
          <>
            {/* ── Transaction rows grouped by month ─────────────────────── */}
            {Array.from(byMonth.entries()).map(([month, rows]) => (
              <div key={month} className="mb-[18px]">
                {/* Month header */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-bold tracking-[2px] uppercase text-accent-gold whitespace-nowrap">{month}</span>
                  <div className="flex-1 h-px bg-divider dark:bg-divider-on-dark" />
                </div>
                {rows.map((tx, i) => {
                  const borderClass = STATUS_BORDER[tx.status] ?? 'border-l-muted-ink';
                  const textColor   = STATUS_TEXT_COLOR[tx.status] ?? 'text-muted-ink dark:text-muted-ink-on-dark';
                  const label       = STATUS_LABEL[tx.status] ?? tx.status;
                  return (
                    <div
                      key={tx.id}
                      className={`flex items-center bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark border-l-[3px] ${borderClass} px-4 py-3 gap-3.5 mb-[1px]`}
                    >
                      {/* Status icon */}
                      <div className="w-10 flex-shrink-0 flex items-center justify-center">
                        {STATUS_ICON[tx.status] ?? STATUS_ICON.pending}
                      </div>

                      {/* Description */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-semibold text-ink dark:text-ink-on-dark leading-tight mb-[2px]">
                          {TX_TYPE_LABEL[tx.transaction_type] ?? 'Payment'}
                        </div>
                        <div className="text-[10.5px] text-muted-ink dark:text-muted-ink-on-dark">
                          {tx.transaction_type !== 'trial_conversion'
                            ? new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : 'Trial upgrade'}
                        </div>
                      </div>

                      {/* Amount + status label */}
                      <div className="text-right flex-shrink-0">
                        <div className="font-display text-[15px] font-bold text-ink dark:text-ink-on-dark">
                          {formatCurrency(tx.amount, tx.currency.toUpperCase())}
                        </div>
                        <div className={`text-[10px] font-semibold ${textColor}`}>{label}</div>
                      </div>

                      {/* Vertical divider */}
                      <div className="w-px h-7 bg-divider dark:bg-divider-on-dark flex-shrink-0" />

                      {/* Receipt button */}
                      <div className="w-[88px] flex-shrink-0 flex items-center justify-center">
                        {tx.status === 'succeeded' ? (
                          <button
                            onClick={() => downloadReceipt(tx)}
                            disabled={downloadingReceipt === tx.id}
                            className="w-full py-[5px] border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark text-[10.5px] text-center hover:opacity-75 transition disabled:opacity-40 flex items-center justify-center gap-1"
                          >
                            {downloadingReceipt === tx.id ? (
                              <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" /><span>…</span></>
                            ) : (
                              <><Download className="h-3 w-3" /><span>Receipt</span></>
                            )}
                          </button>
                        ) : (
                          <span className="text-[10.5px] text-muted-ink dark:text-muted-ink-on-dark text-center w-full block">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Note */}
            <div className="mt-1 px-[14px] py-[10px] bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark text-[11px] text-muted-ink dark:text-muted-ink-on-dark">
              Receipts are generated as PDFs. For disputes: <span className="text-secondary-ink dark:text-muted-ink-on-dark">support@scholar.app</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
