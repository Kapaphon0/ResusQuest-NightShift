import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Heart,
  Wind,
  Brain,
  Thermometer,
  RotateCcw,
  Volume2,
  VolumeX,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { Patient, ClinicalStatusLevel } from '../../types/nightShift';
import { audio } from '../../utils/audio';

interface PatientStateDisplayProps {
  patient: Patient;
  onReassess?: () => void;
}

export const PatientStateDisplay: React.FC<PatientStateDisplayProps> = ({
  patient,
  onReassess,
}) => {
  const { vitals, statusLevel } = patient;
  const [isCyclingNIBP, setIsCyclingNIBP] = useState(false);
  const [lastCycleTime, setLastCycleTime] = useState<string>('Just now');
  const [prevVitals, setPrevVitals] = useState(vitals);
  const [vitalDeltas, setVitalDeltas] = useState<{
    hr?: number;
    spo2?: number;
    bpChanged?: boolean;
  }>({});

  // Detect vital sign changes and compute delta trends
  useEffect(() => {
    const hrDelta = vitals.hr - prevVitals.hr;
    const spo2Delta = vitals.spo2 - prevVitals.spo2;
    const bpChanged = vitals.bp !== prevVitals.bp;

    if (hrDelta !== 0 || spo2Delta !== 0 || bpChanged) {
      setVitalDeltas({
        hr: hrDelta !== 0 ? hrDelta : undefined,
        spo2: spo2Delta !== 0 ? spo2Delta : undefined,
        bpChanged,
      });

      // Clear delta highlight after 6 seconds
      const timer = setTimeout(() => {
        setVitalDeltas({});
      }, 6000);

      setPrevVitals(vitals);
      return () => clearTimeout(timer);
    }
  }, [vitals, prevVitals]);

  // Calculate Mean Arterial Pressure (MAP)
  const bpParts = vitals.bp.split('/').map((n) => parseInt(n.trim(), 10));
  const sys = isNaN(bpParts[0]) ? 120 : bpParts[0];
  const dia = isNaN(bpParts[1]) ? 80 : bpParts[1];
  const map = Math.round(dia + (sys - dia) / 3);
  const isHypotensive = map < 65 && vitals.hr > 0;
  const isArrest = vitals.hr === 0 || statusLevel === 'arrest';

  // Rhythm classification and waveform profile
  const rhythmName = (vitals.rhythm || 'Sinus Rhythm').toUpperCase();
  const isTachy = vitals.hr > 110;
  const isBrady = vitals.hr > 0 && vitals.hr < 60;
  const isHypoxemic = vitals.spo2 < 92;

  // Manual NIBP Cycle trigger
  const handleCycleNIBP = () => {
    if (isCyclingNIBP) return;
    setIsCyclingNIBP(true);
    audio.playTelemetryClick();

    setTimeout(() => {
      setIsCyclingNIBP(false);
      setLastCycleTime('Just now');
      if (onReassess) {
        onReassess();
      }
    }, 1200);
  };

  // Status classification badge (100% sterile, no emojis)
  const getStatusBadge = (status: ClinicalStatusLevel) => {
    switch (status) {
      case 'arrest':
        return {
          label: 'CARDIAC ARREST',
          style: 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse',
        };
      case 'peri_arrest':
        return {
          label: 'PERI-ARREST CRASH',
          style: 'bg-rose-600 text-white border-rose-700 animate-pulse',
        };
      case 'critical':
        return {
          label: 'CRITICAL UNSTABLE',
          style: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
        };
      case 'concerning':
        return {
          label: 'CONCERNING DETERIORATION',
          style: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
        };
      default:
        return {
          label: 'STABLE PERFUSION',
          style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
        };
    }
  };

  const statusBadge = getStatusBadge(statusLevel);

  // Dynamic ECG Waveform SVG path generator based on rhythm & HR
  const renderECGPath = () => {
    if (isArrest) {
      return 'M0,25 L400,25'; // Asystole flatline
    }

    if (rhythmName.includes('VFIB') || rhythmName.includes('VENTRICULAR FIBRILLATION')) {
      // Chaotic fibrillatory wave
      return 'M0,25 Q20,5 40,35 T80,15 T120,40 T160,10 T200,38 T240,12 T280,36 T320,8 T360,42 T400,25';
    }

    if (isTachy) {
      // Rapid QRS complexes
      return 'M0,25 L15,25 L20,10 L25,45 L30,18 L35,28 L50,25 L65,25 L70,10 L75,45 L80,18 L85,28 L100,25 L115,25 L120,10 L125,45 L130,18 L135,28 L150,25 L165,25 L170,10 L175,45 L180,18 L185,28 L200,25 L215,25 L220,10 L225,45 L230,18 L235,28 L250,25 L265,25 L270,10 L275,45 L280,18 L285,28 L300,25 L315,25 L320,10 L325,45 L330,18 L335,28 L350,25 L365,25 L370,10 L375,45 L380,18 L385,28 L400,25';
    }

    // Normal Sinus / Standard paced complexes
    return 'M0,25 L35,25 L40,22 L45,25 L50,25 L55,5 L60,48 L65,18 L70,25 L80,20 L90,25 L135,25 L140,22 L145,25 L150,25 L155,5 L160,48 L165,18 L170,25 L180,20 L190,25 L235,25 L240,22 L245,25 L250,25 L255,5 L260,48 L265,18 L270,25 L280,20 L290,25 L335,25 L340,22 L345,25 L350,25 L355,5 L360,48 L365,18 L370,25 L380,20 L390,25 L400,25';
  };

  // Plethysmograph Waveform (SpO2)
  const renderPlethPath = () => {
    if (isArrest || vitals.spo2 === 0) {
      return 'M0,20 L400,20';
    }
    // Pulsatile dicrotic notch wave
    return 'M0,20 Q20,2 35,6 Q45,16 55,14 Q65,12 80,20 M80,20 Q100,2 115,6 Q125,16 135,14 Q145,12 160,20 M160,20 Q180,2 195,6 Q205,16 215,14 Q225,12 240,20 M240,20 Q260,2 275,6 Q285,16 295,14 Q305,12 320,20 M320,20 Q340,2 355,6 Q365,16 375,14 Q385,12 400,20';
  };

  return (
    <div
      id="patient-monitor-unit"
      className="bg-slate-950 text-white rounded-3xl border-2 border-slate-800 shadow-2xl overflow-hidden select-none"
    >
      {/* 1. Bedside Monitor Header & Patient Demographics */}
      <div className="bg-slate-900/90 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 font-mono text-xs font-black text-rose-400">
              BED {patient.bedNumber}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white tracking-tight">
                {patient.name}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                {patient.age}Y • {patient.sex.toUpperCase()}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[200px]">
              {patient.chiefComplaint}
            </span>
          </div>
        </div>

        {/* Clinical Acuity / Status Badge */}
        <div className="flex flex-col items-end gap-1">
          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusBadge.style}`}
          >
            {statusBadge.label}
          </span>
          <span className="text-[9px] font-mono text-slate-500 font-bold">
            MONITOR CH-1 • ONLINE
          </span>
        </div>
      </div>

      {/* 2. Real-Time Telemetry Waveforms (ECG Lead II + SpO2 Pleth) */}
      <div className="p-3 space-y-2 bg-slate-950/80">
        {/* Lead II Rhythm Waveform */}
        <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 mb-1">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-bold">LEAD II: {rhythmName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[9px]">
              <span>25 mm/s</span>
              <span>10 mm/mV</span>
              <span className="text-emerald-400/80 font-bold">CAL: 1.0mV</span>
            </div>
          </div>

          {/* Oscilloscope ECG Strip */}
          <div className="h-11 w-full overflow-hidden flex items-center relative">
            <svg
              className={`w-full h-9 stroke-current fill-none stroke-2 ${
                isArrest ? 'text-rose-500' : 'text-emerald-400'
              }`}
              viewBox="0 0 400 50"
              preserveAspectRatio="none"
            >
              <path d={renderECGPath()} />
            </svg>
            {/* Live Waveform Sweep Light Bar */}
            <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent pointer-events-none animate-pulse" />
          </div>
        </div>

        {/* Plethysmograph Waveform (SpO2 Cyan Trace) */}
        <div className="bg-slate-900/40 px-2.5 py-1.5 rounded-xl border border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-sky-400">
            <Radio className="w-3 h-3 text-sky-400 animate-pulse" />
            <span>PLETH (SpO₂ TRACE)</span>
          </div>

          <div className="h-6 w-44 overflow-hidden flex items-center">
            <svg
              className="w-full h-5 text-sky-400 stroke-current fill-none stroke-2 opacity-80"
              viewBox="0 0 400 25"
              preserveAspectRatio="none"
            >
              <path d={renderPlethPath()} />
            </svg>
          </div>

          <span className="text-[9px] font-mono text-slate-400">PI: 4.2%</span>
        </div>
      </div>

      {/* 3. Physiological Parameters Digital Grid */}
      <div className="grid grid-cols-4 gap-2 p-3 pt-0 text-center font-mono">
        {/* Heart Rate (Green Channel) */}
        <div
          className={`p-2 rounded-2xl border transition-all ${
            vitalDeltas.hr !== undefined
              ? 'bg-emerald-950/50 border-emerald-400 ring-2 ring-emerald-500/30'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-[9px] font-black uppercase text-emerald-400">
            <div className="flex items-center gap-1">
              <Heart
                className={`w-3 h-3 text-emerald-400 ${
                  vitals.hr > 0 ? 'fill-emerald-400 animate-pulse' : ''
                }`}
              />
              <span>HR</span>
            </div>
            <span className="text-[8px] text-slate-500 font-normal">50-120</span>
          </div>

          <div
            className={`text-xl font-black mt-0.5 tracking-tight ${
              isArrest
                ? 'text-rose-500 animate-pulse'
                : isTachy || isBrady
                ? 'text-rose-400'
                : 'text-emerald-400'
            }`}
          >
            {vitals.hr}
          </div>

          <div className="text-[9px] text-slate-400 flex items-center justify-center gap-1">
            <span>bpm</span>
            {vitalDeltas.hr !== undefined && (
              <span
                className={`text-[9px] font-black flex items-center ${
                  vitalDeltas.hr > 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {vitalDeltas.hr > 0 ? (
                  <ArrowUpRight className="w-2.5 h-2.5" />
                ) : (
                  <ArrowDownRight className="w-2.5 h-2.5" />
                )}
                {Math.abs(vitalDeltas.hr)}
              </span>
            )}
          </div>
        </div>

        {/* NIBP (White Channel with Critical MAP) */}
        <div
          className={`p-2 rounded-2xl border transition-all ${
            isHypotensive
              ? 'bg-rose-950/60 border-rose-500 animate-pulse'
              : vitalDeltas.bpChanged
              ? 'bg-slate-800 border-slate-500 ring-2 ring-slate-400/30'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-300">
            <span>NIBP</span>
            <span
              className={`text-[8px] font-bold ${
                isHypotensive ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              MAP ({map})
            </span>
          </div>

          <div
            className={`text-sm font-black mt-1 tracking-tight leading-tight ${
              isHypotensive ? 'text-rose-400 font-extrabold' : 'text-white'
            }`}
          >
            {isCyclingNIBP ? (
              <span className="text-amber-400 text-xs animate-pulse">CYCLING...</span>
            ) : (
              vitals.bp
            )}
          </div>

          <div className="text-[8px] text-slate-400 mt-1">
            {isHypotensive ? (
              <span className="text-rose-400 font-bold uppercase">SHOCK</span>
            ) : (
              <span>mmHg</span>
            )}
          </div>
        </div>

        {/* SpO2 (Cyan Channel) */}
        <div
          className={`p-2 rounded-2xl border transition-all ${
            vitalDeltas.spo2 !== undefined
              ? 'bg-sky-950/50 border-sky-400 ring-2 ring-sky-500/30'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-[9px] font-black uppercase text-sky-400">
            <div className="flex items-center gap-1">
              <Wind className="w-3 h-3 text-sky-400" />
              <span>SpO₂</span>
            </div>
            <span className="text-[8px] text-slate-500 font-normal">&gt;94%</span>
          </div>

          <div
            className={`text-xl font-black mt-0.5 tracking-tight ${
              isHypoxemic ? 'text-rose-400 animate-pulse' : 'text-sky-400'
            }`}
          >
            {vitals.spo2}
            <span className="text-xs font-normal ml-0.5">%</span>
          </div>

          <div className="text-[9px] text-slate-400 flex items-center justify-center gap-1">
            <span>O₂ SAT</span>
            {vitalDeltas.spo2 !== undefined && (
              <span
                className={`text-[9px] font-black flex items-center ${
                  vitalDeltas.spo2 > 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {vitalDeltas.spo2 > 0 ? (
                  <ArrowUpRight className="w-2.5 h-2.5" />
                ) : (
                  <ArrowDownRight className="w-2.5 h-2.5" />
                )}
                {Math.abs(vitalDeltas.spo2)}%
              </span>
            )}
          </div>
        </div>

        {/* RR / GCS (Amber / Purple Channel) */}
        <div className="p-2 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[9px] font-black uppercase text-amber-400">
            <span>RR / GCS</span>
          </div>

          <div className="flex items-center justify-around mt-0.5">
            <div>
              <span className="text-xs font-black text-amber-300 block">
                {vitals.rr || 16}
              </span>
              <span className="text-[8px] text-slate-500">RR/m</span>
            </div>

            <div className="h-5 w-px bg-slate-800" />

            <div>
              <span
                className={`text-xs font-black block ${
                  vitals.gcs <= 8 ? 'text-rose-400' : 'text-purple-300'
                }`}
              >
                {vitals.gcs}/15
              </span>
              <span className="text-[8px] text-slate-500">GCS</span>
            </div>
          </div>

          <div className="text-[8px] text-slate-400">
            {vitals.temp || '37.0'}°C
          </div>
        </div>
      </div>

      {/* 4. Critical Warning & NIBP Cycle Action Footer */}
      <div className="bg-slate-900 px-3.5 py-2 border-t border-slate-800 flex items-center justify-between text-xs">
        {/* Shock / Arrest Alert or Baseline Info */}
        <div className="flex items-center gap-2">
          {isArrest ? (
            <div className="flex items-center gap-1 text-rose-400 font-black uppercase text-[10px] animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>PULSELESS ARREST: INITIATE CPR & DEFIB PROTOCOL</span>
            </div>
          ) : isHypotensive ? (
            <div className="flex items-center gap-1 text-rose-400 font-bold text-[10px] animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>CRITICAL HYPOTENSION: MAP &lt; 65 mmHg</span>
            </div>
          ) : isHypoxemic ? (
            <div className="flex items-center gap-1 text-amber-400 font-bold text-[10px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>HYPOXEMIC DESATURATION: O₂ ESCALATION REQUIRED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Telemetry Synced • Last NIBP: {lastCycleTime}</span>
            </div>
          )}
        </div>

        {/* Tactile Cycle NIBP Button */}
        <button
          onClick={handleCycleNIBP}
          disabled={isCyclingNIBP}
          className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border-b-2 active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5 ${
            isCyclingNIBP
              ? 'bg-slate-800 text-slate-500 border-slate-900 cursor-not-allowed'
              : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-800'
          }`}
        >
          <RotateCcw className={`w-3 h-3 ${isCyclingNIBP ? 'animate-spin' : ''}`} />
          <span>{isCyclingNIBP ? 'Cycling...' : 'Cycle NIBP'}</span>
        </button>
      </div>
    </div>
  );
};
