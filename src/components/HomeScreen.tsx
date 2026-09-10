import React, { useState } from 'react';
import { Flame, Zap, Play, AlertTriangle, CheckCircle2, ChevronRight, Siren, Crown, Shirt, ShieldCheck, HeartHandshake, Volume2, VolumeX, Radio, Activity, Award, BookOpen, BellRing, ChevronLeft, Crosshair } from 'lucide-react';
import { UserProfile } from '../types';
import { useGamificationStore } from '../store/useGamificationStore';
import { useAvatarStore, getClinicalTier, getClinicalTierTitle } from '../store/useAvatarStore';
import { useShiftStore } from '../store/useShiftStore';
import { useNightShiftStore } from '../store/useNightShiftStore';
import { AvatarRenderer } from './avatar/AvatarRenderer';
import { CompanionRenderer } from './avatar/CompanionRenderer';
import { audio } from '../utils/audio';

interface HomeScreenProps {
  user: UserProfile;
  streak: number;
  dailyGoalProgress: number;
  dueReviewCount: number;
  onStartShift: () => void;
  onStartLesson: () => void;
  onOpenAtlas?: () => void;
  onOpenReview: () => void;
  onStartBossCase?: () => void;
}

interface ERDirectiveItem {
  id: string;
  title: string;
  laymanTitle: string;
  description: string;
  laymanDescription: string;
  rewardXP: number;
  targetTab: 'shift' | 'review';
  shortcutLabel: string;
}

const ER_DIRECTIVES_CONFIG: ERDirectiveItem[] = [
  {
    id: 'directive-zero-pitfalls',
    title: 'Zero Shock Bay Errors',
    laymanTitle: 'Zero Fatal Traps',
    description: 'Avoid preload and inotrope errors in Bed 2 & 3.',
    laymanDescription: 'Stabilize blood pressure without medication traps.',
    rewardXP: 50,
    targetTab: 'shift',
    shortcutLabel: 'Resus Bay',
  },
  {
    id: 'directive-rapid-triage',
    title: 'Rapid Triage Round',
    laymanTitle: 'Rapid Triage Round',
    description: 'Sort ambulance arrivals under 25s.',
    laymanDescription: 'Sort arrivals under 25 seconds.',
    rewardXP: 35,
    targetTab: 'shift',
    shortcutLabel: 'Ambulance',
  },
  {
    id: 'directive-spaced-repetition',
    title: 'Review Spaced Cards',
    laymanTitle: 'Memory Drill',
    description: 'Clear 3 due Anki clinical trap cards.',
    laymanDescription: 'Master 3 life-saving trap cards.',
    rewardXP: 40,
    targetTab: 'review',
    shortcutLabel: 'Review',
  },
];

