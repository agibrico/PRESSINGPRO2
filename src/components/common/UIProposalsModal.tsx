import React from 'react';
import {
  Sparkles,
  X,
  Receipt,
  Kanban,
  BarChart3,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  LayoutGrid,
  MonitorCheck,
  TrendingUp,
  Boxes,
  Truck,
  Smartphone,
  CreditCard,
  Building2,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UIProposalMode } from '../../types';

interface UIProposalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProposal: (proposal: UIProposalMode) => void;
}

export const UIProposalsModal: React.FC<UIProposalsModalProps> = ({
  isOpen,
  onClose,
  onApplyProposal,
}) => {
  const { state } = useApp();

  if (!isOpen) return null;

  const currentProposal = state.layoutProposal || 'pos_counter';

  const proposals: {
    id: UIProposalMode;
    number: string;
    title: string;
    tagline: string;
    targetUser: string;
    hardware: string;
    accentBg: string;
    accentText: string;
    badgeColor: string;
    icon: React.ElementType;
    highlights: string[];
    layoutSpecs: string;
    actionLabel: string;
  }[] = [
    {
      id: 'pos_counter',
      number: 'PROPOSITION 1',
      title: 'Comptoir Tactile POS & Caisse Rapide',
      tagline: 'Ergonomie pensée pour l’accueil client, la vitesse de dépôt et l’encaissement instantané.',
      targetUser: 'Caissières, Réceptionnistes, Hôtes d’accueil',
      hardware: 'Écrans tactiles POS, Caisses enregistreuses, Tablettes comptoir',
      accentBg: 'bg-amber-500/10 border-amber-500/30',
      accentText: 'text-amber-400',
      badgeColor: 'bg-amber-400 text-slate-950',
      icon: Receipt,
      highlights: [
        'Grille de boutons larges avec catégories ivoiriennes (Bazin, Kita, Costumes, Draps...)',
        'Panier de commande persistant avec bascule immédiate Standard / Express (+50%)',
        'Encaissement Mobile Money intégré (Wave, Orange Money, MTN, Moov) en 2 touches',
        'Impression de tickets thermiques avec QR code de suivi et réserves textiles',
        'Bandeau permanent du statut de caisse et espèces disponibles',
      ],
      layoutSpecs: 'Barre latérale condensée • Zone centrale 65% Grille articles • Zone droite 35% Ticket de caisse interactif',
      actionLabel: 'Activer le Mode Caisse Tactile',
    },
    {
      id: 'workshop_kanban',
      number: 'PROPOSITION 2',
      title: 'Atelier & Pipeline Kanban Industriel',
      tagline: 'Pilotage de la production, cycle de lavage et attribution des penderies en temps réel.',
      targetUser: 'Chefs d’atelier, Laveurs, Repasseurs, Contrôleurs qualité',
      hardware: 'Écrans muraux d’atelier, PC de production, Tablettes industrielles',
      accentBg: 'bg-sky-500/10 border-sky-500/30',
      accentText: 'text-sky-400',
      badgeColor: 'bg-sky-400 text-slate-950',
      icon: Kanban,
      highlights: [
        'Pipeline Kanban 6 colonnes : Réception ➔ Lavage ➔ Séchage ➔ Repassage ➔ Contrôle ➔ Racks',
        'Attribution visuelle des numéros de penderies et casiers d’emballage',
        'Badges d’urgence dynamiques avec compte à rebours et alertes de retards',
        'Passage d’étape en 1 clic pour les opérateurs par poste de travail',
        'Contrôle qualité systématique avec gestion des réserves et reprises',
      ],
      layoutSpecs: 'Navigation atelier prioritaire • Vue Kanban plein écran fluide • Fiches de linge grand format',
      actionLabel: 'Activer le Mode Atelier Kanban',
    },
    {
      id: 'executive_analytics',
      number: 'PROPOSITION 3',
      title: 'Direction & Multi-Agences Executive',
      tagline: 'Tableau de bord de pilotage financier, comparaison inter-agences et gestion stratégique.',
      targetUser: 'Propriétaire de pressing, Directeurs généraux, Comptables',
      hardware: 'Ordinateurs de bureau, Laptops de direction, Écrans panoramiques',
      accentBg: 'bg-emerald-500/10 border-emerald-500/30',
      accentText: 'text-emerald-400',
      badgeColor: 'bg-emerald-400 text-slate-950',
      icon: BarChart3,
      highlights: [
        'Consolidation multi-agences (Cocody Angré, Marcory Zone 4, Plateau...)',
        'KPI financiers : CA encaissé, créances clients à recouvrer, panier moyen',
        'Suivi critique des stocks de consommables (lessives, détachants, cintres, plastiques)',
        'Suivi de la flotte de livraison et performance des coursiers',
        'Export comptable Excel/PDF et journal d’audit de conformité',
      ],
      layoutSpecs: 'Tableau de bord exécutif modulaire • Graphiques et matrices comparatives • Ratios de rentabilité',
      actionLabel: 'Activer le Mode Direction Executive',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                3 Propositions d’Interface — MON PRESSING PRO
              </h2>
              <p className="text-xs text-slate-400">
                Choisissez la disposition et l’expérience utilisateur adaptées à votre mode de travail
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: 3 Proposals Grid */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {proposals.map((prop) => {
              const Icon = prop.icon;
              const isCurrent = currentProposal === prop.id;

              return (
                <div
                  key={prop.id}
                  className={`rounded-2xl border flex flex-col justify-between transition-all duration-200 ${
                    isCurrent
                      ? 'bg-slate-800/90 border-amber-400/80 shadow-xl ring-2 ring-amber-400/30'
                      : 'bg-slate-850 border-slate-750 hover:border-slate-600 bg-slate-800/40'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${prop.badgeColor}`}>
                        {prop.number}
                      </span>
                      {isCurrent && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                          <Check className="w-3 h-3 stroke-[3]" /> Actuel
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${prop.accentBg} ${prop.accentText}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-white leading-tight">
                          {prop.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed min-h-[36px]">
                      {prop.tagline}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-750">
                      <div className="flex items-start gap-1.5 text-[10px] text-slate-400">
                        <MonitorCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span><strong className="text-slate-300">Cible :</strong> {prop.targetUser}</span>
                      </div>
                      <div className="flex items-start gap-1.5 text-[10px] text-slate-400">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span><strong className="text-slate-300">Support :</strong> {prop.hardware}</span>
                      </div>
                    </div>

                    {/* Key features bullets */}
                    <div className="pt-2 border-t border-slate-750 space-y-1.5">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Fonctionnalités Clés
                      </p>
                      {prop.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                          <span className="leading-snug">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => {
                        onApplyProposal(prop.id);
                        onClose();
                      }}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-extrabold'
                          : 'bg-slate-700 hover:bg-slate-600 text-white'
                      }`}
                    >
                      <span>{isCurrent ? 'Interface Active' : prop.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional notes */}
          <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Vous pouvez basculer d'une interface à l'autre à tout moment sans perdre aucune donnée.
            </span>
            <span className="font-mono text-[10px] text-slate-500">Pressing CI SaaS v2.4</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
