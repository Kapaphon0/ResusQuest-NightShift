import React from 'react';
import { Home, Map, Moon, Brain, User } from 'lucide-react';

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
  const tabs = [
    { id: 'home' as AppTab, label: 'Home', icon: Home },
    { id: 'learn' as AppTab, label: 'Learn', icon: Map },
    { id: 'shift' as AppTab, label: 'Night Shift', icon: Moon, highlight: true },
    { id: 'review' as AppTab, label: 'Review', icon: Brain, badge: dueReviewCount },
    { id: 'profile' as AppTab, label: 'Profile', icon: User },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around z-40 shadow-lg select-none"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => onChangeTab(tab.id)}
            className={`flex flex-col items-center justify-center relative py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-rose-600 font-black'
                : 'text-slate-400 hover:text-slate-600 font-semibold'
            }`}
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'scale-110' : ''
                } ${
                  tab.highlight && !isActive
                    ? 'text-rose-500'
                    : isActive
                    ? 'stroke-[2.5]'
                    : 'stroke-[2]'
                }`}
              />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  id={`badge-review-count`}
                  className="absolute -top-1.5 -right-2.5 bg-rose-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border-2 border-white shadow-xs animate-pulse"
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-wider uppercase">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
