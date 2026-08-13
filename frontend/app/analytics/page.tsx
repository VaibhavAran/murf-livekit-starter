'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock3, PhoneCall, RefreshCw, TrendingUp, XCircle } from 'lucide-react';

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
    const interval = setInterval(fetchAnalytics, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
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
            </Link>
          </div>
        </div>

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
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {new Date(log.ended_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
    </div>
  );
}
