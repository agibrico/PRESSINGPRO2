import React from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Boxes,
  Briefcase,
  Building,
  CreditCard,
  Crown,
  FileSpreadsheet,
  Layers,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Receipt,
  Settings,
  Shield,
  Smartphone,
  Sparkles,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AgbLogo } from './AgbLogo';
import { AppIconBadge } from './AppIconBadge';

export type ActiveTab =
  | 'dashboard'
  | 'pos'
  | 'orders'
  | 'clients'
  | 'caisse'
  | 'staff'
  | 'inventory'
  | 'deliveries'
  | 'expenses'
  | 'reports'
  | 'settings'
  // Super admin tabs
  | 'saas_home'
  | 'saas_dashboard'
  | 'saas_tenants'
  | 'saas_subscriptions'
  | 'saas_plans'
  | 'saas_payments'
  | 'saas_invoices'
  | 'saas_notifications'
  | 'saas_users'
  | 'saas_logs'
  | 'saas_settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenEditorUnlock?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, onOpenEditorUnlock }) => {
  const { userRole, currentPermissions, currentTenant, state, logout } = useApp();
  const isSuperAdmin = userRole === 'super_admin';

  const activeTheme = state.uiTheme || 'amber';

  // Dynamic theme active styling
  const activeClass =
    activeTheme === 'sapphire'
      ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
      : activeTheme === 'emerald'
      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
      : activeTheme === 'midnight'
      ? 'bg-purple-600 text-white font-bold shadow-xs'
      : 'bg-amber-400 text-slate-950 font-bold shadow-xs';

  const brandPillClass =
    activeTheme === 'sapphire'
      ? 'bg-sky-400 text-slate-950'
      : activeTheme === 'emerald'
      ? 'bg-emerald-400 text-slate-950'
      : activeTheme === 'midnight'
      ? 'bg-purple-500 text-white'
      : 'bg-amber-400 text-slate-950';

  // Count active pending orders
  const pendingOrdersCount = state.orders.filter(
    (o) =>
      o.tenantId === state.currentTenantId &&
      !['delivered', 'archived'].includes(o.status)
  ).length;

  // Count pending deliveries
  const pendingDeliveriesCount = state.deliveries.filter(
    (d) =>
      d.tenantId === state.currentTenantId &&
      ['to_deliver', 'assigned', 'in_transit'].includes(d.status)
  ).length;

  // Low stock alert count
  const lowStockCount = state.inventory.filter(
    (i) =>
      i.tenantId === state.currentTenantId &&
      (i.status === 'low' || i.status === 'critical')
  ).length;

  if (isSuperAdmin || activeTab === 'dashboard') {
    // In Super Admin mode and Dashboard Home mode, the 3-columns card takes full center stage
    return null;
  }


  // Tenant Owner / Staff Navigation
  const navItems = [
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      icon: LayoutDashboard,
      visible: true,
    },
    {
      id: 'pos',
      label: 'Caisse & Dépôt POS',
      icon: Receipt,
      visible: currentPermissions.canCreateOrder || currentPermissions.canViewOrders,
      badge: 'Caisse',
    },
    {
      id: 'orders',
      label: 'Commandes & Atelier',
      icon: Package,
      visible: currentPermissions.canViewOrders,
      count: pendingOrdersCount,
    },
    {
      id: 'clients',
      label: 'Fichier Clients (CRM)',
      icon: Users,
      visible: currentPermissions.canViewClients,
    },
    {
      id: 'caisse',
      label: 'Caisse & Clôtures',
      icon: Wallet,
      visible: currentPermissions.canViewCashRegister,
    },
    {
      id: 'staff',
      label: 'Emplois & Personnel',
      icon: Briefcase,
      visible: currentPermissions.canManageEmployees || currentPermissions.canManageJobs,
    },
    {
      id: 'inventory',
      label: 'Stocks & Produits',
      icon: Boxes,
      visible: currentPermissions.canManageStock || userRole === 'owner' || userRole === 'manager',
      count: lowStockCount > 0 ? lowStockCount : undefined,
      countColor: 'bg-rose-500 text-white',
    },
    {
      id: 'deliveries',
      label: 'Livraisons',
      icon: Truck,
      visible: currentPermissions.canManageDeliveries || userRole === 'driver',
      count: pendingDeliveriesCount > 0 ? pendingDeliveriesCount : undefined,
    },
    {
      id: 'expenses',
      label: 'Dépenses & Achats',
      icon: FileSpreadsheet,
      visible: currentPermissions.canManageExpenses || userRole === 'owner',
    },
    {
      id: 'reports',
      label: 'Rapports & Statistiques',
      icon: BarChart3,
      visible: currentPermissions.canViewRevenue || userRole === 'owner',
    },
    {
      id: 'settings',
      label: 'Paramètres & SaaS',
      icon: Settings,
      visible: currentPermissions.canManageSettings || userRole === 'owner',
    },
  ];

  return (
    <aside className="w-60 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 h-[calc(100vh-3.5rem)] select-none">
      {/* Pressing Brand Banner */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <AppIconBadge size="sm" rounded="lg" />
          <div className="overflow-hidden">
            <h2 className="text-xs font-bold text-white truncate leading-tight">
              {currentTenant?.companyName || 'Mon Pressing'}
            </h2>
            <p className="text-[10px] text-slate-400 truncate">
              {currentTenant?.city} • {currentTenant?.country}
            </p>
          </div>
        </div>

        {/* Trial warning if in trial */}
        {currentTenant?.status === 'trial' && (
          <div className="mt-2.5 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-[10px] text-amber-300 flex items-center justify-between">
            <span>Essai jusqu’au {currentTenant.trialEndDate}</span>
            <button
              onClick={() => onSelectTab('settings')}
              className="text-amber-400 font-bold underline ml-1 cursor-pointer"
            >
              Payer
            </button>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
        {navItems
          .filter((item) => item.visible)
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as ActiveTab)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? activeClass
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? activeTheme === 'midnight'
                          ? 'text-white'
                          : 'text-slate-950'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      item.countColor ||
                      (isActive
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-800 text-slate-300')
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {item.badge && !item.count && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                      isActive
                        ? 'bg-slate-900 text-amber-300'
                        : 'bg-slate-800 text-amber-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
      </nav>

      {/* Footer Profile Details */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="truncate">
            <p className="text-[11px] font-semibold text-slate-200 truncate">
              {state.currentUserName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Connecté" />
              <p className="text-[10px] text-slate-400 capitalize">
                {userRole.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
            title="Verrouiller la session / Déconnexion"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Clickable AGB Logo */}
        {onOpenEditorUnlock && (
          <div
            onClick={onOpenEditorUnlock}
            className="p-2 rounded-xl bg-blue-950/40 hover:bg-blue-950/80 border border-blue-900/40 hover:border-blue-500/60 transition cursor-pointer flex items-center justify-between gap-2"
            title="Cliquez pour accéder à l'espace Éditeur / Concepteur (agibrico1)"
          >
            <div className="flex items-center gap-2">
              <AgbLogo size="sm" showDetails={false} className="scale-75 -my-1" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-sky-300 leading-tight">Éditeur AGB</p>
                <p className="text-[9px] text-slate-400 leading-tight">Accès Éditeur</p>
              </div>
            </div>
            <span className="text-[9px] font-mono text-sky-400 bg-blue-900/50 px-1.5 py-0.5 rounded">
              agibrico1
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
