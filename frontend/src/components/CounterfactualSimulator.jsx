import React, { useState, useEffect } from 'react';
import { Sliders, Cpu } from 'lucide-react';
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
    RETRY: '#D4A853',
    REMINDER: '#C49240',
    ESCALATE: '#B86C35',
    STOP: '#A8503D'
  };

  return (
    <div className="fintech-card" style={{ padding: '24px', marginTop: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div className="badge badge-reminder" style={{ marginBottom: '6px' }}>
            <Sliders size={12} /> Counterfactual Recovery Simulator
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#EDE8DD' }}>
            Interactive Decision & Expected Value Sandbox
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Adjust transaction parameters to observe real-time expected value graph and guardrail recalculations.
          </p>
        </div>

        {simResult && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended Action</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#D4A853', marginTop: '2px' }} className="font-mono">
              {simResult.final_action}
            </div>
          </div>
        )}
      </div>

      {simResult && (
        <div style={{
          background: 'rgba(212, 168, 83, 0.05)',
          borderLeft: '4px solid #D4A853',
          borderTop: '1px solid rgba(212, 168, 83, 0.15)',
          borderRight: '1px solid rgba(212, 168, 83, 0.15)',
          borderBottom: '1px solid rgba(212, 168, 83, 0.15)',
          borderRadius: '0 4px 4px 0',
          padding: '16px 20px',
          marginBottom: '24px'
        }}>
          <div style={{ color: '#D4A853', fontWeight: 700, fontSize: '0.8rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
            <Cpu size={14} /> RECLAIM AI Decision Rationale
          </div>
          <p style={{ color: '#EDE8DD', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.5 }}>
            {simResult.reasoning}
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Transaction Amount</span>
              <span style={{ color: '#EDE8DD', fontWeight: 700 }} className="font-mono tabular-nums">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={500}
              max={50000}
              step={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#D4A853' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Previous Retries</span>
              <span style={{ color: retryCount > 3 ? '#C25B3F' : '#EDE8DD', fontWeight: 700 }} className="font-mono tabular-nums">
                {retryCount > 3 ? `${retryCount} (Exceeds Policy Max of 3)` : `${retryCount} of 3 Max`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              step={1}
              value={retryCount}
              onChange={(e) => setRetryCount(Number(e.target.value))}
              style={{ width: '100%', accentColor: retryCount > 3 ? '#C25B3F' : '#C49240' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Customer Risk Score</span>
              <span style={{ color: riskScore > 0.6 ? '#A8503D' : '#D4A853', fontWeight: 700 }} className="font-mono tabular-nums">{riskScore.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.95}
              step={0.05}
              value={riskScore}
              onChange={(e) => setRiskScore(Number(e.target.value))}
              style={{ width: '100%', accentColor: riskScore > 0.6 ? '#A8503D' : '#D4A853' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Payment Failure Cause
            </label>
            <select
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              style={{
                width: '100%',
                background: '#15130F',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '9px 12px',
                color: '#EDE8DD',
                fontSize: '0.82rem'
              }}
            >
              <option value="BANK_TIMEOUT">BANK TIMEOUT (Gateway network lag)</option>
              <option value="INSUFFICIENT_FUNDS">INSUFFICIENT FUNDS (Customer balance constraint)</option>
              <option value="ABANDONED_CHECKOUT">ABANDONED CHECKOUT (2FA OTP drop-off)</option>
              <option value="SUBSCRIPTION_LAPSE">SUBSCRIPTION LAPSE (Recurring mandate failure)</option>
              <option value="SUSPICIOUS_REPEATS">SUSPICIOUS REPEATS (Velocity fraud alert)</option>
              <option value="CARD_EXPIRED">CARD EXPIRED (Expired payment instrument)</option>
            </select>
          </div>

        </div>

        <div style={{ height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={evData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#8A8375" fontSize={11} fontFamily="var(--font-mono)" />
              <YAxis stroke="#8A8375" fontSize={11} fontFamily="var(--font-mono)" />
              <Tooltip
                contentStyle={{ background: '#1F1B15', border: '1px solid #332C20', borderRadius: '4px', color: '#EDE8DD', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
                formatter={(val, name, item) => [`₹${val.toLocaleString('en-IN')} (P: ${item.payload.p}%)`, 'Expected Value']}
              />
              <Bar dataKey="ev" radius={[3, 3, 0, 0]}>
                {evData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={ACTION_COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
}
