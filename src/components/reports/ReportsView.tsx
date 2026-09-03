import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  PieChart,
  Printer,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatFCFA, PAYMENT_METHOD_CONFIG } from '../../services/store';

export const ReportsView: React.FC = () => {
  const { state, currentTenant, currentPermissions } = useApp();

  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'daily_interventions' | 'methods'>('overview');

  const now = new Date();
  const todayStr = now.toISOString().substring(0, 10);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
  const currentMonthStr = todayStr.substring(0, 7);
  const currentYearStr = todayStr.substring(0, 4);

  // Helper date checker
  const isInPeriod = (dateStr?: string) => {
    if (!dateStr) return true;
    const cleanDate = dateStr.substring(0, 10);
    if (period === 'today') return cleanDate === todayStr;
    if (period === 'week') return cleanDate >= sevenDaysAgo;
    if (period === 'month') return cleanDate.startsWith(currentMonthStr);
    if (period === 'year') return cleanDate.startsWith(currentYearStr);
    return true;
  };

  // Strictly filtered data
  const tenantOrders = state.orders.filter(
    (o) => o.tenantId === state.currentTenantId && isInPeriod(o.depositDate)
  );

  const tenantPayments = state.clientPayments.filter(
    (p) => p.tenantId === state.currentTenantId && isInPeriod(p.paidAt)
  );

  const tenantExpenses = state.expenses.filter(
    (e) => e.tenantId === state.currentTenantId && isInPeriod(e.date)
  );

  const tenantCaisseMovements = state.caisseMovements.filter(
    (m) => m.tenantId === state.currentTenantId && isInPeriod(m.createdAt)
  );

  const tenantAuditLogs = state.auditLogs.filter(
    (l) => l.tenantId === state.currentTenantId && isInPeriod(l.timestamp)
  );

  const totalRevenue = tenantPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = tenantExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netEstimatedProfit = totalRevenue - totalExpenses;
  const totalPiecesCleaned = tenantOrders.reduce((sum, o) => sum + o.itemCount, 0);

  // Breakdown by payment methods for current filtered period
  const paymentMethodStats: { [key: string]: number } = {
    wave: 0,
    orange_money: 0,
    mtn_money: 0,
    moov_money: 0,
    cash: 0,
  };
  tenantPayments.forEach((p) => {
    paymentMethodStats[p.paymentMethod] = (paymentMethodStats[p.paymentMethod] || 0) + p.amount;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            Rapports Financiers & Suivi Quotidien des Interventions
          </h2>
          <p className="text-xs text-slate-500">
            Traçabilité financière exhaustive de toutes les opérations : du Gérant jusqu'aux employés de comptoir et d'atelier.
          </p>
        </div>

        {/* Period Selector (Strict filtering) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {(['today', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer capitalize font-bold text-xs ${
                period === p ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p === 'today' ? "Aujourd'hui" : p === 'week' ? '7 Jours' : p === 'month' ? 'Ce Mois' : 'Cette Année'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">ENCAISSEMENTS CLIENTS</span>
          <p className="font-mono font-bold text-xl text-emerald-700">{formatFCFA(totalRevenue)}</p>
          <p className="text-[11px] text-slate-500">{tenantPayments.length} règlement(s) perçu(s)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">DÉPENSES & SORTIES DE CAISSE</span>
          <p className="font-mono font-bold text-xl text-rose-700">-{formatFCFA(totalExpenses)}</p>
          <p className="text-[11px] text-slate-500">{tenantExpenses.length} charge(s) enregistrée(s)</p>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-md space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-400">BÉNÉFICE NET ESTIMÉ</span>
          <p className="font-mono font-bold text-xl text-amber-300">
            {formatFCFA(netEstimatedProfit)}
          </p>
          <p className="text-[11px] text-slate-300">
            Marge opérationnelle: {totalRevenue > 0 ? Math.round((netEstimatedProfit / totalRevenue) * 100) : 0}%
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">VÊTEMENTS & COMMANDE(S)</span>
          <p className="font-mono font-bold text-xl text-slate-900">{totalPiecesCleaned} pièce(s)</p>
          <p className="text-[11px] text-slate-500">{tenantOrders.length} dépôt(s) sur cette période</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'overview'
              ? 'border-slate-900 text-slate-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Synthèse & Canaux de Paiement</span>
        </button>

        <button
          onClick={() => setActiveSubTab('daily_interventions')}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'daily_interventions'
              ? 'border-amber-600 text-amber-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4 text-amber-600" />
          <span>Rapport Journalier des Interventions (Gérant → Employés)</span>
          <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-mono text-[10px]">
            {tenantPayments.length + tenantExpenses.length + tenantAuditLogs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & PAYMENT CHANNELS */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Ventilation des Paiements Encaissés</span>
              <span className="font-mono text-slate-900 font-bold">{formatFCFA(totalRevenue)}</span>
            </h3>

            <div className="space-y-3">
              {Object.entries(paymentMethodStats).map(([method, amount]) => {
                const conf = PAYMENT_METHOD_CONFIG[method as any] || { label: method };
                const percent = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;

                return (
                  <div key={method} className="space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-800 font-semibold">{conf.label.split('(')[0]}</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatFCFA(amount)} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          method === 'wave'
                            ? 'bg-sky-500'
                            : method === 'orange_money'
                            ? 'bg-orange-500'
                            : method === 'mtn_money'
                            ? 'bg-yellow-500'
                            : method === 'moov_money'
                            ? 'bg-blue-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Clients by Revenue */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Top Clients du Pressing</h3>

            <div className="divide-y divide-slate-100">
              {state.clients
                .filter((c) => c.tenantId === state.currentTenantId)
                .sort((a, b) => b.totalSpent - a.totalSpent)
                .slice(0, 5)
                .map((c, idx) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {c.firstName} {c.lastName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {c.phone} • {c.orderCount || c.totalOrders || 0} commande(s)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 block">
                        {formatFCFA(c.totalSpent)}
                      </span>
                      <span className="text-[10px] text-amber-600 font-medium">
                        {c.loyaltyPoints} pts
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DAILY INTERVENTIONS & FINANCIAL LOGS (MANAGER DOWN TO EMPLOYEES) */}
      {activeSubTab === 'daily_interventions' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Contrôle Financier & Suivi Hiérarchique pour l'Administrateur</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Ce journal regroupe toutes les transactions financières (encaissements, décaissements, mouvements de caisse) ainsi que les validations de traitement effectuées par le Gérant et l'ensemble des employés.
              </p>
            </div>
          </div>

          {/* Combined Financial Actions Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs">
                Registre des Opérations & Flux Financiers ({period === 'today' ? "Aujourd'hui" : period})
              </h4>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3 h-3" />
                <span>Imprimer le Rapport</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Horodatage</th>
                    <th className="p-3">Intervenant / Rôle</th>
                    <th className="p-3">Nature de l'Opération</th>
                    <th className="p-3">Référence / Tiers</th>
                    <th className="p-3 text-right">Montant (FCFA)</th>
                    <th className="p-3 text-right">Impact Caisse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {/* Encaissements */}
                  {tenantPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-500 text-[11px]">{p.paidAt}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">
                          {p.recordedByEmployeeName || 'Agent d’Accueil'}
                        </span>
                        <span className="text-[10px] text-slate-400">Réceptionniste / Caisse</span>
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ENCAISSEMENT VENTE
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Via {PAYMENT_METHOD_CONFIG[p.paymentMethod]?.label.split('(')[0]}
                        </span>
                      </td>
                      <td className="p-3 font-mono">
                        <span className="font-bold text-slate-900 block">{p.orderNumber}</span>
                        <span className="text-[10px] text-slate-500">{p.clientName}</span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">
                        +{formatFCFA(p.amount)}
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-emerald-700 font-bold text-[10px]">CRÉDIT (+)</span>
                      </td>
                    </tr>
                  ))}

                  {/* Dépenses / Charges */}
                  {tenantExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-500 text-[11px]">{exp.date}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">
                          {exp.recordedByUserName || 'Gérant Pressing'}
                        </span>
                        <span className="text-[10px] text-slate-400">Validation Gérance</span>
                      </td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          DÉPENSE / CHARGE
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{exp.category}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-900 block">{exp.title}</span>
                        {exp.beneficiary && (
                          <span className="text-[10px] text-slate-500">Bénéficiaire : {exp.beneficiary}</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-700">
                        -{formatFCFA(exp.amount)}
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-rose-700 font-bold text-[10px]">DÉBIT (-)</span>
                      </td>
                    </tr>
                  ))}

                  {tenantPayments.length === 0 && tenantExpenses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                        Aucun flux financier enregistré pour la période sélectionnée ({period}).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
