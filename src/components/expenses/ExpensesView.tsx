import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  PlusCircle,
  Receipt,
  TrendingDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Expense, PaymentMethod } from '../../types';
import { formatFCFA, PAYMENT_METHOD_CONFIG } from '../../services/store';

export const ExpensesView: React.FC = () => {
  const { state, createExpense, currentTenant } = useApp();

  const tenantExpenses = state.expenses.filter((e) => e.tenantId === state.currentTenantId);
  const tenantEstablishments = state.establishments.filter((e) => e.tenantId === state.currentTenantId);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form State
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Fournitures & Produits');
  const [amount, setAmount] = useState<number>(15000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [supplier, setSupplier] = useState('');
  const [establishmentId, setEstablishmentId] = useState(tenantEstablishments[0]?.id || 'est-main');

  const filtered = tenantExpenses.filter((e) => {
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    return true;
  });

  const totalExpenses = tenantExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) return;

    createExpense({
      establishmentId,
      category,
      description: description.trim(),
      amount,
      paymentMethod,
      date: new Date().toISOString().substring(0, 10),
      supplierName: supplier.trim() || undefined,
      recordedByEmployeeId: state.currentUserId,
      recordedByEmployeeName: state.currentUserName,
    });

    setShowModal(false);
    setDescription('');
    setSupplier('');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-500" />
            Dépenses d'Exploitation & Achats Fournisseurs
          </h2>
          <p className="text-xs text-slate-500">
            Factures CIE (électricité), SODECI (eau), loyers, carburant livraison et consommables blanchisserie.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>Saisir une Dépense</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">TOTAL CHARGES ENREGISTRÉES</span>
          <p className="font-mono font-bold text-xl text-rose-700">{formatFCFA(totalExpenses)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">NOMBRE D'OPÉRATIONS</span>
          <p className="font-mono font-bold text-xl text-slate-900">{tenantExpenses.length} factures</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">MOYENNE PAR DÉPENSE</span>
          <p className="font-mono font-bold text-xl text-slate-900">
            {formatFCFA(tenantExpenses.length > 0 ? Math.round(totalExpenses / tenantExpenses.length) : 0)}
          </p>
        </div>
      </div>

      {/* Filter and List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">Livre des Dépenses</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-700"
          >
            <option value="all">Toutes les catégories</option>
            <option value="Fournitures & Produits">Fournitures & Produits</option>
            <option value="Énergie & Eau (CIE/SODECI)">Énergie & Eau (CIE/SODECI)</option>
            <option value="Carburant & Transport">Carburant & Transport</option>
            <option value="Entretien & Maintenance">Entretien & Maintenance</option>
            <option value="Salaires & Rémunérations">Salaires & Rémunérations</option>
            <option value="Loyer & Local">Loyer & Local</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Désignation / Motif</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3">Fournisseur</th>
                <th className="p-3">Mode de Paiement</th>
                <th className="p-3">Montant</th>
                <th className="p-3">Auteur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((exp) => {
                const methodConf = PAYMENT_METHOD_CONFIG[exp.paymentMethod];
                return (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-600">{exp.date}</td>
                    <td className="p-3 font-medium text-slate-900">{exp.description}</td>
                    <td className="p-3 text-slate-600">{exp.category}</td>
                    <td className="p-3 text-slate-500">{exp.supplierName || '—'}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${methodConf.badge}`}
                      >
                        {methodConf.label.split('(')[0]}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-rose-700 text-xs">
                      -{formatFCFA(exp.amount)}
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">{exp.recordedByEmployeeName}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Expense */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Saisir une nouvelle charge d'exploitation</h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Motif / Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Facture CIE Compteur Atelier Novembre"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  >
                    <option value="Fournitures & Produits">Fournitures & Produits</option>
                    <option value="Énergie & Eau (CIE/SODECI)">Énergie & Eau (CIE/SODECI)</option>
                    <option value="Carburant & Transport">Carburant & Transport</option>
                    <option value="Entretien & Maintenance">Entretien & Maintenance</option>
                    <option value="Salaires & Rémunérations">Salaires & Rémunérations</option>
                    <option value="Loyer & Local">Loyer & Local</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Montant (FCFA)</label>
                  <input
                    type="number"
                    min={100}
                    step={500}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Mode de règlement</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  >
                    <option value="wave">Wave CI</option>
                    <option value="orange_money">Orange Money</option>
                    <option value="mtn_money">MTN MoMo</option>
                    <option value="moov_money">Moov Money</option>
                    <option value="cash">Espèces (Caisse)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Fournisseur (optionnel)</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Ex: CIE, TotalEnergies"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  />
                </div>
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
                  className="px-4 py-1.5 bg-slate-900 text-white rounded font-semibold"
                >
                  Enregistrer dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
