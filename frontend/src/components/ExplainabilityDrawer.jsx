import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, ExternalLink, Zap, CheckCircle2, RefreshCw, Lock, ArrowRight, UserCheck } from 'lucide-react';

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
      background: '#0a0f1d',
      borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '-12px 0 40px rgba(0,0,0,0.8)',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Decision Audit Trail
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }} className="font-mono">
            {txn.transaction_id}
          </h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}>
          <X size={22} />
        </button>
      </div>

      {/* Transaction Snapshot */}
      <div className="glass-panel p-4 mb-5" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Amount at Risk</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }} className="font-mono">
              ₹{txn.amount.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Customer LTV</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#60a5fa' }} className="font-mono">
              ₹{txn.historical_ltv.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Failure Reason</span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fca5a5' }}>
              {txn.failure_reason.replace('_', ' ')}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Risk Score</span>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: txn.risk_score > 0.6 ? '#f87171' : '#34d399' }}>
              {txn.risk_score} {txn.risk_score > 0.6 ? '(High Risk)' : '(Safe)'}
            </div>
          </div>
        </div>
      </div>

      {/* Diagnosis Summary Box */}
      <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🔎 RECLAIM Diagnostic Root Cause
        </h4>
        <p style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '8px' }}>
          {evalRes.diagnosis?.summary}
        </p>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <strong>Strategy:</strong> {evalRes.diagnosis?.recommended_strategy}
        </div>
      </div>

      {/* Expected Value Matrix */}
      <div className="glass-panel p-4 mb-5" style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
          📊 Counterfactual Expected Value Comparison
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.keys(evData).map((action) => {
            const item = evData[action];
            const isSelected = action === evalRes.final_action;
            const pPct = Math.round(item.p_recovery * 100);
            
            return (
              <div
                key={action}
                style={{
                  background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid #10b981' : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? '#34d399' : '#fff' }}>
                    {action} {isSelected && '✓ (RECLAIM Selected)'}
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: isSelected ? '#34d399' : 'var(--text-muted)' }} className="font-mono">
                    EV: ₹{Math.round(item.expected_value).toLocaleString('en-IN')}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  <span>P(Recovery): {pPct}%</span>
                  <span>Action Cost: ₹{item.cost}</span>
                  {item.penalty > 0 && <span style={{ color: '#f87171' }}>Friction Penalty: -₹{item.penalty}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guardrail Status Checklist */}
      <div className="glass-panel p-4 mb-5" style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Lock size={16} color="#fbbf24" /> Merchant Policy Guardrails
        </h4>
        
        <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <span>Max Retry Count Limit (&le; 3 retries):</span>
            <span style={{ marginLeft: 'auto', fontWeight: 600, color: txn.retry_count >= 3 ? '#f87171' : '#34d399' }}>
              {txn.retry_count}/3 {txn.retry_count >= 3 ? '❌ (Exceeded)' : '✓'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <span>High-Value Threshold Approval (&lt; ₹15,000):</span>
            <span style={{ marginLeft: 'auto', fontWeight: 600, color: txn.amount >= 15000 ? '#fbbf24' : '#34d399' }}>
              ₹{txn.amount.toLocaleString('en-IN')} {txn.amount >= 15000 ? '⚠️ (Human Approval)' : '✓'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <span>Fraud & Velocity Abuse Filter:</span>
            <span style={{ marginLeft: 'auto', fontWeight: 600, color: txn.risk_score > 0.7 ? '#f87171' : '#34d399' }}>
              {txn.risk_score > 0.7 ? '❌ Flagged Risk' : '✓ Clean'}
            </span>
          </div>
        </div>

        {evalRes.override_reason && (
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem', color: '#fcd34d' }}>
            ⚠️ <strong>Policy Alert:</strong> {evalRes.override_reason}
          </div>
        )}
      </div>

      {/* Razorpay Action Trigger / Execution Result */}
      <div className="glass-panel p-4 mb-5" style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
          ⚡ Razorpay Recovery Execution
        </h4>

        {execution ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '10px', padding: '12px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>
              Action Executed: {execution.action_executed}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#e2e8f0', marginBottom: '8px' }}>
              {execution.message}
            </p>
            {execution.razorpay_details?.short_url && (
              <a
                href={execution.razorpay_details.short_url}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '0.8rem', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '4px', wordBreak: 'break-all' }}
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
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isExecuting ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
            Execute {evalRes.final_action} via Razorpay Test Mode
          </button>
        )}
      </div>

      {/* Human Override Controls */}
      <form onSubmit={handleOverrideSubmit} className="glass-panel p-4" style={{ marginTop: 'auto' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <UserCheck size={16} color="#3b82f6" /> Human Manager Intervention Override
        </h4>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <select
            value={overrideAction}
            onChange={(e) => setOverrideAction(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '8px',
              color: '#fff',
              fontSize: '0.85rem'
            }}
          >
            <option value="RETRY">Force RETRY</option>
            <option value="REMINDER">Send Payment Link (REMINDER)</option>
            <option value="ESCALATE">Escalate to Support (ESCALATE)</option>
            <option value="STOP">Halt Retries (STOP)</option>
          </select>
          
          <button type="submit" className="btn-secondary" style={{ fontSize: '0.8rem' }}>
            Override
          </button>
        </div>
      </form>

    </div>
  );
}
