'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  GraduationCap,
  Headphones,
  Mic,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react';

const PROMPTS = [
  'Explain photosynthesis in Hindi',
  'Give me a beginner math question',
  'Remember my name after I tell you',
  'I am stuck, connect me to a teacher',
];

const CAPABILITIES = [
  {
    icon: BookOpenCheck,
    title: 'Adaptive practice',
    body: 'The tutor can fetch level-based questions and coach the learner step by step.',
  },
  {
    icon: UserRoundCheck,
    title: 'Consent memory',
    body: 'Returning learners are recognized only after permission, with topic and level context.',
  },
  {
    icon: UsersRound,
    title: 'Teacher handoff',
    body: 'When a student is stuck or asks for help, the agent creates a reviewable ticket.',
  },
  {
    icon: BarChart3,
    title: 'Live outcomes',
    body: 'Every session can feed call success, completion, and escalation analytics.',
  },
];

function useMicPermission() {
  const [status, setStatus] = useState<PermissionState | 'unknown'>('unknown');

  useEffect(() => {
    if (!navigator?.permissions) return;
    navigator.permissions
      .query({ name: 'microphone' as PermissionName })
      .then((result) => {
        setStatus(result.state);
        result.onchange = () => setStatus(result.state);
      })
      .catch(() => setStatus('unknown'));
  }, []);

  return status;
}

function SignalBars() {
  return (
    <div className="flex h-16 items-end gap-1.5" aria-hidden="true">
      {[42, 58, 34, 64, 48, 72, 52, 40, 62, 46].map((height, index) => (
        <span
          key={index}
          className="w-2 rounded-full bg-white/80"
          style={{
            height,
            animation: `wave-bounce ${0.55 + index * 0.04}s ease-in-out infinite alternate`,
            animationDelay: `${index * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

function MicDeniedBanner() {
  return (
    <div className="flex max-w-xl items-start gap-3 rounded-lg border border-amber-300/50 bg-amber-50/90 p-3 text-left text-amber-950 shadow-sm">
      <ShieldCheck className="mt-0.5 size-5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">Microphone access is blocked</p>
        <p className="mt-1 text-xs text-amber-800">
          Allow microphone access from the browser address bar and reload the page to start a voice
          session.
        </p>
      </div>
    </div>
  );
}

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const micPermission = useMicPermission();
  const isMicDenied = micPermission === 'denied';

  return (
    <div
      ref={ref}
      className="relative min-h-svh w-full overflow-hidden bg-[#07111f] text-white"
    >
      <div className="absolute inset-0 cinematic-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.28),transparent_32%),radial-gradient(circle_at_78%_18%,rgba(245,158,11,0.22),transparent_30%),linear-gradient(135deg,#07111f_0%,#10233c_46%,#151318_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#07111f] to-transparent" />

      <section className="relative z-10 mx-auto grid min-h-svh w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 pt-28 pb-10 md:grid-cols-[1.05fr_0.95fr] md:px-8 lg:px-10">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-100 backdrop-blur">
            <Sparkles className="size-3.5" />
            Learning and Literacy Track
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-normal text-white md:text-7xl">
            A voice tutor that becomes a learning safety net.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
            Teach in Hindi or English, remember progress with consent, generate practice,
            escalate stuck learners to teachers, and show outcomes in a live command center.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              id="start-learning-btn"
              onClick={isMicDenied ? undefined : onStartCall}
              disabled={isMicDenied}
              aria-disabled={isMicDenied}
              className={
                isMicDenied
                  ? 'inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-300 px-6 py-3 text-sm font-bold text-slate-600 opacity-70'
                  : 'inline-flex items-center justify-center gap-2 rounded-lg bg-teal-400 px-6 py-3 text-sm font-black text-slate-950 shadow-[0_16px_48px_rgba(45,212,191,0.25)] transition hover:bg-teal-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-200/50'
              }
            >
              <Mic className="size-4" />
              {isMicDenied ? 'Microphone blocked' : startButtonText}
            </button>
            <Link
              href="/analytics"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/[0.14]"
            >
              View live platform
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-6">{isMicDenied && <MicDeniedBanner />}</div>

          <div className="mt-8 flex flex-wrap gap-2">
            {PROMPTS.map((prompt) => (
              <span
                key={prompt}
                className="rounded-full border border-white/12 bg-black/20 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur"
              >
                Try: "{prompt}"
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[2rem] border border-white/12 bg-white/10 p-3 shadow-2xl backdrop-blur-xl">
            <div className="overflow-hidden rounded-[1.45rem] border border-white/10 bg-[#091521]">
              <div className="border-b border-white/10 bg-white/[0.08] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
                      Live learning session
                    </p>
                    <p className="mt-1 text-lg font-bold">New learner voice session</p>
                  </div>
                  <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">
                    Listening
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-5">
                <div className="rounded-xl border border-teal-300/20 bg-teal-300/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">
                    Agent action
                  </p>
                  <p className="mt-2 text-sm text-slate-100">
                    Ready to fetch a practice question after the learner asks.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.08] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Voice signal
                      </p>
                      <p className="mt-2 text-sm text-slate-200">Hindi-English conversation active</p>
                    </div>
                    <SignalBars />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-2xl font-black text-white">24h</p>
                    <p className="mt-1 text-xs text-slate-400">teacher follow-up SLA</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-2xl font-black text-white">100%</p>
                    <p className="mt-1 text-xs text-slate-400">consent-first memory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CAPABILITIES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[0.08] p-4 backdrop-blur">
                <Icon className="size-5 text-amber-300" />
                <p className="mt-3 text-sm font-bold text-white">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
