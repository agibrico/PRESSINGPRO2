import React from 'react';
import { Building2, Check, Shield, User, UserCheck, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { AppIconBadge } from './AppIconBadge';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { state, switchRole, currentTenant } = useApp();

  if (!isOpen) return null;

  const roleOptions: {
    role: UserRole;
    title: string;
    description: string;
    badge: string;
    tenantId?: string;
    employeeId?: string;
  }[] = [
    {
      role: 'super_admin',
      title: 'Super Admin / Éditeur SaaS',
      description: 'Accès central éditeur: gestion des clients SaaS, formules d’abonnement, impayés, journaux globaux et finances SaaS.',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      role: 'owner',
      title: `Propriétaire - ${currentTenant?.companyName || 'Pressing Élégance'}`,
      description: 'Accès complet au pressing: multi-agences, gestion du personnel, salaires, caisse, statistiques et configuration.',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      tenantId: state.currentTenantId,
    },
    {
      role: 'manager',
      title: 'Bakary Soro (Gérant)',
      description: 'Supervision des opérations atelier, caisse, validation des anomalies et contrôle qualité.',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      tenantId: 'tenant-elegance',
      employeeId: 'emp-bakary',
    },
    {
      role: 'receptionist',
      title: 'Sarah Konan (Réceptionniste)',
      description: 'Accueil clients, création de dépôts, impression tickets et remise du linge propre.',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      tenantId: 'tenant-elegance',
      employeeId: 'emp-sarah',
    },
    {
      role: 'cashier',
      title: 'Marcelle N’Guessan (Caissière)',
      description: 'Encaissements Wave, OM, MoMo, Moov, espèces, gestion des fonds de caisse et clôtures journalières.',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      tenantId: 'tenant-elegance',
      employeeId: 'emp-marcelle',
    },
    {
      role: 'washer',
      title: 'Ibrahim Diarra (Laveur / Atelier)',
      description: 'Vue restreinte atelier: textile à laver, détachage, passage au séchoir et validation des lots.',
      badge: 'bg-sky-100 text-sky-800 border-sky-200',
      tenantId: 'tenant-elegance',
      employeeId: 'emp-ibrahim',
    },
    {
      role: 'ironer',
      title: 'Abdoulaye Sanogo (Maître Repasseur)',
      description: 'Vue repassage & finition: boubous Bazin, costumes, robes et mise sous housse.',
      badge: 'bg-violet-100 text-violet-800 border-violet-200',
      tenantId: 'tenant-elegance',
      employeeId: 'emp-abdoulaye',
    },
    {
      role: 'driver',
      title: 'Eric Kouamé (Chauffeur-Livreur)',
      description: 'Vue mobile livraison: tournées, encaissement au domicile client et validation preuve de livraison.',
      badge: 'bg-orange-100 text-orange-800 border-orange-200',
      tenantId: 'tenant-elegance',
      employeeId: 'emp-kouame',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <AppIconBadge size="sm" rounded="lg" />
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Simulateur de Rôles & Profils RBAC</h3>
              <p className="text-xs text-slate-500">
                Changez de perspective instantanément pour tester les droits et interfaces adaptées.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tenant Picker for Owner test */}
        <div className="p-4 bg-slate-100/70 border-b border-slate-200">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Sélectionner le pressing entreprise actif</span>
          </label>
          <select
            value={state.currentTenantId}
            onChange={(e) => {
              const target = state.tenants.find((t) => t.id === e.target.value);
              if (target) {
                switchRole('owner', target.id);
              }
            }}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-slate-900"
          >
            {state.tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.companyName} ({tenant.planName} - {tenant.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Roles List */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-2 text-xs">
          {roleOptions.map((opt) => {
            const isCurrent =
              state.currentRole === opt.role &&
              (!opt.employeeId || state.currentUserId === opt.employeeId);

            return (
              <div
                key={opt.title}
                onClick={() => {
                  switchRole(opt.role, opt.tenantId, opt.employeeId);
                  onClose();
                }}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isCurrent
                    ? 'border-slate-900 bg-slate-900/5 ring-1 ring-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-xs">{opt.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${opt.badge}`}>
                      {opt.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{opt.description}</p>
                </div>
                {isCurrent && (
                  <span className="bg-slate-900 text-white rounded-full p-1 shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
