import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Heart,
  Wind,
  Zap,
  Stethoscope,
  Scan,
  FlaskConical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Eye,
  Lock,
} from 'lucide-react';
import { useShiftStore } from '../store/useShiftStore';
import { useGamificationStore } from '../store/useGamificationStore';
import { useAvatarStore } from '../store/useAvatarStore';
import { InvestigationType, FogOfWarPatient, ShiftPerk } from '../types';
import { audio } from '../utils/audio';
import { CompanionRenderer } from './avatar/CompanionRenderer';
import { ClinicalAuscultationModal } from './avatar/ClinicalAuscultationModal';

export interface FogOfWarBedProps {
  bedNumber?: number;
  patient?: FogOfWarPatient | null;
  currentAP?: number;
  revealedInvestigations?: Record<InvestigationType, boolean>;
  activePerks?: ShiftPerk[];
  onRevealInvestigation?: (type: InvestigationType, cost: number) => void;
  onSubmitDecision?: (optionId: string, elapsedSeconds: number) => { isCorrect: boolean; penaltyExplain: string } | void;
  onAdvanceBed?: () => void;
}

interface InvestigationConfig {
  type: InvestigationType;
  title: string;
  icon: React.ReactNode;
  accentColor: string;
}

const INVESTIGATION_CONFIGS: InvestigationConfig[] = [
  {
    type: 'ecg',
    title: '12-Lead Telemetry ECG',
    icon: <Activity className="w-4 h-4 text-emerald-500" />,
    accentColor: 'text-emerald-500',
  },
  {
    type: 'exam',
    title: 'Bedside Physical Exam',
    icon: <Stethoscope className="w-4 h-4 text-blue-500" />,
    accentColor: 'text-blue-500',
  },
  {
    type: 'pocus',
    title: 'Point-of-Care Ultrasound',
    icon: <Scan className="w-4 h-4 text-purple-500" />,
    accentColor: 'text-purple-500',
  },
  {
    type: 'labs',
    title: 'Stat Serum Diagnostics',
    icon: <FlaskConical className="w-4 h-4 text-amber-500" />,
    accentColor: 'text-amber-500',
  },
];

