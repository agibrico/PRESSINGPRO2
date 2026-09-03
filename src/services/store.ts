import QRCode from 'qrcode';
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
  SaaSEditorUser,
  SaaSGlobalSettings,
  SaaSInvoice,
  SaaSPlan,
  SaaSSubscriptionPayment,
  ServiceItem,
  Tenant,
  UserRole,
  UITheme,
  DensityMode,
  UIProposalMode,
} from '../types';
import {
  DEFAULT_PERMISSIONS_ALL,
  DEFAULT_PERMISSIONS_CASHIER,
  DEFAULT_PERMISSIONS_DRIVER,
  DEFAULT_PERMISSIONS_IRONER,
  DEFAULT_PERMISSIONS_MANAGER,
  DEFAULT_PERMISSIONS_RECEPTIONIST,
  DEFAULT_PERMISSIONS_WASHER,
  INITIAL_AUDIT_LOGS,
  INITIAL_BROADCAST_NOTIFICATIONS,
  INITIAL_CAISSES,
  INITIAL_CLIENT_PAYMENTS,
  INITIAL_CLIENTS,
  INITIAL_DELIVERIES,
  INITIAL_ESTABLISHMENTS,
  INITIAL_EXPENSES,
  INITIAL_INVENTORY,
  INITIAL_ORDERS,
  INITIAL_SAAS_EDITOR_USERS,
  INITIAL_SAAS_GLOBAL_SETTINGS,
  INITIAL_SAAS_INVOICES,
  INITIAL_SAAS_PAYMENTS,
  INITIAL_SAAS_PLANS,
  INITIAL_SERVICES,
  INITIAL_TENANTS,
  PREDEFINED_JOBS_CATALOG,
} from './defaultData';

export const STORAGE_KEY = 'mon_pressing_pro_saas_v1_state';

export interface AppState {
  isAuthenticated: boolean;
  clientPassword?: string;
  editorPassword?: string;
  adminPassword?: string;
  adminPasswordChanged?: boolean;
  gerantPassword?: string;
  gerantPasswordChanged?: boolean;
  currentLoggedInEmployeeId?: string;
  currentLoggedInEditorUserId?: string;
  mustCompleteFirstLoginSetup?: boolean;
  firstLoginUserType?: 'admin' | 'gerant' | 'employe' | 'collaborateur_editeur';
  currentRole: UserRole;
  currentTenantId: string;
  currentEstablishmentId: string; // 'all' or specific ID
  currentUserId: string;
  currentUserName: string;
  uiTheme: UITheme;
  density: DensityMode;
  layoutProposal: UIProposalMode;
  soundEnabled: boolean;

  tenants: Tenant[];
  saasPlans: SaaSPlan[];
  saasPayments: SaaSSubscriptionPayment[];
  saasInvoices: SaaSInvoice[];
  broadcastNotifications: BroadcastNotification[];
  saasEditorUsers: SaaSEditorUser[];
  saasGlobalSettings: SaaSGlobalSettings;
  establishments: Establishment[];
  jobPositions: JobPosition[];
  employees: Employee[];
  services: ServiceItem[];
  clients: Client[];
  orders: Order[];
  clientPayments: ClientPayment[];
  caisses: Caisse[];
  caisseMovements: CaisseMovement[];
  expenses: Expense[];
  inventory: InventoryItem[];
  deliveries: Delivery[];
  auditLogs: AuditLog[];
}

export const INITIAL_JOB_POSITIONS_ELEGANCE: JobPosition[] = PREDEFINED_JOBS_CATALOG.map((job, idx) => ({
  ...job,
  id: `job-${job.code.toLowerCase()}-${idx}`,
  tenantId: 'tenant-elegance',
}));

