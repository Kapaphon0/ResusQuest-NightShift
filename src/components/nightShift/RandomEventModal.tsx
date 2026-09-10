import React from 'react';
import { AlertTriangle, Ambulance, PhoneCall, Flame, Coffee, CheckCircle, Zap } from 'lucide-react';
import { ShiftEvent } from '../../types/nightShift';
interface RandomEventModalProps {
  event: ShiftEvent;
  currentAP: number;
  onResolve: (choiceId: string) => void;
}
export const RandomEventModal: React.FC<RandomEventModalProps> = ({
  event,
  currentAP,
  onResolve,
}) => {
  const getEventIcon = (type: ShiftEvent['type']) => {
    switch (type) {
      case 'ambulance_arrival':
        return <Ambulance className="w-6 h-6 text-rose-600 animate-bounce" />;
      case 'cardiac_arrest':
      case 'trauma_alert':
      case 'mass_casualty':
        return <Flame className="w-6 h-6 text-rose-600 animate-pulse" />;
      case 'quiet_period':
        return <Coffee className="w-6 h-6 text-amber-500" />;
      case 'specialist_call':
        return <PhoneCall className="w-6 h-6 text-blue-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
    }
  };

  const getUrgencyBadge = (urgency: ShiftEvent['urgency']) => {
    switch (urgency) {
      case 'critical':
        return 'bg-rose-600 text-white animate-pulse';
      case 'urgent':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl border-2 border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Urgent Header */}
        <div className="bg-slate-900 text-white p-4 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                {getEventIcon(event.type)}
              </div>
              <div>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${getUrgencyBadge(
                    event.urgency
                  )}`}
                >
                  {event.urgency} PRIORITY
                </span>
                <h3 className="text-sm font-black text-white pt-1">{event.title}</h3>
              </div>
            </div>

            <span className="text-[10px] font-mono text-slate-400 font-bold">
              SURGE PROTOCOL
            </span>
          </div>
        </div>

        {/* Narrative Scenario Description */}
        <div className="p-4 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed">
            {event.description}
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block px-1">
              Select Immediate Clinical Directive
            </span>

            {/* Action Choices */}
            <div className="space-y-2">
              {event.choices.map((choice) => {
                const cost = choice.actionCostAP || 0;
                const canAfford = currentAP >= cost;

                return (
                  <button
                    key={choice.id}
                    disabled={!canAfford}
                    onClick={() => {
                      onResolve(choice.id);
                    }}
                    className={`w-full p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      canAfford
                        ? 'bg-white hover:bg-rose-50/50 border-slate-200 hover:border-rose-400 active:scale-[0.98]'
                        : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-slate-900 block">
                        {choice.label}
                      </span>
                      {cost > 0 && (
                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                          Costs {cost} AP
                        </span>
                      )}
                    </div>

                    <div className="shrink-0 text-slate-400">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
