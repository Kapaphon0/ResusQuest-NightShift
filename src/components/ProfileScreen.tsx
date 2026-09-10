import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Award, Zap, Activity, CheckCircle2, Target, AlertCircle, Shirt, Package, Heart, Wind, ShieldAlert, Brain, Baby, Sparkles, Gift, Lock, ChevronDown, ChevronRight, X, Layers, FlaskConical, Biohazard, HeartHandshake, Compass, Gauge } from 'lucide-react';
import { useGamificationStore } from '../store/useGamificationStore';
import { useAvatarStore, getClinicalTier, getClinicalTierTitle } from '../store/useAvatarStore';
import { useShiftStore } from '../store/useShiftStore';
import { LevelProgressBar } from './gamification/LevelProgressBar';
import { AvatarRenderer } from './avatar/AvatarRenderer';
import { CompanionRenderer } from './avatar/CompanionRenderer';
import { GAME_RANK_DISCLAIMER } from '../types/gamification';
import { audio } from '../utils/audio';
import { DOMAIN_COMPETENCIES } from '../data/domainCompetencies';

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

  const { isCivilianMode, toggleCivilianMode } = useShiftStore();
  const isCivilian = isCivilianMode ?? !!user.civilianMode;

  const [activeModal, setActiveModal] = useState<'domains' | 'milestones' | 'achievements' | null>(null);
  const [expandedDomainIds, setExpandedDomainIds] = useState<Record<string, boolean>>({});

  const unclaimedMilestonesCount = milestones.filter((m) => m.isUnlocked && !m.isClaimed).length;
  const claimedMilestonesCount = milestones.filter((m) => m.isClaimed).length;
  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;
  const avgMastery =
    masteryDomains.length > 0
      ? Math.round(
          masteryDomains.reduce((acc, d) => acc + d.percentage, 0) / masteryDomains.length
        )
      : 0;

  const toggleDomain = (domainId: string) => {
    audio.playTelemetryClick();
    setExpandedDomainIds((prev) => ({
      ...prev,
      [domainId]: !prev[domainId],
    }));
  };

  const allExpanded =
    masteryDomains.length > 0 &&
    masteryDomains.every((d) => expandedDomainIds[d.id]);

  const toggleAllDomains = () => {
    audio.playTelemetryClick();
    const next: Record<string, boolean> = {};
    masteryDomains.forEach((d) => {
      next[d.id] = !allExpanded;
    });
    setExpandedDomainIds(next);
  };

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
      case 'Neurology':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'Toxicology':
        return <FlaskConical className="w-4 h-4 text-violet-500" />;
      case 'Critical Care':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Pediatrics':
      case 'Peds':
        return <Baby className="w-4 h-4 text-pink-500" />;
      case 'Infectious':
        return <Biohazard className="w-4 h-4 text-teal-500" />;
      case 'Obstetrics':
        return <HeartHandshake className="w-4 h-4 text-rose-400" />;
      case 'Environmental':
        return <Compass className="w-4 h-4 text-cyan-500" />;
      case 'Breathing':
        return <Gauge className="w-4 h-4 text-sky-500" />;
      default:
        return <Target className="w-4 h-4 text-slate-500" />;
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
      {/* Clinician Profile Card with Live Avatar */}
      <div
        id="card-clinician-profile"
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
            (ResusQuest Clinician Profile)
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

      {/* 3 Section Reveal Buttons (Replaces Cluttered Inline Lists) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block px-1">
          Clinical Dossier Records
        </span>

        <div className="grid grid-cols-1 gap-2">
          {/* Button 1: Medical Mastery Domains */}
          <button
            id="btn-reveal-domains"
            onClick={() => {
              audio.playTelemetryClick();
              setActiveModal('domains');
            }}
            className="w-full text-left p-3 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs active:translate-y-0.5 transition-all flex items-center justify-between gap-3 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">Medical Mastery Domains</h4>
                <p className="text-[10px] text-slate-500 font-semibold truncate">
                  12 Specialties • {avgMastery}% Overall Clinical Mastery
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                Inspect
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
            </div>
          </button>

          {/* Button 2: Clinical Milestones & Rewards */}
          <button
            id="btn-reveal-milestones"
            onClick={() => {
              audio.playTelemetryClick();
              setActiveModal('milestones');
            }}
            className="w-full text-left p-3 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs active:translate-y-0.5 transition-all flex items-center justify-between gap-3 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Gift className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900 truncate">Clinical Milestones</h4>
                  {unclaimedMilestonesCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[9px] font-black rounded-md animate-pulse">
                      {unclaimedMilestonesCount} REWARD{unclaimedMilestonesCount > 1 ? 'S' : ''}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-semibold truncate">
                  {claimedMilestonesCount} / {milestones.length} Claimed • Career XP Advancement
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                {claimedMilestonesCount}/{milestones.length}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
            </div>
          </button>

          {/* Button 3: Achievements Cabinet */}
          <button
            id="btn-reveal-achievements"
            onClick={() => {
              audio.playTelemetryClick();
              setActiveModal('achievements');
            }}
            className="w-full text-left p-3 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs active:translate-y-0.5 transition-all flex items-center justify-between gap-3 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">Achievement Cabinet</h4>
                <p className="text-[10px] text-slate-500 font-semibold truncate">
                  {unlockedAchievementsCount} / {achievements.length} Medals Unlocked
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                {unlockedAchievementsCount}/{achievements.length}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
          </button>
        </div>
      </div>

      {/* Clinical Performance Engine - Compact 4-Col Grid */}
      <div className="space-y-1">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block px-1">
          Performance Engine
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-2xs text-center">
            <span className="text-[9px] text-slate-400 font-bold block uppercase">Questions</span>
            <span className="text-xs font-mono font-black text-slate-900">{questionsAnswered}</span>
          </div>
          <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-2xs text-center">
            <span className="text-[9px] text-slate-400 font-bold block uppercase">Lessons</span>
            <span className="text-xs font-mono font-black text-slate-900">{lessonsCompleted.length}</span>
          </div>
          <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-2xs text-center">
            <span className="text-[9px] text-slate-400 font-bold block uppercase">Accuracy</span>
            <span className="text-xs font-mono font-black text-emerald-600">{accuracy}%</span>
          </div>
          <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-2xs text-center">
            <span className="text-[9px] text-slate-400 font-bold block uppercase">Cases</span>
            <span className="text-xs font-mono font-black text-slate-900">{clinicalCasesCompleted.length}</span>
          </div>
        </div>
      </div>

      {/* Civilian Translation Mode Toggle - Compact Row */}
      <div
        id="section-civilian-mode"
        className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex items-center justify-between gap-2"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800">
              Civilian Mode
            </span>
            {isCivilian && (
              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold border border-amber-300">
                ACTIVE
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 truncate">
            Translates medical jargon into plain English.
          </p>
        </div>
        <button
          id="toggle-civilian-mode-profile"
          onClick={() => {
            audio.playTelemetryClick();
            toggleCivilianMode();
          }}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs border shrink-0 transition-all cursor-pointer ${
            isCivilian
              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          {isCivilian ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {/* Game Rank Safety Disclaimer Banner - Compact */}
      <div
        id="profile-medical-disclaimer"
        className="p-2.5 rounded-xl bg-slate-100/90 border border-slate-200 flex items-center gap-2 text-slate-500 text-[10px]"
      >
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <p className="leading-snug truncate">
          {GAME_RANK_DISCLAIMER}
        </p>
      </div>

      {/* Dedicated Reveal Modal (Domains, Milestones, Achievements) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:p-4 animate-fadeIn">
          {/* Backdrop Blur */}
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => {
              audio.playTelemetryClick();
              setActiveModal(null);
            }}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-lg mx-auto max-h-[85vh] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col z-10 border border-slate-200 overflow-hidden">
            {/* Header & Tabs */}
            <div className="p-3.5 pb-2.5 border-b border-slate-200 bg-slate-50/90 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeModal === 'domains' && <Layers className="w-4 h-4 text-rose-600" />}
                  {activeModal === 'milestones' && <Gift className="w-4 h-4 text-amber-500" />}
                  {activeModal === 'achievements' && <Award className="w-4 h-4 text-emerald-600" />}
                  <h3 className="text-sm font-black text-slate-900">
                    {activeModal === 'domains' && 'Medical Mastery Domains'}
                    {activeModal === 'milestones' && 'Clinical Career Milestones'}
                    {activeModal === 'achievements' && 'Achievement Cabinet'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    audio.playTelemetryClick();
                    setActiveModal(null);
                  }}
                  className="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3 Interactive Switch Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-xl">
                <button
                  onClick={() => {
                    audio.playTelemetryClick();
                    setActiveModal('domains');
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeModal === 'domains'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Domains
                </button>
                <button
                  onClick={() => {
                    audio.playTelemetryClick();
                    setActiveModal('milestones');
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer relative ${
                    activeModal === 'milestones'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Milestones
                  {unclaimedMilestonesCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  )}
                </button>
                <button
                  onClick={() => {
                    audio.playTelemetryClick();
                    setActiveModal('achievements');
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeModal === 'achievements'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Achievements
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/50">
              {/* VIEW 1: DOMAINS */}
              {activeModal === 'domains' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[11px] font-bold text-slate-500 font-mono">
                      {masteryDomains.length} Clinical Domains Tracked
                    </span>
                    <button
                      onClick={toggleAllDomains}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-700 uppercase tracking-wider cursor-pointer flex items-center gap-1 py-0.5 px-2 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Layers className="w-3 h-3" />
                      <span>{allExpanded ? 'Collapse All' : 'Expand All'}</span>
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
                    {masteryDomains.map((domain) => {
                      const isExpanded = !!expandedDomainIds[domain.id];
                      const details = DOMAIN_COMPETENCIES[domain.id] || {
                        competencies: [
                          'Standard Clinical Diagnostic Workup',
                          'Evidence-Based Resuscitation Protocols',
                          'Pharmacological Safety & Dosing Guidelines',
                          'Rapid Disposition & Critical Care Handoff',
                        ],
                        protocol: 'Emergency Medicine Practice Standards',
                        benchmark: 'ABEM Core Competency Standard',
                      };
                      const tierUnlocked = domain.rewardTierUnlocked || 1;

                      return (
                        <div key={domain.id} id={`domain-item-${domain.id}`} className="transition-colors">
                          <button
                            id={`btn-toggle-domain-${domain.id}`}
                            onClick={() => toggleDomain(domain.id)}
                            className={`w-full text-left px-3.5 py-3 flex items-center justify-between gap-2.5 cursor-pointer select-none transition-colors ${
                              isExpanded ? 'bg-slate-50/90' : 'hover:bg-slate-50/70 active:bg-slate-100/70'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/60">
                                {getDomainIcon(domain.shortName)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-900 truncate">
                                    {domain.name}
                                  </span>
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                                    Tier {tierUnlocked}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {domain.questionsCount} questions • {domain.casesCount} cases
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono text-xs font-black text-slate-900 block">
                                {domain.percentage}%
                              </span>
                              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <ChevronDown
                                  className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-180 text-rose-600' : ''
                                  }`}
                                />
                              </div>
                            </div>
                          </button>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-100 bg-slate-50/60 space-y-3 animate-in fade-in duration-150">
                              <div className="bg-white rounded-xl p-2.5 border border-slate-200/70 space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                                  <span className="uppercase tracking-wider">Attending Mastery Roadmap</span>
                                  <span className="font-mono text-rose-600 font-bold">
                                    {domain.percentage}% Mastery
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full transition-all duration-500"
                                    style={{ width: `${domain.percentage}%` }}
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                                  Core Clinical Competencies
                                </span>
                                <div className="grid grid-cols-1 gap-1">
                                  {details.competencies.map((comp, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-1.5 p-2 bg-white rounded-lg border border-slate-200/60 text-[11px] text-slate-700"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                      <span className="leading-tight">{comp}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="p-2.5 bg-rose-50/70 border border-rose-100 rounded-xl space-y-0.5">
                                <span className="text-[9px] font-black uppercase tracking-wider text-rose-700 block">
                                  Target Protocol
                                </span>
                                <span className="text-xs font-bold text-slate-900 block">
                                  {details.protocol}
                                </span>
                                <span className="text-[10px] text-slate-500 block">
                                  Benchmark: {details.benchmark}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW 2: MILESTONES */}
              {activeModal === 'milestones' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[11px] font-bold text-slate-500 font-mono">
                      {claimedMilestonesCount} / {milestones.length} Claimed
                    </span>
                    {unclaimedMilestonesCount > 0 && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {unclaimedMilestonesCount} Ready to Claim
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {milestones.map((m) => {
                      const isUnlocked = m.isUnlocked;
                      const isClaimed = m.isClaimed;

                      return (
                        <div
                          key={m.id}
                          id={`milestone-${m.id}`}
                          className={`p-3 rounded-2xl border transition-all ${
                            isClaimed
                              ? 'bg-slate-50 border-slate-200 opacity-75'
                              : isUnlocked
                              ? 'bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-300'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                  isClaimed
                                    ? 'bg-slate-200 text-slate-500'
                                    : isUnlocked
                                    ? 'bg-amber-500 text-white animate-bounce'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {isClaimed ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : isUnlocked ? (
                                  <Gift className="w-4 h-4" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                    {m.requirementText}
                                  </span>
                                  <h4 className="text-xs font-bold text-slate-900 truncate">{m.title}</h4>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                  {m.description}
                                </p>
                                <div className="text-[10px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  <span>Reward: +{m.rewardXP} XP {m.rewardText ? `• ${m.rewardText}` : ''}</span>
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0">
                              {isUnlocked && !isClaimed && (
                                <button
                                  onClick={() => handleClaimMilestone(m.id)}
                                  className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md border-b-2 border-amber-700 active:border-b-0 active:translate-y-0.5 cursor-pointer"
                                >
                                  Claim
                                </button>
                              )}
                              {isClaimed && (
                                <span className="text-[10px] font-bold text-slate-400">Claimed</span>
                              )}
                              {!isUnlocked && (
                                <span className="text-[10px] font-bold text-slate-400 font-mono">
                                  Locked
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW 3: ACHIEVEMENTS */}
              {activeModal === 'achievements' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[11px] font-bold text-slate-500 font-mono">
                      {unlockedAchievementsCount} / {achievements.length} Medals Unlocked
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
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            item.unlocked ? 'bg-amber-50 border border-amber-200' : 'bg-slate-200/80'
                          }`}
                        >
                          <Award
                            className={`w-4 h-4 ${item.unlocked ? 'text-amber-500' : 'text-slate-400'} stroke-[2.2]`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                            {item.unlocked && (
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Unlocked
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-semibold text-slate-500 leading-tight mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
