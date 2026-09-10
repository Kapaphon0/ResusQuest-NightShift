import React, { useState, useEffect } from 'react';
import { StructuredCaseState, ExamSystemFinding, InvestigationResult, RedFlagItem, DifferentialOption, ManagementAction } from '../../types/bossCase';
import { INITIAL_CHEST_PAIN_CASE, DISPOSITION_OPTIONS, calculateCaseScoreAndDebrief } from '../../data/chestPainCaseData';
import { ECGLeadViewer } from './ECGLeadViewer';
import { CaseDebriefScreen } from './CaseDebriefScreen';
import { useGamificationStore } from '../../store/useGamificationStore';
import { useAvatarStore } from '../../store/useAvatarStore';
import { COMPANIONS_CATALOG } from '../../data/companionsData';
import { CompanionRenderer } from '../avatar/CompanionRenderer';
import { ClinicalAuscultationModal } from '../avatar/ClinicalAuscultationModal';
import { audio } from '../../utils/audio';
import { Activity, Heart, Stethoscope, FlaskConical, Brain, Pill, Ambulance, CheckCircle2, AlertTriangle, Clock, User, ChevronRight, ArrowLeft, Info, Crown } from 'lucide-react';
interface ChestPainCaseViewProps {
  onExit: () => void;
}

type BossTab = 'history' | 'exam' | 'investigations' | 'reasoning' | 'management' | 'disposition';

