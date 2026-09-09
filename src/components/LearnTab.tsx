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
  Activity,
  Heart,
  Wind,
  ShieldAlert,
  Flame,
  Zap,
} from 'lucide-react';
import { useShiftStore } from '../store/useShiftStore';

interface ProtocolItem {
  id: string;
  title: string;
  category: 'CARDIAC' | 'TRAUMA' | 'TOX' | 'PULMONARY';
  subtitle: string;
  presentation: string;
  pitfall: string;
  protocol: string;
  pearl: string;
}

const PROTOCOLS: ProtocolItem[] = [
  {
    id: 'proto-rv-infarct',
    title: 'Right Ventricular STEMI',
    category: 'CARDIAC',
    subtitle: 'Inferior wall ischemia with right ventricular involvement',
    presentation: 'Inferior ST-elevation in II, III, aVF with clear lung fields and profound hypotension.',
    pitfall: 'Administering sublingual nitroglycerin, morphine, or beta-blockers precipitates sudden cardiovascular collapse due to venous pooling and acute loss of right ventricular preload.',
    protocol: 'Order right-sided 12-lead (V4R). Resuscitate with 1,000 mL crystalloid fluid boluses to optimize RV filling pressures, initiate emergent PCI activation, and administer inotropic/vasopressor support (norepinephrine) if MAP remains < 65.',
    pearl: 'Remember: The right ventricle is thin-walled and acts purely as a conduit dependent on preload. Fluid loading is therapeutic, whereas venodilators are fatal.',
  },
  {
    id: 'proto-tension-ptx',
    title: 'Tension Pneumothorax',
    category: 'TRAUMA',
    subtitle: 'One-way pleural valve leading to mediastinal shift and obstructive shock',
    presentation: 'Tracheal deviation, absent unilateral breath sounds, hyperresonance, and profound hypotension with distended neck veins.',
    pitfall: 'Delaying decompression to obtain an upright chest X-ray or transport the patient to CT imaging; or applying positive-pressure ventilation (RSI) prior to releasing pleural pressure.',
    protocol: 'Immediate clinical diagnosis without imaging. Perform emergent needle thoracostomy (2nd ICS midclavicular or 4th/5th ICS anterior axillary line) or rapid finger thoracostomy, followed by 28-32 Fr tube thoracostomy connected to underwater seal.',
    pearl: 'ATLS 10th edition prioritizes the 4th/5th intercostal space anterior axillary line for needle and finger thoracostomy due to lower failure rates and thinner chest wall musculature.',
  },
  {
    id: 'proto-hyperk',
    title: 'Hyperkalemic Sine Wave',
    category: 'CARDIAC',
    subtitle: 'Life-threatening electrical cardiotoxicity from hyperkalemia',
    presentation: 'Peaked symmetrical T-waves, PR prolongation, QRS widening progressing into a classic sinusoidal wave pattern.',
    pitfall: 'Administering potassium-shifting agents (insulin/dextrose, albuterol) without first stabilizing cardiac myocyte membrane with IV calcium.',
    protocol: 'Immediate IV Calcium Gluconate 3g or Calcium Chloride 1g over 2-5 minutes to antagonize cardiotoxicity. Follow with 10 units regular insulin IV + 25-50g D50W, continuous nebulized albuterol (10-20 mg), and stat preparation for emergent hemodialysis.',
    pearl: 'Calcium does NOT lower serum potassium; it temporarily restores resting membrane potential threshold (-90mV to -70mV) to prevent imminent asystole or ventricular fibrillation.',
  },
  {
    id: 'proto-massive-transfusion',
    title: 'Traumatic Hemorrhagic Shock',
    category: 'TRAUMA',
    subtitle: 'Lethal triad of hypothermia, coagulopathy, and acidosis',
    presentation: 'Class IV hemorrhagic shock: HR > 140, unrecordable or systolic BP < 90, confusion, cold extremities.',
    pitfall: 'Infusing liters of room-temperature 0.9% Normal Saline, which dilutes clotting factors, worsens hypothermia, and induces severe hyperchloremic metabolic acidosis.',
    protocol: 'Activate Massive Transfusion Protocol (MTP) with 1:1:1 ratio of packed red blood cells (pRBCs), fresh frozen plasma (FFP), and platelets. Administer Tranexamic Acid (TXA) 1g IV over 10 min within 3 hours of trauma. Rapid surgical hemorrhage control.',
    pearl: 'CRASH-2 trial evidence: TXA reduces all-cause mortality when given < 3 hours post-injury; administration after 3 hours increases mortality risk.',
  },
  {
    id: 'proto-tca-tox',
    title: 'Tricyclic Antidepressant Overdose',
    category: 'TOX',
    subtitle: 'Sodium channel blockade, anticholinergic toxidrome, and cardiac dysrhythmias',
    presentation: 'Altered mental status, dilated pupils, dry skin, tachycardia, QRS duration > 100 ms, terminal R wave in lead aVR > 3 mm.',
    pitfall: 'Administering physostigmine (can induce refractory asystole in TCA overdose) or Type 1A/1C antiarrhythmics (procainamide, flecainide).',
    protocol: 'Administer Sodium Bicarbonate 1-2 mEq/kg IV push bolus, titrating to serum pH 7.50-7.55 and QRS narrowing. Maintain infusion of 3 ampules D5W at 150-200 mL/hr.',
    pearl: 'Sodium bicarbonate overcomes fast sodium channel blockade via two distinct mechanisms: increasing extracellular sodium concentration and alkalinizing serum pH to favor uncharged drug dissociation from cardiac channels.',
  },
  {
    id: 'proto-crashing-asthma',
    title: 'Acute Severe Asthma Exacerbation',
    category: 'PULMONARY',
    subtitle: 'Severe dynamic hyperinflation and breath stacking',
    presentation: 'Silent chest, pulsus paradoxus, diaphoresis, respiratory fatigue, upright tripod positioning.',
    pitfall: 'Aggressive rapid sequence intubation with high respiratory rates and tidal volumes, causing massive intrinsic PEEP (auto-PEEP), acute tension pneumothorax, and sudden cardiac arrest.',
    protocol: 'Maximal medical therapy: continuous nebulized albuterol + ipratropium, IV methylprednisolone 125 mg, IV Magnesium Sulfate 2g over 20 min, subcutaneous/IM Epinephrine (0.3 mg 1:1,000). If intubation unavoidable, use low rate (8-10 bpm), long expiratory time (I:E 1:4), and tolerate permissive hypercapnia.',
    pearl: 'If a ventilated asthmatic acutely arrests, immediately disconnect the endotracheal tube from the ventilator circuit and compress both sides of the chest to manually exhale trapped air.',
  },
];

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
      className="flex-1 flex flex-col justify-between p-4 overflow-y-auto space-y-4 pb-20 select-none"
    >
      <div className="space-y-3.5">
        {/* Header */}
        <div className="pt-1 pb-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            <BookOpen className="w-3.5 h-3.5 text-rose-600" />
            <span>Resuscitation Clinical Atlas</span>
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            High-Yield EM Protocols
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evidence-based ACLS / ATLS protocols and diagnostic pitfalls
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-learn-search"
              type="text"
              placeholder="Search protocols, pitfalls, drugs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['ALL', 'CARDIAC', 'TRAUMA', 'TOX', 'PULMONARY'].map((cat) => (
              <button
                key={cat}
                id={`filter-cat-${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
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
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const isInAnki = ankiQueueIds.includes(item.id);

            return (
              <div
                key={item.id}
                id={`protocol-card-${item.id}`}
                className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-xs transition-all"
              >
                {/* Clickable Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                        {item.category}
                      </span>
                      <h2 className="text-xs font-black text-slate-900">
                        {item.title}
                      </h2>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-3.5 pt-0 border-t border-slate-100 space-y-3 animate-in fade-in duration-150">
                    {/* Presentation */}
                    <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <span className="font-bold text-slate-900 uppercase text-[10px] block mb-0.5">
                        Clinical Presentation:
                      </span>
                      {item.presentation}
                    </div>

                    {/* Pitfall Warning */}
                    <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-950 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-[10px] uppercase text-rose-700 tracking-wide">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Critical Pitfall & Lethal Trap:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-rose-900 font-medium">
                        {item.pitfall}
                      </p>
                    </div>

                    {/* Protocol */}
                    <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-[10px] uppercase text-emerald-700 tracking-wide">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>First-Line Resuscitation Protocol:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-emerald-900 font-medium">
                        {item.protocol}
                      </p>
                    </div>

                    {/* Attending Pearl */}
                    <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs space-y-1 shadow-sm">
                      <div className="flex items-center gap-1.5 font-black text-[10px] uppercase text-amber-400 tracking-wide">
                        <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>Chief Attending Board Pearl:</span>
                      </div>
                      <p className="text-[11px] text-slate-200 leading-relaxed">
                        {item.pearl}
                      </p>
                    </div>

                    {/* Action Bar / Add to Anki */}
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
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
                        className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          isInAnki
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {isInAnki ? (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Queued to Anki Review</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                            <span>Add to Anki Deck</span>
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
