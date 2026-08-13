'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Languages, RefreshCw, ShieldCheck, UserRound } from 'lucide-react';

interface Learner {
  user_id: string;
  name: string;
  language_preference: string;
  current_level: string;
  topics_covered: string[];
  common_mistakes: string[];
  last_interaction: string;
}

export default function LearnersDashboard() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLearners = async () => {
    try {
      const res = await fetch('/api/learners');
      const data = await res.json();
      setLearners(data.learners || []);
    } catch (err) {
      console.error('Failed to load learners', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners();
    const interval = setInterval(fetchLearners, 5000);
    return () => clearInterval(interval);
  }, []);

  const withTopics = learners.filter((learner) => learner.topics_covered.length > 0).length;
  const hindiLearners = learners.filter((learner) =>
    learner.language_preference?.toLowerCase().includes('hindi')
  ).length;

  return (
    <main className="min-h-screen bg-[#07111f] px-5 pt-28 pb-10 text-slate-100 md:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-200">
              <ShieldCheck className="size-3.5" />
              Consent-first memory
            </div>
            <h1 className="text-3xl font-black tracking-normal text-white md:text-5xl">
              Learner Progress
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Profiles appear here only after the learner gives permission. This makes memory a
              visible, trustworthy part of the platform story.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchLearners}
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
          <Metric label="Saved learners" value={learners.length} />
          <Metric label="With topic history" value={withTopics} />
          <Metric label="Hindi preference" value={hindiLearners} />
        </div>

        {loading ? (
          <EmptyState title="Loading learners..." body="Reading consented learner profiles." />
        ) : learners.length === 0 ? (
          <EmptyState
            title="No saved learners yet"
            body="Connect to the agent, share your name, and approve memory consent when asked to store your profile here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {learners.map((learner) => (
              <article
                key={learner.user_id}
                className="rounded-xl border border-white/10 bg-white/[0.08] p-5 shadow-xl backdrop-blur"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-400/15 text-teal-200">
                      <UserRound className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">{learner.name || 'Learner'}</h2>
                      <p className="font-mono text-xs text-slate-500">{learner.user_id}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
                    consented
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Info icon={GraduationIcon} label="Level" value={learner.current_level || 'Not set'} />
                  <Info
                    icon={Languages}
                    label="Language"
                    value={learner.language_preference || 'Not set'}
                  />
                </div>

                <TagGroup label="Topics covered" values={learner.topics_covered} />
                <TagGroup label="Common mistakes" values={learner.common_mistakes} muted />

                <p className="mt-4 text-xs text-slate-500">
                  Last interaction:{' '}
                  <span className="font-mono text-slate-400">
                    {learner.last_interaction
                      ? new Date(learner.last_interaction).toLocaleString()
                      : 'Not recorded'}
                  </span>
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.08] p-5 shadow-xl backdrop-blur">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-4xl font-black text-white">{value}</div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.08] p-12 text-center shadow-xl backdrop-blur">
      <BookOpen className="mx-auto size-10 text-teal-200" />
      <h2 className="mt-4 text-xl font-black text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{body}</p>
    </div>
  );
}

function GraduationIcon(props: React.ComponentProps<typeof BookOpen>) {
  return <BookOpen {...props} />;
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function TagGroup({ label, values, muted = false }: { label: string; values: string[]; muted?: boolean }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.length === 0 ? (
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-500">
            None yet
          </span>
        ) : (
          values.map((value) => (
            <span
              key={value}
              className={
                muted
                  ? 'rounded-full border border-amber-300/15 bg-amber-300/[0.08] px-3 py-1 text-xs font-semibold text-amber-100'
                  : 'rounded-full border border-teal-300/15 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-100'
              }
            >
              {value}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
