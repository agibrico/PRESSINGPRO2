import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, DollarSign, Smartphone, User, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, PaymentMethod, PaymentStatus } from '../../types';
import { formatFCFA, PAYMENT_METHOD_CONFIG } from '../../services/store';

interface PaymentModalProps {
  order: Order | null;
  onClose: () => void;
  onConfirmPayment: (paymentData: {
    orderId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionReference?: string;
    notes?: string;
    isCashVerified?: boolean;
  }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ order, onClose, onConfirmPayment }) => {
  if (!order) return null;

  const initialAmount = (order.remainingBalance !== undefined && order.remainingBalance > 0)
    ? order.remainingBalance
    : (order.totalAmount || 0);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('wave');
  const [amount, setAmount] = useState<number>(initialAmount);
  const [customRef, setCustomRef] = useState<string>('');
  const [cashVerified, setCashVerified] = useState<boolean>(true);
  const [payerPhone, setPayerPhone] = useState<string>(order.clientPhone || '');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [simulatedMomoStep, setSimulatedMomoStep] = useState<'idle' | 'waiting_push' | 'success'>('idle');

  // Synchronize when order changes
  useEffect(() => {
    if (order) {
      const remaining = (order.remainingBalance !== undefined && order.remainingBalance > 0)
        ? order.remainingBalance
        : (order.totalAmount || 0);
      setAmount(remaining);
      setPayerPhone(order.clientPhone || '');
    }
  }, [order]);

  const remaining = order.remainingBalance ?? 0;
  const total = order.totalAmount ?? 0;
  const paid = order.paidAmount ?? 0;

  const handleQuickAmount = (ratio: number) => {
    if (ratio === 1) {
      setAmount(remaining);
    } else {
      setAmount(Math.round((remaining * ratio) / 500) * 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !order) return;

    if (selectedMethod === 'cash') {
      onConfirmPayment({
        orderId: order.id,
        amount,
        paymentMethod: 'cash',
        transactionReference: `CASH-${Date.now().toString().substring(7)}`,
        notes: `Règlement espèces en caisse pour commande ${order.orderNumber}`,
        isCashVerified: cashVerified,
      });
      confetti({ particleCount: 50, spread: 60 });
      onClose();
      return;
    }

    // Simulate real Mobile Money USSD / Push notification prompt
    setIsProcessing(true);
    setSimulatedMomoStep('waiting_push');

    setTimeout(() => {
      setSimulatedMomoStep('success');
      confetti({ particleCount: 70, spread: 70 });
      setTimeout(() => {
        onConfirmPayment({
          orderId: order.id,
          amount,
          paymentMethod: selectedMethod,
          transactionReference: customRef || `${selectedMethod.toUpperCase()}-CI-${Math.floor(100000 + Math.random() * 900000)}`,
          notes: `Règlement ${PAYMENT_METHOD_CONFIG[selectedMethod].label} initié vers ${payerPhone}`,
          isCashVerified: true,
        });
        onClose();
      }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Encaisser un règlement</h3>
            <p className="text-xs text-slate-500">
              Commande <span className="font-mono font-medium text-slate-700">{order.orderNumber}</span> • {order.clientName}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-slate-500 text-[10px]">Total Commande</p>
              <p className="font-semibold text-slate-800 text-xs">{formatFCFA(total)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px]">Déjà Payé</p>
              <p className="font-semibold text-emerald-600 text-xs">{formatFCFA(paid)}</p>
            </div>
            <div className="border-l border-slate-200 pl-2">
              <p className="text-slate-500 text-[10px]">Reste Dû</p>
              <p className="font-bold text-rose-600 text-xs">{formatFCFA(remaining)}</p>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="block font-medium text-slate-700">Montant à encaisser (FCFA)</label>
            <div className="relative">
              <input
                type="number"
                min={100}
                max={remaining > 0 ? remaining : total}
                step={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full text-lg font-bold text-slate-900 pl-3 pr-16 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                required
              />
              <span className="absolute right-3 top-2.5 font-semibold text-slate-400 text-xs">FCFA</span>
            </div>
            {remaining > 0 && (
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickAmount(1)}
                  className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition-colors"
                >
                  Solde total ({formatFCFA(remaining)})
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAmount(0.5)}
                  className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition-colors"
                >
                  Acompte 50%
                </button>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="block font-medium text-slate-700">Mode de règlement</label>
            <div className="grid grid-cols-2 gap-2">
              {(['wave', 'orange_money', 'mtn_money', 'moov_money', 'cash'] as PaymentMethod[]).map((method) => {
                const conf = PAYMENT_METHOD_CONFIG[method];
                const isSelected = selectedMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSelectedMethod(method)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        method === 'wave'
                          ? 'bg-sky-400'
                          : method === 'orange_money'
                          ? 'bg-orange-400'
                          : method === 'mtn_money'
                          ? 'bg-yellow-400'
                          : method === 'moov_money'
                          ? 'bg-blue-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span className="truncate text-xs">{conf.label.split('(')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Money Details */}
          {selectedMethod !== 'cash' && (
            <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                <span>Validation {PAYMENT_METHOD_CONFIG[selectedMethod].label}</span>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Numéro du payeur</label>
                <input
                  type="text"
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  placeholder="+225 07 00 00 00 00"
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Référence de transaction (ou générée automatiquement)
                </label>
                <input
                  type="text"
                  value={customRef}
                  onChange={(e) => setCustomRef(e.target.value)}
                  placeholder={`Ex: ${selectedMethod.toUpperCase()}-CI-99812`}
                  className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>
          )}

          {/* Cash Validation Checkbox */}
          {selectedMethod === 'cash' && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cash-verify"
                  checked={cashVerified}
                  onChange={(e) => setCashVerified(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="cash-verify" className="font-medium text-emerald-900 text-xs cursor-pointer">
                  Espèces physiquement recomptées et encaissées dans le tiroir-caisse
                </label>
              </div>
              <p className="text-[11px] text-emerald-700 pl-5">
                Un numéro de reçu de caisse sécurisé sera automatiquement attribué et journalisé dans l'audit.
              </p>
            </div>
          )}

          {/* Processing Status Banner */}
          {simulatedMomoStep === 'waiting_push' && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs animate-pulse">
              <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Attente de confirmation du client sur son téléphone Mobile Money...</span>
            </div>
          )}

          {simulatedMomoStep === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Paiement validé avec succès par le réseau !</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isProcessing || amount <= 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirmer l'encaissement de {formatFCFA(amount)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