export const INITIAL_EMPLOYEES_ELEGANCE: Employee[] = [
  {
    id: 'emp-bakary',
    tenantId: 'tenant-elegance',
    establishmentId: 'est-angre',
    matricule: 'EMP-2026-001',
    firstName: 'Bakary',
    lastName: 'Soro',
    fullName: 'Bakary Soro',
    role: 'Gérant de Pressing',
    phone: '+225 07 01 23 45 67',
    whatsapp: '+225 07 01 23 45 67',
    email: 'bakary.soro@pressingelegance.ci',
    address: 'Angré Pétro Ivoire',
    jobPositionId: INITIAL_JOB_POSITIONS_ELEGANCE[0].id,
    jobTitle: 'Gérant de Pressing',
    jobCode: 'manager',
    department: 'Direction & Exploitation',
    hireDate: '2026-01-10',
    contractType: 'CDI',
    salary: 250000,
    commissionRate: 3,
    workingDays: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    workingHours: '07h30 - 19h00',
    status: 'active',
    loginUsername: 'bakary.gerant',
    pinCode: '1234',
    hasChangedDefaultPassword: false,
    idCardDocumentType: 'cni',
    idCardNumber: 'CI0029481928',
    customPermissions: DEFAULT_PERMISSIONS_MANAGER,
  },
  {
    id: 'emp-sarah',
    tenantId: 'tenant-elegance',
    establishmentId: 'est-angre',
    matricule: 'EMP-2026-002',
    firstName: 'Sarah',
    lastName: 'Konan',
    fullName: 'Sarah Konan',
    role: 'Réceptionniste / Agent d’Accueil',
    phone: '+225 05 12 34 56 78',
    whatsapp: '+225 05 12 34 56 78',
    email: 'sarah.k@pressingelegance.ci',
    address: 'Cocody Riviera 2',
    jobPositionId: INITIAL_JOB_POSITIONS_ELEGANCE[2].id,
    jobTitle: 'Réceptionniste / Agent d’Accueil',
    jobCode: 'receptionist',
    department: 'Accueil & Caisse',
    hireDate: '2026-01-15',
    contractType: 'CDI',
    salary: 120000,
    commissionRate: 1.5,
    workingDays: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    workingHours: '07h30 - 19h30',
    status: 'active',
    loginUsername: 'sarah.reception',
    pinCode: '1234',
    hasChangedDefaultPassword: false,
    customPermissions: DEFAULT_PERMISSIONS_RECEPTIONIST,
  },
  {
    id: 'emp-marcelle',
    tenantId: 'tenant-elegance',
    establishmentId: 'est-marcory',
    matricule: 'EMP-2026-003',
    firstName: 'Marcelle',
    lastName: 'N’Guessan',
    fullName: 'Marcelle N’Guessan',
    role: 'Caissière & Accueil Marcory',
    phone: '+225 07 88 77 66 55',
    whatsapp: '+225 07 88 77 66 55',
    email: 'marcelle.n@pressingelegance.ci',
    address: 'Koumassi Remblais',
    jobPositionId: INITIAL_JOB_POSITIONS_ELEGANCE[3].id,
    jobTitle: 'Caissière & Accueil Marcory',
    jobCode: 'cashier',
    department: 'Accueil & Caisse',
    hireDate: '2026-02-01',
    contractType: 'CDI',
    salary: 130000,
    workingDays: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    workingHours: '07h30 - 19h30',
    status: 'active',
    loginUsername: 'marcelle.caisse',
    pinCode: '1234',
    hasChangedDefaultPassword: false,
    customPermissions: DEFAULT_PERMISSIONS_CASHIER,
  },
  {
    id: 'emp-ibrahim',
    tenantId: 'tenant-elegance',
    establishmentId: 'est-angre',
    matricule: 'EMP-2026-004',
    firstName: 'Ibrahim',
    lastName: 'Diarra',
    fullName: 'Ibrahim Diarra',
    role: 'Laveur & Nettoyeur Textile',
    phone: '+225 01 44 33 22 11',
    whatsapp: '+225 01 44 33 22 11',
    email: 'ibrahim.d@pressingelegance.ci',
    address: 'Abobo Baoulé',
    jobPositionId: INITIAL_JOB_POSITIONS_ELEGANCE[5].id,
    jobTitle: 'Laveur & Nettoyeur Textile',
    jobCode: 'washer',
    department: 'Atelier & Blanchisserie',
    hireDate: '2026-01-10',
    contractType: 'CDI',
    salary: 110000,
    workingDays: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    workingHours: '07h30 - 17h30',
    status: 'active',
    loginUsername: 'ibrahim.lavage',
    pinCode: '1234',
    hasChangedDefaultPassword: false,
    customPermissions: DEFAULT_PERMISSIONS_WASHER,
  },
  {
    id: 'emp-abdoulaye',
    tenantId: 'tenant-elegance',
    establishmentId: 'est-angre',
    matricule: 'EMP-2026-005',
    firstName: 'Abdoulaye',
    lastName: 'Sanogo',
    fullName: 'Abdoulaye Sanogo',
    role: 'Maître Repasseur & Spécialiste Bazin',
    phone: '+225 05 99 88 77 66',
    whatsapp: '+225 05 99 88 77 66',
    email: 'abdoulaye.s@pressingelegance.ci',
    address: 'Adjamé 220 Logements',
    jobPositionId: INITIAL_JOB_POSITIONS_ELEGANCE[8].id,
    jobTitle: 'Maître Repasseur & Spécialiste Bazin',
    jobCode: 'ironer',
    department: 'Finition & Repassage',
    hireDate: '2026-01-10',
    contractType: 'CDI',
    salary: 135000,
    commissionRate: 2,
    workingDays: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    workingHours: '08h00 - 18h00',
    status: 'active',
    loginUsername: 'abdoulaye.fer',
    pinCode: '1234',
    hasChangedDefaultPassword: false,
    customPermissions: DEFAULT_PERMISSIONS_IRONER,
  },
  {
    id: 'emp-kouame',
    tenantId: 'tenant-elegance',
    establishmentId: 'est-angre',
    matricule: 'EMP-2026-006',
    firstName: 'Eric',
    lastName: 'Kouamé',
    fullName: 'Eric Kouamé',
    role: 'Chauffeur-Livreur Moto',
    phone: '+225 07 66 55 44 33',
    whatsapp: '+225 07 66 55 44 33',
    email: 'eric.livreur@pressingelegance.ci',
    address: 'Cocody Blockhaus',
    jobPositionId: INITIAL_JOB_POSITIONS_ELEGANCE[11].id,
    jobTitle: 'Chauffeur-Livreur Moto',
    jobCode: 'driver',
    department: 'Logistique & Livraison',
    hireDate: '2026-02-15',
    contractType: 'CDI',
    salary: 110000,
    commissionRate: 5,
    workingDays: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    workingHours: '08h00 - 19h00',
    status: 'active',
    loginUsername: 'eric.livraison',
    pinCode: '1234',
    hasChangedDefaultPassword: false,
    customPermissions: DEFAULT_PERMISSIONS_DRIVER,
  },
];

