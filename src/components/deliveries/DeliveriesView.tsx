import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  Navigation,
  Package,
  Phone,
  Truck,
  User,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeliveryOrder, DeliveryStatus } from '../../types';
import { formatFCFA } from '../../services/store';

export const DeliveriesView: React.FC = () => {
  const { state, updateDeliveryStatus, currentTenant } = useApp();

  const tenantDeliveries = state.deliveries.filter((d) => d.tenantId === state.currentTenantId);
  const tenantDrivers = state.employees.filter(
    (e) => e.tenantId === state.currentTenantId && (e.jobTitle.toLowerCase().includes('livreur') || e.jobTitle.toLowerCase().includes('chauffeur'))
  );

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOrder | null>(null);

  const filtered = tenantDeliveries.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    return true;
  });

  const handleAdvanceDelivery = (deliveryId: string, current: DeliveryStatus) => {
    let next: DeliveryStatus = 'assigned';
    if (current === 'to_deliver') next = 'assigned';
    else if (current === 'assigned') next = 'in_transit';
    else if (current === 'in_transit') next = 'delivered';

    updateDeliveryStatus(deliveryId, next, `Statut mis à jour vers ${next}`);
  };

  const handleOpenWhatsAppClient = (del: DeliveryOrder) => {
    const phone = del.clientPhone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Bonjour ${del.clientName},\nVotre livreur de ${currentTenant?.companyName} est en route pour vous remettre vos vêtements propres (${del.orderNumber}) à l'adresse suivante:\n${del.deliveryAddress}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-500" />
            Tournées de Livraison & Coursiers ({tenantDeliveries.length})
          </h2>
          <p className="text-xs text-slate-500">
            Affectation des chauffeurs, itinéraire à Abidjan, encaissement au domicile et preuve de livraison.
          </p>
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
        >
          <option value="all">Toutes les livraisons</option>
          <option value="to_deliver">À planifier</option>
          <option value="assigned">Assignée au livreur</option>
          <option value="in_transit">En cours de livraison (Sur route)</option>
          <option value="delivered">Livrées avec succès</option>
        </select>
      </div>

      {/* Deliveries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((del) => (
          <div
            key={del.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-slate-300 transition-all text-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono font-bold text-slate-900 text-xs">{del.orderNumber}</span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">{del.clientName}</h4>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  del.status === 'delivered'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : del.status === 'in_transit'
                    ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {del.status === 'to_deliver'
                  ? 'À PLANIFIER'
                  : del.status === 'assigned'
                  ? 'ASSIGNÉE'
                  : del.status === 'in_transit'
                  ? 'EN COURS 🛵'
                  : 'LIVRÉE ✓'}
              </span>
            </div>

            {/* Address */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center justify-between gap-2 text-slate-700">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="font-medium truncate">{del.deliveryAddress}</span>
                </div>
                <span className="text-[11px] text-slate-600 font-mono shrink-0">📞 {del.clientPhone}</span>
              </div>
            </div>

            {/* Driver & Schedule */}
            <div className="space-y-1 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Livreur affecté:</span>
                <span className="font-semibold text-slate-900">
                  {del.driverName || 'Non assigné'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Créneau prévu:</span>
                <span className="font-medium text-slate-800">{del.scheduledDate} ({del.scheduledTimeSlot})</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-slate-100">
                <span>Montant à encaisser sur place:</span>
                <span className={`font-mono ${del.amountToCollectOnDelivery > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {del.amountToCollectOnDelivery > 0
                    ? formatFCFA(del.amountToCollectOnDelivery)
                    : '0 FCFA (Déjà réglé)'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => handleOpenWhatsAppClient(del)}
                className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp</span>
              </button>

              {del.status !== 'delivered' && (
                <button
                  onClick={() => handleAdvanceDelivery(del.id, del.status)}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>
                    {del.status === 'to_deliver'
                      ? 'Assigner'
                      : del.status === 'assigned'
                      ? 'Démarrer course'
                      : 'Valider livraison'}
                  </span>
                  <CheckCircle2 className="w-3 h-3 text-amber-400" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
