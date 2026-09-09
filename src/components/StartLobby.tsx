import React from 'react';
import {
  Activity,
  Flame,
  Award,
  Calendar,
  AlertCircle,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useShiftStore } from '../store/useShiftStore';
import { defaultShiftBeds } from '../data/shiftContent';

export const StartLobby: React.FC = () => {
  const { user, startShift } = useShiftStore();

  return (
    <div
      id="start-shift-lobby"
      className="flex-1 flex flex-col justify-between p-5 overflow-y-auto pb-20 select-none"
    >
      {/* Header Profile / Attending Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm border border-slate-700">
              R{user.level}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                  Emergency Resident PGY-2
                </h1>
                <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                  ON CALL
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Resus Bay Division • Level 1 Trauma Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg text-amber-800 text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{user.streakDays}d</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-bold">
              <Award className="w-3 h-3 text-emerald-600" />
              Rating
            </div>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono">
              {user.attendingRating}%
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold">Attending Trust</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-bold">
              <Zap className="w-3 h-3 text-amber-500" />
              Total XP
            </div>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono">
              {user.xp}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">Level {user.level}</div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase font-bold">
              <Calendar className="w-3 h-3 text-blue-600" />
              Shifts
            </div>
            <div className="text-base font-bold text-slate-900 mt-1 font-mono">
              {user.shiftsCompleted}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">Completed</div>
          </div>
        </div>

        {/* Shift Dossier Card */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Shift Roster: 19:00 - 07:00
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-medium">
              4 Active Beds
            </span>
          </div>

          <div className="space-y-2">
            {defaultShiftBeds.map((bed) => (
              <div
                key={bed.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      bed.type === 'fog_of_war'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {bed.id}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-800">{bed.title}</div>
                    <div className="text-[10px] text-slate-500">
                      {bed.type === 'fog_of_war'
                        ? 'High-Stakes Resuscitation • AP Economy'
                        : '1-Second Telemetry Swipe Triage'}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    bed.type === 'fog_of_war'
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {bed.type === 'fog_of_war' ? 'RESUS' : 'TRIAGE'}
                </span>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 text-[11px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <span className="font-bold text-white">Attending Directive:</span> You will
              manage incoming ambulances and resus bay cases. Every misdiagnosed trap
              penalizes Attending Trust. Protect preload, recognize sine-waves, and decompress
              tensions.
            </p>
          </div>
        </div>

        {/* Tactical Clinical Perks Intro */}
        <div className="flex items-center gap-2 p-3 bg-slate-100/80 rounded-xl border border-slate-200 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-[11px]">
            Draft tactical advantages (POCUS Fellowship, Fast-Track Cath Alert, Extra AP)
            between beds.
          </span>
        </div>
      </div>

      {/* Tactile Duolingo-style 3D Clock In Button */}
      <div className="pt-4 pb-2">
        <button
          id="btn-clock-in-shift"
          onClick={startShift}
          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm tracking-wide py-4 px-6 rounded-2xl border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25"
        >
          <Stethoscope className="w-5 h-5 text-rose-100" />
          <span>CLOCK IN FOR NIGHT SHIFT</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