export const ChestPainCaseView: React.FC<ChestPainCaseViewProps> = ({ onExit }) => {
  const { awardQuestionXP, completeClinicalCase } = useGamificationStore();
  const { appearance } = useAvatarStore();
  const activeCompanion =
    appearance.companionId !== 'none'
      ? COMPANIONS_CATALOG[appearance.companionId]
      : null;

  const [state, setState] = useState<StructuredCaseState>(() =>
    JSON.parse(JSON.stringify(INITIAL_CHEST_PAIN_CASE))
  );

  const [activeTab, setActiveTab] = useState<BossTab>('history');
  const [showAuscultationModal, setShowAuscultationModal] = useState<boolean>(false);
  const [patientSpeech, setPatientSpeech] = useState<string>(
    '“Doctor, please help... I’ve had this crushing pressure in the middle of my chest for two hours. It started while I was mowing the lawn and it’s getting worse.”'
  );
  const [latestEvent, setLatestEvent] = useState<string>(
    'EMS ALS Arrival • Patient wheeled into Resuscitation Bay 1.'
  );
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [claimedXP, setClaimedXP] = useState<boolean>(false);

  // Simulation timer
  useEffect(() => {
    if (state.isCompleted) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [state.isCompleted]);

  // Convert timer seconds to simulated minutes (1 real sec = 0.5 simulated min, minimum 2 min elapsed)
  const elapsedMinutes = Math.max(2, Math.round(timerSeconds * 0.4) + state.elapsedMinutes);

  // Sound heartbeat periodically
  useEffect(() => {
    if (state.isCompleted) return;
    const beatInterval = setInterval(() => {
      audio.playHeartbeat();
    }, 4500);
    return () => clearInterval(beatInterval);
  }, [state.isCompleted]);

  // Deterioration Check: If student takes > 5 actions without ordering an ECG
  const checkDeterioration = (nextActionCount: number, ecgOrdered: boolean) => {
    if (!ecgOrdered && nextActionCount >= 5 && state.deteriorationState === 'stable_presentation') {
      audio.playAlarm();
      setState((prev) => ({
        ...prev,
        deteriorationState: 'ventricular_ectopy',
        vitalSigns: {
          ...prev.vitalSigns,
          hr: 116,
          bpSystolic: 114,
          bpDiastolic: 72,
          rhythm: 'Sinus Tachycardia with Salvo of PVCs',
        },
      }));
      setPatientSpeech(
        '“Ugh... Doctor, I feel dizzy and my chest is pounding! The room is spinning...”'
      );
      setLatestEvent(
        '⚠️ CLINICAL DETERIORATION: Delayed Door-to-ECG! Monitor alarms with frequent PVCs and blood pressure drop!'
      );
    }
  };

  // 1. History Action Handlers
  const handleAskHistory = (type: string) => {
    audio.playMonitorBeep();
    let speech = '';
    let event = '';

    setState((prev) => {
      const nextLog = [...prev.actionLog];
      const nextRF = { ...prev.redFlags };
      let minutesAdded = 1;

      if (type === 'onset') {
        speech =
          '“It started suddenly about two hours ago while I was pushing the lawnmower. It didn’t ease up when I sat down, even after taking a glass of cold water.”';
        event = 'History Elicited: Sudden onset 2 hours ago during exertion; persistent at rest.';
        nextRF.rf_retrosternal_crushing.identified = true;
      } else if (type === 'radiation') {
        speech =
          '“Yes! It shoots straight up into the left side of my jaw and runs down my left shoulder into my inner wrist. My left pinky finger feels numb.”';
        event = 'History Elicited: Radiation to left jaw, shoulder, and left inner arm.';
        nextRF.rf_retrosternal_crushing.identified = true;
      } else if (type === 'quality') {
        speech =
          '“It’s a heavy, tight squeezing pain... like a hydraulic clamp or an elephant sitting on my sternum. I’d rate it 9 out of 10.”';
        event = 'History Elicited: Squeezing retrosternal pressure 9/10 (Anginal quality).';
        nextRF.rf_retrosternal_crushing.identified = true;
      } else if (type === 'associated') {
        speech =
          '“I broke out into a cold sweat all over. I feel terribly nauseous, like I could vomit, and I can’t catch my breath.”';
        event = 'History Elicited: Profuse cold diaphoresis, autonomic nausea, mild dyspnea.';
        nextRF.rf_autonomic_diaphoresis.identified = true;
      } else if (type === 'risk_factors') {
        speech =
          '“I’ve had high blood pressure for 10 years and Type 2 diabetes. I smoked a pack a day for 35 years until I quit two years ago. My dad had a massive heart attack and died at age 54.”';
        event = 'History Elicited: HTN, T2DM, 35-pack-year smoking, premature paternal MI at age 54.';
        nextRF.rf_cad_risk_factors.identified = true;
      } else if (type === 'medications') {
        speech =
          '“I take Lisinopril 20mg, Metformin 1000mg twice a day, and Atorvastatin 40mg at bedtime. I’m allergic to Penicillin — it gives me full-body hives!”';
        event = 'History Elicited: Lisinopril, Metformin, Atorvastatin. Allergy: Penicillin (hives).';
      }

      nextLog.push({
        timestamp: Date.now(),
        actionName: `History: ${type}`,
        category: 'history',
        impact: event,
      });

      return {
        ...prev,
        elapsedMinutes: prev.elapsedMinutes + minutesAdded,
        redFlags: nextRF,
        actionLog: nextLog,
      };
    });

    setPatientSpeech(speech);
    setLatestEvent(event);
    checkDeterioration(state.actionLog.length + 1, state.investigations.ecg.ordered);
  };

  // 2. Physical Exam Handlers
  const handlePerformExam = (systemKey: string) => {
    audio.playMonitorBeep();
    setState((prev) => {
      const exam = { ...prev.examination };
      const system = exam[systemKey];
      if (!system) return prev;

      system.revealed = true;
      const nextLog = [
        ...prev.actionLog,
        {
          timestamp: Date.now(),
          actionName: `Exam: ${system.system}`,
          category: 'exam',
          impact: system.finding,
        },
      ];

      const nextRF = { ...prev.redFlags };
      if (systemKey === 'respiratory') {
        nextRF.rf_pulmonary_crackles.identified = true;
      }

      return {
        ...prev,
        elapsedMinutes: prev.elapsedMinutes + 1,
        examination: exam,
        redFlags: nextRF,
        actionLog: nextLog,
      };
    });

    const target = state.examination[systemKey];
    if (target) {
      setLatestEvent(`Exam finding revealed for ${target.system}.`);
      if (systemKey === 'cardiovascular') {
        setPatientSpeech('“My heart is beating so fast in my chest...”');
      } else if (systemKey === 'respiratory') {
        setPatientSpeech('“It feels tight when I breathe in deeply, doctor.”');
      }
    }
  };

  // 3. Investigation Handlers
  const handleOrderInvestigation = (invId: string) => {
    audio.playMonitorBeep();
    setState((prev) => {
      const invs = { ...prev.investigations };
      const inv = invs[invId];
      if (!inv || inv.ordered) return prev;

      inv.ordered = true;
      inv.resultReady = true;

      const nextLog = [
        ...prev.actionLog,
        {
          timestamp: Date.now(),
          actionName: `Order: ${inv.name}`,
          category: 'investigation',
          impact: inv.resultDetails,
        },
      ];

      const nextRF = { ...prev.redFlags };
      if (invId === 'ecg') {
        nextRF.rf_stemi_ecg.identified = true;
        audio.playAlarm();
      }

      const nextECG = { ...prev.ecgFindings };
      if (invId === 'ecg') {
        nextECG.ordered = true;
      }

      const nextTrop = { ...prev.troponinResults };
      if (invId === 'troponin') {
        nextTrop.ordered = true;
      }

      return {
        ...prev,
        elapsedMinutes: prev.elapsedMinutes + (invId === 'ct_angio' ? 45 : inv.costTimeMin),
        investigations: invs,
        ecgFindings: nextECG,
        troponinResults: nextTrop,
        redFlags: nextRF,
        actionLog: nextLog,
      };
    });

    const target = state.investigations[invId];
    if (target) {
      setLatestEvent(`Investigation Ready: ${target.resultTitle}`);
      if (invId === 'ecg') {
        setPatientSpeech('“What does the ECG show, Doctor? Is it a heart attack?”');
      } else if (invId === 'ct_angio') {
        setLatestEvent('⚠️ DELAY WARNING: Patient was transported out of bay to CT scanner; 45 minutes lost!');
      }
    }
  };

  // Handle ECG Interpretation from ECGLeadViewer
  const handleECGInterpreted = (correct: boolean) => {
    if (correct) {
      audio.playSuccess();
    } else {
      audio.playAlarm();
    }

    setState((prev) => ({
      ...prev,
      ecgFindings: {
        ...prev.ecgFindings,
        studentInterpreted: true,
        studentDiagnosis: correct ? 'Anteroseptal STEMI (LAD)' : 'Misinterpreted',
      },
      differentialDiagnosis: {
        ...prev.differentialDiagnosis,
        stemi: {
          ...prev.differentialDiagnosis.stemi,
          status: 'primary_suspect',
        },
      },
      actionLog: [
        ...prev.actionLog,
        {
          timestamp: Date.now(),
          actionName: 'Interpretation: 12-Lead ECG',
          category: 'reasoning',
          impact: correct
            ? 'Correctly identified Anteroseptal STEMI with LAD occlusion.'
            : 'Incorrect ECG interpretation.',
        },
      ],
    }));
  };

  // Handle Differential Diagnosis Toggle
  const handleToggleDifferential = (diffId: string, newStatus: 'primary_suspect' | 'ruled_out') => {
    audio.playMonitorBeep();
    setState((prev) => {
      const diffs = { ...prev.differentialDiagnosis };
      if (!diffs[diffId]) return prev;

      diffs[diffId] = {
        ...diffs[diffId],
        status: newStatus,
      };

      return {
        ...prev,
        differentialDiagnosis: diffs,
        actionLog: [
          ...prev.actionLog,
          {
            timestamp: Date.now(),
            actionName: `Differential: ${diffs[diffId].diagnosis}`,
            category: 'reasoning',
            impact: `Marked as ${newStatus.replace('_', ' ').toUpperCase()}`,
          },
        ],
      };
    });
  };

  // 4. Management Action Handlers
  const handleApplyManagement = (mgmtId: string) => {
    const mgmt = state.managementActions[mgmtId];
    if (!mgmt || mgmt.applied) return;

    if (mgmt.isContraindicated) {
      audio.playAlarm();
    } else {
      audio.playSuccess();
    }

    setState((prev) => {
      const mgmts = { ...prev.managementActions };
      mgmts[mgmtId] = { ...mgmts[mgmtId], applied: true };

      let nextVitals = { ...prev.vitalSigns };
      let nextSpeech = prev.symptoms.chiefComplaint;

      if (mgmtId === 'aspirin') {
        nextSpeech = '“I chewed the orange aspirin tablets, Doctor.”';
      } else if (mgmtId === 'nitroglycerin') {
        nextSpeech = '“The tablet under my tongue tingles. The chest pain dialed down a bit, from a 9 to a 6.”';
        nextVitals.bpSystolic = 132;
        nextVitals.bpDiastolic = 84;
      } else if (mgmtId === 'beta_blocker_iv') {
        nextSpeech = '“Doctor... I can’t breathe... my lungs feel full of fluid!”';
        nextVitals.hr = 58;
        nextVitals.bpSystolic = 88;
        nextVitals.bpDiastolic = 54;
        nextVitals.spo2 = 88;
      } else if (mgmtId === 'defib_pads_telemetry') {
        nextSpeech = '“Pads are cold against my ribs, but I feel safer having the monitors on.”';
      }

      return {
        ...prev,
        vitalSigns: nextVitals,
        managementActions: mgmts,
        actionLog: [
          ...prev.actionLog,
          {
            timestamp: Date.now(),
            actionName: `Management: ${mgmt.title}`,
            category: 'management',
            impact: mgmt.guidelineRationale,
          },
        ],
      };
    });

    setPatientSpeech(
      mgmtId === 'aspirin'
        ? '“I chewed the orange aspirin tablets, Doctor.”'
        : mgmtId === 'nitroglycerin'
        ? '“The tablet under my tongue tingles. The chest squeezing eased slightly to a 6/10.”'
        : mgmtId === 'beta_blocker_iv'
        ? '“Doctor... I’m feeling faint... my breath is drowning...”'
        : `Applied ${mgmt.title}.`
    );
    setLatestEvent(`Order Administered: ${mgmt.title}`);
  };

  // 5. Finalize Disposition & Calculate Score
  const handleSelectDisposition = (dispId: string) => {
    const disp = DISPOSITION_OPTIONS.find((d) => d.id === dispId);
    if (!disp) return;

    audio.playMonitorBeep();
    const updatedState: StructuredCaseState = {
      ...state,
      disposition: disp,
      isCompleted: true,
      elapsedMinutes,
    };

    const { score, debrief } = calculateCaseScoreAndDebrief(updatedState);
    updatedState.scoreBreakdown = score;
    updatedState.debriefReport = debrief;

    setState(updatedState);
    if (score.totalScore >= 75) {
      audio.playSuccess();
    } else {
      audio.playAlarm();
    }
  };

  // Award XP to centralized gamification engine
  const handleClaimXP = () => {
    if (claimedXP) return;
    setClaimedXP(true);
    // Award 150 XP for Boss Battle completion
    awardQuestionXP('boss_chest_pain_case', true, true, 'Clinical Boss: The Chest Pain Case');
    completeClinicalCase('boss_chest_pain_case', 'The Chest Pain Case (STEMI Primary PCI)');
  };

  const handleRestart = () => {
    setState(JSON.parse(JSON.stringify(INITIAL_CHEST_PAIN_CASE)));
    setActiveTab('history');
    setPatientSpeech(
      '“Doctor, please help... I’ve had this crushing pressure in the middle of my chest for two hours. It started while I was mowing the lawn and it’s getting worse.”'
    );
    setLatestEvent('EMS ALS Arrival • Patient wheeled into Resuscitation Bay 1.');
    setTimerSeconds(0);
    setClaimedXP(false);
  };

  // If case is completed, show the detailed debrief & score screen
  if (state.isCompleted && state.scoreBreakdown && state.debriefReport) {
    return (
      <CaseDebriefScreen
        score={state.scoreBreakdown}
        debrief={state.debriefReport}
        elapsedMinutes={state.elapsedMinutes}
        onClaimXP={handleClaimXP}
        onRestart={handleRestart}
        onExit={onExit}
        claimed={claimedXP}
      />
    );
  }

  // Count progress indicators
  const redFlagsFound = (Object.values(state.redFlags) as RedFlagItem[]).filter((r) => r.identified).length;
  const examsRevealed = (Object.values(state.examination) as ExamSystemFinding[]).filter((e) => e.revealed).length;
  const invsOrdered = (Object.values(state.investigations) as InvestigationResult[]).filter((i) => i.ordered).length;
  const mgmtsApplied = (Object.values(state.managementActions) as ManagementAction[]).filter((m) => m.applied).length;

  return (
    <div
      id="chest-pain-case-view"
      className="flex-1 flex flex-col bg-slate-900 text-slate-100 overflow-hidden select-none"
    >
      {/* Simulation Header / Navigation */}
      <header className="px-3 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            id="btn-back-from-boss"
            onClick={onExit}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Exit to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>BOSS BATTLE</span>
              </span>
              <span className="text-xs font-black tracking-tight text-white">
                THE CHEST PAIN CASE
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {state.demographics.name} • {state.demographics.age}M • {state.demographics.triageAcuity}
            </div>
          </div>
        </div>

        {/* Elapsed Simulation Time Clock */}
        <div className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span className="font-bold text-slate-200">
            {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-500">({elapsedMinutes}m ED)</span>
        </div>
      </header>

      {/* Bedside Vital Signs Monitor Strip */}
      <aside
        id="boss-vitals-monitor"
        aria-label="Patient real-time vital signs"
        className="px-3 py-2 bg-black border-b border-slate-800 flex items-center justify-between text-xs font-mono overflow-x-auto gap-3"
      >
        <div className="flex items-center gap-1 text-rose-400">
          <Heart className="w-3.5 h-3.5 animate-pulse" />
          <span className="font-black text-sm">{state.vitalSigns.hr}</span>
          <span className="text-[10px] text-slate-400">BPM</span>
        </div>

        <div className="flex items-center gap-1 text-emerald-400">
          <span className="text-slate-400 text-[10px]">BP</span>
          <span className="font-black text-sm">
            {state.vitalSigns.bpSystolic}/{state.vitalSigns.bpDiastolic}
          </span>
        </div>

        <div className="flex items-center gap-1 text-cyan-400">
          <span className="text-slate-400 text-[10px]">SpO2</span>
          <span className="font-black text-sm">{state.vitalSigns.spo2}%</span>
        </div>

        <div className="flex items-center gap-1 text-amber-400">
          <span className="text-slate-400 text-[10px]">RR</span>
          <span className="font-black text-sm">{state.vitalSigns.rr}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-slate-400">
          <span className="text-[10px]">T:</span>
          <span className="font-bold text-xs">{state.vitalSigns.tempC}°C</span>
        </div>

        {/* Dynamic Rhythm Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-slate-300 font-sans font-bold shrink-0">
          <Activity className="w-3 h-3 text-rose-400 animate-pulse" />
          <span className="truncate max-w-[130px]">{state.vitalSigns.rhythm}</span>
        </div>
      </aside>

      {/* Patient Dialogue & Clinical Context Box */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0 relative">
            <User className="w-5 h-5 text-slate-300" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-ping" />
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-rose-500 ring-2 ring-slate-950" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black tracking-wide text-rose-400 uppercase">
                Patient: Robert Vance (62M)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Levine Sign (+)</span>
            </div>
            <p className="text-xs text-slate-200 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed font-sans italic">
              {patientSpeech}
            </p>
          </div>
        </div>

        {/* Real-time Status / Event Log ticker */}
        <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{latestEvent}</span>
        </div>

        {/* Companion Bedside Observer */}
        {activeCompanion && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-900 text-xs">
            <div className="shrink-0">
              <CompanionRenderer
                companionId={activeCompanion.id}
                size="sm"
                contextMode={
                  state.deteriorationState !== 'stable_presentation'
                    ? 'criticalVitals'
                    : 'idle'
                }
              />
            </div>
            <div className="text-[11px] text-slate-400 leading-tight">
              <span className="font-bold text-slate-300">{activeCompanion.name}:</span>{' '}
              {state.investigations.ecg.ordered
                ? 'ECG is on the monitor. Look closely for ST elevations in inferior leads.'
                : 'Door-to-ECG speed saves myocardium. Keep calm and obtain early leads.'}
            </div>
          </div>
        )}
      </div>

      {/* Main Clinical Phase Tabs */}
      <nav
        aria-label="Clinical decision workflow phases"
        className="flex items-center bg-slate-950 border-b border-slate-800 overflow-x-auto text-xs font-bold text-slate-400 px-2 py-1.5 gap-1"
      >
        <button
          id="tab-boss-history"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>History ({redFlagsFound}/5)</span>
        </button>

        <button
          id="tab-boss-exam"
          onClick={() => setActiveTab('exam')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'exam'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Exam ({examsRevealed}/6)</span>
        </button>

        <button
          id="tab-boss-investigations"
          onClick={() => setActiveTab('investigations')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'investigations'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Tests ({invsOrdered})</span>
        </button>

        <button
          id="tab-boss-reasoning"
          onClick={() => setActiveTab('reasoning')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'reasoning'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Differential</span>
        </button>

        <button
          id="tab-boss-management"
          onClick={() => setActiveTab('management')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'management'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Rx ({mgmtsApplied})</span>
        </button>

        <button
          id="tab-boss-disposition"
          onClick={() => setActiveTab('disposition')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'disposition'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Ambulance className="w-3.5 h-3.5" />
          <span>Disposition</span>
        </button>
      </nav>

      {/* Interactive Phase Content Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* PHASE 1: HISTORY TAKING */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Targeted Bedside History</h3>
                <p className="text-[11px] text-slate-400">
                  Select clinical inquiry avenues to uncover red flags and risk factors.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                {redFlagsFound} / 5 RED FLAGS
              </span>
            </div>

            {/* Inquiry Action Buttons (Tactile 3D Duolingo Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                id="btn-ask-onset"
                onClick={() => handleAskHistory('onset')}
                className="p-3 bg-slate-800 hover:bg-slate-750 text-left rounded-xl border border-slate-700 border-b-4 border-b-slate-950 active:border-b-0 active:translate-y-1 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">Ask about Onset & Activity</div>
                  <div className="text-[10px] text-slate-400">“When did this start? What were you doing?”</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                id="btn-ask-radiation"
                onClick={() => handleAskHistory('radiation')}
                className="p-3 bg-slate-800 hover:bg-slate-750 text-left rounded-xl border border-slate-700 border-b-4 border-b-slate-950 active:border-b-0 active:translate-y-1 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">Ask about Radiation</div>
                  <div className="text-[10px] text-slate-400">“Does the pain shoot to your jaw, arm, or back?”</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                id="btn-ask-quality"
                onClick={() => handleAskHistory('quality')}
                className="p-3 bg-slate-800 hover:bg-slate-750 text-left rounded-xl border border-slate-700 border-b-4 border-b-slate-950 active:border-b-0 active:translate-y-1 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">Ask about Character & Severity</div>
                  <div className="text-[10px] text-slate-400">“Is it sharp, crushing, or burning? 1 to 10 scale?”</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                id="btn-ask-associated"
                onClick={() => handleAskHistory('associated')}
                className="p-3 bg-slate-800 hover:bg-slate-750 text-left rounded-xl border border-slate-700 border-b-4 border-b-slate-950 active:border-b-0 active:translate-y-1 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">Ask about Associated Symptoms</div>
                  <div className="text-[10px] text-slate-400">“Any diaphoresis, nausea, vomiting, or dyspnea?”</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                id="btn-ask-risk-factors"
                onClick={() => handleAskHistory('risk_factors')}
                className="p-3 bg-slate-800 hover:bg-slate-750 text-left rounded-xl border border-slate-700 border-b-4 border-b-slate-950 active:border-b-0 active:translate-y-1 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">Review Risk Factors & Family History</div>
                  <div className="text-[10px] text-slate-400">“Do you smoke? Any early heart attacks in your family?”</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                id="btn-ask-medications"
                onClick={() => handleAskHistory('medications')}
                className="p-3 bg-slate-800 hover:bg-slate-750 text-left rounded-xl border border-slate-700 border-b-4 border-b-slate-950 active:border-b-0 active:translate-y-1 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">Review Medications & Allergies</div>
                  <div className="text-[10px] text-slate-400">“What daily pills do you take? Any drug allergies?”</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Discovered Red Flags Tracker */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Identified Emergency Red Flags</span>
              </div>
              <div className="space-y-1.5">
                {(Object.values(state.redFlags) as RedFlagItem[]).map((rf) => (
                  <div
                    key={rf.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                      rf.identified
                        ? 'bg-rose-950/40 border-rose-500/50 text-slate-200'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="leading-snug">{rf.description}</span>
                    {rf.identified ? (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono text-[10px] font-black uppercase shrink-0 ml-2">
                        UNCOVERED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-600 font-mono text-[10px] shrink-0 ml-2">
                        PENDING
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2: PHYSICAL EXAMINATION */}
        {activeTab === 'exam' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Bedside Physical Examination</h3>
                <p className="text-[11px] text-slate-400">
                  Target key systems to assess hemodynamics and rule out life-threatening differentials.
                </p>
              </div>
              <button
                id="btn-chestpain-auscultate"
                onClick={() => setShowAuscultationModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl border-b-2 border-blue-800 active:border-b-0 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Auscultate</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {(Object.entries(state.examination) as [string, ExamSystemFinding][]).map(([key, sys]) => (
                <div
                  key={key}
                  className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-black text-white">{sys.system}</span>
                    </div>

                    {!sys.revealed ? (
                      <button
                        id={`btn-exam-${key}`}
                        onClick={() => handlePerformExam(key)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg border-b-2 border-rose-800 active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        Examine
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-black uppercase">
                        EXAMINED
                      </span>
                    )}
                  </div>

                  {sys.revealed ? (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-xs animate-in fade-in">
                      <p className="text-slate-200 leading-relaxed">{sys.finding}</p>
                      <div className="text-[11px] text-amber-300/90 font-mono bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
                        <span className="font-bold">Clinical Significance: </span>
                        {sys.clinicalSignificance}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      Click examine to auscultate and evaluate this system.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 3: INVESTIGATIONS & DIAGNOSTIC TESTS */}
        {activeTab === 'investigations' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-black text-white">Diagnostic Investigations</h3>
              <p className="text-[11px] text-slate-400">
                Prioritize rapid tests with high clinical yield. Avoid scans that cause critical reperfusion delay.
              </p>
            </div>

            {/* Orderable Tests Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.values(state.investigations) as InvestigationResult[]).map((inv) => (
                <div
                  key={inv.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    inv.ordered
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-slate-800/90 border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-xs font-bold text-white">{inv.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">+{inv.costTimeMin}m</span>
                  </div>

                  {!inv.ordered ? (
                    <button
                      id={`btn-order-${inv.id}`}
                      onClick={() => handleOrderInvestigation(inv.id)}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl border-b-3 border-rose-800 active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      STAT ORDER
                    </button>
                  ) : (
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1 animate-in fade-in">
                      <div className="flex items-center gap-1 font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{inv.resultTitle}</span>
                      </div>
                      <p className="text-slate-300 leading-snug">{inv.resultDetails}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Dedicated Interactive 12-Lead ECG Viewer */}
            {state.investigations.ecg.ordered && (
              <ECGLeadViewer
                onInterpreted={handleECGInterpreted}
                interpreted={state.ecgFindings.studentInterpreted}
              />
            )}

            {/* Troponin Clinical Reasoning Pearl */}
            {state.investigations.troponin.ordered && (
              <div className="p-3.5 bg-blue-950/40 border border-blue-500/40 rounded-2xl text-xs space-y-1.5 text-blue-200">
                <div className="flex items-center gap-1.5 font-black text-blue-400 uppercase tracking-wider">
                  <Brain className="w-4 h-4" />
                  <span>Troponin Interpretation Protocol</span>
                </div>
                <p className="leading-relaxed">
                  High-sensitivity Troponin I is <strong>480 ng/L</strong> (ULN &lt; 14 ng/L). In acute STEMI with diagnostic ST-segment elevation, <strong>REPERFUSION MUST NOT WAIT</strong> for lab troponins! Time is myocardium.
                </p>
              </div>
            )}
          </div>
        )}

        {/* PHASE 4: CLINICAL REASONING & DIFFERENTIAL DIAGNOSIS */}
        {activeTab === 'reasoning' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-black text-white">Differential Diagnosis Matrix</h3>
              <p className="text-[11px] text-slate-400">
                Structure your clinical synthesis: Identify the primary working diagnosis and safely exclude mimics.
              </p>
            </div>

            <div className="space-y-2.5">
              {(Object.values(state.differentialDiagnosis) as DifferentialOption[]).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.diagnosis}</span>
                    <div className="flex gap-1.5">
                      <button
                        id={`btn-diff-primary-${item.id}`}
                        onClick={() => handleToggleDifferential(item.id, 'primary_suspect')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border cursor-pointer ${
                          item.status === 'primary_suspect'
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        Primary Suspect
                      </button>
                      <button
                        id={`btn-diff-ruleout-${item.id}`}
                        onClick={() => handleToggleDifferential(item.id, 'ruled_out')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border cursor-pointer ${
                          item.status === 'ruled_out'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        Rule Out
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 5: RESUSCITATION & MANAGEMENT */}
        {activeTab === 'management' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-black text-white">Emergency Resuscitation & Pharmacology</h3>
              <p className="text-[11px] text-slate-400">
                Execute medical interventions based on AHA/ESC STEMI guidelines. Beware of lethal pitfalls!
              </p>
            </div>

            <div className="space-y-2.5">
              {(Object.values(state.managementActions) as ManagementAction[]).map((act) => (
                <div
                  key={act.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    act.applied
                      ? act.isContraindicated
                        ? 'bg-rose-950/40 border-rose-500/70'
                        : 'bg-emerald-950/30 border-emerald-500/50'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{act.title}</span>
                        {act.isContraindicated && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 text-[9px] font-black uppercase">
                            POTENTIAL HAZARD
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{act.description}</div>
                    </div>

                    {!act.applied ? (
                      <button
                        id={`btn-apply-mgmt-${act.id}`}
                        onClick={() => handleApplyManagement(act.id)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl border-b-2 border-rose-800 active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer shrink-0"
                      >
                        Administer
                      </button>
                    ) : (
                      <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[10px] font-black uppercase shrink-0">
                        ADMINISTERED
                      </span>
                    )}
                  </div>

                  {act.applied && (
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 leading-snug animate-in fade-in">
                      <span className="font-bold text-amber-300">Guideline Rationale: </span>
                      {act.guidelineRationale}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 6: DEFINITIVE DISPOSITION */}
        {activeTab === 'disposition' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-black text-white">Definitive Reperfusion & Disposition</h3>
              <p className="text-[11px] text-slate-400">
                Choose the definitive clinical disposition for Robert Vance. This action concludes the simulation and triggers the scoring engine.
              </p>
            </div>

            <div className="space-y-2.5">
              {DISPOSITION_OPTIONS.map((disp) => (
                <div
                  key={disp.id}
                  className="p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">{disp.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">{disp.timeframe}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{disp.description}</p>
                  <button
                    id={`btn-select-disp-${disp.id}`}
                    onClick={() => handleSelectDisposition(disp.id)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl border-b-3 border-rose-800 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>CONFIRM THIS DISPOSITION</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Persistent Quick Action Footer Bar */}
      <footer className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
          <Activity className="w-3.5 h-3.5 text-rose-500" />
          <span>{state.actionLog.length} Actions Logged</span>
        </div>

        {activeTab !== 'disposition' ? (
          <button
            id="btn-nav-to-next-step"
            onClick={() => {
              const sequence: BossTab[] = [
                'history',
                'exam',
                'investigations',
                'reasoning',
                'management',
                'disposition',
              ];
              const currentIndex = sequence.indexOf(activeTab);
              if (currentIndex < sequence.length - 1) {
                setActiveTab(sequence[currentIndex + 1]);
              }
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs uppercase tracking-wider rounded-xl border-b-2 border-slate-950 active:border-b-0 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Next Clinical Step</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <span className="text-[11px] text-rose-400 font-bold uppercase tracking-wide">
            Select Final Disposition Above
          </span>
        )}
      </footer>

      {/* Bedside Clinical Auscultation Modal */}
      <ClinicalAuscultationModal
        isOpen={showAuscultationModal}
        onClose={() => setShowAuscultationModal(false)}
        patientScenarioTitle="Robert Vance (62M) — Acute Inferior STEMI Evaluation"
      />
    </div>
  );
};
