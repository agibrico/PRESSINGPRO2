export type UserRole =
  | 'super_admin'
  | 'owner'
  | 'manager'
  | 'receptionist'
  | 'cashier'
  | 'washer'
  | 'ironer'
  | 'quality_controller'
  | 'driver'
  | 'custom';

export type PaymentMethod = 'wave' | 'orange_money' | 'mtn_money' | 'moov_money' | 'cash' | 'card' | 'bank_transfer';

export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled' | 'refunded';

export type OrderWorkflowStatus =
  | 'deposited' // DÉPOSÉE
  | 'sorting' // TRI
  | 'washing' // EN LAVAGE
  | 'drying' // EN SÉCHAGE
  | 'ironing' // EN REPASSAGE
  | 'quality_check' // CONTRÔLE QUALITÉ
  | 'ready' // PRÊTE
  | 'in_delivery' // EN LIVRAISON
  | 'delivered' // LIVRÉE
  | 'archived'; // ARCHIVÉE

export type ContractType = 'CDI' | 'CDD' | 'Journalier' | 'Prestataire' | 'Stage' | 'Temps partiel' | 'Temps plein';

export type RemunerationMode = 'fixed' | 'commission' | 'fixed_commission' | 'daily' | 'hourly';

export type EmployeeStatus = 'active' | 'on_leave' | 'suspended' | 'terminated';

export type SubscriptionPlanTier = 'basic' | 'pro' | 'premium' | 'trial';

export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'suspended' | 'cancelled';

export interface PermissionSet {
  // Clients
  canCreateClient: boolean;
  canEditClient: boolean;
  canDeleteClient: boolean;
  canViewClients: boolean;

  // Commandes / Dépôts
  canCreateOrder: boolean;
  canEditOrder: boolean;
  canDeleteOrder: boolean;
  canViewOrders: boolean;
  canChangeOrderStatus: boolean;
  canApplyDiscount: boolean;
  canDeliverOrder: boolean;

  // Tarifs & Services
  canManagePrices: boolean;
  canManageServices: boolean;

  // Caisse & Finances
  canAcceptPayment: boolean;
  canRefundPayment: boolean;
  canCloseCaisse: boolean;
  canViewCashRegister: boolean;
  canViewRevenue: boolean;
  canViewProfits: boolean;
  canManageExpenses: boolean;

  // Personnel & Emplois
  canManageEmployees: boolean;
  canManageJobs: boolean;
  canViewSalaries: boolean;

  // Stock & Livraisons
  canManageStock: boolean;
  canManageDeliveries: boolean;

  // Multi-agences & Paramètres
  canManageAgencies: boolean;
  canManageSettings: boolean;
  canViewAuditLogs: boolean;
}

export interface JobPosition {
  id: string;
  tenantId: string;
  title: string;
  code: string;
  department: string;
  description: string;
  contractType: ContractType;
  baseSalary: number; // in FCFA
  remunerationMode: RemunerationMode;
  commissionRate?: number; // percentage e.g. 5%
  workingHours: string; // e.g. "08h00 - 18h00"
  workingDays: string[]; // e.g. ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
  permissions: PermissionSet;
  isPredefined: boolean;
  status: 'active' | 'inactive';
}

export interface Employee {
  id: string;
  tenantId: string;
  establishmentId: string; // branch agency
  matricule: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role?: string; // Rôle principal (e.g. Administrateur, Gérant, Caissier, Laveur, Repasseur, Livreur, Réceptionniste)
  photoUrl?: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  jobPositionId: string;
  jobTitle: string;
  jobCode?: string;
  department: string;
  hireDate: string;
  contractType: ContractType;
  salary: number;
  commissionRate?: number;
  workingDays: string[];
  workingHours: string;
  status: EmployeeStatus;
  loginUsername: string;
  pinCode?: string; // 4-digit fast pin for caisse/tablet
  customPermissions?: Partial<PermissionSet>;
  notes?: string;

  // Sécurité 1ère connexion & Vérification d'Identité
  password?: string;
  hasChangedDefaultPassword?: boolean;
  idCardDocumentType?: 'cni' | 'passport' | 'attestation' | 'permis' | 'consulaire';
  idCardNumber?: string;
  idCardScanUrl?: string;
  idCardScanName?: string;
  idCardUploadedAt?: string;
}

