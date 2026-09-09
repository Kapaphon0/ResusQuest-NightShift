import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Star,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldAlert,
  Activity,
  Zap,
} from 'lucide-react';
import { useNightShiftStore } from '../../store/useNightShiftStore';
import { useGamificationStore } from '../../store/useGamificationStore';
import { DIFFICULTY_TIERS } from '../../data/nightShiftMedicalData';
import { audio } from '../../utils/audio';

interface ShiftDebriefProps {
  onRestart?: () => void;
}

export const ShiftDebrief: React.FC<ShiftDebriefProps> = ({ onRestart }) => {
  const { shift, reputation, restartShift } = useNightShiftStore();
  const { addXp, level } = useGamificationStore();

  const tierConfig =
    DIFFICULTY_TIERS.find((t) => t.tier === shift.selectedTier) || DIFFICULTY_TIERS[0];
  const overall = Math.round(shift.scores.overallPercentage);

  const getGrade = (pct: number) => {
    if (pct >= 95) return { grade: 'A+', label: 'BOARD CERTIFIED PRECISION', color: 'text-emerald-600' };
    if (pct >= 85) return { grade: 'A', label: 'ATTENDING-LEVEL COMPETENCE', color: 'text-emerald-600' };
    if (pct >= 75) return { grade: 'B', label: 'SOLID SENIOR RESIDENT', color: 'text-blue-600' };
    if (pct >= 60) return { grade: 'C', label: 'ACCEPTABLE CLINICAL CARE', color: 'text-amber-600' };
    return { grade: 'D', label: 'CRITICAL REMEDIATION REQUIRED', color: 'text-rose-600' };
  };

  const gradeInfo = getGrade(overall);
  const baseXP = 300;
  const earnedXP = Math.round(baseXP * tierConfig.xpMultiplier * (overall / 100));

  const handleNextShift = () => {
    if (earnedXP > 0) {
      addXp(earnedXP, `Night Shift Debrief: Grade ${gradeInfo.grade} (+${earnedXP} XP)`);
    }
    if (onRestart) {
      onRestart();
    } else {
      restartShift();
    }
  };

  const domainScores = [
    { label: 'Recognition', score: shift.scores.recognition },
    { label: 'Prioritization', score: shift.scores.prioritization },
    { label: 'Diagnosis', score: shift.scores.diagnosis },
    { label: 'Management', score: shift.scores.management },
    { label: 'Reassessment', score: shift.scores.reassessment },
    { label: 'Resource Use', score: shift.scores.resourceUse },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto select-none pb-24">
      {/* 1. Shift Completion Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl text-center space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-[10px] font-mono font-bold uppercase">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>06:00 MORNING SIGN-OUT</span>
        </div>

        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-white">
            Shift #{String(shift.shiftNumber).padStart(3, '0')} Debrief
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Tier {shift.selectedTier} • {tierConfig.title}
          </p>
        </div>

        {/* Big Grade Badge */}
        <div className="py-2">
          <div className="inline-block p-4 rounded-3xl bg-slate-950 border-2 border-slate-800 shadow-inner">
            <span className={`text-4xl font-black font-mono block ${gradeInfo.color}`}>
              {gradeInfo.grade}
            </span>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              {gradeInfo.label} ({overall}%)
            </span>
          </div>
        </div>

        {/* XP & Reputation Gains */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-left">
          <div className="p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700/80">
            <span className="text-[9px] font-black uppercase text-amber-400 block">
              Player XP Gained
            </span>
            <span className="text-sm font-black text-white font-mono">+{earnedXP} XP</span>
          </div>

          <div className="p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700/80">
            <span className="text-[9px] font-black uppercase text-emerald-400 block">
              ED Reputation
            </span>
            <span className="text-sm font-black text-white font-mono">
              Tier {reputation.tier} ({reputation.reputationXP} XP)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Six Clinical Competency Domains */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-rose-600" />
          <span>Core Emergency Competency Scores</span>
        </h3>

        <div className="space-y-2">
          {domainScores.map((domain) => {
            const pct = Math.round((domain.score / 5) * 100);

            return (
              <div key={domain.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">{domain.label}</span>
                  <span className="font-mono text-slate-900">{domain.score.toFixed(1)} / 5.0</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Shift Objectives Summary */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-2.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Shift Directives Completed</span>
        </h3>

        <div className="space-y-1.5">
          {shift.objectives.map((obj) => (
            <div
              key={obj.id}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                obj.completed
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <span className="font-bold text-[11px]">{obj.title}</span>
              <span className="font-mono text-[10px] font-black">
                {obj.completed ? `+${obj.bonusXP} XP` : 'Incomplete'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Nemesis & Mistakes Tracker */}
      {shift.activeNemesis && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-900">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h4 className="text-xs font-black uppercase">{shift.activeNemesis.title}</h4>
          </div>
          <p className="text-xs text-rose-800 font-medium">
            {shift.activeNemesis.description}
          </p>
          <div className="p-2.5 bg-white rounded-xl border border-rose-200 text-[11px] text-slate-700 font-semibold">
            <strong className="text-rose-700 block">💡 High-Yield Pearl:</strong>
            {shift.activeNemesis.unlockPearl}
          </div>
        </div>
      )}

      {/* 5. Tactile Duolingo-style 3D Button: NEXT NIGHT SHIFT */}
      <div className="pt-2">
        <button
          onClick={handleNextShift}
          className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-wider border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>START NEXT NIGHT SHIFT</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
