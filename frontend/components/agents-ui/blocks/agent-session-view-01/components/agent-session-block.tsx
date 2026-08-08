'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, type MotionProps, motion } from 'motion/react';
import {
  useAgent,
  useLocalParticipant,
  useSessionContext,
  useSessionMessages,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { AgentChatTranscript } from '@/components/agents-ui/agent-chat-transcript';
import {
  AgentControlBar,
  type AgentControlBarControls,
} from '@/components/agents-ui/agent-control-bar';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { cn } from '@/lib/shadcn/utils';
import { TileLayout } from './tile-view';

const MotionMessage = motion.create(Shimmer);

const BOTTOM_VIEW_MOTION_PROPS: MotionProps = {
  variants: {
    visible: { opacity: 1, translateY: '0%' },
    hidden: { opacity: 0, translateY: '100%' },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: { duration: 0.3, delay: 0.5, ease: 'easeOut' },
};

const CHAT_MOTION_PROPS: MotionProps = {
  variants: {
    hidden: { opacity: 0, transition: { ease: 'easeOut', duration: 0.3 } },
    visible: { opacity: 1, transition: { delay: 0.2, ease: 'easeOut', duration: 0.3 } },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

const SHIMMER_MOTION_PROPS: MotionProps = {
  variants: {
    visible: { opacity: 1, transition: { ease: 'easeIn', duration: 0.5, delay: 0.8 } },
    hidden: { opacity: 0, transition: { ease: 'easeIn', duration: 0.5, delay: 0 } },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-background pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}

/* ─── Connecting Spinner ──────────────────────────────────── */
function ConnectingScreen() {
  return (
    <motion.div
      key="connecting"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-6"
      style={{
        background:
          'radial-gradient(ellipse at center, oklch(0.92 0.06 265 / 0.7), oklch(0.99 0.003 280 / 0.95))',
      }}
    >
      {/* Dual-ring spinner */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div
          className="animate-spin-slow absolute inset-0 rounded-full border-4 border-transparent"
          style={{ borderTopColor: '#6366f1', borderRightColor: '#818cf8' }}
        />
        <div
          className="absolute inset-2 rounded-full border-4 border-transparent"
          style={{
            animation: 'spin-slow 2s linear infinite reverse',
            borderTopColor: '#f59e0b',
            borderLeftColor: '#fbbf24',
          }}
        />
        {/* Mic icon center */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="relative z-10">
          <rect x="9" y="2" width="6" height="11" rx="3" fill="#6366f1" />
          <path d="M5 10C5 10 5 16 12 16C19 16 19 10 19 10" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="16" x2="12" y2="21" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
          <line x1="9" y1="21" x2="15" y2="21" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="state-pill state-pill-connecting mb-3 inline-flex">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          Connecting
        </p>
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          Joining your learning session…
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Please wait while we set up your AI tutor
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Microphone Permission Error Banner ──────────────────── */
function MicPermissionError({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      key="mic-error"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="absolute inset-x-4 top-16 z-50 md:inset-x-auto md:left-1/2 md:w-full md:max-w-md md:-translate-x-1/2"
    >
      <div
        className="flex items-start gap-3 rounded-2xl border p-4 shadow-xl"
        style={{
          background: 'oklch(0.98 0.03 27 / 0.97)',
          borderColor: 'oklch(0.70 0.20 27 / 0.4)',
          backdropFilter: 'blur(10px)',
        }}
        role="alert"
      >
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: 'oklch(0.90 0.12 27 / 0.6)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="#c2410c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-orange-800 dark:text-orange-200">
            🎤 Microphone Access Blocked
          </p>
          <p className="mt-1 text-xs text-orange-700 dark:text-orange-300">
            To chat with your AI tutor, please allow microphone access. Click the camera/lock icon in
            your browser&apos;s address bar, select &quot;Allow&quot;, then refresh the page.
          </p>
          <div className="mt-2">
            <span className="rounded bg-orange-100 px-1.5 py-0.5 font-mono text-xs text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
              🔒 Address bar → Microphone → Allow
            </span>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-orange-400 transition-colors hover:text-orange-600"
          aria-label="Dismiss"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Mic Muted Banner ────────────────────────────────────── */
function MicMutedBanner() {
  return (
    <motion.div
      key="mic-muted"
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-x-0 top-4 z-30 flex justify-center px-4"
    >
      <div
        className="flex items-center gap-2.5 rounded-full border px-5 py-2.5 shadow-lg"
        style={{
          background: 'oklch(0.20 0.02 265 / 0.88)',
          borderColor: 'oklch(1 0 0 / 0.12)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Crossed-mic icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          {/* Mic body */}
          <rect x="9" y="2" width="6" height="11" rx="3" fill="#f87171" opacity="0.8" />
          {/* Arc */}
          <path d="M5 10C5 10 5 16 12 16C19 16 19 10 19 10" stroke="#f87171" strokeWidth="2"
            strokeLinecap="round" opacity="0.6" />
          {/* Slash */}
          <line x1="4" y1="4" x2="20" y2="20" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="text-xs font-bold tracking-wide text-white/90 uppercase">
          Microphone muted
        </span>
        {/* Animated dots to show it's not listening */}
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block h-1.5 w-1.5 rounded-full bg-red-400/70"
              style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Agent State Banner ──────────────────────────────────── */
type AgentStateName = string;

function AgentStateBanner({ state, micMuted }: { state: AgentStateName; micMuted: boolean }) {
  // When mic is muted, override with muted state display
  if (micMuted && state === 'listening') {
    return (
      <div className="flex justify-center">
        <span className="state-pill" style={{
          background: 'oklch(0.95 0.04 27 / 0.7)',
          borderColor: 'oklch(0.70 0.20 27 / 0.3)',
          color: 'oklch(0.45 0.18 27)',
        }}>
          <span className="inline-block h-2 w-2 rounded-full bg-red-400 animate-pulse" />
          🔇 Mic is muted — tap mic to unmute
        </span>
      </div>
    );
  }

  if (!state || state === 'idle') return null;

  const stateConfig: Record<string, { label: string; pillClass: string; dotColor: string; emoji: string }> = {
    connecting: { label: 'Connecting…', pillClass: 'state-pill-connecting', dotColor: '#f59e0b', emoji: '🔄' },
    initializing: { label: 'Getting ready…', pillClass: 'state-pill-connecting', dotColor: '#f59e0b', emoji: '⚡' },
    listening: { label: 'Listening to you', pillClass: 'state-pill-listening', dotColor: '#6366f1', emoji: '🎧' },
    thinking: { label: 'Thinking…', pillClass: 'state-pill-listening', dotColor: '#818cf8', emoji: '🧠' },
    speaking: { label: 'Agent is speaking', pillClass: 'state-pill-speaking', dotColor: '#22c55e', emoji: '🔊' },
  };

  const config = stateConfig[state] ?? {
    label: state, pillClass: 'state-pill-connecting', dotColor: '#9ca3af', emoji: '•',
  };

  return (
    <motion.div
      key={state}
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="flex justify-center"
    >
      <span className={`state-pill ${config.pillClass}`}>
        <span
          className={cn(
            'inline-block h-2 w-2 rounded-full',
            state === 'listening' && 'animate-mic-pulse',
            state === 'speaking' && 'animate-state-glow',
            (state === 'connecting' || state === 'initializing') && 'animate-pulse'
          )}
          style={{ background: config.dotColor }}
        />
        {config.emoji} {config.label}
      </span>
    </motion.div>
  );
}

/* ─── Speaking Waveform ───────────────────────────────────── */
function SpeakingWaveform() {
  const bars = [0.4, 0.8, 1.0, 0.8, 0.6, 0.9, 0.5, 0.7, 1.0, 0.6, 0.4, 0.8];
  return (
    <div className="flex items-center justify-center gap-[3px]" aria-label="Agent is speaking">
      {bars.map((h, i) => (
        <div
          key={i}
          className="rounded-full"
          style={{
            width: '3px',
            height: `${Math.max(4, h * 20)}px`,
            background: 'oklch(0.52 0.18 150 / 0.7)',
            animation: `wave-bounce ${0.4 + i * 0.08}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.06}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Listening Indicator ─────────────────────────────────── */
function ListeningIndicator() {
  return (
    <div className="flex items-center gap-3" aria-label="Listening to you">
      <div
        className="animate-mic-pulse relative h-8 w-8 rounded-full"
        style={{ background: 'oklch(0.90 0.08 265 / 0.6)', border: '2px solid #6366f1' }}
      >
        <svg className="absolute inset-0 m-auto" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="9" y="2" width="6" height="11" rx="3" fill="#6366f1" />
          <path d="M5 10C5 10 5 16 12 16C19 16 19 10 19 10" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

/* ─── Props ───────────────────────────────────────────────── */
export interface AgentSessionView_01Props {
  preConnectMessage?: string;
  supportsChatInput?: boolean;
  supportsVideoInput?: boolean;
  supportsScreenShare?: boolean;
  isPreConnectBufferEnabled?: boolean;
  audioVisualizerType?: 'bar' | 'wave' | 'grid' | 'radial' | 'aura';
  audioVisualizerColor?: `#${string}`;
  audioVisualizerColorShift?: number;
  audioVisualizerBarCount?: number;
  audioVisualizerGridRowCount?: number;
  audioVisualizerGridColumnCount?: number;
  audioVisualizerRadialBarCount?: number;
  audioVisualizerRadialRadius?: number;
  audioVisualizerWaveLineWidth?: number;
  /** Called when the user clicks END CALL */
  onDisconnect?: () => void;
  className?: string;
}

/* ─── Main Component ──────────────────────────────────────── */
export function AgentSessionView_01({
  preConnectMessage = 'Your AI tutor is ready — ask me anything!',
  supportsChatInput = true,
  supportsVideoInput = true,
  supportsScreenShare = true,
  isPreConnectBufferEnabled = true,
  audioVisualizerType,
  audioVisualizerColor,
  audioVisualizerColorShift,
  audioVisualizerBarCount,
  audioVisualizerGridRowCount,
  audioVisualizerGridColumnCount,
  audioVisualizerRadialBarCount,
  audioVisualizerRadialRadius,
  audioVisualizerWaveLineWidth,
  onDisconnect,
  ref,
  className,
  ...props
}: React.ComponentProps<'section'> & AgentSessionView_01Props) {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const [chatOpen, setChatOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { state: agentState } = useAgent();

  // Mic muted detection via local participant
  const { localParticipant } = useLocalParticipant();
  const micPub = localParticipant?.getTrackPublication(Track.Source.Microphone);
  const isMicMuted = micPub ? micPub.isMuted : false;

  // Mic permission error detection
  const [micError, setMicError] = useState(false);
  const [micErrorDismissed, setMicErrorDismissed] = useState(false);

  const handleDeviceError = ({ source, error }: { source: string; error: Error }) => {
    if (
      source === 'audioinput' ||
      error?.name === 'NotAllowedError' ||
      error?.message?.toLowerCase().includes('permission')
    ) {
      setMicError(true);
    }
  };

  const controls: AgentControlBarControls = {
    leave: true,
    microphone: true,
    chat: supportsChatInput,
    camera: supportsVideoInput,
    screenShare: supportsScreenShare,
  };

  useEffect(() => {
    const lastMessage = messages.at(-1);
    const lastMessageIsLocal = lastMessage?.from?.isLocal === true;
    if (scrollAreaRef.current && lastMessageIsLocal) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const isConnecting = agentState === 'connecting' || agentState === 'initializing';
  const isListening = agentState === 'listening';
  const isSpeaking = agentState === 'speaking';

  return (
    <section
      ref={ref}
      className={cn('bg-background relative z-10 h-full w-full overflow-hidden', className)}
      {...props}
    >
      {/* Connecting Screen overlay */}
      <AnimatePresence>
        {isConnecting && <ConnectingScreen />}
      </AnimatePresence>

      {/* Mic Muted Banner — top of screen */}
      <AnimatePresence>
        {isMicMuted && !isConnecting && (
          <MicMutedBanner key="mic-muted" />
        )}
      </AnimatePresence>

      {/* Mic Permission Error Banner */}
      <AnimatePresence>
        {micError && !micErrorDismissed && (
          <MicPermissionError key="mic-error" onDismiss={() => setMicErrorDismissed(true)} />
        )}
      </AnimatePresence>

      <Fade top className="absolute inset-x-4 top-0 z-10 h-40" />

      {/* Transcript */}
      <div className="absolute top-0 bottom-[135px] flex w-full flex-col md:bottom-[170px]">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              {...CHAT_MOTION_PROPS}
              className="flex h-full w-full flex-col gap-4 space-y-3 transition-opacity duration-300 ease-out"
            >
              <AgentChatTranscript
                agentState={agentState}
                messages={messages}
                className="mx-auto w-full max-w-2xl [&_.is-user>div]:rounded-[22px] [&>div>div]:px-4 [&>div>div]:pt-40 md:[&>div>div]:px-6"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tile layout */}
      <TileLayout
        chatOpen={chatOpen}
        audioVisualizerType={audioVisualizerType}
        audioVisualizerColor={audioVisualizerColor}
        audioVisualizerColorShift={audioVisualizerColorShift}
        audioVisualizerBarCount={audioVisualizerBarCount}
        audioVisualizerRadialBarCount={audioVisualizerRadialBarCount}
        audioVisualizerRadialRadius={audioVisualizerRadialRadius}
        audioVisualizerGridRowCount={audioVisualizerGridRowCount}
        audioVisualizerGridColumnCount={audioVisualizerGridColumnCount}
        audioVisualizerWaveLineWidth={audioVisualizerWaveLineWidth}
      />

      {/* Bottom Controls */}
      <motion.div
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="absolute inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        {/* Agent State Banner + visual indicators */}
        <div className="mb-3 flex flex-col items-center gap-2">
          <AnimatePresence mode="wait">
            <AgentStateBanner key={`${agentState}-${isMicMuted}`} state={agentState} micMuted={isMicMuted} />
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isSpeaking && (
              <motion.div
                key="speaking-wave"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <SpeakingWaveform />
              </motion.div>
            )}
            {isListening && !isSpeaking && !isMicMuted && (
              <motion.div
                key="listening-pulse"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <ListeningIndicator />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pre-connect message */}
        {isPreConnectBufferEnabled && (
          <AnimatePresence>
            {messages.length === 0 && !isConnecting && (
              <MotionMessage
                key="pre-connect-message"
                duration={2}
                aria-hidden={messages.length > 0}
                {...SHIMMER_MOTION_PROPS}
                className="pointer-events-none mx-auto block w-full max-w-2xl pb-4 text-center text-sm font-semibold"
              >
                {preConnectMessage}
              </MotionMessage>
            )}
          </AnimatePresence>
        )}

        <div className="bg-background relative mx-auto max-w-2xl pb-3 md:pb-12">
          <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full" />
          <AgentControlBar
            variant="livekit"
            controls={controls}
            isChatOpen={chatOpen}
            isConnected={session.isConnected}
            onDisconnect={onDisconnect ?? session.end}
            onIsChatOpenChange={setChatOpen}
            onDeviceError={handleDeviceError as any}
          />
        </div>
      </motion.div>
    </section>
  );
}