export interface Establishment {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  city: string;
  neighborhood: string;
  address: string;
  phone: string;
  whatsapp: string;
  managerName?: string;
  isMain: boolean;
  status: 'active' | 'inactive';
}

export interface ServiceItem {
  id: string;
  tenantId: string;
  name: string;
  category: 'Vêtements quotidiens' | 'Traditionnel / Bazin & Kita' | 'Costumes & Luxe' | 'Maison & Blanchisserie' | 'Chaussures & Maroquinerie' | 'Spécial & Retouches';
  description?: string;
  priceStandard: number; // in FCFA
  priceExpress: number; // in FCFA (+30% - +50%)
  estimatedProcessingHours: number; // e.g. 24h, 48h
  icon?: string;
  status: 'active' | 'inactive';
}

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  color?: string;
  brand?: string;
  issues?: string[]; // e.g. ["Tache tenace", "Bouton manquant", "Brûlure", "Tissu fragile"]
  treatmentNotes?: string;
  tagNumber?: string; // e.g. "TAG-0842-1"
  currentStep?: OrderWorkflowStatus;
  currentResponsibleRole?: string;
  currentResponsibleName?: string;
  nextResponsibleRole?: string;
  nextResponsibleName?: string;
  stepHistory?: {
    step: OrderWorkflowStatus;
    employeeId?: string;
    employeeName: string;
    employeeRole: string;
    timestamp: string;
    notes?: string;
  }[];
}

export interface OrderStatusHistory {
  status: OrderWorkflowStatus;
  timestamp: string;
  updatedByEmployeeId?: string;
  updatedByEmployeeName: string;
  establishmentName?: string;
  notes?: string;
  nextStep?: OrderWorkflowStatus;
  nextResponsibleRole?: string;
  nextResponsibleName?: string;
}

export interface Order {
  id: string;
  tenantId: string;
  establishmentId: string;
  establishmentName: string;
  orderNumber: string; // e.g. "MPP-2026-0842"
  qrCodeUrl?: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientWhatsapp?: string;
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  isExpress: boolean;
  expressFee: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number; // in FCFA
  paidAmount: number;
  remainingBalance: number;
  depositDate: string;
  promisedPickupDate: string;
  promisedPickupTime: string;
  status: OrderWorkflowStatus;
  statusHistory: OrderStatusHistory[];
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  deliveryRequested: boolean;
  deliveryMode?: 'counter' | 'home_delivery'; // 'counter' = Retrait sur place, 'home_delivery' = Livraison
  deliveryLocation?: string; // Localisation exacte pour livraison
  deliveryAddress?: string;
  deliveryStaffId?: string;
  generalNotes?: string;
  rackLocation?: string; // Emplacement penderie / casier (e.g. "P-04")
  createdByEmployeeId: string;
  createdByEmployeeName: string;
  receivedByEmployeeId?: string;
  receivedByEmployeeName?: string;
  currentResponsibleRole?: string;
  currentResponsibleName?: string;
  nextResponsibleRole?: string;
  nextResponsibleName?: string;
}

export interface Client {
  id: string;
  tenantId: string;
  clientCode: string; // e.g. "CLI-0492"
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  outstandingBalance: number;
  loyaltyPoints: number;
  notes?: string;
  preferredContact: 'whatsapp' | 'sms' | 'call';
  receivedByEmployeeName?: string;
  lastPaymentStatus?: 'paid' | 'partial' | 'unpaid';
  deliveryPreference?: 'counter' | 'home_delivery';
  deliveryLocation?: string;
}

export interface ClientPayment {
  id: string;
  tenantId: string;
  establishmentId: string;
  orderId: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  amount: number; // FCFA
  paymentMethod: PaymentMethod;
  transactionReference: string;
  receiptNumber: string; // e.g. "REC-2026-1049"
  recordedByEmployeeId: string;
  recordedByEmployeeName: string;
  date: string;
  time: string;
  status: PaymentStatus;
  isCashVerified: boolean;
  cashValidatedBy?: string;
  notes?: string;
}

