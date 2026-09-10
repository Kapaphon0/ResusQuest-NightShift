import React from 'react';
export type AppTab = 'home' | 'learn' | 'shift' | 'review' | 'profile';
interface BottomNavProps {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  dueReviewCount: number;
}
export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  dueReviewCount,
}) => {
  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.05)] border-t border-slate-200/60 select-none"
    >
      <div className="flex justify-around items-center h-16 px-2 relative">
        {/* 1. Home Tab */}
        <button
          id="nav-tab-home"
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-primary' : 'text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span className="font-label-sans text-[10px] mt-0.5 font-semibold">Home</span>
        </button>

        {/* 2. Curriculum Tree Tab */}
        <button
          id="nav-tab-learn"
          onClick={() => onChangeTab('learn')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] transition-colors cursor-pointer ${
            activeTab === 'learn' ? 'text-primary' : 'text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">account_tree</span>
          <span className="font-label-sans text-[10px] mt-0.5 font-semibold">Tree</span>
        </button>

        {/* 3. Center Elevated Shift Trigger with Glowing Red Effect */}
        <div className="relative flex flex-col items-center justify-center -top-3">
          {/* Ambient Red Glow Halo */}
          <div className="absolute top-0 w-12 h-12 rounded-full bg-rose-500/45 blur-md animate-pulse pointer-events-none" />

          <button
            id="nav-tab-shift"
            onClick={() => onChangeTab('shift')}
            className={`relative w-12 h-12 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-red-500 text-white flex items-center justify-center shadow-[0_0_18px_rgba(225,29,72,0.65)] hover:shadow-[0_0_26px_rgba(225,29,72,0.85)] border-2 border-rose-300/80 active:scale-95 transition-all cursor-pointer ${
              activeTab === 'shift'
                ? 'ring-4 ring-rose-400/80 shadow-[0_0_28px_rgba(225,29,72,0.95)] scale-105'
                : ''
            }`}
            title="Active Night Shift"
          >
            <span className="material-symbols-outlined text-[24px] text-white animate-pulse drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]">
              e911_emergency
            </span>
          </button>
          <span
            className={`font-label-sans text-[10px] mt-0.5 font-bold tracking-tight ${
              activeTab === 'shift' ? 'text-rose-700' : 'text-slate-600'
            }`}
          >
            Shift
          </span>
        </div>

        {/* 4. Recall (Review / Spaced Repetition) Tab */}
        <button
          id="nav-tab-review"
          onClick={() => onChangeTab('review')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] transition-colors relative cursor-pointer ${
            activeTab === 'review' ? 'text-primary' : 'text-secondary hover:text-on-surface'
          }`}
        >
          <div className="relative">
            <span className="material-symbols-outlined text-[22px]">psychology</span>
            {dueReviewCount > 0 && (
              <span
                id="badge-review-count"
                className="absolute -top-1 -right-2 bg-primary text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs"
              >
                {dueReviewCount}
              </span>
            )}
          </div>
          <span className="font-label-sans text-[10px] mt-0.5 font-semibold">Recall</span>
        </button>

        {/* 5. Profile Tab */}
        <button
          id="nav-tab-profile"
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] transition-colors cursor-pointer ${
            activeTab === 'profile' ? 'text-primary' : 'text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">badge</span>
          <span className="font-label-sans text-[10px] mt-0.5 font-semibold">Profile</span>
        </button>
      </div>
    </nav>
  );
};

