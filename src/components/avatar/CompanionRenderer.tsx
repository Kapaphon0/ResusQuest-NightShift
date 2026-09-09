import React, { useState } from 'react';
import { CompanionId } from '../../types/avatar';
import { COMPANIONS_CATALOG } from '../../data/companionsData';
import { audio } from '../../utils/audio';

interface CompanionRendererProps {
  companionId: CompanionId;
  size?: 'sm' | 'md' | 'lg';
  showSpeech?: boolean;
  speechText?: string;
  contextMode?: 'idle' | 'correct' | 'criticalVitals' | 'levelUp';
  className?: string;
  onClick?: () => void;
}

export const CompanionRenderer: React.FC<CompanionRendererProps> = ({
  companionId,
  size = 'md',
  showSpeech = false,
  speechText,
  contextMode = 'idle',
  className = '',
  onClick,
}) => {
  if (companionId === 'none') return null;

  const info = COMPANIONS_CATALOG[companionId];
  if (!info) return null;

  const [localQuoteIndex, setLocalQuoteIndex] = useState(0);

  const sizePixels = {
    sm: 36,
    md: 56,
    lg: 84,
  }[size];

  const handleCompanionClick = () => {
    audio.playTelemetryClick();
    const quotesList = info.quotes[contextMode] || info.quotes.idle;
    setLocalQuoteIndex((prev) => (prev + 1) % quotesList.length);
    if (onClick) onClick();
  };

  const currentQuote =
    speechText ||
    info.quotes[contextMode]?.[localQuoteIndex] ||
    info.quotes.idle[0];

  return (
    <div
      className={`relative inline-flex items-center group cursor-pointer select-none ${className}`}
      onClick={handleCompanionClick}
      title={`${info.name} (${info.title}) • Click to hear guidance`}
    >
      {/* Speech Bubble Tooltip / Floating Dialogue */}
      {showSpeech && (
        <div
          id={`companion-speech-${companionId}`}
          className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-2xl shadow-xl border border-slate-700 z-30 pointer-events-none animate-bounce"
        >
          <span>{currentQuote}</span>
          {/* Arrow */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700" />
        </div>
      )}

      {/* SVG Companion Art */}
      <div
        style={{ width: sizePixels, height: sizePixels }}
        className="relative transition-transform duration-300 group-hover:scale-110"
      >
        {companionId === 'pulse' && (
          <svg viewBox="0 0 60 60" className="w-full h-full drop-shadow-md">
            {/* Ambient Monitor Glow */}
            <circle cx="30" cy="30" r="28" fill="#0284C7" fillOpacity="0.15" />
            {/* Monitor Shell */}
            <rect x="8" y="10" width="44" height="38" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
            {/* Screen */}
            <rect x="12" y="14" width="36" height="26" rx="4" fill="#022C22" stroke="#059669" strokeWidth="1" />
            {/* Animated ECG Waveform on screen */}
            <path
              d="M14 27 L20 27 L23 20 L26 34 L29 24 L32 27 L44 27"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Pulsing LED in top right */}
            <circle cx="43" cy="18" r="2" fill="#34D399" className="animate-ping" />
            <circle cx="43" cy="18" r="2" fill="#10B981" />
            {/* Cute Little Monitor Stand */}
            <path d="M24 48 L36 48 L34 52 L26 52 Z" fill="#334155" />
          </svg>
        )}

        {companionId === 'echo' && (
          <svg viewBox="0 0 60 60" className="w-full h-full drop-shadow-md">
            {/* Acoustic Beam Spread Fan */}
            <path
              d="M30 20 L10 50 A30 30 0 0 0 50 50 Z"
              fill="#A855F7"
              fillOpacity="0.25"
              stroke="#C084FC"
              strokeWidth="1"
            />
            {/* Ultrasonic Probe Head */}
            <rect x="22" y="6" width="16" height="20" rx="4" fill="#1E1B4B" stroke="#9333EA" strokeWidth="2" />
            <rect x="24" y="22" width="12" height="4" rx="2" fill="#C084FC" />
            {/* Probe Cord */}
            <path d="M30 6 Q34 2 38 4" stroke="#64748B" strokeWidth="2.5" fill="none" />
            {/* Probe Eyes */}
            <circle cx="27" cy="14" r="2" fill="#FFFFFF" />
            <circle cx="27" cy="14" r="1" fill="#0F172A" />
            <circle cx="33" cy="14" r="2" fill="#FFFFFF" />
            <circle cx="33" cy="14" r="1" fill="#0F172A" />
          </svg>
        )}

        {companionId === 'rhythm' && (
          <svg viewBox="0 0 60 60" className="w-full h-full drop-shadow-md">
            {/* ECG Paper Strip body */}
            <rect x="8" y="16" width="44" height="28" rx="6" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
            {/* Grid lines */}
            <line x1="8" y1="23" x2="52" y2="23" stroke="#EAB308" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="8" y1="30" x2="52" y2="30" stroke="#EAB308" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="8" y1="37" x2="52" y2="37" stroke="#EAB308" strokeWidth="0.8" strokeDasharray="2 2" />
            {/* ECG Spark Rhythm */}
            <path
              d="M12 30 L20 30 L23 21 L26 38 L29 27 L33 30 L48 30"
              fill="none"
              stroke="#DC2626"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Eyes */}
            <circle cx="22" cy="12" r="4" fill="#FFFFFF" stroke="#CA8A04" strokeWidth="1.5" />
            <circle cx="23" cy="12" r="2" fill="#0F172A" />
            <circle cx="38" cy="12" r="4" fill="#FFFFFF" stroke="#CA8A04" strokeWidth="1.5" />
            <circle cx="37" cy="12" r="2" fill="#0F172A" />
          </svg>
        )}

        {companionId === 'clot' && (
          <svg viewBox="0 0 60 60" className="w-full h-full drop-shadow-md">
            {/* Biconcave Red Blood Cell Disc */}
            <ellipse cx="30" cy="30" rx="22" ry="18" fill="#DC2626" stroke="#991B1B" strokeWidth="2.5" />
            {/* Central Pallor Dimple */}
            <ellipse cx="30" cy="30" rx="12" ry="9" fill="#EF4444" />
            {/* Happy Eyes */}
            <circle cx="24" cy="28" r="2.5" fill="#FFFFFF" />
            <circle cx="24" cy="28" r="1.3" fill="#0F172A" />
            <circle cx="36" cy="28" r="2.5" fill="#FFFFFF" />
            <circle cx="36" cy="28" r="1.3" fill="#0F172A" />
            {/* Smile */}
            <path d="M26 34 Q30 38 34 34" stroke="#7F1D1D" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {/* Mini Stethoscope Loop */}
            <path d="M18 24 Q30 46 42 24" fill="none" stroke="#64748B" strokeWidth="1.8" />
            <circle cx="30" cy="40" r="3" fill="#94A3B8" stroke="#0F172A" strokeWidth="1" />
          </svg>
        )}

        {companionId === 'lumi' && (
          <svg viewBox="0 0 60 60" className="w-full h-full drop-shadow-md">
            {/* Rotating Beacon Aura */}
            <circle cx="30" cy="26" r="22" fill="#F59E0B" fillOpacity="0.2" className="animate-pulse" />
            {/* Beacon Base */}
            <rect x="18" y="38" width="24" height="12" rx="4" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
            {/* Dome Lens */}
            <path
              d="M20 38 C20 20 40 20 40 38 Z"
              fill="#F59E0B"
              stroke="#D97706"
              strokeWidth="2"
            />
            {/* Inner Reflector Bulb */}
            <circle cx="30" cy="28" r="5" fill="#FEF3C7" />
            {/* Friendly Beacon Eyes */}
            <circle cx="27" cy="26" r="1.8" fill="#78350F" />
            <circle cx="33" cy="26" r="1.8" fill="#78350F" />
            <path d="M28 31 Q30 33 32 31" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
        )}
      </div>
    </div>
  );
};
