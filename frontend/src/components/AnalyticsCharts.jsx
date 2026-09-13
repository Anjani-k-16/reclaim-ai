import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

export default function AnalyticsCharts({ stats }) {
  const isAnalyzed = stats && stats.analyzed_transactions > 0;

  if (!isAnalyzed) {
    return (
      <div className="fintech-card p-8 mt-6 text-center text-slate-400" style={{ padding: '32px', marginTop: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Activity size={22} color="#7DD8E8" />
          <h4 style={{ color: '#EDE8DD', fontWeight: 600, fontSize: '0.95rem' }}>Analysis Pending</h4>
          <p style={{ fontSize: '0.82rem', color: '#A39B8B' }}>
            Select "Run Batch Analysis" to populate intervention severity distribution and root causes.
          </p>
        </div>
      </div>
    );
  }

  const actionData = Object.keys(stats.action_breakdown).map(key => ({
    name: key,
    count: stats.action_breakdown[key]
  }));

  const ACTION_COLORS = {
    RETRY: '#E8B84A',
    REMINDER: '#7DD8E8',
    ESCALATE: '#D9883B',
    STOP: '#C25B3F'
  };

  const causeData = Object.keys(stats.cause_distribution || {}).map(key => ({
    name: key.replace('_', ' '),
    count: stats.cause_distribution[key]
  }));

  const CAUSE_COLORS = ['#E8B84A', '#7DD8E8', '#D9883B', '#C25B3F', '#A39B8B', '#EDE8DD'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginTop: '28px' }}>
      
      <div className="fintech-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#EDE8DD', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <BarChart3 size={15} color="#E8B84A" /> Intervention Severity Spectrum
        </h3>
        <div style={{ width: '100%', height: 210 }}>
          <ResponsiveContainer>
            <BarChart data={actionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#A39B8B" fontSize={11} tickLine={false} fontFamily="var(--font-mono)" />
              <YAxis stroke="#A39B8B" fontSize={11} tickLine={false} fontFamily="var(--font-mono)" />
              <Tooltip
                contentStyle={{ background: '#241F17', border: '1px solid #4A3F2E', borderRadius: '4px', color: '#EDE8DD', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
              />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {actionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={ACTION_COLORS[entry.name] || '#E8B84A'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="fintech-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#EDE8DD', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <PieChartIcon size={15} color="#E8B84A" /> Diagnostic Root Causes
        </h3>
        <div style={{ width: '100%', height: 210, display: 'flex', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={causeData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="count"
              >
                {causeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CAUSE_COLORS[index % CAUSE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#241F17', border: '1px solid #4A3F2E', borderRadius: '4px', color: '#EDE8DD', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
