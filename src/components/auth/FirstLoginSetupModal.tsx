import React, { useState, useRef } from 'react';
import {
  KeyRound,
  Shield,
  ShieldCheck,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
  Lock,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Crown,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { soundFX } from '../../services/sound';

export const FirstLoginSetupModal: React.FC = () => {
  const {
    state,
    completeFirstLoginAdmin,
    completeFirstLoginGerant,
    completeFirstLoginEmployee,
    completeFirstLoginEditorCollaborator,
    logout,
    currentTenant,
  } = useApp();

  const isEditorCollaborator = state.firstLoginUserType === 'collaborateur_editeur';
  const isEmployee = state.firstLoginUserType === 'employe';
  const isGerant = state.firstLoginUserType === 'gerant';
  const isAdmin = state.firstLoginUserType === 'admin';

  const currentCollab = isEditorCollaborator
    ? state.saasEditorUsers.find((u) => u.id === state.currentLoggedInEditorUserId)
    : undefined;

  const currentEmp = isEmployee
    ? state.employees.find((e) => e.id === state.currentLoggedInEmployeeId)
    : isGerant
    ? state.employees.find((e) => e.role?.toLowerCase().includes('gérant') || e.jobCode === 'manager')
    : undefined;

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Identity Document fields
  const [docType, setDocType] = useState<'cni' | 'passport' | 'attestation' | 'permis' | 'consulaire'>(
    (currentCollab?.idCardDocumentType as any) || (currentEmp?.idCardDocumentType as any) || 'cni'
  );
  const [docNumber, setDocNumber] = useState(currentCollab?.idCardNumber || currentEmp?.idCardNumber || '');
  const [scanUrl, setScanUrl] = useState<string>(currentCollab?.idCardScanUrl || currentEmp?.idCardScanUrl || '');
  const [scanName, setScanName] = useState<string>(currentCollab?.idCardScanName || currentEmp?.idCardScanName || '');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!state.mustCompleteFirstLoginSetup) {
    return null;
  }

  // Pre-filled Specimen for quick testing in CI/Demo
  const handleLoadSampleId = () => {
    let targetLastName = 'KOUADIO';
    let targetFirstName = 'JEAN';

    if (isEditorCollaborator && currentCollab) {
      const parts = currentCollab.name.split(' ');
      targetLastName = parts[parts.length - 1] || 'COLLABORATEUR';
      targetFirstName = parts.slice(0, -1).join(' ') || 'MEMBRE';
    } else if (currentEmp) {
      targetLastName = currentEmp.lastName || 'EMPLOYE';
      targetFirstName = currentEmp.firstName || 'AGENT';
    } else if (isGerant) {
      targetLastName = 'SORO';
      targetFirstName = 'BAKARY';
    }

    const sampleCniSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
        <rect width="600" height="380" rx="16" fill="#f8fafc" stroke="#3b82f6" stroke-width="6"/>
        <rect x="0" y="0" width="600" height="70" rx="16" fill="#1d4ed8"/>
        <text x="300" y="32" font-family="Arial" font-weight="bold" font-size="18" fill="#ffffff" text-anchor="middle">RÉPUBLIQUE DE CÔTE D'IVOIRE</text>
        <text x="300" y="54" font-family="Arial" font-size="13" fill="#dbeafe" text-anchor="middle">CARTE NATIONALE D'IDENTITÉ (ONECI)</text>
        <rect x="30" y="90" width="130" height="160" rx="8" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
        <circle cx="95" cy="150" r="38" fill="#94a3b8"/>
        <path d="M55 240 Q95 195 135 240" fill="#64748b"/>
        <text x="95" y="270" font-family="Arial" font-size="11" fill="#64748b" text-anchor="middle">PHOTO ${isEditorCollaborator ? 'COLLABORATEUR' : 'OFFICIELLE'}</text>
        
        <text x="180" y="120" font-family="Arial" font-size="12" font-weight="bold" fill="#64748b">NOM / SURNAME :</text>
        <text x="180" y="142" font-family="Arial" font-size="16" font-weight="bold" fill="#0f172a">${targetLastName.toUpperCase()}</text>
        
        <text x="180" y="175" font-family="Arial" font-size="12" font-weight="bold" fill="#64748b">PRÉNOMS / GIVEN NAMES :</text>
        <text x="180" y="197" font-family="Arial" font-size="15" font-weight="bold" fill="#0f172a">${targetFirstName.toUpperCase()}</text>
        
        <text x="180" y="230" font-family="Arial" font-size="12" font-weight="bold" fill="#64748b">N° NATIONAL D'IDENTIFICATION (NNI) :</text>
        <text x="180" y="252" font-family="Courier" font-size="16" font-weight="bold" fill="#1d4ed8">CI-${Math.floor(1000000000 + Math.random() * 9000000000)}</text>
        
        <rect x="30" y="295" width="540" height="60" rx="6" fill="#f1f5f9" stroke="#e2e8f0"/>
        <text x="50" y="322" font-family="Courier" font-size="14" fill="#334155" letter-spacing="3">IDCI00293848299CI<<<<<<<<<<<<<<</text>
        <text x="50" y="342" font-family="Courier" font-size="14" fill="#334155" letter-spacing="3">${targetLastName.toUpperCase()}<<${targetFirstName.toUpperCase()}<<<<<<<</text>
      </svg>
    `)}`;

    setScanUrl(sampleCniSvg);
    setScanName(`Specimen_CNI_${targetFirstName}.svg`);
    if (!docNumber) {
      setDocNumber(`CI-00${Math.floor(10000000 + Math.random() * 90000000)}`);
    }
    soundFX.playCashChime();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setScanUrl(reader.result as string);
      setScanName(file.name);
      soundFX.playCashChime();
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 4) {
      setErrorMsg('Le nouveau mot de passe doit contenir au moins 4 caractères.');
      soundFX.playError();
      return;
    }

    if (newPassword === '1234') {
      setErrorMsg('Veuillez choisir un mot de passe différent du code par défaut (1234).');
      soundFX.playError();
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Les deux mots de passe saisis ne correspondent pas.');
      soundFX.playError();
      return;
    }

    if (isEditorCollaborator) {
      if (!currentCollab) {
        setErrorMsg('Profil collaborateur introuvable.');
        return;
      }
      if (!scanUrl) {
        setErrorMsg("Veuillez fournir le scan ou la photo de votre pièce d'identité pour continuer.");
        soundFX.playError();
        return;
      }
      if (!docNumber.trim()) {
        setErrorMsg("Veuillez renseigner le numéro de la pièce d'identité.");
        soundFX.playError();
        return;
      }

      setIsSubmitting(true);
      completeFirstLoginEditorCollaborator(currentCollab.id, newPassword, {
        docType,
        docNumber: docNumber.trim(),
        scanUrl,
        scanName: scanName || `Piece_${docType.toUpperCase()}_${currentCollab.name}.jpg`,
      });

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      return;
    }

    if (isEmployee || isGerant) {
      if (isEmployee && !currentEmp) {
        setErrorMsg('Profil employé introuvable.');
        return;
      }
      if (!scanUrl) {
        setErrorMsg("Veuillez fournir le scan ou la photo de votre pièce d'identité pour continuer.");
        soundFX.playError();
        return;
      }
      if (!docNumber.trim()) {
        setErrorMsg("Veuillez renseigner le numéro de la pièce d'identité.");
        soundFX.playError();
        return;
      }

      setIsSubmitting(true);
      if (isEmployee && currentEmp) {
        completeFirstLoginEmployee(currentEmp.id, newPassword, {
          docType,
          docNumber: docNumber.trim(),
          scanUrl,
          scanName: scanName || `Piece_${docType.toUpperCase()}_${currentEmp.lastName}.jpg`,
        });
      } else if (isGerant) {
        if (currentEmp) {
          completeFirstLoginEmployee(currentEmp.id, newPassword, {
            docType,
            docNumber: docNumber.trim(),
            scanUrl,
            scanName: scanName || `Piece_Gerant_${docType.toUpperCase()}.jpg`,
          });
        }
        completeFirstLoginGerant(newPassword);
      }

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      // Administrator
      setIsSubmitting(true);
      completeFirstLoginAdmin(newPassword);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="bg-slate-900 border border-slate-750 text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl ${
                isEditorCollaborator
                  ? 'bg-sky-400 text-slate-950'
                  : 'bg-amber-400 text-slate-950'
              } font-black flex items-center justify-center text-lg shadow-md`}
            >
              {isEditorCollaborator ? (
                <Users className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>
            <div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isEditorCollaborator
                    ? 'text-sky-400 bg-sky-400/10 border border-sky-400/20'
                    : 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
                } px-2 py-0.5 rounded`}
              >
                {isEditorCollaborator
                  ? 'Équipe Éditeur & Gérance SaaS'
                  : isEmployee
                  ? 'Sécurité & Conformité RH'
                  : isGerant
                  ? 'Sécurité Gérance d’Agence'
                  : 'Sécurité & Propriétaire'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {isEditorCollaborator
                  ? 'Activation de votre Compte Collaborateur Éditeur'
                  : isEmployee
                  ? 'Activation de votre Compte Employé'
                  : isGerant
                  ? 'Configuration du Mot de Passe Gérant'
                  : 'Configuration du Mot de Passe Administrateur'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition cursor-pointer"
            title="Annuler et retourner à l'écran de connexion"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quitter</span>
          </button>
        </div>

        {/* Informative Note */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              Bienvenue sur la plateforme SaaS Éditeur AGB !
            </span>
          </p>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {isEditorCollaborator
              ? `Bonjour ${currentCollab?.name || 'Collaborateur'}. Le Super Administrateur (Gilles Brice Atsé) vous a créé un accès collaborateur. À votre première connexion, vous devez obligatoirement remplacer le mot de passe initial (1234) et fournir une pièce d'identité officielle.`
              : isEmployee
              ? `Bonjour ${currentEmp?.fullName || 'Employé'} (${currentEmp?.jobTitle || 'Poste'}). À votre première connexion, vous devez obligatoirement personnaliser votre mot de passe et fournir une copie de votre pièce d'identité officielle.`
              : isGerant
              ? 'Bonjour Bakary Soro (Gérant d’Agence). À votre première connexion, vous devez obligatoirement remplacer le mot de passe initial par un mot de passe sécurisé personnel.'
              : `Bonjour ${currentTenant?.ownerName || 'Administrateur'} (Propriétaire / Direction Générale). Pour des raisons de sécurité, l'application vous demande obligatoirement de définir un nouveau mot de passe personnalisé dès votre première connexion.`}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: NOUVEAU MOT DE PASSE */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
              <KeyRound className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                1. Votre Nouveau Mot de Passe Personnel
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Nouveau mot de passe <span className="text-sky-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ex: pass2026"
                    required
                    className="w-full bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Minimum 4 caractères (différent de 1234)
                </span>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Confirmer le mot de passe <span className="text-sky-400">*</span>
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  required
                  className="w-full bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: SCAN PIÈCE D'IDENTITÉ (POUR EMPLOYÉS, GÉRANT ET COLLABORATEURS ÉDITEUR) */}
          {(isEmployee || isGerant || isEditorCollaborator) && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    2. Scan ou Photo de votre Pièce d'Identité Officielle
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSampleId}
                  className="text-[10px] text-sky-400 hover:text-sky-300 underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Insérer un spécimen CNI test</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Type de pièce */}
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Type de Pièce d'Identité <span className="text-sky-400">*</span>
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden"
                  >
                    <option value="cni">Carte Nationale d'Identité (CNI ONECI)</option>
                    <option value="passport">Passeport Biométrique CEDEAO</option>
                    <option value="attestation">Attestation d'Identité Officielle</option>
                    <option value="permis">Permis de Conduire</option>
                    <option value="consulaire">Carte Consulaire</option>
                  </select>
                </div>

                {/* Numéro de la pièce */}
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Numéro de la Pièce / NNI <span className="text-sky-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="Ex: CI-002849102"
                    required
                    className="w-full bg-slate-900 border border-slate-700 focus:border-sky-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden font-mono uppercase"
                  />
                </div>
              </div>

              {/* Upload Dropzone / Camera Capture / Preview */}
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,.pdf"
                  className="hidden"
                />

                {scanUrl ? (
                  /* Preview Card */
                  <div className="relative rounded-2xl border-2 border-emerald-500/50 bg-slate-900 p-3 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-44 h-28 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                      <img
                        src={scanUrl}
                        alt="Aperçu pièce d'identité"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 text-left space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Pièce d'identité numérisée avec succès</span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate font-mono">
                        {scanName || 'piece_identite.jpg'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Type : {docType.toUpperCase()} • N° {docNumber || 'Non renseigné'}
                      </p>

                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-[11px] border border-slate-700 cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Changer le fichier</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty Upload Box */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-sky-400/80 bg-slate-900/60 hover:bg-slate-900 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center group-hover:scale-110 transition">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-sky-300">
                        Cliquez pour importer la photo ou le scan de votre pièce
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Formats acceptés : JPG, PNG, WebP, PDF (Recto ou Recto/Verso)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Action CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer transform active:scale-[0.99]"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>
                {isEditorCollaborator
                  ? 'Activer Mon Profil Collaborateur & Ouvrir la Session'
                  : isEmployee
                  ? 'Activer Mon Profil & Entrer dans l’Application'
                  : 'Enregistrer Mon Mot de Passe & Continuer'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
