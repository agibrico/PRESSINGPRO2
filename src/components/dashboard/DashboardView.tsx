import React, { useState } from 'react';
import {
  BarChart3,
  Boxes,
  Briefcase,
  Crown,
  FileSpreadsheet,
  LogOut,
  Package,
  PlusCircle,
  Receipt,
  Settings,
  ShieldAlert,
  Truck,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppIconBadge } from '../common/AppIconBadge';
import { SaaSReactivatePaymentModal } from '../common/SaaSReactivatePaymentModal';
import { soundFX } from '../../services/sound';

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
  onOpenQuickPOS: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenQuickPOS,
}) => {
  const {
    state,
    currentTenant,
    currentPermissions,
    userRole,
    reactivateTenant,
    logout,
  } = useApp();

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const isOwner = userRole === 'owner';

  // Role Human Title & metadata matching the screenshot styling
  const getRoleDisplay = () => {
    switch (userRole) {
      case 'owner':
        return {
          title: 'ADMINISTRATEUR PRESSING',
          subtitle: `${currentTenant?.companyName || 'Mon Pressing'} • Espace Gérance SaaS`,
          badge: 'ADMIN',
          badgeColor: 'bg-purple-600/30 text-purple-300 border-purple-500/40',
          headerBg: 'bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900',
          accentColor: 'text-amber-400',
          hoverBorder: 'hover:border-amber-400/60',
          iconHoverBg: 'group-hover:bg-amber-400 group-hover:text-slate-950',
          indexColor: 'group-hover:text-amber-400',
        };
      case 'manager':
        return {
          title: 'GÉRANT DU PRESSING',
          subtitle: `${currentTenant?.companyName || 'Mon Pressing'} • Direction & Exploitation`,
          badge: 'GÉRANCE',
          badgeColor: 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40',
          headerBg: 'bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900',
          accentColor: 'text-indigo-400',
          hoverBorder: 'hover:border-indigo-400/60',
          iconHoverBg: 'group-hover:bg-indigo-500 group-hover:text-white',
          indexColor: 'group-hover:text-indigo-400',
        };
      case 'cashier':
      case 'receptionist':
        return {
          title: 'ACCUEIL & CAISSE',
          subtitle: `${currentTenant?.companyName || 'Mon Pressing'} • Dépôt & Encaissement`,
          badge: 'CAISSE',
          badgeColor: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40',
          headerBg: 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900',
          accentColor: 'text-emerald-400',
          hoverBorder: 'hover:border-emerald-400/60',
          iconHoverBg: 'group-hover:bg-emerald-500 group-hover:text-slate-950',
          indexColor: 'group-hover:text-emerald-400',
        };
      case 'washer':
      case 'ironer':
        return {
          title: 'ATELIER & PRODUCTION',
          subtitle: `${currentTenant?.companyName || 'Mon Pressing'} • Nettoyage & Finition`,
          badge: 'PRODUCTION',
          badgeColor: 'bg-sky-600/30 text-sky-300 border-sky-500/40',
          headerBg: 'bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900',
          accentColor: 'text-sky-400',
          hoverBorder: 'hover:border-sky-400/60',
          iconHoverBg: 'group-hover:bg-sky-500 group-hover:text-white',
          indexColor: 'group-hover:text-sky-400',
        };
      case 'driver':
        return {
          title: 'COURSIER & LIVRAISONS',
          subtitle: `${currentTenant?.companyName || 'Mon Pressing'} • Ramassages & Livraisons`,
          badge: 'LIVRAISON',
          badgeColor: 'bg-teal-600/30 text-teal-300 border-teal-500/40',
          headerBg: 'bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900',
          accentColor: 'text-teal-400',
          hoverBorder: 'hover:border-teal-400/60',
          iconHoverBg: 'group-hover:bg-teal-500 group-hover:text-white',
          indexColor: 'group-hover:text-teal-400',
        };
      default:
        return {
          title: 'ESPACE UTILISATEUR',
          subtitle: `${currentTenant?.companyName || 'Mon Pressing'} • Portail Métier`,
          badge: 'PORTAIL',
          badgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
          headerBg: 'bg-slate-950/40',
          accentColor: 'text-slate-300',
          hoverBorder: 'hover:border-slate-400/60',
          iconHoverBg: 'group-hover:bg-slate-600 group-hover:text-white',
          indexColor: 'group-hover:text-slate-300',
        };
    }
  };

  const roleMeta = getRoleDisplay();

  // Active statistics for badges
  const tenantOrders = state.orders.filter((o) => o.tenantId === state.currentTenantId);
  const pendingOrders = tenantOrders.filter((o) => !['delivered', 'archived'].includes(o.status));
  const lowStockItems = state.inventory.filter(
    (i) => i.tenantId === state.currentTenantId && (i.status === 'low' || i.status === 'critical')
  );
  const pendingDeliveries = state.deliveries.filter(
    (d) => d.tenantId === state.currentTenantId && ['to_deliver', 'assigned', 'in_transit'].includes(d.status)
  );

  const isSuspended = currentTenant?.status === 'suspended';

  // EXACT module titles from image Screenshot_20260817-134230.jpg on a 3-columns grid
  const allClientModules = [
    {
      id: 'pos',
      label: 'Caisse & Dépôt POS',
      icon: Receipt,
      badge: 'CAISSE',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      visible: currentPermissions.canCreateOrder || currentPermissions.canViewOrders || isOwner,
    },
    {
      id: 'orders',
      label: 'Commandes & Atelier',
      icon: Package,
      badge: pendingOrders.length > 0 ? `${pendingOrders.length}` : '0',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      visible: currentPermissions.canViewOrders || isOwner,
    },
    {
      id: 'clients',
      label: 'Fichier Clients (CRM)',
      icon: Users,
      badge: undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      visible: currentPermissions.canViewClients || isOwner,
    },
    {
      id: 'caisse',
      label: 'Caisse & Clôtures',
      icon: Wallet,
      badge: undefined,
      badgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
      visible: currentPermissions.canViewCashRegister || isOwner,
    },
    {
      id: 'staff',
      label: 'Emplois & Personnel',
      icon: Briefcase,
      badge: undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      visible: currentPermissions.canManageEmployees || isOwner,
    },
    {
      id: 'inventory',
      label: 'Stocks & Produits',
      icon: Boxes,
      badge: lowStockItems.length > 0 ? `${lowStockItems.length}` : undefined,
      badgeColor: 'bg-rose-500 text-white border-rose-600',
      visible: currentPermissions.canManageStock || isOwner,
    },
    {
      id: 'deliveries',
      label: 'Livraisons',
      icon: Truck,
      badge: pendingDeliveries.length > 0 ? `${pendingDeliveries.length}` : undefined,
      badgeColor: 'bg-slate-700 text-slate-200 border-slate-600',
      visible: currentPermissions.canManageDeliveries || userRole === 'driver' || isOwner,
    },
    {
      id: 'expenses',
      label: 'Dépenses & Achats',
      icon: FileSpreadsheet,
      badge: undefined,
      badgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
      visible: currentPermissions.canManageExpenses || isOwner,
    },
    {
      id: 'reports',
      label: 'Rapports & Statistiques',
      icon: BarChart3,
      badge: undefined,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      visible: currentPermissions.canViewRevenue || isOwner,
    },
    {
      id: 'settings',
      label: 'Paramètres & SaaS',
      icon: Settings,
      badge: undefined,
      badgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
      visible: currentPermissions.canManageSettings || isOwner,
    },
  ];

  // Auto-number #01, #02, #03... sequentially for available modules
  const clientModules = allClientModules
    .filter((m) => m.visible)
    .map((m, idx) => ({
      ...m,
      num: String(idx + 1).padStart(2, '0'),
    }));

  return (
    <div className="min-h-[calc(100vh-4rem)] p-3 sm:p-6 flex flex-col justify-center items-center animate-in fade-in duration-200">
      {/* Suspended Tenant Warning with 1-Click Reactivate */}
      {isSuspended && currentTenant && (
        <div className="w-full max-w-xl mb-4 bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-950 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 rounded-xl text-rose-700 shrink-0">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <p className="font-bold text-sm text-rose-950 flex items-center gap-2">
                <span>⚠️ Compte Pressing Actuellement Suspendu</span>
                <span className="bg-rose-200 text-rose-900 text-[10px] px-2 py-0.5 rounded-full font-mono">
                  BLOCAGE SAAS
                </span>
              </p>
              <p className="text-xs text-rose-800 mt-0.5">
                L'abonnement de <strong>{currentTenant.companyName}</strong> est suspendu. Vous pouvez débloquer et réactiver ce compte immédiatement.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 shadow-md cursor-pointer transition transform active:scale-95 whitespace-nowrap"
            title="Ouvrir la session de paiement Mobile Money pour réactiver l'abonnement"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>⚡ Payer & Réactiver (+30j)</span>
          </button>
        </div>
      )}

      {/* SaaS Subscription Reactivation & Payment Modal */}
      {showPaymentModal && currentTenant && (
        <SaaSReactivatePaymentModal
          tenant={currentTenant}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* 3-COLUMNS BUTTONS GRID (EXACTLY MATCHING SCREENSHOT 133643)                 */}
      {/* ========================================================================= */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-slate-900 text-slate-300 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b border-slate-800 ${roleMeta.headerBg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AppIconBadge size="sm" rounded="lg" />
              <div>
                <div className="flex items-center gap-1.5">
                  <Crown className={`w-3.5 h-3.5 ${roleMeta.accentColor}`} />
                  <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    {roleMeta.title}
                  </span>
                </div>
                <p className="text-[10.5px] sm:text-[11px] text-slate-400 truncate max-w-[210px] sm:max-w-[280px]">
                  {roleMeta.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Divider */}
        <div className="px-4 pt-3 pb-1 flex items-center gap-2">
          <span className="h-px bg-slate-800 flex-1" />
          <span className="text-[9px] sm:text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
            MODULES DU PRESSING
          </span>
          <span className="h-px bg-slate-800 flex-1" />
        </div>

        {/* 3 COLUMNS GRID */}
        <div className="p-3 sm:p-4 grid grid-cols-3 gap-2.5 sm:gap-3">
          {clientModules.map((mod) => {
            const Icon = mod.icon;

            return (
              <button
                key={mod.id}
                onClick={() => {
                  onNavigateTab(mod.id);
                  soundFX.playBeep();
                }}
                className={`flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl border border-slate-800 bg-slate-800/80 hover:bg-slate-800 ${roleMeta.hoverBorder} hover:shadow-lg transition-all duration-200 cursor-pointer min-h-[102px] sm:min-h-[112px] group active:scale-95 relative overflow-hidden`}
              >
                {/* Top row: Module index */}
                <div className="w-full flex items-center justify-start text-[9px] font-mono leading-none mb-1">
                  <span className={`text-slate-500 ${roleMeta.indexColor} font-bold transition-colors`}>
                    #{mod.num}
                  </span>
                </div>

                {/* Center Icon */}
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-1 shadow-xs transition-transform group-hover:scale-110 bg-slate-700/80 text-slate-200 ${roleMeta.iconHoverBg}`}
                >
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>

                {/* Label */}
                <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-200 group-hover:text-white leading-tight text-center w-full line-clamp-2 px-0.5">
                  {mod.label}
                </span>

                {/* Badge count at bottom */}
                {mod.badge !== undefined && (
                  <span
                    className={`mt-1 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold leading-none border ${mod.badgeColor}`}
                  >
                    {mod.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Info (User name & role with Logout icon) */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <div className="truncate">
            <p className={`text-xs font-bold ${roleMeta.accentColor} truncate`}>
              {state.currentUserName}
            </p>
            <p className="text-[10px] text-slate-400">
              {isOwner
                ? `Administrateur Client • ${currentTenant?.planName || 'Plan Pro B2B'}`
                : `${roleMeta.title} • ${currentTenant?.companyName || 'Mon Pressing'}`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span className="text-rose-400 font-semibold text-[11px]">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
