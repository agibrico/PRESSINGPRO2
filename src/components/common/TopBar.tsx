import React from 'react';
import {
  Building2,
  ChevronDown,
  Layers,
  LogOut,
  PackageSearch,
  Palette,
  PlusCircle,
  Search,
  Shield,
  UserCheck,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { AgbLogo } from './AgbLogo';
import { AppIconBadge } from './AppIconBadge';

interface TopBarProps {
  onOpenRoleSwitcher: () => void;
  onOpenQuickPOS: () => void;
  onOpenTracker: () => void;
  onOpenSearch: () => void;
  onOpenThemeModal: () => void;
  onOpenProposalsModal: () => void;
  onOpenEditorUnlock: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenRoleSwitcher,
  onOpenQuickPOS,
  onOpenTracker,
  onOpenSearch,
  onOpenThemeModal,
  onOpenProposalsModal,
  onOpenEditorUnlock,
}) => {
  const {
    state,
    currentTenant,
    currentPermissions,
    switchEstablishment,
    userRole,
    toggleSound,
    logout,
  } = useApp();

  const isSuperAdmin = userRole === 'super_admin';
  const tenantEstablishments = state.establishments.filter(
    (e) => e.tenantId === state.currentTenantId
  );

  const activeTheme = state.uiTheme || 'amber';
  const themeDotColor =
    activeTheme === 'sapphire'
      ? 'bg-sky-400'
      : activeTheme === 'emerald'
      ? 'bg-emerald-400'
      : activeTheme === 'midnight'
      ? 'bg-purple-400'
      : 'bg-amber-400';

  const themeBrandCta =
    activeTheme === 'sapphire'
      ? 'bg-sky-400 hover:bg-sky-300'
      : activeTheme === 'emerald'
      ? 'bg-emerald-400 hover:bg-emerald-300'
      : activeTheme === 'midnight'
      ? 'bg-purple-500 hover:bg-purple-400 text-white'
      : 'bg-amber-400 hover:bg-amber-300';

  return (
    <header className="h-14 bg-slate-900 text-white border-b border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Zone 1: Brand Title (Single line, strictly one text element) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <AppIconBadge size="xs" rounded="md" showShadow={false} />
        <h1 className="font-bold text-sm tracking-wider uppercase text-white flex items-center gap-2 whitespace-nowrap">
          <span className={`w-1.5 h-1.5 rounded-full ${themeDotColor}`} />
          MON PRESSING PRO
        </h1>
        <span className="hidden md:inline-block text-[10px] uppercase font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
          {isSuperAdmin ? 'SaaS Super Admin' : currentTenant?.planName || 'Pro B2B'}
        </span>
      </div>

      {/* Zone 2: Navigation & Context Pills (4-6 single-line items) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {/* Global Search Shortcut */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
          title="Recherche globale (Commandes, Clients, Articles)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline text-slate-300">Rechercher...</span>
          <kbd className="hidden md:inline text-[9px] bg-slate-700/80 px-1.5 py-0.5 rounded font-mono text-slate-400">
            Ctrl+K
          </kbd>
        </button>

        {!isSuperAdmin && (
          <div className="flex items-center bg-slate-800/80 rounded-lg px-2.5 py-1 border border-slate-700 text-xs shrink-0">
            <Building2 className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <select
              value={state.currentEstablishmentId}
              onChange={(e) => switchEstablishment(e.target.value)}
              className="bg-transparent text-slate-200 font-medium text-xs focus:outline-hidden cursor-pointer whitespace-nowrap"
            >
              <option value="all" className="bg-slate-900 text-white">
                Toutes les agences ({tenantEstablishments.length})
              </option>
              {tenantEstablishments.map((est) => (
                <option key={est.id} value={est.id} className="bg-slate-900 text-white">
                  {est.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* User Role Switcher Pill */}
        <button
          onClick={onOpenRoleSwitcher}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shrink-0 cursor-pointer"
          title="Changer de rôle / profil RBAC"
        >
          <UserCheck className={`w-3.5 h-3.5 ${themeDotColor.replace('bg-', 'text-')}`} />
          <span className="truncate max-w-[130px] sm:max-w-xs">{state.currentUserName}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Theme and Customization */}
        <button
          onClick={onOpenThemeModal}
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors shrink-0 cursor-pointer"
          title="Personnaliser l'interface & thème"
        >
          <Palette className="w-3.5 h-3.5 text-slate-300" />
          <span className="hidden xl:inline text-slate-300 capitalize">{activeTheme}</span>
        </button>

        {/* 3 UI Proposals */}
        <button
          onClick={onOpenProposalsModal}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-lg transition-colors shrink-0 cursor-pointer shadow-2xs"
          title="Consulter et tester les 3 propositions d'interface"
        >
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span className="whitespace-nowrap">3 Interfaces</span>
        </button>

        {/* Public Client Tracking Portal */}
        <button
          onClick={onOpenTracker}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors shrink-0 cursor-pointer"
          title="Portail Client - Suivre un ticket"
        >
          <PackageSearch className="w-3.5 h-3.5 text-sky-400" />
          <span className="whitespace-nowrap">Suivi Client</span>
        </button>

        {/* AGB Publisher Logo Access Button */}
        <button
          onClick={onOpenEditorUnlock}
          className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-sky-300 bg-blue-950/80 hover:bg-blue-900/90 border border-blue-600/50 rounded-lg transition-colors shrink-0 cursor-pointer shadow-xs"
          title="Accéder à l'espace Éditeur / Concepteur AGB (Mot de passe: agibrico1)"
        >
          <AgbLogo size="sm" showDetails={false} className="scale-75 -my-1" />
          <span className="whitespace-nowrap">Éditeur AGB</span>
        </button>
      </div>

      {/* Zone 3: Primary Actions (1-2 single-line buttons) */}
      <div className="flex items-center gap-2 shrink-0">
        {isSuperAdmin && (
          <button
            onClick={onOpenRoleSwitcher}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Changer de Pressing</span>
          </button>
        )}

        {/* Lock / Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-colors cursor-pointer shrink-0"
          title="Verrouiller / Se déconnecter (Retour aux 3 profils)"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="font-semibold">Quitter</span>
        </button>
      </div>
    </header>
  );
};
