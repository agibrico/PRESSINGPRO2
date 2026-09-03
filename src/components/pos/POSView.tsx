import React, { useState } from 'react';
import {
  AlertTriangle,
  Building,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Flame,
  MessageCircle,
  PackagePlus,
  Percent,
  Plus,
  Printer,
  QrCode,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  User,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Client, Order, OrderItem, PaymentMethod, ServiceItem } from '../../types';
import { formatFCFA, PAYMENT_METHOD_CONFIG } from '../../services/store';
import { TicketModal } from '../common/TicketModal';
import { soundFX } from '../../services/sound';

export const POSView: React.FC = () => {
  const {
    state,
    currentTenant,
    createOrder,
    recordClientPayment,
    createClient,
    currentPermissions,
  } = useApp();

  const tenantServices = state.services.filter((s) => s.tenantId === state.currentTenantId);
  const tenantClients = state.clients.filter((c) => c.tenantId === state.currentTenantId);
  const tenantEstablishments = state.establishments.filter((e) => e.tenantId === state.currentTenantId);

  // Form State
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string>(
    tenantEstablishments[0]?.id || 'est-main'
  );
  const [selectedClient, setSelectedClient] = useState<Client | null>(tenantClients[0] || null);
  const [clientSearchQuery, setClientSearchQuery] = useState<string>('');
  const [showNewClientModal, setShowNewClientModal] = useState<boolean>(false);

  // New Client Form inside POS
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPhone, setNewPhone] = useState('+225 ');
  const [newAddress, setNewAddress] = useState('');

  // Service Category Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [serviceSearch, setServiceSearch] = useState<string>('');

  // Cart Items
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isExpress, setIsExpress] = useState<boolean>(false);
  const [deliveryMode, setDeliveryMode] = useState<'counter_pickup' | 'home_delivery'>('counter_pickup');
  const [deliveryRequested, setDeliveryRequested] = useState<boolean>(false);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [customDiscount, setCustomDiscount] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [promisedDate, setPromisedDate] = useState<string>(
    new Date(Date.now() + 48 * 3600 * 1000).toISOString().substring(0, 10)
  );
  const [promisedTime, setPromisedTime] = useState<string>('17:00');
  const [generalNotes, setGeneralNotes] = useState<string>('');

  // Modal ticket state
  const [createdOrderForTicket, setCreatedOrderForTicket] = useState<Order | null>(null);

  // Garment issues library
  const COMMON_ISSUES = [
    'Tache tenace (Graisse/Encre/Vin)',
    'Bouton manquant',
    'Déchirure / Trou',
    'Tissu fragile / Décoloré',
    'Fermeture éclair cassée',
    'Doublure abîmée',
  ];

  const categories = [
    'Tous',
    'Vêtements quotidiens',
    'Traditionnel / Bazin & Kita',
    'Costumes & Luxe',
    'Maison & Blanchisserie',
    'Chaussures & Maroquinerie',
  ];

  const filteredServices = tenantServices.filter((s) => {
    const matchCat = selectedCategory === 'Tous' || s.category === selectedCategory;
    const matchSearch =
      s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(serviceSearch.toLowerCase()));
    return matchCat && matchSearch;
  });

  const filteredClients = tenantClients.filter(
    (c) =>
      c.firstName.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      c.lastName.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      c.phone.includes(clientSearchQuery) ||
      c.clientCode.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  // Cart operations
  const handleAddToCart = (service: ServiceItem) => {
    soundFX.playBeep();
    const existingIndex = cartItems.findIndex((item) => item.serviceId === service.id);
    const unitPrice = isExpress ? service.priceExpress : service.priceStandard;

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setCartItems(updated);
    } else {
      const newItem: OrderItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        serviceId: service.id,
        serviceName: service.name,
        category: service.category,
        unitPrice,
        quantity: 1,
        totalPrice: unitPrice,
        issues: [],
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    soundFX.playBeep();
    const updated = [...cartItems];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].quantity = newQty;
      updated[index].totalPrice = newQty * updated[index].unitPrice;
    }
    setCartItems(updated);
  };

  const handleUpdateItemNotes = (index: number, color?: string, brand?: string, notes?: string) => {
    const updated = [...cartItems];
    if (color !== undefined) updated[index].color = color;
    if (brand !== undefined) updated[index].brand = brand;
    if (notes !== undefined) updated[index].treatmentNotes = notes;
    setCartItems(updated);
  };

  const handleToggleItemIssue = (index: number, issue: string) => {
    const updated = [...cartItems];
    const issues = updated[index].issues || [];
    if (issues.includes(issue)) {
      updated[index].issues = issues.filter((i) => i !== issue);
    } else {
      updated[index].issues = [...issues, issue];
    }
    setCartItems(updated);
  };

  // Totals calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const expressFee = isExpress ? Math.round(subtotal * 0.5) : 0;
  const deliveryFee = deliveryRequested ? 1500 : 0;
  const totalAmount = Math.max(0, subtotal + expressFee + deliveryFee - customDiscount);
  const remainingBalance = Math.max(0, totalAmount - depositAmount);

  // Quick Client Creation
  const handleQuickCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName || !newPhone) return;

    const created = createClient({
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      phone: newPhone.trim(),
      whatsapp: newPhone.trim(),
      address: newAddress.trim(),
      preferredContact: 'whatsapp',
    });

    setSelectedClient(created);
    setShowNewClientModal(false);
    setNewFirstName('');
    setNewLastName('');
    setNewPhone('+225 ');
    setNewAddress('');
  };

  // Submit Order
  const handleValidateOrder = async () => {
    if (!selectedClient) {
      alert('Veuillez sélectionner ou créer un client pour ce dépôt.');
      return;
    }
    if (cartItems.length === 0) {
      alert('Veuillez ajouter au moins un article au panier.');
      return;
    }

    const est = tenantEstablishments.find((e) => e.id === selectedEstablishmentId) || tenantEstablishments[0];

    const isHomeDelivery = deliveryMode === 'home_delivery';
    const orderData: Partial<Order> = {
      establishmentId: est?.id,
      establishmentName: est?.name,
      clientId: selectedClient.id,
      clientName: `${selectedClient.firstName} ${selectedClient.lastName}`,
      clientPhone: selectedClient.phone,
      clientWhatsapp: selectedClient.whatsapp || selectedClient.phone,
      items: cartItems,
      itemCount: cartItems.reduce((acc, i) => acc + i.quantity, 0),
      subtotal,
      isExpress,
      expressFee,
      deliveryFee: isHomeDelivery ? 1500 : 0,
      discountAmount: customDiscount,
      totalAmount,
      paidAmount: depositAmount,
      promisedPickupDate: promisedDate,
      promisedPickupTime: promisedTime,
      deliveryRequested: isHomeDelivery,
      deliveryMode: isHomeDelivery ? 'home_delivery' : 'counter',
      deliveryLocation: isHomeDelivery ? (deliveryAddress || selectedClient.address || 'Abidjan') : undefined,
      deliveryAddress: isHomeDelivery ? (deliveryAddress || selectedClient.address || 'Abidjan') : undefined,
      receivedByEmployeeId: state.currentUserId,
      receivedByEmployeeName: state.currentUserName,
      createdByEmployeeId: state.currentUserId,
      createdByEmployeeName: state.currentUserName,
      generalNotes,
    };

    const newOrder = await createOrder(orderData);

    // If an initial deposit was paid, record payment
    if (depositAmount > 0) {
      recordClientPayment({
        orderId: newOrder.id,
        amount: depositAmount,
        paymentMethod,
        notes: `Acompte initial de dépôt (${PAYMENT_METHOD_CONFIG[paymentMethod].label})`,
      });
    }

    // Reset Cart
    setCartItems([]);
    setDepositAmount(0);
    setCustomDiscount(0);
    setIsExpress(false);
    setDeliveryRequested(false);
    setGeneralNotes('');

    // Open Printable Ticket
    setCreatedOrderForTicket(newOrder);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            Caisse & Dépôt Rapide (POS)
          </h2>
          <p className="text-xs text-slate-500">
            Prise en charge instantanée, étiquetage textile et encaissement Mobile Money & Espèces.
          </p>
        </div>

        {/* Agency selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Agence de dépôt:</label>
          <select
            value={selectedEstablishmentId}
            onChange={(e) => setSelectedEstablishmentId(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:ring-2 focus:ring-slate-900"
          >
            {tenantEstablishments.map((est) => (
              <option key={est.id} value={est.id}>
                {est.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Client & Services Catalog (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Client Selection Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                1. Identification du Client
              </span>
              <button
                type="button"
                onClick={() => setShowNewClientModal(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-md border border-amber-200 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3 h-3" />
                <span>Nouveau Client</span>
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, téléphone (+225...) ou code client..."
                className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Selected Client Card or Dropdown List */}
            {clientSearchQuery.length > 0 ? (
              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => {
                      setSelectedClient(client);
                      setClientSearchQuery('');
                    }}
                    className="p-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">
                        {client.firstName} {client.lastName}
                      </span>
                      <span className="text-slate-500 ml-2 font-mono text-[11px]">({client.phone})</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {client.clientCode}
                    </span>
                  </div>
                ))}
              </div>
            ) : selectedClient ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-xs">
                      {selectedClient.firstName} {selectedClient.lastName}
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-mono font-semibold px-1.5 py-0.5 rounded shrink-0">
                      {selectedClient.clientCode}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-600 font-mono shrink-0">
                      📞 {selectedClient.phone}
                    </span>
                    {selectedClient.address && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-500 truncate max-w-[200px]">📍 {selectedClient.address}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 block">Commandes passées</span>
                  <span className="font-semibold text-xs text-slate-800 font-mono">
                    {selectedClient.totalOrders} dépôts • {formatFCFA(selectedClient.totalSpent)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Service Items Selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <PackagePlus className="w-3.5 h-3.5 text-slate-400" />
                2. Sélection des Prestations
              </span>
              <div className="relative w-44">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder="Filtrer prestation..."
                  className="w-full text-[11px] pl-7 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-md focus:bg-white"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredServices.map((service) => {
                const inCart = cartItems.find((item) => item.serviceId === service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => handleAddToCart(service)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50/80 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-semibold text-slate-900 text-xs group-hover:text-amber-700 transition-colors">
                          {service.name}
                        </h4>
                        {inCart && (
                          <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                            {inCart.quantity}
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{service.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-mono">~{service.estimatedProcessingHours}h</span>
                      <div className="text-right">
                        <span className="font-bold text-xs text-slate-900 font-mono">
                          {formatFCFA(isExpress ? service.priceExpress : service.priceStandard)}
                        </span>
                        {isExpress && (
                          <span className="text-[9px] text-amber-600 font-semibold block">Tarif Express</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Cart, Options & Payment (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Panier ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} pièces)
              </span>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCartItems([])}
                  className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                >
                  Vider panier
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cartItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>Aucun article sélectionné.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Cliquez sur une prestation pour l'ajouter.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item, idx) => (
                  <div key={item.id || idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900 text-xs">{item.serviceName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {formatFCFA(item.unitPrice)} / pièce
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(idx, -1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-bold text-xs text-slate-900 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(idx, 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-xs text-slate-900 font-mono shrink-0">
                        {formatFCFA(item.totalPrice)}
                      </span>
                    </div>

                    {/* Garment Details: Color & Flaws */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Couleur / Marque..."
                        value={item.color || ''}
                        onChange={(e) => handleUpdateItemNotes(idx, e.target.value)}
                        className="text-[10px] px-2 py-1 bg-white border border-slate-200 rounded text-slate-700"
                      />
                      <input
                        type="text"
                        placeholder="Note particulière..."
                        value={item.treatmentNotes || ''}
                        onChange={(e) => handleUpdateItemNotes(idx, undefined, undefined, e.target.value)}
                        className="text-[10px] px-2 py-1 bg-white border border-slate-200 rounded text-slate-700"
                      />
                    </div>

                    {/* Quick Flaw Checkboxes */}
                    <div className="flex flex-wrap gap-1">
                      {COMMON_ISSUES.map((issue) => {
                        const hasIssue = item.issues?.includes(issue);
                        return (
                          <button
                            key={issue}
                            type="button"
                            onClick={() => handleToggleItemIssue(idx, issue)}
                            className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                              hasIssue
                                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {issue.split(' ')[0]} {issue.split(' ')[1]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Receptionist Badge */}
            <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 text-[11px] flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Réceptionniste : <strong>{state.currentUserName}</strong></span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                {state.currentRole.toUpperCase()}
              </span>
            </div>

            {/* Options: Express & Mode de Remise (Retrait vs Livraison) */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
              <div className="grid grid-cols-2 gap-2">
                {/* Express Toggle */}
                <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                  isExpress ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <input
                    type="checkbox"
                    checked={isExpress}
                    onChange={(e) => setIsExpress(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>⚡ Express (+50%)</span>
                </label>

                {/* Delivery Mode Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryMode('counter_pickup');
                      setDeliveryRequested(false);
                    }}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                      deliveryMode === 'counter_pickup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    🏪 Retrait
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryMode('home_delivery');
                      setDeliveryRequested(true);
                    }}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                      deliveryMode === 'home_delivery' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    🚚 Livraison (+1500)
                  </button>
                </div>
              </div>

              {/* Delivery Address Field when delivery is selected */}
              {deliveryMode === 'home_delivery' && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg space-y-1 animate-in fade-in duration-150">
                  <label className="block text-[10px] font-bold text-blue-900">
                    Adresse / Quartier / Repère de livraison <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Ex: Cocody Angré 8ème Tranche, Résidence B, Villa 12"
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-blue-300 rounded text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Promised Pickup Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Date {deliveryMode === 'home_delivery' ? 'livraison' : 'retrait'}</label>
                  <input
                    type="date"
                    value={promisedDate}
                    onChange={(e) => setPromisedDate(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Heure estimée</label>
                  <input
                    type="time"
                    value={promisedTime}
                    onChange={(e) => setPromisedTime(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Order Totals Summary */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total</span>
                <span className="font-mono">{formatFCFA(subtotal)}</span>
              </div>
              {isExpress && (
                <div className="flex justify-between text-amber-700">
                  <span>Majoration Express</span>
                  <span className="font-mono">+{formatFCFA(expressFee)}</span>
                </div>
              )}
              {deliveryRequested && (
                <div className="flex justify-between text-blue-700">
                  <span>Frais de livraison</span>
                  <span className="font-mono">+{formatFCFA(deliveryFee)}</span>
                </div>
              )}
              {customDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Remise</span>
                  <span className="font-mono">-{formatFCFA(customDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-950 pt-2 border-t border-slate-200">
                <span>TOTAL À PAYER</span>
                <span className="font-mono">{formatFCFA(totalAmount)}</span>
              </div>
            </div>

            {/* Instant Deposit / Payment Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Acompte / Règlement immédiat
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={totalAmount}
                    step={500}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full text-xs font-bold px-2 py-1.5 border border-slate-300 rounded bg-white font-mono"
                    placeholder="Montant payé"
                  />
                </div>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="text-xs bg-white border border-slate-300 rounded px-2 py-1.5 font-medium text-slate-800"
                >
                  <option value="wave">Wave CI</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="mtn_money">MTN MoMo</option>
                  <option value="moov_money">Moov Money</option>
                  <option value="cash">Espèces (Cash)</option>
                </select>
              </div>

              {/* Quick total buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDepositAmount(totalAmount)}
                  className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold cursor-pointer"
                >
                  Payé 100% ({formatFCFA(totalAmount)})
                </button>
                <button
                  type="button"
                  onClick={() => setDepositAmount(Math.round(totalAmount * 0.5))}
                  className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold cursor-pointer"
                >
                  Acompte 50%
                </button>
                <button
                  type="button"
                  onClick={() => setDepositAmount(0)}
                  className="px-2 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-semibold cursor-pointer"
                >
                  0 FCFA (À la livraison)
                </button>
              </div>

              <div className="flex justify-between text-xs text-rose-700 font-bold pt-1">
                <span>Reste à payer :</span>
                <span className="font-mono">{formatFCFA(remainingBalance)}</span>
              </div>
            </div>

            {/* Validate Button */}
            <button
              type="button"
              onClick={handleValidateOrder}
              disabled={cartItems.length === 0 || !selectedClient}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Valider le Dépôt & Imprimer Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Quick Create Client */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Enregistrer un nouveau client</h3>
            <form onSubmit={handleQuickCreateClient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                    placeholder="Ex: Kouamé"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                    placeholder="Ex: Koffi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Téléphone & WhatsApp (obligatoire)</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-slate-900"
                  placeholder="+225 07 00 00 00 00"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Adresse ou Quartier (optionnel)</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                  placeholder="Ex: Cocody Angré 8e Tranche"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800"
                >
                  Créer et sélectionner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Modal popup after successful deposit */}
      {createdOrderForTicket && (
        <TicketModal
          order={createdOrderForTicket}
          tenant={currentTenant}
          onClose={() => setCreatedOrderForTicket(null)}
        />
      )}
    </div>
  );
};
