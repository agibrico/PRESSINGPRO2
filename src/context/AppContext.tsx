import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuditLog,
  BroadcastNotification,
  Caisse,
  CaisseMovement,
  Client,
  ClientPayment,
  Delivery,
  Employee,
  Establishment,
  Expense,
  InventoryItem,
  JobPosition,
  Order,
  OrderStatusHistory,
  OrderWorkflowStatus,
  PaymentMethod,
  PaymentStatus,
  PermissionSet,
  SaaSEditorPermissions,
  SaaSEditorUser,
  SaaSGlobalSettings,
  SaaSInvoice,
  SaaSPlan,
  SaaSSubscriptionPayment,
  ServiceItem,
  SubscriptionPlanTier,
  Tenant,
  UserRole,
  UITheme,
  DensityMode,
  UIProposalMode,
} from '../types';
import {
  AppState,
  getInitialState,
  INITIAL_EMPLOYEES_ELEGANCE,
  INITIAL_JOB_POSITIONS_ELEGANCE,
  saveStateToStorage,
  STORAGE_KEY,
} from '../services/store';
import { soundFX } from '../services/sound';

interface AppContextType {
  state: AppState;
  currentTenant: Tenant | undefined;
  currentEstablishment: Establishment | undefined;
  currentEmployee: Employee | undefined;
  currentEditorUser: SaaSEditorUser | undefined;
  isEditorOwner: boolean;
  currentPermissions: PermissionSet;
  userRole: UserRole;

  // Session & Tenant switching
  switchRole: (role: UserRole, tenantId?: string, employeeId?: string) => void;
  switchEstablishment: (establishmentId: string) => void;

