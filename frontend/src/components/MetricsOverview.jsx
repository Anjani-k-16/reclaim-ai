import React from 'react';
import { DollarSign, TrendingUp, ShieldAlert, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function MetricsOverview({ stats }) {
  if (!stats || !stats.total_transactions) {
    return (
      <div className="glass-panel p-6 text-center text-slate-400">
        Click "Run RECLAIM Engine Batch Analysis" to evaluate 300 at-risk transactions.
      </div>
    );
  }

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const riskAmount = stats.total_revenue_at_risk || 0;
  const recoveredAmount = stats.total_expected_recovery || 0;
  const ratePct = stats.recovery_rate_pct || 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
      
      {/* Card 1: Revenue at Risk */}
      <div className="glass-panel p-5 relative overflow-hidden">
        <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '90px', height: '90px', background: 'rgba(244, 63, 94, 0.12)', borderRadius: '50%', blur: '20px' }} />
        <div className="flex items-center justify-between mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Revenue at Risk</span>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={20} color="#f43f5e" />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          {formatINR(riskAmount)}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          {stats.total_transactions} transactions analyzed
        </div>
      </div>

      {/* Card 2: Revenue Recoverable (EV) */}
      <div className="glass-panel p-5 relative overflow-hidden" style={{ borderLeft: '3px solid #10b981' }}>
        <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '90px', height: '90px', background: 'rgba(16, 185, 129, 0.12)', borderRadius: '50%', blur: '20px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Recoverable Revenue (EV)</span>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} color="#10b981" />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          {formatINR(recoveredAmount)}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle2 size={14} /> Expected Net Recovery
        </div>
      </div>

      {/* Card 3: Recovery Rate % */}
      <div className="glass-panel p-5 relative overflow-hidden">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Recovery Efficiency Rate</span>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="#3b82f6" />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          {ratePct}%
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          Optimized EV vs blind retries
        </div>
      </div>

      {/* Card 4: Guardrail Overrides */}
      <div className="glass-panel p-5 relative overflow-hidden">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Policy Guardrail Flags</span>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} color="#f59e0b" />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '-0.02em', marginBottom: '4px' }}>
          {stats.guardrail_overrides || 0}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          {stats.human_review_required || 0} required human escalation
        </div>
      </div>

    </div>
  );
}
