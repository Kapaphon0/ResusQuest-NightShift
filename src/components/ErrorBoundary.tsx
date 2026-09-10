import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Trash2, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  clearedCache: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      clearedCache: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught a clinical rendering exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRestart = () => {
    window.location.reload();
  };

  handleClearShiftCache = () => {
    try {
      window.localStorage.removeItem('resus_shift_state_v1');
      window.localStorage.removeItem('resus_shift_civilian_mode');
      this.setState({ clearedCache: true });
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (e) {
      console.error('Failed to clear shift cache from localStorage:', e);
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          id="error-boundary-fallback"
          className="flex-1 w-full min-h-[500px] flex flex-col items-center justify-center p-6 bg-slate-900 text-slate-100 rounded-3xl select-none"
        >
          {/* Pulsing Clinical Alert Icon */}
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center shadow-lg shadow-rose-900/40">
              <AlertOctagon className="w-9 h-9 text-rose-500 animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-full text-slate-950">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Warning Badge */}
          <div
            id="badge-telemetry-interrupted"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[11px] font-black tracking-widest uppercase mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>SIMULATOR TELEMETRY INTERRUPTED</span>
          </div>

          {/* Explanatory Context */}
          <h2 className="text-lg font-black text-center text-white tracking-tight mb-2">
            Clinical Rendering Anomaly
          </h2>
          <p className="text-xs text-center text-slate-400 max-w-xs leading-relaxed mb-6 font-medium">
            A clinical rendering anomaly occurred. No user profile progress was lost.
          </p>

          {/* Technical Diagnostics Summary (Collapsed / Subdued) */}
          {this.state.error && (
            <div className="w-full max-w-xs bg-slate-950/70 border border-slate-800 rounded-xl p-3 mb-6 font-mono text-[10px] text-slate-400 overflow-x-auto">
              <p className="text-rose-400 font-bold mb-1 truncate">
                {this.state.error.name}: {this.state.error.message}
              </p>
              <p className="text-slate-600 text-[9px] uppercase tracking-wider">
                Telemetry Log Stored
              </p>
            </div>
          )}

          {/* Action Controls */}
          <div className="w-full max-w-xs flex flex-col gap-3">
            {/* Primary 3D Red Button */}
            <button
              id="btn-restart-console"
              onClick={this.handleRestart}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTART RESUSCITATION CONSOLE</span>
            </button>

            {/* Secondary Cache Clear Button */}
            <button
              id="btn-clear-shift-cache"
              onClick={this.handleClearShiftCache}
              disabled={this.state.clearedCache}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 active:bg-slate-850 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl border-b-2 border-slate-700 active:border-b-0 active:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {this.state.clearedCache
                  ? 'SHIFT CACHE CLEARED — RELOADING...'
                  : 'RESET LOCAL SHIFT CACHE'}
              </span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
