'use client';

import React, { useEffect, useState } from 'react';

/* ─── Animated floating orbs background ──────────────────── */
function FloatingOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Large background orb */}
      <div
        className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #818cf8, #6366f1, transparent)' }}
      />
      <div
        className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #f59e0b, #f97316, transparent)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #a78bfa, #6366f1, transparent)' }}
      />
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="animate-float absolute rounded-full opacity-40"
          style={{
            width: `${8 + i * 4}px`,
            height: `${8 + i * 4}px`,
            background: i % 2 === 0 ? '#818cf8' : '#f59e0b',
            top: `${15 + i * 12}%`,
            left: `${10 + i * 15}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${3 + i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Book / Graduation cap SVG icon ─────────────────────── */
function LearningIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-lg"
      aria-hidden="true"
    >
      {/* Graduation cap top */}
      <ellipse cx="40" cy="28" rx="28" ry="8" fill="#6366f1" opacity="0.9" />
      <ellipse cx="40" cy="26" rx="28" ry="8" fill="#818cf8" />
      {/* Cap middle */}
      <rect x="28" y="26" width="24" height="20" rx="3" fill="#6366f1" />
      {/* Book pages */}
      <rect x="26" y="30" width="28" height="18" rx="3" fill="#4f46e5" />
      <line x1="40" y1="31" x2="40" y2="47" stroke="#818cf8" strokeWidth="1.5" opacity="0.5" />
      {/* Tassel */}
      <circle cx="60" cy="26" r="3" fill="#f59e0b" />
      <line x1="60" y1="29" x2="60" y2="50" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="60" cy="52" r="4" fill="#f59e0b" opacity="0.8" />
      {/* Star sparkles */}
      <circle cx="14" cy="18" r="2.5" fill="#f59e0b" className="animate-pulse" />
      <circle cx="66" cy="55" r="2" fill="#818cf8" className="animate-pulse" style={{ animationDelay: '0.7s' }} />
      <circle cx="20" cy="58" r="1.5" fill="#a78bfa" className="animate-pulse" style={{ animationDelay: '1.2s' }} />
    </svg>
  );
}

/* ─── Feature badge ───────────────────────────────────────── */
function FeatureBadge({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-indigo-200 bg-white/60 px-3 py-1.5 text-xs font-medium text-indigo-700 backdrop-blur-sm dark:border-indigo-800/50 dark:bg-indigo-950/30 dark:text-indigo-300">
      <span>{emoji}</span>
      <span>{text}</span>
    </div>
  );
}

/* ─── Typing animation for subtitle ──────────────────────── */
const SUBTITLE_TEXTS = [
  'Ask me anything about Science',
  'Let\'s explore Mathematics together',
  'Learn English with confidence',
  'Understand Computers & AI',
  'Discover History and Geography',
];

function TypingSubtitle() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = SUBTITLE_TEXTS[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayed.length < currentText.length) {
      timeout = setTimeout(() => setDisplayed(currentText.slice(0, displayed.length + 1)), 60);
    } else if (!isDeleting && displayed.length === currentText.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % SUBTITLE_TEXTS.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, index]);

  return (
    <span className="font-medium text-indigo-600 dark:text-indigo-400">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}

/* ─── Mic permission check ────────────────────────────────── */
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

/* ─── Mic denied banner ───────────────────────────────────── */
function MicDeniedBanner() {
  return (
    <div
      className="mb-4 flex max-w-sm items-start gap-3 rounded-2xl border p-3 text-left shadow-md"
      style={{
        background: 'oklch(0.98 0.03 27 / 0.95)',
        borderColor: 'oklch(0.70 0.20 27 / 0.4)',
        backdropFilter: 'blur(8px)',
      }}
      role="alert"
    >
      <span className="mt-0.5 text-lg">🎤</span>
      <div>
        <p className="text-sm font-bold text-orange-800">Microphone access is blocked</p>
        <p className="mt-0.5 text-xs text-orange-700">
          Click the lock/camera icon in your browser&apos;s address bar, set Microphone to
          &quot;Allow&quot;, and reload the page.
        </p>
      </div>
    </div>
  );
}

/* ─── Main WelcomeView ────────────────────────────────────── */
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

    <div ref={ref} className="relative flex h-svh w-full flex-col items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="hero-bg absolute inset-0" />
      <FloatingOrbs />

      {/* Main card */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">

        {/* Icon with glow ring */}
        <div className="relative mb-6 animate-float">
          <div
            className="animate-pulse-ring absolute inset-0 rounded-full"
            style={{ margin: '-12px' }}
          />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/80 shadow-2xl backdrop-blur-sm dark:bg-slate-900/70">
            <LearningIcon />
          </div>
        </div>

        {/* Heading */}
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white md:text-5xl">
          AI Learning{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Companion
          </span>
        </h1>

        {/* Typing subtitle */}
        <p className="mb-2 min-h-[28px] text-base text-slate-600 dark:text-slate-400 md:text-lg">
          <TypingSubtitle />
        </p>

        <p className="mb-8 max-w-sm text-sm text-slate-500 dark:text-slate-500">
          Your friendly voice tutor — available 24/7, in Hindi or English.
        </p>

        {/* Feature badges */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          <FeatureBadge emoji="🎓" text="All Subjects" />
          <FeatureBadge emoji="🇮🇳" text="Hindi & English" />
          <FeatureBadge emoji="🎙️" text="Voice Powered" />
          <FeatureBadge emoji="✨" text="Always Patient" />
        </div>

        {/* Mic denied warning */}
        {isMicDenied && <MicDeniedBanner />}

        {/* CTA Button */}
        <button
          id="start-learning-btn"
          onClick={isMicDenied ? undefined : onStartCall}
          disabled={isMicDenied}
          aria-disabled={isMicDenied}
          className={
            isMicDenied
              ? 'flex cursor-not-allowed items-center gap-3 rounded-full bg-slate-300 px-10 py-4 text-base font-bold tracking-wide text-slate-500 uppercase opacity-60 shadow'
              : 'btn-glow group relative flex items-center gap-3 rounded-full px-10 py-4 text-base font-bold tracking-wide text-white uppercase shadow-xl transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/50'
          }
        >
          {/* Mic icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-300 group-hover:scale-110"
          >
            <rect x="9" y="2" width="6" height="11" rx="3" fill={isMicDenied ? '#9ca3af' : 'white'} />
            <path
              d="M5 10C5 10 5 16 12 16C19 16 19 10 19 10"
              stroke={isMicDenied ? '#9ca3af' : 'white'}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line x1="12" y1="16" x2="12" y2="21" stroke={isMicDenied ? '#9ca3af' : 'white'} strokeWidth="2" strokeLinecap="round" />
            <line x1="9" y1="21" x2="15" y2="21" stroke={isMicDenied ? '#9ca3af' : 'white'} strokeWidth="2" strokeLinecap="round" />
          </svg>
          {isMicDenied ? 'Microphone Blocked' : startButtonText}
        </button>

        {/* Disclaimer */}
        <p className="mt-6 text-xs text-slate-400 dark:text-slate-600">
          {isMicDenied
            ? '🔒 Allow microphone in browser settings, then reload.'
            : 'Please allow microphone access when prompted to start your session.'}
        </p>
      </div>
    </div>
  );
};
