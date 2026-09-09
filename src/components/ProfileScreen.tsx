import React from 'react';
import { UserProfile } from '../types';
import {
  Award,
  ShieldCheck,
  Zap,
  Activity,
  Flame,
  CheckCircle2,
  BookOpen,
  Target,
  AlertCircle,
  Shirt,
  Package,
  Heart,
  Wind,
  ShieldAlert,
  Brain,
  Baby,
  Sparkles,
  Gift,
  Lock,
} from 'lucide-react';
import { useGamificationStore } from '../store/useGamificationStore';
import { useAvatarStore, getClinicalTier, getClinicalTierTitle } from '../store/useAvatarStore';
import { LevelProgressBar } from './gamification/LevelProgressBar';
import { AvatarRenderer } from './avatar/AvatarRenderer';
import { CompanionRenderer } from './avatar/CompanionRenderer';
import { GAME_RANK_DISCLAIMER } from '../types/gamification';
import { audio } from '../utils/audio';

interface ProfileScreenProps {
  user: UserProfile;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const {
    xp,
    level,
    title,
    streak,
    questionsAnswered,
    correctAnswers,
    accuracy,
    lessonsCompleted,
    topicsCompleted,
    clinicalCasesCompleted,
    achievements,
    levelDetails,
    addXp,
  } = useGamificationStore();

  const {
    appearance,
    masteryDomains,
    milestones,
    claimMilestone,
    unlockedItemIds,
    catalog,
    setAvatarStudioOpen,
    setInventoryModalOpen,
  } = useAvatarStore();

  const tier = getClinicalTier(level);
  const tierTitle = getClinicalTierTitle(tier);

  const getDomainIcon = (shortName: string) => {
    switch (shortName) {
      case 'Cardiology':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'Airway':
        return <Wind className="w-4 h-4 text-blue-500" />;
      case 'Circulation':
        return <Activity className="w-4 h-4 text-emerald-500" />;
      case 'Trauma':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'Neuro/Tox':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'Peds':
      default:
        return <Baby className="w-4 h-4 text-pink-500" />;
    }
  };

  const handleClaimMilestone = (milestoneId: string) => {
    const { rewardXP } = claimMilestone(milestoneId);
    if (rewardXP > 0) {
      addXp(rewardXP, `Milestone Claimed (+${rewardXP} XP)`);
    }
  };

