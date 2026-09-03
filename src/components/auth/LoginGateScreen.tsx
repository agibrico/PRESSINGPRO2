import React, { useState } from 'react';
import {
  Crown,
  Briefcase,
  Users,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Check,
  AlertCircle,
  Smartphone,
  Phone,
  Mail,
  UserCheck,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClientAuthRoleCategory } from '../../types';
import { AgbLogo } from '../common/AgbLogo';
import { EditorUnlockModal } from '../common/EditorUnlockModal';

export const LoginGateScreen: React.FC = () => {
  const { state, loginClient, currentTenant } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<ClientAuthRoleCategory>('admin');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('emp-sarah');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditorModal, setShowEditorModal] = useState(false);

  const activeTheme = state.uiTheme || 'amber';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = loginClient(selectedCategory, password, selectedCategory === 'employe' ? selectedEmployeeId : undefined);
    if (!res.success) {
      setError(res.error || 'Mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 select-none font-sans relative overflow-x-hidden">
      {/* Background Ambience / Subtle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-base shadow-md">
            MP
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wider uppercase text-white flex items-center gap-2">
              MON PRESSING PRO
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-semibold">
                SaaS v2.4
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Logiciel de gestion intégrée pour Pressings & Blanchisseries en Côte d'Ivoire
            </p>
          </div>
        </div>

        {/* Current Active Pressing Name */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-white">{currentTenant?.companyName || 'Pressing Élégance'}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">{currentTenant?.city || 'Abidjan'}</span>
        </div>
      </header>

      {/* Main Form Center Card */}
      <main className="relative z-10 max-w-3xl w-full mx-auto my-auto py-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          {/* Card Title */}
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
              Authentification & Démarrage de Session
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Choisissez votre rôle d'accès
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Cliquez sur l'un des 3 profils ci-dessous, puis saisissez le mot de passe pour ouvrir votre session de travail.
            </p>
          </div>

          {/* THE 3 BIG BUTTONS (ADMINISTRATEUR, GÉRANT, EMPLOYÉS) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. ADMINISTRATEUR */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('admin');
                setError(null);
              }}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                selectedCategory === 'admin'
                  ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/40 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-750 hover:border-slate-600 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      selectedCategory === 'admin'
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-750 text-amber-400'
                    }`}
                  >
                    <Crown className="w-5 h-5" />
                  </div>
                  {selectedCategory === 'admin' && (
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white tracking-wide">
                    ADMINISTRATEUR
                  </h3>
                  <span className="text-[10px] text-amber-400/90 font-medium block">
                    Propriétaire & Direction
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">
                  Accès global : Finances, Caisse, Personnel, Tarifs, Dépenses et Rapports.
                </p>
              </div>
            </button>

            {/* 2. GÉRANT */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('gerant');
                setError(null);
              }}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                selectedCategory === 'gerant'
                  ? 'bg-emerald-500/15 border-emerald-400 ring-2 ring-emerald-400/40 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-750 hover:border-slate-600 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      selectedCategory === 'gerant'
                        ? 'bg-emerald-400 text-slate-950 font-bold'
                        : 'bg-slate-750 text-emerald-400'
                    }`}
                  >
                    <Briefcase className="w-5 h-5" />
                  </div>
                  {selectedCategory === 'gerant' && (
                    <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white tracking-wide">
                    GÉRANT
                  </h3>
                  <span className="text-[10px] text-emerald-400/90 font-medium block">
                    Responsable d'Agence
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">
                  Supervision agence : Caisse, Commandes, Atelier Kanban, Stocks & Clôtures.
                </p>
              </div>
            </button>

            {/* 3. EMPLOYÉS */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('employe');
                setError(null);
              }}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                selectedCategory === 'employe'
                  ? 'bg-sky-500/15 border-sky-400 ring-2 ring-sky-400/40 text-white shadow-lg'
                  : 'bg-slate-800/60 border-slate-750 hover:border-slate-600 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      selectedCategory === 'employe'
                        ? 'bg-sky-400 text-slate-950 font-bold'
                        : 'bg-slate-750 text-sky-400'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                  </div>
                  {selectedCategory === 'employe' && (
                    <span className="w-5 h-5 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white tracking-wide">
                    EMPLOYÉS
                  </h3>
                  <span className="text-[10px] text-sky-400/90 font-medium block">
                    Caissière, Laveur, Repasseur, Livreur
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">
                  Poste opérationnel : Caisse POS, Suivi des lots atelier, Livraisons.
                </p>
              </div>
            </button>
          </div>

          {/* Specific Employee Selector if 'employe' category is selected */}
          {selectedCategory === 'employe' && (
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-sky-400" />
                <span>Sélectionnez votre identité / Poste :</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {state.employees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className={`p-2.5 rounded-xl border text-left transition text-xs cursor-pointer flex items-center justify-between ${
                      selectedEmployeeId === emp.id
                        ? 'bg-sky-500/20 border-sky-400 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="font-bold truncate text-white">{emp.fullName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{emp.jobTitle}</p>
                    </div>
                    {selectedEmployeeId === emp.id && (
                      <span className="w-4 h-4 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Password Form */}
          <form onSubmit={handleLogin} className="space-y-4 pt-1 border-t border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mot de passe d'accès ({selectedCategory.toUpperCase()})</span>
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Saisissez votre mot de passe"
                  required
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-400/20 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login CTA */}
            <button
              type="submit"
              className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer transform active:scale-[0.99]"
            >
              <span>Se Connecter en tant que {selectedCategory === 'admin' ? 'ADMINISTRATEUR' : selectedCategory === 'gerant' ? 'GÉRANT' : 'EMPLOYÉ'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      {/* Bottom Footer with AGB Publisher / Creator Interactive Logo */}
      <footer className="relative z-10 max-w-4xl w-full mx-auto pt-4 border-t border-slate-850 flex flex-col items-center gap-3 text-center">
        {/* Interactive Clickable AGB Logo Section */}
        <div
          onClick={() => setShowEditorModal(true)}
          className="group p-3 sm:px-6 sm:py-3.5 bg-slate-900/80 hover:bg-slate-900 border border-blue-900/40 hover:border-blue-500 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl w-full shadow-lg"
          title="Cliquez pour ouvrir l'Espace Super Admin Éditeur"
        >
          <div className="flex items-center gap-3.5">
            <AgbLogo size="sm" showDetails={false} />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">
                  Espace Concepteur & Éditeur Logiciel AGB
                </span>
                <span className="text-[10px] bg-blue-500/20 text-sky-300 border border-blue-500/40 px-2 py-0.2 rounded font-mono">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Gilles Brice Atsé • Concepteur d'applications mobiles et solutions web sur mesure
              </p>
              <p className="text-[10px] text-sky-400/80 font-mono mt-0.5">
                atsegillesbrice@gmail.com • 0104818092 / 0797709693
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 group-hover:text-sky-300 bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-800/60 shrink-0">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Accès Éditeur</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          © {new Date().getFullYear()} MON PRESSING PRO • Développé par AGB Solutions Web & Mobiles
        </p>
      </footer>

      {/* Editor Modal for agibrico1 unlock */}
      <EditorUnlockModal
        isOpen={showEditorModal}
        onClose={() => setShowEditorModal(false)}
      />
    </div>
  );
};