export function getInitialState(): AppState {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          isAuthenticated: parsed.isAuthenticated !== undefined ? parsed.isAuthenticated : false,
          clientPassword: parsed.clientPassword || '1234',
          editorPassword: parsed.editorPassword || 'agibrico1',
          adminPassword: parsed.adminPassword || '1234',
          adminPasswordChanged: parsed.adminPasswordChanged || false,
          gerantPassword: parsed.gerantPassword || '1234',
          gerantPasswordChanged: parsed.gerantPasswordChanged || false,
          mustCompleteFirstLoginSetup: parsed.mustCompleteFirstLoginSetup || false,
          uiTheme: parsed.uiTheme || 'amber',
          density: parsed.density || 'comfortable',
          layoutProposal: parsed.layoutProposal || 'pos_counter',
          soundEnabled: parsed.soundEnabled !== undefined ? parsed.soundEnabled : true,
          saasInvoices: Array.isArray(parsed.saasInvoices) && parsed.saasInvoices.length > 0 ? parsed.saasInvoices : INITIAL_SAAS_INVOICES,
          broadcastNotifications: Array.isArray(parsed.broadcastNotifications) && parsed.broadcastNotifications.length > 0 ? parsed.broadcastNotifications : INITIAL_BROADCAST_NOTIFICATIONS,
          saasEditorUsers: Array.isArray(parsed.saasEditorUsers) && parsed.saasEditorUsers.length > 0 ? parsed.saasEditorUsers : INITIAL_SAAS_EDITOR_USERS,
          saasGlobalSettings: parsed.saasGlobalSettings || INITIAL_SAAS_GLOBAL_SETTINGS,
        };
      }
    } catch (e) {
      console.warn('Failed to load local storage state:', e);
    }
  }

  return {
    isAuthenticated: false, // At startup, shows the 3 buttons install/login gate screen!
    clientPassword: '1234',
    editorPassword: 'agibrico1',
    adminPassword: '1234',
    adminPasswordChanged: false,
    gerantPassword: '1234',
    gerantPasswordChanged: false,
    mustCompleteFirstLoginSetup: false,
    currentRole: 'owner', // Default role for demo is Owner of Pressing Élégance
    currentTenantId: 'tenant-elegance',
    currentEstablishmentId: 'all',
    currentUserId: 'owner-jeanmarc',
    currentUserName: 'Jean-Marc Kouadio (Propriétaire)',
    uiTheme: 'amber',
    density: 'comfortable',
    layoutProposal: 'pos_counter',
    soundEnabled: true,

    tenants: INITIAL_TENANTS,
    saasPlans: INITIAL_SAAS_PLANS,
    saasPayments: INITIAL_SAAS_PAYMENTS,
    saasInvoices: INITIAL_SAAS_INVOICES,
    broadcastNotifications: INITIAL_BROADCAST_NOTIFICATIONS,
    saasEditorUsers: INITIAL_SAAS_EDITOR_USERS,
    saasGlobalSettings: INITIAL_SAAS_GLOBAL_SETTINGS,
    establishments: INITIAL_ESTABLISHMENTS,
    jobPositions: INITIAL_JOB_POSITIONS_ELEGANCE,
    employees: INITIAL_EMPLOYEES_ELEGANCE,
    services: INITIAL_SERVICES,
    clients: INITIAL_CLIENTS,
    orders: INITIAL_ORDERS,
    clientPayments: INITIAL_CLIENT_PAYMENTS,
    caisses: INITIAL_CAISSES,
    caisseMovements: [],
    expenses: INITIAL_EXPENSES,
    inventory: INITIAL_INVENTORY,
    deliveries: INITIAL_DELIVERIES,
    auditLogs: INITIAL_AUDIT_LOGS,
  };
}

