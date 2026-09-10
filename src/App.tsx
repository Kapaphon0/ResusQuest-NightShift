import React, { useState } from 'react';
import { useShiftStore } from './store/useShiftStore';
import { useGamificationStore } from './store/useGamificationStore';
import { useAvatarStore } from './store/useAvatarStore';
import { PerkDraftModal } from './components/PerkDraftModal';
import { BottomNav, AppTab } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { LearnTab } from './components/LearnTab';
import { LearnPath } from './components/LearnPath';
import { AnkiDeck, Flashcard } from './components/AnkiDeck';
import { ProfileScreen } from './components/ProfileScreen';
import { ChestPainCaseView } from './components/bossBattle/ChestPainCaseView';
import { NightShift } from './components/nightShift/NightShift';
import { AvatarStudioModal } from './components/avatar/AvatarStudioModal';
import { InventoryModal } from './components/inventory/InventoryModal';
import { XPGainToast } from './components/gamification/XPGainToast';
import { LevelUpModal } from './components/gamification/LevelUpModal';
import { MedicalGlossaryModal } from './components/glossary/MedicalGlossaryModal';
import { useGlossary } from './components/glossary/useGlossaryStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GAME_BALANCE } from './constants/gameBalance';
import { Activity, Shield, Map, BookOpen } from 'lucide-react';

export default function App() {
  const {
    user,
    status,
    ankiQueueIds,
    missedConcepts,
    startShift,
    awardXP,
    removeFromAnkiQueue,
  } = useShiftStore();

  const {
    xpEvents,
    levelUp,
    dismissLevelUp,
    dismissXpToast,
  } = useGamificationStore();

  const {
    avatarStudioOpen,
    setAvatarStudioOpen,
    inventoryModalOpen,
    setInventoryModalOpen,
  } = useAvatarStore();

  const { currentEntry: glossaryEntry, closeTerm: closeGlossary } = useGlossary();

  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [learnView, setLearnView] = useState<'path' | 'atlas'>('path');
  const [bossBattleActive, setBossBattleActive] = useState(false);

  const dueReviewCount = Math.max(ankiQueueIds.length, missedConcepts.length);
  const dailyGoalProgress = Math.max(25, Math.min(100, Math.round(((user.xp % 300) / 300) * 100)));

  // Map missed shift concepts to flashcards
  const dynamicReviewCards: Flashcard[] = missedConcepts.map((m) => ({
    id: m.id,
    front: m.promptOrScenario,
    back: `${m.correctAction} — ${m.clinicalReason}`,
    pearl: `Critical Trap: Avoid ${m.trapChosen}. Protect vital perfusion.`,
    intervalDays: 1,
  }));

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center p-0 sm:p-4 text-slate-900 font-sans selection:bg-rose-500 selection:text-white">
      {/* Desktop Ambient Header / Watermark */}
      <aside
        aria-label="Desktop workstation banner"
        className="hidden sm:flex items-center justify-between w-full max-w-md mb-2 px-3 text-[11px] font-mono text-slate-400"
      >
        <div className="flex items-center gap-1.5 font-bold tracking-widest text-slate-300 uppercase">
          <Activity className="w-3.5 h-3.5 text-rose-500" />
          <span>RESUSQUEST EM SIMULATOR</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <Shield className="w-3 h-3 text-slate-400" />
          <span>ACLS / ATLS PROTOCOL V2.4</span>
        </div>
      </aside>

      {/* Main Mobile-First Shell */}
      <main
        id="app-mobile-container"
        className="w-full max-w-md min-h-screen sm:min-h-[780px] sm:max-h-[92vh] bg-slate-50 border-x sm:border border-slate-200 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
      >
        <ErrorBoundary>
          {/* Boss Battle View or Tab-based Routing */}
        {bossBattleActive ? (
          <ChestPainCaseView onExit={() => setBossBattleActive(false)} />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                user={user}
                streak={user.streakDays}
                dailyGoalProgress={dailyGoalProgress}
                dueReviewCount={dueReviewCount}
                onStartShift={() => {
                  setActiveTab('shift');
                  if (status === 'idle') {
                    startShift();
                  }
                }}
                onStartLesson={() => setActiveTab('learn')}
                onOpenAtlas={() => {
                  setActiveTab('learn');
                  setLearnView('atlas');
                }}
                onOpenReview={() => setActiveTab('review')}
                onStartBossCase={() => setBossBattleActive(true)}
              />
            )}

            {activeTab === 'learn' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Sub-view Toggle */}
                <div className="px-4 pt-3 pb-2 bg-white border-b border-slate-200">
                  <div className="flex p-1 bg-slate-100 rounded-2xl max-w-xs mx-auto border border-slate-200">
                    <button
                      id="btn-switch-learn-path"
                      onClick={() => setLearnView('path')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        learnView === 'path'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Map className={`w-3.5 h-3.5 ${learnView === 'path' ? 'text-rose-400' : 'text-slate-400'}`} />
                      <span>Curriculum Tree</span>
                    </button>
                    <button
                      id="btn-switch-learn-atlas"
                      onClick={() => setLearnView('atlas')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        learnView === 'atlas'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <BookOpen className={`w-3.5 h-3.5 ${learnView === 'atlas' ? 'text-rose-400' : 'text-slate-400'}`} />
                      <span>Protocol Atlas</span>
                    </button>
                  </div>
                </div>

                {learnView === 'path' ? (
                  <LearnPath
                    onCompleteLesson={(xp) => awardXP(xp)}
                    onStartBossCase={() => setBossBattleActive(true)}
                    onSwitchToAtlas={() => setLearnView('atlas')}
                  />
                ) : (
                  <LearnTab />
                )}
              </div>
            )}

            {activeTab === 'shift' && (
              <div className="flex-1 flex flex-col overflow-hidden pb-14">
                <NightShift />
              </div>
            )}

            {activeTab === 'review' && (
              <AnkiDeck
                onCardReviewed={() => {
                  awardXP(GAME_BALANCE.XP_REWARDS.ANKI_CARD_REVIEW);
                  if (ankiQueueIds.length > 0) {
                    removeFromAnkiQueue(ankiQueueIds[0]);
                  }
                }}
                initialCards={dynamicReviewCards.length > 0 ? dynamicReviewCards : undefined}
              />
            )}

            {activeTab === 'profile' && <ProfileScreen user={user} />}

            {/* Global Bottom Navigation Bar */}
            <BottomNav
              activeTab={activeTab}
              onChangeTab={(tab) => setActiveTab(tab)}
              dueReviewCount={dueReviewCount}
            />
          </>
        )}

        {/* Modal Overlay for Tactical Perk Drafting */}
        <PerkDraftModal />

        {/* Centralized Gamification Overlays */}
        <XPGainToast events={xpEvents} onDismiss={dismissXpToast} />
        <LevelUpModal event={levelUp} onDismiss={dismissLevelUp} />

        {/* Avatar Customization & Inventory Modals */}
        <AvatarStudioModal
          isOpen={avatarStudioOpen}
          onClose={() => setAvatarStudioOpen(false)}
        />
        <InventoryModal
          isOpen={inventoryModalOpen}
          onClose={() => setInventoryModalOpen(false)}
        />

        {/* Interactive Touch-To-Explain Medical Glossary Micro-Drawer */}
        <MedicalGlossaryModal
          entry={glossaryEntry}
          onClose={closeGlossary}
        />
      </ErrorBoundary>
    </main>
    </div>
  );
}
