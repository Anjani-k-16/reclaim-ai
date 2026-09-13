import React, { useState, useEffect } from 'react';
import { Play, RefreshCw, Zap, Activity, Database, LayoutDashboard } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('EXPLORER');

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
    <div style={{ minHeight: '100vh', padding: '36px 48px', maxWidth: '1480px', margin: '0 auto' }}>
      
      <header style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '36px',
        paddingBottom: '24px',
        borderBottom: '1px solid #4A3F2E'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '6px',
            background: 'rgba(125, 216, 232, 0.08)',
            border: '1px solid rgba(125, 216, 232, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={22} color="#7DD8E8" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#EDE8DD', letterSpacing: '-0.02em' }} className="font-serif">
                RECLAIM
              </h1>
            </div>
            <p style={{ fontSize: '0.83rem', color: '#A39B8B', marginTop: '3px' }}>
              Risk-Aware Expected-Value Revenue Recovery Instrument
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          
          <div className="badge badge-reminder" style={{ padding: '6px 12px' }}>
            <div className="pulse-dot" /> Razorpay Test Mode Active
          </div>

          <button
            onClick={handleRunBatch}
            disabled={isBatchRunning}
            className="btn-primary"
          >
            {isBatchRunning ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
            {isBatchRunning ? 'Analyzing Batch...' : 'Run Batch Analysis'}
          </button>

          <button
            onClick={handleResetBatch}
            className="btn-secondary"
            title="Generate new 300 synthetic at-risk dataset"
          >
            <Database size={15} /> Reset Batch
          </button>
        </div>
      </header>

      <main>
        <MetricsOverview stats={stats} />

        <AnalyticsCharts stats={stats} />

        <div style={{ display: 'flex', gap: '12px', marginTop: '36px', borderBottom: '1px solid #4A3F2E', paddingBottom: '14px' }}>
          <button
            onClick={() => setActiveTab('EXPLORER')}
            style={{
              background: activeTab === 'EXPLORER' ? 'rgba(232, 184, 74, 0.1)' : 'transparent',
              border: activeTab === 'EXPLORER' ? '1px solid #E8B84A' : '1px solid transparent',
              color: activeTab === 'EXPLORER' ? '#E8B84A' : '#A39B8B',
              padding: '10px 18px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <LayoutDashboard size={15} /> At-Risk Batch Explorer (300 Txns)
          </button>

          <button
            onClick={() => setActiveTab('SIMULATOR')}
            style={{
              background: activeTab === 'SIMULATOR' ? 'rgba(125, 216, 232, 0.1)' : 'transparent',
              border: activeTab === 'SIMULATOR' ? '1px solid #7DD8E8' : '1px solid transparent',
              color: activeTab === 'SIMULATOR' ? '#7DD8E8' : '#A39B8B',
              padding: '10px 18px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            <Activity size={15} color={activeTab === 'SIMULATOR' ? '#7DD8E8' : '#A39B8B'} /> Counterfactual Recovery Simulator
          </button>
        </div>

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
            guardrailFlagsCount={stats?.guardrail_overrides || 0}
          />
        ) : (
          <CounterfactualSimulator />
        )}
      </main>

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