export function saveStateToStorage(state: AppState) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }
}

// Format FCFA currency cleanly (e.g. "15 000 FCFA")
export function formatFCFA(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

// Generate real Data URL for QR Code
export async function generateQrDataUrl(dataString: string): Promise<string> {
  try {
    return await QRCode.toDataURL(dataString, {
      margin: 1,
      width: 180,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('QR generation error:', err);
    return '';
  }
}

// Generate formatted WhatsApp message text
export function createWhatsAppOrderReadyText(order: Order, tenant: Tenant): string {
  return encodeURIComponent(
    `Bonjour ${order.clientName},\n\n` +
    `Votre linge confié à *${tenant.companyName}* (Réf: *${order.orderNumber}*) est fin prêt pour le retrait ou la livraison !\n\n` +
    `📦 Articles: ${order.itemCount} pièce(s)\n` +
    `💰 Montant total: ${formatFCFA(order.totalAmount)}\n` +
    `💳 Reste à payer: ${formatFCFA(order.remainingBalance)}\n\n` +
    `Vous pouvez suivre votre commande en ligne ici: ${window.location.origin}?track=${order.orderNumber}\n\n` +
    `Merci pour votre fidélité !\n` +
    `📞 Service client: ${tenant.ownerPhone}`
  );
}

// Generate payment confirmation SMS/WhatsApp template
export function createWhatsAppPaymentText(payment: ClientPayment, tenant: Tenant): string {
  return encodeURIComponent(
    `Bonjour ${payment.clientName},\n\n` +
    `Nous vous confirmons la bonne réception de votre règlement de *${formatFCFA(payment.amount)}* pour votre commande *${payment.orderNumber}* chez *${tenant.companyName}*.\n\n` +
    `Mode: ${payment.paymentMethod.toUpperCase()}\n` +
    `Réf: ${payment.transactionReference}\n` +
    `Reçu N°: ${payment.receiptNumber}\n\n` +
    `Merci de votre confiance !`
  );
}

// Status labels & badges
export const ORDER_STATUS_CONFIG: Record<
  OrderWorkflowStatus,
  { label: string; bg: string; text: string; border: string; step: number; roleName: string }
> = {
  deposited: { label: 'Déposée', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', step: 1, roleName: 'Réceptionniste / Agent d’Accueil' },
  sorting: { label: 'Tri & Marquage', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', step: 2, roleName: 'Agent de Tri & Marquage' },
  washing: { label: 'En Lavage', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', step: 3, roleName: 'Laveur & Détacheur Textile' },
  drying: { label: 'En Séchage', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', step: 4, roleName: 'Opérateur Séchage' },
  ironing: { label: 'En Repassage', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', step: 5, roleName: 'Repasseur / Presse Professionnelle' },
  quality_check: { label: 'Contrôle Qualité', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', step: 6, roleName: 'Responsable Contrôle Qualité' },
  ready: { label: 'Prête en Boutique', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300', step: 7, roleName: 'Agent de Penderie & Emballage' },
  in_delivery: { label: 'En Livraison', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', step: 8, roleName: 'Chauffeur Livreur' },
  delivered: { label: 'Livrée / Retirée', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', step: 9, roleName: 'Caissier Réceptionniste' },
  archived: { label: 'Archivée', bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', step: 10, roleName: 'Direction' },
};

export const WORKFLOW_PROGRESSION: {
  current: OrderWorkflowStatus;
  next: OrderWorkflowStatus | null;
  nextRole: string;
  actionLabel: string;
}[] = [
  { current: 'deposited', next: 'sorting', nextRole: 'Agent de Tri & Marquage', actionLabel: 'Valider le Tri & Marquage' },
  { current: 'sorting', next: 'washing', nextRole: 'Laveur & Détacheur Textile (Yao Koffi)', actionLabel: 'Lancer le Lavage & Détachage' },
  { current: 'washing', next: 'drying', nextRole: 'Opérateur Séchoir', actionLabel: 'Valider le Lavage → Passer au Séchage' },
  { current: 'drying', next: 'ironing', nextRole: 'Repasseur / Presse (Aminata Diallo)', actionLabel: 'Valider Séchage → Passer au Repassage' },
  { current: 'ironing', next: 'quality_check', nextRole: 'Responsable Contrôle Qualité', actionLabel: 'Valider Repassage → Contrôle Qualité' },
  { current: 'quality_check', next: 'ready', nextRole: 'Agent d’Accueil & Penderie (Sarah Konan)', actionLabel: 'Valider Qualité → Prêt en Penderie' },
  { current: 'ready', next: 'in_delivery', nextRole: 'Chauffeur Livreur (Mamadou Doumbia)', actionLabel: 'Confier au Livreur' },
  { current: 'in_delivery', next: 'delivered', nextRole: 'Réceptionniste / Caisse', actionLabel: 'Confirmer la Livraison / Retrait Client' },
  { current: 'delivered', next: null, nextRole: 'Terminé', actionLabel: 'Commande Clôturée' },
];

export function getNextWorkflowStepInfo(status: OrderWorkflowStatus) {
  const match = WORKFLOW_PROGRESSION.find((w) => w.current === status);
  if (!match || !match.next) return null;
  return {
    nextStatus: match.next,
    nextRole: match.nextRole,
    actionLabel: match.actionLabel,
  };
}

export function getCleanVirginState(): AppState {
  const base = getInitialState();
  return {
    ...base,
    orders: [],
    clients: [],
    clientPayments: [],
    caisseMovements: [],
    expenses: [],
    deliveries: [],
    auditLogs: [
      {
        id: `audit-${Date.now()}`,
        tenantId: base.currentTenantId,
        tenantName: 'Mon Pressing Pro',
        userId: 'system',
        userName: 'Système d’Installation',
        userRole: 'super_admin',
        action: 'INITIALISATION_VIERGE',
        category: 'security',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        details: 'Initialisation de la base de données à zéro pour mise en production propre.',
      },
    ],
  };
}

// Payment methods config with logos/color badges
export const PAYMENT_METHOD_CONFIG: Record<
  PaymentMethod,
  { label: string; color: string; badge: string; iconName: string; provider: string }
> = {
  wave: { label: 'Wave Côte d’Ivoire', color: 'bg-sky-500 text-white', badge: 'bg-sky-50 text-sky-700 border-sky-200', iconName: 'Wave', provider: 'Wave Digital Finance CI' },
  orange_money: { label: 'Orange Money CI', color: 'bg-orange-500 text-white', badge: 'bg-orange-50 text-orange-700 border-orange-200', iconName: 'Orange', provider: 'Orange Côte d’Ivoire' },
  mtn_money: { label: 'MTN Mobile Money (MoMo)', color: 'bg-yellow-400 text-slate-900', badge: 'bg-yellow-50 text-yellow-800 border-yellow-300', iconName: 'MTN', provider: 'MTN Côte d’Ivoire' },
  moov_money: { label: 'Moov Money CI', color: 'bg-blue-600 text-white', badge: 'bg-blue-50 text-blue-700 border-blue-200', iconName: 'Moov', provider: 'Moov Africa CI' },
  cash: { label: 'Espèces (Cash FCFA)', color: 'bg-emerald-600 text-white', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', iconName: 'Cash', provider: 'Caisse Pressing' },
  card: { label: 'Carte Bancaire (GIM-UEMOA/Visa)', color: 'bg-slate-700 text-white', badge: 'bg-slate-50 text-slate-700 border-slate-200', iconName: 'Card', provider: 'TPE Bancaire' },
  bank_transfer: { label: 'Virement Bancaire', color: 'bg-slate-600 text-white', badge: 'bg-slate-50 text-slate-700 border-slate-200', iconName: 'Bank', provider: 'Banque' },
};
