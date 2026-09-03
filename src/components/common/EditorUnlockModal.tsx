import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  ArrowRight,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  Crown,
  Users,
  ChevronLeft,
  UserCheck,
  FileBadge,
  Sparkles,
  Phone,
  Mail,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AgbLogo } from './AgbLogo';
import { AppIconBadge } from './AppIconBadge';

interface EditorUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type EditorAuthMode = 'select' | 'admin' | 'collaborator';

export const EditorUnlockModal: React.FC<EditorUnlockModalProps> = ({ isOpen, onClose }) => {
  const { loginEditorAdmin, loginEditorCollaborator, state } = useApp();
  const [mode, setMode] = useState<EditorAuthMode>('select');
  const [selectedCollabId, setSelectedCollabId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const collaborators = state.saasEditorUsers.filter((u) => !u.isOwner && u.role !== 'super_admin');
  // Fallback to all users if only super_admin exists
  const selectableCollaborators = collaborators.length > 0 ? collaborators : state.saasEditorUsers;

  const handleSelectMode = (newMode: EditorAuthMode) => {
    setMode(newMode);
    setError(null);
    setPassword('');
    if (newMode === 'collaborator' && !selectedCollabId && selectableCollaborators.length > 0) {
      setSelectedCollabId(selectableCollaborators[0].id);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = loginEditorAdmin(password);
    if (res.success) {
      setPassword('');
      setMode('select');
      onClose();
    } else {
      setError(res.error || 'Mot de passe Administrateur incorrect.');
    }
  };

  const handleCollaboratorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const targetId = selectedCollabId || (selectableCollaborators[0]?.id ?? '');
    if (!targetId) {
      setError('Veuillez sélectionner un compte collaborateur.');
      return;
    }
    const res = loginEditorCollaborator(targetId, password);
    if (res.success) {
      setPassword('');
      setMode('select');
      onClose();
    } else {
      setError(res.error || 'Mot de passe collaborateur incorrect.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-slate-900 border border-slate-750 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Top Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode !== 'select' ? (
              <button
                type="button"
                onClick={() => handleSelectMode('select')}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Retour au choix</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  Accès Espace Éditeur & Gérance SaaS
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setMode('select');
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Logo & Platform Info Header */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AppIconBadge size="md" rounded="xl" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Mon Pressing Pro
                </h4>
                <p className="text-[11px] text-slate-400">
                  Logiciel de Gestion • Console Éditeur AGB
                </p>
              </div>
            </div>
            <AgbLogo size="sm" showDetails={false} theme="dark" />
          </div>

          {/* ========================================================================= */}
          {/* SCREEN 1: CHOICE BETWEEN ADMINISTRATEUR AND COLLABORATEURS               */}
          {/* ========================================================================= */}
          {mode === 'select' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-white">
                  Sélectionnez votre type d'accès
                </h3>
                <p className="text-xs text-slate-400">
                  Choisissez votre profil pour déverrouiller la console éditeur
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {/* BUTTON 1: ADMINISTRATEUR */}
                <button
                  type="button"
                  onClick={() => handleSelectMode('admin')}
                  className="group relative p-4 rounded-2xl bg-gradient-to-b from-purple-950/50 to-slate-950 border border-purple-800/60 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-900/20 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[140px]"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Crown className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded border border-purple-700">
                        Propriétaire / Concepteur
                      </span>
                      <h4 className="text-sm font-extrabold text-white mt-1 group-hover:text-purple-300 transition-colors">
                        ADMINISTRATEUR
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                        Gilles Brice Atsé • Accès complet, suppression clients & permissions.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-purple-400 mt-2">
                    <span>Accéder</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* BUTTON 2: COLLABORATEURS */}
                <button
                  type="button"
                  onClick={() => handleSelectMode('collaborator')}
                  className="group relative p-4 rounded-2xl bg-gradient-to-b from-sky-950/50 to-slate-950 border border-sky-800/60 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-900/20 text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[140px]"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-300 bg-sky-900/60 px-2 py-0.5 rounded border border-sky-700">
                        Équipe & Gérance
                      </span>
                      <h4 className="text-sm font-extrabold text-white mt-1 group-hover:text-sky-300 transition-colors">
                        COLLABORATEURS
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                        Support, facturation & gérance déléguée selon accréditations.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-sky-400 mt-2">
                    <span>Accéder</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              {/* Note on default collaborator password */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Information d'accès :</strong> Les collaborateurs créés se connectent avec le mot de passe par défaut <strong className="text-white font-mono">1234</strong> et doivent obligatoirement fournir une pièce d'identité et définir un mot de passe sécurisé à leur première connexion.
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 2: ADMINISTRATEUR AUTHENTICATION                                   */}
          {/* ========================================================================= */}
          {mode === 'admin' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Crown className="w-4 h-4 text-purple-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Connexion Super Administrateur Propriétaire
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Gilles Brice Atsé (Éditeur AGB Solutions)
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Mot de passe Administrateur
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mot de passe Super Admin"
                      autoFocus
                      required
                      className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white focus:outline-hidden focus:ring-1 focus:ring-purple-500 transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>Se connecter comme Super Administrateur</span>
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN 3: COLLABORATEUR AUTHENTICATION                                    */}
          {/* ========================================================================= */}
          {mode === 'collaborator' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Users className="w-4 h-4 text-sky-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Connexion Collaborateur Éditeur
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sélectionnez votre profil créé par le Super Administrateur
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCollaboratorLogin} className="space-y-4">
                {/* Select Collaborator */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Sélectionnez votre compte
                  </label>
                  <select
                    value={selectedCollabId}
                    onChange={(e) => setSelectedCollabId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden"
                  >
                    {selectableCollaborators.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.role === 'billing_manager' ? 'Facturation' : c.role === 'support_tech' ? 'Support Tech' : c.role === 'super_admin' ? 'Super Admin' : 'Collaborateur'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Mot de passe personnel
                    </label>
                    <span className="text-[10px] text-slate-400">
                      (1234 par défaut à la création)
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Entrez votre mot de passe (ou 1234)"
                      autoFocus
                      required
                      className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white focus:outline-hidden focus:ring-1 focus:ring-sky-500 transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Se connecter comme Collaborateur</span>
                </button>
              </form>
            </div>
          )}

          {/* Contact Support Footer */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-purple-400" />
              atsegillesbrice@gmail.com
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Phone className="w-3 h-3 text-sky-400" />
              +225 01 04 81 80 92
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
