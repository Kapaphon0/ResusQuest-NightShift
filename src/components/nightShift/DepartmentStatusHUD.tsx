import React from 'react';
import { Clock, Zap, Volume2, VolumeX, HeartPulse, Stethoscope, HeartHandshake } from 'lucide-react';
import { useNightShiftStore } from '../../store/useNightShiftStore';
import { useShiftStore } from '../../store/useShiftStore';
import { audio } from '../../utils/audio';
export const DepartmentStatusHUD: React.FC = () => {
  const { shift } = useNightShiftStore();
  const { isCivilianMode, toggleCivilianMode } = useShiftStore();
  const isCivilian = Boolean(isCivilianMode);
  const [isMuted, setIsMuted] = React.useState(audio.isMuted);
  const getStatusBadge = () => {
    switch (shift.departmentStatus) {
      case 'code_blue':
        return {
          label: 'CODE BLUE',
          color: 'bg-rose-600 text-white border-rose-500 animate-pulse',
        };
      case 'critical':
        return {
          label: 'CRITICAL SURGE',
          color: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
        };
      case 'busy':
        return {
          label: 'HIGH INFLOW',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      default:
        return {
          label: 'STABLE',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <div className="bg-slate-900 text-white px-4 py-2.5 border-b border-slate-800 shadow-md flex flex-col space-y-2 select-none">
      <div className="flex items-center justify-between">
        {/* Shift Clock & Progress */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 font-mono text-xs font-black text-amber-400">
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-mono text-sm font-black text-white">
              <span>{shift.shiftTime}</span>
              <span className="text-[10px] text-slate-400 font-normal">/ 06:00</span>
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              Shift #{String(shift.shiftNumber).padStart(3, '0')} • Tier {shift.selectedTier}
            </div>
          </div>
        </div>

        {/* Department Status Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>

          {/* Mode Switcher */}
          <button
            id="btn-hud-civilian-toggle"
            onClick={() => {
              audio.playTelemetryClick();
              toggleCivilianMode();
            }}
            title={
              isCivilian
                ? 'Active: Civilian Hero Mode. Click to switch to Clinician Mode.'
                : 'Active: Clinician Mode. Click to switch to Civilian Hero Mode.'
            }
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
              isCivilian
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {isCivilian ? (
              <>
                <HeartHandshake className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden xs:inline">CIVILIAN HERO</span>
              </>
            ) : (
              <>
                <Stethoscope className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="hidden xs:inline">CLINICIAN</span>
              </>
            )}
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={() => {
              const muted = audio.toggleMute();
              setIsMuted(muted);
            }}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-rose-400" />}
          </button>
        </div>
      </div>

      {/* AP Economy Meter & Shift Progress Bar */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/80 items-center">
        {/* Clinical Stamina (AP) */}
        <div className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>Clinical AP</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs font-black text-amber-400">
            <span>{shift.currentAP}</span>
            <span className="text-slate-500">/{shift.maxAP}</span>
          </div>
        </div>

        {/* Active Patients Queue Meter */}
        <div className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
            <HeartPulse className="w-3 h-3 text-rose-500" />
            <span>Active Beds</span>
          </div>
          <div className="font-mono text-xs font-black text-white">
            {shift.activePatients.length} Active
          </div>
        </div>
      </div>
    </div>
  );
};
