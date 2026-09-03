import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Package,
  Users,
  Receipt,
  X,
  ArrowRight,
  Sparkles,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatFCFA } from '../../services/store';
import { ActiveTab } from './Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ActiveTab, params?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { state, currentTenant } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tenantOrders = state.orders.filter((o) => o.tenantId === state.currentTenantId);
  const tenantClients = state.clients.filter((c) => c.tenantId === state.currentTenantId);
  const tenantServices = state.services.filter((s) => s.tenantId === state.currentTenantId);

  const cleanQuery = query.trim().toLowerCase();

  const matchedOrders = cleanQuery
    ? tenantOrders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(cleanQuery) ||
          o.clientName.toLowerCase().includes(cleanQuery) ||
          o.clientPhone.includes(cleanQuery) ||
          o.items.some((i) => i.serviceName.toLowerCase().includes(cleanQuery))
      ).slice(0, 5)
    : [];

  const matchedClients = cleanQuery
    ? tenantClients.filter(
        (c) =>
          c.firstName.toLowerCase().includes(cleanQuery) ||
          c.lastName.toLowerCase().includes(cleanQuery) ||
          c.phone.includes(cleanQuery) ||
          c.clientCode.toLowerCase().includes(cleanQuery)
      ).slice(0, 5)
    : [];

  const matchedServices = cleanQuery
    ? tenantServices.filter(
        (s) =>
          s.name.toLowerCase().includes(cleanQuery) ||
          s.category.toLowerCase().includes(cleanQuery)
      ).slice(0, 4)
    : [];

  const hasResults =
    matchedOrders.length > 0 || matchedClients.length > 0 || matchedServices.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une commande, client, téléphone (+225), vêtement..."
            className="flex-1 bg-transparent text-white placeholder-slate-400 text-sm focus:outline-hidden font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded cursor-pointer"
            >
              Effacer
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestions when empty */}
        {!cleanQuery && (
          <div className="p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Accès Rapides & Actions
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => {
                    onNavigate('pos');
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 text-xs font-medium text-amber-400 hover:border-amber-400/50 transition cursor-pointer text-left"
                >
                  <Receipt className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Caisse Tactile POS</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('orders');
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 text-xs font-medium text-sky-400 hover:border-sky-400/50 transition cursor-pointer text-left"
                >
                  <Package className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Pipeline Atelier</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('caisse');
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 text-xs font-medium text-emerald-400 hover:border-emerald-400/50 transition cursor-pointer text-left"
                >
                  <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Gestion Caisse</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('deliveries');
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 text-xs font-medium text-purple-400 hover:border-purple-400/50 transition cursor-pointer text-left"
                >
                  <Truck className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Livraisons</span>
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Dernières Commandes Récentes
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {tenantOrders.slice(0, 4).map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      onNavigate('orders');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400">{ord.orderNumber}</span>
                      <span className="text-slate-300 font-medium">{ord.clientName}</span>
                      <span className="text-[10px] text-slate-400">({ord.itemCount} art.)</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-white">{formatFCFA(ord.totalAmount)}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {cleanQuery && (
          <div className="p-4 max-h-96 overflow-y-auto space-y-4">
            {!hasResults && (
              <div className="py-8 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                <p className="text-sm font-medium">Aucun résultat trouvé pour « {query} »</p>
                <p className="text-xs text-slate-400 mt-1">
                  Vérifiez le numéro de ticket, le numéro de téléphone ou le nom du client.
                </p>
              </div>
            )}

            {/* Orders matching */}
            {matchedOrders.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Commandes ({matchedOrders.length})
                </p>
                <div className="space-y-1.5">
                  {matchedOrders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => {
                        onNavigate('orders');
                        onClose();
                      }}
                      className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 flex items-center justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400 text-xs">
                            {ord.orderNumber}
                          </span>
                          <span className="font-medium text-white text-xs">{ord.clientName}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                            {ord.establishmentName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {ord.items.map((i) => `${i.quantity}x ${i.serviceName}`).join(', ')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-xs text-white">
                          {formatFCFA(ord.totalAmount)}
                        </p>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                            ord.paymentStatus === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {ord.paymentStatus === 'paid' ? 'Soldé' : 'Solde restant'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clients matching */}
            {matchedClients.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Clients ({matchedClients.length})
                </p>
                <div className="space-y-1.5">
                  {matchedClients.map((cli) => (
                    <div
                      key={cli.id}
                      onClick={() => {
                        onNavigate('clients');
                        onClose();
                      }}
                      className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                          {cli.firstName[0]}
                          {cli.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-white text-xs">
                            {cli.firstName} {cli.lastName}{' '}
                            <span className="font-mono text-slate-400 text-[10px]">
                              ({cli.clientCode})
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {cli.phone}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-300">
                          {cli.totalOrders} commandes
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {formatFCFA(cli.totalSpent)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services / Tarifs */}
            {matchedServices.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Prestations & Tarifs (
                  {matchedServices.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchedServices.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => {
                        onNavigate('pos');
                        onClose();
                      }}
                      className="p-2 rounded-lg bg-slate-800/40 border border-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-800"
                    >
                      <div>
                        <p className="text-xs font-medium text-white">{srv.name}</p>
                        <p className="text-[10px] text-slate-400">{srv.category}</p>
                      </div>
                      <div className="text-right font-mono text-xs font-bold text-emerald-400">
                        {formatFCFA(srv.priceStandard)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Hint */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Naviguer avec les flèches ou cliquer sur un résultat</span>
          <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            ESC pour fermer
          </span>
        </div>
      </div>
    </div>
  );
};
