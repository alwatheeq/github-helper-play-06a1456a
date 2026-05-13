import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Download, Receipt, Calendar, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
// html2pdf.js is dynamically imported on demand to keep it out of the initial bundle.
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <Clock className="h-4 w-4 text-muted-ink dark:text-muted-ink-on-dark" />;
    }
  };

  const getStatusLabel = (status: string): { label: string; className: string } => {
    const map: Record<string, { label: string; className: string }> = {
      succeeded: { label: 'Succeeded', className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' },
      failed: { label: 'Failed', className: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' },
      pending: { label: 'Pending', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' },
      refunded: { label: 'Refunded', className: 'bg-subtle dark:bg-subtle-on-dark text-muted-ink dark:text-muted-ink-on-dark' },
    };
    return map[status] || map.pending;
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
          <div className="font-display text-[28px] font-semibold text-card-light dark:text-ink-on-dark tracking-[-0.4px]">Billing History.</div>
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
            {/* ── Transaction table ─────────────────────────────────────── */}
            <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark overflow-hidden mb-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-divider dark:border-divider-on-dark bg-subtle dark:bg-subtle-on-dark">
                      <th className="px-5 py-3 text-left text-[9px] font-bold tracking-[1.5px] uppercase text-muted-ink dark:text-muted-ink-on-dark">Date</th>
                      <th className="px-5 py-3 text-left text-[9px] font-bold tracking-[1.5px] uppercase text-muted-ink dark:text-muted-ink-on-dark">Description</th>
                      <th className="px-5 py-3 text-left text-[9px] font-bold tracking-[1.5px] uppercase text-muted-ink dark:text-muted-ink-on-dark">Amount</th>
                      <th className="px-5 py-3 text-left text-[9px] font-bold tracking-[1.5px] uppercase text-muted-ink dark:text-muted-ink-on-dark">Status</th>
                      <th className="px-5 py-3 text-left text-[9px] font-bold tracking-[1.5px] uppercase text-muted-ink dark:text-muted-ink-on-dark">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-divider dark:divide-divider-on-dark">
                    {transactions.map((transaction) => {
                      const { label, className } = getStatusLabel(transaction.status);
                      return (
                        <tr key={transaction.id} className="bg-card-light dark:bg-card-dark hover:bg-subtle dark:hover:bg-subtle-on-dark transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-muted-ink dark:text-muted-ink-on-dark" />
                              <span className="text-[12px] text-ink dark:text-ink-on-dark">
                                {new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-display text-[13px] font-semibold text-ink dark:text-ink-on-dark leading-tight">
                              {transaction.transaction_type === 'subscription_payment'
                                ? 'Subscription Payment'
                                : transaction.transaction_type === 'trial_conversion'
                                ? 'Trial Conversion'
                                : 'Payment'}
                            </div>
                            <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mt-0.5">
                              {transaction.payment_method === 'card' ? 'Credit Card' : transaction.payment_method}
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-display text-[14px] font-semibold text-ink dark:text-ink-on-dark">
                              {formatCurrency(transaction.amount, transaction.currency.toUpperCase())}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(transaction.status)}
                              <span className={`text-[9px] tracking-wide font-bold px-2 py-0.5 ${className}`}>{label.toUpperCase()}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {transaction.status === 'succeeded' && (
                              <button
                                onClick={() => downloadReceipt(transaction)}
                                disabled={downloadingReceipt === transaction.id}
                                className="flex items-center gap-1.5 text-[11px] font-semibold text-accent-gold hover:opacity-75 transition disabled:opacity-40"
                              >
                                {downloadingReceipt === transaction.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-accent-gold" />
                                    <span>Generating…</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Download</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note */}
            <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-5 py-3">
              <p className="text-[12px] text-muted-ink dark:text-muted-ink-on-dark">
                <span className="font-semibold text-ink dark:text-ink-on-dark">Note:</span> Receipts are generated on demand. Successful Stripe payments are recorded here for your account.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
