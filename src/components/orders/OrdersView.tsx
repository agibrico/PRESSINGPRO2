import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Filter,
  Kanban,
  ListFilter,
  MessageCircle,
  Package,
  Phone,
  Printer,
  QrCode,
  Search,
  Sparkles,
  Table,
  Truck,
  User,
  UserCheck,
  Tag,
  Barcode,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderItem, OrderWorkflowStatus } from '../../types';
import {
  createWhatsAppOrderReadyText,
  formatFCFA,
  getNextWorkflowStepInfo,
  ORDER_STATUS_CONFIG,
  WORKFLOW_PROGRESSION,
} from '../../services/store';
import { PaymentModal } from '../common/PaymentModal';
import { TicketModal } from '../common/TicketModal';
import { soundFX } from '../../services/sound';

export const OrdersView: React.FC = () => {
  const {
    state,
    currentTenant,
    updateOrderStatus,
    updateOrderItemWorkflow,
    recordClientPayment,
    currentPermissions,
    userRole,
  } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [selectedEstablishment, setSelectedEstablishment] = useState<string>('all');

  // Tag Scanning / Atelier Garment Processing Station
  const [tagInput, setTagInput] = useState<string>('');
  const [scannedGarmentInfo, setScannedGarmentInfo] = useState<{
    order: Order;
    item: OrderItem;
  } | null>(null);
  const [treatmentNotes, setTreatmentNotes] = useState<string>('');
  const [nextOperatorAlert, setNextOperatorAlert] = useState<{
    garmentTag: string;
    itemTitle: string;
    completedStepLabel: string;
    completedByName: string;
    nextRole: string;
  } | null>(null);

  // Modals
  const [selectedOrderForTicket, setSelectedOrderForTicket] = useState<Order | null>(null);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);

  // Workflow status progression list
  const WORKFLOW_STEPS: { key: OrderWorkflowStatus; label: string; short: string }[] = [
    { key: 'deposited', label: '1. DÉPOSÉE', short: 'Dépôt' },
    { key: 'sorting', label: '2. TRI & MARQUAGE', short: 'Tri' },
    { key: 'washing', label: '3. EN LAVAGE', short: 'Lavage' },
    { key: 'drying', label: '4. EN SÉCHAGE', short: 'Séchage' },
    { key: 'ironing', label: '5. EN REPASSAGE', short: 'Repassage' },
    { key: 'quality_check', label: '6. CONTRÔLE QUALITÉ', short: 'Contrôle' },
    { key: 'ready', label: '7. PRÊTE EN BOUTIQUE', short: 'Prête' },
    { key: 'in_delivery', label: '8. EN LIVRAISON', short: 'Livraison' },
    { key: 'delivered', label: '9. LIVRÉE / RETIRÉE', short: 'Livrée' },
  ];

  const now = new Date();
  const todayStr = now.toISOString().substring(0, 10);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
  const currentMonthStr = todayStr.substring(0, 7);

  const filteredOrders = state.orders.filter((order) => {
    if (order.tenantId !== state.currentTenantId) return false;
    
    // Strict establishment filter
    if (selectedEstablishment !== 'all' && order.establishmentId !== selectedEstablishment) {
      return false;
    }
    
    // Strict status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    
    // Strict payment filter
    if (paymentFilter !== 'all') {
      if (paymentFilter === 'paid' && order.paymentStatus !== 'paid') return false;
      if (paymentFilter === 'partial' && order.paymentStatus !== 'partial') return false;
      if (paymentFilter === 'unpaid' && order.paymentStatus !== 'unpaid') return false;
    }

    // Strict delivery mode filter
    if (deliveryFilter !== 'all') {
      if (deliveryFilter === 'delivery' && !order.deliveryRequested && order.deliveryMode !== 'home_delivery') {
        return false;
      }
      if (deliveryFilter === 'counter' && (order.deliveryRequested || order.deliveryMode === 'home_delivery')) {
        return false;
      }
    }

    // Strict date period filter
    if (periodFilter !== 'all') {
      const orderDate = order.depositDate ? order.depositDate.substring(0, 10) : '';
      if (periodFilter === 'today' && orderDate !== todayStr) return false;
      if (periodFilter === 'week' && orderDate < sevenDaysAgo) return false;
      if (periodFilter === 'month' && !orderDate.startsWith(currentMonthStr)) return false;
    }

    // Strict search
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchClient = order.clientName.toLowerCase().includes(q);
      const matchPhone = order.clientPhone.includes(q);
      const matchTag = order.items.some((i) => (i.tagNumber || '').toLowerCase().includes(q));
      const matchItem = order.items.some((i) => i.serviceName.toLowerCase().includes(q));
      return matchNum || matchClient || matchPhone || matchTag || matchItem;
    }

    return true;
  });

  const getNextStatus = (current: OrderWorkflowStatus): OrderWorkflowStatus | null => {
    const idx = WORKFLOW_STEPS.findIndex((s) => s.key === current);
    if (idx >= 0 && idx < WORKFLOW_STEPS.length - 1) {
      return WORKFLOW_STEPS[idx + 1].key;
    }
    return null;
  };

  const handleAdvanceStatus = (order: Order) => {
    const next = getNextStatus(order.status);
    if (next) {
      updateOrderStatus(
        order.id,
        next,
        `Passage à l'étape suivante (${ORDER_STATUS_CONFIG[next].label}) validé par ${state.currentUserName}`
      );
    }
  };

  const handleSendWhatsApp = (order: Order) => {
    if (!currentTenant) return;
    const text = createWhatsAppOrderReadyText(order, currentTenant);
    const phone = (order.clientWhatsapp || order.clientPhone).replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  // Tag reference searching
  const handleSearchTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput.trim()) return;

    const cleanTag = tagInput.trim().toUpperCase();
    let foundOrder: Order | null = null;
    let foundItem: OrderItem | null = null;

    for (const order of state.orders) {
      if (order.tenantId !== state.currentTenantId) continue;
      // Match by direct tagNumber
      const itemMatch = order.items.find(
        (i) => (i.tagNumber && i.tagNumber.toUpperCase() === cleanTag) ||
               (i.id && i.id.toUpperCase() === cleanTag)
      );
      if (itemMatch) {
        foundOrder = order;
        foundItem = itemMatch;
        break;
      }
      // Match by orderNumber
      if (order.orderNumber.toUpperCase() === cleanTag) {
        foundOrder = order;
        foundItem = order.items[0] || null;
        break;
      }
    }

    if (foundOrder && foundItem) {
      setScannedGarmentInfo({ order: foundOrder, item: foundItem });
      soundFX.playCashChime();
    } else {
      alert(`Aucun vêtement trouvé avec la référence ou l'étiquette : "${cleanTag}".`);
      soundFX.playError();
    }
  };

  // Operator confirms treatment
  const handleValidateGarmentTreatment = (targetStep: OrderWorkflowStatus) => {
    if (!scannedGarmentInfo) return;
    const { order, item } = scannedGarmentInfo;

    const operatorName = state.currentUserName || 'Opérateur Blanchisserie';
    const operatorRole = ORDER_STATUS_CONFIG[targetStep]?.roleName || 'Intervenant Atelier';
    const nextStepInfo = getNextWorkflowStepInfo(targetStep);

    updateOrderItemWorkflow(
      order.id,
      item.id,
      targetStep,
      operatorName,
      operatorRole,
      treatmentNotes || `Validation ${ORDER_STATUS_CONFIG[targetStep].label}`
    );

    // Set Live Notification pointing to NEXT operator for Manager/Admin Dashboard
    setNextOperatorAlert({
      garmentTag: item.tagNumber || `TAG-${order.orderNumber.slice(-4)}`,
      itemTitle: item.serviceName,
      completedStepLabel: ORDER_STATUS_CONFIG[targetStep].label,
      completedByName: operatorName,
      nextRole: nextStepInfo ? nextStepInfo.nextRole : 'Prêt pour Clôture',
    });

    setScannedGarmentInfo(null);
    setTagInput('');
    setTreatmentNotes('');
  };

  // Quick fill sample tag
  const handleQuickSampleScan = () => {
    const sampleOrder = state.orders.find((o) => o.tenantId === state.currentTenantId && o.items.length > 0);
    if (sampleOrder && sampleOrder.items[0]) {
      const tag = sampleOrder.items[0].tagNumber || `TAG-${sampleOrder.orderNumber.slice(-4)}-1`;
      setTagInput(tag);
      setScannedGarmentInfo({ order: sampleOrder, item: sampleOrder.items[0] });
      soundFX.playBeep();
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 font-sans">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            Suivi des Commandes & Atelier de Blanchisserie
          </h2>
          <p className="text-xs text-slate-500">
            Pipeline de traitement du linge, avancement par étape, étiquettes de marquage et alertes de retrait.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Tableau Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Liste Détaillée</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ATELIER & INTERVENANTS : POSTE DE SCAN & VALIDATION PAR ÉTIQUETTE VÊTEMENT */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Poste Atelier & Traçabilité Opérateur
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Opérateur connecté : <strong className="text-white">{state.currentUserName}</strong>
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                Scan Référence / Étiquette Vêtement & Pointage Automatique du Prochain Intervenant
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickSampleScan}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tester avec une étiquette</span>
          </button>
        </div>

        {/* Live Alert on Next Operator */}
        {nextOperatorAlert && (
          <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-3.5 text-xs text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">
                  Étape validée : <span className="text-emerald-300">{nextOperatorAlert.completedStepLabel}</span> sur {nextOperatorAlert.itemTitle} ({nextOperatorAlert.garmentTag}) par {nextOperatorAlert.completedByName}
                </p>
                <p className="text-[11px] text-emerald-300 mt-0.5">
                  👉 <strong>Pointage automatique :</strong> Le tableau de bord du Gérant et de l'Administrateur pointe désormais sur : <span className="bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded font-bold">{nextOperatorAlert.nextRole}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setNextOperatorAlert(null)}
              className="text-[10px] text-emerald-400 hover:text-white underline cursor-pointer shrink-0"
            >
              Fermer le pointage
            </button>
          </div>
        )}

        {/* Scan / Reference Search Form */}
        <form onSubmit={handleSearchTag} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Tag className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Entrer ou scanner la référence sur l'étiquette (ex: TAG-0842-1 ou MPP-2026-0842)..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2 text-xs font-mono focus:outline-hidden focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Retrouver le vêtement</span>
          </button>
        </form>

        {/* Scanned Garment Action Panel */}
        {scannedGarmentInfo && (
          <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-4 space-y-3 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-amber-400 font-bold text-sm bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {scannedGarmentInfo.item.tagNumber || `TAG-${scannedGarmentInfo.order.orderNumber.slice(-4)}`}
                </span>
                <span className="font-bold text-white text-sm">
                  {scannedGarmentInfo.item.quantity}x {scannedGarmentInfo.item.serviceName}
                </span>
                {scannedGarmentInfo.item.color && (
                  <span className="text-slate-400">({scannedGarmentInfo.item.color})</span>
                )}
              </div>
              <div className="text-slate-400 text-[11px] font-mono">
                Commande N°: <strong className="text-white">{scannedGarmentInfo.order.orderNumber}</strong> • Client: <strong className="text-white">{scannedGarmentInfo.order.clientName}</strong>
              </div>
            </div>

            {/* Current status & Issues */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-400">Statut Actuel</p>
                <p className="font-bold text-amber-300">
                  {ORDER_STATUS_CONFIG[scannedGarmentInfo.order.status]?.label || 'En cours'}
                </p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-400">Dernier Intervenant / Responsable</p>
                <p className="font-bold text-white">
                  {scannedGarmentInfo.order.currentResponsibleName || scannedGarmentInfo.order.createdByEmployeeName || 'Accueil'}
                </p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-400">Instructions Particulières / Taches</p>
                <p className="font-bold text-rose-300 truncate">
                  {scannedGarmentInfo.item.issues && scannedGarmentInfo.item.issues.length > 0
                    ? scannedGarmentInfo.item.issues.join(', ')
                    : 'Aucune anomalie signalée'}
                </p>
              </div>
            </div>

            {/* Actions for next steps */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <p className="text-[11px] font-bold text-slate-300">
                Sélectionner le traitement terminé pour ce vêtement :
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleValidateGarmentTreatment('washing')}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1. Valider Lavage & Détachage Terminé</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleValidateGarmentTreatment('drying')}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>2. Valider Séchage Terminé</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleValidateGarmentTreatment('ironing')}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>3. Valider Repassage & Presse Terminé</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleValidateGarmentTreatment('quality_check')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>4. Valider Contrôle Qualité Conforme</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleValidateGarmentTreatment('ready')}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>5. Mettre en Penderie (Prêt Client)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* STRICT FILTERS BAR                                                        */}
      {/* ========================================================================= */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-800">Filtres Stricts de Recherche & Affichage</span>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold font-mono">
            {filteredOrders.length} commande(s) affichée(s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="N° ticket, nom client, tél, étiquette..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="all">Tous les statuts</option>
              {WORKFLOW_STEPS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">7 derniers jours</option>
              <option value="month">Ce mois-ci</option>
            </select>
          </div>

          {/* Delivery Mode Filter */}
          <div>
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="all">Tous modes de retrait</option>
              <option value="counter">Retrait sur place (Comptoir)</option>
              <option value="delivery">Livraison à domicile</option>
            </select>
          </div>

          {/* Payment filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="all">Tous règlements</option>
              <option value="paid">Entièrement Payé (Soldé)</option>
              <option value="partial">Acompte Versé (Partiel)</option>
              <option value="unpaid">Impayé (0 FCFA)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KANBAN BOARD VIEW                                                         */}
      {/* ========================================================================= */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[500px]">
          {WORKFLOW_STEPS.map((step) => {
            const stepOrders = filteredOrders.filter((o) => o.status === step.key);
            const conf = ORDER_STATUS_CONFIG[step.key];

            return (
              <div
                key={step.key}
                className="w-72 shrink-0 bg-slate-100/70 border border-slate-200/80 rounded-xl flex flex-col max-h-[750px] shadow-xs"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-slate-200 bg-white rounded-t-xl flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${conf.bg.replace('-50', '-500')}`} />
                    <div>
                      <h3 className="font-bold text-xs text-slate-800 tracking-wide uppercase">
                        {step.short}
                      </h3>
                      <p className="text-[9px] text-slate-400 truncate max-w-[140px]">{conf.roleName}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    {stepOrders.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1">
                  {stepOrders.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-[11px]">
                      Aucune commande à cette étape.
                    </div>
                  ) : (
                    stepOrders.map((order) => {
                      const next = getNextStatus(order.status);
                      const isReady = order.status === 'ready';

                      return (
                        <div
                          key={order.id}
                          className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition-all text-xs group"
                        >
                          {/* Top: Ref, Express, Rack */}
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono font-bold text-slate-900 text-xs">
                                {order.orderNumber}
                              </span>
                              {order.rackLocation && (
                                <span className="ml-1.5 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-sans">
                                  {order.rackLocation}
                                </span>
                              )}
                            </div>

                            {order.isExpress && (
                              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded shrink-0">
                                ⚡ Express
                              </span>
                            )}
                          </div>

                          {/* Client Info & Delivery mode */}
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                              <p className="font-semibold text-slate-900 text-xs truncate">
                                {order.clientName}
                              </p>
                              <span className="text-slate-300">•</span>
                              <p className="text-[11px] text-slate-500 font-mono shrink-0">📞 {order.clientPhone}</p>
                            </div>
                            {order.deliveryRequested || order.deliveryMode === 'home_delivery' ? (
                              <p className="text-[10px] text-blue-700 font-semibold flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                <span className="truncate">Livraison : {order.deliveryLocation || order.deliveryAddress || 'Domicile'}</span>
                              </p>
                            ) : (
                              <p className="text-[10px] text-slate-400 font-medium">
                                🏪 Retrait sur place
                              </p>
                            )}
                          </div>

                          {/* Items Summary & Tag */}
                          <div className="bg-slate-50 p-2 rounded border border-slate-100 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
                              <span>📦 {order.itemCount} article(s)</span>
                              <span className="font-mono text-[10px] bg-amber-100 text-amber-900 px-1.5 rounded font-bold">
                                {order.items[0]?.tagNumber || `TAG-${order.orderNumber.slice(-4)}`}
                              </span>
                            </div>
                            <ul className="text-[10px] text-slate-600 space-y-0.5">
                              {order.items.slice(0, 2).map((item, idx) => (
                                <li key={idx} className="truncate">
                                  • {item.quantity}x {item.serviceName} {item.color ? `(${item.color})` : ''}
                                </li>
                              ))}
                              {order.items.length > 2 && (
                                <li className="text-slate-400 italic">
                                  + {order.items.length - 2} autre(s) prestation(s)
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* Responsible Pointer Info */}
                          {order.nextResponsibleRole && (
                            <div className="p-1.5 bg-amber-50 rounded border border-amber-200/60 text-[10px] text-amber-900 font-medium">
                              👉 Suivant : <strong>{order.nextResponsibleRole}</strong>
                            </div>
                          )}

                          {/* Pickup Date and Financials */}
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                            <div className="text-slate-500 font-mono text-[10px]">
                              Retrait: {order.promisedPickupDate.substring(5)} à {order.promisedPickupTime}
                            </div>
                            <div className="font-mono text-right">
                              <span className="font-bold text-slate-900">{formatFCFA(order.totalAmount)}</span>
                              {order.remainingBalance > 0 ? (
                                <span className="block text-[9px] text-rose-600 font-semibold">
                                  Reste: {formatFCFA(order.remainingBalance)}
                                </span>
                              ) : (
                                <span className="block text-[9px] text-emerald-600 font-semibold">
                                  Soldé ✓
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Card Action Buttons */}
                          <div className="flex items-center justify-between gap-1.5 pt-1">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setSelectedOrderForTicket(order)}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded border border-slate-200 transition cursor-pointer"
                                title="Imprimer le ticket thermique"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {isReady && (
                                <button
                                  onClick={() => handleSendWhatsApp(order)}
                                  className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition cursor-pointer"
                                  title="Alerter le client par WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {order.remainingBalance > 0 && (
                                <button
                                  onClick={() => setSelectedOrderForPayment(order)}
                                  className="p-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition cursor-pointer"
                                  title="Encaisser le solde"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {next && (
                              <button
                                onClick={() => handleAdvanceStatus(order)}
                                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                              >
                                <span>Suivant</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED TABLE VIEW                                                       */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Réf / Étiquette</th>
                  <th className="p-3">Client & Mode</th>
                  <th className="p-3">Articles & Pièces</th>
                  <th className="p-3">Étape Actuelle</th>
                  <th className="p-3">Prochain Intervenant</th>
                  <th className="p-3">Promis le</th>
                  <th className="p-3">Montant & Solde</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                      Aucune commande ne correspond aux filtres sélectionnés.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const conf = ORDER_STATUS_CONFIG[order.status];
                    const next = getNextStatus(order.status);

                    return (
                      <tr key={order.id} className="hover:bg-slate-50 transition">
                        <td className="p-3">
                          <span className="font-mono font-bold text-slate-900 block">
                            {order.orderNumber}
                          </span>
                          <span className="font-mono text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded inline-block font-semibold">
                            {order.items[0]?.tagNumber || `TAG-${order.orderNumber.slice(-4)}`}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-900 block">{order.clientName}</span>
                          <span className="font-mono text-[11px] text-slate-500">{order.clientPhone}</span>
                          {order.deliveryRequested && (
                            <span className="block text-[10px] text-blue-700 font-bold">
                              🚚 Livraison à domicile
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-slate-800">
                            {order.itemCount} pièce(s)
                          </span>
                          <span className="block text-[10px] text-slate-400 truncate max-w-[180px]">
                            {order.items.map((i) => `${i.quantity}x ${i.serviceName}`).join(', ')}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${conf.bg} ${conf.text} ${conf.border}`}
                          >
                            {conf.label}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                            {order.nextResponsibleRole || conf.roleName}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">
                          {order.promisedPickupDate}
                          <span className="block text-[10px] text-slate-400">{order.promisedPickupTime}</span>
                        </td>
                        <td className="p-3 font-mono">
                          <span className="font-bold text-slate-900 block">
                            {formatFCFA(order.totalAmount)}
                          </span>
                          {order.remainingBalance > 0 ? (
                            <span className="text-[10px] text-rose-600 font-semibold">
                              Reste: {formatFCFA(order.remainingBalance)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold">
                              Soldé ✓
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrderForTicket(order)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded transition cursor-pointer"
                              title="Ticket thermique"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            {order.remainingBalance > 0 && (
                              <button
                                onClick={() => setSelectedOrderForPayment(order)}
                                className="p-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition cursor-pointer"
                                title="Encaisser"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {next && (
                              <button
                                onClick={() => handleAdvanceStatus(order)}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-[10px] cursor-pointer"
                              >
                                Étape +1
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedOrderForTicket && (
        <TicketModal
          order={selectedOrderForTicket}
          tenant={currentTenant}
          onClose={() => setSelectedOrderForTicket(null)}
        />
      )}

      {selectedOrderForPayment && (
        <PaymentModal
          order={selectedOrderForPayment}
          onClose={() => setSelectedOrderForPayment(null)}
          onConfirmPayment={(paymentData) => {
            recordClientPayment(paymentData);
            soundFX.playCashChime();
            setSelectedOrderForPayment(null);
          }}
        />
      )}
    </div>
  );
};
