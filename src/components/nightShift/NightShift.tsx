import React from 'react';
import { useNightShiftStore } from '../../store/useNightShiftStore';
import { ShiftSetup } from './ShiftSetup';
import { DepartmentStatusHUD } from './DepartmentStatusHUD';
import { MultiplePatientManager } from './MultiplePatientManager';
import { PatientStateDisplay } from './PatientStateDisplay';
import { ClinicalActionPanel } from './ClinicalActionPanel';
import { RandomEventModal } from './RandomEventModal';
import { ShiftDebrief } from './ShiftDebrief';
import { SwipeTriage } from '../SwipeTriage';
import { AlertTriangle, Sparkles, Siren, CheckCircle2, X } from 'lucide-react';

export const NightShift: React.FC = () => {
  const {
    shift,
    selectBed,
    prioritizePatient,
    performClinicalAction,
    revealClue,
    confirmDiagnosis,
    reassessPatient,
    resolveRandomEvent,
    dischargeOrAdmitPatient,
    restartShift,
    completeSwipeTriage,
    triggerSwipeTriage,
    dismissSwipeTriage,
  } = useNightShiftStore();

  // 1. Lobby Phase
  if (shift.phase === 'lobby') {
    return <ShiftSetup />;
  }

  // 2. Debrief Phase
  if (shift.phase === 'debrief') {
    return <ShiftDebrief onRestart={restartShift} />;
  }

  // 3. Occasional In-Shift Swipe Triage Surge (1-2 per session)
  if (shift.pendingSwipeTriage) {
    return (
      <div className="flex-1 flex flex-col justify-between overflow-y-auto select-none pb-14 bg-slate-50">
        {/* Triage Protocol Header */}
        <div className="bg-rose-600 text-white px-4 py-3 flex items-center justify-between shadow-md border-b-2 border-rose-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-700 border border-rose-500 flex items-center justify-center">
              <Siren className="w-4 h-4 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider">
                  Ambulance Bay Surge
                </span>
                <span className="text-[9px] font-mono bg-rose-800/80 px-2 py-0.5 rounded-full font-bold">
                  RAPID TRIAGE
                </span>
              </div>
              <span className="text-[10px] text-rose-100 font-medium block">
                Sort critical arrivals: Crash (Defib/Resus) vs Stable (Floor/Meds)
              </span>
            </div>
          </div>

          <button
            onClick={dismissSwipeTriage}
            className="w-7 h-7 rounded-lg bg-rose-700/80 hover:bg-rose-700 text-rose-100 flex items-center justify-center cursor-pointer"
            title="Defer triage surge"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Integrated Swipe Triage Component */}
        <SwipeTriage
          bedNumber={shift.selectedBedIndex + 1}
          onCompleteSession={() => completeSwipeTriage(15, 3)}
        />
      </div>
    );
  }

  // 4. Active Bedside Shift Gameplay
  const activePatient = shift.activePatients[shift.selectedBedIndex] || shift.activePatients[0];

  return (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto select-none pb-24 bg-slate-50">
      {/* Sticky Department Telemetry HUD */}
      <DepartmentStatusHUD />

      {/* Multiple Beds Triage Manager */}
      <MultiplePatientManager
        patients={shift.activePatients}
        selectedIndex={shift.selectedBedIndex}
        onSelectBed={selectBed}
        onPrioritize={prioritizePatient}
      />

      {/* Main Bedside Examination & Resuscitation Area */}
      <div className="p-3 space-y-2.5">
        {/* Dynamic Physiological Action Response Banner (Clean & Non-cluttered) */}
        {shift.lastFeedback && (
          <div
            className={`px-3 py-2 rounded-xl border flex items-center gap-2 text-xs transition-all duration-200 ${
              shift.lastFeedback.type === 'critical'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : shift.lastFeedback.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : shift.lastFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <AlertTriangle
              className={`w-3.5 h-3.5 shrink-0 ${
                shift.lastFeedback.type === 'critical'
                  ? 'text-rose-600'
                  : shift.lastFeedback.type === 'warning'
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            />
            <span className="text-[11px] font-medium leading-tight truncate">
              {shift.lastFeedback.message}
            </span>
          </div>
        )}

        {/* Mystery Case Diagnostic Lead (Clean Minimalist Bar) */}
        {activePatient?.isMystery && !activePatient.isStabilized && (
          <div className="px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs text-purple-900">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                Diagnostic Clue:
              </span>
              <span className="text-[11px] font-medium truncate max-w-[240px]">
                {activePatient.mysteryHint || 'Cross-examine ECG rhythm and POCUS findings.'}
              </span>
            </div>
          </div>
        )}

        {/* Dynamic Visual Patient Monitor Display */}
        {activePatient && (
          <PatientStateDisplay
            patient={activePatient}
            onReassess={() => reassessPatient(shift.selectedBedIndex)}
          />
        )}

        {/* Tactile 3D Clinical Action Console */}
        {activePatient && (
          <ClinicalActionPanel
            patient={activePatient}
            currentAP={shift.currentAP}
            onPerformAction={performClinicalAction}
            onRevealClue={revealClue}
            onConfirmDiagnosis={confirmDiagnosis}
            onDischargeOrAdmit={() => dischargeOrAdmitPatient(shift.selectedBedIndex)}
          />
        )}
      </div>

      {/* Random Emergency Event Modal Trigger */}
      {shift.activeEvent && (
        <RandomEventModal
          event={shift.activeEvent}
          currentAP={shift.currentAP}
          onResolve={resolveRandomEvent}
        />
      )}
    </div>
  );
};