  return (
    <div
      id="profile-screen-container"
      className="flex-1 p-4 pb-24 space-y-4 animate-fadeIn select-none overflow-y-auto"
    >
      {/* Clinician Dossier Card with Live Avatar */}
      <div
        id="card-clinician-dossier"
        className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800 space-y-3 text-center relative overflow-hidden"
      >
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            onClick={() => {
              audio.playTelemetryClick();
              setAvatarStudioOpen(true);
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-rose-300 border border-slate-700 cursor-pointer flex items-center gap-1 text-xs font-bold"
            title="Wardrobe Studio"
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>
        </div>

        {/* Live Avatar Preview */}
        <div className="relative inline-block mt-1">
          <AvatarRenderer
            appearance={appearance}
            level={level}
            size="lg"
            showBadge={true}
            showAura={true}
          />
          {appearance.companionId !== 'none' && (
            <div className="absolute -bottom-1 -right-3 bg-slate-900 rounded-xl p-1 border border-slate-700">
              <CompanionRenderer
                companionId={appearance.companionId}
                size="sm"
                showSpeech={false}
              />
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-black text-white">
            {appearance.name || user.name || 'Emergency Resident'}
          </h2>
          <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wide">
            Level {level} • {title} ({tierTitle})
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            (ResusQuest Clinical Simulation Dossier)
          </span>
        </div>

        {/* Metric Quick Chips */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800 font-mono text-center">
          <div className="bg-slate-800/60 p-1.5 rounded-xl border border-slate-700/50">
            <span className="text-[9px] text-slate-400 uppercase block">XP</span>
            <span className="text-sm font-black text-amber-400">{xp}</span>
          </div>
          <div className="bg-slate-800/60 p-1.5 rounded-xl border border-slate-700/50">
            <span className="text-[9px] text-slate-400 uppercase block">LEVEL</span>
            <span className="text-sm font-black text-slate-100">L{level}</span>
          </div>
          <div className="bg-slate-800/60 p-1.5 rounded-xl border border-slate-700/50">
            <span className="text-[9px] text-slate-400 uppercase block">STREAK</span>
            <span className="text-sm font-black text-rose-400">{streak}d</span>
          </div>
          <div className="bg-slate-800/60 p-1.5 rounded-xl border border-slate-700/50">
            <span className="text-[9px] text-slate-400 uppercase block">ACCURACY</span>
            <span className="text-sm font-black text-emerald-400">{accuracy}%</span>
          </div>
        </div>

        {/* Inventory Shortcut button */}
        <div className="pt-2">
          <button
            onClick={() => {
              audio.playTelemetryClick();
              setInventoryModalOpen(true);
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>
              Clinical Inventory ({unlockedItemIds.length} / {catalog.length} Items Unlocked)
            </span>
          </button>
        </div>
      </div>

      {/* Level Progression Card */}
      <div className="space-y-1.5">
        <span className="text-xs font-black uppercase tracking-wider text-slate-700 block px-1">
          RANK ADVANCEMENT & XP
        </span>
        <LevelProgressBar details={levelDetails} />
      </div>

      {/* MEDICAL MASTERY DOMAINS */}
      <div id="section-medical-mastery" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
            MEDICAL MASTERY DOMAINS
          </span>
          <span className="text-[10px] font-bold text-slate-500">6 Domains Tracked</span>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-3.5">
          {masteryDomains.map((domain) => (
            <div key={domain.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                    {getDomainIcon(domain.shortName)}
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      {domain.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Tier: <strong className="text-slate-700 capitalize">{domain.tier}</strong> (
                      {domain.questionsAnswered} questions)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-black text-slate-900">
                    {domain.percentage}%
                  </span>
                  <span className="block text-[9px] text-emerald-600 font-bold">
                    {domain.casesSolved} cases
                  </span>
                </div>
              </div>

              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${domain.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CLINICAL MILESTONES SYSTEM */}
      <div id="section-milestones" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
            CLINICAL CAREER MILESTONES
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-500">
            {milestones.filter((m) => m.isClaimed).length} / {milestones.length} CLAIMED
          </span>
        </div>

        <div className="space-y-2">
          {milestones.map((m) => {
            const isUnlocked = m.isUnlocked;
            const isClaimed = m.isClaimed;

            return (
              <div
                key={m.id}
                id={`milestone-${m.id}`}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isClaimed
                    ? 'bg-slate-50 border-slate-200 opacity-75'
                    : isUnlocked
                    ? 'bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isClaimed
                          ? 'bg-slate-200 text-slate-500'
                          : isUnlocked
                          ? 'bg-amber-500 text-white animate-bounce'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isClaimed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isUnlocked ? (
                        <Gift className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          LVL {m.targetLevel}
                        </span>
                        <h4 className="text-xs font-black text-slate-900">{m.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {m.description}
                      </p>
                      <div className="text-[10px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Reward: +{m.rewardXP} XP {m.rewardTitle ? `• "${m.rewardTitle}"` : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isUnlocked && !isClaimed && (
                      <button
                        onClick={() => handleClaimMilestone(m.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md border-b-2 border-amber-700 active:border-b-0 active:translate-y-0.5 cursor-pointer"
                      >
                        Claim
                      </button>
                    )}
                    {isClaimed && (
                      <span className="text-[10px] font-bold text-slate-400">Claimed</span>
                    )}
                    {!isUnlocked && (
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        Level {m.targetLevel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gamification Core Metrics Grid */}
      <div className="space-y-1.5">
        <span className="text-xs font-black uppercase tracking-wider text-slate-700 block px-1">
          CLINICAL PERFORMANCE ENGINE
        </span>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase">
              <Target className="w-3.5 h-3.5 text-rose-500" />
              <span>Questions Answered</span>
            </div>
            <div className="text-xl font-mono font-black text-slate-900">
              {questionsAnswered}
            </div>
            <div className="text-[10px] text-slate-400">
              {correctAnswers} correct triage decisions
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>Lessons Completed</span>
            </div>
            <div className="text-xl font-mono font-black text-slate-900">
              {lessonsCompleted.length}
            </div>
            <div className="text-[10px] text-slate-400">
              {topicsCompleted.length} clinical curriculum topics
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Diagnostic Accuracy</span>
            </div>
            <div className="text-xl font-mono font-black text-emerald-600">
              {accuracy}%
            </div>
            <div className="text-[10px] text-slate-400">
              Overall USMLE/ACLS standard
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Cases Resolved</span>
            </div>
            <div className="text-xl font-mono font-black text-slate-900">
              {clinicalCasesCompleted.length}
            </div>
            <div className="text-[10px] text-slate-400">
              High-acuity bedside resuscitations
            </div>
          </div>
        </div>
      </div>

      {/* Trophy Cabinet / Achievements */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
            ACHIEVEMENT CABINET
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-500">
            {achievements.filter((a) => a.unlocked).length} / {achievements.length} UNLOCKED
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {achievements.map((item) => (
            <div
              key={item.id}
              id={`achievement-${item.id}`}
              className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                item.unlocked
                  ? 'bg-white border-slate-200 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  item.unlocked ? 'bg-amber-50 border border-amber-200' : 'bg-slate-200/80'
                }`}
              >
                <Award
                  className={`w-5 h-5 ${item.unlocked ? 'text-amber-500' : 'text-slate-400'} stroke-[2.2]`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900">{item.title}</h4>
                  {item.unlocked && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-semibold text-slate-500 leading-tight mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Rank Safety Disclaimer Banner */}
      <div
        id="profile-medical-disclaimer"
        className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-start gap-2.5 text-slate-600"
      >
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-[10px] leading-relaxed">
          <strong className="font-bold text-slate-700">Important Disclaimer:</strong>{' '}
          {GAME_RANK_DISCLAIMER} Progression is designed solely for educational engagement and medical recall practice.
        </p>
      </div>
    </div>
  );
};
