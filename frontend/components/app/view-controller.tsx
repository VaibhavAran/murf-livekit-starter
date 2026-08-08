'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'motion/react';
import { useSessionContext } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { AgentSessionView_01 } from '@/components/agents-ui/blocks/agent-session-view-01';
import { WelcomeView } from '@/components/app/welcome-view';

const MotionWelcomeView = motion.create(WelcomeView);
const MotionSessionView = motion.create(AgentSessionView_01);

const VIEW_MOTION_PROPS = {
  variants: {
    visible: { opacity: 1, scale: 1 },
    hidden: { opacity: 0, scale: 0.97 },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.4,
    ease: 'easeOut',
  },
};

/* ─── Call Ended Full-Page View ───────────────────────────── */
function CallEndedView({ onRestart }: { onRestart: () => void }) {
  return (
    <motion.div
      key="call-ended"
      variants={{ visible: { opacity: 1, y: 0 }, hidden: { opacity: 0, y: 30 } }}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 px-6 text-center"
      style={{
        background: 'linear-gradient(135deg, oklch(0.94 0.06 265 / 0.95), oklch(0.98 0.03 80 / 0.97))',
      }}
    >
      {/* Floating orbs background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-24 -left-24 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }}
        />
        <div
          className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }}
        />
      </div>

      {/* Checkmark circle */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
        className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)' }}
      >
        {/* Outer glow ring */}
        <div
          className="animate-pulse-ring absolute inset-0 rounded-full"
          style={{ margin: '-8px' }}
        />
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
          <motion.path
            d="M5 13l4 4L19 7"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>

      {/* Heading */}
      <div className="relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-3xl font-extrabold tracking-tight text-slate-800 md:text-4xl"
        >
          Session Complete! 🎉
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-3 max-w-sm text-base text-slate-600"
        >
          Great job! You&apos;ve finished your learning session.
          <br />
          Keep up the amazing work — every question makes you smarter!
        </motion.p>
      </div>

      {/* Animated stars */}
      <div className="relative z-10 flex gap-2 text-3xl">
        {['⭐', '⭐', '⭐', '⭐', '⭐'].map((star, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              delay: 0.5 + i * 0.1,
              type: 'spring',
              stiffness: 400,
              damping: 15,
            }}
          >
            {star}
          </motion.span>
        ))}
      </div>

      {/* Restart button */}
      <motion.button
        id="start-again-btn"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        onClick={onRestart}
        className="btn-glow relative z-10 flex items-center gap-3 rounded-full px-10 py-4 text-base font-bold tracking-wide text-white uppercase shadow-xl transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/50"
      >
        <span className="text-lg">🎓</span>
        Start New Session
      </motion.button>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="relative z-10 text-sm text-slate-500"
      >
        Click above to begin another learning session
      </motion.p>
    </motion.div>
  );
}

interface ViewControllerProps {
  appConfig: AppConfig;
}

export function ViewController({ appConfig }: ViewControllerProps) {
  const { isConnected, start, end } = useSessionContext();
  const { resolvedTheme } = useTheme();

  // Track if the call was intentionally ended (vs. never connected)
  const [callEnded, setCallEnded] = useState(false);
  const wasConnectedRef = useState(false);

  // When we connect, mark that we've had a session
  useEffect(() => {
    if (isConnected) {
      wasConnectedRef[1](true);
      // Reset call ended when a new session starts
      setCallEnded(false);
    }
  }, [isConnected]);

  const handleDisconnect = () => {
    end();
    setCallEnded(true);
  };

  const handleRestart = () => {
    setCallEnded(false);
  };

  // Which view to show
  const showCallEnded = !isConnected && callEnded;
  const showWelcome = !isConnected && !callEnded;
  const showSession = isConnected;

  return (
    <AnimatePresence mode="wait">
      {/* Call Ended View */}
      {showCallEnded && (
        <CallEndedView key="call-ended" onRestart={handleRestart} />
      )}

      {/* Welcome view */}
      {showWelcome && (
        <MotionWelcomeView
          key="welcome"
          {...VIEW_MOTION_PROPS}
          startButtonText={appConfig.startButtonText}
          onStartCall={start}
        />
      )}

      {/* Session view */}
      {showSession && (
        <MotionSessionView
          key="session-view"
          {...VIEW_MOTION_PROPS}
          supportsChatInput={appConfig.supportsChatInput}
          supportsVideoInput={appConfig.supportsVideoInput}
          supportsScreenShare={appConfig.supportsScreenShare}
          isPreConnectBufferEnabled={appConfig.isPreConnectBufferEnabled}
          audioVisualizerType={appConfig.audioVisualizerType}
          audioVisualizerColor={
            resolvedTheme === 'dark'
              ? appConfig.audioVisualizerColorDark
              : appConfig.audioVisualizerColor
          }
          audioVisualizerColorShift={appConfig.audioVisualizerColorShift}
          audioVisualizerBarCount={appConfig.audioVisualizerBarCount}
          audioVisualizerGridRowCount={appConfig.audioVisualizerGridRowCount}
          audioVisualizerGridColumnCount={appConfig.audioVisualizerGridColumnCount}
          audioVisualizerRadialBarCount={appConfig.audioVisualizerRadialBarCount}
          audioVisualizerRadialRadius={appConfig.audioVisualizerRadialRadius}
          audioVisualizerWaveLineWidth={appConfig.audioVisualizerWaveLineWidth}
          onDisconnect={handleDisconnect}
          className="fixed inset-0"
        />
      )}
    </AnimatePresence>
  );
}
