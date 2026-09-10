import React from 'react';
import { Trophy, CheckCircle2, AlertTriangle, Brain, ShieldAlert, RotateCcw, Sparkles, ArrowRight, Clock, Activity } from 'lucide-react';
import { CaseScoreBreakdown, DebriefReport } from '../../types/bossCase';
import { audio } from '../../utils/audio';
interface CaseDebriefScreenProps {
  score: CaseScoreBreakdown;
  debrief: DebriefReport;
  elapsedMinutes: number;
  onClaimXP: () => void;
  onRestart: () => void;
  onExit: () => void;
  claimed: boolean;
}
export const CaseDebriefScreen: React.FC<CaseDebriefScreenProps> = ({
  score,
  debrief,
  elapsedMinutes,
  onClaimXP,
  onRestart,
  onExit,
  claimed,
}) => {
  const getScoreGrade = (total: number) => {
    if (total >= 90) return { label: 'ATTENDING MASTERY', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500' };
    if (total >= 75) return { label: 'SENIOR RESIDENT PROFICIENCY', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500' };
    if (total >= 60) return { label: 'CLINICAL APPRENTICE PASS', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500' };
    return { label: 'RESUSCITATION REVIEW REQUIRED', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500' };
  };

  const grade = getScoreGrade(score.totalScore);

  return (
    <div
      id="case-debrief-container"
      className="flex-1 flex flex-col overflow-y-auto bg-slate-900 text-slate-100 p-4 space-y-5 select-none"
    >
      {/* Simulation Safety Disclaimer Banner */}
      <aside
        id="debrief-safety-disclaimer"
        aria-label="Medical simulation educational disclaimer"
        className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-200"
      >
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold uppercase tracking-wider block text-amber-300 text-[11px]">
            Educational Simulation Notice
          </span>
          This clinical simulation is for medical education and training only. It is not real medical advice. Actual emergency care requires immediate direct evaluation by emergency medical personnel.
        </div>
      </aside>

      {/* Hero Score Trophy Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-lg mb-2">
          <Trophy className="w-8 h-8 text-slate-950" />
        </div>

        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 block">
          CLINICAL BOSS BATTLE EVALUATION
        </span>
        <h2 className="text-xl font-black text-white mt-0.5 tracking-tight">
          THE CHEST PAIN CASE
        </h2>

        {/* Primary Case Score */}
        <div className="my-4">
          <div className="text-5xl font-black font-mono tracking-tight text-white flex items-center justify-center gap-2">
            <span>{score.totalScore}</span>
            <span className="text-2xl text-slate-500 font-bold">/ 100</span>
          </div>
          <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm" style={{}}>
            <span className={`${grade.color} font-black tracking-wide`}>{grade.label}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Time to Cath: {elapsedMinutes}m
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-rose-500" />
            Door-to-Balloon Priority
          </span>
        </div>
      </div>

      {/* 5-Domain Score Breakdown */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span>Clinical Competency Breakdown</span>
          <span className="text-[10px] text-slate-500 font-mono">ACLS / AHA RUBRIC</span>
        </h3>

        <div className="space-y-2.5">
          {/* 1. History Taking */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-300">History Taking & Red Flags</span>
              <span className="font-mono text-rose-400">{score.historyTaking} / 20</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-700"
                style={{ width: `${(score.historyTaking / 20) * 100}%` }}
              />
            </div>
          </div>

          {/* 2. Investigation Selection */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-300">Investigation Selection</span>
              <span className="font-mono text-blue-400">{score.investigationSelection} / 20</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${(score.investigationSelection / 20) * 100}%` }}
              />
            </div>
          </div>

          {/* 3. Clinical Reasoning */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-300">Clinical Reasoning (ECG & Labs)</span>
              <span className="font-mono text-amber-400">{score.clinicalReasoning} / 20</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${(score.clinicalReasoning / 20) * 100}%` }}
              />
            </div>
          </div>

          {/* 4. Management */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-300">Resuscitation & Pharmacology</span>
              <span className="font-mono text-emerald-400">{score.management} / 25</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${(score.management / 25) * 100}%` }}
              />
            </div>
          </div>

          {/* 5. Time Efficiency */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-300">Time Efficiency & Disposition</span>
              <span className="font-mono text-purple-400">{score.timeEfficiency} / 15</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${(score.timeEfficiency / 15) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Debrief Section: What you did well */}
      {debrief.whatWentWell.length > 0 && (
        <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>✓ What You Did Well</span>
          </div>
          <ul className="space-y-1.5">
            {debrief.whatWentWell.map((item, idx) => (
              <li
                key={idx}
                className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed"
              >
                <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Debrief Section: What was missed */}
      {debrief.whatWasMissed.length > 0 && (
        <div className="bg-slate-950 border border-rose-500/40 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>⚠️ What You Missed / Pitfalls</span>
          </div>
          <ul className="space-y-1.5">
            {debrief.whatWasMissed.map((item, idx) => (
              <li
                key={idx}
                className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed"
              >
                <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Debrief Section: Key Learning Pearls */}
      <div className="bg-slate-950 border border-blue-500/40 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-wider">
          <Brain className="w-4 h-4" />
          <span>Key Clinical Learning Points</span>
        </div>
        <ul className="space-y-2">
          {debrief.keyLearningPoints.map((pearl, idx) => (
            <li
              key={idx}
              className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 leading-relaxed"
            >
              {pearl}
            </li>
          ))}
        </ul>
      </div>

      {/* Tactile Action Buttons */}
      <div className="space-y-2.5 pt-2">
        {!claimed ? (
          <button
            id="btn-claim-boss-xp"
            onClick={() => {
              audio.playXpChime();
              onClaimXP();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 fill-slate-950" />
            <span>CLAIM +150 XP & ASCEND RANK</span>
          </button>
        ) : (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl text-center text-xs font-black text-emerald-400 uppercase tracking-wide">
            ✓ +150 XP AWARDED TO RESUS PROFILE
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            id="btn-replay-boss-case"
            onClick={onRestart}
            className="py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl border-b-2 border-slate-950 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Case</span>
          </button>

          <button
            id="btn-exit-boss-case"
            onClick={onExit}
            className="py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl border-b-2 border-rose-800 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Return to Shift</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