const SHIFT_BRIEFING_PEARLS = [
  {
    id: 'rv-infarct',
    topic: 'HEMODYNAMICS',
    clinicalTitle: 'Right Ventricular Infarction Preload Trap',
    laymanTitle: 'Right-Side Heart Attack Blood Pressure Trap',
    clinicalPearl:
      'Right Ventricular Infarction is preload-dependent: nitrates abolish filling pressure and precipitate catastrophic refractory hypotension!',
    laymanPearl:
      'Right-sided heart attacks require high blood volume: blood pressure pills (nitrates) cause sudden cardiovascular collapse!',
    protocolTarget: 'cardiovascular',
  },
  {
    id: 'massive-pe',
    topic: 'PULMONARY',
    clinicalTitle: 'Submassive / Massive PE Thrombolysis',
    laymanTitle: 'Critical Lung Blood Clot Emergency',
    clinicalPearl:
      'Obstructive shock with RV strain in pulmonary embolism demands immediate systemic thrombolysis (Alteplase) before cardiac arrest!',
    laymanPearl:
      'Massive lung blood clots blocking circulation require immediate clot-busting medicine before the heart stops!',
    protocolTarget: 'cardiovascular',
  },
  {
    id: 'hyperkalemia',
    topic: 'TOX & METABOLIC',
    clinicalTitle: 'Hyperkalemic Membrane Stabilization',
    laymanTitle: 'Dangerous High Potassium Heart Shield',
    clinicalPearl:
      'Peaked T-waves & widened QRS: Stabilize myocardial membrane FIRST with IV Calcium Gluconate before shifting potassium with insulin/dextrose!',
    laymanPearl:
      'Dangerous blood potassium: Administer Calcium into the IV first to shield the heart rhythm before lowering potassium levels!',
    protocolTarget: 'toxicology',
  },
  {
    id: 'tension-pneumo',
    topic: 'TRAUMA RESUS',
    clinicalTitle: 'Tension Pneumothorax Decompression',
    laymanTitle: 'Trapped Chest Air Collapse',
    clinicalPearl:
      'Never wait for a chest X-ray in suspected tension pneumothorax with hypotension: perform immediate needle decompression in 4th/5th ICS mid-axillary line!',
    laymanPearl:
      'Trapped pressurized chest air collapsing blood flow requires instant emergency needle release without waiting for an X-ray!',
    protocolTarget: 'trauma',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  streak: propStreak,
  dailyGoalProgress,
  dueReviewCount,
  onStartShift,
  onStartLesson,
  onOpenAtlas,
  onOpenReview,
  onStartBossCase,
}) => {
  const {
    xp,
    level,
    title,
    streak: gameStreak,
    levelDetails,
    addXp,
  } = useGamificationStore();

  const {
    appearance,
    setAvatarStudioOpen,
  } = useAvatarStore();

  const {
    status,
    currentBedIndex,
    missedConcepts,
    isCivilianMode,
    toggleCivilianMode,
  } = useShiftStore();

  const { reputation } = useNightShiftStore();

  const isCivilian = isCivilianMode ?? !!user.civilianMode;

  const [isMuted, setIsMuted] = useState(audio.isMuted);
  const [activePearlIndex, setActivePearlIndex] = useState(0);

  // Directives completed state (persisted locally per user session)
  const [completedDirectives, setCompletedDirectives] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('resusquest_er_directives');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      'directive-zero-pitfalls': (user.shiftsCompleted || 0) > 0 && missedConcepts.length === 0,
      'directive-rapid-triage': false,
      'directive-spaced-repetition': false,
    };
  });

  const handleToggleDirective = (id: string, rewardXP: number) => {
    const isCurrentlyDone = !!completedDirectives[id];
    const newStatus = !isCurrentlyDone;

    const updated = { ...completedDirectives, [id]: newStatus };
    setCompletedDirectives(updated);
    try {
      localStorage.setItem('resusquest_er_directives', JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (newStatus) {
      audio.playSuccess();
      addXp(rewardXP);
    } else {
      audio.playTelemetryClick();
    }
  };

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  const currentStreak = gameStreak || propStreak;
  const currentXp = xp || user.xp;
  const currentLevel = level || user.level;
  const tier = getClinicalTier(currentLevel);
  const tierTitle = getClinicalTierTitle(tier);

  // Tactical Readiness Score (60 - 100%)
  const accuracy = user.accuracyRate && user.accuracyRate > 0 ? user.accuracyRate : 85;
  const streakFactor = (Math.min(currentStreak, 14) / 14) * 25;
  const shiftFactor = (Math.min(user.shiftsCompleted ?? 1, 10) / 10) * 25;
  const accFactor = (accuracy / 100) * 50;
  const readinessScore = Math.min(100, Math.max(60, Math.round(accFactor + streakFactor + shiftFactor)));

  const readinessStatus =
    readinessScore >= 92
      ? { label: 'OPTIMAL READINESS', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' }
      : readinessScore >= 80
      ? { label: 'HIGH READINESS', color: 'text-amber-300', bg: 'bg-amber-500/15 border-amber-500/30' }
      : { label: 'STABLE READINESS', color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30' };

  // Traps in Transit summary
  const latestMissed = missedConcepts.at(-1) ?? null;
  const trapDisplay = latestMissed
    ? {
        title: isCivilian ? 'Recent Pitfall' : `${latestMissed.category} Trap`,
        prompt: isCivilian ? (latestMissed.laymanPrompt ?? latestMissed.promptOrScenario) : latestMissed.promptOrScenario,
        reason: isCivilian ? (latestMissed.laymanReason ?? latestMissed.clinicalReason) : latestMissed.clinicalReason,
        solution: isCivilian ? (latestMissed.laymanAction ?? latestMissed.correctAction) : latestMissed.correctAction,
      }
    : {
        title: isCivilian ? 'Heart Attack Trap' : 'RV Infarction Preload Trap',
        prompt: isCivilian
          ? 'Giving blood pressure pills (nitrates) to a right-side heart attack patient causes sudden collapse.'
          : 'Inferior STEMI with RV involvement: Nitroglycerin abolishes preload, triggering sudden refractory hypotension.',
        reason: isCivilian
          ? 'Right side of the heart requires high fluid volume. Vasodilators collapse pressure immediately.'
          : 'Right ventricle lacks contractile reserve; output depends strictly on preload.',
        solution: isCivilian
          ? 'Suspend nitrates and give rapid IV fluid resuscitation.'
          : 'Immediate IV crystalloid volume bolus (500–1000 mL NS).',
      };

  const currentPearl = SHIFT_BRIEFING_PEARLS[activePearlIndex];

  return (
    <div
      id="home-screen-container"
      className="flex-1 p-4 space-y-3 pb-28 sm:pb-32 select-none overflow-y-auto scroll-smooth w-full max-w-md mx-auto"
    >
      {/* 1. Unified Command Hero Card: Avatar Merged with Level, Streak & Reputation */}
      <div
        id="hero-avatar-card"
        className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 rounded-3xl p-4 border border-slate-800 shadow-xl relative overflow-hidden space-y-3"
      >
        <div className="absolute top-0 inset-x-0 h-28 bg-radial from-rose-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Top Controls: Status tag + XP + Scrub Locker + Sound Toggle */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-800/90 text-rose-400 border border-slate-700 flex items-center gap-1 shrink-0">
              <Activity className="w-3 h-3 text-rose-400" />
              <span>COMMAND</span>
            </span>
            <span className="text-xs font-black text-white truncate">
              {appearance.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* XP Counter */}
            <div className="px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700 font-mono text-xs font-black text-emerald-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-emerald-400 shrink-0" />
              <span>{currentXp}</span>
            </div>

            {/* Quick-Access Scrub Locker */}
            <button
              id="btn-open-scrub-locker"
              onClick={() => {
                audio.playTelemetryClick();
                setAvatarStudioOpen(true);
              }}
              title="Scrub Locker"
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-[11px] font-bold border border-slate-700 border-b-2 active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Shirt className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Locker</span>
            </button>

            {/* Audio Telemetry Toggle */}
            <button
              id="btn-toggle-sound-hud"
              onClick={() => {
                audio.playTelemetryClick();
                handleToggleMute();
              }}
              title={isMuted ? 'Telemetry Audio Muted' : 'Telemetry Audio Active'}
              className={`p-1.5 px-2 rounded-xl border border-b-2 active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center ${
                isMuted
                  ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-xs'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Central Presentation: Avatar Side-by-Side with Level, Streak & Reputation */}
        <div className="flex items-center gap-3.5 relative z-10 pt-0.5">
          {/* Clinician Avatar & Companion */}
          <div className="relative shrink-0">
            <AvatarRenderer
              appearance={appearance}
              level={currentLevel}
              size="lg"
              showBadge={true}
              showAura={true}
              emotion="confident"
            />
            {appearance.companionId !== 'none' && (
              <div className="absolute -bottom-1 -right-2 bg-slate-900/95 backdrop-blur-xs rounded-xl p-1 shadow-md border border-slate-700">
                <CompanionRenderer
                  companionId={appearance.companionId}
                  size="sm"
                  showSpeech={false}
                  contextMode="idle"
                />
              </div>
            )}
          </div>

          {/* Identity & 3-Pillar Unified Metrics */}
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h2 className="text-sm font-black text-white tracking-tight truncate">
                {appearance.name}
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold truncate">
                Emergency Resuscitationist
              </p>
            </div>

            {/* Merged 3 Pillars: Level • Streak • Reputation */}
            <div className="grid grid-cols-3 gap-1.5">
              {/* 1. Level */}
              <div className="bg-slate-800/90 rounded-xl p-1.5 border border-slate-700 text-center">
                <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center justify-center gap-0.5">
                  <Award className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>LEVEL</span>
                </div>
                <div className="text-xs font-black text-white font-mono mt-0.5">
                  Lv.{currentLevel}
                </div>
                <div className="text-[9px] text-slate-400 truncate font-semibold">
                  {tierTitle || title}
                </div>
              </div>

              {/* 2. Streak */}
              <div className="bg-slate-800/90 rounded-xl p-1.5 border border-amber-500/30 text-center">
                <div className="text-[9px] font-black uppercase text-amber-400 tracking-wider flex items-center justify-center gap-0.5">
                  <Flame className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse shrink-0" />
                  <span>STREAK</span>
                </div>
                <div className="text-xs font-black text-amber-300 font-mono mt-0.5">
                  {currentStreak}d
                </div>
                <div className="text-[9px] text-amber-400/80 truncate font-semibold">
                  Active
                </div>
              </div>

              {/* 3. Reputation */}
              <div className="bg-slate-800/90 rounded-xl p-1.5 border border-emerald-500/30 text-center">
                <div className="text-[9px] font-black uppercase text-emerald-400 tracking-wider flex items-center justify-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>REP</span>
                </div>
                <div className="text-xs font-black text-emerald-300 font-mono mt-0.5 truncate">
                  Tier {reputation.tier}
                </div>
                <div className="text-[9px] text-emerald-400/80 truncate font-semibold">
                  {reputation.tierTitle}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progression Track */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1 relative z-10">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400 font-bold">
              Rank Progress ({levelDetails.xpIntoLevel} / {levelDetails.xpRequiredForLevel} XP)
            </span>
            <span className="text-amber-400 font-black">
              {levelDetails.progressPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              id="bar-level-progress-home"
              className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-rose-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, levelDetails.progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Tactical Readiness Indicator */}
        <div
          id="badge-tactical-readiness"
          className={`w-full z-10 p-2 px-3 rounded-xl border ${readinessStatus.bg} flex items-center justify-between text-left shadow-xs relative`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="text-[11px] truncate">
              <span className="text-slate-300 font-bold">Readiness: </span>
              <span className={`${readinessStatus.color} font-black`}>{readinessStatus.label}</span>
            </div>
          </div>

          <div className="text-right shrink-0 pl-2">
            <span className="text-sm font-mono font-black text-white">
              {readinessScore}%
            </span>
          </div>
        </div>
      </div>

      {/* ED Department Status Banner */}
      <div
        id="banner-ed-department-status"
        className="bg-slate-900 text-slate-100 rounded-2xl px-3.5 py-2 border border-slate-800 flex items-center justify-between shadow-md"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </div>
          <div className="text-xs font-black tracking-wide text-slate-200 flex items-center gap-1.5 truncate">
            <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>County General • Trauma 1 Resus Bays Active</span>
          </div>
        </div>

        <div className="shrink-0 pl-2">
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[9px] font-black text-amber-300 uppercase tracking-wider">
            SURGE
          </span>
        </div>
      </div>

      {/* Primary Action Card: Dynamic Shift State */}
      <div id="card-primary-action" className="w-full">
        {status === 'idle' && (
          <button
            id="btn-clock-in-night-shift"
            onClick={() => {
              audio.playAlarmPulse();
              onStartShift();
            }}
            className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-800 text-white font-black text-xs uppercase tracking-wider active:border-b-0 active:translate-y-1 transition-all shadow-xl shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Siren className="w-4 h-4 text-rose-100 animate-pulse shrink-0" />
            <span>CLOCK IN TO NIGHT SHIFT (+100 XP)</span>
          </button>
        )}

        {(status === 'in_progress' || status === 'perk_draft') && (
          <button
            id="btn-resume-shift-active"
            onClick={() => {
              audio.playAlarmPulse();
              onStartShift();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 border-b-4 border-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider active:border-b-0 active:translate-y-1 transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer animate-pulse"
          >
            <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
            <span>
              RESUME RESUSCITATION (Bed {currentBedIndex + 1})
            </span>
          </button>
        )}

        {status === 'shift_completed' && (
          <button
            id="btn-view-attending-debrief"
            onClick={() => {
              audio.playTelemetryClick();
              onStartShift();
            }}
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border-b-4 border-slate-950 text-slate-100 font-black text-xs uppercase tracking-wider active:border-b-0 active:translate-y-1 transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer border border-slate-800"
          >
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>VIEW ATTENDING DEBRIEF</span>
          </button>
        )}
      </div>

      {/* Civilian Responder Mode Switcher */}
      <div
        id="banner-homescreen-civilian-mode"
        className={`p-3 rounded-2xl border transition-all ${
          isCivilian
            ? 'bg-amber-950/30 border-amber-500/50 shadow-xs'
            : 'bg-slate-900 border-slate-800 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-1.5 rounded-xl shrink-0 ${
                isCivilian
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wide text-slate-100">
                  Civilian Mode
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                    isCivilian
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isCivilian ? 'ON' : 'OFF'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Plain-language emergency guidance.
              </p>
            </div>
          </div>

          <button
            id="btn-toggle-civilian-homescreen"
            onClick={() => {
              audio.playTelemetryClick();
              toggleCivilianMode();
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs border border-b-2 active:border-b-0 active:translate-y-0.5 shrink-0 transition-all cursor-pointer ${
              isCivilian
                ? 'bg-amber-500 text-slate-950 border-amber-600 hover:bg-amber-400 shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isCivilian ? 'Enabled' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Resus Intercom Pager Briefing */}
      <div
        id="card-chief-shift-briefing"
        className="bg-slate-900 text-slate-100 rounded-3xl p-3.5 border border-slate-800 shadow-xl space-y-2.5 relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
            <BellRing className="w-3 h-3 text-amber-400 animate-bounce" />
            <span>PAGER ALERT • {currentPearl.topic}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="btn-prev-pager-pearl"
              onClick={() => {
                audio.playTelemetryClick();
                setActivePearlIndex((prev) =>
                  prev === 0 ? SHIFT_BRIEFING_PEARLS.length - 1 : prev - 1
                );
              }}
              title="Previous Alert"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1">
              {activePearlIndex + 1}/{SHIFT_BRIEFING_PEARLS.length}
            </span>
            <button
              id="btn-next-pager-pearl"
              onClick={() => {
                audio.playTelemetryClick();
                setActivePearlIndex((prev) =>
                  prev === SHIFT_BRIEFING_PEARLS.length - 1 ? 0 : prev + 1
                );
              }}
              title="Next Alert"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pager LCD Screen Area */}
        <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 space-y-1">
          <h4 className="text-xs font-black text-white tracking-tight">
            {isCivilian ? currentPearl.laymanTitle : currentPearl.clinicalTitle}
          </h4>

          <p className="text-xs text-amber-200/90 font-medium leading-relaxed">
            "{isCivilian ? currentPearl.laymanPearl : currentPearl.clinicalPearl}"
          </p>
        </div>

        <button
          id="btn-read-protocol-atlas"
          onClick={() => {
            audio.playTelemetryClick();
            if (onOpenAtlas) {
              onOpenAtlas();
            } else {
              onStartLesson();
            }
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 border-b-3 border-b-slate-950 text-slate-100 font-bold text-xs flex items-center justify-between active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-2 text-rose-400">
            <BookOpen className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-slate-100 font-bold">Protocol Atlas</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-rose-400 font-bold">
            <span>Open</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* Featured Boss Trial: Code STEMI */}
      {onStartBossCase && (
        <div
          id="card-incoming-code-stemi"
          className="bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 text-slate-100 rounded-3xl p-3.5 border-2 border-rose-600/70 shadow-xl space-y-2.5 relative overflow-hidden"
        >
          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-1 min-w-0 pr-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-200 bg-rose-600/30 px-2 py-0.5 rounded-full border border-rose-500/50 inline-flex items-center gap-1">
                <Siren className="w-3 h-3 text-rose-400 animate-pulse" />
                <span>BOSS TRIAL</span>
              </span>
              <h3 className="text-sm font-black text-white tracking-tight truncate">
                {isCivilian
                  ? '62M Crushing Chest Pain Shock'
                  : '62M Inferior/RV STEMI Shock'}
              </h3>
              <p className="text-[11px] font-medium text-slate-300 leading-snug">
                {isCivilian
                  ? 'Critical bedside decisions under live pressure.'
                  : 'Branching decisions under hemodynamic collapse.'}
              </p>
            </div>

            <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/50 text-rose-400 flex items-center justify-center shrink-0">
              <Crown className="w-4.5 h-4.5 stroke-[2.2] text-amber-400 animate-pulse" />
            </div>
          </div>

          <button
            id="btn-launch-code-stemi"
            onClick={() => {
              audio.playAlarmPulse();
              onStartBossCase();
            }}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 border-b-3 border-rose-900 text-white font-black text-xs uppercase tracking-wider active:border-b-0 active:translate-y-0.5 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer relative z-10"
          >
            <Play className="w-3.5 h-3.5 fill-white shrink-0" />
            <span>ENTER BOSS BATTLE (+150 XP)</span>
          </button>
        </div>
      )}

      {/* Daily Shift Operations */}
      <div id="card-er-directives" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-100">
              DAILY SHIFT DIRECTIVES
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400">
            {Object.values(completedDirectives).filter(Boolean).length}/{ER_DIRECTIVES_CONFIG.length} DONE
          </span>
        </div>

        <div className="space-y-1.5">
          {ER_DIRECTIVES_CONFIG.map((directive) => {
            const isDone = !!completedDirectives[directive.id];

            return (
              <div
                key={directive.id}
                id={`directive-item-${directive.id}`}
                className={`bg-slate-900 rounded-2xl p-3 border transition-all shadow-md flex items-center justify-between gap-2.5 ${
                  isDone
                    ? 'border-emerald-500/40 bg-slate-900/90'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Checkbox button */}
                <button
                  id={`btn-checkbox-${directive.id}`}
                  onClick={() => handleToggleDirective(directive.id, directive.rewardXP)}
                  title={isDone ? 'Mark Incomplete' : 'Claim Bounty'}
                  className="cursor-pointer shrink-0 transition-transform active:scale-90"
                >
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-slate-950'
                        : 'border-2 border-slate-700 text-transparent bg-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </button>

                {/* Title & Concise Description */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-bold leading-tight truncate ${
                      isDone ? 'text-slate-400 line-through' : 'text-slate-100'
                    }`}
                  >
                    {isCivilian ? directive.laymanTitle : directive.title}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    {isCivilian ? directive.laymanDescription : directive.description}
                  </p>
                </div>

                {/* XP Chip + Jump Button */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    +{directive.rewardXP}XP
                  </span>

                  <button
                    id={`btn-shortcut-${directive.id}`}
                    onClick={() => {
                      audio.playTelemetryClick();
                      if (directive.targetTab === 'shift') {
                        onStartShift();
                      } else {
                        onOpenReview();
                      }
                    }}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer flex items-center gap-0.5"
                  >
                    <span>{directive.shortcutLabel}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Traps in Transit Alert */}
      <div
        id="card-traps-in-transit"
        className="bg-slate-900 text-slate-100 rounded-2xl p-3.5 border border-slate-800 shadow-md space-y-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-400">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{trapDisplay.title}</span>
          </div>

          {dueReviewCount > 0 && (
            <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
              {dueReviewCount} DUE
            </span>
          )}
        </div>

        <p className="text-xs text-slate-200 font-medium leading-snug">
          {trapDisplay.prompt}
        </p>

        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-0.5 text-slate-300">
          <div>
            <span className="font-bold text-rose-400">Pitfall:</span>{' '}
            {trapDisplay.reason}
          </div>
          <div>
            <span className="font-bold text-emerald-400">Action:</span>{' '}
            {trapDisplay.solution}
          </div>
        </div>

        <button
          id="btn-open-review-trap"
          onClick={() => {
            audio.playTelemetryClick();
            onOpenReview();
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 border-b-3 border-b-slate-950 text-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer shadow-sm"
        >
          <span>Open Review Deck ({dueReviewCount} Due)</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
