"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';

interface Totals { start: number; complete: number; error: number; conversion_rate: number }
interface EventRow { id?: string; event_type: string; placement: string; source?: string; category_id?: string; session_id?: string; created_at: string }

export default function AdAnalyticsReport() {
  const { adminUser } = useAdmin();
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [placement, setPlacement] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState<Totals>({ start: 0, complete: 0, error: 0, conversion_rate: 0 });
  const [rows, setRows] = useState<EventRow[]>([]);

  const headers = useMemo(() => ({ 'Authorization': `Bearer ${adminUser?.token}` }), [adminUser?.token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';
      const params = new URLSearchParams();
      if (from) params.append('from_ts', from);
      if (to) params.append('to_ts', to);
      if (placement) params.append('placement', placement);
      if (categoryId) params.append('category_id', categoryId);
      const res = await fetch(`${backend}/api/admin/ad-analytics?${params.toString()}`, { headers });
      const data = await res.json();
      setTotals(data.totals);
      setRows(data.recent || []);
    } catch (e) {
      console.error('Failed to load ad analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rewarded Ad Analytics</h2>
        <p className="text-gray-600 mt-1">Monitor starts, completions, and conversion rates for rewarded popups</p>
      </div>

      <div className="bg-white border rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">From</label>
            <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">To</label>
            <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Placement</label>
            <select value={placement} onChange={(e) => setPlacement(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              <option value="">Any</option>
              <option value="popup">Popup</option>
              <option value="between-questions">Between Questions</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Category ID</label>
            <input value={categoryId} onChange={(e) => setCategoryId(e.target.value)} placeholder="optional" className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div className="flex items-end">
            <button onClick={fetchData} disabled={loading} className={`w-full px-4 py-2 rounded-lg font-medium ${loading ? 'bg-gray-300 text-gray-500' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>{loading ? 'Loading…' : 'Refresh'}</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Starts" value={totals.start} color="text-blue-600" />
        <StatCard title="Completes" value={totals.complete} color="text-green-600" />
        <StatCard title="Errors" value={totals.error} color="text-red-600" />
        <StatCard title="Conversion" value={`${totals.conversion_rate}%`} color="text-purple-600" />
      </div>

      <div className="bg-white border rounded-xl p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Events</h3>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2 pr-4">Time</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Placement</th>
              <th className="py-2 pr-4">Source</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 pr-4">Session</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-2 pr-4">{new Date(r.created_at).toLocaleString()}</td>
                <td className="py-2 pr-4 capitalize">{r.event_type}</td>
                <td className="py-2 pr-4">{r.placement || '-'}</td>
                <td className="py-2 pr-4">{r.source || '-'}</td>
                <td className="py-2 pr-4">{r.category_id || '-'}</td>
                <td className="py-2 pr-4">{r.session_id || '-'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="py-3 text-gray-500" colSpan={6}>No events found for selected filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string, value: string | number, color: string }) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <div className="text-gray-600 text-sm">{title}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
}