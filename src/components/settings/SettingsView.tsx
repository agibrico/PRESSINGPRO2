import React, { useState } from 'react';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  CreditCard,
  Crown,
  Database,
  Download,
  Edit2,
  FileText,
  MapPin,
  Monitor,
  Package,
  Palette,
  Plus,
  PlusCircle,
  Receipt,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tag,
  Upload,
  Volume2,
  VolumeX,
  KeyRound,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Establishment, PaymentMethod, ServiceItem, UITheme, DensityMode } from '../../types';
import { formatFCFA, PAYMENT_METHOD_CONFIG } from '../../services/store';
import { soundFX } from '../../services/sound';
import { AgbLogo } from '../common/AgbLogo';

export const SettingsView: React.FC = () => {
  const {
    state,
    currentTenant,
    updateTenantSettings,
    createEstablishment,
    createServiceItem,
    recordSaaSSubscriptionPayment,
    setUITheme,
    setDensity,
    toggleSound,
    updateClientPassword,
    updateAdminPassword,
    updateGerantPassword,
    updateEditorPassword,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'establishments' | 'tarifs' | 'subscription' | 'ui' | 'security' | 'backup'>('subscription');

  // Password editing state
  const [newAdminPass, setNewAdminPass] = useState(state.adminPassword || '1234');
  const [newGerantPass, setNewGerantPass] = useState(state.gerantPassword || '1234');
  const [newClientPass, setNewClientPass] = useState(state.clientPassword || '1234');
  const [newEditorPass, setNewEditorPass] = useState(state.editorPassword || 'agibrico1');
  const [passSavedMsg, setPassSavedMsg] = useState('');

  // Pressing Identity Form
  const [companyName, setCompanyName] = useState(currentTenant?.companyName || '');
  const [ownerPhone, setOwnerPhone] = useState(currentTenant?.ownerPhone || '');
  const [address, setAddress] = useState(currentTenant?.address || '');
  const [city, setCity] = useState(currentTenant?.city || 'Abidjan');
  const [receiptHeader, setReceiptHeader] = useState(currentTenant?.receiptHeader || '');
  const [receiptFooter, setReceiptFooter] = useState(currentTenant?.receiptFooter || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Establishment Form
  const [showAddEstModal, setShowAddEstModal] = useState(false);
  const [estName, setEstName] = useState('');
  const [estCode, setEstCode] = useState('');
  const [estCity, setEstCity] = useState('Abidjan');
  const [estAddress, setEstAddress] = useState('');
  const [estPhone, setEstPhone] = useState('+225 ');

  // New Service Form
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [srvName, setSrvName] = useState('');
  const [srvCategory, setSrvCategory] = useState('Vêtements quotidiens');
  const [srvPriceStd, setSrvPriceStd] = useState(2500);
  const [srvPriceExp, setSrvPriceExp] = useState(4000);
  const [srvHours, setSrvHours] = useState(24);
  const [srvDesc, setSrvDesc] = useState('');

  // SaaS Subscription Renewal State
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewMonths, setRenewMonths] = useState<number>(1);
  const [renewMethod, setRenewMethod] = useState<PaymentMethod>('wave');
  const [renewPhone, setRenewPhone] = useState<string>(currentTenant?.ownerPhone || '+225 ');
  const [isProcessingRenew, setIsProcessingRenew] = useState(false);
  const [renewSuccessMsg, setRenewSuccessMsg] = useState('');

  const tenantEstablishments = state.establishments.filter((e) => e.tenantId === state.currentTenantId);
  const tenantServices = state.services.filter((s) => s.tenantId === state.currentTenantId);
  const tenantSaaSInvoices = state.saasInvoices.filter((inv) => inv.tenantId === state.currentTenantId);

  const planPricing = currentTenant?.planName === 'Starter' ? 25000 : currentTenant?.planName === 'Enterprise' ? 120000 : 50000;
  const renewalAmount = planPricing * renewMonths;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantSettings({
      companyName,
      ownerPhone,
      address,
      city,
      receiptHeader,
      receiptFooter,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateEst = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estName) return;

    createEstablishment({
      name: estName.trim(),
      code: estCode.trim() || estName.substring(0, 3).toUpperCase(),
      city: estCity,
      address: estAddress.trim(),
      phone: estPhone.trim(),
      isMain: false,
      status: 'active',
    });

    setShowAddEstModal(false);
    setEstName('');
    setEstCode('');
    setEstAddress('');
  };

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName || srvPriceStd <= 0) return;

    createServiceItem({
      name: srvName.trim(),
      category: srvCategory,
      priceStandard: srvPriceStd,
      priceExpress: srvPriceExp || Math.round(srvPriceStd * 1.5),
      estimatedProcessingHours: srvHours,
      description: srvDesc.trim(),
      isActive: true,
    });

    setShowAddServiceModal(false);
    setSrvName('');
    setSrvDesc('');
  };

  const handleExecuteSaaSRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    setIsProcessingRenew(true);
    setTimeout(() => {
      recordSaaSSubscriptionPayment({
        tenantId: currentTenant.id,
        amount: renewalAmount,
        months: renewMonths,
        paymentMethod: renewMethod,
        transactionReference: `${renewMethod.toUpperCase()}-SaaS-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: `Renouvellement abonnement SaaS (${renewMonths} mois) via ${PAYMENT_METHOD_CONFIG[renewMethod].label}`,
      });

      setIsProcessingRenew(false);
      setShowRenewModal(false);
      confetti({ particleCount: 80, spread: 80 });
      setRenewSuccessMsg(`Félicitations ! Votre abonnement SaaS a été renouvelé avec succès pour ${renewMonths} mois.`);
      setTimeout(() => setRenewSuccessMsg(''), 5000);
    }, 1200);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            Paramètres du Pressing & Abonnement SaaS
          </h2>
          <p className="text-xs text-slate-500">
            Coordonnées de l'entreprise, gestion des agences, catalogue des tarifs et renouvellement de licence.
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('subscription')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'subscription'
              ? 'border-purple-600 text-purple-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Crown className="w-4 h-4 text-purple-600" />
          <span>Abonnement SaaS & Factures</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Identité & Tickets</span>
        </button>

        <button
          onClick={() => setActiveTab('establishments')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'establishments'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Agences & Succursales ({tenantEstablishments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tarifs')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'tarifs'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Grille Tarifaire ({tenantServices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ui')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ui'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Palette className="w-4 h-4 text-amber-500" />
          <span>Interface & Thèmes</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <KeyRound className="w-4 h-4 text-blue-600" />
          <span>Sécurité & Accès Éditeur</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'backup'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Sauvegarde & Données</span>
        </button>
      </div>

      {renewSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{renewSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: SAAS SUBSCRIPTION & RENEWAL */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          {/* Subscription Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-purple-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span className="text-xs uppercase font-bold tracking-wider text-purple-200">
                    Formule Souscrite : {currentTenant?.planName || 'Pro'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentTenant?.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {currentTenant?.status === 'active' ? 'ACTIF / À JOUR' : 'PÉRIODE D’ESSAI'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white font-mono">
                  {formatFCFA(planPricing)} <span className="text-xs font-sans text-slate-300">/ mois</span>
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  {currentTenant?.status === 'trial'
                    ? `Votre période d’essai gratuit prend fin le ${currentTenant?.trialEndDate}. Renouvelez dès maintenant pour garantir l’accès continu à votre caisse et vos données.`
                    : `Votre abonnement est actif et valide jusqu’au ${currentTenant?.subscriptionEndDate}.`}
                </p>
              </div>

              <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                <button
                  onClick={() => setShowRenewModal(true)}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Renouveler Licence SaaS</span>
                </button>
                <span className="text-[11px] text-slate-400">
                  Paiement instantané Wave, OM, MoMo, Moov & Espèces
                </span>
              </div>
            </div>
          </div>

          {/* Quotas & Included Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">QUOTA AGENCES ACTIVÉES</span>
              <p className="font-mono font-bold text-lg text-slate-900">
                {tenantEstablishments.length} / {currentTenant?.planName === 'Starter' ? '1' : currentTenant?.planName === 'Enterprise' ? 'Illimitées' : '3'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">COMPTES EMPLOYÉS & RBAC</span>
              <p className="font-mono font-bold text-lg text-slate-900">
                {state.employees.filter((e) => e.tenantId === state.currentTenantId).length} utilisateurs
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">SUPPORT ÉDITEUR B2B</span>
              <p className="font-bold text-slate-900">Prioritaire 7j/7 (Abidjan)</p>
            </div>
          </div>

          {/* SaaS Invoices History Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Historique des Factures & Reçus SaaS</h4>
                <p className="text-[11px] text-slate-500">
                  Justificatifs comptables des règlements d'abonnement au service Mon Pressing Pro.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Facture N°</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Période Couverte</th>
                    <th className="p-3">Mode de Règlement</th>
                    <th className="p-3">Montant TTC</th>
                    <th className="p-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {tenantSaaSInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="p-3 text-slate-600">{inv.date}</td>
                      <td className="p-3 text-slate-800 font-medium">
                        {inv.periodStart} au {inv.periodEnd} ({inv.months} mois)
                      </td>
                      <td className="p-3">
                        <span className="capitalize font-mono text-[11px] font-semibold text-slate-700">
                          {PAYMENT_METHOD_CONFIG[inv.paymentMethod]?.label.split('(')[0] || inv.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">{formatFCFA(inv.amount)}</td>
                      <td className="p-3">
                        <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ACQUITTÉE ✓
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE & RECEIPT SETTINGS */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nom commercial de l'entreprise</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Téléphone de contact principal</label>
              <input
                type="text"
                required
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Ville</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Adresse Siège Social</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Entête du ticket de caisse thermique</label>
            <textarea
              rows={2}
              value={receiptHeader}
              onChange={(e) => setReceiptHeader(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Conditions & Pied de ticket</label>
            <textarea
              rows={2}
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            {savedSuccess && (
              <span className="text-emerald-700 font-semibold text-xs animate-in fade-in">
                ✓ Modifications enregistrées avec succès !
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
            >
              Enregistrer les paramètres
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: ESTABLISHMENTS */}
      {activeTab === 'establishments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Gérez vos différentes agences, boutiques et ateliers satellites.
            </p>
            <button
              onClick={() => setShowAddEstModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Ajouter une Agence</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenantEstablishments.map((est) => (
              <div
                key={est.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{est.name}</h4>
                    <p className="text-[11px] text-slate-500">{est.city}</p>
                  </div>
                  {est.isMain && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      SIÈGE PRINCIPAL
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-[11px] text-slate-600">
                  <p>📍 {est.address}</p>
                  <p className="font-mono">📞 {est.phone}</p>
                  <p className="font-mono text-slate-400">Code: {est.code}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SERVICES & TARIFS */}
      {activeTab === 'tarifs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Catalogue officiel des prestations de nettoyage, repassage et blanchisserie.
            </p>
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Ajouter une Prestation</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Prestation</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Tarif Standard</th>
                  <th className="p-3">Tarif Express</th>
                  <th className="p-3">Délai Estimé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tenantServices.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">
                      {srv.name}
                      {srv.description && (
                        <p className="text-[10px] text-slate-400 font-normal">{srv.description}</p>
                      )}
                    </td>
                    <td className="p-3 text-slate-600">{srv.category}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{formatFCFA(srv.priceStandard)}</td>
                    <td className="p-3 font-mono font-bold text-amber-700">{formatFCFA(srv.priceExpress)}</td>
                    <td className="p-3 text-slate-500 font-mono">~{srv.estimatedProcessingHours} heures</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: UI & THEMES */}
      {activeTab === 'ui' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-500" />
              Personnalisation de l'Interface & Expérience Utilisateur
            </h3>
            <p className="text-slate-500 mt-1">
              Adaptez le style visuel de l'application selon votre charte graphique et la disposition de votre matériel en boutique.
            </p>
          </div>

          {/* Themes Grid */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3">
              1. Palette de Couleurs & Thème
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'amber', name: 'Ambre & Ardoise', desc: 'Prestige & Signature', color: 'bg-amber-500' },
                { id: 'sapphire', name: 'Saphir Clean Lab', desc: 'Bleu cobalt moderne', color: 'bg-sky-500' },
                { id: 'emerald', name: 'Émeraude & Ivoire', desc: 'Nature & Écologie', color: 'bg-emerald-500' },
                { id: 'midnight', name: 'Midnight Prestige', desc: 'OLED Sombre immersif', color: 'bg-purple-500' },
              ].map((th) => {
                const isSelected = (state.uiTheme || 'amber') === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => setUITheme(th.id as UITheme)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-3.5 h-3.5 rounded-full ${th.color}`} />
                      <span className="font-bold">{th.name}</span>
                    </div>
                    <p className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {th.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Density Mode */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3">
              2. Mode d'Affichage & Densité
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              <button
                type="button"
                onClick={() => setDensity('comfortable')}
                className={`p-3 rounded-xl border flex items-center gap-3 text-left transition cursor-pointer ${
                  (state.density || 'comfortable') === 'comfortable'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Monitor className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="font-bold">Mode Bureau Confort</p>
                  <p className="text-[10px] text-slate-400">Pour grand écran et gestion administrative</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={`p-3 rounded-xl border flex items-center gap-3 text-left transition cursor-pointer ${
                  state.density === 'compact'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <p className="font-bold">Mode Caisse Tactile</p>
                  <p className="text-[10px] text-slate-400">Gros boutons pour écran tactile de comptoir</p>
                </div>
              </button>
            </div>
          </div>

          {/* Audio Synthesizer */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3">
              3. Retours Sonores de Caisse (Web Audio)
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-xl">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  state.soundEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {state.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-bold text-slate-900">Bips et Carillons Tactiles</p>
                  <p className="text-[11px] text-slate-500">
                    Bip au scan/sélection d'article, carillon lors du paiement Mobile Money / Espèces
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => soundFX.playCashChime()}
                  className="px-2.5 py-1 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded font-semibold text-xs cursor-pointer"
                >
                  Tester le son
                </button>
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                    state.soundEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {state.soundEnabled ? 'Activé' : 'Désactivé'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY & PASSWORDS */}
      {activeTab === 'security' && (
        <div className="space-y-6 text-xs">
          {passSavedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passSavedMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Admin Password Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Crown className="w-4 h-4 text-purple-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Administrateur (Propriétaire)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Accès complet SaaS & Direction
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Mot de passe Administrateur
                  </label>
                  <input
                    type="password"
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Personnalisé et modifiable à tout moment
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateAdminPassword(newAdminPass);
                    setPassSavedMsg('Mot de passe Administrateur mis à jour avec succès.');
                    setTimeout(() => setPassSavedMsg(''), 4000);
                  }}
                  className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg transition cursor-pointer"
                >
                  Enregistrer Admin
                </button>
              </div>
            </div>

            {/* Gerant Password Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Lock className="w-4 h-4 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Gérant d'Agence
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Direction d'exploitation & équipe
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Mot de passe Gérant
                  </label>
                  <input
                    type="password"
                    value={newGerantPass}
                    onChange={(e) => setNewGerantPass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Personnalisé et modifiable à tout moment
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateGerantPassword(newGerantPass);
                    setPassSavedMsg('Mot de passe Gérant mis à jour avec succès.');
                    setTimeout(() => setPassSavedMsg(''), 4000);
                  }}
                  className="w-full py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg transition cursor-pointer"
                >
                  Enregistrer Gérant
                </button>
              </div>
            </div>

            {/* Editor Password & Branding Card */}
            <div className="bg-slate-900 text-white rounded-xl border border-blue-900/60 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <KeyRound className="w-4 h-4 text-sky-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Accès Éditeur Concepteur AGB
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Déverrouillage SaaS Super Admin
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Mot de passe Éditeur
                  </label>
                  <input
                    type="password"
                    value={newEditorPass}
                    onChange={(e) => setNewEditorPass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 text-white rounded-lg font-mono text-sm focus:border-blue-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateEditorPassword(newEditorPass);
                    setPassSavedMsg('Mot de passe Éditeur AGB mis à jour avec succès.');
                    setTimeout(() => setPassSavedMsg(''), 4000);
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition cursor-pointer"
                >
                  Enregistrer Éditeur
                </button>
              </div>
            </div>
          </div>

          {/* Designer AGB Presentation Card */}
          <div className="bg-slate-950 rounded-2xl border border-blue-900/50 p-6 flex flex-col items-center text-center space-y-4">
            <AgbLogo size="lg" showDetails={true} theme="dark" />
            <div className="max-w-xl text-slate-400 text-xs leading-relaxed">
              Pour toute assistance technique, évolution sur-mesure, déploiement sur serveur dédié ou développement d'applications mobiles compagnon, contactez le concepteur officiel.
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: BACKUP */}
      {activeTab === 'backup' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-600" />
            Sauvegarde & Export des Données de l'Entreprise
          </h3>
          <p className="text-slate-600 leading-relaxed max-w-xl">
            Téléchargez l'intégralité de vos commandes, clients, écritures de caisse et inventaires dans un fichier sécurisé JSON pour archivage local ou migration.
          </p>

          <button
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `MonPressingPro_Backup_${currentTenant?.slug}_${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Télécharger la Sauvegarde Complète (JSON)</span>
          </button>
        </div>
      )}

      {/* MODAL: SAAS RENEWAL VIA MOBILE MONEY */}
      {showRenewModal && currentTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-600" />
                Renouvellement d'Abonnement SaaS B2B
              </h3>
              <p className="text-xs text-slate-500">
                Paiement direct à l'éditeur Mon Pressing Pro Côte d'Ivoire.
              </p>
            </div>

            <form onSubmit={handleExecuteSaaSRenewal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Durée du renouvellement</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { months: 1, label: '1 Mois' },
                    { months: 3, label: '3 Mois (-5%)' },
                    { months: 12, label: '1 An (-15%)' },
                  ].map((opt) => (
                    <button
                      key={opt.months}
                      type="button"
                      onClick={() => setRenewMonths(opt.months)}
                      className={`p-2.5 rounded-lg border text-center font-semibold transition-all ${
                        renewMonths === opt.months
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-600'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mode de règlement SaaS</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['wave', 'orange_money', 'mtn_money', 'moov_money', 'cash'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setRenewMethod(m)}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        renewMethod === m
                          ? 'border-purple-600 bg-purple-600 text-white font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {PAYMENT_METHOD_CONFIG[m].label.split('(')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Formule :</span>
                  <span className="font-semibold text-slate-900">{currentTenant.planName}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-950 pt-1 border-t border-slate-200">
                  <span>TOTAL NET À RÉGLER :</span>
                  <span className="font-mono text-purple-700">{formatFCFA(renewalAmount)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRenewModal(false)}
                  disabled={isProcessingRenew}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isProcessingRenew}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isProcessingRenew ? (
                    <span>Traitement sécurisé du paiement...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-purple-200" />
                      <span>Valider le règlement ({formatFCFA(renewalAmount)})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ESTABLISHMENT */}
      {showAddEstModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Ajouter une nouvelle agence</h3>
            <form onSubmit={handleCreateEst} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Nom de l'agence</label>
                <input
                  type="text"
                  required
                  value={estName}
                  onChange={(e) => setEstName(e.target.value)}
                  placeholder="Ex: Agence Marcory Zone 4"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Code Agence</label>
                  <input
                    type="text"
                    value={estCode}
                    onChange={(e) => setEstCode(e.target.value)}
                    placeholder="Ex: MCY-02"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Ville</label>
                  <input
                    type="text"
                    value={estCity}
                    onChange={(e) => setEstCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Adresse précise</label>
                <input
                  type="text"
                  value={estAddress}
                  onChange={(e) => setEstAddress(e.target.value)}
                  placeholder="Ex: Boulevard de Marseille, près de la banque"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEstModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-semibold"
                >
                  Créer l'agence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SERVICE */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Ajouter une prestation au catalogue</h3>
            <form onSubmit={handleCreateService} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Désignation du vêtement / prestation</label>
                <input
                  type="text"
                  required
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  placeholder="Ex: Robe de soirée avec perles"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Catégorie</label>
                  <select
                    value={srvCategory}
                    onChange={(e) => setSrvCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  >
                    <option value="Vêtements quotidiens">Vêtements quotidiens</option>
                    <option value="Traditionnel / Bazin & Kita">Traditionnel / Bazin & Kita</option>
                    <option value="Costumes & Luxe">Costumes & Luxe</option>
                    <option value="Maison & Blanchisserie">Maison & Blanchisserie</option>
                    <option value="Chaussures & Maroquinerie">Chaussures & Maroquinerie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Délai estimé (heures)</label>
                  <input
                    type="number"
                    value={srvHours}
                    onChange={(e) => setSrvHours(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Prix Standard (FCFA)</label>
                  <input
                    type="number"
                    step={100}
                    required
                    value={srvPriceStd}
                    onChange={(e) => setSrvPriceStd(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Prix Express (FCFA)</label>
                  <input
                    type="number"
                    step={100}
                    value={srvPriceExp}
                    onChange={(e) => setSrvPriceExp(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold text-amber-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-semibold"
                >
                  Ajouter au catalogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
