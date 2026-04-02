import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../ui/Card';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Layers,
  Lightbulb,
  Package,
  Sprout,
  LineChart,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useInvestors } from '../../../hooks/useInvestors';
import { useAuth } from '../../../context/AuthContext';
import { startupsApi } from '../../../services/startupsApi';
import { investorsApi } from '../../../services/investorsApi';
import { profileApi } from '../../../services/profileApi';
import { notificationsApi, UserNotification } from '../../../services/notificationsApi';

const PHASE_STEPS: { key: string; label: string }[] = [
  { key: 'idea', label: 'Idea' },
  { key: 'mvp', label: 'MVP' },
  { key: 'seed', label: 'Seed' },
  { key: 'series-a', label: 'Series A' },
  { key: 'growth', label: 'Growth' },
  { key: 'scale', label: 'Scale' },
];

const PHASE_ICONS: Record<string, LucideIcon> = {
  idea: Lightbulb,
  mvp: Package,
  seed: Sprout,
  'series-a': TrendingUp,
  growth: LineChart,
  scale: Zap,
};

const PHASE_HINTS: Record<string, string> = {
  idea: 'Shape the vision, validate the problem, and talk to early users.',
  mvp: 'Ship a minimal product and learn from real usage.',
  seed: 'Prove traction and prepare for your first institutional round.',
  'series-a': 'Scale what works and sharpen unit economics.',
  growth: 'Expand markets, teams, and repeatable go-to-market.',
  scale: 'Optimize operations and capture dominant share.',
};

const formatPhaseLabel = (phase: string) => {
  const phaseMap: Record<string, string> = {
    idea: 'Idea',
    mvp: 'MVP',
    seed: 'Seed',
    'series-a': 'Series A',
    growth: 'Growth',
    scale: 'Scale',
  };
  return phaseMap[phase] || phase;
};

const journeyListVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

const journeyPillVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 420, damping: 28 },
  },
};

