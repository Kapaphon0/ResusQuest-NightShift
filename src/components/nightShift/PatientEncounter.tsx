import React, { useState } from 'react';
import { Activity, Brain, Eye, FileText, Stethoscope, TestTube2, Scan, CheckCircle2, Zap, ShieldAlert, RefreshCw, Sparkles } from 'lucide-react';
import { Patient, ClinicalAction, ClinicalClue } from '../../types/nightShift';
import { audio } from '../../utils/audio';
interface PatientEncounterProps {
  patient: Patient;
  currentAP: number;
  onPerformAction: (action: ClinicalAction) => void;
  onRevealClue: (clueId: string, costAP: number) => void;
  onConfirmDiagnosis: (diagnosisId: string) => void;
  onReassess: () => void;
  onDischargeOrAdmit: () => void;
}
export const PatientEncounter: React.FC<PatientEncounterProps> = ({
  patient,
  currentAP,
  onPerformAction,
  onRevealClue,
  onConfirmDiagnosis,
  onReassess,
  onDischargeOrAdmit,
}) => {
  const [activeTab, setActiveTab] = useState<'investigate' | 'intervene' | 'diagnose'>('investigate');
  const [selectedClueFilter, setSelectedClueFilter] = useState<string>('all');
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState<string | null>(null);
  const [showDiagnosisConfirm, setShowDiagnosisConfirm] = useState<boolean>(false);

  // Vitals color helpers
  const getHeartRateClass = (hr: number) => {
    if (hr === 0) return 'text-rose-600 animate-pulse';
    if (hr < 50 || hr > 110) return 'text-amber-500 font-bold';
    return 'text-emerald-600';
  };

  const getSpO2Class = (spo2: number) => {
    if (spo2 < 90) return 'text-rose-600 font-bold animate-pulse';
    if (spo2 < 94) return 'text-amber-500 font-bold';
    return 'text-emerald-600';
  };

  const filteredClues =
    selectedClueFilter === 'all'
      ? patient.hiddenClues
      : patient.hiddenClues.filter((c) => c.category === selectedClueFilter);

  const getCategoryIcon = (cat: ClinicalClue['category']) => {
    switch (cat) {
      case 'history':
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
      case 'exam':
        return <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />;
      case 'ecg':
        return <Activity className="w-3.5 h-3.5 text-rose-500" />;
      case 'labs':
        return <TestTube2 className="w-3.5 h-3.5 text-amber-500" />;
      case 'pocus':
      case 'imaging':
        return <Scan className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Eye className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-3 p-3 overflow-y-auto select-none">
      {/* 1. Patient Clinical Chart Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-4 space-y-3 relative overflow-hidden">
        {/* Mystery Watermark or Alert Banner */}
        {patient.isMystery && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-900 text-xs font-black uppercase">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>❓ MYSTERY PATIENT CASE</span>
            </div>
            <span className="text-[10px] text-purple-700 font-semibold">
              Diagnosis Deliberately Obscured
            </span>
          </div>
        )}

        {/* Patient Demographic & Chief Complaint */}
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-white font-mono text-xs font-black">
                BED {patient.bedNumber}
              </span>
              <h2 className="text-base font-black text-slate-900">{patient.name}</h2>
              <span className="text-xs text-slate-500 font-medium">
                ({patient.age}y {patient.sex})
              </span>
            </div>
            <p className="text-xs font-bold text-slate-700 italic pt-0.5">
              "{patient.chiefComplaint}"
            </p>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                patient.statusLevel === 'stable'
                  ? 'bg-emerald-100 text-emerald-800'
                  : patient.statusLevel === 'concerning'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800 animate-pulse'
              }`}
            >
              {patient.statusLevel.replace('_', ' ')}
            </span>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Stability: {patient.state.stability}%
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        {patient.riskFactors && patient.riskFactors.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {patient.riskFactors.map((rf, i) => (
              <span
                key={i}
                className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200"
              >
                {rf}
              </span>
            ))}
          </div>
        )}

        {/* Real-time Physiological Monitor Vitals Strip */}
        <div className="bg-slate-950 text-white rounded-2xl p-3 border border-slate-800 space-y-2 font-mono">
          <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-800/80">
            <span className="flex items-center gap-1.5 font-bold">
              <Activity className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              PHYSIOLOGIC TELEMETRY
            </span>
            <span className="text-slate-500">{patient.vitals.rhythm}</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-1.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-sans">HR</span>
              <span className={`text-base font-black ${getHeartRateClass(patient.vitals.hr)}`}>
                {patient.vitals.hr}
              </span>
              <span className="text-[8px] text-slate-500 block">bpm</span>
            </div>

            <div className="p-1.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-sans">BP</span>
              <span className="text-base font-black text-cyan-400">{patient.vitals.bp}</span>
              <span className="text-[8px] text-slate-500 block">mmHg</span>
            </div>

            <div className="p-1.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-sans">SpO2</span>
              <span className={`text-base font-black ${getSpO2Class(patient.vitals.spo2)}`}>
                {patient.vitals.spo2}%
              </span>
              <span className="text-[8px] text-slate-500 block">RA/O2</span>
            </div>

            <div className="p-1.5 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-sans">RR / GCS</span>
              <span className="text-base font-black text-emerald-400">
                {patient.vitals.rr} / {patient.vitals.gcs}
              </span>
              <span className="text-[8px] text-slate-500 block">br/min</span>
            </div>
          </div>
        </div>

        {/* Hidden Trajectory Deterioration Warning if triggered */}
        {patient.hasDeterioratedRecently && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-black block text-[11px] text-rose-900">
                PHYSIOLOGIC DECOMPENSATION DETECTED
              </strong>
              <p className="text-[10px] leading-tight">
                {patient.deteriorationWarning || patient.trajectory.deteriorationEventMessage}
              </p>
            </div>
          </div>
        )}

        {/* Rapid Reassess Action Button */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onReassess()}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>Reassess Bed {patient.bedNumber}</span>
          </button>

          {patient.isStabilized && (
            <button
              onClick={() => onDischargeOrAdmit()}
              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 border-emerald-800 active:border-b-0 transition-colors cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>Discharge / Transfer</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Clinical Encounter Tabs (Investigate, Intervene, Diagnose) */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-2xl border border-slate-300/80">
        <button
          onClick={() => {
            audio.playTelemetryClick();
            setActiveTab('investigate');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'investigate'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <SearchTabIcon />
          <span>Investigate ({patient.hiddenClues.filter((c) => c.revealed).length}/{patient.hiddenClues.length})</span>
        </button>

        <button
          onClick={() => {
            audio.playTelemetryClick();
            setActiveTab('intervene');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'intervene'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Intervene</span>
        </button>

        <button
          onClick={() => {
            audio.playTelemetryClick();
            setActiveTab('diagnose');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'diagnose'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-purple-600" />
          <span>Diagnose</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: INVESTIGATIONS & CLINICAL CLUES */}
      {activeTab === 'investigate' && (
        <div className="space-y-2.5">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-bold">
            {['all', 'history', 'exam', 'ecg', 'labs', 'pocus', 'imaging'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedClueFilter(cat)}
                className={`px-2.5 py-1 rounded-full uppercase transition-colors cursor-pointer shrink-0 ${
                  selectedClueFilter === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Clues List */}
          <div className="space-y-2">
            {filteredClues.map((clue) => {
              const isRevealed = clue.revealed;
              const canAfford = currentAP >= clue.costAP;

              return (
                <div
                  key={clue.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    isRevealed
                      ? 'bg-white border-slate-200 shadow-xs'
                      : 'bg-slate-50/80 border-slate-200/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                        {getCategoryIcon(clue.category)}
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                          {clue.category}
                        </span>
                        <h4 className="text-xs font-black text-slate-900">{clue.title}</h4>
                      </div>
                    </div>

                    {!isRevealed ? (
                      <button
                        disabled={!canAfford}
                        onClick={() => onRevealClue(clue.id, clue.costAP)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 border-b-2 transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-800 active:border-b-0 active:translate-y-0.5'
                            : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Order ({clue.costAP} AP)</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Result In
                      </span>
                    )}
                  </div>

                  {/* Revealed Finding Description */}
                  {isRevealed && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed font-sans">
                      {clue.description}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CLINICAL INTERVENTIONS & ACTIONS */}
      {activeTab === 'intervene' && (
        <div className="space-y-2.5">
          <p className="text-[11px] text-slate-500 font-semibold px-1">
            Choose evidence-based resuscitation orders. Incorrect interventions worsen stability and accelerate arrest.
          </p>

          <div className="space-y-2">
            {patient.availableActions.map((action) => {
              const isTaken = patient.actionsTaken.includes(action.id);
              const canAfford = currentAP >= action.costAP;

              return (
                <div
                  key={action.id}
                  className={`p-3 rounded-2xl border-2 transition-all ${
                    isTaken
                      ? 'bg-emerald-50/60 border-emerald-300 opacity-90'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {action.category}
                        </span>
                        <h4 className="text-xs font-black text-slate-900">{action.name}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-snug pt-0.5">
                        {action.description}
                      </p>
                    </div>

                    <button
                      disabled={isTaken || !canAfford}
                      onClick={() => onPerformAction(action)}
                      className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-b-2 transition-all shrink-0 cursor-pointer ${
                        isTaken
                          ? 'bg-emerald-600 text-white border-emerald-800 cursor-default'
                          : canAfford
                          ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-800 active:border-b-0 active:translate-y-0.5'
                          : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                      }`}
                    >
                      {isTaken ? 'Executed' : `Apply (${action.costAP} AP)`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DIFFERENTIAL DIAGNOSIS CONFIRMATION */}
      {activeTab === 'diagnose' && (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>Emergency Differential Diagnosis</span>
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Formulate your final working diagnosis based on gathered clinical clues and hemodynamic responses.
            </p>
          </div>

          <div className="space-y-2">
            {patient.possibleDiagnoses.map((diag) => {
              const isSelected = selectedDiagnosisId === diag.id;
              const isConfirmed = patient.confirmedDiagnosis === diag.name;

              return (
                <div
                  key={diag.id}
                  onClick={() => {
                    if (!patient.confirmedDiagnosis) {
                      audio.playTelemetryClick();
                      setSelectedDiagnosisId(diag.id);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isConfirmed
                      ? 'bg-emerald-50 border-emerald-500'
                      : isSelected
                      ? 'bg-purple-50 border-purple-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="text-[9px] font-black uppercase text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                      {diag.category}
                    </span>
                    <h4 className="text-xs font-black text-slate-900 pt-1">{diag.name}</h4>
                  </div>

                  {isConfirmed ? (
                    <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Confirmed
                    </span>
                  ) : (
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-purple-600 bg-purple-600' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Confirm Button */}
          {!patient.confirmedDiagnosis && (
            <button
              disabled={!selectedDiagnosisId}
              onClick={() => {
                if (selectedDiagnosisId) {
                  onConfirmDiagnosis(selectedDiagnosisId);
                }
              }}
              className={`w-full py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider border-b-4 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedDiagnosisId
                  ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-800 active:border-b-0 active:translate-y-1 shadow-md'
                  : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lock In Diagnosis</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const SearchTabIcon = () => <Eye className="w-3.5 h-3.5 text-blue-500" />;
