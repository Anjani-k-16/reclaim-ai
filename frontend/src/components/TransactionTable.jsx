import React, { useState } from 'react';
import { Search, ChevronRight, AlertTriangle, Check } from 'lucide-react';

export default function TransactionTable({
  transactions,
  totalCount,
  currentPage,
  onPageChange,
  onSelectTransaction,
  selectedTxnId,
  onFilterChange,
  filters,
  guardrailFlagsCount
}) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchTerm });
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'RETRY': return <span className="badge badge-retry">Auto Retry</span>;
      case 'REMINDER': return <span className="badge badge-reminder">Payment Link</span>;
      case 'ESCALATE': return <span className="badge badge-escalate">Human Review</span>;
      case 'STOP': return <span className="badge badge-stop">Halt Retry</span>;
      default: return <span className="badge" style={{ background: 'rgba(255,255,255,0.03)', color: '#8A8375' }}>Pending</span>;
    }
  };

  const getGuardrailBadge = (status) => {
    if (!status || status === 'PASSED') {
      return (
        <span style={{ fontSize: '0.78rem', color: '#D4A853', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
          <Check size={14} /> Passed
        </span>
      );
    }
    return (
      <span className="badge badge-blocked">
        <AlertTriangle size={12} /> {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="fintech-card" style={{ padding: '24px', marginTop: '24px' }}>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#EDE8DD' }}>
              At-Risk Payment Batch Explorer
            </h3>
            {guardrailFlagsCount > 0 && (
              <span className="badge badge-escalate" style={{ fontSize: '0.72rem' }}>
                <AlertTriangle size={12} /> {guardrailFlagsCount} Policy Flags
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Showing {transactions.length} of {totalCount} analyzed payment failure cases
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <Search size={14} color="#8A8375" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search TXN, Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: '#15130F',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '8px 12px 8px 34px',
                color: '#EDE8DD',
                fontSize: '0.82rem',
                outline: 'none',
                width: '200px'
              }}
            />
          </form>

          <select
            value={filters.reason || ''}
            onChange={(e) => onFilterChange({ ...filters, reason: e.target.value })}
            style={{
              background: '#15130F',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '8px 12px',
              color: '#EDE8DD',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          >
            <option value="">All Failure Causes</option>
            <option value="BANK_TIMEOUT">Bank Timeout</option>
            <option value="INSUFFICIENT_FUNDS">Insufficient Funds</option>
            <option value="ABANDONED_CHECKOUT">Abandoned Checkout</option>
            <option value="SUBSCRIPTION_LAPSE">Subscription Lapse</option>
            <option value="SUSPICIOUS_REPEATS">Suspicious Repeats</option>
            <option value="CARD_EXPIRED">Card Expired</option>
          </select>

          <select
            value={filters.action || ''}
            onChange={(e) => onFilterChange({ ...filters, action: e.target.value })}
            style={{
              background: '#15130F',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '8px 12px',
              color: '#EDE8DD',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          >
            <option value="">All Recommended Actions</option>
            <option value="RETRY">Auto Retry</option>
            <option value="REMINDER">Payment Link</option>
            <option value="ESCALATE">Human Review</option>
            <option value="STOP">Halt Retry</option>
          </select>

        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.73rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '12px 14px' }}>Transaction ID</th>
              <th style={{ padding: '12px 14px' }}>Customer</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Amount (₹)</th>
              <th style={{ padding: '12px 14px' }}>Failure Cause</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Retries</th>
              <th style={{ padding: '12px 14px' }}>Recommended Action</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Expected EV</th>
              <th style={{ padding: '12px 14px' }}>Guardrail</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Audit</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => {
              const isSelected = txn.transaction_id === selectedTxnId;
              return (
                <tr
                  key={txn.transaction_id}
                  onClick={() => onSelectTransaction(txn.transaction_id)}
                  style={{
                    borderBottom: '1px solid rgba(51, 44, 32, 0.6)',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(212, 168, 83, 0.06)' : 'transparent',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <td style={{ padding: '14px' }} className="font-mono tabular-nums">
                    {txn.transaction_id}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 600, color: '#EDE8DD' }}>{txn.customer_name}</div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>{txn.customer_segment}</div>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', fontWeight: 700, color: '#EDE8DD' }} className="font-mono tabular-nums">
                    ₹{txn.amount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '3px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {txn.failure_reason.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', color: txn.retry_count > 3 ? '#C25B3F' : 'var(--text-secondary)' }} className="font-mono tabular-nums">
                    {txn.retry_count > 3 ? `${txn.retry_count} (Exceeds Max 3)` : `${txn.retry_count} of 3 Max`}
                  </td>
                  <td style={{ padding: '14px' }}>
                    {getActionBadge(txn.recommended_action)}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', fontWeight: 700, color: '#D4A853' }} className="font-mono tabular-nums">
                    {txn.expected_ev ? `₹${Math.round(txn.expected_ev).toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td style={{ padding: '14px' }}>
                    {getGuardrailBadge(txn.guardrail_status)}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                      Audit <ChevronRight size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          Page {currentPage} of {Math.ceil(totalCount / 50) || 1}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="btn-secondary"
            style={{ opacity: currentPage <= 1 ? 0.5 : 1, cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <button
            disabled={currentPage >= Math.ceil(totalCount / 50)}
            onClick={() => onPageChange(currentPage + 1)}
            className="btn-secondary"
            style={{ opacity: currentPage >= Math.ceil(totalCount / 50) ? 0.5 : 1, cursor: currentPage >= Math.ceil(totalCount / 50) ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}
