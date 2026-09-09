import React from 'react';
import {
  Heart,
  AlertTriangle,
  User,
  Activity,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { Patient, ClinicalAcuity } from '../../types/nightShift';
import { useNightShiftStore } from '../../store/useNightShiftStore';
import { audio } from '../../utils/audio';

interface MultiplePatientManagerProps {
  patients: Patient[];
  selectedIndex: number;
  onSelectBed: (index: number) => void;
  onPrioritize: (index: number) => void;
}

export const MultiplePatientManager: React.FC<MultiplePatientManagerProps> = ({
  patients,
  selectedIndex,
  onSelectBed,
  onPrioritize,
}) => {
  const getAcuityBadge = (acuity: ClinicalAcuity, isMystery: boolean) => {
    if (isMystery) {
      return {
        label: 'MYSTERY',
        color: 'bg-purple-100 text-purple-700 border-purple-300',
      };
    }
    switch (acuity) {
      case 5:
        return {
          label: 'ARREST',
          color: 'bg-slate-900 text-rose-400 border-rose-600 animate-pulse',
        };
      case 4:
        return {
          label: 'CRITICAL',
          color: 'bg-rose-100 text-rose-700 border-rose-300 animate-pulse',
        };
      case 3:
        return {
          label: 'HIGH ACUITY',
          color: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 2:
        return {
          label: 'COMPLEX',
          color: 'bg-blue-100 text-blue-700 border-blue-300',
        };
      default:
        return {
          label: 'ROUTINE',
          color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
        };
    }
  };

  const getStatusDot = (status: Patient['statusLevel']) => {
    switch (status) {
      case 'arrest':
      case 'peri_arrest':
        return 'bg-rose-600 animate-ping';
      case 'critical':
        return 'bg-rose-500 animate-pulse';
      case 'concerning':
        return 'bg-amber-500';
      default:
        return 'bg-emerald-500';
    }
  };

  return (
    <div className="bg-slate-100/90 p-3 border-b border-slate-200 select-none space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-rose-600" />
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
            Emergency Roster ({patients.length} Active Beds)
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-bold">
          Tap a bed to inspect or prioritize
        </span>
      </div>

      {/* Horizontal Bed Tabs */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
        {patients.map((patient, idx) => {
          const isSelected = selectedIndex === idx;
          const badge = getAcuityBadge(patient.acuity, patient.isMystery);
          const statusDot = getStatusDot(patient.statusLevel);
          const hasDeteriorated = patient.hasDeterioratedRecently;

          return (
            <div
              key={patient.id}
              onClick={() => onSelectBed(idx)}
              className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-rose-500 shadow-md ring-2 ring-rose-500/15'
                  : 'bg-white/80 hover:bg-white border-slate-200 shadow-xs'
              } ${hasDeteriorated ? 'ring-2 ring-rose-500 animate-pulse' : ''}`}
            >
              {/* Bed Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ${
                      isSelected
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    B{patient.bedNumber}
                  </span>
                  <div>
                    <span className="text-xs font-black text-slate-900 block leading-tight truncate max-w-[100px]">
                      {patient.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      {patient.age}y {patient.sex.charAt(0)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                    <span className="text-[9px] font-black uppercase text-slate-600">
                      {patient.statusLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chief Complaint Preview */}
              <div className="pt-2 text-[10px] text-slate-600 font-medium line-clamp-1">
                "{patient.chiefComplaint}"
              </div>

              {/* Live Vitals Telemetry Snippet */}
              <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-700">
                <span>HR: {patient.vitals.hr}</span>
                <span>BP: {patient.vitals.bp}</span>
                <span
                  className={
                    patient.vitals.spo2 < 90
                      ? 'text-rose-600 font-bold'
                      : 'text-slate-600'
                  }
                >
                  O2: {patient.vitals.spo2}%
                </span>
              </div>

              {/* Warning Alert Banner for Deteriorating Bed */}
              {hasDeteriorated && (
                <div className="mt-1.5 p-1 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-1 text-[9px] font-bold text-rose-700">
                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                  <span className="truncate">Acute Hemodynamic Instability</span>
                </div>
              )}

              {/* Quick Prioritize Button if not selected */}
              {!isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrioritize(idx);
                  }}
                  className="mt-2 py-1 px-2 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-[10px] font-black uppercase tracking-wider transition-colors border border-slate-200 cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Prioritize Bed {patient.bedNumber}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
