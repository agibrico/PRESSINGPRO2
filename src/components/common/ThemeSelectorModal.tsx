import React from 'react';
import {
  Palette,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Layout,
  Check,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Shield,
  Layers,
  Receipt,
  Kanban,
  BarChart3,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UITheme, DensityMode, UIProposalMode } from '../../types';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProposalsModal?: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  onOpenProposalsModal,
}) => {
  const { state, setUITheme, setDensity, setLayoutProposal, toggleSound } = useApp();

  if (!isOpen) return null;

  const currentTheme = state.uiTheme || 'amber';
  const currentDensity = state.density || 'comfortable';
  const currentProposal = state.layoutProposal || 'pos_counter';
  const soundEnabled = state.soundEnabled ?? true;

  const themes: {
    id: UITheme;
    name: string;
    description: string;
    primaryColor: string;
    accentColor: string;
    bgPreview: string;
    cardBorder: string;
  }[] = [
    {
      id: 'amber',
      name: 'Ambre & Ardoise (Signature Ivoire)',
      description: 'Design haute distinction avec accents or ambré et fond ardoise neutre.',
      primaryColor: 'bg-amber-500',
      accentColor: 'text-amber-400',
      bgPreview: 'bg-slate-900',
      cardBorder: 'border-amber-500/40',
    },
    {
      id: 'sapphire',
      name: 'Saphir Clean Lab',
      description: 'Ambiance moderne pressing haute technologie, bleu cobalt et blanc immaculé.',
      primaryColor: 'bg-sky-500',
      accentColor: 'text-sky-400',
      bgPreview: 'bg-slate-950',
      cardBorder: 'border-sky-500/40',
    },
    {
      id: 'emerald',
      name: 'Émeraude & Ivoire',
      description: 'Touche écologique, fraîcheur et clarté inspirée de la nature ivoirienne.',
      primaryColor: 'bg-emerald-500',
      accentColor: 'text-emerald-400',
      bgPreview: 'bg-slate-900',
      cardBorder: 'border-emerald-500/40',
    },
    {
      id: 'midnight',
      name: 'Midnight Prestige OLED',
      description: 'Interface sombre ultra-contrastée, idéale pour les écrans tactiles en boutique.',
      primaryColor: 'bg-purple-500',
      accentColor: 'text-purple-400',
      bgPreview: 'bg-black',
      cardBorder: 'border-purple-500/40',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Personnalisation de l’Interface</h3>
              <p className="text-[11px] text-slate-400">
                Thèmes visuels, ambiance de caisse & ergonomie tactile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 3 UI Proposals Section */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs text-white uppercase tracking-wider">
                  3 Propositions d’Interface Disponibles
                </span>
              </div>
              {onOpenProposalsModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenProposalsModal();
                  }}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Voir le comparatif complet
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'pos_counter' as UIProposalMode,
                  title: '1. Caisse Tactile POS',
                  desc: 'Comptoir & Encaissement express',
                  icon: Receipt,
                  color: 'text-amber-400',
                },
                {
                  id: 'workshop_kanban' as UIProposalMode,
                  title: '2. Atelier & Kanban',
                  desc: 'Production & Racks penderie',
                  icon: Kanban,
                  color: 'text-sky-400',
                },
                {
                  id: 'executive_analytics' as UIProposalMode,
                  title: '3. Direction Executive',
                  desc: 'Multi-agences & Finances',
                  icon: BarChart3,
                  color: 'text-emerald-400',
                },
              ].map((p) => {
                const Icon = p.icon;
                const isSelected = currentProposal === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setLayoutProposal(p.id)}
                    className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-amber-400 text-white shadow-xs'
                        : 'bg-slate-900/60 border-slate-750 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                        <span className="font-bold text-xs">{p.title}</span>
                      </div>
                      {isSelected && (
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Thème Visuel & Palette
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themes.map((th) => {
                const isSelected = currentTheme === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => setUITheme(th.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? `bg-slate-800/90 ${th.cardBorder} shadow-md ring-1 ring-amber-400/50`
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full ${th.primaryColor} shrink-0`} />
                        <span className="font-bold text-xs text-white">{th.name}</span>
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{th.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Density options */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              2. Densité & Disposition
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDensity('comfortable')}
                className={`p-3 rounded-xl border flex items-center gap-3 text-left transition cursor-pointer ${
                  currentDensity === 'comfortable'
                    ? 'bg-slate-800 border-amber-400/60 text-white'
                    : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Monitor className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Mode Bureau Confort</p>
                  <p className="text-[10px] text-slate-400">Espacements aérés et lisibilité maximale</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={`p-3 rounded-xl border flex items-center gap-3 text-left transition cursor-pointer ${
                  currentDensity === 'compact'
                    ? 'bg-slate-800 border-amber-400/60 text-white'
                    : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold">Mode Caisse Tactile</p>
                  <p className="text-[10px] text-slate-400">Gros boutons rapides & accès express</p>
                </div>
              </button>
            </div>
          </div>

          {/* Audio Feedback */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              3. Retours Sonores de Caisse (Web Audio)
            </label>
            <div className="flex items-center justify-between p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  soundEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Sons de confirmation POS</p>
                  <p className="text-[10px] text-slate-400">
                    Bip lors de l'ajout d'article, carillon à l'encaissement et tiroir caisse
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleSound}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  soundEnabled
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {soundEnabled ? 'Activé' : 'Désactivé'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition cursor-pointer"
          >
            Appliquer & Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
