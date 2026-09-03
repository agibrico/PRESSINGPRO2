import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/common/TopBar';
import { ActiveTab } from './components/common/Sidebar';
import { RoleSwitcherModal } from './components/common/RoleSwitcherModal';
import { PublicTrackerModal } from './components/common/PublicTrackerModal';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { ThemeSelectorModal } from './components/common/ThemeSelectorModal';
import { UIProposalsModal } from './components/common/UIProposalsModal';
import { EditorUnlockModal } from './components/common/EditorUnlockModal';
import { LoginGateScreen } from './components/auth/LoginGateScreen';
import { FirstLoginSetupModal } from './components/auth/FirstLoginSetupModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { POSView } from './components/pos/POSView';
import { OrdersView } from './components/orders/OrdersView';
import { ClientsView } from './components/clients/ClientsView';
import { CaisseView } from './components/caisse/CaisseView';
import { StaffView } from './components/staff/StaffView';
import { InventoryView } from './components/inventory/InventoryView';
import { DeliveriesView } from './components/deliveries/DeliveriesView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { UIProposalMode } from './types';
import { Receipt, Kanban, BarChart3, Sparkles, ArrowLeft } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { userRole, state, currentTenant, setLayoutProposal } = useApp();
  const isSuperAdmin = userRole === 'super_admin';

  const [activeTab, setActiveTab] = useState<ActiveTab>(() =>
    isSuperAdmin ? 'saas_home' : 'dashboard'
  );
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showPublicTracker, setShowPublicTracker] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showProposalsModal, setShowProposalsModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);

  const currentProposal = state.layoutProposal || 'pos_counter';

  const handleApplyProposal = (proposal: UIProposalMode) => {
    setLayoutProposal(proposal);
    if (!isSuperAdmin) {
      if (proposal === 'pos_counter') {
        setActiveTab('pos');
      } else if (proposal === 'workshop_kanban') {
        setActiveTab('orders');
      } else if (proposal === 'executive_analytics') {
        setActiveTab('dashboard');
      }
    }
  };

  // Sync tab if switched between Super Admin and normal user
  useEffect(() => {
    if (isSuperAdmin && !activeTab.startsWith('saas_')) {
      setActiveTab('saas_home');
    } else if (!isSuperAdmin && activeTab.startsWith('saas_')) {
      setActiveTab('dashboard');
    }
  }, [isSuperAdmin, activeTab]);

  // Global Ctrl+K shortcut for quick command search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeTheme = state.uiTheme || 'amber';

  const bgStyle =
    activeTheme === 'midnight'
      ? 'bg-slate-950 text-slate-100'
      : activeTheme === 'sapphire'
      ? 'bg-slate-100 text-slate-900 selection:bg-sky-200'
      : activeTheme === 'emerald'
      ? 'bg-slate-100 text-slate-900 selection:bg-emerald-200'
      : 'bg-slate-100 text-slate-900 selection:bg-amber-200';

  const mainAreaBg =
    activeTheme === 'midnight'
      ? 'bg-slate-950 text-slate-100'
      : 'bg-slate-100/90';

  // If not authenticated, display the 3-button installation/login gate screen
  if (!state.isAuthenticated) {
    return <LoginGateScreen />;
  }

  return (
    <div className={`min-h-screen ${bgStyle} flex flex-col font-sans antialiased`}>
      {/* Top Bar (Single Row, 3 Zones) */}
      <TopBar
        onOpenRoleSwitcher={() => setShowRoleSwitcher(true)}
        onOpenQuickPOS={() => setActiveTab('pos')}
        onOpenTracker={() => setShowPublicTracker(true)}
        onOpenSearch={() => setShowSearchModal(true)}
        onOpenThemeModal={() => setShowThemeModal(true)}
        onOpenProposalsModal={() => setShowProposalsModal(true)}
        onOpenEditorUnlock={() => setShowEditorModal(true)}
      />

      {/* Interactive 3-Proposal Quick Switcher Bar */}
      {!isSuperAdmin && (
        <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-1.5 flex items-center justify-start gap-2 text-xs overflow-x-auto no-scrollbar select-none">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>3 Interfaces :</span>
          </span>

          {/* Proposal 1 Button */}
          <button
            onClick={() => handleApplyProposal('pos_counter')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition font-medium cursor-pointer shrink-0 ${
              currentProposal === 'pos_counter' && activeTab === 'pos'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>1. Caisse Tactile POS</span>
          </button>

          {/* Proposal 2 Button */}
          <button
            onClick={() => handleApplyProposal('workshop_kanban')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition font-medium cursor-pointer shrink-0 ${
              currentProposal === 'workshop_kanban' && activeTab === 'orders'
                ? 'bg-sky-400 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>2. Atelier & Kanban</span>
          </button>

          {/* Proposal 3 Button */}
          <button
            onClick={() => handleApplyProposal('executive_analytics')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition font-medium cursor-pointer shrink-0 ${
              currentProposal === 'executive_analytics' && activeTab === 'dashboard'
                ? 'bg-emerald-400 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>3. Direction Executive</span>
          </button>
        </div>
      )}

      {/* Main Body - Full Width (No Sidebar) */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* Content Area */}
        <main className={`flex-1 overflow-y-auto ${mainAreaBg} h-[calc(100vh-3.5rem)] w-full`}>
          {isSuperAdmin ? (
            <SuperAdminDashboard activeTab={activeTab} onSelectTab={setActiveTab} />
          ) : (
            <>
              {/* Back to Home Quick Navigation Bar */}
              {activeTab !== 'dashboard' && (
                <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xs">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-extrabold transition shadow-xs cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>← Menu Principal</span>
                  </button>
                  <span className="text-[11px] font-mono font-semibold text-slate-400">
                    Espace Pressing • {currentTenant?.companyName || 'Mon Pressing'}
                  </span>
                </div>
              )}

              {activeTab === 'dashboard' && (
                <DashboardView
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onOpenQuickPOS={() => setActiveTab('pos')}
                />
              )}
              {activeTab === 'pos' && <POSView />}
              {activeTab === 'orders' && <OrdersView />}
              {activeTab === 'clients' && <ClientsView />}
              {activeTab === 'caisse' && <CaisseView />}
              {activeTab === 'staff' && <StaffView />}
              {activeTab === 'inventory' && <InventoryView />}
              {activeTab === 'deliveries' && <DeliveriesView />}
              {activeTab === 'expenses' && <ExpensesView />}
              {activeTab === 'reports' && <ReportsView />}
              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <FirstLoginSetupModal />

      <UIProposalsModal
        isOpen={showProposalsModal}
        onClose={() => setShowProposalsModal(false)}
        onApplyProposal={handleApplyProposal}
      />

      <EditorUnlockModal
        isOpen={showEditorModal}
        onClose={() => setShowEditorModal(false)}
      />

      <RoleSwitcherModal
        isOpen={showRoleSwitcher}
        onClose={() => setShowRoleSwitcher(false)}
      />

      <PublicTrackerModal
        isOpen={showPublicTracker}
        onClose={() => setShowPublicTracker(false)}
      />

      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      <ThemeSelectorModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        onOpenProposalsModal={() => setShowProposalsModal(true)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;

