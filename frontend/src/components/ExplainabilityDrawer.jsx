import React, { useState } from 'react';
import { X, ExternalLink, Zap, CheckCircle2, RefreshCw, Lock, UserCheck, Search, Activity } from 'lucide-react';

export default function ExplainabilityDrawer({ transactionDetail, onClose, onExecuteAction, onOverrideAction }) {
  if (!transactionDetail) return null;

  const { transaction: txn, evaluation: evalRes, execution } = transactionDetail;
  const [overrideAction, setOverrideAction] = useState(evalRes?.final_action || 'REMINDER');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    setIsExecuting(true);
    await onExecuteAction(txn.transaction_id);
    setIsExecuting(false);
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    await onOverrideAction(txn.transaction_id, overrideAction, overrideNotes);
  };

  const evData = evalRes?.ev_breakdown || {};
  const probs = evalRes?.probabilities || {};

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      maxWidth: '520px',
      background: '#0B0E14',
      borderLeft: '1px solid #1E2430',
      boxShadow: '-16px 0 40px rgba(0,0,0,0.9)',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1E2430', paddingBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Decision Audit Trail
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#E8EAED', marginTop: '2px' }} className="font-mono tabular-nums">
            {txn.transaction_id}
          </h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px' }}>
          <X size={18} />
        </button>
      </div>

      <div className="fintech-card" style={{ padding: '18px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>Amount at Risk</span>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#E8EAED', marginTop: '2px' }} className="font-mono tabular-nums">
              ₹{txn.amount.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>Customer LTV</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38BDF8', marginTop: '2px' }} className="font-mono tabular-nums">
              ₹{txn.historical_ltv.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>Failure Reason</span>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#E8EAED', marginTop: '2px' }}>
              {txn.failure_reason.replace(/_/g, ' ')}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>Risk Score</span>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: txn.risk_score > 0.6 ? '#E8546B' : '#2DD4A7', marginTop: '2px' }} className="tabular-nums">
              {txn.risk_score} {txn.risk_score > 0.6 ? '(High Risk)' : '(Safe)'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'rgba(45, 212, 167, 0.04)', border: '1px solid rgba(45, 212, 167, 0.2)', borderRadius: '6px', padding: '16px', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2DD4A7', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <Search size={14} /> Diagnostic Root Cause
        </h4>
        <p style={{ fontSize: '0.85rem', color: '#E8EAED', marginBottom: '8px', lineHeight: 1.4 }}>
          {evalRes.diagnosis?.summary}
        </p>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <strong>Strategy:</strong> {evalRes.diagnosis?.recommended_strategy}
        </div>
      </div>

      <div className="fintech-card" style={{ padding: '18px', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E8EAED', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={15} color="#2DD4A7" /> Counterfactual Expected Value Comparison
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.keys(evData).map((action) => {
            const item = evData[action];
            const isSelected = action === evalRes.final_action;
            const pPct = Math.round(item.p_recovery * 100);
            
            return (
              <div
                key={action}
                style={{
                  background: isSelected ? 'rgba(45, 212, 167, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? '1px solid #2DD4A7' : '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', color: isSelected ? '#2DD4A7' : '#E8EAED' }}>
                    {action} {isSelected && '(RECLAIM Selected)'}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isSelected ? '#2DD4A7' : 'var(--text-secondary)' }} className="font-mono tabular-nums">
                    EV: ₹{Math.round(item.expected_value).toLocaleString('en-IN')}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                  <span>P(Recovery): {pPct}%</span>
                  <span>Action Cost: ₹{item.cost}</span>
                  {item.penalty > 0 && <span style={{ color: '#E8546B' }}>Friction Penalty: -₹{item.penalty}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fintech-card" style={{ padding: '18px', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E8EAED', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Lock size={15} color="#E8A23D" /> Merchant Policy Guardrails
        </h4>
        
        <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Max Retry Limit (&le; 3 retries):</span>
            <span style={{ fontWeight: 600, color: txn.retry_count >= 3 ? '#E8546B' : '#2DD4A7' }}>
              {txn.retry_count}/3 {txn.retry_count >= 3 ? '(Exceeded)' : '(Passed)'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>High-Value Threshold (&lt; ₹15,000):</span>
            <span style={{ fontWeight: 600, color: txn.amount >= 15000 ? '#E8A23D' : '#2DD4A7' }}>
              ₹{txn.amount.toLocaleString('en-IN')} {txn.amount >= 15000 ? '(Requires Review)' : '(Passed)'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Fraud & Velocity Filter:</span>
            <span style={{ fontWeight: 600, color: txn.risk_score > 0.7 ? '#E8546B' : '#2DD4A7' }}>
              {txn.risk_score > 0.7 ? 'Flagged Risk' : 'Clean'}
            </span>
          </div>
        </div>

        {evalRes.override_reason && (
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: '#E8A23D' }}>
            <strong>Policy Flag:</strong> {evalRes.override_reason}
          </div>
        )}
      </div>

      <div className="fintech-card" style={{ padding: '18px', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E8EAED', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={15} color="#2DD4A7" /> Razorpay Recovery Execution
        </h4>

        {execution ? (
          <div style={{ background: 'rgba(45, 212, 167, 0.08)', border: '1px solid #2DD4A7', borderRadius: '6px', padding: '12px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2DD4A7', marginBottom: '4px' }}>
              Action Executed: {execution.action_executed}
            </div>
            <p style={{ fontSize: '0.78rem', color: '#E8EAED', marginBottom: '8px' }}>
              {execution.message}
            </p>
            {execution.razorpay_details?.short_url && (
              <a
                href={execution.razorpay_details.short_url}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.78rem', color: '#38BDF8', display: 'inline-flex', alignItems: 'center', gap: '4px', wordBreak: 'break-all' }}
              >
                Razorpay Test Link: {execution.razorpay_details.short_url} <ExternalLink size={12} />
              </a>
            )}
          </div>
        ) : (
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            {isExecuting ? <RefreshCw className="animate-spin" size={15} /> : <Zap size={15} />}
            Execute {evalRes.final_action} via Razorpay Test Mode
          </button>
        )}
      </div>

      <form onSubmit={handleOverrideSubmit} className="fintech-card" style={{ padding: '18px', marginTop: 'auto' }}>
        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#E8EAED', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserCheck size={15} color="#2DD4A7" /> Manager Manual Override
        </h4>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={overrideAction}
            onChange={(e) => setOverrideAction(e.target.value)}
            style={{
              flex: 1,
              background: '#0B0E14',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '8px 10px',
              color: '#E8EAED',
              fontSize: '0.82rem'
            }}
          >
            <option value="RETRY">Force RETRY</option>
            <option value="REMINDER">Send Payment Link (REMINDER)</option>
            <option value="ESCALATE">Escalate to Support (ESCALATE)</option>
            <option value="STOP">Halt Retries (STOP)</option>
          </select>
          
          <button type="submit" className="btn-secondary" style={{ fontSize: '0.78rem' }}>
            Override
          </button>
        </div>
      </form>

    </div>
  );
}
