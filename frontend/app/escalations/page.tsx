'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, LifeBuoy, RefreshCw, ShieldCheck, UserCheck } from 'lucide-react';

interface Escalation {
  ticket_id: string;
  user_id: string;
  caller_name: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  summary: string;
  preferred_contact: string;
  status: string;
  created_at: string;
}

export default function EscalationsDashboard() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEscalations = async () => {
    try {
      const res = await fetch('/api/escalations');
      const data = await res.json();
      setEscalations(data.escalations || []);
    } catch (err) {
      console.error('Failed to load escalations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
    const interval = setInterval(fetchEscalations, 5000);
    return () => clearInterval(interval);
  }, []);

  const openTickets = escalations.filter((item) => item.status === 'Open').length;
  const highUrgency = escalations.filter((item) => item.urgency === 'high').length;

  return (
    <main className="min-h-screen bg-[#07111f] px-5 pt-28 pb-10 text-slate-100 md:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-amber-200">
              <LifeBuoy className="size-3.5" />
              Human-in-the-loop safety
            </div>
            <h1 className="text-3xl font-black tracking-normal text-white md:text-5xl">
              Teacher Help Queue
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              The agent knows when to stop. If a learner asks for a human or struggles repeatedly,
              it gets permission and creates a teacher-review ticket.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchEscalations}
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Metric icon={LifeBuoy} label="Total requests" value={escalations.length} tone="text-white" />
          <Metric icon={UserCheck} label="Open tickets" value={openTickets} tone="text-amber-200" />
          <Metric icon={AlertTriangle} label="High urgency" value={highUrgency} tone="text-rose-200" />
        </div>

        {loading ? (
          <EmptyState title="Loading teacher queue..." body="Reading escalation requests." />
        ) : escalations.length === 0 ? (
          <EmptyState
            title="No open escalations"
            body='In the demo, say "I am stuck, I want to talk to a teacher" and approve the handoff.'
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {escalations.map((item) => (
              <article
                key={item.ticket_id}
                className="rounded-xl border border-white/10 bg-white/[0.08] p-5 shadow-xl backdrop-blur transition hover:border-white/20"
              >
                <div className="flex flex-col justify-between gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-teal-300/20 bg-teal-300/10 px-2.5 py-1 font-mono text-xs font-black text-teal-100">
                        {item.ticket_id}
                      </span>
                      <h2 className="text-lg font-black text-white">{item.caller_name}</h2>
                      <span className="font-mono text-xs text-slate-500">{item.user_id}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Urgency urgency={item.urgency} />
                    <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-bold text-slate-300">
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                      Reason
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-100">{item.reason}</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                      Session summary for teacher
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {item.summary || 'No summary provided.'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col justify-between gap-2 text-xs text-slate-500 md:flex-row">
                  <span>
                    Preferred contact:{' '}
                    <span className="font-semibold text-slate-300">{item.preferred_contact}</span>
                  </span>
                  <span className="font-mono">
                    Created: {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
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
  value: number;
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

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.08] p-12 text-center shadow-xl backdrop-blur">
      <ShieldCheck className="mx-auto size-10 text-teal-200" />
      <h2 className="mt-4 text-xl font-black text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{body}</p>
    </div>
  );
}

function Urgency({ urgency }: { urgency: Escalation['urgency'] }) {
  const classes = {
    high: 'border-rose-300/20 bg-rose-300/10 text-rose-200',
    medium: 'border-amber-300/20 bg-amber-300/10 text-amber-200',
    low: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200',
  };

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${classes[urgency]}`}>
      {urgency.toUpperCase()} URGENCY
    </span>
  );
}
