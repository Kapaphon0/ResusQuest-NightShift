import React from 'react';
import { useNightShiftStore } from '../../store/useNightShiftStore';
import { ShiftSetup } from './ShiftSetup';
import { DepartmentStatusHUD } from './DepartmentStatusHUD';
import { MultiplePatientManager } from './MultiplePatientManager';
import { PatientEncounter } from './PatientEncounter';
import { RandomEventModal } from './RandomEventModal';
import { ShiftDebrief } from './ShiftDebrief';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const NightShiftView: React.FC = () => {
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
  } = useNightShiftStore();

  // If in lobby phase, show the shift terminal setup
  if (shift.phase === 'lobby') {
    return <ShiftSetup />;
  }

  // If in debrief phase, show morning sign-out debrief
  if (shift.phase === 'debrief') {
    return <ShiftDebrief />;
  }

  // Active shift phase
  const currentPatient = shift.activePatients[shift.selectedBedIndex];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
      {/* 1. Department Status HUD */}
      <DepartmentStatusHUD />

      {/* 2. Clinical Feedback Banner */}
      {shift.lastFeedback && (
        <div
          className={`px-4 py-2 text-xs font-bold flex items-center justify-between border-b select-none transition-all ${
            shift.lastFeedback.type === 'critical'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : shift.lastFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : shift.lastFeedback.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {shift.lastFeedback.type === 'critical' || shift.lastFeedback.type === 'warning' ? (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            ) : shift.lastFeedback.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Info className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="truncate">{shift.lastFeedback.message}</span>
          </div>
        </div>
      )}

      {/* 3. Multiple Patient Manager (Emergency Roster with Acuity Badges) */}
      <MultiplePatientManager
        patients={shift.activePatients}
        selectedIndex={shift.selectedBedIndex}
        onSelectBed={selectBed}
        onPrioritize={prioritizePatient}
      />

      {/* 4. Active Patient Clinical Encounter View */}
      {currentPatient ? (
        <PatientEncounter
          patient={currentPatient}
          currentAP={shift.currentAP}
          onPerformAction={performClinicalAction}
          onRevealClue={revealClue}
          onConfirmDiagnosis={confirmDiagnosis}
          onReassess={() => reassessPatient(shift.selectedBedIndex)}
          onDischargeOrAdmit={() => dischargeOrAdmitPatient(shift.selectedBedIndex)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-400 font-medium text-xs">
          All beds cleared. Awaiting EMS radio patch...
        </div>
      )}

      {/* 5. Random Event Modal Overlay */}
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