export const FogOfWarBed: React.FC<FogOfWarBedProps> = ({
  bedNumber,
  patient,
  currentAP: propAP,
  revealedInvestigations: propRevealed,
  activePerks: propPerks,
  onRevealInvestigation,
  onSubmitDecision,
  onAdvanceBed,
}) => {
  const {
    currentBedIndex,
    beds,
    activeFogCase: storeActiveFogCase,
    currentAP: storeCurrentAP,
    revealedInvestigations: storeRevealed,
    revealInvestigation: storeRevealInvestigation,
    submitFogDecision: storeSubmitDecision,
    advanceBed: storeAdvanceBed,
    activePerks: storeActivePerks,
  } = useShiftStore();
  const { awardQuestionXP, completeClinicalCase } = useGamificationStore();
  const { appearance } = useAvatarStore();

  const activeFogCase = patient || storeActiveFogCase;
  const currentAP = propAP !== undefined ? propAP : storeCurrentAP;
  const revealedInvestigations = propRevealed || storeRevealed;
  const activePerks = propPerks || storeActivePerks;

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showAuscultationModal, setShowAuscultationModal] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<{
    submitted: boolean;
    isCorrect: boolean;
    penaltyExplain: string;
  } | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic heartbeat audio loop synchronized with patient's HR
  useEffect(() => {
    startTimeRef.current = Date.now();
    setSelectedOptionId(null);
    setSubmissionResult(null);

    if (activeFogCase) {
      const bpm = activeFogCase.initialVitals.hr;
      const intervalMs = Math.max(350, Math.round((60 / Math.max(30, bpm)) * 1000));
      const isCritical = bpm < 50 || bpm > 130;

      // Play initial beat
      audio.playHeartbeat(bpm, isCritical);

      // Set recurrent acoustic cardiac monitoring
      heartbeatIntervalRef.current = setInterval(() => {
        audio.playHeartbeat(bpm, isCritical);
      }, intervalMs);
    }

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [currentBedIndex, activeFogCase]);

  if (!activeFogCase) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-slate-500 text-xs">
        Preparing acute resuscitation telemetry...
      </div>
    );
  }

  // Perk checks
  const hasSpideySense = activePerks.some(
    (p) => p.effect === 'time_freeze' || p.id === 'perk-spidey-sense'
  );
  const hasPocusFellowship = activePerks.some(
    (p) => p.effect === 'reveal_perk' || p.id === 'perk-pocus-fellow'
  );
  const hasFreeEcg = activePerks.some(
    (p) => p.effect === 'free_ecg' || p.id === 'perk-cath-alert'
  );

  // Cost evaluator considering tactical perks
  const getInvestigationEffectiveCost = (type: InvestigationType, baseCost: number) => {
    if (type === 'pocus' && hasPocusFellowship) return 0;
    if (type === 'ecg' && hasFreeEcg) return 0;
    return baseCost;
  };

  const handleOrderInvestigation = (type: InvestigationType, baseCost: number) => {
    const effectiveCost = getInvestigationEffectiveCost(type, baseCost);
    if (currentAP < effectiveCost) {
      audio.playAlarm();
      return;
    }
    if (onRevealInvestigation) {
      onRevealInvestigation(type, effectiveCost);
    } else {
      storeRevealInvestigation(type, effectiveCost);
    }
  };

  const handleSubmitDecision = () => {
    if (!selectedOptionId || submissionResult?.submitted) return;

    const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const result = onSubmitDecision
      ? onSubmitDecision(selectedOptionId, elapsed)
      : storeSubmitDecision(selectedOptionId, elapsed);

    const isDecisionCorrect = result
      ? result.isCorrect
      : (activeFogCase?.decisionOptions.find((o) => o.id === selectedOptionId)?.isCorrect ?? false);

    // Track in centralized gamification state:
    // 1. Difficult question (+20 XP, awarded once per case question ID)
    awardQuestionXP(
      `bed_${activeFogCase.id}`,
      isDecisionCorrect,
      true,
      activeFogCase.title
    );

    // 2. Clinical Case Resolved (+100 XP, awarded once per completed clinical case)
    if (isDecisionCorrect) {
      completeClinicalCase(activeFogCase.id, activeFogCase.title);
    }

    if (result) {
      setSubmissionResult({
        submitted: true,
        isCorrect: result.isCorrect,
        penaltyExplain: result.penaltyExplain,
      });
    } else {
      setSubmissionResult({
        submitted: true,
        isCorrect: isDecisionCorrect,
        penaltyExplain: isDecisionCorrect ? '' : 'Contraindicated intervention.',
      });
    }
  };

  // Check if option is a lethal contraindication trap for Spidey Sense highlight
  const isLethalTrap = (optionId: string) => {
    if (!hasSpideySense) return false;
    if (activeFogCase.id === 'fog-rv-infarct' && optionId === 'opt-nitrates') return true;
    if (activeFogCase.id === 'fog-tension-ptx' && (optionId === 'opt-rsi-peep' || optionId === 'opt-ct-scan')) return true;
    return false;
  };

  const totalMaxAP = activePerks.some((p) => p.effect === 'extra_ap') ? 8 : 6;

  return (
    <div
      id="fog-of-war-cockpit"
      className="flex-1 flex flex-col justify-between p-4 overflow-y-auto space-y-4 pb-20 select-none"
    >
      <div className="space-y-3.5">
        {/* Cockpit Bed Header & Action Point Battery Gauge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold tracking-wider">
              BED {beds[currentBedIndex]?.id}
            </span>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tight">
              Resuscitation Cockpit
            </h2>
          </div>

          {/* Action Point (AP) Battery Gauge */}
          <div
            id="ap-battery-gauge"
            className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl border border-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-amber-300">
                {currentAP} AP
              </span>
            </div>

            {/* Visual Pips Battery */}
            <div className="flex items-center gap-0.5 p-0.5 bg-slate-950 rounded-md border border-slate-800">
              {Array.from({ length: totalMaxAP }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-3 rounded-xs transition-all duration-300 ${
                    i < currentAP
                      ? currentAP <= 2
                        ? 'bg-rose-500 shadow-xs shadow-rose-500'
                        : 'bg-amber-400 shadow-xs shadow-amber-400'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Telemetry Monitor Strip */}
        <div className="bg-slate-950 rounded-2xl p-3 text-white border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10px]">
            <span className="text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              LIVE TELEMETRY MONITOR
            </span>
            <span className="font-mono text-slate-400">
              {activeFogCase.initialVitals.rhythm || 'Continuous Telemetry'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 text-center font-mono">
            <div className="bg-slate-900/90 rounded-lg p-1 border border-slate-800">
              <div className="text-[9px] text-emerald-400 uppercase flex items-center justify-center gap-0.5">
                <Heart className="w-2.5 h-2.5 animate-pulse" /> HR
              </div>
              <div className="text-sm font-bold text-emerald-300">
                {activeFogCase.initialVitals.hr}
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-lg p-1 border border-slate-800">
              <div className="text-[9px] text-amber-400 uppercase">BP</div>
              <div className="text-xs font-bold text-amber-300">
                {activeFogCase.initialVitals.bp}
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-lg p-1 border border-slate-800">
              <div className="text-[9px] text-cyan-400 uppercase flex items-center justify-center gap-0.5">
                <Wind className="w-2.5 h-2.5" /> RR
              </div>
              <div className="text-sm font-bold text-cyan-300">
                {activeFogCase.initialVitals.rr}
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-lg p-1 border border-slate-800">
              <div className="text-[9px] text-blue-400 uppercase flex items-center justify-center gap-0.5">
                <Activity className="w-2.5 h-2.5" /> SpO2
              </div>
              <div className="text-sm font-bold text-blue-300">
                {activeFogCase.initialVitals.spo2}
              </div>
            </div>
          </div>
        </div>

        {/* Patient Demographics Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
            Presentation / Triage HPI
          </div>
          <p className="text-xs text-slate-800 font-medium leading-relaxed">
            {activeFogCase.demographics}
          </p>
        </div>

        {/* 2x2 Investigation Grid with Fog-of-War Blur/Lock */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span>DIAGNOSTIC WORKUP MATRIX</span>
            <span className="text-[10px] text-slate-400 font-normal">
              Spend AP to dispel clinical fog
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {INVESTIGATION_CONFIGS.map((config) => {
              const detail = activeFogCase.investigations[config.type];
              const isRevealed = revealedInvestigations[config.type];
              const effectiveCost = getInvestigationEffectiveCost(config.type, detail.cost);
              const canAfford = currentAP >= effectiveCost;

              return (
                <div
                  key={config.type}
                  id={`investigation-tile-${config.type}`}
                  className={`p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                    isRevealed
                      ? 'bg-slate-50/90 border-slate-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Tile Header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {config.icon}
                        <span className="text-[11px] font-bold text-slate-800 uppercase">
                          {config.type}
                        </span>
                      </div>

                      {isRevealed ? (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded border border-emerald-300">
                          REVEALED
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> FOG
                        </span>
                      )}
                    </div>

                    {/* Tile Content */}
                    {isRevealed ? (
                      <div className="text-[11px] text-slate-700 leading-snug animate-in fade-in duration-200 font-normal space-y-1.5">
                        <div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                            {detail.badge}
                          </div>
                          <p>{detail.data}</p>
                        </div>
                        {config.type === 'exam' && (
                          <button
                            id="btn-fog-auscultate"
                            onClick={() => setShowAuscultationModal(true)}
                            className="w-full text-[10px] font-black py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                          >
                            <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                            <span>Auscultate Chest Sounds</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1 py-1">
                        <div className="text-[11px] text-slate-400 filter blur-[2px] select-none">
                          Clinical diagnostics locked under diagnostic fog. Order finding to
                          unmask telemetry.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Button if Locked */}
                  {!isRevealed && (
                    <div className="pt-2">
                      <button
                        id={`btn-order-${config.type}`}
                        disabled={!canAfford}
                        onClick={() => handleOrderInvestigation(config.type, detail.cost)}
                        className={`w-full text-[10px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 border-b-2 transition-all ${
                          canAfford
                            ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-950 active:border-b-0 active:translate-y-0.5 cursor-pointer shadow-xs'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                        <span>
                          {effectiveCost === 0 ? 'FREE (PERK)' : `REVEAL (${effectiveCost} AP)`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Definitive Decision Section */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span>DEFINITIVE RESUSCITATION DECISION</span>
            <span className="text-[10px] text-slate-400 font-normal">
              Select 1 priority action
            </span>
          </div>

          <div className="space-y-2">
            {activeFogCase.decisionOptions.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const isSubmitted = submissionResult?.submitted;
              const isTrapWarning = isLethalTrap(opt.id);

              let optionStyle =
                'border-slate-200 bg-white hover:border-slate-300 text-slate-800';

              if (isTrapWarning && !isSubmitted) {
                optionStyle =
                  'border-rose-400 bg-rose-50/50 ring-2 ring-rose-400/50 text-slate-900';
              } else if (isSelected && !isSubmitted) {
                optionStyle = 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10';
              }

              if (isSubmitted) {
                if (opt.isCorrect) {
                  optionStyle =
                    'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold ring-1 ring-emerald-400';
                } else if (isSelected && !opt.isCorrect) {
                  optionStyle =
                    'border-rose-500 bg-rose-50/70 text-rose-950 ring-1 ring-rose-400';
                } else {
                  optionStyle = 'border-slate-200 bg-slate-50/40 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  id={`decision-option-${opt.id}`}
                  disabled={isSubmitted}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all flex flex-col gap-1.5 ${optionStyle}`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <div className="flex-1 text-xs leading-relaxed font-medium">
                      {opt.label}
                    </div>
                  </div>

                  {/* Spidey-Sense Trap Warning Tag */}
                  {isTrapWarning && !isSubmitted && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600 pl-6 animate-pulse">
                      <Eye className="w-3 h-3 text-rose-600" />
                      <span>SPIDEY-SENSE: LETHAL CONTRAINDICATION DETECTED</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Immediate Physiological Feedback Drawer */}
        {submissionResult?.submitted && (
          <div
            id="fog-submission-feedback"
            className={`p-4 rounded-2xl text-xs space-y-2 border animate-in fade-in duration-200 shadow-sm ${
              submissionResult.isCorrect
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-rose-50/80 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {submissionResult.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>
                {submissionResult.isCorrect
                  ? 'Hemodynamic Stabilization Achieved (+50 XP, +2% Trust)'
                  : 'Catastrophic Resuscitation Collapse (-6% Attending Trust)'}
              </span>
            </div>

            {!submissionResult.isCorrect && (
              <div className="text-xs font-medium text-rose-900 bg-rose-100/70 p-2.5 rounded-xl border border-rose-200 leading-snug">
                <span className="font-bold uppercase text-[10px] block text-rose-700 mb-0.5">
                  Pathophysiology of Failure:
                </span>
                {submissionResult.penaltyExplain}
              </div>
            )}

            <div className="pt-1 text-[11px] text-slate-800 leading-relaxed border-t border-slate-200/60">
              <span className="font-bold text-slate-900 uppercase tracking-wide">
                Chief Attending Pearl:
              </span>{' '}
              {activeFogCase.clinicalPearl}
            </div>
          </div>
        )}
      </div>

      {/* Cockpit Footer Action Controls */}
      <div className="pt-2 pb-1">
        {!submissionResult?.submitted ? (
          <button
            id="btn-execute-intervention"
            disabled={!selectedOptionId}
            onClick={handleSubmitDecision}
            className={`w-full font-bold py-4 px-6 rounded-2xl border-b-4 transition-all flex items-center justify-center gap-2 shadow-md ${
              selectedOptionId
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-800 active:border-b-0 active:translate-y-1 shadow-rose-600/20'
                : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
            }`}
          >
            <span>EXECUTE RESUSCITATION ORDER</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="btn-advance-fog-bed"
            onClick={onAdvanceBed || storeAdvanceBed}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 px-6 rounded-2xl border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 cursor-pointer"
          >
            <span>CONCLUDE BED & ADVANCE SHIFT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tactile Bedside Auscultation Modal */}
      <ClinicalAuscultationModal
        isOpen={showAuscultationModal}
        onClose={() => setShowAuscultationModal(false)}
        patientScenarioTitle={`Bed ${bedNumber || currentBedIndex + 1}: ${activeFogCase.demographics}`}
      />
    </div>
  );
};
