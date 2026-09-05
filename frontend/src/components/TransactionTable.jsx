import React, { useState } from 'react';
import { Search, Filter, ChevronRight, AlertTriangle, ShieldCheck, Zap, ArrowRight, ExternalLink } from 'lucide-react';

export default function TransactionTable({
  transactions,
  totalCount,
  currentPage,
  onPageChange,
  onSelectTransaction,
  selectedTxnId,
  onFilterChange,
  filters
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
      default: return <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>Pending</span>;
    }
  };

  const getGuardrailBadge = (status) => {
    if (!status || status === 'PASSED') {
      return <span className="badge badge-passed"><ShieldCheck size={12} /> Passed</span>;
    }
    return <span className="badge badge-blocked"><AlertTriangle size={12} /> {status.replace('_', ' ')}</span>;
  };

  return (
    <div className="glass-panel p-5 marginTop-6" style={{ marginTop: '24px' }}>
      
      {/* Controls Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            At-Risk Payment Batch Explorer
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {transactions.length} of {totalCount} analyzed payment failure cases
          </p>
        </div>

        {/* Filters & Search */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search TXN, Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px 8px 36px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                width: '200px'
              }}
            />
          </form>

          {/* Cause Filter */}
          <select
            value={filters.reason || ''}
            onChange={(e) => onFilterChange({ ...filters, reason: e.target.value })}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#fff',
              fontSize: '0.85rem',
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

          {/* Action Filter */}
          <select
            value={filters.action || ''}
            onChange={(e) => onFilterChange({ ...filters, action: e.target.value })}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#fff',
              fontSize: '0.85rem',
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

      {/* Table Component */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '12px 16px' }}>Transaction ID</th>
              <th style={{ padding: '12px 16px' }}>Customer</th>
              <th style={{ padding: '12px 16px' }}>Amount (₹)</th>
              <th style={{ padding: '12px 16px' }}>Failure Cause</th>
              <th style={{ padding: '12px 16px' }}>Retries</th>
              <th style={{ padding: '12px 16px' }}>Recommended Action</th>
              <th style={{ padding: '12px 16px' }}>Expected EV</th>
              <th style={{ padding: '12px 16px' }}>Guardrail</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Audit</th>
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
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    transition: 'background 0.15s ease'
                  }}
                  className="hover:bg-slate-800/50"
                >
                  <td style={{ padding: '14px 16px', fontWeight: 600 }} className="font-mono">
                    {txn.transaction_id}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{txn.customer_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{txn.customer_segment}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#fff' }} className="font-mono">
                    ₹{txn.amount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.06)',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)'
                    }}>
                      {txn.failure_reason.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }} className="font-mono text-slate-400">
                    {txn.retry_count}/3
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {getActionBadge(txn.recommended_action)}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#34d399' }} className="font-mono">
                    {txn.expected_ev ? `₹${Math.round(txn.expected_ev).toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {getGuardrailBadge(txn.guardrail_status)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                      Why? <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
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