export interface CaisseMovement {
  id: string;
  tenantId: string;
  establishmentId: string;
  caisseId: string;
  type: 'in' | 'out' | 'transfer' | 'payment_deposit';
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  recordedByEmployeeId: string;
  recordedByEmployeeName: string;
  orderId?: string;
  receiptNumber?: string;
  reason: string;
  timestamp: string;
}

export interface Caisse {
  id: string;
  tenantId: string;
  establishmentId: string;
  name: string; // e.g. "Caisse Principale", "Caisse Accueil 1"
  initialBalance: number;
  currentCashBalance: number;
  totalInToday: number;
  totalOutToday: number;
  theoreticalBalance: number;
  isOpen: boolean;
  lastOpenedAt?: string;
  lastClosedAt?: string;
  closedByEmployeeName?: string;
  actualCashCounted?: number;
  discrepancy?: number;
}

export interface Expense {
  id: string;
  tenantId: string;
  establishmentId: string;
  establishmentName: string;
  category: 'Produits de lavage / Détergents' | 'Électricité (CIE)' | 'Eau (SODECI)' | 'Carburant / Transport' | 'Entretien & Maintenance Machines' | 'Salaires & Avances' | 'Commissions' | 'Emballages & Cintres' | 'Loyer' | 'Autre dépense';
  title: string;
  amount: number;
  paymentMethod: PaymentMethod;
  beneficiaryOrSupplier: string;
  recordedByEmployeeId: string;
  recordedByEmployeeName: string;
  date: string;
  invoiceNumber?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  tenantId: string;
  establishmentId: string;
  name: string;
  category: 'Lessives & Poudres' | 'Détachants & Solvants' | 'Assouplissants' | 'Emballages & Housses' | 'Cintres métalliques & plastiques' | 'Étiquettes de marquage' | 'Entretien général';
  currentStock: number;
  unit: 'kg' | 'litres' | 'unités' | 'rouleaux' | 'paquets';
  minThreshold: number;
  costPerUnit: number;
  lastRestockedDate: string;
  supplierName?: string;
  status: 'optimal' | 'low' | 'critical';
}

export interface Delivery {
  id: string;
  tenantId: string;
  establishmentId: string;
  orderId: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  deliveryAddress: string;
  neighborhood: string;
  deliveryFee: number;
  amountToCollect: number; // If not yet paid
  driverId?: string;
  driverName?: string;
  status: 'to_deliver' | 'assigned' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
  requestedDate: string;
  requestedTimeSlot: string;
  deliveredAt?: string;
  proofType?: 'signature' | 'photo' | 'pin';
  proofData?: string;
  notes?: string;
}

export type DeliveryStatus = 'to_deliver' | 'assigned' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
export type DeliveryOrder = Delivery;

export interface SaaSPlan {
  id: string;
  tier: SubscriptionPlanTier;
  name: string;
  priceMonthly: number; // in FCFA
  priceYearly: number; // in FCFA with discount
  maxEstablishments: number; // -1 for unlimited
  maxUsers: number; // -1 for unlimited
  maxOrdersPerMonth: number; // -1 for unlimited
  features: string[];
  isPopular?: boolean;
}

export interface SaaSSubscriptionPayment {
  id: string;
  tenantId: string;
  tenantName: string;
  ownerName: string;
  ownerPhone: string;
  planTier: SubscriptionPlanTier;
  planName: string;
  amount: number; // FCFA
  billingCycle: 'monthly' | 'yearly';
  paymentMethod: PaymentMethod;
  transactionReference: string;
  receiptNumber: string; // e.g. "INV-SAAS-2026-0042"
  recordedByAdminName: string;
  paymentDate: string;
  coverageStartDate: string;
  coverageEndDate: string;
  status: PaymentStatus;
  notes?: string;
}

export interface Tenant {
  id: string;
  companyName: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerWhatsapp: string;
  logoUrl?: string;
  currency: string; // "FCFA"
  country: string; // "Côte d'Ivoire"
  city: string; // "Abidjan"
  registeredDate: string;
  status: SubscriptionStatus;
  planTier: SubscriptionPlanTier;
  planName: string;
  trialStartDate?: string;
  trialEndDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  lastPaymentDate?: string;
  outstandingBalance: number;
  establishmentsCount: number;
  usersCount: number;
  customWorkflowStages: { key: OrderWorkflowStatus; label: string; enabled: boolean }[];
  receiptHeader: string;
  receiptFooter: string;
  taxRate: number; // e.g. 0% or 18% TVA
  expressSurchargeRate: number; // e.g. 50%
}

