import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Package,
  QrCode,
  Search,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { formatFCFA, ORDER_STATUS_CONFIG } from '../../services/store';
import { AppIconBadge } from './AppIconBadge';

interface PublicTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
}

export const PublicTrackerModal: React.FC<PublicTrackerModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber = '',
}) => {
  const { state } = useApp();
  const [searchRef, setSearchRef] = useState<string>(initialOrderNumber || 'MPP-2026-0842');
  const [foundOrder, setFoundOrder] = useState<Order | null>(() => {
    return state.orders.find((o) => o.orderNumber.toLowerCase() === (initialOrderNumber || 'MPP-2026-0842').toLowerCase()) || state.orders[0] || null;
  });
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const target = state.orders.find(
      (o) =>
        o.orderNumber.toLowerCase().includes(searchRef.trim().toLowerCase()) ||
        o.clientPhone.includes(searchRef.trim())
    );

    if (target) {
      setFoundOrder(target);
    } else {
      setError('Aucun ticket trouvé avec cette référence ou ce numéro de téléphone.');
    }
  };

  const stepsList = [
    { key: 'deposited', label: 'Déposée', desc: 'Enregistrement en boutique' },
    { key: 'sorting', label: 'Tri & Marquage', desc: 'Inspection textile' },
    { key: 'washing', label: 'En Lavage', desc: 'Nettoyage & détachage' },
    { key: 'drying', label: 'En Séchage', desc: 'Séchage doux' },
    { key: 'ironing', label: 'En Repassage', desc: 'Mise sous forme vapeur' },
    { key: 'quality_check', label: 'Contrôle', desc: 'Vérification finitions' },
    { key: 'ready', label: 'Prête', desc: 'Disponible en agence' },
    { key: 'delivered', label: 'Retirée / Livrée', desc: 'Remise au client' },
  ];

  const currentStepIndex = foundOrder
    ? stepsList.findIndex((s) => s.key === foundOrder.status)
    : -1;

  const tenantOfOrder = state.tenants.find((t) => t.id === foundOrder?.tenantId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <AppIconBadge size="sm" rounded="lg" />
            <div>
              <h3 className="font-semibold text-sm">Portail Client — Suivi de Linge en Direct</h3>
              <p className="text-[11px] text-slate-300">
                Consultez en temps réel l'état d'avancement de votre traitement textile.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                placeholder="Entrez votre N° de ticket (ex: MPP-2026-0842) ou téléphone"
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Rechercher
            </button>
          </form>
          {error && <p className="text-xs text-rose-600 mt-2 font-medium">{error}</p>}
        </div>

        {/* Order Details Body */}
        {foundOrder ? (
          <div className="p-5 space-y-5 text-xs">
            {/* Top Status Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">RÉFÉRENCE COMMANDE</span>
                  <h4 className="font-mono font-bold text-base text-slate-900">{foundOrder.orderNumber}</h4>
                  <p className="text-xs text-slate-600 font-medium">{tenantOfOrder?.companyName} • {foundOrder.establishmentName}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                      ORDER_STATUS_CONFIG[foundOrder.status].bg
                    } ${ORDER_STATUS_CONFIG[foundOrder.status].text} ${
                      ORDER_STATUS_CONFIG[foundOrder.status].border
                    }`}
                  >
                    {ORDER_STATUS_CONFIG[foundOrder.status].label}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Prévu le: <span className="font-semibold text-slate-800">{foundOrder.promisedPickupDate}</span>
                  </p>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="pt-2">
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-center">
                  {stepsList.map((step, idx) => {
                    const isDone = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;
                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                            isCurrent
                              ? 'bg-amber-500 text-white ring-4 ring-amber-100 scale-110 shadow-xs'
                              : isDone
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <span className={`text-[9px] mt-1 line-clamp-1 font-medium ${isCurrent ? 'text-amber-700 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Articles Details */}
            <div className="space-y-2">
              <h5 className="font-semibold text-slate-800 text-xs flex items-center justify-between">
                <span>Détail des pièces confiées ({foundOrder.itemCount} articles)</span>
                <span className="font-mono text-slate-600 font-normal">
                  Total: {formatFCFA(foundOrder.totalAmount)}
                </span>
              </h5>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-44 overflow-y-auto">
                {foundOrder.items.map((item, idx) => (
                  <div key={item.id || idx} className="p-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {item.quantity}x {item.serviceName}
                      </p>
                      {item.color && (
                        <p className="text-[11px] text-slate-500">
                          Couleur: {item.color} {item.brand ? `• ${item.brand}` : ''}
                        </p>
                      )}
                      {item.issues && item.issues.length > 0 && (
                        <p className="text-[10px] text-amber-700 font-medium">
                          Note: {item.issues.join(', ')}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-slate-800 font-mono">
                      {formatFCFA(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between border border-slate-200">
              <div>
                <p className="text-[11px] text-slate-500">Statut Financier</p>
                <p className="font-bold text-slate-800">
                  {foundOrder.paymentStatus === 'paid' ? (
                    <span className="text-emerald-700">✓ Entièrement Réglé</span>
                  ) : (
                    <span className="text-rose-700">
                      Reste à régler: {formatFCFA(foundOrder.remainingBalance)}
                    </span>
                  )}
                </p>
              </div>
              {foundOrder.deliveryRequested && (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                    <Truck className="w-3 h-3" />
                    <span>Livraison à domicile</span>
                  </span>
                </div>
              )}
            </div>

            {/* Timeline history */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-700">Historique des étapes</p>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {foundOrder.statusHistory.map((h, i) => (
                  <div key={i} className="text-[11px] flex items-start justify-between text-slate-600 bg-white p-2 rounded border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-800">
                        {ORDER_STATUS_CONFIG[h.status]?.label || h.status}
                      </span>
                      {h.notes && <span className="text-slate-500 ml-1.5">— {h.notes}</span>}
                    </div>
                    <span className="text-slate-400 shrink-0 font-mono text-[10px]">{h.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            Veuillez entrer une référence de commande pour afficher le statut.
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            Besoin d'aide ? Contactez directement votre pressing au <span className="font-semibold text-slate-800">{tenantOfOrder?.ownerPhone || '+225 07 08 12 34 56'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
