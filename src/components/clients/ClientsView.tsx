import React, { useState } from 'react';
import {
  DollarSign,
  Edit2,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Plus,
  QrCode,
  Search,
  Sparkles,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';
import { formatFCFA } from '../../services/store';

export const ClientsView: React.FC = () => {
  const { state, createClient, updateClient, currentTenant } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+225 ');
  const [whatsapp, setWhatsapp] = useState('+225 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const tenantClients = state.clients.filter((c) => c.tenantId === state.currentTenantId);

  const filteredClients = tenantClients.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.clientCode.toLowerCase().includes(q)
    );
  });

  const openCreateModal = () => {
    setEditingClient(null);
    setFirstName('');
    setLastName('');
    setPhone('+225 ');
    setWhatsapp('+225 ');
    setEmail('');
    setAddress('');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFirstName(client.firstName);
    setLastName(client.lastName);
    setPhone(client.phone);
    setWhatsapp(client.whatsapp || client.phone);
    setEmail(client.email || '');
    setAddress(client.address || '');
    setNotes(client.notes || '');
    setShowModal(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone) return;

    if (editingClient) {
      updateClient(editingClient.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim(),
        address: address.trim(),
        notes: notes.trim(),
      });
    } else {
      createClient({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim(),
        address: address.trim(),
        preferredContact: 'whatsapp',
        notes: notes.trim(),
      });
    }
    setShowModal(false);
  };

  const handleOpenWhatsApp = (client: Client) => {
    const p = (client.whatsapp || client.phone).replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Bonjour ${client.firstName},\nVotre pressing ${currentTenant?.companyName} reste à votre entière disposition pour l'entretien soigné de votre linge !`
    );
    window.open(`https://wa.me/${p}?text=${text}`, '_blank');
  };

  const clientOrders = selectedClient
    ? state.orders.filter((o) => o.clientId === selectedClient.id)
    : [];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Répertoire & CRM Clients ({tenantClients.length})
          </h2>
          <p className="text-xs text-slate-500">
            Historique des commandes, fidélité, relances WhatsApp et gestion des soldes débiteurs.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-amber-400" />
          <span>Ajouter un Client</span>
        </button>
      </div>

      {/* Search and Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Client List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, téléphone (+225...) ou code client..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredClients.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Aucun client trouvé.
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedClient?.id === client.id;
                return (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected ? 'bg-amber-50/70 border-l-4 border-l-amber-500' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {client.firstName.substring(0, 1)}
                        {client.lastName.substring(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-xs truncate">
                            {client.firstName} {client.lastName}
                          </h4>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono shrink-0">
                            {client.clientCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5 whitespace-nowrap truncate">
                          📞 {client.phone} {client.whatsapp && client.whatsapp !== client.phone ? `• WA: ${client.whatsapp}` : ''} {client.address ? `• 📍 ${client.address}` : ''}
                        </p>
                        {client.receivedByEmployeeName && (
                          <p className="text-[10px] text-slate-400">
                            Enregistré par : <strong>{client.receivedByEmployeeName}</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-900 font-mono text-xs block">
                        {formatFCFA(client.totalSpent)}
                      </span>
                      {client.outstandingBalance && client.outstandingBalance > 0 ? (
                        <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 block">
                          Reste: {formatFCFA(client.outstandingBalance)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded block">
                          À jour ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Client Details & Order History (5 Cols) */}
        <div className="lg:col-span-5">
          {selectedClient ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 sticky top-20 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                      {selectedClient.clientCode}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">
                      {selectedClient.firstName} {selectedClient.lastName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                    <span>📞 {selectedClient.phone}</span>
                    {selectedClient.whatsapp && selectedClient.whatsapp !== selectedClient.phone && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-emerald-700 font-medium">WA: {selectedClient.whatsapp}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenWhatsApp(selectedClient)}
                    className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                    title="Envoyer message WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(selectedClient)}
                    className="p-2 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Modifier client"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <div>
                  <p className="text-[10px] text-slate-400">Total Dépensé</p>
                  <p className="font-bold text-slate-900 font-mono text-sm">
                    {formatFCFA(selectedClient.totalSpent)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Points Fidélité</p>
                  <p className="font-bold text-amber-600 font-mono text-sm">
                    {selectedClient.loyaltyPoints} pts
                  </p>
                </div>
              </div>

              {selectedClient.address && (
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{selectedClient.address}</span>
                </div>
              )}

              {/* Order History */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span>Historique des commandes ({clientOrders.length})</span>
                </h4>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {clientOrders.length === 0 ? (
                    <p className="text-slate-400 text-[11px]">Aucune commande enregistrée.</p>
                  ) : (
                    clientOrders.map((o) => (
                      <div
                        key={o.id}
                        className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {o.orderNumber}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {o.depositDate} • {o.itemCount} pièce(s)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {formatFCFA(o.totalAmount)}
                          </span>
                          <span className={`text-[10px] block ${o.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-rose-700 font-bold'}`}>
                            {o.paymentStatus === 'paid' ? 'Payé' : `Reste: ${formatFCFA(o.remainingBalance)}`}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              Sélectionnez un client dans la liste pour voir sa fiche détaillée et son historique.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create / Edit Client */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              {editingClient ? 'Modifier la fiche client' : 'Ajouter un nouveau client'}
            </h3>

            <form onSubmit={handleSaveClient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                    placeholder="Ex: Awa"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                    placeholder="Ex: Diallo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Téléphone Principal (obligatoire)</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                  placeholder="+225 07 00 00 00 00"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Numéro WhatsApp (pour alertes retrait)</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                  placeholder="+225 07 00 00 00 00"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Adresse / Commune / Quartier</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  placeholder="Ex: Marcory Zone 4, Rue du 7 Décembre"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Notes ou préférences client</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  placeholder="Ex: Préfère pliage sous sachet plutôt que cintre"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800"
                >
                  {editingClient ? 'Enregistrer' : 'Créer Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