const StartupStageCard: React.FC<{ phase: string }> = ({ phase }) => {
  const stepIdx = PHASE_STEPS.findIndex((s) => s.key === phase);
  const PhaseIcon = PHASE_ICONS[phase] ?? Layers;
  const phaseHint = PHASE_HINTS[phase] ?? '';
  const progressLabel =
    stepIdx >= 0 ? `Stage ${stepIdx + 1} of ${PHASE_STEPS.length}` : 'Stage';

  return (
    <Card className="relative flex h-full min-h-0 flex-col overflow-hidden p-4">
      <motion.div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[var(--accent)]/[0.12] blur-2xl"
        aria-hidden
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.55, 0.85, 0.55],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="relative flex min-h-0 flex-1 flex-col"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="mb-3 flex shrink-0 items-start justify-between gap-2"
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <h2 className="text-lg font-semibold text-[var(--text)]">Startup Stage</h2>
          <motion.span
            layout
            className="rounded-full border border-[var(--border-muted)] bg-[var(--bg-muted)] px-2 py-0.5 text-[10px] font-medium tabular-nums text-[var(--text-muted)]"
            key={progressLabel}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {progressLabel}
          </motion.span>
        </motion.div>

        <div
          className="mb-3 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-muted)]/45 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          role="list"
          aria-label="Stage roadmap"
        >
          <p className="mb-2 px-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
            Journey
          </p>
          <motion.div
            className="flex flex-wrap items-center gap-1.5"
            variants={journeyListVariants}
            initial="hidden"
            animate="show"
          >
            {PHASE_STEPS.map((step, i) => {
              const isCurrent = stepIdx === i;
              const isPast = stepIdx > i;
              return (
                <motion.span
                  key={step.key}
                  role="listitem"
                  layout
                  variants={journeyPillVariants}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    isCurrent
                      ? 'bg-[var(--accent)]/20 text-[var(--accent)] ring-1 ring-[var(--accent)]/30 shadow-sm'
                      : isPast
                        ? 'bg-[var(--bg-card)] text-[var(--text-muted)] ring-1 ring-[var(--border-muted)]'
                        : 'bg-[var(--bg-card)]/40 text-[var(--text-subtle)] ring-1 ring-transparent'
                  }`}
                >
                  {isPast && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    >
                      <CheckCircle className="h-3 w-3 shrink-0 text-[var(--accent)] opacity-80" aria-hidden />
                    </motion.span>
                  )}
                  {step.label}
                </motion.span>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          layout
          className="flex min-h-0 flex-1 flex-col rounded-xl border border-[var(--border-muted)] bg-gradient-to-br from-[var(--accent)]/[0.07] via-[var(--bg-muted)]/30 to-transparent p-3 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset] ring-1 ring-[var(--accent)]/10"
          whileHover={{ scale: 1.008 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        >
          <div className="flex gap-3">
            <motion.span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/18 text-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-[var(--accent)]/22"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(0,0,0,0)',
                  '0 10px 28px -10px rgba(99, 102, 241, 0.35)',
                  '0 0 0 0 rgba(0,0,0,0)',
                ],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.span
                key={phase}
                initial={{ rotate: -12, opacity: 0, scale: 0.85 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              >
                <PhaseIcon className="h-5 w-5" strokeWidth={2.1} />
              </motion.span>
            </motion.span>
            <AnimatePresence mode="wait">
              <motion.div
                key={phase}
                className="min-w-0 flex-1 pt-0.5"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  Current stage
                </p>
                <p className="mt-1 text-xl font-bold leading-none tracking-tight text-[var(--text)]">
                  {formatPhaseLabel(phase)}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            {phaseHint ? (
              <motion.div
                key={phase + '-hint'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="mt-3 rounded-lg border border-[var(--border-muted)]/80 bg-[var(--bg-card)]/60 py-2.5 pl-3 pr-2.5"
              >
                <p className="border-l-2 border-[var(--accent)]/45 pl-2.5 text-xs leading-relaxed text-[var(--text-muted)]">
                  {phaseHint}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </Card>
  );
};

function notificationHeading(type: UserNotification['type']): string {
  switch (type) {
    case 'approval':
      return 'Application accepted';
    case 'rejection':
      return 'Application update';
    case 'event':
      return 'New event';
    case 'mentor':
      return 'New mentor';
    case 'investor':
      return 'New investor';
    case 'warning':
      return 'Heads up';
    case 'info':
      return 'Program update';
    default:
      return 'Update';
  }
}

const Overview: React.FC = () => {
  const { user } = useAuth();
  const { investors, loading: investorsLoading, error: investorsError } = useInvestors();
  const [startupPhase, setStartupPhase] = useState<string | null>(null);
  const [startupName, setStartupName] = useState<string>('');
  const [requestingIntro, setRequestingIntro] = useState<string | null>(null);
  const [introSuccess, setIntroSuccess] = useState<string | null>(null);
  const [introError, setIntroError] = useState<string | null>(null);
  const [programNotifications, setProgramNotifications] = useState<UserNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          // Fetch startup phase and name
          let foundStartupName = false;
          try {
            const startups = await startupsApi.getStartups(user.id);
            if (startups.length > 0) {
              if (startups[0].startupPhase) {
                setStartupPhase(startups[0].startupPhase);
              }
              if (startups[0].name) {
                setStartupName(startups[0].name);
                foundStartupName = true;
              }
            }
          } catch (error) {
            console.error('Error fetching startup phase:', error);
          }

          // Fetch profile to get startup name if not available from startup
          if (!foundStartupName) {
            try {
              const profile = await profileApi.getProfileByUserId(user.id);
              if (profile.startupName) {
                setStartupName(profile.startupName);
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }
        } finally {
          /* noop */
        }
      }
    };
    fetchData();
  }, [user?.id]);

  const refreshNotifications = React.useCallback(async (showSpinner: boolean) => {
    if (!user?.id) return;
    if (showSpinner) setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const list = await notificationsApi.getUserNotifications(user.id);
      setProgramNotifications(list);
    } catch (e) {
      console.error('Error loading notifications:', e);
      setNotificationsError('Could not load updates. Try again later.');
    } finally {
      if (showSpinner) setNotificationsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshNotifications(true);
  }, [refreshNotifications]);

  useEffect(() => {
    const t = setInterval(() => refreshNotifications(false), 60000);
    return () => clearInterval(t);
  }, [refreshNotifications]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') refreshNotifications(false);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [refreshNotifications]);

  const unreadCount = programNotifications.filter((n) => !n.read).length;

  const handleMarkNotificationRead = async (notificationId: string) => {
    setDismissingId(notificationId);
    try {
      await notificationsApi.markAsRead(notificationId);
      setProgramNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setDismissingId(null);
    }
  };

  const handleRequestIntro = async (investor: { id: string; email: string; name: string }) => {
    if (!user?.id || !user?.email || !user?.fullName) {
      setIntroError('User information not available. Please log in again.');
      setTimeout(() => setIntroError(null), 5000);
      return;
    }

    if (!startupName) {
      setIntroError('Startup name not found. Please complete your profile.');
      setTimeout(() => setIntroError(null), 5000);
      return;
    }

    setRequestingIntro(investor.id);
    setIntroError(null);
    setIntroSuccess(null);

    try {
      await investorsApi.requestIntro(
        investor.email,
        startupName,
        user.email,
        user.fullName
      );
      
      setIntroSuccess(`Introduction request sent to ${investor.name} successfully!`);
      setTimeout(() => setIntroSuccess(null), 5000);
    } catch (error: any) {
      console.error('Error sending intro request:', error);
      setIntroError(error.message || 'Failed to send introduction request. Please try again.');
      setTimeout(() => setIntroError(null), 5000);
    } finally {
      setRequestingIntro(null);
    }
  };


  const notificationIcon = (type: UserNotification['type']) => {
    switch (type) {
      case 'approval':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'rejection':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-[var(--accent)]" />;
      case 'mentor':
        return <Users className="h-5 w-5 text-[var(--accent)]" />;
      case 'investor':
        return <TrendingUp className="h-5 w-5 text-[var(--accent)]" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      default:
        return <FileText className="h-5 w-5 text-[var(--text-muted)]" />;
    }
  };

  const notificationTypeStyle = (type: UserNotification['type']) => {
    switch (type) {
      case 'approval':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'rejection':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'event':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'mentor':
        return 'bg-violet-50 text-violet-800 border-violet-200';
      case 'investor':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'warning':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      default:
        return 'bg-[var(--bg-muted)] text-[var(--text-muted)] border-[var(--border-muted)]';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text)] mb-2">Startup Dashboard</h1>
        <p className="text-[var(--text-muted)]">Track your progress and manage your startup journey</p>
      </div>

      {/* Program updates (server-backed: approval, events, mentors, investors) */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-[var(--text)]">Program updates</h2>
          <div className="text-sm text-[var(--text-muted)]">
            {notificationsLoading && programNotifications.length === 0
              ? 'Loading…'
              : unreadCount > 0
                ? `${unreadCount} unread`
                : programNotifications.length > 0
                  ? 'You are caught up'
                  : 'No updates yet'}
          </div>
        </div>

        {notificationsError && (
          <p className="text-sm text-red-600 mb-4">{notificationsError}</p>
        )}

        {!notificationsLoading && programNotifications.length === 0 && !notificationsError && (
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            When your application is accepted, or when admins add events, mentors, or investors, you will see notifications here.
          </p>
        )}

        {programNotifications.length > 0 && (
          <ul className="space-y-3" role="list">
            {programNotifications.map((n) => (
              <li
                key={n.id}
                className={`flex gap-3 rounded-xl border p-4 transition-colors ${
                  n.read
                    ? 'border-[var(--border-muted)] bg-[var(--bg-muted)]/40 opacity-90'
                    : 'border-[var(--accent)]/25 bg-[var(--accent)]/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]'
                }`}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-surface)] ring-1 ring-[var(--border-muted)]"
                  aria-hidden
                >
                  {notificationIcon(n.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[var(--text)]">{notificationHeading(n.type)}</p>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${notificationTypeStyle(
                        n.type
                      )}`}
                    >
                      {n.type}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">{n.message}</p>
                  <p className="mt-2 text-xs text-[var(--text-subtle)]">
                    {new Date(n.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => handleMarkNotificationRead(n.id)}
                    disabled={dismissingId === n.id}
                    className="shrink-0 self-start p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-muted)] transition-colors disabled:opacity-50"
                    title="Mark as read"
                  >
                    {dismissingId === n.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Startup Stage and Available Investors — equal height on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-stretch gap-6">
        <div className="flex h-full min-h-0 flex-col">
          {startupPhase && <StartupStageCard phase={startupPhase} />}
        </div>

        {/* Investor Suggestions */}
        <Card className="flex h-full min-h-0 flex-col p-4">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4 shrink-0">Available Investors</h2>

          <div className="flex min-h-0 flex-1 flex-col">
          {introSuccess && (
            <p className="text-sm text-[var(--text-muted)] mb-3 shrink-0">{introSuccess}</p>
          )}

          {introError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-700 text-sm">{introError}</span>
              </div>
            </div>
          )}
          
          {investorsError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-700 text-sm">{investorsError}</span>
              </div>
            </div>
          )}

          {investorsLoading ? (
            <div className="flex flex-1 items-center justify-center py-6">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
                <span className="text-[var(--text-muted)]">Loading investors...</span>
              </div>
            </div>
          ) : investors.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
              <Users className="h-10 w-10 text-[var(--text-subtle)] mx-auto mb-2" />
              <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">No investors available</h3>
              <p className="text-[var(--text-muted)]">Investors will appear here once they are added by administrators</p>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-wrap content-start gap-3 justify-center">
              {investors.slice(0, 3).map((investor) => (
                <div key={investor.id} className="bg-[var(--bg-muted)] rounded-xl p-3 border border-[var(--border-muted)] flex flex-col items-center text-center w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.5rem)]">
                  <div className="mb-2">
                    <div className="h-10 w-10 bg-[var(--accent-muted)] rounded-full flex items-center justify-center text-[var(--accent)] text-sm font-medium mx-auto mb-1.5">
                      {investor.profilePicture}
                    </div>
                    <h3 className="text-[var(--text)] font-medium text-sm mb-0.5">{investor.name}</h3>
                    <p className="text-[11px] text-[var(--text-muted)]">{investor.firm}</p>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mb-1.5 line-clamp-2">{investor.backgroundSummary}</p>
                  <p className="text-[10px] text-[var(--text-subtle)] mb-2">Investment Range: {investor.investmentRange}</p>
                  <button 
                    onClick={() => handleRequestIntro(investor)}
                    disabled={requestingIntro === investor.id}
                    className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--text-subtle)] disabled:cursor-not-allowed text-white py-1.5 px-3 rounded-full text-[11px] font-medium transition-all flex items-center justify-center hover:shadow-lg hover:shadow-[var(--accent)]/20"
                  >
                    {requestingIntro === investor.id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Request Intro'
                    )}
                  </button>
                </div>
              ))}
              {investors.length > 3 && (
                <div className="w-full text-center mt-3">
                  <button className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm font-medium">
                    View All Investors ({investors.length - 3} more)
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
        </Card>
      </div>

    </div>
  );
};

export default Overview;