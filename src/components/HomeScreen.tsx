import React from 'react';
import {
  Flame,
  Zap,
  Play,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Siren,
  Crown,
  Shirt,
  ShieldCheck,
  Heart,
  Wind,
  Activity,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { UserProfile } from '../types';
import { useGamificationStore } from '../store/useGamificationStore';
import { useAvatarStore, getClinicalTier, getClinicalTierTitle } from '../store/useAvatarStore';
import { LevelProgressBar } from './gamification/LevelProgressBar';
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
  onOpenReview: () => void;
  onStartBossCase?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  streak: propStreak,
  dailyGoalProgress,
  dueReviewCount,
  onStartShift,
  onStartLesson,
  onOpenReview,
  onStartBossCase,
}) => {
  const {
    xp,
    level,
    title,
    streak: gameStreak,
    levelDetails,
  } = useGamificationStore();

  const {
    appearance,
    dailyQuests,
    masteryDomains,
    setAvatarStudioOpen,
    setInventoryModalOpen,
  } = useAvatarStore();

  const currentStreak = gameStreak || propStreak;
  const currentXp = xp || user.xp;
  const currentLevel = level || user.level;
  const tier = getClinicalTier(currentLevel);
  const tierTitle = getClinicalTierTitle(tier);

  return (
    <div
      id="home-screen-container"
      className="flex-1 p-4 space-y-4 pb-24 select-none overflow-y-auto"
    >
      {/* 1. Header Bar: Level, Title, Streak & XP */}
      <div
        id="header-streak-card"
        className="bg-slate-900 text-white rounded-3xl p-4 shadow-xl border border-slate-800 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-amber-400 text-amber-400 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-black text-amber-400 block tracking-wide">
                {currentStreak}-DAY STREAK
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                Shift Protocol Maintained
              </span>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-xs font-black text-emerald-400 flex items-center justify-end gap-1">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" />
              {currentXp} XP
            </span>
            <span className="text-[9px] text-slate-400 block uppercase">
              Level {currentLevel} • {title}
            </span>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="pt-2 border-t border-slate-800">
          <LevelProgressBar details={levelDetails} compact />
        </div>
      </div>

      {/* 2. Hero Clinician Avatar Stage */}
      <div
        id="hero-avatar-card"
        className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col items-center text-center space-y-3"
      >
        {/* Subtle Ambient Vignette */}
        <div className="absolute top-0 inset-x-0 h-28 bg-radial from-rose-500/10 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="w-full flex items-center justify-between z-10">
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-800/90 text-rose-400 border border-slate-700">
            {tierTitle}
          </span>
          <button
            id="btn-open-avatar-studio-top"
            onClick={() => {
              audio.playTelemetryClick();
              setAvatarStudioOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-[11px] font-bold border border-rose-500/40 transition-colors cursor-pointer"
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>
        </div>

        {/* Avatar Display with Companion Speech Bubble */}
        <div className="relative my-1">
          <AvatarRenderer
            appearance={appearance}
            level={currentLevel}
            size="xl"
            showBadge={true}
            showAura={true}
            emotion="confident"
          />

          {/* Floating Companion */}
          {appearance.companionId !== 'none' && (
            <div className="absolute -bottom-2 -right-4 bg-slate-900/90 backdrop-blur-xs rounded-2xl p-1.5 shadow-lg border border-slate-700">
              <CompanionRenderer
                companionId={appearance.companionId}
                size="md"
                showSpeech={true}
                contextMode="idle"
              />
            </div>
          )}
        </div>

        {/* Clinician Dossier Info */}
        <div className="z-10 space-y-0.5">
          <h2 className="text-base font-black text-white">{appearance.name}</h2>
          <p className="text-[11px] text-slate-400 font-semibold">
            Emergency Department • Level {currentLevel} {title}
          </p>
        </div>

        {/* Giant Tactile 3D Action: START NIGHT SHIFT */}
        <button
          id="btn-start-night-shift-hero"
          onClick={() => {
            audio.playAlarmPulse();
            onStartShift();
          }}
          className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-800 text-white font-black text-sm uppercase tracking-wider active:border-b-0 active:translate-y-1 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer z-10"
        >
          <Siren className="w-5 h-5 text-rose-100 animate-pulse" />
          <span>🌙 ENTER NIGHT SHIFT (+100 XP)</span>
        </button>

        {/* Quick Inventory / Wardrobe Shortcuts */}
        <div className="w-full flex items-center justify-center gap-3 pt-1 z-10">
          <button
            onClick={() => {
              audio.playTelemetryClick();
              setInventoryModalOpen(true);
            }}
            className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Open Inventory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Featured Clinical Boss Battle Card */}
      {onStartBossCase && (
        <div
          id="hero-boss-battle-card"
          className="bg-slate-950 rounded-3xl p-4.5 border-2 border-amber-500/50 shadow-xl space-y-3 relative overflow-hidden text-white"
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/40 inline-flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>CLINICAL BOSS BATTLE</span>
              </span>
              <h3 className="text-base font-black text-white mt-1.5 flex items-center gap-1.5">
                <span>👑 THE CHEST PAIN CASE</span>
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5 leading-relaxed">
                62-year-old with acute crushing chest pain. Progressive branching emergency decision simulation.
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>

          <button
            id="btn-start-boss-battle"
            onClick={onStartBossCase}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 border-b-4 border-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider active:border-b-0 active:translate-y-1 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>ENTER BOSS BATTLE (+150 XP)</span>
          </button>
        </div>
      )}

      {/* 4. Daily Quests Section */}
      <div id="card-daily-quests" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
            DAILY SHIFT QUESTS
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-500">
            {dailyQuests.filter((q) => q.completed).length} / {dailyQuests.length} COMPLETED
          </span>
        </div>

        <div className="space-y-2">
          {dailyQuests.map((quest) => (
            <div
              key={quest.id}
              id={`quest-item-${quest.id}`}
              className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    quest.completed
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'border-2 border-slate-300 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <span
                    className={`text-xs font-bold block ${
                      quest.completed ? 'text-slate-400 line-through' : 'text-slate-800'
                    }`}
                  >
                    {quest.title}
                  </span>
                  <span className="text-[10px] text-slate-400">{quest.description}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                +{quest.rewardXP} XP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Medical Mastery Preview */}
      <div id="card-mastery-overview" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
            MEDICAL MASTERY
          </span>
          <span className="text-[10px] font-bold text-slate-500">Clinical Competence</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
          {masteryDomains.slice(0, 4).map((domain) => {
            const getDomainIcon = (name: string) => {
              switch (name) {
                case 'Cardiology':
                  return <Heart className="w-3.5 h-3.5 text-rose-500" />;
                case 'Airway':
                  return <Wind className="w-3.5 h-3.5 text-blue-500" />;
                case 'Circulation':
                  return <Activity className="w-3.5 h-3.5 text-emerald-500" />;
                case 'Trauma':
                default:
                  return <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />;
              }
            };

            return (
              <div key={domain.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-slate-800">
                    {getDomainIcon(domain.shortName)}
                    <span>{domain.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-600">
                    {domain.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${domain.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Flashcard Review Alert */}
      {dueReviewCount > 0 && (
        <div
          id="card-clinical-weakness"
          className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-900">
                {dueReviewCount} Due Flashcards
              </h4>
              <p className="text-[11px] font-semibold text-amber-700">
                Spaced repetition review is ready.
              </p>
            </div>
          </div>

          <button
            id="btn-open-review-alert"
            onClick={onOpenReview}
            className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
          >
            REVIEW NOW
          </button>
        </div>
      )}

      {/* 7. Quick Protocol Study Link */}
      <div
        id="card-learn-quick-link"
        onClick={onStartLesson}
        className="bg-white rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">
              Clinical Protocol Atlas
            </div>
            <div className="text-[10px] text-slate-500">
              Study ACLS/ATLS resuscitation pathways & pitfalls
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
};
