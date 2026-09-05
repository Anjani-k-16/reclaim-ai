import React, { useState, useEffect } from 'react';
import { Sliders, Zap, ShieldAlert, ArrowRight, RefreshCw, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CounterfactualSimulator() {
  const [amount, setAmount] = useState(8500);
  const [failureReason, setFailureReason] = useState('BANK_TIMEOUT');
  const [retryCount, setRetryCount] = useState(1);
  const [riskScore, setRiskScore] = useState(0.15);
  const [customerSegment, setCustomerSegment] = useState('REGULAR');
  
  const [simResult, setSimResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const evaluateSimulator = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/simulator/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          failure_reason: failureReason,
          retry_count: retryCount,
          risk_score: riskScore,
          customer_segment: customerSegment
        })
      });
      const data = await res.json();
      setSimResult(data);
    } catch (err) {
      console.error('Simulator evaluation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    evaluateSimulator();
  }, [amount, failureReason, retryCount, riskScore, customerSegment]);

  const evData = simResult?.ev_breakdown
    ? Object.keys(simResult.ev_breakdown).map(act => ({
        name: act,
        ev: Math.round(simResult.ev_breakdown[act].expected_value),
        p: Math.round(simResult.ev_breakdown[act].p_recovery * 100)
      }))
    : [];

  const ACTION_COLORS = {
    RETRY: '#3b82f6',
    REMINDER: '#8b5cf6',
    ESCALATE: '#f59e0b',
    STOP: '#f43f5e'
  };

  return (
    <div className="glass-panel p-6 marginTop-6" style={{ marginTop: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div className="badge badge-reminder" style={{ marginBottom: '6px' }}>
            <Sliders size={12} /> Counterfactual Recovery Simulator
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
            Interactive Decision & Expected Value Sandbox
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Tweak transaction parameters to witness RECLAIM's probability model, EV formula, and guardrails recalculate live.
          </p>
        </div>

        {simResult && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>RECLAIM Recommended Action</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }} className="font-mono">
              {simResult.final_action}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Sliders & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Amount Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Transaction Amount</span>
              <span style={{ color: '#fff', fontWeight: 700 }} className="font-mono">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={500}
              max={50000}
              step={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#3b82f6' }}
            />
          </div>

          {/* Retry Count Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Previous Retries</span>
              <span style={{ color: '#fff', fontWeight: 700 }} className="font-mono">{retryCount} / 3</span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              step={1}
              value={retryCount}
              onChange={(e) => setRetryCount(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#8b5cf6' }}
            />
          </div>

          {/* Risk Score Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Customer Risk Score</span>
              <span style={{ color: riskScore > 0.6 ? '#f87171' : '#34d399', fontWeight: 700 }} className="font-mono">{riskScore.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.95}
              step={0.05}
              value={riskScore}
              onChange={(e) => setRiskScore(Number(e.target.value))}
              style={{ width: '100%', accentColor: riskScore > 0.6 ? '#f43f5e' : '#10b981' }}
            />
          </div>

          {/* Failure Reason Selector */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Payment Failure Cause
            </label>
            <select
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            >
              <option value="BANK_TIMEOUT">BANK TIMEOUT (Transient gateway network lag)</option>
              <option value="INSUFFICIENT_FUNDS">INSUFFICIENT FUNDS (Customer balance constraint)</option>
              <option value="ABANDONED_CHECKOUT">ABANDONED CHECKOUT (2FA OTP drop-off)</option>
              <option value="SUBSCRIPTION_LAPSE">SUBSCRIPTION LAPSE (Recurring mandate failure)</option>
              <option value="SUSPICIOUS_REPEATS">SUSPICIOUS REPEATS (High velocity fraud alert)</option>
              <option value="CARD_EXPIRED">CARD EXPIRED (Expired payment instrument)</option>
            </select>
          </div>

        </div>

        {/* Live Simulation Graph & Reasoning */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  formatter={(val, name, item) => [`₹${val.toLocaleString('en-IN')} (P: ${item.payload.p}%)`, 'Expected Value']}
                />
                <Bar dataKey="ev" radius={[6, 6, 0, 0]}>
                  {evData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ACTION_COLORS[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Reasoning & Guardrail box */}
          {simResult && (
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px', fontSize: '0.82rem' }}>
              <div style={{ color: '#60a5fa', fontWeight: 700, marginBottom: '4px' }}>
                💡 Live Decision Rationale:
              </div>
              <p style={{ color: '#e2e8f0', lineHeight: 1.5 }}>
                {simResult.reasoning}
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
