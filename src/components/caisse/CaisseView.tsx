import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Calculator,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Lock,
  PlusCircle,
  Printer,
  Receipt,
  RotateCcw,
  Sparkles,
  Unlock,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Caisse, PaymentMethod } from '../../types';
import { formatFCFA, PAYMENT_METHOD_CONFIG } from '../../services/store';

export const CaisseView: React.FC = () => {
  const {
    state,
    currentTenant,
    openCaisse,
    closeCaisse,
    addCaisseMovement,
    currentPermissions,
  } = useApp();

  const tenantCaisses = state.caisses.filter((c) => c.tenantId === state.currentTenantId);
  const [selectedCaisseId, setSelectedCaisseId] = useState<string>(tenantCaisses[0]?.id || '');
  const activeCaisse = tenantCaisses.find((c) => c.id === selectedCaisseId) || tenantCaisses[0];

  // Cash count state for closing
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);
  const [b10k, setB10k] = useState<number>(0);
  const [b5k, setB5k] = useState<number>(0);
  const [b2k, setB2k] = useState<number>(0);
  const [b1k, setB1k] = useState<number>(0);
  const [b500, setB500] = useState<number>(0);
  const [p500, setP500] = useState<number>(0);
  const [p200, setP200] = useState<number>(0);
  const [p100, setP100] = useState<number>(0);
  const [p50, setP50] = useState<number>(0);
  const [p25, setP25] = useState<number>(0);
  const [closeNotes, setCloseNotes] = useState<string>('');

  // Cash movement modal
  const [showMovementModal, setShowMovementModal] = useState<boolean>(false);
  const [movType, setMovType] = useState<'in' | 'out'>('in');
  const [movAmount, setMovAmount] = useState<number>(5000);
  const [movReason, setMovReason] = useState<string>('');
  const [movCategory, setMovCategory] = useState<string>('Apport de monnaie');

  // Open caisse state
  const [showOpenModal, setShowOpenModal] = useState<boolean>(false);
  const [openFundAmount, setOpenFundAmount] = useState<number>(50000);

  const totalCalculatedCash =
    b10k * 10000 +
    b5k * 5000 +
    b2k * 2000 +
    b1k * 1000 +
    b500 * 500 +
    p500 * 500 +
    p200 * 200 +
    p100 * 100 +
    p50 * 50 +
    p25 * 25;

  const discrepancy = activeCaisse ? totalCalculatedCash - activeCaisse.currentCashBalance : 0;

  // Payments today
  const tenantPayments = state.clientPayments.filter((p) => p.tenantId === state.currentTenantId);

  const handleExecuteClosing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCaisse) return;

    closeCaisse(activeCaisse.id, totalCalculatedCash, closeNotes);
    setShowCloseModal(false);
    alert(`Caisse clôturée avec succès. Écart constaté: ${discrepancy >= 0 ? '+' : ''}${formatFCFA(discrepancy)}`);
  };

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCaisse || movAmount <= 0) return;

    addCaisseMovement({
      caisseId: activeCaisse.id,
      establishmentId: activeCaisse.establishmentId,
      type: movType,
      category: movCategory,
      amount: movAmount,
      paymentMethod: 'cash',
      recordedByEmployeeId: state.currentUserId,
      recordedByEmployeeName: state.currentUserName,
      reason: movReason || (movType === 'in' ? 'Apport de monnaie' : 'Dépense courante'),
    });

    setShowMovementModal(false);
    setMovReason('');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-500" />
            Gestion de Caisse, Fonds & Clôtures Journalières
          </h2>
          <p className="text-xs text-slate-500">
            Suivi des encaissements en espèces, rapprochement comptable, billets FCFA et rapport Z.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {activeCaisse?.isOpen ? (
            <>
              <button
                onClick={() => setShowMovementModal(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 cursor-pointer"
              >
                + Mouvement Caisse
              </button>
              {currentPermissions.canCloseCaisse && (
                <button
                  onClick={() => setShowCloseModal(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Clôturer la Caisse (Z)</span>
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => setShowOpenModal(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Ouvrir la Caisse</span>
            </button>
          )}
        </div>
      </div>

      {/* Caisse Selector tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tenantCaisses.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCaisseId(c.id)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
              (selectedCaisseId || tenantCaisses[0]?.id) === c.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${c.isOpen ? 'bg-emerald-400' : 'bg-slate-400'}`}
            />
            <span>{c.name}</span>
            <span className="font-mono text-[11px] opacity-80">{formatFCFA(c.currentCashBalance)}</span>
          </button>
        ))}
      </div>

      {/* Caisse KPI Cards */}
      {activeCaisse && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">FOND INITIAL OUVERTURE</span>
            <p className="font-mono font-bold text-lg text-slate-900">
              {formatFCFA(activeCaisse.initialBalance)}
            </p>
            <p className="text-[11px] text-slate-500">Ouvert à {activeCaisse.lastOpenedAt || '08h00'}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-600">TOTAL ENTRÉES ESPÈCES</span>
            <p className="font-mono font-bold text-lg text-emerald-700">
              +{formatFCFA(activeCaisse.totalInToday)}
            </p>
            <p className="text-[11px] text-slate-500">Encaissements de la journée</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-600">TOTAL SORTIES ESPÈCES</span>
            <p className="font-mono font-bold text-lg text-rose-700">
              -{formatFCFA(activeCaisse.totalOutToday)}
            </p>
            <p className="text-[11px] text-slate-500">Dépenses & décaissements</p>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-md space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400">SOLDE THÉORIQUE EN TIROIR</span>
            <p className="font-mono font-bold text-xl text-white">
              {formatFCFA(activeCaisse.currentCashBalance)}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>Statut:</span>
              <span className={`font-bold ${activeCaisse.isOpen ? 'text-emerald-400' : 'text-slate-400'}`}>
                {activeCaisse.isOpen ? 'OUVERTE' : 'CLÔTURÉE'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Transactions / Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-500" />
              Journal des Règlements Clients Enregistrés ({tenantPayments.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Flux financiers perçus via Wave, Orange Money, MTN MoMo, Moov et Espèces.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="p-2.5">Reçu N° / Réf</th>
                <th className="p-2.5">Date & Heure</th>
                <th className="p-2.5">Client & Commande</th>
                <th className="p-2.5">Mode de Paiement</th>
                <th className="p-2.5">Montant Encaissé</th>
                <th className="p-2.5">Caissier</th>
                <th className="p-2.5">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tenantPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Aucun paiement enregistré aujourd'hui.
                  </td>
                </tr>
              ) : (
                tenantPayments.map((p) => {
                  const methodConf = PAYMENT_METHOD_CONFIG[p.paymentMethod];
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-2.5">
                        <span className="font-mono font-bold text-slate-900 block">{p.receiptNumber}</span>
                        <span className="font-mono text-[10px] text-slate-400">{p.transactionReference}</span>
                      </td>
                      <td className="p-2.5 text-slate-600">
                        <span>{p.date}</span>
                        <span className="text-[10px] text-slate-400 block">{p.time}</span>
                      </td>
                      <td className="p-2.5">
                        <span className="font-semibold text-slate-900 block">{p.clientName}</span>
                        <span className="text-slate-500 font-mono text-[11px]">{p.orderNumber}</span>
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${methodConf.badge}`}
                        >
                          {methodConf.label.split('(')[0]}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-slate-900 text-xs">
                        {formatFCFA(p.amount)}
                      </td>
                      <td className="p-2.5 text-slate-600">{p.recordedByEmployeeName}</td>
                      <td className="p-2.5">
                        <span className="text-emerald-700 font-semibold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Validé</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CASH COUNT & CLÔTURE DE CAISSE */}
      {showCloseModal && activeCaisse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                Clôture Journalière de Caisse & Comptage des Espèces
              </h3>
              <p className="text-xs text-slate-500">
                Saisissez le nombre de billets et pièces physiques dans le tiroir-caisse pour calculer l'écart.
              </p>
            </div>

            <form onSubmit={handleExecuteClosing} className="space-y-4 text-xs">
              {/* Billets FCFA */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-slate-500" />
                  Billets de Banque (FCFA)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-600">10 000 FCFA</label>
                    <input
                      type="number"
                      min={0}
                      value={b10k}
                      onChange={(e) => setB10k(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      = {formatFCFA(b10k * 10000)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600">5 000 FCFA</label>
                    <input
                      type="number"
                      min={0}
                      value={b5k}
                      onChange={(e) => setB5k(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      = {formatFCFA(b5k * 5000)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600">2 000 FCFA</label>
                    <input
                      type="number"
                      min={0}
                      value={b2k}
                      onChange={(e) => setB2k(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      = {formatFCFA(b2k * 2000)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600">1 000 FCFA</label>
                    <input
                      type="number"
                      min={0}
                      value={b1k}
                      onChange={(e) => setB1k(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      = {formatFCFA(b1k * 1000)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600">500 FCFA (Billet)</label>
                    <input
                      type="number"
                      min={0}
                      value={b500}
                      onChange={(e) => setB500(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      = {formatFCFA(b500 * 500)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pièces de monnaie FCFA */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs">Pièces de Monnaie (FCFA)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-600">500 F</label>
                    <input
                      type="number"
                      min={0}
                      value={p500}
                      onChange={(e) => setP500(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600">200 F</label>
                    <input
                      type="number"
                      min={0}
                      value={p200}
                      onChange={(e) => setP200(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600">100 F</label>
                    <input
                      type="number"
                      min={0}
                      value={p100}
                      onChange={(e) => setP100(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-600">50 F / 25 F</label>
                    <input
                      type="number"
                      min={0}
                      value={p50}
                      onChange={(e) => setP50(Number(e.target.value))}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Summary Reconciliation Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Solde théorique attendu :</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatFCFA(activeCaisse.currentCashBalance)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm">
                  <span>Espèces recomptées :</span>
                  <span className="font-mono text-emerald-700">{formatFCFA(totalCalculatedCash)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-slate-200 text-xs">
                  <span>ÉCART DE CAISSE CONSTATÉ :</span>
                  <span
                    className={`font-mono text-sm ${
                      discrepancy === 0
                        ? 'text-emerald-700'
                        : discrepancy > 0
                        ? 'text-blue-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {discrepancy >= 0 ? '+' : ''}
                    {formatFCFA(discrepancy)}
                    {discrepancy === 0 && ' (Parfait)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Observations / Justificatif de clôture</label>
                <input
                  type="text"
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  placeholder="Ex: RAS ou Écart de 500F dû au rendu monnaie"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded shadow-xs"
                >
                  Valider la Clôture Définitive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: OUVERTURE DE CAISSE */}
      {showOpenModal && activeCaisse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Unlock className="w-4 h-4 text-emerald-600" />
              Ouverture de la {activeCaisse.name}
            </h3>
            <div className="space-y-2 text-xs">
              <label className="block text-slate-600">Montant du fond de caisse initial (FCFA)</label>
              <input
                type="number"
                min={0}
                step={5000}
                value={openFundAmount}
                onChange={(e) => setOpenFundAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded font-mono font-bold text-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOpenModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  openCaisse(activeCaisse.id, openFundAmount);
                  setShowOpenModal(false);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded"
              >
                Ouvrir la Caisse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MOUVEMENT DE CAISSE */}
      {showMovementModal && activeCaisse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Ajouter un mouvement de caisse</h3>
            <form onSubmit={handleAddMovement} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Type d'opération</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMovType('in');
                      setMovCategory('Apport de monnaie');
                    }}
                    className={`py-1.5 text-xs font-semibold rounded border ${
                      movType === 'in'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    + Entrée d'espèces
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMovType('out');
                      setMovCategory('Petite dépense / Carburant');
                    }}
                    className={`py-1.5 text-xs font-semibold rounded border ${
                      movType === 'out'
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    - Sortie d'espèces
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Montant (FCFA)</label>
                <input
                  type="number"
                  min={100}
                  step={500}
                  required
                  value={movAmount}
                  onChange={(e) => setMovAmount(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Motif / Justificatif</label>
                <input
                  type="text"
                  required
                  value={movReason}
                  onChange={(e) => setMovReason(e.target.value)}
                  placeholder="Ex: Monnaie reçue de la banque ou Achat eau minérale"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
