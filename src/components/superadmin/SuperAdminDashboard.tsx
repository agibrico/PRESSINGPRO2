import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  CreditCard,
  Crown,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  HelpCircle,
  History,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Package,
  Phone,
  Plus,
  Printer,
  QrCode,
  Radio,
  Receipt,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  TrendingUp,
  Unlock,
  User,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  PaymentMethod,
  SaaSEditorPermissions,
  SaaSEditorUser,
  SaaSInvoice,
  SaaSPlan,
  SubscriptionPlanTier,
  Tenant,
} from '../../types';
import {
  DEFAULT_COLLABORATOR_PERMISSIONS,
  DEFAULT_EDITOR_OWNER_PERMISSIONS,
} from '../../services/defaultData';
import { formatFCFA, PAYMENT_METHOD_CONFIG } from '../../services/store';
import { soundFX } from '../../services/sound';
import { AgbLogo } from '../common/AgbLogo';
import { AppIconBadge } from '../common/AppIconBadge';

interface SuperAdminDashboardProps {
  activeTab?: string;
  onSelectTab?: (tab: any) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  activeTab = 'saas_home',
  onSelectTab,
}) => {
  const {
    state,
    currentEditorUser,
    isEditorOwner,
    switchRole,
    createTenant,
    updateTenant,
    suspendTenant,
    reactivateTenant,
    deleteTenant,
    extendTrial,
    recordSaaSPayment,
    createSaaSInvoice,
    updateSaaSInvoiceStatus,
    updateSaaSPlan,
    sendBroadcastNotification,
    deleteBroadcastNotification,
    createEditorUser,
    updateEditorUser,
    deleteEditorUser,
    updateEditorUserPermissions,
    updateSaaSGlobalSettings,
    updateEditorPassword,
    resetEditorUserPassword,
    resetVirginStateForProduction,
    logout,
  } = useApp();

  // Active user's permissions
  const userPermissions: SaaSEditorPermissions = isEditorOwner
    ? DEFAULT_EDITOR_OWNER_PERMISSIONS
    : (currentEditorUser?.permissions || DEFAULT_COLLABORATOR_PERMISSIONS);

  // Internal tab state mapping from sidebar or top navigation
  const currentTab = activeTab.replace('saas_', '') || 'home';
  const isHome = currentTab === 'home';

  const setTab = (tabName: string) => {
    if (onSelectTab) {
      onSelectTab(`saas_${tabName}`);
    }
  };

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilterMethod, setPaymentFilterMethod] = useState<string>('all');
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState<string>('all');

  // Accès Éditeur Sub-View states
  const [editorSubView, setEditorSubView] = useState<'admin' | 'collaborators'>('collaborators');
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const [collaboratorRoleFilter, setCollaboratorRoleFilter] = useState<'all' | 'support_tech' | 'billing_manager' | 'collaborator' | 'auditor'>('all');
  const [resetPasswordToast, setResetPasswordToast] = useState<string | null>(null);

  // Modals state
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);
  const [showEditTenantModal, setShowEditTenantModal] = useState(false);
  const [selectedTenantToEdit, setSelectedTenantToEdit] = useState<Tenant | null>(null);

  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [selectedTenantForPay, setSelectedTenantForPay] = useState<Tenant | null>(null);
  const [payMonths, setPayMonths] = useState<number>(1);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('wave');
  const [customRef, setCustomRef] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SaaSInvoice | null>(null);

  // 1-Click Reactivation Feedback Toast
  const [reactivatedNotice, setReactivatedNotice] = useState<{
    tenantName: string;
    planName: string;
    expiryDate: string;
  } | null>(null);

  const handleOneClickReactivate = (tenant: Tenant) => {
    reactivateTenant(tenant.id, 30);
    const now = new Date();
    const newDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    setReactivatedNotice({
      tenantName: tenant.companyName,
      planName: tenant.planName,
      expiryDate: newDate,
    });
    soundFX.playSuccess();
    setTimeout(() => {
      setReactivatedNotice(null);
    }, 6000);
  };

  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [newInvoiceTenantId, setNewInvoiceTenantId] = useState<string>('');
  const [newInvoiceMonths, setNewInvoiceMonths] = useState<number>(1);
  const [newInvoicePlanTier, setNewInvoicePlanTier] = useState<SubscriptionPlanTier>('pro');

  const [showCreateNotifModal, setShowCreateNotifModal] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'warning' | 'urgent' | 'promo'>('info');
  const [notifTarget, setNotifTarget] = useState<'all_tenants' | 'specific_tenant'>('all_tenants');
  const [notifTargetTenantId, setNotifTargetTenantId] = useState<string>('');

  const [showAddEditorUserModal, setShowAddEditorUserModal] = useState(false);
  const [editorUserName, setEditorUserName] = useState('');
  const [editorUserEmail, setEditorUserEmail] = useState('');
  const [editorUserPhone, setEditorUserPhone] = useState('+225 ');
  const [editorUserRole, setEditorUserRole] = useState<SaaSEditorUser['role']>('collaborator');

  // Collaborator Permissions Matrix Modal State
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedCollabForPerms, setSelectedCollabForPerms] = useState<SaaSEditorUser | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<SaaSEditorPermissions>(DEFAULT_COLLABORATOR_PERMISSIONS);
  const [permSavedNotice, setPermSavedNotice] = useState<string | null>(null);

  // Helper to open permissions modal for a specific user or default collaborator
  const handleOpenPermissionsModal = (user?: SaaSEditorUser) => {
    const targetUser = user || state.saasEditorUsers.find((u) => !u.isOwner) || state.saasEditorUsers[0];
    if (targetUser) {
      setSelectedCollabForPerms(targetUser);
      setEditingPermissions(targetUser.permissions || (targetUser.isOwner ? DEFAULT_EDITOR_OWNER_PERMISSIONS : DEFAULT_COLLABORATOR_PERMISSIONS));
    }
    setShowPermissionsModal(true);
  };

  const handleSelectCollabForPerms = (user: SaaSEditorUser) => {
    setSelectedCollabForPerms(user);
    setEditingPermissions(user.permissions || (user.isOwner ? DEFAULT_EDITOR_OWNER_PERMISSIONS : DEFAULT_COLLABORATOR_PERMISSIONS));
  };

  const handleSavePermissions = () => {
    if (!selectedCollabForPerms) return;
    updateEditorUserPermissions(selectedCollabForPerms.id, editingPermissions);
    soundFX.playCashChime();
    setPermSavedNotice(`Permissions mises à jour avec succès pour ${selectedCollabForPerms.name}`);
    setTimeout(() => {
      setPermSavedNotice(null);
    }, 4000);
  };

  // Custom Fields state
  const [showAddCustomFieldModal, setShowAddCustomFieldModal] = useState(false);
  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldLabel, setCustomFieldLabel] = useState('');
  const [customFieldDescription, setCustomFieldDescription] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');
  const [customFieldSuccessMsg, setCustomFieldSuccessMsg] = useState('');

  // Virgin state reset modal
  const [showResetVirginModal, setShowResetVirginModal] = useState(false);
  const [virginResetConfirmText, setVirginResetConfirmText] = useState('');

  const [showChangeEditorPassModal, setShowChangeEditorPassModal] = useState(false);
  const [newEditorPass, setNewEditorPass] = useState('');
  const [confirmEditorPass, setConfirmEditorPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  // Form states for creating tenant (new client)
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('+225 ');
  const [newOwnerWhatsapp, setNewOwnerWhatsapp] = useState('+225 ');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newCity, setNewCity] = useState('Abidjan');
  const [newPlanTier, setNewPlanTier] = useState<SubscriptionPlanTier>('pro');
  const [newInitialStatus, setNewInitialStatus] = useState<'trial' | 'active'>('trial');
  const [newTrialDays, setNewTrialDays] = useState<number>(14);

  // States for adding additional pressing for an existing subscribed client
  const [showAddAdditionalPressingModal, setShowAddAdditionalPressingModal] = useState(false);
  const [selectedClientTenantId, setSelectedClientTenantId] = useState<string>('');
  const [additionalPressingName, setAdditionalPressingName] = useState<string>('');
  const [additionalPressingCity, setAdditionalPressingCity] = useState<string>('Abidjan');
  const [additionalPressingAddress, setAdditionalPressingAddress] = useState<string>('');
  const [additionalPressingPlanTier, setAdditionalPressingPlanTier] = useState<SubscriptionPlanTier>('pro');
  const [additionalPressingStatus, setAdditionalPressingStatus] = useState<'trial' | 'active'>('active');
  const [additionalPressingAgencyPhone, setAdditionalPressingAgencyPhone] = useState<string>('');
  const [additionalCreatedNotice, setAdditionalCreatedNotice] = useState<{
    companyName: string;
    ownerName: string;
  } | null>(null);

  // SaaS Financial KPIs calculations
  const totalSaaSCashIn = state.saasPayments.reduce((sum, p) => sum + p.amount, 0);
  const activeTenants = state.tenants.filter((t) => t.status === 'active');
  const trialTenants = state.tenants.filter((t) => t.status === 'trial');
  const suspendedTenants = state.tenants.filter((t) => t.status === 'suspended');
  const overdueInvoices = state.saasInvoices.filter((inv) => inv.status === 'overdue');
  const totalOverdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  // MRR (Monthly Recurring Revenue) estimation
  const currentMRR = activeTenants.reduce((acc, t) => {
    if (t.planTier === 'basic') return acc + 25000;
    if (t.planTier === 'pro') return acc + 50000;
    if (t.planTier === 'premium') return acc + 95000;
    return acc + 50000;
  }, 0);

  const currentARR = currentMRR * 12;

  // Global platform orders statistics across all tenants
  const totalOrdersNetwork = state.orders.length;
  const totalRevenueNetwork = state.orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalClientsNetwork = state.clients.length;

  // Filtered tenants
  const filteredTenants = state.tenants.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return (
        t.companyName.toLowerCase().includes(q) ||
        t.ownerName.toLowerCase().includes(q) ||
        t.ownerPhone.includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered payments
  const filteredPayments = state.saasPayments.filter((p) => {
    if (paymentFilterMethod !== 'all' && p.paymentMethod !== paymentFilterMethod) return false;
    return true;
  });

  // Filtered invoices
  const filteredInvoices = state.saasInvoices.filter((inv) => {
    if (invoiceFilterStatus !== 'all' && inv.status !== invoiceFilterStatus) return false;
    return true;
  });

  // Handler for creating a tenant
  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName || !newOwnerName || !newOwnerPhone) return;

    const planObj = state.saasPlans.find((p) => p.tier === newPlanTier);
    const planName = planObj?.name || (newPlanTier === 'basic' ? 'Formule STARTER' : newPlanTier === 'premium' ? 'Formule ENTERPRISE PREMIUM' : 'Formule PRO EXPANSION');

    const today = new Date();
    const trialEnd = new Date(today.getTime() + newTrialDays * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const subEnd = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    createTenant({
      companyName: newCompanyName.trim(),
      ownerName: newOwnerName.trim(),
      ownerPhone: newOwnerPhone.trim(),
      ownerWhatsapp: newOwnerWhatsapp.trim() || newOwnerPhone.trim(),
      ownerEmail: newOwnerEmail.trim() || `${newCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '')}@pressing.ci`,
      city: newCity,
      country: "Côte d'Ivoire",
      planTier: newPlanTier,
      planName,
      status: newInitialStatus,
      trialStartDate: newInitialStatus === 'trial' ? today.toISOString().substring(0, 10) : undefined,
      trialEndDate: newInitialStatus === 'trial' ? trialEnd : undefined,
      subscriptionStartDate: newInitialStatus === 'active' ? today.toISOString().substring(0, 10) : undefined,
      subscriptionEndDate: newInitialStatus === 'active' ? subEnd : undefined,
      outstandingBalance: 0,
    });

    soundFX.playCashChime();
    setShowCreateTenantModal(false);
    setNewCompanyName('');
    setNewOwnerName('');
    setNewOwnerPhone('+225 ');
    setNewOwnerWhatsapp('+225 ');
    setNewOwnerEmail('');
  };

  // Handler for creating an additional pressing for an existing subscribed client
  const handleAddAdditionalPressing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!additionalPressingName.trim()) return;

    const parentTenant = state.tenants.find((t) => t.id === selectedClientTenantId) || state.tenants[0];
    if (!parentTenant) return;

    const planObj = state.saasPlans.find((p) => p.tier === additionalPressingPlanTier);
    const planName = planObj?.name || (additionalPressingPlanTier === 'basic' ? 'Formule STARTER' : additionalPressingPlanTier === 'premium' ? 'Formule ENTERPRISE PREMIUM' : 'Formule PRO EXPANSION');

    const today = new Date();
    const subEnd = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const trialEnd = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    createTenant({
      companyName: additionalPressingName.trim(),
      slug: additionalPressingName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      ownerName: parentTenant.ownerName,
      ownerPhone: parentTenant.ownerPhone,
      ownerWhatsapp: parentTenant.ownerWhatsapp || parentTenant.ownerPhone,
      ownerEmail: parentTenant.ownerEmail,
      city: additionalPressingCity,
      country: "Côte d'Ivoire",
      planTier: additionalPressingPlanTier,
      planName,
      status: additionalPressingStatus,
      trialStartDate: additionalPressingStatus === 'trial' ? today.toISOString().substring(0, 10) : undefined,
      trialEndDate: additionalPressingStatus === 'trial' ? trialEnd : undefined,
      subscriptionStartDate: additionalPressingStatus === 'active' ? today.toISOString().substring(0, 10) : undefined,
      subscriptionEndDate: additionalPressingStatus === 'active' ? subEnd : undefined,
      outstandingBalance: 0,
      receiptHeader: `${additionalPressingName.trim().toUpperCase()}\nAgence ${additionalPressingCity} • Groupe ${parentTenant.companyName}`,
    });

    soundFX.playCashChime();
    setShowAddAdditionalPressingModal(false);
    setAdditionalCreatedNotice({
      companyName: additionalPressingName.trim(),
      ownerName: parentTenant.ownerName,
    });
    setTimeout(() => {
      setAdditionalCreatedNotice(null);
    }, 6000);

    // Reset inputs
    setAdditionalPressingName('');
    setAdditionalPressingAddress('');
    setAdditionalPressingAgencyPhone('');
  };

  // Handler for editing tenant
  const handleSaveTenantEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantToEdit) return;

    updateTenant(selectedTenantToEdit.id, {
      companyName: selectedTenantToEdit.companyName,
      ownerName: selectedTenantToEdit.ownerName,
      ownerPhone: selectedTenantToEdit.ownerPhone,
      ownerWhatsapp: selectedTenantToEdit.ownerWhatsapp,
      ownerEmail: selectedTenantToEdit.ownerEmail,
      city: selectedTenantToEdit.city,
      planTier: selectedTenantToEdit.planTier,
      planName: selectedTenantToEdit.planName,
      status: selectedTenantToEdit.status,
    });

    soundFX.playBeep();
    setShowEditTenantModal(false);
    setSelectedTenantToEdit(null);
  };

  // Handler for recording SaaS payment
  const handleRecordSaaSPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantForPay) return;

    const plan = state.saasPlans.find((p) => p.tier === selectedTenantForPay.planTier);
    const monthlyRate = plan?.priceMonthly || (selectedTenantForPay.planTier === 'basic' ? 25000 : selectedTenantForPay.planTier === 'premium' ? 95000 : 50000);
    const amount = payMonths >= 12 && plan?.priceYearly ? plan.priceYearly : monthlyRate * payMonths;

    const today = new Date();
    const startDate = today.toISOString().substring(0, 10);
    const endDate = new Date(today.getTime() + payMonths * 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    const ref = customRef.trim() || `${payMethod.toUpperCase()}-CI-${Date.now().toString().substring(5)}`;

    recordSaaSPayment({
      tenantId: selectedTenantForPay.id,
      tenantName: selectedTenantForPay.companyName,
      ownerName: selectedTenantForPay.ownerName,
      ownerPhone: selectedTenantForPay.ownerPhone,
      planTier: selectedTenantForPay.planTier,
      planName: selectedTenantForPay.planName,
      amount,
      billingCycle: payMonths >= 12 ? 'yearly' : 'monthly',
      paymentMethod: payMethod,
      transactionReference: ref,
      recordedByAdminName: state.saasGlobalSettings?.publisherAuthor || 'Gilles Brice Atsé',
      paymentDate: startDate,
      coverageStartDate: startDate,
      coverageEndDate: endDate,
      status: 'completed',
      notes: payNotes || `Règlement SaaS ${payMonths} mois validé en ${payMethod.toUpperCase()}`,
    });

    soundFX.playCashChime();
    setShowRecordPaymentModal(false);
    setSelectedTenantForPay(null);
    setCustomRef('');
    setPayNotes('');
  };

  // Handler for creating broadcast notification
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;

    const targetTenant = state.tenants.find((t) => t.id === notifTargetTenantId);

    sendBroadcastNotification({
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      type: notifType,
      target: notifTarget,
      targetTenantId: notifTarget === 'specific_tenant' ? notifTargetTenantId : undefined,
      targetTenantName: notifTarget === 'specific_tenant' ? targetTenant?.companyName : undefined,
    });

    soundFX.playBeep();
    setShowCreateNotifModal(false);
    setNotifTitle('');
    setNotifMessage('');
  };

  // Handler for creating invoice manually
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = state.tenants.find((t) => t.id === newInvoiceTenantId);
    if (!tenant) return;

    const plan = state.saasPlans.find((p) => p.tier === newInvoicePlanTier);
    const unitPrice = plan?.priceMonthly || (newInvoicePlanTier === 'basic' ? 25000 : newInvoicePlanTier === 'premium' ? 95000 : 50000);
    const subtotal = newInvoiceMonths >= 12 && plan?.priceYearly ? plan.priceYearly : unitPrice * newInvoiceMonths;

    const today = new Date();
    const issueDate = today.toISOString().substring(0, 10);
    const dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const coverageEndDate = new Date(today.getTime() + newInvoiceMonths * 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    const invoice = createSaaSInvoice({
      tenantId: tenant.id,
      tenantName: tenant.companyName,
      ownerName: tenant.ownerName,
      ownerPhone: tenant.ownerPhone,
      ownerEmail: tenant.ownerEmail,
      ownerAddress: `${tenant.city}, Côte d'Ivoire`,
      planTier: newInvoicePlanTier,
      planName: plan?.name || (newInvoicePlanTier === 'basic' ? 'Formule STARTER' : 'Formule PRO EXPANSION'),
      billingCycle: newInvoiceMonths >= 12 ? 'yearly' : 'monthly',
      coverageStartDate: issueDate,
      coverageEndDate,
      subtotal,
      taxAmount: 0,
      totalAmount: subtotal,
      paymentMethod: 'wave',
      transactionReference: `PROFORMA-${Date.now().toString().substring(6)}`,
      status: 'pending',
      issueDate,
      dueDate,
      items: [
        {
          description: `Abonnement Plateforme MON PRESSING PRO - ${plan?.name || 'Formule Pro'} (${newInvoiceMonths} mois)`,
          quantity: newInvoiceMonths,
          unitPrice,
          total: subtotal,
        },
      ],
      notes: `Facture émise pour ${tenant.companyName}. Merci de régler via Wave ou Orange Money.`,
    });

    soundFX.playCashChime();
    setShowCreateInvoiceModal(false);
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  // WhatsApp dunning reminder message generator
  const sendWhatsAppDunning = (tenant: Tenant, invoice?: SaaSInvoice) => {
    const amount = invoice ? invoice.totalAmount : tenant.planTier === 'basic' ? 25000 : tenant.planTier === 'premium' ? 95000 : 50000;
    const cleanPhone = tenant.ownerWhatsapp.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Bonjour M./Mme ${tenant.ownerName},\n\nNous vous contactons de la part de l'éditeur AGB Solutions concernant votre abonnement logicel MON PRESSING PRO (${tenant.companyName}).\n\nVotre abonnement est arrivé à échéance. Montant à régulariser: ${formatFCFA(amount)}.\n\nModes de règlement instantané disponibles :\n- Wave Pro : ${state.saasGlobalSettings?.wavePaymentNumber || '+225 07 08 09 10 11'}\n- Orange Money Code Marchand : ${state.saasGlobalSettings?.orangeMoneyMerchantCode || 'OM-CI-88992'}\n\nMerci de votre confiance et bonne journée !`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const saasModules = [
    {
      id: 'dashboard',
      num: '01',
      label: 'Stats & KPIs',
      fullLabel: "Vue d'Ensemble & Stats",
      desc: 'Revenus MRR/ARR, volume réseau et indicateurs globaux',
      icon: BarChart3,
      badge: `${formatFCFA(currentMRR)}`,
      badgeColor: 'bg-purple-900/90 text-purple-200 border-purple-700',
      iconBg: 'bg-purple-600',
    },
    {
      id: 'tenants',
      num: '02',
      label: 'Pressings',
      fullLabel: 'Pressings & Clients',
      desc: 'Création, modification, suspension et accès direct',
      icon: Building,
      badge: `${state.tenants.length}`,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      iconBg: 'bg-blue-600',
    },
    {
      id: 'subscriptions',
      num: '03',
      label: 'Abonnem.',
      fullLabel: 'Abonnements & Essais',
      desc: 'Suivi des tests 14 jours, prolongations et échéances',
      icon: Layers,
      badge: trialTenants.length > 0 ? `${trialTenants.length} essai` : undefined,
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800',
      iconBg: 'bg-amber-600',
    },
    {
      id: 'plans',
      num: '04',
      label: 'Tarifs SaaS',
      fullLabel: 'Formules & Tarifs SaaS',
      desc: 'Starter, Pro, Enterprise & matrice des fonctionnalités',
      icon: Crown,
      badge: undefined,
      badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-800',
      iconBg: 'bg-indigo-600',
    },
    {
      id: 'payments',
      num: '05',
      label: 'Paiements',
      fullLabel: 'Paiements & Encaissements',
      desc: 'Wave, Orange Money, MoMo, Espèces & reçus',
      icon: Smartphone,
      badge: `${state.saasPayments.length}`,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      iconBg: 'bg-emerald-600',
    },
    {
      id: 'invoices',
      num: '06',
      label: 'Factures',
      fullLabel: 'Factures & Impayés',
      desc: 'Émission proforma, relances WhatsApp et arriérés',
      icon: Receipt,
      badge: overdueInvoices.length > 0 ? `${overdueInvoices.length} impayé` : undefined,
      badgeColor: 'bg-rose-950/90 text-rose-300 border-rose-800 font-bold',
      iconBg: 'bg-rose-600',
      isAlert: overdueInvoices.length > 0,
    },
    {
      id: 'notifications',
      num: '07',
      label: 'Diffusion',
      fullLabel: 'Diffusion & Notifications',
      desc: 'Alertes push gérants, maintenance et messages ciblés',
      icon: Megaphone,
      badge: `${state.broadcastNotifications.length}`,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      iconBg: 'bg-sky-600',
    },
    {
      id: 'users',
      num: '08',
      label: 'Accès Éditeur',
      fullLabel: 'Accès Éditeur (Administrateur & Collaborateurs)',
      desc: 'Gestion des rôles, permissions et habilitations Super Admin',
      icon: ShieldCheck,
      badge: `${state.saasEditorUsers.length}`,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      iconBg: 'bg-teal-600',
    },
    {
      id: 'logs',
      num: '09',
      label: 'Journaux',
      fullLabel: 'Journaux d’Activité',
      desc: 'Historique inviolable et traçabilité des opérations',
      icon: Shield,
      badge: undefined,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      iconBg: 'bg-slate-700',
    },
    {
      id: 'settings',
      num: '10',
      label: 'Paramètres',
      fullLabel: 'Paramètres Globaux SaaS',
      desc: 'Coordonnées AGB, numéros Wave/OM et version',
      icon: Settings,
      badge: undefined,
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
      iconBg: 'bg-purple-700',
    },
  ];

  const activeModuleObj = saasModules.find((m) => m.id === currentTab) || saasModules[0];

  return (
    <div className="min-h-full">
      {/* ========================================================================= */}
      {/* 1. ACCUEIL ÉDITEUR : EXACTEMENT LA VUE DARK 3 COLONNES DE L'IMAGE         */}
      {/* ========================================================================= */}
      {isHome && (
        <div className="p-3 sm:p-6 flex items-center justify-center min-h-[calc(100vh-4rem)] animate-in fade-in duration-200">
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-slate-900 text-slate-300 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-purple-950/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AppIconBadge size="sm" rounded="lg" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs sm:text-sm font-bold text-purple-200 uppercase tracking-wider">
                        SUPER ADMIN / ÉDITEUR
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-400">
                      Logiciel de Gestion • Espace Central SaaS
                    </p>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] bg-purple-900/90 text-purple-200 px-2.5 py-0.5 rounded-full font-mono font-bold border border-purple-700">
                  ÉDITEUR
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="px-4 pt-3 pb-1 flex items-center gap-2">
              <span className="h-px bg-slate-800 flex-1" />
              <span className="text-[9px] sm:text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
                MODULES DE SUPERVISION
              </span>
              <span className="h-px bg-slate-800 flex-1" />
            </div>

            {/* 3 COLUMNS GRID */}
            <div className="p-3 sm:p-4 grid grid-cols-3 gap-2.5 sm:gap-3">
              {saasModules.map((mod) => {
                const Icon = mod.icon;

                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setTab(mod.id);
                      soundFX.playBeep();
                    }}
                    title={mod.fullLabel}
                    className="flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl border border-slate-800 bg-slate-800/80 hover:bg-slate-800 hover:border-purple-500/60 hover:shadow-lg transition-all duration-200 cursor-pointer min-h-[96px] sm:min-h-[105px] group active:scale-95 relative overflow-hidden"
                  >
                    {/* Top row: Module index & alert indicator */}
                    <div className="w-full flex items-center justify-between text-[9px] font-mono leading-none mb-1">
                      <span className="text-slate-500 group-hover:text-purple-400 font-bold transition-colors">
                        #{mod.num}
                      </span>
                      {mod.isAlert && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </div>

                    {/* Center Icon */}
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-1 shadow-xs transition-transform group-hover:scale-110 ${
                        mod.isAlert
                          ? 'bg-rose-900/60 text-rose-300'
                          : 'bg-slate-700/80 text-slate-200 group-hover:bg-purple-600 group-hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>

                    {/* Label */}
                    <span className="text-[10.5px] sm:text-xs font-semibold text-slate-200 group-hover:text-white leading-tight text-center w-full truncate px-0.5">
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

            {/* SuperAdmin Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col gap-2.5">
              {isEditorOwner && (
                <button
                  onClick={() => handleOpenPermissionsModal()}
                  className="w-full py-2 px-3 bg-purple-950/90 hover:bg-purple-900 border border-purple-700/60 rounded-xl text-purple-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>⚙️ Gestion des Permissions Collaborateurs</span>
                </button>
              )}
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <p className="text-xs font-bold text-purple-300 truncate">
                    {state.saasGlobalSettings?.publisherAuthor || 'Gilles Brice Atsé'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Éditeur SaaS • v{state.saasGlobalSettings?.appVersion || '3.4.2 Pro B2B'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition-colors cursor-pointer"
                  title="Quitter la session éditeur"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex justify-center">
                <AgbLogo size="sm" showDetails={false} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EN-TÊTE DU MODULE OUVERT (AVEC BOUTON RETOUR MENU D'ACCUEIL)             */}
      {/* ========================================================================= */}
      {!isHome && (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-3.5 sm:p-4 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setTab('home');
                  soundFX.playBeep();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Menu Principal</span>
              </button>

              <div className="h-6 w-px bg-slate-800 hidden sm:block" />

              <div className="flex items-center gap-2.5">
                <AppIconBadge size="sm" rounded="lg" />
                <div className={`p-2 rounded-xl ${activeModuleObj?.iconBg || 'bg-purple-600'} text-white shrink-0 shadow-xs`}>
                  {activeModuleObj && <activeModuleObj.icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-700">
                      MODULE #{activeModuleObj?.num}
                    </span>
                    <h2 className="text-xs sm:text-sm font-bold text-white">
                      {activeModuleObj?.fullLabel || activeModuleObj?.label}
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden sm:block">{activeModuleObj?.desc}</p>
                </div>
              </div>
            </div>

            {/* Super Admin Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {isEditorOwner && (
                <button
                  onClick={() => handleOpenPermissionsModal()}
                  className="px-3.5 py-2 bg-purple-700/80 hover:bg-purple-600 border border-purple-500/60 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition hover:scale-[1.02] active:scale-95"
                  title="Ouvrir l'interface des permissions d'intervention pour les collaborateurs"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>⚙️ Permissions Collaborateurs</span>
                </button>
              )}
            </div>
          </div>

          {/* 1-Click Reactivation Toast Notification */}
          {reactivatedNotice && (
            <div className="bg-emerald-700 text-white px-4 py-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-300 border border-emerald-500">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-800 rounded-xl text-amber-300 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                    <span>✓ Client réactivé avec succès en 1 clic !</span>
                    <span className="bg-emerald-900/90 text-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-mono">
                      ACCÈS RÉTABLI
                    </span>
                  </p>
                  <p className="text-[11px] sm:text-xs text-emerald-100 mt-0.5">
                    L'abonnement de <strong>{reactivatedNotice.tenantName}</strong> ({reactivatedNotice.planName}) est désormais débloqué et opérationnel jusqu'au <strong>{reactivatedNotice.expiryDate}</strong> (+30 jours offerts/activés).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReactivatedNotice(null)}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800 transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Additional Pressing Created Toast Notification */}
          {additionalCreatedNotice && (
            <div className="bg-purple-900 text-white px-4 py-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-300 border border-purple-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-800 rounded-xl text-amber-300 shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                    <span>✓ Nouveau pressing supplémentaire créé avec succès !</span>
                    <span className="bg-purple-800 text-purple-200 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                      MULTI-PRESSING
                    </span>
                  </p>
                  <p className="text-[11px] sm:text-xs text-purple-200 mt-0.5">
                    Le pressing <strong>{additionalCreatedNotice.companyName}</strong> a été rattaché au compte du client abonné <strong>{additionalCreatedNotice.ownerName}</strong> avec ses accès prêts à l'emploi.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAdditionalCreatedNotice(null)}
                className="p-1.5 text-purple-300 hover:text-white rounded-lg hover:bg-purple-800 transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

      {/* ========================================================================= */}
      {/* 1. VUE D'ENSEMBLE & STATISTIQUES GLOBALES SAAS                            */}
      {/* ========================================================================= */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Alert box for suspended tenants with 1-click reactivation */}
          {suspendedTenants.length > 0 && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-100 rounded-xl text-rose-700 shrink-0">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-rose-950 text-sm flex items-center gap-2">
                      <span>⚠️ Attention : {suspendedTenants.length} Pressing(s) avec abonnement actuellement suspendu</span>
                    </h3>
                    <p className="text-xs text-rose-800">
                      Les accès aux caisses et à l'atelier sont bloqués. Vous pouvez rétablir leur service immédiatement en 1 clic sans formalité.
                    </p>
                  </div>
                </div>
                <span className="self-start sm:self-center text-[10px] font-bold bg-rose-200 text-rose-900 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {suspendedTenants.length} BLOQUÉ(S)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {suspendedTenants.map((st) => (
                  <div
                    key={st.id}
                    className="bg-white p-3.5 rounded-lg border border-rose-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{st.companyName}</span>
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                          SUSPENDU
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {st.ownerName} • 📞 {st.ownerPhone} • Formule: {st.planName}
                      </p>
                      {st.outstandingBalance > 0 && (
                        <p className="text-[11px] text-rose-700 font-semibold font-mono mt-0.5">
                          Impayé: {formatFCFA(st.outstandingBalance)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOneClickReactivate(st)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition transform active:scale-95 whitespace-nowrap"
                        title="Réactiver ce client en 1 clic (+30 jours de validité)"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>⚡ Réactiver en 1 clic</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main KPI metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">REVENU RÉCURRENT (MRR)</span>
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono text-purple-950">{formatFCFA(currentMRR)}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span>Projection ARR:</span>
                <span className="font-bold text-slate-700">{formatFCFA(currentARR)}/an</span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">PRESSINGS ACTIFS</span>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <Building className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-800">{activeTenants.length} entreprises</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span>Taux de rétention:</span>
                <span className="font-bold text-emerald-600">96.4%</span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">EN PÉRIODE D’ESSAI</span>
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono text-amber-800">{trialTenants.length} pressings</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span>Essai gratuit:</span>
                <span className="font-bold text-amber-700">14 jours par défaut</span>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">IMPAYÉS & EN RETARD</span>
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold font-mono text-rose-800">{formatFCFA(totalOverdueAmount)}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span>Factures échues:</span>
                <span className="font-bold text-rose-700">{overdueInvoices.length} dossier(s)</span>
              </div>
            </div>
          </div>

          {/* Network Activity Metrics: Whole Platform Activity */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 border border-slate-700 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-400" />
                  Activité Globale Réseau Plateforme MON PRESSING PRO
                </h3>
                <p className="text-xs text-slate-400">
                  Volume agrégé traité par l'ensemble des pressings abonnés sur le territoire national
                </p>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                SYNC EN TEMPS RÉEL
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-[11px] uppercase font-bold">TOTAL COMMANDES TRAITÉES</p>
                <p className="text-xl font-bold font-mono text-sky-400 mt-1">{totalOrdersNetwork} dépôts</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Sur l'ensemble des ateliers clients</p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-[11px] uppercase font-bold">CHIFFRE D’AFFAIRES RÉSEAU ENCAISSÉ</p>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-1">{formatFCFA(totalRevenueNetwork)}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Flux financier traité par les caisses</p>
              </div>

              <div className="bg-slate-800/80 p-3.5 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-[11px] uppercase font-bold">CLIENTS FINAUX ENREGISTRÉS</p>
                <p className="text-xl font-bold font-mono text-amber-400 mt-1">{totalClientsNetwork} particuliers & pros</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Base de données clients actifs</p>
              </div>
            </div>
          </div>

          {/* Quick SaaS Overview Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Last Registered Pressings */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-600" />
                  Dernières Entreprises Pressing Inscrites
                </h3>
                <button
                  onClick={() => setTab('tenants')}
                  className="text-xs text-purple-700 font-semibold hover:underline"
                >
                  Voir tous ({state.tenants.length}) →
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {state.tenants.slice(0, 5).map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{t.companyName}</span>
                        <span className="text-[10px] bg-purple-50 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                          {t.planTier.toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : t.status === 'trial'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {t.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {t.ownerName} • 📞 {t.ownerPhone} • 📍 {t.city}
                      </p>
                    </div>

                    <button
                      onClick={() => switchRole('owner', t.id)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold transition cursor-pointer shrink-0"
                      title="Se connecter au tableau de bord de ce pressing"
                    >
                      Entrer →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent SaaS Payments */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Derniers Encaissements SaaS (Mobile Money & Espèces)
                </h3>
                <button
                  onClick={() => setTab('payments')}
                  className="text-xs text-purple-700 font-semibold hover:underline"
                >
                  Historique ({state.saasPayments.length}) →
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {state.saasPayments.slice(0, 5).map((pay) => (
                  <div key={pay.id} className="py-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{pay.tenantName}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded capitalize">
                          {pay.paymentMethod}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Réf: {pay.transactionReference} • {pay.paymentDate}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-purple-900 text-xs block">
                        {formatFCFA(pay.amount)}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                        ENCAISSÉ ✓
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GESTION DES CLIENTS & ENTREPRISES PRESSING (TENANTS)                    */}
      {/* ========================================================================= */}
      {currentTab === 'tenants' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom de pressing, gérant, téléphone ou ville..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium cursor-pointer"
              >
                <option value="all">Tous les états ({state.tenants.length})</option>
                <option value="active">Actifs ({activeTenants.length})</option>
                <option value="trial">En essai ({trialTenants.length})</option>
                <option value="suspended">🔴 Suspendus ({suspendedTenants.length})</option>
              </select>

              {userPermissions.canCreateTenants && (
                <button
                  onClick={() => setShowCreateTenantModal(true)}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs whitespace-nowrap"
                  title="Créer une nouvelle entreprise client indépendante"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouveau Pressing</span>
                </button>
              )}

              {userPermissions.canAddAdditionalPressing && (
                <button
                  onClick={() => {
                    const firstTenant = state.tenants[0];
                    if (firstTenant) {
                      setSelectedClientTenantId(firstTenant.id);
                      const count = state.tenants.filter(
                        (t) => t.ownerName === firstTenant.ownerName || t.ownerPhone === firstTenant.ownerPhone
                      ).length;
                      setAdditionalPressingName(`${firstTenant.companyName} - Agence 0${count + 1}`);
                      setAdditionalPressingCity(firstTenant.city || 'Abidjan');
                    }
                    setShowAddAdditionalPressingModal(true);
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs whitespace-nowrap"
                  title="Ajouter un pressing supplémentaire pour un client abonné existant"
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>+ Pressing Client Abonné</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Notice if there are suspended clients */}
          {suspendedTenants.length > 0 && statusFilter !== 'suspended' && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-rose-800">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>{suspendedTenants.length} pressing(s) suspendu(s)</strong> : Vous pouvez réactiver leur accès immédiatement en un clic sur le bouton vert ci-dessous.
                </span>
              </div>
              <button
                onClick={() => setStatusFilter('suspended')}
                className="text-rose-900 font-bold underline hover:no-underline text-xs shrink-0 cursor-pointer"
              >
                Filtrer les suspendus →
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Entreprise Pressing</th>
                    <th className="p-3.5">Propriétaire / Contacts</th>
                    <th className="p-3.5">Formule SaaS</th>
                    <th className="p-3.5">Validité / Échéance</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Actions Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredTenants.map((t) => {
                    const isTrial = t.status === 'trial';
                    const isSuspended = t.status === 'suspended';

                    return (
                      <tr
                        key={t.id}
                        className={`transition-colors ${
                          isSuspended
                            ? 'bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-rose-500'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 ${
                                isSuspended
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {t.companyName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">{t.companyName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">📍 {t.city} • ID: {t.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{t.ownerName}</span>
                            <span className="text-slate-300">•</span>
                            <a
                              href={`tel:${t.ownerPhone}`}
                              className="text-[11px] text-slate-600 hover:text-purple-600 font-mono font-medium inline-flex items-center gap-1"
                              title="Appeler le propriétaire"
                            >
                              <span>📞</span>
                              <span>{t.ownerPhone}</span>
                            </a>
                            <button
                              onClick={() => sendWhatsAppDunning(t)}
                              className="text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded font-bold transition cursor-pointer"
                              title="Ouvrir WhatsApp"
                            >
                              WhatsApp
                            </button>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-purple-900 block">{t.planName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {t.planTier === 'basic' ? '25 000 F/m' : t.planTier === 'premium' ? '95 000 F/m' : '50 000 F/m'}
                          </span>
                        </td>

                        <td className="p-3.5">
                          {isTrial ? (
                            <div>
                              <span className="text-amber-700 font-bold block">Essai: {t.trialEndDate || '14 jours'}</span>
                              <button
                                onClick={() => extendTrial(t.id, 7)}
                                className="text-[10px] text-purple-700 hover:underline font-semibold"
                              >
                                + Prolonger 7j
                              </button>
                            </div>
                          ) : (
                            <div>
                              <span
                                className={`font-mono block ${
                                  isSuspended ? 'text-rose-700 font-bold' : 'text-slate-700'
                                }`}
                              >
                                Expire: {t.subscriptionEndDate || 'En cours'}
                              </span>
                              <span className="text-[10px] text-slate-400">Dernier: {t.lastPaymentDate || t.registeredDate}</span>
                            </div>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              t.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : t.status === 'trial'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {t.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                            {t.status === 'trial' && <Clock className="w-3 h-3" />}
                            {t.status === 'suspended' && <ShieldAlert className="w-3 h-3 text-rose-600" />}
                            {t.status.toUpperCase()}
                          </span>
                        </td>

                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {/* 1-Click Reactivate for Suspended Tenants */}
                          {isSuspended && userPermissions.canReactivateTenant && (
                            <button
                              onClick={() => handleOneClickReactivate(t)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition transform active:scale-95 animate-pulse hover:animate-none"
                              title="Réactiver ce client en 1 clic (+30 jours offerts et accès rétabli)"
                            >
                              <Zap className="w-3.5 h-3.5 text-amber-300" />
                              <span>⚡ Réactiver en 1 clic</span>
                            </button>
                          )}

                          {/* Impersonation / Entrer */}
                          {userPermissions.canImpersonateTenant && (
                            <button
                              onClick={() => switchRole('owner', t.id)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer transition shadow-xs"
                              title="Se connecter directement à ce pressing"
                            >
                              Accéder →
                            </button>
                          )}

                          {/* Ajouter un pressing supplémentaire pour ce client abonné */}
                          {userPermissions.canAddAdditionalPressing && (
                            <button
                              onClick={() => {
                                setSelectedClientTenantId(t.id);
                                const count = state.tenants.filter(
                                  (item) => item.ownerName === t.ownerName || item.ownerPhone === t.ownerPhone
                                ).length;
                                setAdditionalPressingName(`${t.companyName} - Agence 0${count + 1}`);
                                setAdditionalPressingCity(t.city || 'Abidjan');
                                setShowAddAdditionalPressingModal(true);
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-semibold cursor-pointer text-xs inline-flex items-center gap-1"
                              title={`Ajouter un pressing supplémentaire pour le client abonné ${t.ownerName}`}
                            >
                              <Plus className="w-3 h-3 text-emerald-600" />
                              <span>+ Pressing</span>
                            </button>
                          )}

                          {/* Encaisser SaaS */}
                          {userPermissions.canRecordSaaSPayments && (
                            <button
                              onClick={() => {
                                setSelectedTenantForPay(t);
                                setShowRecordPaymentModal(true);
                              }}
                              className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded font-semibold cursor-pointer text-xs"
                              title="Enregistrer un paiement d'abonnement"
                            >
                              + Encaisser
                            </button>
                          )}

                          {/* Suspend action (only if not suspended) */}
                          {!isSuspended && userPermissions.canSuspendTenant && (
                            <button
                              onClick={() => suspendTenant(t.id)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded font-semibold cursor-pointer text-xs"
                              title="Suspendre l'accès"
                            >
                              Suspendre
                            </button>
                          )}

                          {/* Edit Details */}
                          {userPermissions.canEditTenants && (
                            <button
                              onClick={() => {
                                setSelectedTenantToEdit(t);
                                setShowEditTenantModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                              title="Modifier les informations"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete - Exclusivité Super Admin Propriétaire */}
                          {isEditorOwner ? (
                            <button
                              onClick={() => {
                                setTenantToDelete(t);
                                setShowDeleteConfirmModal(true);
                              }}
                              className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                              title="Supprimer définitivement (Propriétaire uniquement)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span
                              className="inline-flex p-1 text-slate-300 cursor-not-allowed opacity-40"
                              title="Suppression réservée exclusivement au Super Admin Propriétaire"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ABONNEMENTS, PÉRIODES D'ESSAI & SUIVI DES IMPAYÉS                      */}
      {/* ========================================================================= */}
      {currentTab === 'subscriptions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-700">PÉRIODES D'ESSAI ACTIVES</span>
              <p className="text-xl font-bold font-mono text-amber-900">{trialTenants.length} pressings</p>
              <p className="text-[11px] text-slate-500">Comptes prospect en test 14 jours</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-700">ABONNEMENTS ACTIFS & PAYÉS</span>
              <p className="text-xl font-bold font-mono text-emerald-900">{activeTenants.length} abonnés</p>
              <p className="text-[11px] text-slate-500">Licences logicielles régularisées</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-rose-700">COMPTES EN SOUFFRANCE / EXPIRÉS</span>
              <p className="text-xl font-bold font-mono text-rose-900">{suspendedTenants.length} bloqués</p>
              <p className="text-[11px] text-slate-500">Nécessite relance ou régularisation</p>
            </div>
          </div>

          {/* Suspended Accounts Section with 1-Click Reactivation */}
          {suspendedTenants.length > 0 && (
            <div className="bg-white rounded-xl border-2 border-rose-300 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Pressings Suspendus — Réactivation Immédiate en 1 Clic
                </h3>
                <span className="text-xs text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  {suspendedTenants.length} compte(s) bloqué(s)
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {suspendedTenants.map((t) => (
                  <div key={t.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{t.companyName}</span>
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded border border-rose-200">
                          SUSPENDU
                        </span>
                        <span className="font-mono text-purple-900 font-semibold">{t.planName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Gérant: {t.ownerName} • 📞 {t.ownerPhone} • Impayé: {formatFCFA(t.outstandingBalance)} • Expiré le: {t.subscriptionEndDate || 'Non renseigné'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleOneClickReactivate(t)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer text-xs shadow-xs transition transform active:scale-95"
                        title="Réactiver immédiatement l'accès au compte et prolonger de 30 jours"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>⚡ Réactiver en 1 Clic (+30j)</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTenantForPay(t);
                          setShowRecordPaymentModal(true);
                        }}
                        className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-semibold cursor-pointer text-xs"
                      >
                        Encaisser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trial Management Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Gestion & Prolongation des Périodes d'Essai Gratuit
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              {trialTenants.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">Aucun pressing actuellement en période d'essai.</p>
              ) : (
                trialTenants.map((t) => (
                  <div key={t.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{t.companyName}</span>
                        <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
                          ESSAI JUSQU'AU {t.trialEndDate || '14j'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Propriétaire: {t.ownerName} • 📞 {t.ownerPhone} • Formule souhaitée: {t.planName}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => extendTrial(t.id, 7)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded font-semibold cursor-pointer text-xs"
                      >
                        +7 Jours
                      </button>
                      <button
                        onClick={() => extendTrial(t.id, 14)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded font-semibold cursor-pointer text-xs"
                      >
                        +14 Jours
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTenantForPay(t);
                          setShowRecordPaymentModal(true);
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold cursor-pointer text-xs shadow-xs"
                      >
                        Convertir en Abonné Payant →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dunning and Overdue Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Suivi des Impayés & Relances Automatisées (WhatsApp / SMS / Email)
              </h3>
              <span className="text-xs text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                {overdueInvoices.length} facture(s) impayée(s)
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {overdueInvoices.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">Aucun impayé enregistré. Tous les abonnements sont à jour.</p>
              ) : (
                overdueInvoices.map((inv) => {
                  const tenant = state.tenants.find((t) => t.id === inv.tenantId);
                  return (
                    <div key={inv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{inv.tenantName}</span>
                          <span className="font-mono text-rose-700 font-bold">
                            {formatFCFA(inv.totalAmount)}
                          </span>
                          <span className="text-[10px] bg-rose-50 text-rose-800 font-bold px-2 py-0.5 rounded border border-rose-200">
                            IMPAYÉ
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Facture: {inv.invoiceNumber} • Date d’échéance dépassée le {inv.dueDate} • Contact: {inv.ownerPhone}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {tenant && (
                          <button
                            onClick={() => sendWhatsAppDunning(tenant, inv)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold flex items-center gap-1.5 cursor-pointer text-xs shadow-xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Relancer par WhatsApp</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (tenant) {
                              setSelectedTenantForPay(tenant);
                              setShowRecordPaymentModal(true);
                            }
                          }}
                          className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-semibold cursor-pointer text-xs"
                        >
                          Encaisser
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FORMULES TARIFAIRES & GATING DES FONCTIONNALITÉS (FEATURE FLAGS)         */}
      {/* ========================================================================= */}
      {currentTab === 'plans' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-900 flex items-start gap-3">
            <Crown className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-purple-950">Gestion des Formules d’Abonnement & Droits d’Accès SaaS</h4>
              <p className="text-purple-800 mt-0.5">
                Configurez les tarifs mensuels et annuels appliqués aux nouveaux pressings ainsi que la matrice des fonctionnalités activées par palier.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {state.saasPlans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between ${
                  plan.isPopular ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">
                      {plan.tier.toUpperCase()}
                    </span>
                    {plan.isPopular && (
                      <span className="text-[10px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full">
                        POPULAIRE
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-bold font-mono text-slate-900">
                        {formatFCFA(plan.priceMonthly)}
                      </span>
                      <span className="text-xs text-slate-500">/mois</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ou {formatFCFA(plan.priceYearly)} /an (avec 2 mois offerts)
                    </p>
                  </div>

                  {/* Limits */}
                  <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center justify-between">
                      <span>Nombre d’agences max:</span>
                      <span className="font-bold font-mono">
                        {plan.maxEstablishments === -1 ? 'Illimité' : plan.maxEstablishments}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Utilisateurs / Employés:</span>
                      <span className="font-bold font-mono">
                        {plan.maxUsers === -1 ? 'Illimité' : plan.maxUsers}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Commandes / mois:</span>
                      <span className="font-bold font-mono">
                        {plan.maxOrdersPerMonth === -1 ? 'Illimité' : plan.maxOrdersPerMonth}
                      </span>
                    </div>
                  </div>

                  {/* Feature list */}
                  <div className="space-y-2 text-xs">
                    <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
                      Fonctionnalités incluses :
                    </span>
                    <ul className="space-y-1.5 text-slate-600">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100">
                  <button
                    onClick={() => {
                      const newPrice = prompt(`Nouveau tarif mensuel pour ${plan.name} (en FCFA):`, plan.priceMonthly.toString());
                      if (newPrice && !isNaN(Number(newPrice))) {
                        updateSaaSPlan(plan.id, {
                          priceMonthly: Number(newPrice),
                          priceYearly: Number(newPrice) * 10,
                        });
                        soundFX.playBeep();
                      }
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Modifier le Tarif de la Formule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PAIEMENTS DES ABONNEMENTS (MOBILE MONEY & ESPÈCES)                      */}
      {/* ========================================================================= */}
      {currentTab === 'payments' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Filtrer par canal :</span>
              <select
                value={paymentFilterMethod}
                onChange={(e) => setPaymentFilterMethod(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium cursor-pointer"
              >
                <option value="all">Tous les canaux ({state.saasPayments.length})</option>
                <option value="wave">Wave Mobile Money</option>
                <option value="orange_money">Orange Money</option>
                <option value="mtn_momo">MTN Mobile Money</option>
                <option value="moov_money">Moov Money</option>
                <option value="cash">Espèces en main propre</option>
                <option value="bank_transfer">Virement Bancaire</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSelectedTenantForPay(state.tenants[0] || null);
                setShowRecordPaymentModal(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Encaisser un Abonnement SaaS</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Reçu N° / Réf</th>
                    <th className="p-3.5">Date Règlement</th>
                    <th className="p-3.5">Pressing Client</th>
                    <th className="p-3.5">Formule & Période</th>
                    <th className="p-3.5">Canal de Paiement</th>
                    <th className="p-3.5">Montant Encaissé</th>
                    <th className="p-3.5">Enregistré par</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-slate-900 block">{pay.receiptNumber}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{pay.transactionReference}</span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-mono">{pay.paymentDate}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-900 block">{pay.tenantName}</span>
                        <span className="text-[11px] text-slate-500">{pay.ownerName}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-purple-900 block">{pay.planName}</span>
                        <span className="text-[10px] text-slate-500">
                          Du {pay.coverageStartDate} au {pay.coverageEndDate}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                            pay.paymentMethod === 'wave'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : pay.paymentMethod === 'orange_money'
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : pay.paymentMethod === 'mtn_momo'
                              ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                              : pay.paymentMethod === 'cash'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {pay.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-purple-950 text-sm">
                          {formatFCFA(pay.amount)}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px]">
                        {pay.recordedByAdminName || 'Super Admin'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. FACTURES D'ABONNEMENT SAAS & GÉNÉRATEUR OFFICIEL                        */}
      {/* ========================================================================= */}
      {currentTab === 'invoices' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Statut de facture :</span>
              <select
                value={invoiceFilterStatus}
                onChange={(e) => setInvoiceFilterStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium cursor-pointer"
              >
                <option value="all">Toutes les factures ({state.saasInvoices.length})</option>
                <option value="paid">Réglées ({state.saasInvoices.filter((i) => i.status === 'paid').length})</option>
                <option value="pending">En attente ({state.saasInvoices.filter((i) => i.status === 'pending').length})</option>
                <option value="overdue">Impayées ({overdueInvoices.length})</option>
              </select>
            </div>

            <button
              onClick={() => {
                setNewInvoiceTenantId(state.tenants[0]?.id || '');
                setShowCreateInvoiceModal(true);
              }}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Émettre une Facture Proforma / Officielle</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">N° Facture</th>
                    <th className="p-3.5">Date d’Émission</th>
                    <th className="p-3.5">Client Pressing</th>
                    <th className="p-3.5">Période Couverte</th>
                    <th className="p-3.5">Montant TTC</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="p-3.5 text-slate-600 font-mono">{inv.issueDate}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-900 block">{inv.tenantName}</span>
                        <span className="text-[11px] text-slate-500">{inv.ownerName}</span>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {inv.coverageStartDate} au {inv.coverageEndDate}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-purple-900 text-sm">
                        {formatFCFA(inv.totalAmount)}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : inv.status === 'overdue'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {inv.status === 'paid' ? 'PAYÉE ✓' : inv.status === 'overdue' ? 'IMPAYÉE' : 'EN ATTENTE'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {(() => {
                          const t = state.tenants.find((item) => item.id === inv.tenantId);
                          if (t && t.status === 'suspended') {
                            return (
                              <button
                                onClick={() => handleOneClickReactivate(t)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs transition"
                                title="Réactiver ce client en 1 clic"
                              >
                                <Zap className="w-3 h-3 text-amber-300" />
                                <span>⚡ Réactiver en 1 clic</span>
                              </button>
                            );
                          }
                          return null;
                        })()}
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setShowInvoiceModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Voir / Imprimer</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. NOTIFICATIONS & DIFFUSION AUX CLIENTS                                   */}
      {/* ========================================================================= */}
      {currentTab === 'notifications' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Diffusion d’Annonces & Alertes aux Gérants</h3>
              <p className="text-xs text-slate-500">
                Envoyez des messages de maintenance, nouveautés ou relances qui apparaîtront sur les écrans des pressings.
              </p>
            </div>

            <button
              onClick={() => setShowCreateNotifModal(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Créer une Annonce</span>
            </button>
          </div>

          <div className="space-y-3">
            {state.broadcastNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-xl border p-4 shadow-xs flex items-start justify-between gap-3 ${
                  notif.type === 'urgent'
                    ? 'border-rose-300 bg-rose-50/20'
                    : notif.type === 'warning'
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      notif.type === 'urgent'
                        ? 'bg-rose-100 text-rose-700'
                        : notif.type === 'warning'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs">{notif.title}</h4>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded uppercase">
                        {notif.type}
                      </span>
                      <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.2 rounded">
                        {notif.target === 'all_tenants' ? 'Tous les pressings' : `Pressing: ${notif.targetTenantName || notif.targetTenantId}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      Diffusé le {notif.createdAt}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteBroadcastNotification(notif.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-slate-100 cursor-pointer"
                  title="Supprimer la notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. ACCÈS ÉDITEUR : INTERFACE ADMINISTRATEUR ET COLLABORATEURS             */}
      {/* ========================================================================= */}
      {currentTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Notifications / Feedback Toast */}
          {resetPasswordToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resetPasswordToast}</span>
              </div>
              <button
                onClick={() => setResetPasswordToast(null)}
                className="text-emerald-700 hover:text-emerald-900 font-bold ml-3 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-purple-700" />
                  Habilitations & Accès Éditeur AGB
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-600">
                  {state.saasEditorUsers.length} Comptes Éditeur Référencés
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight mt-1">
                Interface de Gestion des Accès Éditeur
              </h3>
              <p className="text-xs text-slate-500">
                Sélectionnez le niveau d'accès pour administrer les habilitations, configurer les permissions et ajouter de nouveaux comptes.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {isEditorOwner && (
                <button
                  onClick={() => handleOpenPermissionsModal()}
                  className="px-3.5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition hover:shadow-md active:scale-95"
                  title="Ouvrir la matrice complète des 16 permissions par collaborateur"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>⚙️ Matrice des Permissions</span>
                </button>
              )}

              <button
                onClick={() => setShowAddEditorUserModal(true)}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition hover:shadow-md active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Nouveau Collaborateur</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* THE 2 DISTINCT BUTTONS: [ ADMINISTRATEUR ] ET [ COLLABORATEURS ]         */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* BOUTON 1 : ADMINISTRATEUR */}
            <button
              type="button"
              onClick={() => {
                setEditorSubView('admin');
                soundFX.playBeep();
              }}
              className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                editorSubView === 'admin'
                  ? 'bg-purple-950 text-white border-purple-400 ring-2 ring-purple-500/40 shadow-xl'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${
                      editorSubView === 'admin'
                        ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    <Crown className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        editorSubView === 'admin'
                          ? 'bg-purple-900/90 text-amber-300 border-purple-700'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      PROPRIÉTAIRE SEUL
                    </span>
                    {editorSubView === 'admin' && (
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4
                    className={`text-base font-extrabold tracking-wide ${
                      editorSubView === 'admin' ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    ADMINISTRATEUR
                  </h4>
                  <span
                    className={`text-xs font-semibold block ${
                      editorSubView === 'admin' ? 'text-amber-300' : 'text-purple-700'
                    }`}
                  >
                    Gilles Brice Atsé • Concepteur & Éditeur Logiciel
                  </span>
                </div>

                <p
                  className={`text-xs leading-relaxed ${
                    editorSubView === 'admin' ? 'text-purple-200/90' : 'text-slate-500'
                  }`}
                >
                  Accès régalien intégral : Suppression définitive de clients, réinitialisation d'usine, attribution des permissions et gestion du mot de passe Super Admin.
                </p>
              </div>

              <div
                className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold ${
                  editorSubView === 'admin'
                    ? 'border-purple-800/80 text-amber-300'
                    : 'border-slate-100 text-purple-700 group-hover:text-purple-800'
                }`}
              >
                <span>Consulter privilèges & mot de passe</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* BOUTON 2 : COLLABORATEURS */}
            <button
              type="button"
              onClick={() => {
                setEditorSubView('collaborators');
                soundFX.playBeep();
              }}
              className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                editorSubView === 'collaborators'
                  ? 'bg-slate-900 text-white border-sky-400 ring-2 ring-sky-500/40 shadow-xl'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${
                      editorSubView === 'collaborators'
                        ? 'bg-gradient-to-br from-sky-400 to-blue-500 text-slate-950 font-black'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    <Users className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        editorSubView === 'collaborators'
                          ? 'bg-sky-950 text-sky-300 border-sky-800'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {state.saasEditorUsers.filter((u) => !u.isOwner).length} COLLABORATEURS
                    </span>
                    {editorSubView === 'collaborators' && (
                      <span className="w-6 h-6 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4
                    className={`text-base font-extrabold tracking-wide ${
                      editorSubView === 'collaborators' ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    COLLABORATEURS
                  </h4>
                  <span
                    className={`text-xs font-semibold block ${
                      editorSubView === 'collaborators' ? 'text-sky-300' : 'text-sky-700'
                    }`}
                  >
                    Support Technique, Facturation & Gérance Déléguée
                  </span>
                </div>

                <p
                  className={`text-xs leading-relaxed ${
                    editorSubView === 'collaborators' ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  Accès sécurisés avec mot de passe initial (1234), contrôle strict des pièces d'identité et matrice granulaire de 16 permissions par collaborateur.
                </p>
              </div>

              <div
                className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold ${
                  editorSubView === 'collaborators'
                    ? 'border-slate-800 text-sky-400'
                    : 'border-slate-100 text-sky-700 group-hover:text-sky-800'
                }`}
              >
                <span>Gérer les accès & habilitations</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* VIEW A: SOUS-SECTION ADMINISTRATEUR (SUPER ADMIN PROPRIÉTAIRE)            */}
          {/* ========================================================================= */}
          {editorSubView === 'admin' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Card Super Admin Owner */}
              <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 text-white rounded-2xl p-6 border border-purple-500/30 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center text-xl font-black shadow-lg ring-4 ring-purple-400/30 shrink-0">
                        <Crown className="w-8 h-8 text-slate-950" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xl font-extrabold text-white">Gilles Brice Atsé</h4>
                          <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <Crown className="w-3 h-3" />
                            SUPER ADMIN PROPRIÉTAIRE
                          </span>
                          <span className="text-[11px] bg-purple-900/80 text-purple-200 font-mono font-bold px-2 py-0.5 rounded-md border border-purple-700">
                            ACCÈS RÉGALIEN PLEINS POUVOIRS
                          </span>
                        </div>
                        <p className="text-xs text-purple-200/90 mt-1">
                          Concepteur & Propriétaire légal de Mon Pressing Pro • Solution éditée par AGB Services & Technologies
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-300 mt-2 flex-wrap font-mono">
                          <span>📧 atsegillesbrice@gmail.com</span>
                          <span>📞 +225 01 04 81 80 92 / +225 07 97 70 96 93</span>
                          <span>📍 Abidjan, Côte d'Ivoire</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
                      <button
                        onClick={() => setShowChangeEditorPassModal(true)}
                        className="px-4 py-2.5 bg-white text-purple-950 hover:bg-purple-50 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition active:scale-95"
                      >
                        <Lock className="w-4 h-4 text-purple-700" />
                        <span>Changer Mot de Passe Super Admin</span>
                      </button>

                      <button
                        onClick={() => handleOpenPermissionsModal()}
                        className="px-4 py-2.5 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer border border-purple-400 shadow-md transition active:scale-95"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-300" />
                        <span>Matrice des Permissions</span>
                      </button>
                    </div>
                  </div>

                  {/* Legal prerogatives & security rules */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    <div className="p-4 bg-purple-900/40 rounded-xl border border-purple-700/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-1.5">
                        <Trash2 className="w-4 h-4" />
                        <span>Suppression Clients</span>
                      </div>
                      <p className="text-[11px] text-purple-200/80 leading-relaxed">
                        <strong className="text-white font-semibold">Exclusivité stricte :</strong> Seul le Super Administrateur Propriétaire peut supprimer définitivement un pressing client. Cette action est verrouillée aux collaborateurs.
                      </p>
                    </div>

                    <div className="p-4 bg-purple-900/40 rounded-xl border border-purple-700/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-1.5">
                        <RotateCcw className="w-4 h-4" />
                        <span>Réinitialisation Usine</span>
                      </div>
                      <p className="text-[11px] text-purple-200/80 leading-relaxed">
                        <strong className="text-white font-semibold">Exclusivité stricte :</strong> La remise à zéro usine de la base de données et l'exportation globale sont réservés au Super Admin Propriétaire.
                      </p>
                    </div>

                    <div className="p-4 bg-purple-900/40 rounded-xl border border-purple-700/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-1.5">
                        <Shield className="w-4 h-4" />
                        <span>Attribution Permissions</span>
                      </div>
                      <p className="text-[11px] text-purple-200/80 leading-relaxed">
                        <strong className="text-white font-semibold">Contrôle granulaire :</strong> Vous activez ou révoquez les 16 habilitations techniques et financières de chaque collaborateur selon vos besoins.
                      </p>
                    </div>

                    <div className="p-4 bg-purple-900/40 rounded-xl border border-purple-700/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-1.5">
                        <CreditCard className="w-4 h-4" />
                        <span>Passerelles & Finances</span>
                      </div>
                      <p className="text-[11px] text-purple-200/80 leading-relaxed">
                        <strong className="text-white font-semibold">Coordination SaaS :</strong> Paramétrage des comptes Wave, Orange Money et tarifs des abonnements Mon Pressing Pro.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status summary of the Super Admin Account */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-xs shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Statut de la session Super Administrateur</div>
                      <div className="text-slate-500">
                        Connecté en tant que Propriétaire légal • Mot de passe défini : <span className="font-mono font-bold text-slate-800">atsegillesbrice</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditorSubView('collaborators');
                        soundFX.playBeep();
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5 text-slate-600" />
                      <span>Passer à la gestion des Collaborateurs ({state.saasEditorUsers.filter((u) => !u.isOwner).length})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW B: SOUS-SECTION COLLABORATEURS (ÉQUIPE & HABILITATIONS)              */}
          {/* ========================================================================= */}
          {editorSubView === 'collaborators' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Rules Reminder Banner */}
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-bold text-sky-950 text-sm flex items-center gap-2">
                      <span>Règles de Sécurité & Connexion des Collaborateurs</span>
                      <span className="text-[10px] bg-sky-200 text-sky-900 font-extrabold px-2 py-0.5 rounded-md">
                        Strictement Enforcé
                      </span>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-slate-700 text-[11px] pt-1">
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold text-sky-700">1. Mot de passe initial :</span>
                        <span>Tous les nouveaux collaborateurs reçoivent le code par défaut <strong className="font-mono text-slate-900">1234</strong>.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold text-sky-700">2. Première Connexion :</span>
                        <span>L'application exige obligatoirement la création d'un mot de passe personnel et le dépôt d'une pièce d'identité (CNI, Passeport, etc.).</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="font-bold text-sky-700">3. Protection Clients :</span>
                        <span>Aucun collaborateur ne peut supprimer un compte client (réservé au Super Admin Propriétaire).</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Filters & Actions Bar */}
              <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                  <input
                    type="text"
                    value={collaboratorSearch}
                    onChange={(e) => setCollaboratorSearch(e.target.value)}
                    placeholder="Rechercher un collaborateur par nom, email, téléphone..."
                    className="w-full text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
                  />
                  {collaboratorSearch && (
                    <button
                      onClick={() => setCollaboratorSearch('')}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Role filter pills */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-lg text-[11px] font-bold">
                    <button
                      onClick={() => setCollaboratorRoleFilter('all')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        collaboratorRoleFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tous ({state.saasEditorUsers.filter((u) => !u.isOwner).length})
                    </button>
                    <button
                      onClick={() => setCollaboratorRoleFilter('support_tech')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        collaboratorRoleFilter === 'support_tech'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Support Tech
                    </button>
                    <button
                      onClick={() => setCollaboratorRoleFilter('billing_manager')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        collaboratorRoleFilter === 'billing_manager'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Facturation
                    </button>
                    <button
                      onClick={() => setCollaboratorRoleFilter('collaborator')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        collaboratorRoleFilter === 'collaborator'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Gérance
                    </button>
                  </div>

                  <button
                    onClick={() => setShowAddEditorUserModal(true)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Ajouter</span>
                  </button>
                </div>
              </div>

              {/* Collaborators List / Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.saasEditorUsers
                  .filter((user) => !user.isOwner)
                  .filter((user) => {
                    if (collaboratorRoleFilter !== 'all' && user.role !== collaboratorRoleFilter) {
                      return false;
                    }
                    if (collaboratorSearch) {
                      const query = collaboratorSearch.toLowerCase();
                      return (
                        user.name.toLowerCase().includes(query) ||
                        user.email.toLowerCase().includes(query) ||
                        user.phone.toLowerCase().includes(query)
                      );
                    }
                    return true;
                  })
                  .map((user) => {
                    const hasIdDoc = !!user.idCardNumber || !!user.idCardScanUrl;
                    const isDefaultPass = user.mustChangePassword || !user.hasCompletedFirstLogin;
                    const perms = user.permissions || DEFAULT_COLLABORATOR_PERMISSIONS;

                    return (
                      <div
                        key={user.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          {/* Top row: Avatar, Name & Role */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                                {user.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-sm">{user.name}</h4>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  📧 {user.email}
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono">
                                  📞 {user.phone}
                                </p>
                              </div>
                            </div>

                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0 border bg-sky-50 text-sky-800 border-sky-200">
                              {user.role === 'support_tech'
                                ? '🛠️ Support & Déploiement'
                                : user.role === 'billing_manager'
                                ? '💰 Facturation SaaS'
                                : user.role === 'auditor'
                                ? '📋 Auditeur'
                                : '👔 Gérance Déléguée'}
                            </span>
                          </div>

                          {/* Security Status Pills */}
                          <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
                            {/* ID Document Status */}
                            {hasIdDoc ? (
                              <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Pièce : {user.idCardDocumentType ? user.idCardDocumentType.toUpperCase() : 'CNI'} (N° {user.idCardNumber || 'Vérifiée'})</span>
                              </span>
                            ) : (
                              <span className="bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Pièce d'identité : Requise à la 1ère connexion</span>
                              </span>
                            )}

                            {/* Password Status */}
                            {isDefaultPass ? (
                              <span className="bg-sky-50 text-sky-800 font-bold px-2.5 py-1 rounded-lg border border-sky-200 flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-sky-600" />
                                <span>MDP Initial : 1234 (Changement requis)</span>
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                <span>MDP Personnalisé ✓</span>
                              </span>
                            )}
                          </div>

                          {/* Active Permissions Summary Pills */}
                          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Habilitations accordées :
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {perms.canCreateTenants && (
                                <span className="text-[10px] bg-white text-slate-800 font-semibold px-2 py-0.5 rounded border border-slate-200">
                                  + Créer Pressings
                                </span>
                              )}
                              {perms.canEditTenants && (
                                <span className="text-[10px] bg-white text-slate-800 font-semibold px-2 py-0.5 rounded border border-slate-200">
                                  Édition Pressings
                                </span>
                              )}
                              {perms.canImpersonateTenant && (
                                <span className="text-[10px] bg-purple-50 text-purple-800 font-bold px-2 py-0.5 rounded border border-purple-200">
                                  👁️ Immersion Live
                                </span>
                              )}
                              {perms.canReactivateTenant && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                                  ⚡ Réactivation 1-Clic
                                </span>
                              )}
                              {perms.canRecordSaaSPayments && (
                                <span className="text-[10px] bg-sky-50 text-sky-800 font-bold px-2 py-0.5 rounded border border-sky-200">
                                  💰 Encaissement Wave/OM
                                </span>
                              )}
                              {perms.canManageInvoices && (
                                <span className="text-[10px] bg-white text-slate-800 font-semibold px-2 py-0.5 rounded border border-slate-200">
                                  Facturation SaaS
                                </span>
                              )}
                              {perms.canSendBroadcast && (
                                <span className="text-[10px] bg-white text-slate-800 font-semibold px-2 py-0.5 rounded border border-slate-200">
                                  Diffusion Alertes
                                </span>
                              )}
                              {perms.canViewAuditLogs && (
                                <span className="text-[10px] bg-white text-slate-800 font-semibold px-2 py-0.5 rounded border border-slate-200">
                                  Journaux d'Audit
                                </span>
                              )}
                              {!perms.canCreateTenants && !perms.canRecordSaaSPayments && !perms.canImpersonateTenant && (
                                <span className="text-[10px] text-slate-400 italic">
                                  Accès consultation de base
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Actions on this Collaborator */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 flex-wrap">
                          <div className="flex items-center gap-2">
                            {isEditorOwner && (
                              <button
                                onClick={() => handleOpenPermissionsModal(user)}
                                className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
                                title="Modifier la matrice des permissions pour ce collaborateur"
                              >
                                <Shield className="w-3.5 h-3.5 text-purple-600" />
                                <span>⚙️ Gérer Permissions</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (window.confirm(`Réinitialiser le mot de passe de ${user.name} au code par défaut 1234 ?`)) {
                                  resetEditorUserPassword(user.id);
                                  setResetPasswordToast(`Le mot de passe de ${user.name} a été réinitialisé à 1234.`);
                                  setTimeout(() => setResetPasswordToast(null), 5000);
                                }
                              }}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                              title="Réinitialiser le mot de passe à 1234"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset MDP (1234)</span>
                            </button>
                          </div>

                          {isEditorOwner && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Supprimer définitivement l'accès collaborateur de ${user.name} ?`)) {
                                  deleteEditorUser(user.id);
                                  soundFX.playBeep();
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                              title="Supprimer ce collaborateur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Archetypes helper reference */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                <h5 className="font-bold text-slate-900 text-xs mb-2">Modèles d'Habilitations Prédéfinis pour Collaborateurs</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">🛠️ Support & Déploiement</div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Création de pressing, assistance par immersion live, prolongation d'essai et réactivation express en cas de paiement validé.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">💰 Facturation & Abonnements</div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Saisie des encaissements Wave / Orange Money / MTN MoMo, émission des reçus et factures proforma SaaS.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900 mb-1">👔 Gérance Déléguée</div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Supervision opérationnelle globale, diffusion d'annonces de maintenance et consultation des statistiques.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. JOURNAUX D'ACTIVITÉ (AUDIT LOGS MULTI-TENANT)                           */}
      {/* ========================================================================= */}
      {currentTab === 'logs' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Journal de Sécurité & Traçabilité Multi-Pressings</h3>
              <p className="text-xs text-slate-500">
                Historique inviolable de toutes les actions système, modifications de tarifs, encaissements et connexions.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Horodatage</th>
                    <th className="p-3.5">Catégorie</th>
                    <th className="p-3.5">Entreprise Concerneé</th>
                    <th className="p-3.5">Auteur / Rôle</th>
                    <th className="p-3.5">Action & Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                  {state.auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                      <td className="p-3.5 font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.category === 'saas_admin'
                              ? 'bg-purple-50 text-purple-700'
                              : log.category === 'security'
                              ? 'bg-rose-50 text-rose-700'
                              : log.category === 'financial'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {log.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-sans font-semibold text-slate-900">
                        {log.tenantName || log.tenantId || 'Plateforme SaaS AGB'}
                      </td>
                      <td className="p-3.5 font-sans text-slate-700">
                        {log.userName} ({log.userRole})
                      </td>
                      <td className="p-3.5 font-sans text-slate-800">
                        <span className="font-bold text-slate-900 block">{log.action}</span>
                        <span className="text-slate-600 text-xs">{log.details}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. PARAMÈTRES GLOBAUX DU SAAS                                            */}
      {/* ========================================================================= */}
      {currentTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Official App & APK Icon Card */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl border border-blue-900/60 shadow-lg p-5 sm:p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <AppIconBadge size="xl" rounded="2xl" />
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded-full uppercase">
                    Icône Officielle Active
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full uppercase">
                    PWA & APK Android Ready
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white">
                  MON PRESSING PRO — LOGICIEL DE GESTION
                </h4>
                <p className="text-xs text-slate-300 max-w-xl">
                  Cette icône 3D officielle est déployée pour l'application Web, le lanceur mobile PWA, le Favicon navigateur, et le manifest d'installation du package APK Android.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-[11px] text-slate-400 font-mono">
                  <span>Format: 1024x1024 / 512x512 / 192x192</span>
                  <span>•</span>
                  <span>Manifest: /manifest.webmanifest</span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0">
              <a
                href="/app-icon.jpg"
                download="pressing-pro-icon.jpg"
                className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger l'Icône HD</span>
              </a>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings className="w-5 h-5 text-purple-600" />
              Paramètres Généraux de la Société Éditrice & Plateforme
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Raison Sociale Éditeur</label>
                <input
                  type="text"
                  value={state.saasGlobalSettings?.publisherName || ''}
                  onChange={(e) => updateSaaSGlobalSettings({ publisherName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Concepteur & Auteur Logiciel</label>
                <input
                  type="text"
                  value={state.saasGlobalSettings?.publisherAuthor || ''}
                  onChange={(e) => updateSaaSGlobalSettings({ publisherAuthor: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Téléphone & WhatsApp Support AGB</label>
                <input
                  type="text"
                  value={state.saasGlobalSettings?.publisherPhone || ''}
                  onChange={(e) => updateSaaSGlobalSettings({ publisherPhone: e.target.value, publisherWhatsapp: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Officiel Support</label>
                <input
                  type="email"
                  value={state.saasGlobalSettings?.publisherEmail || ''}
                  onChange={(e) => updateSaaSGlobalSettings({ publisherEmail: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Numéro Wave Pro d’Encaissement des Abonnements</label>
                <input
                  type="text"
                  value={state.saasGlobalSettings?.wavePaymentNumber || ''}
                  onChange={(e) => updateSaaSGlobalSettings({ wavePaymentNumber: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-mono text-purple-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Code Marchand Orange Money</label>
                <input
                  type="text"
                  value={state.saasGlobalSettings?.orangeMoneyMerchantCode || ''}
                  onChange={(e) => updateSaaSGlobalSettings({ orangeMoneyMerchantCode: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-mono text-orange-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Durée par défaut de la période d'essai (jours)</label>
                <input
                  type="number"
                  value={state.saasGlobalSettings?.defaultTrialDays || 14}
                  onChange={(e) => updateSaaSGlobalSettings({ defaultTrialDays: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Version du Logiciel Déployée</label>
                <input
                  type="text"
                  value={state.saasGlobalSettings?.appVersion || '3.4.2'}
                  onChange={(e) => updateSaaSGlobalSettings({ appVersion: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            {/* Custom Fields Section */}
            <div className="pt-5 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Champs Personnalisés & Paramètres Dynamiques</h4>
                  <p className="text-[11px] text-slate-500">
                    Définissez des variables globales pour personnaliser l'application SaaS (avec libellé et description explicative).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCustomFieldModal(true)}
                  className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter un Champ</span>
                </button>
              </div>

              {customFieldSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-bold text-xs">
                  {customFieldSuccessMsg}
                </div>
              )}

              <div className="space-y-2">
                {(state.saasGlobalSettings?.customFields || []).length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-xs">
                    Aucun champ personnalisé défini pour le moment. Cliquez sur "Ajouter un Champ" pour en créer un.
                  </div>
                ) : (
                  (state.saasGlobalSettings?.customFields || []).map((field, idx) => (
                    <div key={field.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 text-xs">{field.label}</span>
                          <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded ml-2 font-bold">
                            {field.key}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (state.saasGlobalSettings?.customFields || []).filter((_, i) => i !== idx);
                            updateSaaSGlobalSettings({ customFields: updated });
                            soundFX.playBeep();
                          }}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="Supprimer ce champ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {field.description && (
                        <p className="text-[11px] text-slate-500 italic">{field.description}</p>
                      )}
                      <div>
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => {
                            const updated = [...(state.saasGlobalSettings?.customFields || [])];
                            updated[idx] = { ...updated[idx], value: e.target.value };
                            updateSaaSGlobalSettings({ customFields: updated });
                          }}
                          placeholder="Valeur du champ..."
                          className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-medium"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCustomFieldSuccessMsg('Modifications et paramètres globaux enregistrés avec succès !');
                    soundFX.playCashChime();
                    setTimeout(() => setCustomFieldSuccessMsg(''), 4000);
                  }}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les Modifications</span>
                </button>
              </div>
            </div>

            {/* Maintenance & Dangerous Zone */}
            <div className="pt-5 border-t border-rose-100 space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider">
                  Zone de Maintenance & Initialisation Production
                </h4>
              </div>

              <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Mise à Zéro Vierge pour Production</h5>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Nettoie les commandes de test, factures, encaissements et historiques de démo tout en conservant les fiches de base prêtes pour l'exploitation en production.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetVirginModal(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shrink-0 flex items-center gap-2 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Initialisation Vierge</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CRÉER UN NOUVEAU PRESSING CLIENT (TENANT)                         */}
      {/* ========================================================================= */}
      {showCreateTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">Créer une Entreprise Pressing (Client SaaS)</h3>
              </div>
              <button
                onClick={() => setShowCreateTenantModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom Commercial du Pressing *</label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Ex: Ivoire Pressing Deluxe"
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom & Prénom Propriétaire *</label>
                  <input
                    type="text"
                    required
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="Ex: M. Amadou Traoré"
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ville d'Implantation</label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="Abidjan">Abidjan</option>
                    <option value="Bouaké">Bouaké</option>
                    <option value="San Pédro">San Pédro</option>
                    <option value="Yamoussoukro">Yamoussoukro</option>
                    <option value="Korhogo">Korhogo</option>
                    <option value="Daloa">Daloa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone Principal *</label>
                  <input
                    type="text"
                    required
                    value={newOwnerPhone}
                    onChange={(e) => setNewOwnerPhone(e.target.value)}
                    placeholder="+225 07 00 00 00 00"
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp Propriétaire</label>
                  <input
                    type="text"
                    value={newOwnerWhatsapp}
                    onChange={(e) => setNewOwnerWhatsapp(e.target.value)}
                    placeholder="+225 07 00 00 00 00"
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Professionnel</label>
                <input
                  type="email"
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                  placeholder="contact@pressing.ci"
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Formule Tarifaire Choisie</label>
                  <select
                    value={newPlanTier}
                    onChange={(e) => setNewPlanTier(e.target.value as SubscriptionPlanTier)}
                    className="w-full p-2 border border-slate-300 rounded font-bold text-purple-900"
                  >
                    <option value="basic">Formule STARTER (25 000 FCFA/m)</option>
                    <option value="pro">Formule PRO EXPANSION (50 000 FCFA/m)</option>
                    <option value="premium">Formule ENTERPRISE PREMIUM (95 000 FCFA/m)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Statut Initial</label>
                  <select
                    value={newInitialStatus}
                    onChange={(e) => setNewInitialStatus(e.target.value as 'trial' | 'active')}
                    className="w-full p-2 border border-slate-300 rounded font-medium"
                  >
                    <option value="trial">Période d'Essai (14 jours)</option>
                    <option value="active">Abonné Actif Immédiat</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTenantModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Créer le Compte Client Pressing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1B: AJOUTER UN PRESSING SUPPLÉMENTAIRE POUR UN CLIENT ABONNÉ        */}
      {/* ========================================================================= */}
      {showAddAdditionalPressingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Ajouter un Pressing Supplémentaire</h3>
                  <p className="text-[11px] text-slate-500">Extension multi-pressings pour un client abonné existant</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddAdditionalPressingModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAdditionalPressing} className="space-y-4 text-xs">
              {/* Étape 1: Choix du Client Abonné */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-800">1. Sélectionner le Client Abonné (Propriétaire) *</label>
                <select
                  value={selectedClientTenantId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    setSelectedClientTenantId(selId);
                    const selected = state.tenants.find((t) => t.id === selId);
                    if (selected) {
                      const count = state.tenants.filter(
                        (t) => t.ownerName === selected.ownerName || t.ownerPhone === selected.ownerPhone
                      ).length;
                      setAdditionalPressingName(`${selected.companyName} - Agence 0${count + 1}`);
                      setAdditionalPressingCity(selected.city || 'Abidjan');
                    }
                  }}
                  className="w-full p-2.5 border border-emerald-300 bg-emerald-50/30 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {state.tenants.map((t) => {
                    const totalPressingsForOwner = state.tenants.filter(
                      (item) => item.ownerName === t.ownerName || item.ownerPhone === t.ownerPhone
                    ).length;
                    return (
                      <option key={t.id} value={t.id}>
                        {t.ownerName} — {t.companyName} ({totalPressingsForOwner} pressing{totalPressingsForOwner > 1 ? 's' : ''} actif{totalPressingsForOwner > 1 ? 's' : ''} • 📞 {t.ownerPhone})
                      </option>
                    );
                  })}
                </select>

                {/* Fiche récapitulative du client sélectionné */}
                {(() => {
                  const currentSelected = state.tenants.find((t) => t.id === selectedClientTenantId) || state.tenants[0];
                  if (!currentSelected) return null;
                  const ownerPressings = state.tenants.filter(
                    (item) => item.ownerName === currentSelected.ownerName || item.ownerPhone === currentSelected.ownerPhone
                  );

                  return (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{currentSelected.ownerName}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          {ownerPressings.length} PRESSING(S) DÉJÀ ASSOCIÉ(S)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        📞 {currentSelected.ownerPhone} • 💬 WhatsApp: {currentSelected.ownerWhatsapp || currentSelected.ownerPhone} • ✉️ {currentSelected.ownerEmail}
                      </p>
                      <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400">Établissements actuels :</span>
                        {ownerPressings.map((op) => (
                          <span key={op.id} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium">
                            {op.companyName}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Étape 2: Détails du nouveau pressing supplémentaire */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs">2. Informations du Nouveau Pressing</h4>
                
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nom Commercial du Nouveau Pressing *</label>
                  <input
                    type="text"
                    required
                    value={additionalPressingName}
                    onChange={(e) => setAdditionalPressingName(e.target.value)}
                    placeholder="Ex: Pressing Élégance - Agence Riviera 3"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ville d'Implantation</label>
                    <select
                      value={additionalPressingCity}
                      onChange={(e) => setAdditionalPressingCity(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    >
                      <option value="Abidjan">Abidjan</option>
                      <option value="Bouaké">Bouaké</option>
                      <option value="San Pédro">San Pédro</option>
                      <option value="Yamoussoukro">Yamoussoukro</option>
                      <option value="Korhogo">Korhogo</option>
                      <option value="Daloa">Daloa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Formule SaaS Attribuée</label>
                    <select
                      value={additionalPressingPlanTier}
                      onChange={(e) => setAdditionalPressingPlanTier(e.target.value as SubscriptionPlanTier)}
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold text-purple-900"
                    >
                      <option value="basic">STARTER (25 000 F/m)</option>
                      <option value="pro">PRO EXPANSION (50 000 F/m)</option>
                      <option value="premium">ENTERPRISE (95 000 F/m)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Statut Initial de ce Pressing</label>
                  <select
                    value={additionalPressingStatus}
                    onChange={(e) => setAdditionalPressingStatus(e.target.value as 'trial' | 'active')}
                    className="w-full p-2 border border-slate-300 rounded-lg font-medium"
                  >
                    <option value="active">✓ Abonné Actif Immédiat (30 jours de validité)</option>
                    <option value="trial">⏳ Période d'Essai (14 jours gratuits)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAdditionalPressingModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition transform active:scale-95"
                >
                  <Building className="w-4 h-4" />
                  <span>Créer & Rattacher le Pressing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ENCAISSER UN PAIEMENT D'ABONNEMENT                               */}
      {/* ========================================================================= */}
      {showRecordPaymentModal && selectedTenantForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Encaisser l’Abonnement SaaS</h3>
              </div>
              <button
                onClick={() => setShowRecordPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
              <p className="font-bold text-slate-900">{selectedTenantForPay.companyName}</p>
              <p className="text-slate-600">Gérant: {selectedTenantForPay.ownerName} • 📞 {selectedTenantForPay.ownerPhone}</p>
              <p className="text-purple-700 font-semibold">Formule: {selectedTenantForPay.planName}</p>
            </div>

            <form onSubmit={handleRecordSaaSPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Durée du Renouvellement</label>
                <select
                  value={payMonths}
                  onChange={(e) => setPayMonths(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded font-semibold"
                >
                  <option value={1}>1 Mois</option>
                  <option value={3}>3 Mois (Trimestre)</option>
                  <option value={6}>6 Mois (Semestre)</option>
                  <option value={12}>12 Mois (Annuel - 2 mois offerts)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Canal de Règlement</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full p-2 border border-slate-300 rounded font-bold text-emerald-900"
                >
                  <option value="wave">Wave Mobile Money</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="mtn_momo">MTN Mobile Money</option>
                  <option value="moov_money">Moov Money</option>
                  <option value="cash">Espèces en main propre</option>
                  <option value="bank_transfer">Virement Bancaire</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Référence de Transaction</label>
                <input
                  type="text"
                  value={customRef}
                  onChange={(e) => setCustomRef(e.target.value)}
                  placeholder="Ex: WAVE-CI-998822 ou Reçu Espèces N°12"
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-800">MONTANT TOTAL À VALIDER</span>
                <p className="text-xl font-bold font-mono text-emerald-950">
                  {formatFCFA(
                    (selectedTenantForPay.planTier === 'basic' ? 25000 : selectedTenantForPay.planTier === 'premium' ? 95000 : 50000) * (payMonths >= 12 ? 10 : payMonths)
                  )}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRecordPaymentModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Valider l'Encaissement & Activer Licence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VISUALISATION & IMPRESSION DE FACTURE OFFICIELLE                  */}
      {/* ========================================================================= */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-6 my-8 print:m-0 print:p-0 print:border-none">
            {/* Invoice Top Actions */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">Facture Officielle SaaS AGB Solutions</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer la Facture</span>
                </button>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="p-6 bg-white border border-slate-100 rounded-xl space-y-6 text-xs text-slate-800">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {state.saasGlobalSettings?.publisherName || 'AGB Solutions Web & Mobiles'}
                  </h2>
                  <p className="text-slate-500 mt-0.5">Concepteur & Éditeur du Logiciel MON PRESSING PRO</p>
                  <p className="text-slate-500">RCCM: CI-ABJ-2024-B-1192 • CC: 2410889 W</p>
                  <p className="text-slate-500">Abidjan, Cocody Riviera, Côte d’Ivoire • 📞 {state.saasGlobalSettings?.publisherPhone}</p>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-base font-bold font-mono text-purple-900 block">
                    {selectedInvoice.invoiceNumber}
                  </span>
                  <p className="text-slate-500 font-mono">Date: {selectedInvoice.issueDate}</p>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      selectedInvoice.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedInvoice.status === 'paid' ? 'ACQUITTÉE ✓' : 'EN ATTENTE DE RÈGLEMENT'}
                  </span>
                </div>
              </div>

              {/* Billed to */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">FACTURÉ À :</span>
                <p className="font-bold text-slate-900 text-sm">{selectedInvoice.tenantName}</p>
                <p className="text-slate-600">À l'attention de: {selectedInvoice.ownerName}</p>
                <p className="text-slate-600">📞 {selectedInvoice.ownerPhone} • 📧 {selectedInvoice.ownerEmail}</p>
                <p className="text-slate-600">📍 {selectedInvoice.ownerAddress || 'Côte d’Ivoire'}</p>
              </div>

              {/* Items Table */}
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-2">Désignation de la Prestation</th>
                    <th className="py-2 text-center">Qté</th>
                    <th className="py-2 text-right">Prix Unitaire</th>
                    <th className="py-2 text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 pr-2 font-medium text-slate-900">{it.description}</td>
                      <td className="py-2.5 text-center font-mono">{it.quantity}</td>
                      <td className="py-2.5 text-right font-mono">{formatFCFA(it.unitPrice)}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                        {formatFCFA(it.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-slate-200 pt-3 flex justify-end">
                <div className="w-64 space-y-1 text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Sous-total HT:</span>
                    <span className="font-mono">{formatFCFA(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>TVA (0% Exonéré):</span>
                    <span className="font-mono">0 FCFA</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-purple-950 pt-2 border-t border-slate-200">
                    <span>TOTAL TTC:</span>
                    <span className="font-mono">{formatFCFA(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-purple-50/70 p-3.5 rounded-lg border border-purple-200 space-y-1 text-[11px] text-purple-950">
                <span className="font-bold block">MODALITÉS DE PAIEMENT :</span>
                <p>Wave Pro : {state.saasGlobalSettings?.wavePaymentNumber || '+225 07 08 09 10 11'}</p>
                <p>Orange Money Code Marchand : {state.saasGlobalSettings?.orangeMoneyMerchantCode || 'OM-CI-88992'}</p>
                <p className="text-slate-500 italic mt-1">{selectedInvoice.notes}</p>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-center">
                <div>
                  <p className="text-[10px] text-slate-400">Pour le Client (Pressing)</p>
                  <div className="h-12 border-b border-dashed border-slate-300 w-36 mt-2" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Pour la Direction AGB Solutions</p>
                  <p className="font-bold text-xs text-purple-900 mt-2">
                    {state.saasGlobalSettings?.publisherAuthor || 'Gilles Brice Atsé'}
                  </p>
                  <p className="text-[10px] text-slate-500">Cachet & Signature Électronique</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CRÉER UNE FACTURE MANUELLEMENT                                   */}
      {/* ========================================================================= */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Émettre une Facture SaaS Proforma</h3>
              <button onClick={() => setShowCreateInvoiceModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sélectionner le Pressing Client</label>
                <select
                  value={newInvoiceTenantId}
                  onChange={(e) => setNewInvoiceTenantId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-semibold"
                >
                  {state.tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.companyName} ({t.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Formule</label>
                  <select
                    value={newInvoicePlanTier}
                    onChange={(e) => setNewInvoicePlanTier(e.target.value as SubscriptionPlanTier)}
                    className="w-full p-2 border border-slate-300 rounded font-bold text-purple-900"
                  >
                    <option value="basic">Starter (25 000 F)</option>
                    <option value="pro">Pro (50 000 F)</option>
                    <option value="premium">Enterprise (95 000 F)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Durée (Mois)</label>
                  <select
                    value={newInvoiceMonths}
                    onChange={(e) => setNewInvoiceMonths(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded font-semibold"
                  >
                    <option value={1}>1 Mois</option>
                    <option value={3}>3 Mois</option>
                    <option value={6}>6 Mois</option>
                    <option value={12}>12 Mois (Annuel)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Générer et Afficher la Facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CRÉER ET DIFFUSER UNE NOTIFICATION                               */}
      {/* ========================================================================= */}
      {showCreateNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Diffuser une Annonce aux Pressings</h3>
              <button onClick={() => setShowCreateNotifModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Titre de l'Annonce *</label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="Ex: Mise à jour v3.4 ou Rappel de Maintenance"
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Détaillé *</label>
                <textarea
                  required
                  rows={3}
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Écrivez votre message destiné aux gérants de pressings..."
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type de Message</label>
                  <select
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded font-semibold"
                  >
                    <option value="info">Information Générale</option>
                    <option value="warning">Avertissement Maintenance</option>
                    <option value="urgent">Urgent / Alerte Facturation</option>
                    <option value="promo">Offre Promotionnelle</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destinataires</label>
                  <select
                    value={notifTarget}
                    onChange={(e) => setNotifTarget(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded font-semibold"
                  >
                    <option value="all_tenants">Tous les Pressings Clients</option>
                    <option value="specific_tenant">Un Pressing Spécifique</option>
                  </select>
                </div>
              </div>

              {notifTarget === 'specific_tenant' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pressing Cible</label>
                  <select
                    value={notifTargetTenantId}
                    onChange={(e) => setNotifTargetTenantId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-semibold"
                  >
                    {state.tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.companyName} ({t.ownerName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateNotifModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Diffuser Immédiatement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: MODIFIER LE MOT DE PASSE SUPER ADMIN ÉDITEUR                      */}
      {/* ========================================================================= */}
      {showChangeEditorPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Modifier le Mot de Passe Super Admin</h3>
              <button onClick={() => setShowChangeEditorPassModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-500">
                Mot de passe actuel par défaut: <span className="font-mono font-bold text-purple-700">{state.editorPassword || 'agibrico1'}</span>
              </p>

              {passError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-semibold">
                  {passError}
                </div>
              )}

              {passSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-semibold">
                  Mot de passe mis à jour avec succès !
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nouveau Mot de Passe</label>
                <input
                  type="password"
                  value={newEditorPass}
                  onChange={(e) => setNewEditorPass(e.target.value)}
                  placeholder="Min 6 caractères"
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirmer le Nouveau Mot de Passe</label>
                <input
                  type="password"
                  value={confirmEditorPass}
                  onChange={(e) => setConfirmEditorPass(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowChangeEditorPassModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newEditorPass.length < 4) {
                      setPassError('Le mot de passe doit contenir au moins 4 caractères.');
                      return;
                    }
                    if (newEditorPass !== confirmEditorPass) {
                      setPassError('Les deux mots de passe ne correspondent pas.');
                      return;
                    }
                    updateEditorPassword(newEditorPass);
                    setPassError('');
                    setPassSuccess(true);
                    soundFX.playCashChime();
                    setTimeout(() => {
                      setShowChangeEditorPassModal(false);
                      setPassSuccess(false);
                      setNewEditorPass('');
                      setConfirmEditorPass('');
                    }, 1500);
                  }}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Enregistrer le Nouveau Mot de Passe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: CONFIRMATION DE SUPPRESSION DE TENANT                             */}
      {/* ========================================================================= */}
      {showDeleteConfirmModal && tenantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-rose-200 space-y-4 my-8">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-slate-900 text-base">Supprimer définitivement ce Pressing ?</h3>
            </div>

            <p className="text-xs text-slate-600">
              Êtes-vous certain de vouloir supprimer définitivement le compte client <span className="font-bold text-slate-900">{tenantToDelete.companyName}</span> ({tenantToDelete.ownerName}) ?
              Cette action est irréversible et supprimera l'accès au logiciel.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setTenantToDelete(null);
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTenant(tenantToDelete.id);
                  soundFX.playBeep();
                  setShowDeleteConfirmModal(false);
                  setTenantToDelete(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs shadow-sm cursor-pointer"
              >
                Confirmer la Suppression Définitive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: AJOUTER UN NOUVEL UTILISATEUR COLLABORATEUR / ÉDITEUR            */}
      {/* ========================================================================= */}
      {showAddEditorUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Nouvel Accès Collaborateur Éditeur</h3>
                  <p className="text-[11px] text-slate-500">Ajout d'un membre de l'équipe technique, support ou facturation</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddEditorUserModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                
                // Determine initial default permissions according to role
                let initialPermissions = { ...DEFAULT_COLLABORATOR_PERMISSIONS };
                if (editorUserRole === 'support_tech') {
                  initialPermissions = {
                    ...DEFAULT_COLLABORATOR_PERMISSIONS,
                    canViewTenants: true,
                    canCreateTenants: true,
                    canEditTenants: true,
                    canAddAdditionalPressing: true,
                    canImpersonateTenant: true,
                    canSuspendTenant: true,
                    canReactivateTenant: true,
                    canExtendTrial: true,
                    canSendBroadcast: true,
                    canViewAuditLogs: true,
                  };
                } else if (editorUserRole === 'billing_manager') {
                  initialPermissions = {
                    ...DEFAULT_COLLABORATOR_PERMISSIONS,
                    canViewTenants: true,
                    canRecordSaaSPayments: true,
                    canManageInvoices: true,
                    canExtendTrial: true,
                    canReactivateTenant: true,
                  };
                } else if (editorUserRole === 'collaborator') {
                  initialPermissions = {
                    ...DEFAULT_COLLABORATOR_PERMISSIONS,
                    canViewTenants: true,
                    canCreateTenants: true,
                    canEditTenants: true,
                    canImpersonateTenant: true,
                    canReactivateTenant: true,
                    canExtendTrial: true,
                    canRecordSaaSPayments: true,
                    canManageInvoices: true,
                    canSendBroadcast: true,
                    canViewAuditLogs: true,
                  };
                }

                createEditorUser({
                  name: editorUserName.trim(),
                  email: editorUserEmail.trim(),
                  phone: editorUserPhone.trim(),
                  role: editorUserRole,
                  status: 'active',
                  password: '1234',
                  defaultPassword: '1234',
                  mustChangePassword: true,
                  hasCompletedFirstLogin: false,
                  permissions: initialPermissions,
                });

                soundFX.playCashChime();
                setShowAddEditorUserModal(false);
                setResetPasswordToast(`Collaborateur ${editorUserName} créé avec succès. Mot de passe initial : 1234.`);
                setTimeout(() => setResetPasswordToast(null), 5000);
                setEditorUserName('');
                setEditorUserEmail('');
                setEditorUserPhone('+225 ');
                setEditorUserRole('support_tech');
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom Complet & Prénom *</label>
                <input
                  type="text"
                  required
                  value={editorUserName}
                  onChange={(e) => setEditorUserName(e.target.value)}
                  placeholder="Ex: Marc Koffi Bamba"
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Téléphone WhatsApp Professionnel *</label>
                <input
                  type="text"
                  required
                  value={editorUserPhone}
                  onChange={(e) => setEditorUserPhone(e.target.value)}
                  placeholder="+225 07 00 00 00 00"
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adresse Email Professionnelle *</label>
                <input
                  type="email"
                  required
                  value={editorUserEmail}
                  onChange={(e) => setEditorUserEmail(e.target.value)}
                  placeholder="collaborateur@agb-services.ci"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rôle & Profil d'Habilitation *</label>
                <select
                  value={editorUserRole}
                  onChange={(e) => setEditorUserRole(e.target.value as SaaSEditorUser['role'])}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white cursor-pointer"
                >
                  <option value="support_tech">🛠️ Technicien Support & Déploiement</option>
                  <option value="billing_manager">💰 Responsable Facturation & Abonnements SaaS</option>
                  <option value="collaborator">👔 Collaborateur Gérance Déléguée</option>
                  <option value="auditor">📋 Auditeur Sécurité & Conformité (Lecture)</option>
                </select>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-950 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1 text-purple-900">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Règles de Première Connexion Automatiques :</span>
                </div>
                <p className="text-purple-800 leading-relaxed">
                  • Mot de passe initial : <span className="font-mono font-extrabold bg-purple-200 px-1 py-0.5 rounded text-purple-950">1234</span>
                  <br />
                  • Lors du premier accès, le collaborateur sera contraint de <strong>personnaliser son mot de passe</strong> et de <strong>transmettre sa pièce d'identité</strong> (CNI, Passeport, etc.).
                  <br />
                  • Les permissions détaillées pourront ensuite être ajustées via la <em>Matrice des Permissions</em>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddEditorUserModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-sm cursor-pointer transition active:scale-95"
                >
                  Créer l'Accès Collaborateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 9: AJOUTER UN CHAMP PERSONNALISÉ DYNAMIQUE                           */}
      {/* ========================================================================= */}
      {showAddCustomFieldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">Ajouter un Champ Personnalisé</h3>
              </div>
              <button
                onClick={() => setShowAddCustomFieldModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newField = {
                  id: `cf-${Date.now()}`,
                  key: customFieldKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                  label: customFieldLabel.trim(),
                  description: customFieldDescription.trim(),
                  value: customFieldValue.trim(),
                };
                const existing = state.saasGlobalSettings?.customFields || [];
                updateSaaSGlobalSettings({
                  customFields: [...existing, newField],
                });
                soundFX.playCashChime();
                setShowAddCustomFieldModal(false);
                setCustomFieldKey('');
                setCustomFieldLabel('');
                setCustomFieldDescription('');
                setCustomFieldValue('');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Clé Technique Unique (Key) *</label>
                <input
                  type="text"
                  required
                  value={customFieldKey}
                  onChange={(e) => setCustomFieldKey(e.target.value)}
                  placeholder="Ex: assistance_whatsapp_hotline"
                  className="w-full p-2 border border-slate-300 rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Libellé Affiché (Label) *</label>
                <input
                  type="text"
                  required
                  value={customFieldLabel}
                  onChange={(e) => setCustomFieldLabel(e.target.value)}
                  placeholder="Ex: Hotline WhatsApp Directe 24/7"
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Explication du Champ</label>
                <textarea
                  rows={2}
                  value={customFieldDescription}
                  onChange={(e) => setCustomFieldDescription(e.target.value)}
                  placeholder="Ex: Numéro affiché en bas de page pour le support technique d'urgence."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Valeur Initiale</label>
                <input
                  type="text"
                  value={customFieldValue}
                  onChange={(e) => setCustomFieldValue(e.target.value)}
                  placeholder="Ex: +225 07 00 11 22 33"
                  className="w-full p-2 border border-slate-300 rounded font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCustomFieldModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Créer le Champ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 10: CONFIRMATION REMISE À ZÉRO VIERGE POUR PRODUCTION                */}
      {/* ========================================================================= */}
      {showResetVirginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-rose-200 space-y-4 my-8">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-7 h-7 shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Réinitialisation Vierge pour Production</h3>
                <p className="text-[11px] text-rose-600 font-semibold">Action irréversible de nettoyage</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Cette action supprimera toutes les commandes d'essai, écritures de caisse, livraisons et logs de démonstration pour laisser une base de données propre et prête au démarrage opérationnel réel.
            </p>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-2">
              <p className="font-bold">Pour confirmer, tapez le mot <span className="font-mono bg-rose-200 px-1 py-0.5 rounded">PRODUCTION</span> ci-dessous :</p>
              <input
                type="text"
                value={virginResetConfirmText}
                onChange={(e) => setVirginResetConfirmText(e.target.value)}
                placeholder="Tapez PRODUCTION"
                className="w-full p-2 bg-white border border-rose-300 rounded font-mono font-bold text-rose-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowResetVirginModal(false);
                  setVirginResetConfirmText('');
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={virginResetConfirmText !== 'PRODUCTION'}
                onClick={() => {
                  resetVirginStateForProduction();
                  soundFX.playSuccess();
                  setShowResetVirginModal(false);
                  setVirginResetConfirmText('');
                }}
                className={`px-5 py-2 font-bold rounded-lg text-xs shadow-sm transition ${
                  virginResetConfirmText === 'PRODUCTION'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Confirmer la Réinitialisation Vierge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 10: MATRICE DES PERMISSIONS ET HABILITATIONS COLLABORATEURS         */}
      {/* ========================================================================= */}
      {showPermissionsModal && selectedCollabForPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-6 border border-purple-200 space-y-5 my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Matrice des Permissions & Habilitations Collaborateurs
                  </h3>
                  <p className="text-xs text-slate-500">
                    Définissez avec précision les actions autorisées pour chaque collaborateur dans la console Super Admin.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {permSavedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{permSavedNotice}</span>
              </div>
            )}

            {/* Collaborator Selector Tabs */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Sélectionner le Collaborateur à Configurer :
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {state.saasEditorUsers.map((user) => {
                  const isSelected = selectedCollabForPerms.id === user.id;
                  const isOwner = user.isOwner || user.role === 'super_admin';

                  return (
                    <button
                      key={user.id}
                      onClick={() => handleSelectCollabForPerms(user)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 border cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {isOwner ? <Crown className="w-3.5 h-3.5 text-amber-300" /> : <User className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{user.name}</span>
                      {isOwner && (
                        <span className="text-[9px] bg-purple-900/60 text-purple-200 px-1.5 py-0.2 rounded font-mono">
                          PROPRIÉTAIRE
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Collaborator Info Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {selectedCollabForPerms.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{selectedCollabForPerms.name}</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded uppercase">
                      {selectedCollabForPerms.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    📧 {selectedCollabForPerms.email} • 📞 {selectedCollabForPerms.phone}
                  </p>
                </div>
              </div>

              {/* Quick Template Presets (Only for non-owner collaborators) */}
              {!selectedCollabForPerms.isOwner && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Modèles rapides :</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPermissions({
                        ...DEFAULT_COLLABORATOR_PERMISSIONS,
                        canViewTenants: true,
                        canCreateTenants: true,
                        canEditTenants: true,
                        canAddAdditionalPressing: true,
                        canImpersonateTenant: true,
                        canSuspendTenant: true,
                        canReactivateTenant: true,
                        canExtendTrial: true,
                        canSendBroadcast: true,
                        canViewAuditLogs: true,
                        canRecordSaaSPayments: false,
                        canManageInvoices: false,
                        canDeleteTenants: false,
                        canResetDatabase: false,
                      });
                      soundFX.playBeep();
                    }}
                    className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[10px] font-bold text-slate-700 cursor-pointer shadow-2xs"
                  >
                    🛠️ Support Tech
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPermissions({
                        ...DEFAULT_COLLABORATOR_PERMISSIONS,
                        canViewTenants: true,
                        canCreateTenants: false,
                        canEditTenants: false,
                        canAddAdditionalPressing: false,
                        canImpersonateTenant: false,
                        canSuspendTenant: false,
                        canReactivateTenant: false,
                        canRecordSaaSPayments: true,
                        canManageInvoices: true,
                        canDeleteTenants: false,
                        canResetDatabase: false,
                      });
                      soundFX.playBeep();
                    }}
                    className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[10px] font-bold text-slate-700 cursor-pointer shadow-2xs"
                  >
                    💰 Facturation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPermissions({
                        ...DEFAULT_COLLABORATOR_PERMISSIONS,
                        canViewTenants: true,
                        canCreateTenants: true,
                        canEditTenants: true,
                        canAddAdditionalPressing: true,
                        canImpersonateTenant: true,
                        canSuspendTenant: true,
                        canReactivateTenant: true,
                        canExtendTrial: true,
                        canRecordSaaSPayments: true,
                        canManageInvoices: true,
                        canManageSaaSPlans: true,
                        canSendBroadcast: true,
                        canViewAuditLogs: true,
                        canManageCollaborators: false,
                        canManageGlobalSettings: false,
                        canDeleteTenants: false,
                        canResetDatabase: false,
                      });
                      soundFX.playBeep();
                    }}
                    className="px-2 py-1 bg-purple-100 hover:bg-purple-200 border border-purple-300 rounded text-[10px] font-bold text-purple-900 cursor-pointer shadow-2xs"
                  >
                    👔 Gérance Déléguée
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Permissions Matrix List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
              {/* Group 1: Gestion des Clients & Pressings B2B */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    1. Portefeuille Pressings & Clients B2B
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Création, modification & accès</span>
                </div>

                <div className="divide-y divide-slate-100 p-2">
                  {/* canViewTenants */}
                  <label className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <div>
                      <p className="font-bold text-slate-800">Consulter la liste et les statistiques des pressings</p>
                      <p className="text-[11px] text-slate-500">Accès en lecture à l'annuaire des pressings et aux indicateurs</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingPermissions.canViewTenants}
                      disabled={selectedCollabForPerms.isOwner}
                      onChange={(e) => setEditingPermissions({ ...editingPermissions, canViewTenants: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </label>

                  {/* canCreateTenants */}
                  <label className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <div>
                      <p className="font-bold text-slate-800">Créer de nouveaux pressings indépendants</p>
                      <p className="text-[11px] text-slate-500">Bouton "Nouveau Pressing" et attribution de la période d'essai</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingPermissions.canCreateTenants}
                      disabled={selectedCollabForPerms.isOwner}
                      onChange={(e) => setEditingPermissions({ ...editingPermissions, canCreateTenants: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </label>

                  {/* canEditTenants */}
                  <label className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <div>
                      <p className="font-bold text-slate-800">Modifier les coordonnées et configurations des clients</p>
                      <p className="text-[11px] text-slate-500">Modification du nom, gérant, téléphone WhatsApp et ville</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingPermissions.canEditTenants}
                      disabled={selectedCollabForPerms.isOwner}
                      onChange={(e) => setEditingPermissions({ ...editingPermissions, canEditTenants: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </label>

                  {/* canAddAdditionalPressing */}
                  <label className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <div>
                      <p className="font-bold text-slate-800">Créer un pressing supplémentaire pour client existant</p>
                      <p className="text-[11px] text-slate-500">Bouton "+ Pressing Client Abonné" pour déployer une nouvelle agence</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingPermissions.canAddAdditionalPressing}
                      disabled={selectedCollabForPerms.isOwner}
                      onChange={(e) => setEditingPermissions({ ...editingPermissions, canAddAdditionalPressing: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </label>

                  {/* canImpersonateTenant */}
                  <label className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <div>
                      <p className="font-bold text-slate-800">Immersion directe dans la session d'un pressing (Accéder →)</p>
                      <p className="text-[11px] text-slate-500">Permet de se connecter directement à l'espace de gestion du client</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingPermissions.canImpersonateTenant}
                      disabled={selectedCollabForPerms.isOwner}
                      onChange={(e) => setEditingPermissions({ ...editingPermissions, canImpersonateTenant: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </label>

                  {/* canSuspendTenant */}
                  <label className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <div>
                      <p className="font-bold text-slate-800">Suspendre l'accès logiciel d'un pressing</p>
                      <p className="text-[11px] text-slate-500">Blocage temporaire en cas d'impayé ou incident</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingPermissions.canSuspendTenant}
                      disabled={selectedCollabForPerms.isOwner}
                      onChange={(e) => setEditingPermissions({ ...editingPermissions, canSuspendTenant: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </label>

                  {/* canReactivateTenant */}
                  <label className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <div>
                      <p className="font-bold text-slate-800">Réactiver immédiatement en 1 clic un pressing (+30 jours)</p>
                      <p className="text-[11px] text-slate-500">Rétablissement instantané de la licence d'un client suspendu</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingPermissions.canReactivateTenant}
                      disabled={selectedCollabForPerms.isOwner}
                      onChange={(e) => setEditingPermissions({ ...editingPermissions, canReactivateTenant: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </label>

                  {/* canExtendTrial */}
                  <label className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <div>
                      <p className="font-bold text-slate-800">Prolonger la période d'essai gratuit (+7 jours)</p>
                      <p className="text-[11px] text-slate-500">Accorder des jours supplémentaires de démonstration</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingPermissions.canExtendTrial}
                      disabled={selectedCollabForPerms.isOwner}
                      onChange={(e) => setEditingPermissions({ ...editingPermissions, canExtendTrial: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </label>

                  {/* canDeleteTenants - VERROUILLÉ PROPRIÉTAIRE */}
                  <div className="p-2.5 flex items-center justify-between bg-rose-50/50 rounded-lg border border-rose-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-rose-900">Supprimer définitivement un client / pressing</p>
                        <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2 py-0.2 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          PROPRIÉTAIRE SEUL
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-700">
                        Exclusivité absolue du Super Admin Propriétaire (Gilles Brice Atsé). Non attribuable aux collaborateurs.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedCollabForPerms.isOwner}
                      disabled
                      className="w-4 h-4 text-rose-600 rounded cursor-not-allowed opacity-70"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Facturation SaaS & Finances */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    2. Facturation SaaS & Encaissements
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Wave, OM, factures & tarifs</span>
                </div>

                <div className="divide-y divide-slate-100 p-2">
                  {/* canRecordSaaSPayments */}
                  <label className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <div>
                      <p className="font-bold text-slate-800">Encaisser les paiements d'abonnement</p>
                      <p className="text-[11px] text-slate-500">Validation des encaissements Wave, Orange Money, MoMo et Espèces</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingPermissions.canRecordSaaSPayments}
                      disabled={selectedCollabForPerms.isOwner}
                      onChange={(e) => setEditingPermissions({ ...editingPermissions, canRecordSaaSPayments: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </label>

                  {/* canManageInvoices */}
                  <label className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <div>
                      <p className="font-bold text-slate-800">Émettre et gérer les factures proforma / acquittées</p>
                      <p className="text-[11px] text-slate-500">Création manuelle de factures et relances WhatsApp d'impayés</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingPermissions.canManageInvoices}
                      disabled={selectedCollabForPerms.isOwner}
                      onChange={(e) => setEditingPermissions({ ...editingPermissions, canManageInvoices: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </label>

                  {/* canManageSaaSPlans */}
                  <label className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <div>
                      <p className="font-bold text-slate-800">Configurer la grille des formules & tarifs SaaS</p>
                      <p className="text-[11px] text-slate-500">Modification des prix mensuels/annuels et quotas Starter, Pro, Enterprise</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingPermissions.canManageSaaSPlans}
                      disabled={selectedCollabForPerms.isOwner}
                      onChange={(e) => setEditingPermissions({ ...editingPermissions, canManageSaaSPlans: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Group 3: Communication & Traçabilité */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <Megaphone className="w-3.5 h-3.5 text-sky-600" />
                    3. Communication, Diffusion & Traçabilité
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Alertes popups & logs d'audit</span>
                </div>

                <div className="divide-y divide-slate-100 p-2">
                  {/* canSendBroadcast */}
                  <label className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <div>
                      <p className="font-bold text-slate-800">Diffuser des alertes popups à tous les pressings</p>
                      <p className="text-[11px] text-slate-500">Envoi de notifications générales de maintenance ou promotions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingPermissions.canSendBroadcast}
                      disabled={selectedCollabForPerms.isOwner}
                      onChange={(e) => setEditingPermissions({ ...editingPermissions, canSendBroadcast: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </label>

                  {/* canViewAuditLogs */}
                  <label className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <div>
                      <p className="font-bold text-slate-800">Consulter les journaux d'audit et la traçabilité</p>
                      <p className="text-[11px] text-slate-500">Historique complet des connexions, paiements et modifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingPermissions.canViewAuditLogs}
                      disabled={selectedCollabForPerms.isOwner}
                      onChange={(e) => setEditingPermissions({ ...editingPermissions, canViewAuditLogs: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Group 4: Administration & Système */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 text-purple-600" />
                    4. Administration Globale & Paramètres Système
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Équipe éditeur & passerelles</span>
                </div>

                <div className="divide-y divide-slate-100 p-2">
                  {/* canManageCollaborators */}
                  <label className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <div>
                      <p className="font-bold text-slate-800">Créer et gérer les membres de l'équipe éditeur</p>
                      <p className="text-[11px] text-slate-500">Ajout de collaborateurs et suivi des pièces d'identité</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingPermissions.canManageCollaborators}
                      disabled={selectedCollabForPerms.isOwner}
                      onChange={(e) => setEditingPermissions({ ...editingPermissions, canManageCollaborators: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </label>

                  {/* canManageGlobalSettings */}
                  <label className="p-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg cursor-pointer transition">
                    <div>
                      <p className="font-bold text-slate-800">Configurer les numéros Wave/OM et coordonnées éditrice</p>
                      <p className="text-[11px] text-slate-500">Paramètres généraux, coordonnées AGB et informations de contact</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editingPermissions.canManageGlobalSettings}
                      disabled={selectedCollabForPerms.isOwner}
                      onChange={(e) => setEditingPermissions({ ...editingPermissions, canManageGlobalSettings: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                  </label>

                  {/* canResetDatabase - VERROUILLÉ PROPRIÉTAIRE */}
                  <div className="p-2.5 flex items-center justify-between bg-rose-50/50 rounded-lg border border-rose-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-rose-900">Réinitialisation complète de la base de données</p>
                        <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2 py-0.2 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          PROPRIÉTAIRE SEUL
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-700">
                        Exclusivité absolue du Super Admin Propriétaire (Gilles Brice Atsé).
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedCollabForPerms.isOwner}
                      disabled
                      className="w-4 h-4 text-rose-600 rounded cursor-not-allowed opacity-70"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                {selectedCollabForPerms.isOwner
                  ? "Le Super Admin Propriétaire possède toutes les accréditations légales."
                  : `Permissions pour ${selectedCollabForPerms.name}`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPermissionsModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                >
                  Fermer
                </button>

                {!selectedCollabForPerms.isOwner && (
                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer les Permissions</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
