import React from 'react';
import { ShieldAlert, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';

export default function MetricsOverview({ stats }) {
  if (!stats || !stats.total_transactions) {
    return (
      <div style={{ padding: '24px 0', borderBottom: '1px solid #4A3F2E', color: '#A39B8B', fontSize: '0.85rem' }}>
        Select "Run Batch Analysis" to evaluate active payment failure cases.
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
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '36px',
      padding: '28px 0 36px 0',
      borderBottom: '1px solid #4A3F2E'
    }}>
      
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <ShieldAlert size={16} color="#C25B3F" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#A39B8B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue at Risk</span>
        </div>
        <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#C25B3F', letterSpacing: '-0.02em', marginBottom: '4px' }} className="font-serif">
          {formatINR(riskAmount)}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#A39B8B', fontFamily: 'var(--font-mono)' }}>
          {stats.total_transactions} transactions analyzed
        </div>
      </div>

      <div style={{ borderLeft: '1px solid #4A3F2E', paddingLeft: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <TrendingUp size={16} color="#E8B84A" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#A39B8B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recoverable Revenue (EV)</span>
        </div>
        <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#E8B84A', letterSpacing: '-0.02em', marginBottom: '4px', textShadow: '0 0 16px rgba(232, 184, 74, 0.2)' }} className="font-serif">
          {formatINR(recoveredAmount)}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#E8B84A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={13} /> Net Expected Recovery
        </div>
      </div>

      <div style={{ borderLeft: '1px solid #4A3F2E', paddingLeft: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Zap size={16} color="#7DD8E8" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#A39B8B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recovery Efficiency Rate</span>
        </div>
        <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#EDE8DD', letterSpacing: '-0.02em', marginBottom: '4px' }} className="font-serif">
          {ratePct}%
        </div>
        <div style={{ fontSize: '0.78rem', color: '#A39B8B' }}>
          Optimized EV vs blind retries
        </div>
      </div>

    </div>
  );
}