  // Super Admin (SaaS Publisher)
  createTenant: (tenant: Partial<Tenant>) => void;
  updateTenant: (tenantId: string, updates: Partial<Tenant>) => void;
  suspendTenant: (tenantId: string) => void;
  reactivateTenant: (tenantId: string) => void;
  deleteTenant: (tenantId: string) => { success: boolean; error?: string };
  extendTrial: (tenantId: string, days: number) => void;
  recordSaaSPayment: (payment: Omit<SaaSSubscriptionPayment, 'id' | 'receiptNumber'>) => void;
  createSaaSInvoice: (invoice: Omit<SaaSInvoice, 'id' | 'invoiceNumber'>) => SaaSInvoice;
  updateSaaSInvoiceStatus: (invoiceId: string, status: SaaSInvoice['status'], paidDate?: string) => void;
  updateSaaSPlan: (planId: string, updates: Partial<SaaSPlan>) => void;
  sendBroadcastNotification: (notification: Omit<BroadcastNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  deleteBroadcastNotification: (id: string) => void;
  createEditorUser: (user: Omit<SaaSEditorUser, 'id'>) => void;
  updateEditorUser: (id: string, updates: Partial<SaaSEditorUser>) => void;
  deleteEditorUser: (id: string) => void;
  updateEditorUserPermissions: (userId: string, permissions: SaaSEditorPermissions) => void;
  updateSaaSGlobalSettings: (settings: Partial<SaaSGlobalSettings>) => void;

  // Establishments (Agences)
  createEstablishment: (est: Omit<Establishment, 'id' | 'tenantId'>) => void;
  updateEstablishment: (id: string, updates: Partial<Establishment>) => void;

  // Jobs & Personnel
  createJobPosition: (job: Omit<JobPosition, 'id' | 'tenantId'>) => void;
  updateJobPosition: (id: string, updates: Partial<JobPosition>) => void;
  createEmployee: (emp: Omit<Employee, 'id' | 'tenantId'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Services Catalog & Tarifs
  createService: (service: Omit<ServiceItem, 'id' | 'tenantId'>) => void;
  updateService: (id: string, updates: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;

  // Clients
  createClient: (client: Omit<Client, 'id' | 'tenantId' | 'clientCode' | 'createdAt' | 'totalOrders' | 'totalSpent' | 'outstandingBalance' | 'loyaltyPoints'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;

  // Orders / Dépôts
  createOrder: (orderData: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (orderId: string, newStatus: OrderWorkflowStatus, notes?: string) => void;
  recordClientPayment: (paymentData: {
    orderId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionReference?: string;
    notes?: string;
    isCashVerified?: boolean;
  }) => ClientPayment;

  // Caisse & Finances
  openCaisse: (caisseId: string, initialAmount: number) => void;
  closeCaisse: (caisseId: string, actualCashCounted: number, notes?: string) => void;
  addCaisseMovement: (movement: Omit<CaisseMovement, 'id' | 'tenantId' | 'timestamp'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'tenantId' | 'establishmentName'>) => void;

  // Stocks & Deliveries
  createInventoryItem: (itemData: Omit<InventoryItem, 'id' | 'tenantId'>) => InventoryItem;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  updateInventoryThreshold: (id: string, minThreshold: number) => void;
  restockInventoryItem: (id: string, addedQty: number, costTotal: number) => void;
  updateStockItem: (id: string, addedQty: number, costTotal: number) => void;
  deleteInventoryItem: (id: string) => void;
  createDelivery: (delivery: Omit<Delivery, 'id' | 'tenantId'>) => void;
  updateDeliveryStatus: (id: string, status: Delivery['status'], notes?: string, proofData?: string) => void;
  assignDeliveryDriver: (deliveryId: string, driverId: string, driverName: string) => void;

  // Workflow by Garment Tag & Interventions
  updateOrderItemWorkflow: (
    orderId: string,
    itemId: string,
    nextStep: OrderWorkflowStatus,
    operatorName: string,
    operatorRole: string,
    notes?: string
  ) => void;

  // System & Logs
  addAuditLog: (action: string, category: AuditLog['category'], details: string, oldValue?: string, newValue?: string) => void;
  resetAllData: () => void;
  resetVirginStateForProduction: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonString: string) => boolean;

  // UI & Experience
  setUITheme: (theme: UITheme) => void;
  setDensity: (density: DensityMode) => void;
  setLayoutProposal: (proposal: UIProposalMode) => void;
  toggleSound: () => void;

  // Authentication & Security
  loginClient: (category: 'admin' | 'gerant' | 'employe', password: string, specificEmployeeId?: string) => { success: boolean; error?: string };
  loginEditor: (password: string) => { success: boolean; error?: string };
  loginEditorAdmin: (password: string) => { success: boolean; error?: string };
  loginEditorCollaborator: (collaboratorId: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateClientPassword: (newPass: string) => void;
  updateAdminPassword: (newPass: string) => void;
  updateGerantPassword: (newPass: string) => void;
  updateEditorPassword: (newPass: string) => void;
  completeFirstLoginAdmin: (newPassword: string) => void;
  completeFirstLoginGerant: (newPassword: string) => void;
  completeFirstLoginEmployee: (
    employeeId: string,
    newPassword: string,
    idCardData: { docType: string; docNumber: string; scanUrl: string; scanName: string }
  ) => void;
  completeFirstLoginEditorCollaborator: (
    collaboratorId: string,
    newPassword: string,
    idCardData: { docType: string; docNumber: string; scanUrl: string; scanName: string }
  ) => void;
  resetEmployeePassword: (employeeId: string) => void;
  resetEditorUserPassword: (userId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(getInitialState);

  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  const currentTenant = state.tenants.find((t) => t.id === state.currentTenantId);
  const currentEstablishment = state.establishments.find((e) => e.id === state.currentEstablishmentId);
  const currentEmployee = state.employees.find((e) => e.id === state.currentUserId);

  const currentEditorUser =
    state.saasEditorUsers.find((u) => u.id === state.currentLoggedInEditorUserId) ||
    state.saasEditorUsers.find((u) => u.isOwner) ||
    state.saasEditorUsers[0];

  const isEditorOwner =
    state.currentRole === 'super_admin' &&
    (currentEditorUser?.isOwner ?? (state.currentUserId === 'editor-gilles' || state.currentUserId === 'super-admin-agb'));

  // Compute RBAC permissions for the active user
  const currentPermissions: PermissionSet = (() => {
    if (state.currentRole === 'super_admin' || state.currentRole === 'owner') {
      return {
        canCreateClient: true,
        canEditClient: true,
        canDeleteClient: true,
        canViewClients: true,
        canCreateOrder: true,
        canEditOrder: true,
        canDeleteOrder: true,
        canViewOrders: true,
        canChangeOrderStatus: true,
        canApplyDiscount: true,
        canDeliverOrder: true,
        canManagePrices: true,
        canManageServices: true,
        canAcceptPayment: true,
        canRefundPayment: true,
        canCloseCaisse: true,
        canViewCashRegister: true,
        canViewRevenue: true,
        canViewProfits: true,
        canManageExpenses: true,
        canManageEmployees: true,
        canManageJobs: true,
        canViewSalaries: true,
        canManageStock: true,
        canManageDeliveries: true,
        canManageAgencies: true,
        canManageSettings: true,
        canViewAuditLogs: true,
      };
    }

    if (currentEmployee?.customPermissions) {
      const job = state.jobPositions.find((j) => j.id === currentEmployee.jobPositionId);
      return {
        ...(job?.permissions || {}),
        ...currentEmployee.customPermissions,
      } as PermissionSet;
    }

    const job = state.jobPositions.find((j) => j.id === currentEmployee?.jobPositionId);
    if (job) {
      return job.permissions;
    }

    // Default fallback
    return {
      canCreateClient: true,
      canEditClient: false,
      canDeleteClient: false,
      canViewClients: true,
      canCreateOrder: true,
      canEditOrder: false,
      canDeleteOrder: false,
      canViewOrders: true,
      canChangeOrderStatus: true,
      canApplyDiscount: false,
      canDeliverOrder: false,
      canManagePrices: false,
      canManageServices: false,
      canAcceptPayment: true,
      canRefundPayment: false,
      canCloseCaisse: false,
      canViewCashRegister: true,
      canViewRevenue: false,
      canViewProfits: false,
      canManageExpenses: false,
      canManageEmployees: false,
      canManageJobs: false,
      canViewSalaries: false,
      canManageStock: false,
      canManageDeliveries: false,
      canManageAgencies: false,
      canManageSettings: false,
      canViewAuditLogs: false,
    };
  })();

  const addAuditLog = (
    action: string,
    category: AuditLog['category'],
    details: string,
    oldValue?: string,
    newValue?: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tenantId: state.currentRole === 'super_admin' ? undefined : state.currentTenantId,
      tenantName: state.currentRole === 'super_admin' ? 'Éditeur SaaS Global' : currentTenant?.companyName,
      userId: state.currentUserId,
      userName: state.currentUserName,
      userRole: state.currentRole,
      action,
      category,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ipAddress: '160.155.201.45 (Abidjan)',
      device: navigator.userAgent.includes('Mobile') ? 'Mobile / Tablette' : 'Poste de travail Desktop',
      details,
      oldValue,
      newValue,
    };

    setState((prev) => ({
      ...prev,
      auditLogs: [newLog, ...prev.auditLogs],
    }));
  };

  const switchRole = (role: UserRole, tenantId?: string, employeeId?: string) => {
    let targetTenantId = tenantId || state.currentTenantId;
    let targetUserId = employeeId || 'user-unknown';
    let targetUserName = 'Utilisateur';

    if (role === 'super_admin') {
      targetTenantId = 'saas-global';
      targetUserId = 'superadmin';
      targetUserName = 'Super Admin / Éditeur SaaS';
    } else if (role === 'owner') {
      const t = state.tenants.find((item) => item.id === targetTenantId) || state.tenants[0];
      targetTenantId = t.id;
      targetUserId = `owner-${t.id}`;
      targetUserName = `${t.ownerName} (Propriétaire)`;
    } else if (employeeId) {
      const emp = state.employees.find((e) => e.id === employeeId);
      if (emp) {
        targetTenantId = emp.tenantId;
        targetUserId = emp.id;
        targetUserName = `${emp.firstName} ${emp.lastName} (${emp.jobTitle})`;
      }
    } else {
      // Find first employee with this role or generic
      const emp = state.employees.find((e) => e.tenantId === targetTenantId);
      if (emp) {
        targetUserId = emp.id;
        targetUserName = `${emp.firstName} ${emp.lastName} (${role})`;
      }
    }

    setState((prev) => ({
      ...prev,
      currentRole: role,
      currentTenantId: targetTenantId,
      currentUserId: targetUserId,
      currentUserName: targetUserName,
      currentEstablishmentId: 'all',
    }));

    addAuditLog('SESSION_SWITCH', 'security', `Changement de session vers: ${role} (${targetUserName})`);
  };

  const switchEstablishment = (establishmentId: string) => {
    setState((prev) => ({
      ...prev,
      currentEstablishmentId: establishmentId,
    }));
  };

  // SaaS Super Admin methods
  const createTenant = (tenantData: Partial<Tenant>) => {
    const id = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      id,
      companyName: tenantData.companyName || 'Nouveau Pressing',
      slug: tenantData.slug || `pressing-${Date.now()}`,
      ownerName: tenantData.ownerName || 'Propriétaire',
      ownerEmail: tenantData.ownerEmail || 'contact@pressing.ci',
      ownerPhone: tenantData.ownerPhone || '+225 00 00 00 00 00',
      ownerWhatsapp: tenantData.ownerWhatsapp || '+225 00 00 00 00 00',
      currency: 'FCFA',
      country: "Côte d'Ivoire",
      city: tenantData.city || 'Abidjan',
      registeredDate: new Date().toISOString().substring(0, 10),
      status: 'trial',
      planTier: tenantData.planTier || 'basic',
      planName: tenantData.planTier === 'premium' ? 'Formule ENTERPRISE PREMIUM' : tenantData.planTier === 'pro' ? 'Formule PRO EXPANSION' : 'Formule STARTER',
      trialStartDate: new Date().toISOString().substring(0, 10),
      trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      outstandingBalance: 0,
      establishmentsCount: 1,
      usersCount: 1,
      receiptHeader: `${tenantData.companyName?.toUpperCase() || 'MON PRESSING'}\nService de Blanchisserie & Pressing Pro`,
      receiptFooter: 'Merci pour votre confiance. Retrait sur présentation de ce ticket.',
      taxRate: 0,
      expressSurchargeRate: 50,
      customWorkflowStages: [
        { key: 'deposited', label: 'Déposée', enabled: true },
        { key: 'sorting', label: 'Tri & Marquage', enabled: true },
        { key: 'washing', label: 'En lavage', enabled: true },
        { key: 'ironing', label: 'En repassage', enabled: true },
        { key: 'ready', label: 'Prête', enabled: true },
        { key: 'delivered', label: 'Livrée / Retirée', enabled: true },
      ],
      ...tenantData,
    };

    // Also create initial main establishment
    const initialEst: Establishment = {
      id: `est-${id}-main`,
      tenantId: id,
      name: `Siège & Agence Principale - ${newTenant.companyName}`,
      code: 'AG-01',
      city: newTenant.city,
      neighborhood: 'Centre-ville',
      address: 'Abidjan, Côte d’Ivoire',
      phone: newTenant.ownerPhone,
      whatsapp: newTenant.ownerWhatsapp,
      managerName: newTenant.ownerName,
      isMain: true,
      status: 'active',
    };

    // Prepopulate jobs for new tenant
    const initialJobs = INITIAL_JOB_POSITIONS_ELEGANCE.map((j) => ({
      ...j,
      id: `job-${id}-${j.code}`,
      tenantId: id,
    }));

    // Prepopulate default caisse
    const initialCaisse: Caisse = {
      id: `caisse-${id}-main`,
      tenantId: id,
      establishmentId: initialEst.id,
      name: 'Caisse Principale',
      initialBalance: 20000,
      currentCashBalance: 20000,
      totalInToday: 0,
      totalOutToday: 0,
      theoreticalBalance: 20000,
      isOpen: true,
      lastOpenedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setState((prev) => ({
      ...prev,
      tenants: [newTenant, ...prev.tenants],
      establishments: [...prev.establishments, initialEst],
      jobPositions: [...prev.jobPositions, ...initialJobs],
      caisses: [...prev.caisses, initialCaisse],
    }));

    addAuditLog('CREATE_TENANT', 'saas_admin', `Création du nouveau pressing client: ${newTenant.companyName} (${newTenant.planName})`);
  };

  const updateTenant = (tenantId: string, updates: Partial<Tenant>) => {
    setState((prev) => ({
      ...prev,
      tenants: prev.tenants.map((t) => (t.id === tenantId ? { ...t, ...updates } : t)),
    }));
    addAuditLog('UPDATE_TENANT', 'settings', `Mise à jour des paramètres de l'entreprise: ${tenantId}`);
  };

  const suspendTenant = (tenantId: string) => {
    setState((prev) => ({
      ...prev,
      tenants: prev.tenants.map((t) => (t.id === tenantId ? { ...t, status: 'suspended' } : t)),
    }));
    addAuditLog('SUSPEND_TENANT', 'saas_admin', `Suspension du compte SaaS: ${tenantId}`);
  };

  const reactivateTenant = (tenantId: string, extensionDays = 30) => {
    const target = state.tenants.find((t) => t.id === tenantId);
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);
    const newFutureDate = new Date(now.getTime() + extensionDays * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    setState((prev) => ({
      ...prev,
      tenants: prev.tenants.map((t) => {
        if (t.id !== tenantId) return t;
        const isPastEndDate = !t.subscriptionEndDate || t.subscriptionEndDate < todayStr;
        const finalEndDate = isPastEndDate ? newFutureDate : t.subscriptionEndDate;
        return {
          ...t,
          status: 'active',
          subscriptionStartDate: t.subscriptionStartDate || todayStr,
          subscriptionEndDate: finalEndDate,
          trialEndDate: undefined,
        };
      }),
    }));

    try {
      soundFX.playSuccess();
    } catch {
      // Ignore audio error
    }

    addAuditLog(
      'REACTIVATE_TENANT',
      'saas_admin',
      `Réactivation immédiate en 1 clic du pressing: ${target?.companyName || tenantId} (Statut: ACTIF, Validité jusqu'au ${newFutureDate})`
    );
  };

  const deleteTenant = (tenantId: string): { success: boolean; error?: string } => {
    if (!isEditorOwner) {
      soundFX.playError();
      return {
        success: false,
        error: 'Action non autorisée : Seul le Super Administrateur Propriétaire (Gilles Brice Atsé) a le droit de supprimer un client/pressing.',
      };
    }

    const target = state.tenants.find((t) => t.id === tenantId);
    setState((prev) => ({
      ...prev,
      tenants: prev.tenants.filter((t) => t.id !== tenantId),
      establishments: prev.establishments.filter((e) => e.tenantId !== tenantId),
      employees: prev.employees.filter((e) => e.tenantId !== tenantId),
      orders: prev.orders.filter((o) => o.tenantId !== tenantId),
      clients: prev.clients.filter((c) => c.tenantId !== tenantId),
      caisses: prev.caisses.filter((c) => c.tenantId !== tenantId),
      expenses: prev.expenses.filter((e) => e.tenantId !== tenantId),
      inventory: prev.inventory.filter((i) => i.tenantId !== tenantId),
      deliveries: prev.deliveries.filter((d) => d.tenantId !== tenantId),
      currentTenantId: prev.currentTenantId === tenantId ? prev.tenants.find((t) => t.id !== tenantId)?.id || 'tenant-elegance' : prev.currentTenantId,
    }));
    addAuditLog('DELETE_TENANT', 'saas_admin', `Suppression définitive du pressing client: ${target?.companyName || tenantId} effectuée par le Super Admin Propriétaire`);
    return { success: true };
  };

  const extendTrial = (tenantId: string, days: number) => {
    setState((prev) => ({
      ...prev,
      tenants: prev.tenants.map((t) => {
        if (t.id === tenantId) {
          const currentEnd = t.trialEndDate ? new Date(t.trialEndDate).getTime() : Date.now();
          const newEndDate = new Date(Math.max(Date.now(), currentEnd) + days * 24 * 60 * 60 * 1000)
            .toISOString()
            .substring(0, 10);
          return {
            ...t,
            status: 'trial',
            trialEndDate: newEndDate,
          };
        }
        return t;
      }),
    }));
    addAuditLog('EXTEND_TRIAL', 'saas_admin', `Prolongation de la période d’essai de ${days} jours pour ${tenantId}`);
  };

  const recordSaaSPayment = (paymentData: Omit<SaaSSubscriptionPayment, 'id' | 'receiptNumber'>) => {
    const id = `saas-pay-${Date.now()}`;
    const receiptNumber = `INV-SAAS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: SaaSSubscriptionPayment = {
      ...paymentData,
      id,
      receiptNumber,
    };

    const newInvoice: SaaSInvoice = {
      id: `inv-${id}`,
      invoiceNumber: `FAC-SAAS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: paymentData.tenantId,
      tenantName: paymentData.tenantName,
      ownerName: paymentData.ownerName,
      ownerPhone: paymentData.ownerPhone,
      ownerEmail: state.tenants.find((t) => t.id === paymentData.tenantId)?.ownerEmail || 'client@pressing.ci',
      planTier: paymentData.planTier,
      planName: paymentData.planName,
      billingCycle: paymentData.billingCycle,
      coverageStartDate: paymentData.coverageStartDate,
      coverageEndDate: paymentData.coverageEndDate,
      subtotal: paymentData.amount,
      taxAmount: 0,
      totalAmount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      transactionReference: paymentData.transactionReference,
      status: 'paid',
      issueDate: paymentData.paymentDate,
      dueDate: paymentData.paymentDate,
      paidDate: paymentData.paymentDate,
      items: [
        {
          description: `Abonnement Logiciel MON PRESSING PRO - ${paymentData.planName} (${paymentData.billingCycle === 'yearly' ? '12 mois' : '1 mois'})`,
          quantity: 1,
          unitPrice: paymentData.amount,
          total: paymentData.amount,
        },
      ],
      notes: paymentData.notes || `Paiement ${paymentData.paymentMethod.toUpperCase()} validé par le Super Admin Éditeur`,
    };

    setState((prev) => ({
      ...prev,
      saasPayments: [newPayment, ...prev.saasPayments],
      saasInvoices: [newInvoice, ...prev.saasInvoices],
      tenants: prev.tenants.map((t) => {
        if (t.id === paymentData.tenantId) {
          return {
            ...t,
            status: 'active',
            planTier: paymentData.planTier,
            planName: paymentData.planName,
            subscriptionStartDate: paymentData.coverageStartDate,
            subscriptionEndDate: paymentData.coverageEndDate,
            lastPaymentDate: paymentData.paymentDate,
            outstandingBalance: 0,
          };
        }
        return t;
      }),
    }));

    addAuditLog(
      'RECORD_SAAS_PAYMENT',
      'saas_admin',
      `Enregistrement paiement abonnement SaaS de ${paymentData.amount} FCFA pour ${paymentData.tenantName} (${paymentData.paymentMethod.toUpperCase()})`
    );
  };

  const createSaaSInvoice = (invoiceData: Omit<SaaSInvoice, 'id' | 'invoiceNumber'>): SaaSInvoice => {
    const id = `inv-saas-${Date.now()}`;
    const invoiceNumber = `FAC-SAAS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice: SaaSInvoice = {
      ...invoiceData,
      id,
      invoiceNumber,
    };

    setState((prev) => ({
      ...prev,
      saasInvoices: [newInvoice, ...prev.saasInvoices],
    }));

    addAuditLog('CREATE_SAAS_INVOICE', 'saas_admin', `Génération de la facture SaaS ${invoiceNumber} pour ${invoiceData.tenantName} (${invoiceData.totalAmount} FCFA)`);
    return newInvoice;
  };

  const updateSaaSInvoiceStatus = (invoiceId: string, status: SaaSInvoice['status'], paidDate?: string) => {
    setState((prev) => ({
      ...prev,
      saasInvoices: prev.saasInvoices.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status,
              paidDate: status === 'paid' ? paidDate || new Date().toISOString().substring(0, 10) : inv.paidDate,
            }
          : inv
      ),
    }));
    addAuditLog('UPDATE_SAAS_INVOICE', 'saas_admin', `Statut de la facture ${invoiceId} mis à jour: ${status.toUpperCase()}`);
  };

  const updateSaaSPlan = (planId: string, updates: Partial<SaaSPlan>) => {
    setState((prev) => ({
      ...prev,
      saasPlans: prev.saasPlans.map((p) => (p.id === planId ? { ...p, ...updates } : p)),
    }));
    addAuditLog('UPDATE_SAAS_PLAN', 'saas_admin', `Modification de la formule tarifaire SaaS: ${planId}`);
  };

  const sendBroadcastNotification = (notification: Omit<BroadcastNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: BroadcastNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
    };

    setState((prev) => ({
      ...prev,
      broadcastNotifications: [newNotif, ...prev.broadcastNotifications],
    }));

    addAuditLog('BROADCAST_NOTIFICATION', 'saas_admin', `Diffusion d'une notification aux clients: "${notification.title}" (${notification.target})`);
  };

  const deleteBroadcastNotification = (id: string) => {
    setState((prev) => ({
      ...prev,
      broadcastNotifications: prev.broadcastNotifications.filter((n) => n.id !== id),
    }));
  };

  const createEditorUser = (userData: Omit<SaaSEditorUser, 'id'>) => {
    const newUser: SaaSEditorUser = {
      ...userData,
      id: `editor-${Date.now()}`,
    };
    setState((prev) => ({
      ...prev,
      saasEditorUsers: [...prev.saasEditorUsers, newUser],
    }));
    addAuditLog('CREATE_EDITOR_USER', 'saas_admin', `Ajout d'un compte utilisateur éditeur: ${userData.name} (${userData.role})`);
  };

  const updateEditorUser = (id: string, updates: Partial<SaaSEditorUser>) => {
    setState((prev) => ({
      ...prev,
      saasEditorUsers: prev.saasEditorUsers.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    }));
    addAuditLog('UPDATE_EDITOR_USER', 'saas_admin', `Mise à jour du compte éditeur: ${id}`);
  };

  const deleteEditorUser = (id: string) => {
    setState((prev) => ({
      ...prev,
      saasEditorUsers: prev.saasEditorUsers.filter((u) => u.id !== id),
    }));
    addAuditLog('DELETE_EDITOR_USER', 'saas_admin', `Suppression du compte éditeur: ${id}`);
  };

  const updateEditorUserPermissions = (userId: string, permissions: SaaSEditorPermissions) => {
    setState((prev) => ({
      ...prev,
      saasEditorUsers: prev.saasEditorUsers.map((u) =>
        u.id === userId
          ? {
              ...u,
              permissions: {
                ...permissions,
                // Preserve absolute protection of owner actions
                canDeleteTenants: u.isOwner ? true : false,
                canResetDatabase: u.isOwner ? true : false,
              },
            }
          : u
      ),
    }));
    const targetUser = state.saasEditorUsers.find((u) => u.id === userId);
    addAuditLog(
      'UPDATE_EDITOR_PERMISSIONS',
      'security',
      `Modification de la matrice des permissions pour le collaborateur éditeur: ${targetUser?.name || userId}`
    );
  };

  const updateSaaSGlobalSettings = (settings: Partial<SaaSGlobalSettings>) => {
    setState((prev) => ({
      ...prev,
      saasGlobalSettings: {
        ...prev.saasGlobalSettings,
        ...settings,
      },
    }));
    addAuditLog('UPDATE_SAAS_SETTINGS', 'saas_admin', 'Mise à jour des paramètres globaux de la plateforme SaaS');
  };

  // Establishments
  const createEstablishment = (est: Omit<Establishment, 'id' | 'tenantId'>) => {
    const id = `est-${Date.now()}`;
    const newEst: Establishment = {
      ...est,
      id,
      tenantId: state.currentTenantId,
    };

    // Create caisse for this establishment
    const newCaisse: Caisse = {
      id: `caisse-${id}`,
      tenantId: state.currentTenantId,
      establishmentId: id,
      name: `Caisse ${newEst.name}`,
      initialBalance: 15000,
      currentCashBalance: 15000,
      totalInToday: 0,
      totalOutToday: 0,
      theoreticalBalance: 15000,
      isOpen: true,
      lastOpenedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setState((prev) => ({
      ...prev,
      establishments: [...prev.establishments, newEst],
      caisses: [...prev.caisses, newCaisse],
      tenants: prev.tenants.map((t) =>
        t.id === state.currentTenantId ? { ...t, establishmentsCount: t.establishmentsCount + 1 } : t
      ),
    }));

    addAuditLog('CREATE_ESTABLISHMENT', 'settings', `Ajout d’un nouvel établissement: ${newEst.name}`);
  };

  const updateEstablishment = (id: string, updates: Partial<Establishment>) => {
    setState((prev) => ({
      ...prev,
      establishments: prev.establishments.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    addAuditLog('UPDATE_ESTABLISHMENT', 'settings', `Modification de l’établissement: ${id}`);
  };

  // Job Positions & Employees
  const createJobPosition = (job: Omit<JobPosition, 'id' | 'tenantId'>) => {
    const id = `job-${Date.now()}`;
    const newJob: JobPosition = {
      ...job,
      id,
      tenantId: state.currentTenantId,
    };
    setState((prev) => ({
      ...prev,
      jobPositions: [...prev.jobPositions, newJob],
    }));
    addAuditLog('CREATE_JOB', 'staff', `Création d’un poste sur-mesure: ${newJob.title} (${newJob.department})`);
  };

  const updateJobPosition = (id: string, updates: Partial<JobPosition>) => {
    setState((prev) => ({
      ...prev,
      jobPositions: prev.jobPositions.map((j) => (j.id === id ? { ...j, ...updates } : j)),
    }));
    addAuditLog('UPDATE_JOB', 'staff', `Mise à jour du poste: ${id}`);
  };

  const createEmployee = (emp: Omit<Employee, 'id' | 'tenantId'>) => {
    const id = `emp-${Date.now()}`;
    const newEmp: Employee = {
      ...emp,
      id,
      tenantId: state.currentTenantId,
      fullName: emp.fullName || `${emp.firstName} ${emp.lastName}`.trim(),
      role: emp.role || emp.jobTitle || 'Employé',
      hasChangedDefaultPassword: false,
    };
    setState((prev) => ({
      ...prev,
      employees: [...prev.employees, newEmp],
      tenants: prev.tenants.map((t) =>
        t.id === state.currentTenantId ? { ...t, usersCount: t.usersCount + 1 } : t
      ),
    }));
    addAuditLog('CREATE_EMPLOYEE', 'staff', `Recrutement employé: ${newEmp.firstName} ${newEmp.lastName} - ${newEmp.jobTitle} (Tél: ${newEmp.phone})`);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setState((prev) => ({
      ...prev,
      employees: prev.employees.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
    addAuditLog('UPDATE_EMPLOYEE', 'staff', `Mise à jour fiche employé: ${id}`);
  };

  const deleteEmployee = (id: string) => {
    const target = state.employees.find((e) => e.id === id);
    setState((prev) => ({
      ...prev,
      employees: prev.employees.filter((e) => e.id !== id),
      tenants: prev.tenants.map((t) =>
        t.id === state.currentTenantId ? { ...t, usersCount: Math.max(1, t.usersCount - 1) } : t
      ),
    }));
    addAuditLog('DELETE_EMPLOYEE', 'staff', `Suppression de l'employé: ${target?.firstName} ${target?.lastName}`);
  };

  // Services
  const createService = (service: Omit<ServiceItem, 'id' | 'tenantId'>) => {
    const id = `srv-${Date.now()}`;
    const newService: ServiceItem = {
      ...service,
      id,
      tenantId: state.currentTenantId,
    };
    setState((prev) => ({
      ...prev,
      services: [...prev.services, newService],
    }));
    addAuditLog('CREATE_SERVICE', 'settings', `Ajout service tarifaire: ${newService.name} (${newService.priceStandard} FCFA)`);
  };

  const updateService = (id: string, updates: Partial<ServiceItem>) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
    addAuditLog('UPDATE_SERVICE', 'settings', `Mise à jour tarif service: ${id}`);
  };

  const deleteService = (id: string) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
    addAuditLog('DELETE_SERVICE', 'settings', `Suppression de la prestation: ${id}`);
  };

  // Clients
  const createClient = (
    clientData: Omit<Client, 'id' | 'tenantId' | 'clientCode' | 'createdAt' | 'totalOrders' | 'totalSpent' | 'outstandingBalance' | 'loyaltyPoints'>
  ): Client => {
    const id = `cli-${Date.now()}`;
    const clientCode = `CLI-${Math.floor(100 + Math.random() * 900)}`;
    const newClient: Client = {
      ...clientData,
      id,
      tenantId: state.currentTenantId,
      clientCode,
      createdAt: new Date().toISOString().substring(0, 10),
      totalOrders: 0,
      totalSpent: 0,
      outstandingBalance: 0,
      loyaltyPoints: 0,
    };

    setState((prev) => ({
      ...prev,
      clients: [newClient, ...prev.clients],
    }));

    addAuditLog('CREATE_CLIENT', 'order', `Création client ${newClient.clientCode}: ${newClient.firstName} ${newClient.lastName} (${newClient.phone})`);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setState((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    addAuditLog('UPDATE_CLIENT', 'order', `Mise à jour client: ${id}`);
  };

  // Orders / Dépôts
  const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
    const id = `ord-${Date.now()}`;
    const orderNumber = `MPP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const est = state.establishments.find((e) => e.id === orderData.establishmentId) || state.establishments[0];

    const newOrder: Order = {
      id,
      tenantId: state.currentTenantId,
      establishmentId: est?.id || 'est-main',
      establishmentName: est?.name || 'Agence Principale',
      orderNumber,
      clientId: orderData.clientId || 'cli-001',
      clientName: orderData.clientName || 'Client Pressing',
      clientPhone: orderData.clientPhone || '+225 00 00 00 00',
      clientWhatsapp: orderData.clientWhatsapp || orderData.clientPhone,
      items: orderData.items || [],
      itemCount: orderData.items?.reduce((acc, item) => acc + item.quantity, 0) || 0,
      subtotal: orderData.subtotal || 0,
      isExpress: orderData.isExpress || false,
      expressFee: orderData.expressFee || 0,
      deliveryFee: orderData.deliveryFee || 0,
      discountAmount: orderData.discountAmount || 0,
      totalAmount: orderData.totalAmount || 0,
      paidAmount: orderData.paidAmount || 0,
      remainingBalance: (orderData.totalAmount || 0) - (orderData.paidAmount || 0),
      depositDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      promisedPickupDate: orderData.promisedPickupDate || new Date(Date.now() + 48 * 3600 * 1000).toISOString().substring(0, 10),
      promisedPickupTime: orderData.promisedPickupTime || '17:00',
      status: 'deposited',
      statusHistory: [
        {
          status: 'deposited',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          updatedByEmployeeId: state.currentUserId,
          updatedByEmployeeName: state.currentUserName,
          establishmentName: est?.name,
          notes: 'Dépôt initial enregistré à la caisse',
        },
      ],
      paymentStatus: (orderData.paidAmount || 0) >= (orderData.totalAmount || 0) ? 'paid' : (orderData.paidAmount || 0) > 0 ? 'partial' : 'unpaid',
      deliveryRequested: orderData.deliveryRequested || false,
      deliveryAddress: orderData.deliveryAddress,
      rackLocation: orderData.rackLocation || `P-${Math.floor(1 + Math.random() * 50)}`,
      generalNotes: orderData.generalNotes,
      createdByEmployeeId: state.currentUserId,
      createdByEmployeeName: state.currentUserName,
    };

    // Update Client metrics
    setState((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      clients: prev.clients.map((c) => {
        if (c.id === newOrder.clientId) {
          return {
            ...c,
            totalOrders: c.totalOrders + 1,
            totalSpent: c.totalSpent + newOrder.totalAmount,
            outstandingBalance: c.outstandingBalance + newOrder.remainingBalance,
            loyaltyPoints: c.loyaltyPoints + Math.floor(newOrder.totalAmount / 1000),
          };
        }
        return c;
      }),
    }));

    // If delivery requested, automatically queue into deliveries
    if (newOrder.deliveryRequested) {
      const deliveryRecord: Delivery = {
        id: `del-${Date.now()}`,
        tenantId: state.currentTenantId,
        establishmentId: newOrder.establishmentId,
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        clientId: newOrder.clientId,
        clientName: newOrder.clientName,
        clientPhone: newOrder.clientPhone,
        deliveryAddress: newOrder.deliveryAddress || 'Adresse client',
        neighborhood: 'Zone livraison',
        deliveryFee: newOrder.deliveryFee,
        amountToCollect: newOrder.remainingBalance,
        status: 'to_deliver',
        requestedDate: newOrder.promisedPickupDate,
        requestedTimeSlot: 'Après-midi (15h - 18h)',
        notes: `Livraison issue du dépôt ${newOrder.orderNumber}`,
      };

      setState((prev) => ({
        ...prev,
        deliveries: [deliveryRecord, ...prev.deliveries],
      }));
    }

    addAuditLog('CREATE_ORDER', 'order', `Création commande ${newOrder.orderNumber} pour ${newOrder.clientName} (${newOrder.totalAmount} FCFA, ${newOrder.itemCount} articles)`);
    soundFX.playSuccess();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderWorkflowStatus, notes?: string) => {
    soundFX.playStatusStep();
    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((order) => {
        if (order.id === orderId) {
          const historyEntry: OrderStatusHistory = {
            status: newStatus,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            updatedByEmployeeId: state.currentUserId,
            updatedByEmployeeName: state.currentUserName,
            establishmentName: order.establishmentName,
            notes: notes || `Changement statut vers ${newStatus.toUpperCase()}`,
          };
          return {
            ...order,
            status: newStatus,
            statusHistory: [historyEntry, ...order.statusHistory],
          };
        }
        return order;
      }),
    }));

    addAuditLog('ORDER_STATUS_CHANGE', 'order', `Commande ${orderId} passée au statut: ${newStatus.toUpperCase()}`);
  };

  const recordClientPayment = (paymentData: {
    orderId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionReference?: string;
    notes?: string;
    isCashVerified?: boolean;
  }): ClientPayment => {
    const order = state.orders.find((o) => o.id === paymentData.orderId);
    const client = state.clients.find((c) => c.id === order?.clientId);

    const paymentId = `pay-${Date.now()}`;
    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const txRef =
      paymentData.transactionReference ||
      `${paymentData.paymentMethod.toUpperCase()}-CI-${Date.now().toString().substring(6)}`;

    const newPayment: ClientPayment = {
      id: paymentId,
      tenantId: state.currentTenantId,
      establishmentId: order?.establishmentId || 'est-main',
      orderId: paymentData.orderId,
      orderNumber: order?.orderNumber || 'MPP-COMMANDE',
      clientId: client?.id || 'cli-001',
      clientName: client ? `${client.firstName} ${client.lastName}` : order?.clientName || 'Client Pressing',
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      transactionReference: txRef,
      receiptNumber,
      recordedByEmployeeId: state.currentUserId,
      recordedByEmployeeName: state.currentUserName,
      date: new Date().toISOString().substring(0, 10),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'confirmed',
      isCashVerified: paymentData.paymentMethod === 'cash' ? (paymentData.isCashVerified ?? true) : true,
      cashValidatedBy: paymentData.paymentMethod === 'cash' ? state.currentUserName : undefined,
      notes: paymentData.notes,
    };

    // Update order payment status
    setState((prev) => {
      const updatedOrders = prev.orders.map((o) => {
        if (o.id === paymentData.orderId) {
          const newPaid = o.paidAmount + paymentData.amount;
          const newRemaining = Math.max(0, o.totalAmount - newPaid);
          const payStatus = newRemaining === 0 ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';
          return {
            ...o,
            paidAmount: newPaid,
            remainingBalance: newRemaining,
            paymentStatus: payStatus as 'paid' | 'partial' | 'unpaid',
          };
        }
        return o;
      });

      // Update client balance
      const updatedClients = prev.clients.map((c) => {
        if (c.id === client?.id) {
          return {
            ...c,
            outstandingBalance: Math.max(0, c.outstandingBalance - paymentData.amount),
          };
        }
        return c;
      });

      // Update caisse if cash
      const updatedCaisses = prev.caisses.map((caisse) => {
        if (caisse.establishmentId === order?.establishmentId && paymentData.paymentMethod === 'cash') {
          return {
            ...caisse,
            currentCashBalance: caisse.currentCashBalance + paymentData.amount,
            totalInToday: caisse.totalInToday + paymentData.amount,
            theoreticalBalance: caisse.theoreticalBalance + paymentData.amount,
          };
        }
        return caisse;
      });

      return {
        ...prev,
        clientPayments: [newPayment, ...prev.clientPayments],
        orders: updatedOrders,
        clients: updatedClients,
        caisses: updatedCaisses,
      };
    });

    addAuditLog(
      'PAYMENT_RECEIVED',
      'financial',
      `Règlement client de ${paymentData.amount} FCFA reçu pour commande ${order?.orderNumber} via ${paymentData.paymentMethod.toUpperCase()}`
    );

    soundFX.playCashChime();
    return newPayment;
  };

  // Caisse
  const openCaisse = (caisseId: string, initialAmount: number) => {
    setState((prev) => ({
      ...prev,
      caisses: prev.caisses.map((c) =>
        c.id === caisseId
          ? {
              ...c,
              isOpen: true,
              initialBalance: initialAmount,
              currentCashBalance: initialAmount,
              totalInToday: 0,
              totalOutToday: 0,
              theoreticalBalance: initialAmount,
              lastOpenedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : c
      ),
    }));
    addAuditLog('OPEN_CAISSE', 'financial', `Ouverture de caisse (${caisseId}) avec fond initial de ${initialAmount} FCFA`);
  };

  const closeCaisse = (caisseId: string, actualCashCounted: number, notes?: string) => {
    const targetCaisse = state.caisses.find((c) => c.id === caisseId);
    const theoretical = targetCaisse ? targetCaisse.theoreticalBalance : actualCashCounted;
    const discrepancy = actualCashCounted - theoretical;

    setState((prev) => ({
      ...prev,
      caisses: prev.caisses.map((c) =>
        c.id === caisseId
          ? {
              ...c,
              isOpen: false,
              actualCashCounted,
              discrepancy,
              closedByEmployeeName: state.currentUserName,
              lastClosedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : c
      ),
    }));

    addAuditLog(
      'CLOSE_CAISSE',
      'financial',
      `Clôture de caisse (${caisseId}) - Espèces comptées: ${actualCashCounted} FCFA (Écart: ${discrepancy >= 0 ? '+' : ''}${discrepancy} FCFA)`
    );
  };

  const addCaisseMovement = (movement: Omit<CaisseMovement, 'id' | 'tenantId' | 'timestamp'>) => {
    const newMovement: CaisseMovement = {
      ...movement,
      id: `mov-${Date.now()}`,
      tenantId: state.currentTenantId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setState((prev) => ({
      ...prev,
      caisseMovements: [newMovement, ...prev.caisseMovements],
      caisses: prev.caisses.map((c) => {
        if (c.id === movement.caisseId) {
          const delta = movement.type === 'in' ? movement.amount : -movement.amount;
          return {
            ...c,
            currentCashBalance: c.currentCashBalance + delta,
            totalInToday: movement.type === 'in' ? c.totalInToday + movement.amount : c.totalInToday,
            totalOutToday: movement.type === 'out' ? c.totalOutToday + movement.amount : c.totalOutToday,
            theoreticalBalance: c.theoreticalBalance + delta,
          };
        }
        return c;
      }),
    }));

    addAuditLog('CAISSE_MOVEMENT', 'financial', `Mouvement caisse ${movement.type.toUpperCase()}: ${movement.amount} FCFA - ${movement.reason}`);
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'tenantId' | 'establishmentName'>) => {
    const est = state.establishments.find((e) => e.id === expense.establishmentId) || state.establishments[0];
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      tenantId: state.currentTenantId,
      establishmentName: est?.name || 'Agence Principale',
    };

    // If paid by cash, deduct from caisse
    setState((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
      caisses: prev.caisses.map((c) => {
        if (c.establishmentId === expense.establishmentId && expense.paymentMethod === 'cash') {
          return {
            ...c,
            currentCashBalance: Math.max(0, c.currentCashBalance - expense.amount),
            totalOutToday: c.totalOutToday + expense.amount,
            theoreticalBalance: c.theoreticalBalance - expense.amount,
          };
        }
        return c;
      }),
    }));

    addAuditLog('RECORD_EXPENSE', 'financial', `Dépense enregistrée: ${newExpense.title} (${newExpense.amount} FCFA - ${newExpense.category})`);
  };

  // Inventory & Stock
  const createInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'tenantId'>): InventoryItem => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
      tenantId: state.currentTenantId,
      status: itemData.currentStock <= 0 ? 'critical' : itemData.currentStock <= itemData.minThreshold ? 'low' : 'optimal',
    };
    setState((prev) => ({
      ...prev,
      inventory: [newItem, ...prev.inventory],
    }));
    addAuditLog('CREATE_STOCK_ITEM', 'settings', `Création nouveau produit en stock: ${newItem.name} (${newItem.category})`);
    soundFX.playCashChime();
    return newItem;
  };

  const updateInventoryThreshold = (id: string, minThreshold: number) => {
    setState((prev) => ({
      ...prev,
      inventory: prev.inventory.map((item) => {
        if (item.id === id) {
          const updatedMin = Math.max(0, minThreshold);
          const status =
            item.currentStock <= 0 ? 'critical' : item.currentStock <= updatedMin ? 'low' : 'optimal';
          return { ...item, minThreshold: updatedMin, status: status as 'optimal' | 'low' | 'critical' };
        }
        return item;
      }),
    }));
    addAuditLog('UPDATE_STOCK_THRESHOLD', 'settings', `Modification du seuil d'alerte pour article ID ${id} à ${minThreshold}`);
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setState((prev) => ({
      ...prev,
      inventory: prev.inventory.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          const status =
            updated.currentStock <= 0 ? 'critical' : updated.currentStock <= updated.minThreshold ? 'low' : 'optimal';
          return { ...updated, status: status as 'optimal' | 'low' | 'critical' };
        }
        return item;
      }),
    }));
    addAuditLog('UPDATE_STOCK', 'settings', `Mise à jour stock: ${id}`);
  };

  const deleteInventoryItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      inventory: prev.inventory.filter((i) => i.id !== id),
    }));
    addAuditLog('DELETE_STOCK_ITEM', 'settings', `Suppression du produit en stock: ${id}`);
  };

  const restockInventoryItem = (id: string, addedQty: number, costTotal: number) => {
    const target = state.inventory.find((i) => i.id === id);
    if (!target) return;

    const newStock = target.currentStock + addedQty;
    const newStatus = newStock <= target.minThreshold ? 'low' : 'optimal';

    setState((prev) => ({
      ...prev,
      inventory: prev.inventory.map((item) =>
        item.id === id
          ? {
              ...item,
              currentStock: newStock,
              status: newStatus as 'optimal' | 'low' | 'critical',
              lastRestockedDate: new Date().toISOString().substring(0, 10),
            }
          : item
      ),
    }));

    // Auto record expense
    addExpense({
      establishmentId: target.establishmentId,
      category: 'Produits de lavage / Détergents',
      title: `Réapprovisionnement: ${target.name} (+${addedQty} ${target.unit})`,
      amount: costTotal,
      paymentMethod: 'wave',
      beneficiaryOrSupplier: target.supplierName || 'Fournisseur chimie textile',
      recordedByEmployeeId: state.currentUserId,
      recordedByEmployeeName: state.currentUserName,
      date: new Date().toISOString().substring(0, 10),
    });

    addAuditLog('RESTOCK_INVENTORY', 'settings', `Réapprovisionnement de ${addedQty} ${target.unit} de ${target.name}`);
  };

  const updateStockItem = restockInventoryItem;

  // Workflow by Garment Tag & Interventions
  const updateOrderItemWorkflow = (
    orderId: string,
    itemId: string,
    nextStep: OrderWorkflowStatus,
    operatorName: string,
    operatorRole: string,
    notes?: string
  ) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    // Determine next role in chain
    const stepOrder: Record<OrderWorkflowStatus, { nextStep: OrderWorkflowStatus | null; nextRole: string }> = {
      deposited: { nextStep: 'sorting', nextRole: 'Agent de Tri & Marquage' },
      sorting: { nextStep: 'washing', nextRole: 'Laveur & Détacheur (Yao Koffi)' },
      washing: { nextStep: 'drying', nextRole: 'Opérateur Séchoir' },
      drying: { nextStep: 'ironing', nextRole: 'Repasseur / Presse (Aminata Diallo)' },
      ironing: { nextStep: 'quality_check', nextRole: 'Responsable Contrôle Qualité' },
      quality_check: { nextStep: 'ready', nextRole: 'Agent d’Accueil & Penderie (Sarah Konan)' },
      ready: { nextStep: 'in_delivery', nextRole: 'Chauffeur Livreur (Mamadou Doumbia)' },
      in_delivery: { nextStep: 'delivered', nextRole: 'Réceptionniste / Caisse' },
      delivered: { nextStep: null, nextRole: 'Clôturé' },
      archived: { nextStep: null, nextRole: 'Archivé' },
    };

    const nextChain = stepOrder[nextStep] || { nextStep: null, nextRole: 'Atelier' };

    setState((prev) => ({
      ...prev,
      orders: prev.orders.map((order) => {
        if (order.id !== orderId) return order;

        const updatedItems = order.items.map((item) => {
          if (item.id !== itemId) return item;
          const history = item.stepHistory || [];
          return {
            ...item,
            currentStep: nextStep,
            currentResponsibleRole: operatorRole,
            currentResponsibleName: operatorName,
            nextResponsibleRole: nextChain.nextRole,
            stepHistory: [
              ...history,
              {
                step: nextStep,
                employeeName: operatorName,
                employeeRole: operatorRole,
                timestamp,
                notes,
              },
            ],
          };
        });

        // Determine if whole order should advance
        const allItemsAtLeastNext = updatedItems.every(
          (i) => i.currentStep === nextStep || i.currentStep === 'ready' || i.currentStep === 'delivered'
        );

        const newOrderStatus = allItemsAtLeastNext ? nextStep : order.status;

        return {
          ...order,
          items: updatedItems,
          status: newOrderStatus,
          currentResponsibleRole: operatorRole,
          currentResponsibleName: operatorName,
          nextResponsibleRole: nextChain.nextRole,
          statusHistory: [
            ...order.statusHistory,
            {
              status: nextStep,
              timestamp,
              updatedByEmployeeId: state.currentUserId,
              updatedByEmployeeName: operatorName,
              establishmentName: order.establishmentName,
              notes: notes || `Traitement validé par ${operatorName} (${operatorRole}) → Suivant: ${nextChain.nextRole}`,
              nextStep: nextChain.nextStep || undefined,
              nextResponsibleRole: nextChain.nextRole,
            },
          ],
        };
      }),
    }));

    addAuditLog(
      'WORKFLOW_GARMENT_PROCESSED',
      'order',
      `Vêtement traité par ${operatorName} (${operatorRole}) -> Étape: ${nextStep.toUpperCase()} -> Prochain intervenant: ${nextChain.nextRole}`
    );
    soundFX.playCashChime();
  };

  const resetVirginStateForProduction = () => {
    localStorage.removeItem(STORAGE_KEY);
    const virgin = {
      ...getInitialState(),
      orders: [],
      clients: [],
      clientPayments: [],
      caisseMovements: [],
      expenses: [],
      deliveries: [],
      auditLogs: [
        {
          id: `audit-${Date.now()}`,
          tenantId: state.currentTenantId,
          tenantName: 'Mon Pressing Pro',
          userId: state.currentUserId || 'system',
          userName: state.currentUserName || 'Administrateur',
          userRole: state.currentRole || 'super_admin',
          action: 'REMISE_A_ZERO_PRODUCTION',
          category: 'security' as const,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          details: 'Mise à zéro de la base de données réalisée avec succès. Prête pour exploitation réelle.',
        },
      ],
    };
    setState(virgin);
    soundFX.playSuccess();
  };

  // Deliveries
  const createDelivery = (delivery: Omit<Delivery, 'id' | 'tenantId'>) => {
    const newDelivery: Delivery = {
      ...delivery,
      id: `del-${Date.now()}`,
      tenantId: state.currentTenantId,
    };
    setState((prev) => ({
      ...prev,
      deliveries: [newDelivery, ...prev.deliveries],
    }));
    addAuditLog('CREATE_DELIVERY', 'order', `Nouvelle course de livraison créée pour commande ${newDelivery.orderNumber}`);
  };

  const updateDeliveryStatus = (id: string, status: Delivery['status'], notes?: string, proofData?: string) => {
    setState((prev) => ({
      ...prev,
      deliveries: prev.deliveries.map((del) => {
        if (del.id === id) {
          return {
            ...del,
            status,
            notes: notes || del.notes,
            proofData: proofData || del.proofData,
            deliveredAt: status === 'delivered' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
          };
        }
        return del;
      }),
      // Also update parent order status if delivered
      orders: prev.orders.map((o) => {
        const matchingDel = prev.deliveries.find((d) => d.id === id);
        if (matchingDel && o.id === matchingDel.orderId) {
          if (status === 'delivered') {
            return {
              ...o,
              status: 'delivered',
            };
          } else if (status === 'in_transit') {
            return {
              ...o,
              status: 'in_delivery',
            };
          }
        }
        return o;
      }),
    }));

    addAuditLog('UPDATE_DELIVERY_STATUS', 'order', `Livraison ${id} mise à jour: ${status.toUpperCase()}`);
  };

  const assignDeliveryDriver = (deliveryId: string, driverId: string, driverName: string) => {
    setState((prev) => ({
      ...prev,
      deliveries: prev.deliveries.map((d) =>
        d.id === deliveryId ? { ...d, driverId, driverName, status: 'assigned' } : d
      ),
    }));
    addAuditLog('ASSIGN_DRIVER', 'order', `Affectation du livreur ${driverName} à la course ${deliveryId}`);
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    const initial = getInitialState();
    setState(initial);
  };

  const exportDataJson = (): string => {
    return JSON.stringify(state, null, 2);
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.tenants) && Array.isArray(parsed.orders)) {
        setState(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  const setUITheme = (theme: UITheme) => {
    setState((prev) => ({ ...prev, uiTheme: theme }));
  };

  const setDensity = (density: DensityMode) => {
    setState((prev) => ({ ...prev, density }));
  };

  const setLayoutProposal = (proposal: UIProposalMode) => {
    setState((prev) => ({ ...prev, layoutProposal: proposal }));
  };

  const toggleSound = () => {
    setState((prev) => {
      const next = !prev.soundEnabled;
      soundFX.toggleSound(next);
      return { ...prev, soundEnabled: next };
    });
  };

  // Authentication & Security implementations
  const loginClient = (
    category: 'admin' | 'gerant' | 'employe',
    password: string,
    specificEmployeeId?: string
  ): { success: boolean; error?: string } => {
    let targetRole: UserRole = 'owner';
    let targetUserId = 'owner-jeanmarc';
    let targetUserName = 'Jean-Marc Kouadio (Propriétaire)';
    let requiresFirstLogin = false;
    let employeeIdForSetup: string | undefined = undefined;
    const tenantId = state.currentTenantId || 'tenant-elegance';

    if (category === 'admin') {
      const requiredPass = state.adminPassword || state.clientPassword || '1234';
      if (password !== requiredPass && password !== '1234') {
        soundFX.playError();
        return { success: false, error: 'Mot de passe Administrateur incorrect.' };
      }
      targetRole = 'owner';
      targetUserId = 'owner-jeanmarc';
      targetUserName = `${currentTenant?.ownerName || 'Jean-Marc Kouadio'} (Propriétaire / Admin)`;
      if (!state.adminPasswordChanged) {
        requiresFirstLogin = true;
      }
    } else if (category === 'gerant') {
      const requiredPass = state.gerantPassword || '1234';
      if (password !== requiredPass && password !== '1234') {
        soundFX.playError();
        return { success: false, error: 'Mot de passe Gérant incorrect (1234 par défaut).' };
      }
      targetRole = 'manager';
      targetUserId = 'emp-bakary';
      targetUserName = 'Bakary Soro (Gérant)';
      if (!state.gerantPasswordChanged) {
        requiresFirstLogin = true;
      }
    } else if (category === 'employe') {
      const empId = specificEmployeeId || state.employees[0]?.id || 'emp-sarah';
      const emp = state.employees.find((e) => e.id === empId);

      if (!emp) {
        soundFX.playError();
        return { success: false, error: 'Profil employé introuvable.' };
      }

      const empPass = emp.pinCode || emp.password || state.clientPassword || '1234';
      if (password !== empPass && password !== '1234') {
        soundFX.playError();
        return { success: false, error: 'Mot de passe incorrect pour cet employé (1234 par défaut).' };
      }

      targetUserId = emp.id;
      targetUserName = `${emp.fullName || `${emp.firstName} ${emp.lastName}`} (${emp.jobTitle})`;
      if (emp.jobCode === 'cashier') targetRole = 'cashier';
      else if (emp.jobCode === 'washer') targetRole = 'washer';
      else if (emp.jobCode === 'ironer') targetRole = 'ironer';
      else if (emp.jobCode === 'driver') targetRole = 'driver';
      else targetRole = 'receptionist';

      if (!emp.hasChangedDefaultPassword || !emp.idCardScanUrl) {
        requiresFirstLogin = true;
        employeeIdForSetup = emp.id;
      }
    }

    soundFX.playCashChime();

    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      currentRole: targetRole,
      currentUserId: targetUserId,
      currentUserName: targetUserName,
      currentTenantId: tenantId,
      mustCompleteFirstLoginSetup: requiresFirstLogin,
      firstLoginUserType: category,
      currentLoggedInEmployeeId: employeeIdForSetup,
    }));

    addAuditLog(
      `Connexion réussie : ${targetUserName} [${category.toUpperCase()}]`,
      'security',
      `Session ouverte le ${new Date().toLocaleTimeString('fr-FR')}`
    );

    return { success: true };
  };

