import React, { useState } from 'react';
import {
  X,
  Lock,
  Check,
  Package,
  Sparkles,
  Info,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { useAvatarStore } from '../../store/useAvatarStore';
import { InventoryItem, ItemCategory, ItemRarity } from '../../types/avatar';
import { audio } from '../../utils/audio';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    catalog,
    unlockedItemIds,
    appearance,
    equipItem,
  } = useAvatarStore();

  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  if (!isOpen) return null;

  const TABS: { id: ItemCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'outfits', label: 'Outfits' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'pets', label: 'Pets' },
    { id: 'badges', label: 'Badges' },
    { id: 'special', label: 'Special' },
  ];

  const filteredItems = catalog.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  const getRarityBadge = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'epic':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'rare':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'uncommon':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'common':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const isItemEquipped = (item: InventoryItem): boolean => {
    switch (item.slotType) {
      case 'outfit':
        return appearance.outfitStyle === item.value;
      case 'stethoscope':
        return appearance.stethoscopeStyle === item.value;
      case 'badge':
        return appearance.badgeStyle === item.value;
      case 'watch':
        return appearance.watchStyle === item.value;
      case 'glasses':
        return appearance.glassesStyle === item.value;
      case 'mask':
        return appearance.maskStyle === item.value;
      case 'accessory':
        return appearance.accessoryStyle === item.value;
      case 'companion':
        return appearance.companionId === item.value;
      default:
        return false;
    }
  };

  return (
    <div
      id="inventory-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 select-none animate-fadeIn"
    >
      <div
        id="inventory-modal-card"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-600/20 border border-rose-500/40 flex items-center justify-center">
              <Package className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-black">Clinical Inventory</h2>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                {unlockedItemIds.length} / {catalog.length} Unlocked
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const isTabActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedCategory(tab.id);
                  audio.playTelemetryClick();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all cursor-pointer ${
                  isTabActive
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Inventory Balancing Notice */}
        <div className="p-3 bg-amber-50 border-b border-amber-100 flex items-start gap-2 text-amber-900 text-[11px] leading-tight">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong className="font-bold">Balancing Notice:</strong> Equipment & perks provide
            focused information access (e.g. auscultation acoustics). True diagnostic success
            relies 100% on your medical knowledge and clinical reasoning.
          </p>
        </div>

        {/* Items Grid / List */}
        <div className="p-3.5 overflow-y-auto flex-1 space-y-2.5">
          {filteredItems.map((item) => {
            const isUnlocked = unlockedItemIds.includes(item.id);
            const isEquipped = isItemEquipped(item);

            return (
              <div
                key={item.id}
                id={`inventory-item-${item.id}`}
                onClick={() => setSelectedItem(item)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isEquipped
                    ? 'bg-rose-50/70 border-rose-500 ring-1 ring-rose-400'
                    : isUnlocked
                    ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-900 truncate">
                        {item.name}
                      </h4>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getRarityBadge(
                          item.rarity
                        )}`}
                      >
                        {item.rarity}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-snug mt-1">
                      {item.description}
                    </p>

                    {item.nightShiftEffect && (
                      <div className="text-[10px] font-bold text-emerald-700 mt-1.5 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>{item.nightShiftEffect}</span>
                      </div>
                    )}

                    {!isUnlocked && (
                      <div className="text-[10px] font-bold text-amber-700 mt-1.5 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Requirement: {item.unlockRequirement.label}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Equip / Status */}
                  <div className="shrink-0">
                    {isUnlocked ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          equipItem(item);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-transform active:scale-95 ${
                          isEquipped
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                        }`}
                      >
                        {isEquipped ? 'Equipped' : 'Equip'}
                      </button>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-bold">
          <span>Earn XP & Masteries to unlock rare cosmetics.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black cursor-pointer hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
