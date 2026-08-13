'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
<<<<<<< HEAD
import { ArrowLeft, CheckCircle2, Clock3, PhoneCall, RefreshCw, TrendingUp, XCircle } from 'lucide-react';
=======
>>>>>>> 70f31b43097c8f91f583b590b570507045e6d05a

interface CallLog {
  call_id: string;
  user_id: string;
  caller_name: string;
  call_type: string;
  duration_seconds: number;
  exercises_done: number;
  escalation_done: number;
  status: 'SUCCESS' | 'FAILED';
  ended_at: string;
}

interface AnalyticsData {
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  success_rate: number;
  logs: CallLog[];
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>({
    total_calls: 0,
    successful_calls: 0,
    failed_calls: 0,
    success_rate: 0,
    logs: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
<<<<<<< HEAD
    const interval = setInterval(fetchAnalytics, 3000);
=======
    const interval = setInterval(fetchAnalytics, 3000); // Auto refresh every 3s
>>>>>>> 70f31b43097c8f91f583b590b570507045e6d05a
    return () => clearInterval(interval);
  }, []);

  return (
<<<<<<< HEAD
    <main className="min-h-screen bg-[#07111f] px-5 pt-28 pb-10 text-slate-100 md:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-200">
              <TrendingUp className="size-3.5" />
              Learning operations
            </div>
            <h1 className="text-3xl font-black tracking-normal text-white md:text-5xl">
              Outcome Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              A live view of whether voice sessions produced practice, consented memory, or teacher
              handoff. This turns the demo into a measurable platform.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchAnalytics}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-bold text-white transition hover:bg-white/[0.14]"
            >
              <RefreshCw className="size-4" />
              Refresh
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-teal-400 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-teal-300"
            >
              <ArrowLeft className="size-4" />
              Back to tutor
=======
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm mb-1">
              <span>📊</span> CALL PERFORMANCE ANALYTICS
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Call Performance Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time analytics for inbound web sessions & outbound SIP calls (Day 8).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition border border-slate-700"
            >
              🔄 Refresh Data
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-medium text-white transition shadow-lg shadow-emerald-500/20"
            >
              ← Back to Voice Agent
>>>>>>> 70f31b43097c8f91f583b590b570507045e6d05a
            </Link>
          </div>
        </div>

<<<<<<< HEAD
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Metric icon={PhoneCall} label="Total calls" value={data.total_calls} tone="text-white" />
          <Metric icon={CheckCircle2} label="Successful" value={data.successful_calls} tone="text-emerald-300" />
          <Metric icon={XCircle} label="Needs attention" value={data.failed_calls} tone="text-rose-300" />
          <Metric icon={TrendingUp} label="Success rate" value={`${data.success_rate}%`} tone="text-teal-200" />
        </div>

        <section className="rounded-xl border border-white/10 bg-white/[0.08] p-5 shadow-xl backdrop-blur">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-black text-white">Session Timeline</h2>
              <p className="mt-1 text-xs text-slate-500">Auto-refreshing every 3 seconds</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading call analytics...</div>
          ) : data.logs.length === 0 ? (
            <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-10 text-center">
              <PhoneCall className="mx-auto size-9 text-teal-200" />
              <h3 className="mt-4 text-base font-black text-white">No sessions recorded yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Complete a browser voice session or outbound SIP call, then return here to watch the
                platform update.
              </p>
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm text-slate-300">
                <thead className="border-b border-white/10 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Call</th>
                    <th className="px-4 py-3">Learner</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Practice</th>
                    <th className="px-4 py-3">Outcome</th>
                    <th className="px-4 py-3">Ended</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.logs.map((log) => (
                    <tr key={log.call_id} className="transition hover:bg-white/[0.05]">
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.call_id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-100">{log.caller_name}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-semibold">
                          {log.call_type === 'outbound_sip' ? 'Outbound SIP' : 'Inbound web'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">
                        <Clock3 className="mr-1 inline size-3" />
                        {log.duration_seconds}s
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{log.exercises_done}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-black ${
                            log.status === 'SUCCESS'
                              ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200'
                              : 'border-rose-300/20 bg-rose-300/10 text-rose-200'
=======
        {/* 3 Main Metric Cards Required by Step 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Calls</div>
            <div className="text-3xl font-extrabold mt-2 text-white">{data.total_calls}</div>
            <div className="text-xs text-slate-500 mt-1">All sessions recorded</div>
          </div>

          <div className="bg-slate-900 border border-emerald-900/40 rounded-xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Successful Calls</div>
            <div className="text-3xl font-extrabold mt-2 text-emerald-400">{data.successful_calls}</div>
            <div className="text-xs text-emerald-500/80 mt-1">Exercise or escalation completed</div>
          </div>

          <div className="bg-slate-900 border border-rose-900/40 rounded-xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Failed Calls</div>
            <div className="text-3xl font-extrabold mt-2 text-rose-400">{data.failed_calls}</div>
            <div className="text-xs text-rose-500/80 mt-1">Ended before completion</div>
          </div>

          <div className="bg-slate-900 border border-indigo-900/40 rounded-xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Success Rate</div>
            <div className="text-3xl font-extrabold mt-2 text-indigo-300">{data.success_rate}%</div>
            <div className="text-xs text-indigo-400/80 mt-1">Overall completion %</div>
          </div>
        </div>

        {/* Call Logs Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-200">Recent Call Logs</h2>
            <span className="text-xs font-mono text-slate-500">Auto-refreshing every 3s</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading call analytics...</div>
          ) : data.logs.length === 0 ? (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">📞</div>
              <h3 className="text-base font-semibold text-slate-300">No Call Logs Recorded Yet</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto mt-1">
                Make a browser call or outbound SIP call. When the call ends, its duration and outcome will appear here live!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Call ID</th>
                    <th className="py-3 px-4">Caller</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Exercises</th>
                    <th className="py-3 px-4">Outcome</th>
                    <th className="py-3 px-4">Ended At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.logs.map((log) => (
                    <tr key={log.call_id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-400">{log.call_id}</td>
                      <td className="py-3 px-4 font-medium text-slate-200">{log.caller_name}</td>
                      <td className="py-3 px-4 font-mono text-xs">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                          {log.call_type === 'outbound_sip' ? '📞 Outbound SIP' : '🌐 Inbound Web'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-400">{log.duration_seconds}s</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-300">{log.exercises_done}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                              : 'bg-rose-950/80 text-rose-300 border-rose-800'
>>>>>>> 70f31b43097c8f91f583b590b570507045e6d05a
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
<<<<<<< HEAD
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
=======
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">
>>>>>>> 70f31b43097c8f91f583b590b570507045e6d05a
                        {new Date(log.ended_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
<<<<<<< HEAD
        </section>
      </div>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.08] p-5 shadow-xl backdrop-blur">
      <Icon className={`size-5 ${tone}`} />
      <div className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className={`mt-2 text-4xl font-black ${tone}`}>{value}</div>
=======
        </div>
      </div>
>>>>>>> 70f31b43097c8f91f583b590b570507045e6d05a
    </div>
  );
}