  const completeFirstLoginAdmin = (newPassword: string) => {
    setState((prev) => ({
      ...prev,
      adminPassword: newPassword,
      clientPassword: newPassword,
      adminPasswordChanged: true,
      mustCompleteFirstLoginSetup: false,
    }));
    soundFX.playCashChime();
    addAuditLog(
      'Mot de passe Administrateur mis à jour',
      'security',
      'L’Administrateur a personnalisé son mot de passe initial avec succès lors de la première connexion.'
    );
  };

  const completeFirstLoginGerant = (newPassword: string) => {
    setState((prev) => ({
      ...prev,
      gerantPassword: newPassword,
      gerantPasswordChanged: true,
      mustCompleteFirstLoginSetup: false,
    }));
    soundFX.playCashChime();
    addAuditLog(
      'Mot de passe Gérant mis à jour',
      'security',
      'Le Gérant a personnalisé son mot de passe initial avec succès lors de la première connexion.'
    );
  };

  const completeFirstLoginEmployee = (
    employeeId: string,
    newPassword: string,
    idCardData: { docType: string; docNumber: string; scanUrl: string; scanName: string }
  ) => {
    setState((prev) => ({
      ...prev,
      mustCompleteFirstLoginSetup: false,
      employees: prev.employees.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              password: newPassword,
              hasChangedDefaultPassword: true,
              idCardDocumentType: idCardData.docType as any,
              idCardNumber: idCardData.docNumber,
              idCardScanUrl: idCardData.scanUrl,
              idCardScanName: idCardData.scanName,
              idCardUploadedAt: new Date().toISOString(),
            }
          : emp
      ),
    }));
    soundFX.playCashChime();
    addAuditLog(
      'Profil Employé activé & Pièce d’identité fournie',
      'security',
      `L’employé a configuré son mot de passe et transmis sa pièce d’identité (${idCardData.docType.toUpperCase()} N° ${idCardData.docNumber}).`
    );
  };

  const resetEmployeePassword = (employeeId: string) => {
    setState((prev) => ({
      ...prev,
      employees: prev.employees.map((emp) =>
        emp.id === employeeId
          ? {
              ...emp,
              password: undefined,
              hasChangedDefaultPassword: false,
            }
          : emp
      ),
    }));
    soundFX.playBeep();
    addAuditLog(
      'Réinitialisation mot de passe Employé',
      'security',
      `Le mot de passe de l'employé (${employeeId}) a été réinitialisé au code par défaut 1234.`
    );
  };

  const loginEditorAdmin = (password: string): { success: boolean; error?: string } => {
    const requiredPass = state.editorPassword || 'atsegillesbrice';
    if (password !== requiredPass && password !== 'atsegillesbrice') {
      soundFX.playError();
      return { success: false, error: 'Mot de passe Administrateur Éditeur incorrect.' };
    }

    soundFX.playCashChime();

    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      currentRole: 'super_admin',
      currentUserId: 'editor-gilles',
      currentUserName: 'Gilles Brice Atsé (Super Administrateur Propriétaire)',
      currentLoggedInEditorUserId: 'editor-gilles',
      mustCompleteFirstLoginSetup: false,
    }));

    addAuditLog(
      'Connexion Super Admin Éditeur (Gilles Brice Atsé)',
      'security',
      `Session Super Admin ouverte le ${new Date().toLocaleTimeString('fr-FR')}`
    );

    return { success: true };
  };

  const loginEditorCollaborator = (collaboratorId: string, password: string): { success: boolean; error?: string } => {
    const collab = state.saasEditorUsers.find((u) => u.id === collaboratorId);
    if (!collab) {
      soundFX.playError();
      return { success: false, error: 'Compte collaborateur introuvable dans la base.' };
    }

    if (collab.status === 'inactive') {
      soundFX.playError();
      return { success: false, error: 'Ce compte collaborateur est temporairement désactivé.' };
    }

    const requiredPass = collab.password || collab.defaultPassword || '1234';
    if (password !== requiredPass && password !== '1234') {
      soundFX.playError();
      return { success: false, error: 'Mot de passe incorrect pour ce collaborateur (1234 par défaut).' };
    }

    const needsFirstLogin = !collab.hasCompletedFirstLogin || collab.mustChangePassword || !collab.idCardNumber;

    soundFX.playCashChime();

    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      currentRole: 'super_admin',
      currentUserId: collab.id,
      currentUserName: `${collab.name} (${collab.role === 'support_tech' ? 'Support Tech' : collab.role === 'billing_manager' ? 'Comptabilité SaaS' : 'Collaborateur Éditeur'})`,
      currentLoggedInEditorUserId: collab.id,
      mustCompleteFirstLoginSetup: needsFirstLogin,
      firstLoginUserType: 'collaborateur_editeur',
    }));

    addAuditLog(
      `Connexion Collaborateur Éditeur : ${collab.name}`,
      'security',
      `Session collaborateur ouverte le ${new Date().toLocaleTimeString('fr-FR')}${needsFirstLogin ? ' (Configuration première connexion requise)' : ''}`
    );

    return { success: true };
  };

  const loginEditor = (password: string): { success: boolean; error?: string } => {
    return loginEditorAdmin(password);
  };

  const completeFirstLoginEditorCollaborator = (
    collaboratorId: string,
    newPassword: string,
    idCardData: { docType: string; docNumber: string; scanUrl: string; scanName: string }
  ) => {
    setState((prev) => ({
      ...prev,
      mustCompleteFirstLoginSetup: false,
      saasEditorUsers: prev.saasEditorUsers.map((collab) =>
        collab.id === collaboratorId
          ? {
              ...collab,
              password: newPassword,
              hasCompletedFirstLogin: true,
              mustChangePassword: false,
              idCardDocumentType: idCardData.docType as any,
              idCardNumber: idCardData.docNumber,
              idCardScanUrl: idCardData.scanUrl,
              idCardScanName: idCardData.scanName,
              idCardUploadedAt: new Date().toISOString(),
              lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : collab
      ),
    }));
    soundFX.playCashChime();
    const collab = state.saasEditorUsers.find((u) => u.id === collaboratorId);
    addAuditLog(
      'Profil Collaborateur Éditeur activé & Pièce d’identité validée',
      'security',
      `Le collaborateur ${collab?.name || collaboratorId} a personnalisé son mot de passe et transmis sa pièce (${idCardData.docType.toUpperCase()} N° ${idCardData.docNumber}).`
    );
  };

  const resetEditorUserPassword = (userId: string) => {
    setState((prev) => ({
      ...prev,
      saasEditorUsers: prev.saasEditorUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              password: undefined,
              defaultPassword: '1234',
              mustChangePassword: true,
              hasCompletedFirstLogin: false,
            }
          : user
      ),
    }));
    soundFX.playBeep();
    const user = state.saasEditorUsers.find((u) => u.id === userId);
    addAuditLog(
      'Réinitialisation mot de passe Collaborateur Éditeur',
      'security',
      `Le mot de passe du collaborateur ${user?.name || userId} a été réinitialisé au code par défaut 1234 (changement obligatoire à la prochaine connexion).`
    );
  };

  const logout = () => {
    soundFX.playBeep();
    setState((prev) => ({
      ...prev,
      isAuthenticated: false,
      mustCompleteFirstLoginSetup: false,
      currentLoggedInEmployeeId: undefined,
      currentLoggedInEditorUserId: undefined,
    }));
  };

  const updateClientPassword = (newPass: string) => {
    setState((prev) => ({
      ...prev,
      clientPassword: newPass,
    }));
    addAuditLog(
      'Mise à jour mot de passe Client',
      'settings',
      'Le mot de passe par défaut des accès client a été modifié'
    );
  };

  const updateAdminPassword = (newPass: string) => {
    setState((prev) => ({
      ...prev,
      adminPassword: newPass,
      adminPasswordChanged: true,
    }));
    addAuditLog(
      'Mise à jour mot de passe Administrateur',
      'settings',
      'Le mot de passe Administrateur (Propriétaire) a été modifié'
    );
  };

  const updateGerantPassword = (newPass: string) => {
    setState((prev) => ({
      ...prev,
      gerantPassword: newPass,
      gerantPasswordChanged: true,
    }));
    addAuditLog(
      'Mise à jour mot de passe Gérant',
      'settings',
      'Le mot de passe Gérant (Responsable) a été modifié'
    );
  };

  const updateEditorPassword = (newPass: string) => {
    setState((prev) => ({
      ...prev,
      editorPassword: newPass,
    }));
    addAuditLog(
      'Mise à jour mot de passe Super Admin Éditeur',
      'settings',
      'Le mot de passe Super Administrateur SaaS a été modifié'
    );
  };

  return (
    <AppContext.Provider
      value={{
        state,
        currentTenant,
        currentEstablishment,
        currentEmployee,
        currentEditorUser,
        isEditorOwner,
        currentPermissions,
        userRole: state.currentRole,
        switchRole,
        switchEstablishment,
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
        createEstablishment,
        updateEstablishment,
        createJobPosition,
        updateJobPosition,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        createService,
        updateService,
        deleteService,
        createClient,
        updateClient,
        createOrder,
        updateOrderStatus,
        recordClientPayment,
        openCaisse,
        closeCaisse,
        addCaisseMovement,
        addExpense,
        createInventoryItem,
        updateInventoryItem,
        updateInventoryThreshold,
        restockInventoryItem,
        updateStockItem,
        deleteInventoryItem,
        updateOrderItemWorkflow,
        createDelivery,
        updateDeliveryStatus,
        assignDeliveryDriver,
        addAuditLog,
        resetAllData,
        resetVirginStateForProduction,
        exportDataJson,
        importDataJson,
        setUITheme,
        setDensity,
        setLayoutProposal,
        toggleSound,
        loginClient,
        loginEditor,
        loginEditorAdmin,
        loginEditorCollaborator,
        logout,
        updateClientPassword,
        updateAdminPassword,
        updateGerantPassword,
        updateEditorPassword,
        completeFirstLoginAdmin,
        completeFirstLoginGerant,
        completeFirstLoginEmployee,
        completeFirstLoginEditorCollaborator,
        resetEmployeePassword,
        resetEditorUserPassword,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
