import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Shuffle,
  Check,
  Lock,
  User,
  Shirt,
  Stethoscope,
  Heart,
  Sliders,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAvatarStore } from '../../store/useAvatarStore';
import { useGamificationStore } from '../../store/useGamificationStore';
import { AvatarRenderer } from './AvatarRenderer';
import { CompanionRenderer } from './CompanionRenderer';
import {
  HairStyle,
  GenderPresentation,
  FaceStyle,
  EyeStyle,
  CompanionId,
} from '../../types/avatar';
import { audio } from '../../utils/audio';

interface AvatarStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnboardingMode?: boolean;
}

export const AvatarStudioModal: React.FC<AvatarStudioModalProps> = ({
  isOpen,
  onClose,
  isOnboardingMode = false,
}) => {
  const {
    appearance,
    updateAppearance,
    catalog,
    unlockedItemIds,
    equipItem,
    randomizeAppearance,
    completeOnboarding,
  } = useAvatarStore();

  const { level, title } = useGamificationStore();

  const [activeTab, setActiveTab] = useState<'character' | 'wardrobe' | 'companion'>('character');
  const [subTab, setSubTab] = useState<string>('hair');

  if (!isOpen) return null;

  // Skin tone choices
  const SKIN_TONES = [
    { label: 'Fair Porcelain', color: '#FCE7D6' },
    { label: 'Light Sand', color: '#E0B596' },
    { label: 'Warm Tan', color: '#C68B59' },
    { label: 'Deep Caramel', color: '#8D5524' },
    { label: 'Rich Espresso', color: '#593B2B' },
  ];

  // Hair color choices
  const HAIR_COLORS = [
    { label: 'Obsidian Black', color: '#1E293B' },
    { label: 'Dark Chocolate', color: '#331B0B' },
    { label: 'Chestnut Brown', color: '#78350F' },
    { label: 'Honey Blonde', color: '#B45309' },
    { label: 'Silver Ash', color: '#94A3B8' },
  ];

  // Scrub colors
  const SCRUB_COLORS = [
    { label: 'ED Sky Blue', color: '#0284C7' },
    { label: 'Trauma Crimson', color: '#991B1B' },
    { label: 'Surgical Emerald', color: '#059669' },
    { label: 'Clinical Slate', color: '#475569' },
    { label: 'Royal Cobalt', color: '#4338CA' },
    { label: 'Midnight Obsidian', color: '#0F172A' },
  ];

  const HAIR_STYLES: { id: HairStyle; label: string }[] = [
    { id: 'parted', label: 'Classic Part' },
    { id: 'short_crop', label: 'Short Crop' },
    { id: 'buzz', label: 'Buzz Cut' },
    { id: 'curly_fade', label: 'Curly Fade' },
    { id: 'high_ponytail', label: 'High Ponytail' },
    { id: 'scrub_cap', label: 'Surgical Scrub Cap' },
    { id: 'long_braids', label: 'Box Braids' },
    { id: 'wavy_bob', label: 'Wavy Bob' },
  ];

  const GENDER_OPTIONS: { id: GenderPresentation; label: string }[] = [
    { id: 'neutral', label: 'Neutral' },
    { id: 'feminine', label: 'Feminine' },
    { id: 'masculine', label: 'Masculine' },
  ];

  const FACE_STYLES: { id: FaceStyle; label: string }[] = [
    { id: 'determined', label: 'Determined' },
    { id: 'focused', label: 'Focused' },
    { id: 'calm', label: 'Calm' },
    { id: 'compassionate', label: 'Compassionate' },
  ];

  const EYE_STYLES: { id: EyeStyle; label: string }[] = [
    { id: 'alert', label: 'Alert' },
    { id: 'sharp', label: 'Sharp' },
    { id: 'kind', label: 'Kind' },
    { id: 'intense', label: 'Intense' },
  ];

  const COMPANION_CHOICES: { id: CompanionId; name: string; desc: string }[] = [
    { id: 'pulse', name: 'Pulse', desc: 'Telemetry Sentinel (Calm & Analytical)' },
    { id: 'echo', name: 'Echo', desc: 'POCUS Probe (Curious & Inquisitive)' },
    { id: 'rhythm', name: 'Rhythm', desc: 'ECG Creature (Energetic & Sharp)' },
    { id: 'clot', name: 'Clot', desc: 'Biconcave Buddy (Perfusion Focused)' },
    { id: 'lumi', name: 'Lumi', desc: 'Resus Beacon (Optimistic Leader)' },
    { id: 'none', name: 'Solo', desc: 'No Companion' },
  ];

  const handleFinish = () => {
    audio.playLevelUp();
    if (isOnboardingMode) {
      completeOnboarding();
    }
    onClose();
  };

  // Filter catalog items for wardrobe
  const outfitItems = catalog.filter((i) => i.slotType === 'outfit');
  const scopeItems = catalog.filter((i) => i.slotType === 'stethoscope');
  const badgeItems = catalog.filter((i) => i.slotType === 'badge');
  const watchItems = catalog.filter((i) => i.slotType === 'watch');
  const ppeItems = catalog.filter(
    (i) => i.slotType === 'glasses' || i.slotType === 'mask' || i.slotType === 'accessory'
  );

  return (
    <div
      id="avatar-studio-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 select-none animate-fadeIn"
    >
      <div
        id="avatar-studio-modal-card"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-base font-black flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {isOnboardingMode ? 'Create Your Emergency Clinician' : 'Clinician Avatar Studio'}
            </h2>
            <p className="text-[11px] text-slate-400 font-semibold">
              Level {level} • {title}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={randomizeAppearance}
              title="Randomize Appearance"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            {!isOnboardingMode && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Live Avatar Preview Stage */}
        <div className="bg-slate-100 p-4 flex items-center justify-center relative border-b border-slate-200">
          <div className="relative">
            <AvatarRenderer
              appearance={appearance}
              level={level}
              size="lg"
              showBadge={true}
              showAura={true}
            />

            {/* Companion sitting beside avatar */}
            {appearance.companionId !== 'none' && (
              <div className="absolute -bottom-2 -right-4 bg-white/90 rounded-2xl p-1 shadow-md border border-slate-200">
                <CompanionRenderer
                  companionId={appearance.companionId}
                  size="sm"
                  showSpeech={false}
                />
              </div>
            )}
          </div>

          <div className="absolute top-3 left-4">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-900 text-white shadow-xs">
              Live Preview
            </span>
          </div>

          {/* Clinician Name Edit */}
          <div className="absolute bottom-2 left-4 right-4 flex items-center justify-center">
            <input
              type="text"
              value={appearance.name}
              onChange={(e) => updateAppearance({ name: e.target.value })}
              className="bg-white/90 font-black text-center text-xs text-slate-900 px-3 py-1 rounded-xl border border-slate-300 shadow-2xs max-w-[200px] outline-rose-500"
              placeholder="Clinician Name"
            />
          </div>
        </div>

        {/* Studio Primary Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 pt-2 gap-2">
          <button
            onClick={() => {
              setActiveTab('character');
              setSubTab('hair');
              audio.playTelemetryClick();
            }}
            className={`flex-1 py-2 rounded-t-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'character'
                ? 'bg-white text-rose-600 border-t border-x border-slate-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Character</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('wardrobe');
              setSubTab('outfits');
              audio.playTelemetryClick();
            }}
            className={`flex-1 py-2 rounded-t-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'wardrobe'
                ? 'bg-white text-rose-600 border-t border-x border-slate-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            <span>Wardrobe</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('companion');
              audio.playTelemetryClick();
            }}
            className={`flex-1 py-2 rounded-t-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'companion'
                ? 'bg-white text-rose-600 border-t border-x border-slate-200 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Companion</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: CHARACTER CUSTOMIZATION */}
          {activeTab === 'character' && (
            <div className="space-y-4">
              {/* Skin Tone Palette */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                  Skin Tone
                </label>
                <div className="flex items-center gap-2">
                  {SKIN_TONES.map((item) => (
                    <button
                      key={item.color}
                      onClick={() => {
                        updateAppearance({ skinTone: item.color });
                        audio.playTelemetryClick();
                      }}
                      title={item.label}
                      className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer relative ${
                        appearance.skinTone === item.color
                          ? 'border-rose-600 scale-110 shadow-sm ring-2 ring-rose-300'
                          : 'border-white hover:scale-105'
                      }`}
                      style={{ backgroundColor: item.color }}
                    >
                      {appearance.skinTone === item.color && (
                        <Check className="w-4 h-4 text-slate-900 mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Style & Color */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                  Hairstyle
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {HAIR_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        updateAppearance({ hairStyle: style.id });
                        audio.playTelemetryClick();
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                        appearance.hairStyle === style.id
                          ? 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-400'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>

                <div className="pt-2 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500">Hair Color</span>
                  <div className="flex items-center gap-2">
                    {HAIR_COLORS.map((item) => (
                      <button
                        key={item.color}
                        onClick={() => {
                          updateAppearance({ hairColor: item.color });
                          audio.playTelemetryClick();
                        }}
                        title={item.label}
                        className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer relative ${
                          appearance.hairColor === item.color
                            ? 'border-rose-600 scale-110 ring-2 ring-rose-300'
                            : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: item.color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Facial Style / Eyes */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-700">
                    Facial Expression
                  </label>
                  <select
                    value={appearance.faceStyle}
                    onChange={(e) =>
                      updateAppearance({ faceStyle: e.target.value as FaceStyle })
                    }
                    className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-xl outline-rose-500"
                  >
                    {FACE_STYLES.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-700">
                    Eye Expression
                  </label>
                  <select
                    value={appearance.eyeStyle}
                    onChange={(e) =>
                      updateAppearance({ eyeStyle: e.target.value as EyeStyle })
                    }
                    className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-xl outline-rose-500"
                  >
                    {EYE_STYLES.map((ey) => (
                      <option key={ey.id} value={ey.id}>
                        {ey.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDICAL WARDROBE & EQUIPMENT */}
          {activeTab === 'wardrobe' && (
            <div className="space-y-4">
              {/* Scrub Color Picker */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                  Scrub Fabric Color
                </label>
                <div className="flex items-center gap-2">
                  {SCRUB_COLORS.map((item) => (
                    <button
                      key={item.color}
                      onClick={() => {
                        updateAppearance({ scrubColor: item.color });
                        audio.playTelemetryClick();
                      }}
                      title={item.label}
                      className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer relative ${
                        appearance.scrubColor === item.color
                          ? 'border-rose-600 scale-110 ring-2 ring-rose-300'
                          : 'border-white'
                      }`}
                      style={{ backgroundColor: item.color }}
                    />
                  ))}
                </div>
              </div>

              {/* Sub-tabs for Wardrobe Category */}
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                <button
                  onClick={() => setSubTab('outfits')}
                  className={`flex-1 py-1 rounded-lg cursor-pointer transition-colors ${
                    subTab === 'outfits' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Outfits
                </button>
                <button
                  onClick={() => setSubTab('scopes')}
                  className={`flex-1 py-1 rounded-lg cursor-pointer transition-colors ${
                    subTab === 'scopes' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Stethoscope
                </button>
                <button
                  onClick={() => setSubTab('badges')}
                  className={`flex-1 py-1 rounded-lg cursor-pointer transition-colors ${
                    subTab === 'badges' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Badges
                </button>
                <button
                  onClick={() => setSubTab('ppe')}
                  className={`flex-1 py-1 rounded-lg cursor-pointer transition-colors ${
                    subTab === 'ppe' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Gear & PPE
                </button>
              </div>

              {/* Sub-tab Items List */}
              <div className="space-y-2">
                {subTab === 'outfits' &&
                  outfitItems.map((item) => {
                    const isUnlocked = unlockedItemIds.includes(item.id);
                    const isEquipped = appearance.outfitStyle === item.value;
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                          isEquipped
                            ? 'bg-rose-50/80 border-rose-500 ring-1 ring-rose-400'
                            : isUnlocked
                            ? 'bg-white border-slate-200 hover:border-slate-300'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-slate-900">{item.name}</h4>
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {item.rarity}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                          {!isUnlocked && (
                            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                              <Lock className="w-3 h-3" /> {item.unlockRequirement.label}
                            </span>
                          )}
                        </div>

                        {isUnlocked ? (
                          <button
                            onClick={() => equipItem(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                              isEquipped
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            {isEquipped ? 'Equipped' : 'Equip'}
                          </button>
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}

                {subTab === 'scopes' &&
                  scopeItems.map((item) => {
                    const isUnlocked = unlockedItemIds.includes(item.id);
                    const isEquipped = appearance.stethoscopeStyle === item.value;
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                          isEquipped
                            ? 'bg-rose-50/80 border-rose-500 ring-1 ring-rose-400'
                            : isUnlocked
                            ? 'bg-white border-slate-200 hover:border-slate-300'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-slate-900">{item.name}</h4>
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {item.rarity}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                          {item.nightShiftEffect && (
                            <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">
                              ✨ {item.nightShiftEffect}
                            </span>
                          )}
                          {!isUnlocked && (
                            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                              <Lock className="w-3 h-3" /> {item.unlockRequirement.label}
                            </span>
                          )}
                        </div>

                        {isUnlocked ? (
                          <button
                            onClick={() => equipItem(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                              isEquipped
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            {isEquipped ? 'Equipped' : 'Equip'}
                          </button>
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}

                {subTab === 'badges' &&
                  badgeItems.map((item) => {
                    const isUnlocked = unlockedItemIds.includes(item.id);
                    const isEquipped = appearance.badgeStyle === item.value;
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                          isEquipped
                            ? 'bg-rose-50/80 border-rose-500 ring-1 ring-rose-400'
                            : isUnlocked
                            ? 'bg-white border-slate-200 hover:border-slate-300'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <h4 className="text-xs font-black text-slate-900">{item.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                          {!isUnlocked && (
                            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                              <Lock className="w-3 h-3" /> {item.unlockRequirement.label}
                            </span>
                          )}
                        </div>
                        {isUnlocked ? (
                          <button
                            onClick={() => equipItem(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                              isEquipped
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            {isEquipped ? 'Equipped' : 'Equip'}
                          </button>
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}

                {subTab === 'ppe' &&
                  ppeItems.map((item) => {
                    const isUnlocked = unlockedItemIds.includes(item.id);
                    let isEquipped = false;
                    if (item.slotType === 'glasses')
                      isEquipped = appearance.glassesStyle === item.value;
                    if (item.slotType === 'mask')
                      isEquipped = appearance.maskStyle === item.value;
                    if (item.slotType === 'accessory')
                      isEquipped = appearance.accessoryStyle === item.value;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                          isEquipped
                            ? 'bg-rose-50/80 border-rose-500 ring-1 ring-rose-400'
                            : isUnlocked
                            ? 'bg-white border-slate-200 hover:border-slate-300'
                            : 'bg-slate-50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <h4 className="text-xs font-black text-slate-900">{item.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                          {!isUnlocked && (
                            <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                              <Lock className="w-3 h-3" /> {item.unlockRequirement.label}
                            </span>
                          )}
                        </div>
                        {isUnlocked ? (
                          <button
                            onClick={() => equipItem(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer ${
                              isEquipped
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            {isEquipped ? 'Equipped' : 'Equip'}
                          </button>
                        ) : (
                          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 3: COMPANION SELECTION */}
          {activeTab === 'companion' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Your companion floats beside you in the department, providing metacognitive
                reminders during challenging cases without ever spoiling diagnostic answers.
              </p>

              <div className="space-y-2">
                {COMPANION_CHOICES.map((comp) => {
                  const isSelected = appearance.companionId === comp.id;
                  const itemInCatalog = catalog.find((i) => i.value === comp.id);
                  const isUnlocked =
                    comp.id === 'none' ||
                    (itemInCatalog && unlockedItemIds.includes(itemInCatalog.id));

                  return (
                    <div
                      key={comp.id}
                      onClick={() => {
                        if (isUnlocked) {
                          updateAppearance({ companionId: comp.id });
                          audio.playTelemetryClick();
                        }
                      }}
                      className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-50 border-rose-500 ring-1 ring-rose-400'
                          : isUnlocked
                          ? 'bg-white border-slate-200 hover:border-slate-300'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-xl shrink-0">
                        {comp.id !== 'none' ? (
                          <CompanionRenderer
                            companionId={comp.id}
                            size="sm"
                            showSpeech={false}
                          />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-900">{comp.name}</h4>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5" /> Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{comp.desc}</p>
                        {!isUnlocked && itemInCatalog && (
                          <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                            <Lock className="w-3 h-3" /> {itemInCatalog.unlockRequirement.label}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            id="btn-save-avatar"
            onClick={handleFinish}
            className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm shadow-md border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isOnboardingMode ? 'Begin Emergency Residency' : 'Save Clinician Dossier'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
