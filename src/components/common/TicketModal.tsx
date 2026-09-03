import React, { useEffect, useState } from 'react';
import { Download, MessageCircle, Printer, QrCode, X } from 'lucide-react';
import { Order, Tenant } from '../../types';
import { createWhatsAppOrderReadyText, formatFCFA, generateQrDataUrl, ORDER_STATUS_CONFIG } from '../../services/store';

interface TicketModalProps {
  order: Order | null;
  tenant: Tenant | undefined;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ order, tenant, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (order) {
      const trackPayload = JSON.stringify({
        ref: order.orderNumber,
        client: order.clientName,
        total: order.totalAmount,
        est: order.establishmentName,
      });
      generateQrDataUrl(trackPayload).then(setQrUrl);
    }
  }, [order]);

  if (!order || !tenant) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const text = createWhatsAppOrderReadyText(order, tenant);
    const phone = order.clientWhatsapp || order.clientPhone;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header Actions - Not Printed */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800 text-sm">Ticket de Caisse & Dépôt</span>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
              {order.orderNumber}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
              title="Envoyer par WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Receipt */}
        <div className="p-6 text-slate-900 font-mono text-xs bg-white space-y-4 print:p-0">
          {/* Header Pressing Info */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <h2 className="font-bold text-base tracking-wider uppercase text-slate-950">{tenant.companyName}</h2>
            <p className="text-[11px] text-slate-600 whitespace-pre-line font-sans">{tenant.receiptHeader}</p>
            <p className="text-[11px] font-sans font-medium text-slate-700">{order.establishmentName}</p>
            <p className="text-[11px] text-slate-500 font-sans">Tél: {tenant.ownerPhone}</p>
          </div>

          {/* Ticket Meta */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pb-3 border-b border-dashed border-slate-300">
            <div>
              <p className="text-slate-500">TICKET N°</p>
              <p className="font-bold text-slate-900">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500">DATE DÉPÔT</p>
              <p className="font-medium text-slate-800">{order.depositDate}</p>
            </div>
            <div>
              <p className="text-slate-500">CLIENT</p>
              <p className="font-bold text-slate-900">{order.clientName}</p>
              <p className="text-slate-600">{order.clientPhone}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500">DISPONIBLE LE</p>
              <p className="font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded inline-block">
                {order.promisedPickupDate} à {order.promisedPickupTime}
              </p>
            </div>
            <div>
              <p className="text-slate-500">RÉCEPTIONNÉ PAR</p>
              <p className="font-bold text-slate-800 font-sans">
                {order.receivedByEmployeeName || order.createdByEmployeeName || 'Agent d’Accueil'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-500">MODE DE REMISE</p>
              <p className="font-bold font-sans text-slate-900">
                {order.deliveryRequested || order.deliveryMode === 'home_delivery'
                  ? '🚚 Livraison Domicile'
                  : '🏪 Retrait en Boutique'}
              </p>
            </div>
            {(order.deliveryRequested || order.deliveryMode === 'home_delivery') && (
              <div className="col-span-2 bg-blue-50 p-1.5 rounded border border-blue-200">
                <p className="text-slate-500 text-[10px]">LIEU DE LIVRAISON</p>
                <p className="font-bold text-blue-900 font-sans text-[10px]">
                  {order.deliveryLocation || order.deliveryAddress || 'Abidjan'}
                </p>
              </div>
            )}
            {order.rackLocation && (
              <div>
                <p className="text-slate-500">EMPLACEMENT</p>
                <p className="font-bold text-indigo-700 font-sans">Rayon {order.rackLocation}</p>
              </div>
            )}
            {order.isExpress && (
              <div className="text-right">
                <span className="bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                  ⚡ SERVICE EXPRESS
                </span>
              </div>
            )}
          </div>

          {/* Articles Table */}
          <div className="space-y-2 pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between font-bold text-slate-700 pb-1 border-b border-slate-200">
              <span>ARTICLES / PRESTATION</span>
              <span>TOTAL</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={item.id || idx} className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-slate-900">
                    {item.quantity}x {item.serviceName}
                  </span>
                  <span className="font-semibold text-slate-900">{formatFCFA(item.totalPrice)}</span>
                </div>
                {item.color && (
                  <p className="text-[10px] text-slate-500 font-sans">
                    Couleur/Marque: {item.color} {item.brand ? `(${item.brand})` : ''}
                  </p>
                )}
                {item.issues && item.issues.length > 0 && (
                  <p className="text-[10px] text-amber-700 font-sans italic">
                    ⚠️ Anomalies constatées: {item.issues.join(', ')}
                  </p>
                )}
                {item.treatmentNotes && (
                  <p className="text-[10px] text-slate-500 font-sans">
                    Note: {item.treatmentNotes}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Totals & Payments */}
          <div className="space-y-1 text-[11px] pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between text-slate-600">
              <span>Sous-total ({order.itemCount} pièce(s))</span>
              <span>{formatFCFA(order.subtotal)}</span>
            </div>
            {order.expressFee > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>Majoration Express</span>
                <span>+{formatFCFA(order.expressFee)}</span>
              </div>
            )}
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Frais de livraison</span>
                <span>+{formatFCFA(order.deliveryFee)}</span>
              </div>
            )}
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Remise accordée</span>
                <span>-{formatFCFA(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-slate-950 pt-1 border-t border-slate-200">
              <span>MONTANT NET À PAYER</span>
              <span className="text-slate-950">{formatFCFA(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Acompte / Montant Réglé</span>
              <span>{formatFCFA(order.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-rose-700 font-bold">
              <span>RESTE À PAYER</span>
              <span>{formatFCFA(order.remainingBalance)}</span>
            </div>
          </div>

          {/* QR Code & Status */}
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-500">SCANNER POUR SUIVRE L'ÉTAT</p>
              <p className="text-[10px] font-sans text-slate-700">
                Statut: <span className="font-semibold">{ORDER_STATUS_CONFIG[order.status].label}</span>
              </p>
              <p className="text-[9px] font-sans text-slate-500">Agent: {order.createdByEmployeeName}</p>
            </div>
            {qrUrl && (
              <div className="bg-white p-1 border border-slate-200 rounded">
                <img src={qrUrl} alt="QR Code Commande" className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Footer Clause */}
          <div className="text-center pt-2 border-t border-dashed border-slate-300">
            <p className="text-[9px] text-slate-500 font-sans leading-tight whitespace-pre-line">
              {tenant.receiptFooter}
            </p>
            <p className="text-[8px] text-slate-400 font-sans mt-1">
              Propulsé par Mon Pressing Pro SaaS • Côte d'Ivoire
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
