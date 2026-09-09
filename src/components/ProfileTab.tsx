import React, { useState } from 'react';
import {
  User,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useShiftStore } from '../store/useShiftStore';
import { shiftPerks } from '../data/shiftContent';
import { audio } from '../utils/audio';

export const ProfileTab: React.FC = () => {
  const { user, activePerks, decisionTimes } = useShiftStore();
  const [isMuted, setIsMuted] = useState(audio.isMuted);

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  const averageVelocity =
    decisionTimes.length > 0
      ? (decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length).toFixed(1)
      : '1.8';

  return (
    <div
      id="profile-tab-container"
      className="flex-1 flex flex-col justify-between p-4 overflow-y-auto space-y-4 pb-20 select-none"
    >
      <div className="space-y-4">
        {/* Profile Dossier Header */}
        <div className="pt-1 pb-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            <User className="w-3.5 h-3.5 text-rose-600" />
            <span>Staff Physician Credentialing</span>
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Resident Dossier
          </h1>
        </div>

        {/* Resident Header Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md">
          <div className="flex items-center gap-3.5 pb-3 border-b border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center font-black text-white text-xl shadow-md border-2 border-rose-300/30 shrink-0">
              AM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-100">
                  {user.name || 'Dr. Alex Mercer'}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30">
                  PGY-{user.level}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {user.role || 'Emergency Medicine Resident'} • Department of Emergency Medicine
              </p>
              <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono font-bold mt-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>{user.streakDays} Consecutive Shifts</span>
              </div>
            </div>
          </div>

          {/* Core Resident Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-3 text-center">
            <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Trust Rating</div>
              <div className="text-base font-mono font-black text-emerald-400 mt-0.5">
                {user.attendingRating}%
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Shifts Logged</div>
              <div className="text-base font-mono font-black text-slate-100 mt-0.5">
                {user.shiftsCompleted}
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Avg Velocity</div>
              <div className="text-base font-mono font-black text-cyan-400 mt-0.5">
                {averageVelocity}s
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Perks Armory */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span className="uppercase tracking-wider">Tactical Perk Armory</span>
            <span className="text-[10px] text-slate-400 font-normal">
              Equipped in Resus Bays
            </span>
          </div>

          <div className="space-y-2">
            {shiftPerks.map((perk) => {
              const isEquipped = activePerks.some((p) => p.id === perk.id);

              return (
                <div
                  key={perk.id}
                  id={`perk-dossier-${perk.id}`}
                  className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isEquipped
                      ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900">
                        {perk.name}
                      </span>
                      {isEquipped && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                          Active on Shift
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {perk.description}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0 uppercase font-bold">
                    {perk.effect.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clinical Settings */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Audio & Workstation Setup
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2.5 shadow-xs">
            {/* Audio Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-rose-600" />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Acoustic Telemetry Feedback
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Synthesized heartbeats, cardiac monitors & alarm chimes
                  </div>
                </div>
              </div>

              <button
                id="btn-profile-toggle-sound"
                onClick={handleToggleMute}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isMuted
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-slate-900 text-white shadow-xs'
                }`}
              >
                {isMuted ? 'Muted' : 'Audio On'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
