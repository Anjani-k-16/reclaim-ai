import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

export default function AnalyticsCharts({ stats }) {
  if (!stats || !stats.action_breakdown) {
    return null;
  }

  // Action Breakdown Data
  const actionData = Object.keys(stats.action_breakdown).map(key => ({
    name: key,
    count: stats.action_breakdown[key]
  }));

  const ACTION_COLORS = {
    RETRY: '#3b82f6',
    REMINDER: '#8b5cf6',
    ESCALATE: '#f59e0b',
    STOP: '#f43f5e'
  };

  // Cause Distribution Data
  const causeData = Object.keys(stats.cause_distribution || {}).map(key => ({
    name: key.replace('_', ' '),
    count: stats.cause_distribution[key]
  }));

  const CAUSE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
      
      {/* Chart 1: Recommended Action Breakdown */}
      <div className="glass-panel p-5">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🎯 Recommended Intervention Distribution
        </h3>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={actionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {actionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={ACTION_COLORS[entry.name] || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Cause Diagnosis Breakdown */}
      <div className="glass-panel p-5">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔎 Diagnostic Failure Root Causes
        </h3>
        <div style={{ width: '100%', height: 220, display: 'flex', alignItems: 'center' }}>
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
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
