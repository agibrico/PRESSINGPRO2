import React, { useState } from 'react';
import {
  Crown,
  CheckCircle2,
  X,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Zap,
  Phone,
  QrCode,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Tenant } from '../../types';
import { formatFCFA, PAYMENT_METHOD_CONFIG } from '../../services/store';
import { soundFX } from '../../services/sound';
import confetti from 'canvas-confetti';

interface SaaSReactivatePaymentModalProps {
  tenant: Tenant;
  onClose: () => void;
}

export const SaaSReactivatePaymentModal: React.FC<SaaSReactivatePaymentModalProps> = ({
  tenant,
  onClose,
}) => {
  const { recordSaaSPayment, reactivateTenant } = useApp();

  const [renewMonths, setRenewMonths] = useState<number>(1);
  const [renewMethod, setRenewMethod] = useState<PaymentMethod>('wave');
  const [phoneNumber, setPhoneNumber] = useState<string>(tenant.ownerPhone || '+225 ');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  const basePricePerMonth =
    tenant.planTier === 'basic' ? 25000 : tenant.planTier === 'premium' ? 95000 : 50000;

  // Pricing math: 12 months pays 10 months (2 months free discount)
  const discountMultiplier = renewMonths >= 12 ? 10 : renewMonths;
  const totalAmount = basePricePerMonth * discountMultiplier;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setStep('processing');
    soundFX.playBeep();

    setTimeout(() => {
      const generatedRef =
        transactionRef.trim() ||
        `${renewMethod.toUpperCase().replace('_', '-')}-${Date.now().toString().slice(-6)}`;

      // 1. Record SaaS Subscription Payment
      recordSaaSPayment({
        tenantId: tenant.id,
        tenantName: tenant.companyName,
        planName: tenant.planName || 'Plan Pro B2B',
        amount: totalAmount,
        monthsPaid: renewMonths,
        paymentMethod: renewMethod,
        transactionReference: generatedRef,
        notes: `Réactivation et règlement abonnement (${renewMonths} mois) via ${PAYMENT_METHOD_CONFIG[renewMethod]?.label || renewMethod}`,
        paidAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        recordedByUserId: 'client-admin',
        recordedByUserName: tenant.ownerName || 'Administrateur Pressing',
      });

      // 2. Reactivate tenant for the paid duration
      reactivateTenant(tenant.id, renewMonths * 30);

      setIsProcessing(false);
      setStep('success');

      try {
        soundFX.playCashChime();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe sound/confetti fallback
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/50 via-slate-900 to-purple-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm sm:text-base">
                  Réactivation de l'Abonnement
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                {tenant.companyName} • {tenant.planName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
            {/* Suspended Alert Banner */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-amber-200">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <p className="font-semibold text-amber-300">Déblocage immédiat de votre pressing</p>
                <p className="text-slate-300">
                  Choisissez la durée et votre moyen de paiement Mobile Money pour réactiver l'accès complet instantanément.
                </p>
              </div>
            </div>

            {/* 1. Duration Choice */}
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-2">
                1. Durée du réengagement
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { months: 1, label: '1 Mois', badge: 'Standard' },
                  { months: 3, label: '3 Mois', badge: 'Trimestre' },
                  { months: 12, label: '12 Mois', badge: '-2 mois offerts' },
                ].map((opt) => {
                  const isSelected = renewMonths === opt.months;
                  return (
                    <button
                      key={opt.months}
                      type="button"
                      onClick={() => setRenewMonths(opt.months)}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/15 text-white ring-1 ring-amber-400/50 shadow-md'
                          : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold text-xs">{opt.label}</span>
                      <span
                        className={`text-[9px] mt-1 px-1.5 py-0.5 rounded-md font-mono ${
                          isSelected
                            ? 'bg-amber-400/20 text-amber-300 font-semibold'
                            : 'text-slate-500'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Payment Method Grid */}
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-2">
                2. Moyen de Règlement Mobile Money / Espèces
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'wave', label: 'Wave Mobile Money', icon: '🌊', color: 'border-sky-500/40 hover:border-sky-400' },
                  { id: 'orange_money', label: 'Orange Money CI', icon: '🍊', color: 'border-amber-500/40 hover:border-amber-400' },
                  { id: 'mtn_momo', label: 'MTN MoMo', icon: '🟡', color: 'border-yellow-500/40 hover:border-yellow-400' },
                  { id: 'moov_money', label: 'Moov Money Flooz', icon: '🔵', color: 'border-blue-500/40 hover:border-blue-400' },
                  { id: 'cash', label: 'Espèces / Dépôt direct', icon: '💵', color: 'border-emerald-500/40 hover:border-emerald-400' },
                  { id: 'bank_transfer', label: 'Virement / Carte B2B', icon: '💳', color: 'border-purple-500/40 hover:border-purple-400' },
                ].map((m) => {
                  const isSelected = renewMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setRenewMethod(m.id as PaymentMethod)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/15 text-white ring-1 ring-amber-400'
                          : `border-slate-800 bg-slate-800/60 text-slate-300 ${m.color}`
                      }`}
                    >
                      <span className="text-base">{m.icon}</span>
                      <span className="font-semibold text-[11px] truncate leading-tight">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Phone number & Optional Transaction Ref */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[10px] font-semibold mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>Numéro de Débit / Contact</span>
                </label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+225 07..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] font-semibold mb-1 flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-slate-400" />
                  <span>Réf. Transaction (Optionnel)</span>
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="Auto si vide"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-amber-400"
                />
              </div>
            </div>

            {/* Total Amount Box */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Total Licence à Payer ({renewMonths} mois)
                </span>
                <span className="text-[11px] text-amber-400 font-medium">
                  {tenant.planName} • {formatFCFA(basePricePerMonth)} / mois
                </span>
              </div>
              <p className="text-xl font-bold font-mono text-emerald-400">
                {formatFCFA(totalAmount)}
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl shadow-lg flex items-center gap-2 text-xs transition transform active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Payer & Réactiver ({formatFCFA(totalAmount)})</span>
              </button>
            </div>
          </form>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin flex items-center justify-center text-amber-400">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Traitement du Paiement en cours...</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Connexion à la passerelle Mobile Money et enregistrement de votre facture de réactivation...
              </p>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Abonnement Réactivé avec Succès !</h4>
              <p className="text-xs text-slate-300 mt-1">
                Le compte de <strong>{tenant.companyName}</strong> a été réactivé avec succès pour{' '}
                <strong className="text-amber-300 font-mono">+{renewMonths * 30} jours</strong>.
              </p>
            </div>

            <div className="w-full bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-left text-xs space-y-1 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Montant Réglé :</span>
                <span className="text-emerald-400 font-bold">{formatFCFA(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Moyen de paiement :</span>
                <span className="text-slate-200 uppercase">{renewMethod}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Statut :</span>
                <span className="text-emerald-400 font-bold">COMPTE ACTIF ✓</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-md"
            >
              Accéder au Tableau de Bord
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