export interface AuditLog {
  id: string;
  tenantId?: string; // null if platform super admin action
  tenantName?: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string; // e.g. "CREATE_ORDER", "UPDATE_PRICE", "CASH_CLOSING", "SUSPEND_TENANT"
  category: 'security' | 'financial' | 'order' | 'staff' | 'saas_admin' | 'settings';
  timestamp: string;
  ipAddress?: string;
  device?: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

export interface SaaSGlobalSettings {
  publisherName: string;
  publisherAuthor: string;
  publisherPhone: string;
  publisherWhatsapp: string;
  publisherEmail: string;
  publisherAddress: string;
  wavePaymentNumber: string;
  orangeMoneyMerchantCode: string;
  mtnMoMoCode: string;
  defaultTrialDays: number;
  maintenanceMode: boolean;
  maintenanceNotice?: string;
  taxRatePercent: number; // 0 or 18%
  appVersion: string;
  customFields?: {
    id: string;
    key: string;
    label: string;
    value: string;
    description?: string;
  }[];
}

export type SaaSEditorRole = 'super_admin' | 'collaborator' | 'support_tech' | 'billing_manager' | 'auditor';

export interface SaaSEditorPermissions {
  canViewOverview: boolean;
  canViewTenants: boolean;
  canCreateTenants: boolean;
  canEditTenants: boolean;
  canDeleteTenants: boolean; // STRICTLY RESERVED TO SUPER ADMIN OWNER (Gilles Brice Atsé)
  canAddAdditionalPressing: boolean;
  canImpersonateTenant: boolean;
  canSuspendTenant: boolean;
  canReactivateTenant: boolean;
  canExtendTrial: boolean;
  canRecordSaaSPayments: boolean;
  canManageInvoices: boolean;
  canManageSaaSPlans: boolean;
  canSendBroadcast: boolean;
  canViewAuditLogs: boolean;
  canManageCollaborators: boolean;
  canManageGlobalSettings: boolean;
  canResetDatabase: boolean; // STRICTLY RESERVED TO SUPER ADMIN OWNER
}

export interface SaaSEditorUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: SaaSEditorRole;
  isOwner?: boolean; // true for Super Admin Gilles Brice Atsé
  status: 'active' | 'inactive';
  lastLogin?: string;
  password?: string;
  defaultPassword?: string; // '1234'
  mustChangePassword?: boolean;
  hasCompletedFirstLogin?: boolean;
  permissions: SaaSEditorPermissions;
  idCardScanUrl?: string;
  idCardScanName?: string;
  idCardNumber?: string;
  idCardDocumentType?: 'cni' | 'passport' | 'attestation' | 'permis' | 'consulaire';
  idCardUploadedAt?: string;
  createdAt?: string;
}

export interface SaaSInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SaaSInvoice {
  id: string;
  invoiceNumber: string; // e.g. "FAC-SAAS-2026-0042"
  tenantId: string;
  tenantName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAddress?: string;
  planTier: SubscriptionPlanTier;
  planName: string;
  billingCycle: 'monthly' | 'yearly';
  coverageStartDate: string;
  coverageEndDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: SaaSInvoiceItem[];
  notes?: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent' | 'promo';
  target: 'all_tenants' | 'specific_tenant';
  targetTenantId?: string;
  targetTenantName?: string;
  createdAt: string;
  expiresAt?: string;
  isRead: boolean;
}

export type UITheme = 'amber' | 'sapphire' | 'emerald' | 'midnight';
export type DensityMode = 'comfortable' | 'compact' | 'touch';
export type UIProposalMode = 'pos_counter' | 'workshop_kanban' | 'executive_analytics';

export type ClientAuthRoleCategory = 'admin' | 'gerant' | 'employe';

export interface AuthPasswords {
  clientDefault: string;
  editorDefault: string;
}

