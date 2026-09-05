import React, { useState, useEffect } from 'react';
import { Play, RefreshCw, Shield, Zap, ExternalLink, Activity, CheckCircle, Database } from 'lucide-react';
import MetricsOverview from './components/MetricsOverview';
import AnalyticsCharts from './components/AnalyticsCharts';
import TransactionTable from './components/TransactionTable';
import ExplainabilityDrawer from './components/ExplainabilityDrawer';
import CounterfactualSimulator from './components/CounterfactualSimulator';

export default function App() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [selectedTxnId, setSelectedTxnId] = useState(null);
  const [transactionDetail, setTransactionDetail] = useState(null);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('EXPLORER'); // EXPLORER | SIMULATOR

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 50,
        ...filters
      });
      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  const fetchTransactionDetail = async (txnId) => {
    if (!txnId) {
      setTransactionDetail(null);
      return;
    }
    try {
      const res = await fetch(`/api/transactions/${txnId}`);
      const data = await res.json();
      setTransactionDetail(data);
    } catch (err) {
      console.error('Failed to fetch transaction detail:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, [currentPage, filters]);

  useEffect(() => {
    if (selectedTxnId) {
      fetchTransactionDetail(selectedTxnId);
    } else {
      setTransactionDetail(null);
    }
  }, [selectedTxnId]);

  const handleRunBatch = async () => {
    setIsBatchRunning(true);
    try {
      await fetch('/api/engine/run-batch', { method: 'POST' });
      await fetchStats();
      await fetchTransactions();
    } catch (err) {
      console.error('Failed to run batch engine:', err);
    } finally {
      setIsBatchRunning(false);
    }
  };

  const handleResetBatch = async () => {
    try {
      await fetch('/api/dataset/generate', { method: 'POST' });
      setSelectedTxnId(null);
      setTransactionDetail(null);
      await fetchStats();
      await fetchTransactions();
    } catch (err) {
      console.error('Failed to reset dataset:', err);
    }
  };

  const handleExecuteAction = async (txnId) => {
    try {
      await fetch(`/api/transactions/${txnId}/execute`, { method: 'POST' });
      await fetchTransactionDetail(txnId);
      await fetchStats();
      await fetchTransactions();
    } catch (err) {
      console.error('Action execution failed:', err);
    }
  };

  const handleOverrideAction = async (txnId, action, notes) => {
    try {
      await fetch(`/api/transactions/${txnId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes })
      });
      await fetchTransactionDetail(txnId);
      await fetchStats();
      await fetchTransactions();
    } catch (err) {
      console.error('Override action failed:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Header Bar */}
      <header style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '28px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
          }}>
            <Zap size={26} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                RECLAIM
              </h1>
              <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                Track 3 — AI Revenue Recovery
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Risk-Aware Expected-Value Revenue Recovery & Intervention Engine
            </p>
          </div>
        </div>

        {/* Action Controls & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          <div className="badge badge-passed">
            <div className="pulse-dot" /> Razorpay Test Mode Active
          </div>

          <button
            onClick={handleRunBatch}
            disabled={isBatchRunning}
            className="btn-primary"
          >
            {isBatchRunning ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
            {isBatchRunning ? 'Analyzing Batch...' : 'Run Engine Batch Analysis'}
          </button>

          <button
            onClick={handleResetBatch}
            className="btn-secondary"
            title="Generate new 300 synthetic at-risk dataset"
          >
            <Database size={16} /> Reset Batch
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {/* KPI Metrics */}
        <MetricsOverview stats={stats} />

        {/* Visual Charts */}
        <AnalyticsCharts stats={stats} />

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '28px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('EXPLORER')}
            style={{
              background: activeTab === 'EXPLORER' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              border: activeTab === 'EXPLORER' ? '1px solid #3b82f6' : '1px solid transparent',
              color: activeTab === 'EXPLORER' ? '#60a5fa' : 'var(--text-muted)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Activity size={16} /> At-Risk Batch Explorer (300 Txns)
          </button>

          <button
            onClick={() => setActiveTab('SIMULATOR')}
            style={{
              background: activeTab === 'SIMULATOR' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              border: activeTab === 'SIMULATOR' ? '1px solid #8b5cf6' : '1px solid transparent',
              color: activeTab === 'SIMULATOR' ? '#c084fc' : 'var(--text-muted)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Zap size={16} /> Counterfactual Recovery Simulator
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'EXPLORER' ? (
          <TransactionTable
            transactions={transactions}
            totalCount={totalCount}
            currentPage={currentPage}
            onPageChange={(p) => setCurrentPage(p)}
            onSelectTransaction={(id) => setSelectedTxnId(id)}
            selectedTxnId={selectedTxnId}
            onFilterChange={(newFilters) => {
              setFilters(newFilters);
              setCurrentPage(1);
            }}
            filters={filters}
          />
        ) : (
          <CounterfactualSimulator />
        )}
      </main>

      {/* Explainability Drawer */}
      {selectedTxnId && (
        <ExplainabilityDrawer
          transactionDetail={transactionDetail}
          onClose={() => setSelectedTxnId(null)}
          onExecuteAction={handleExecuteAction}
          onOverrideAction={handleOverrideAction}
        />
      )}

    </div>
  );
}
