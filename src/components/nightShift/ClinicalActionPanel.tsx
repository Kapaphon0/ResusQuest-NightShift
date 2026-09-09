import React, { useState } from 'react';
import {
  Stethoscope,
  FlaskConical,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  ArrowRight,
  Eye,
  Crosshair,
} from 'lucide-react';
import { Patient, ClinicalAction, ClinicalClue } from '../../types/nightShift';
import { audio } from '../../utils/audio';

interface ClinicalActionPanelProps {
  patient: Patient;
  currentAP: number;
  onPerformAction: (action: ClinicalAction) => void;
  onRevealClue: (clueId: string, costAP: number) => void;
  onConfirmDiagnosis: (diagnosisId: string) => void;
  onDischargeOrAdmit: () => void;
}

type ActionCategory = 'assess' | 'investigate' | 'intervene' | 'diagnose';

export const ClinicalActionPanel: React.FC<ClinicalActionPanelProps> = ({
  patient,
  currentAP,
  onPerformAction,
  onRevealClue,
  onConfirmDiagnosis,
  onDischargeOrAdmit,
}) => {
  const [activeTab, setActiveTab] = useState<ActionCategory>('intervene');

  // Filter actions
  const assessActions = patient.availableActions.filter((a) => a.category === 'assess');
  const interveneActions = patient.availableActions.filter((a) => a.category === 'intervene');
  const investigateActions = patient.availableActions.filter((a) => a.category === 'investigate');

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col select-none">
      {/* Category Tab Bar */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 p-1">
        <button
          onClick={() => {
            audio.playTelemetryClick();
            setActiveTab('intervene');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'intervene'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Intervene</span>
        </button>

        <button
          onClick={() => {
            audio.playTelemetryClick();
            setActiveTab('investigate');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'investigate'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Investigations</span>
        </button>

        <button
          onClick={() => {
            audio.playTelemetryClick();
            setActiveTab('diagnose');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'diagnose'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Diagnosis</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
        {/* INTERVENE TAB */}
        {activeTab === 'intervene' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Therapeutic Resuscitation & Procedures</span>
              <span className="font-mono text-rose-600">AP Available: {currentAP}</span>
            </div>

            {interveneActions.map((action) => {
              const hasEnoughAP = currentAP >= action.costAP;
              const alreadyUsed = patient.actionsTaken.includes(action.id);

              return (
                <button
                  key={action.id}
                  disabled={!hasEnoughAP || alreadyUsed}
                  onClick={() => onPerformAction(action)}
                  className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    alreadyUsed
                      ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                      : hasEnoughAP
                      ? 'bg-white hover:bg-rose-50/50 border-slate-200 hover:border-rose-400 border-b-4 active:border-b-2 active:translate-y-0.5 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-black text-slate-900 leading-tight pr-2">
                      {action.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-mono font-black text-amber-700 shrink-0 flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                      {action.costAP} AP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight pt-1">
                    {action.description}
                  </p>
                  {alreadyUsed && (
                    <span className="text-[10px] font-black text-emerald-600 uppercase mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Administered
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* INVESTIGATIONS TAB (ECG, POCUS, LABS, IMAGING) */}
        {activeTab === 'investigate' && (
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-slate-500">
              Bedside Diagnostics & Clues (Tap to Reveal)
            </div>

            {patient.hiddenClues.map((clue) => {
              const hasEnoughAP = currentAP >= clue.costAP;

              return (
                <div
                  key={clue.id}
                  className={`p-3.5 rounded-2xl border-2 transition-all ${
                    clue.revealed
                      ? 'bg-emerald-50/60 border-emerald-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          {clue.category}
                        </span>
                        <h4 className="text-xs font-black text-slate-900">{clue.title}</h4>
                      </div>
                      {clue.revealed ? (
                        <p className="text-[11px] text-slate-700 font-medium pt-1 leading-snug">
                          {clue.description}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic pt-0.5">
                          Unreviewed diagnostic report.
                        </p>
                      )}
                    </div>

                    {!clue.revealed && (
                      <button
                        disabled={!hasEnoughAP}
                        onClick={() => onRevealClue(clue.id, clue.costAP)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 border-b-2 active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer shrink-0 ${
                          hasEnoughAP
                            ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-800'
                            : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                        }`}
                      >
                        <Eye className="w-3 h-3" />
                        <span className="flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                          {clue.costAP} AP
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DIAGNOSE TAB */}
        {activeTab === 'diagnose' && (
          <div className="space-y-2.5">
            <div className="text-[11px] font-bold text-slate-500">
              Select Confirmed Working Diagnosis
            </div>

            {patient.possibleDiagnoses.map((dx) => {
              const isSelected = patient.confirmedDiagnosis === dx.name;

              return (
                <button
                  key={dx.id}
                  disabled={Boolean(patient.confirmedDiagnosis)}
                  onClick={() => onConfirmDiagnosis(dx.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                      : patient.confirmedDiagnosis
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : 'bg-white hover:bg-rose-50/50 border-slate-200 hover:border-rose-400 border-b-4 active:border-b-2 active:translate-y-0.5'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-slate-900 block">{dx.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{dx.category}</span>
                  </div>

                  {isSelected && (
                    <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Confirmed
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bed Resolution Bottom Bar */}
      {(patient.isStabilized || patient.confirmedDiagnosis) && (
        <div className="p-3 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Patient Resuscitated & Stabilized!</span>
          </div>

          <button
            onClick={onDischargeOrAdmit}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider border-b-2 border-emerald-800 active:border-b-0 active:translate-y-0.5 shadow-sm transition-all cursor-pointer flex items-center gap-1"
          >
            <span>Admit / Transfer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
