import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { useShiftStore } from '../store/useShiftStore';
import { PROTOCOLS } from '../data/protocols';

export const LearnTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('proto-rv-infarct');

  const { ankiQueueIds, addToAnkiQueue, removeFromAnkiQueue } = useShiftStore();

  const filtered = PROTOCOLS.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pitfall.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.protocol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div
      id="learn-tab-container"
      className="flex-1 flex flex-col justify-between p-4 overflow-y-auto space-y-5 pb-24 select-none bg-slate-50"
    >
      <div className="space-y-4">
        {/* Centered Typography Header */}
        <div className="w-full bg-white rounded-3xl p-5 shadow-md border-2 border-slate-200 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 mx-auto">
            <BookOpen className="w-3.5 h-3.5 text-rose-600" />
            <span>RESUSCITATION CLINICAL ATLAS</span>
          </div>

          <h1 className="text-base sm:text-lg font-black text-slate-900 text-center uppercase tracking-tight">
            HIGH-YIELD EM PROTOCOLS
          </h1>

          <p className="text-xs text-slate-500 text-center leading-relaxed mx-auto max-w-sm">
            Evidence-based ACLS / ATLS resuscitation sequences and critical diagnostic traps.
          </p>
        </div>

        {/* Search & Category Filter (Centered Layout) */}
        <div className="space-y-2.5 max-w-md mx-auto w-full">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-learn-search"
              type="text"
              placeholder="Search protocols, traps, medications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['ALL', 'CARDIAC', 'TRAUMA', 'TOX', 'PULMONARY'].map((cat) => (
              <button
                key={cat}
                id={`filter-cat-${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Protocols List */}
        <div className="space-y-3">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const isInAnki = ankiQueueIds.includes(item.id);

            return (
              <div
                key={item.id}
                id={`protocol-card-${item.id}`}
                className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-xs transition-all"
              >
                {/* Clickable Card Header with Centered Typography */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-4 flex flex-col items-center text-center cursor-pointer hover:bg-slate-50/80 transition-colors space-y-1.5 relative"
                >
                  {/* Category Pill */}
                  <div className="flex justify-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                      {item.category}
                    </span>
                  </div>

                  {/* Centered High-Contrast Title */}
                  <h2 className="text-sm font-black text-slate-900 text-center uppercase tracking-tight">
                    {item.title}
                  </h2>

                  {/* Centered Subtitle with comfortable line-height */}
                  <p className="text-xs text-slate-500 text-center leading-relaxed mx-auto max-w-sm">
                    {item.subtitle}
                  </p>

                  {/* Expand Chevron */}
                  <div className="pt-1 flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-600">
                    <span>{isExpanded ? 'Hide Protocol' : 'Inspect Protocol'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Protocol Details */}
                {isExpanded && (
                  <div className="p-4 pt-2 border-t border-slate-100 space-y-3.5 animate-in fade-in duration-150">
                    {/* Presentation Box */}
                    <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center space-y-1">
                      <span className="font-black text-slate-900 text-center uppercase tracking-tight text-[10px] block">
                        CLINICAL PRESENTATION
                      </span>
                      <p className="text-xs leading-relaxed max-w-md mx-auto text-slate-700">
                        {item.presentation}
                      </p>
                    </div>

                    {/* Critical Pitfall & Trap Box */}
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-1.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-black text-[10px] uppercase text-rose-700 tracking-wider">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>CRITICAL PITFALL & LETHAL TRAP</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-rose-900 font-medium max-w-md mx-auto">
                        {item.pitfall}
                      </p>
                    </div>

                    {/* Resuscitation Protocol Box */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-black text-[10px] uppercase text-emerald-700 tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>FIRST-LINE RESUSCITATION PROTOCOL</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-emerald-900 font-medium max-w-md mx-auto">
                        {item.protocol}
                      </p>
                    </div>

                    {/* Attending Board Pearl */}
                    <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs space-y-1.5 shadow-xs text-center">
                      <div className="flex items-center justify-center gap-1.5 font-black text-[10px] uppercase text-amber-400 tracking-wider">
                        <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>CHIEF ATTENDING BOARD PEARL</span>
                      </div>
                      <p className="text-[11px] text-slate-200 leading-relaxed max-w-md mx-auto">
                        {item.pearl}
                      </p>
                    </div>

                    {/* Action Bar / Add to Anki Deck */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 flex-wrap gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        USMLE / ABEM Core Standard
                      </span>
                      <button
                        id={`btn-toggle-anki-${item.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isInAnki) {
                            removeFromAnkiQueue(item.id);
                          } else {
                            addToAnkiQueue(item.id);
                          }
                        }}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                          isInAnki
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                        }`}
                      >
                        {isInAnki ? (
                          <>
                            <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                            <span>Queued in Spaced Review</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-4 h-4 text-slate-500" />
                            <span>Add to Review Deck</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
