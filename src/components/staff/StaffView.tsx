import React, { useState, useRef } from 'react';
import {
  Briefcase,
  Check,
  CheckCircle2,
  Edit2,
  Eye,
  Key,
  Lock,
  Plus,
  PlusCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
  FileText,
  Upload,
  Camera,
  RotateCcw,
  Sparkles,
  Phone,
  Building2,
  BadgeCheck,
  ExternalLink,
  X,
  Clock,
  Printer,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  ContractType,
  Employee,
  EmployeeStatus,
  JobPosition,
  PermissionSet,
  RemunerationMode,
} from '../../types';
import { DEFAULT_PERMISSIONS_ALL, PREDEFINED_JOBS_CATALOG } from '../../services/defaultData';
import { formatFCFA } from '../../services/store';
import { soundFX } from '../../services/sound';

export const StaffView: React.FC = () => {
  const {
    state,
    createJobPosition,
    updateJobPosition,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    resetEmployeePassword,
    currentPermissions,
    userRole,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'jobs'>('employees');

  // Employee Modals
  const [showEmployeeModal, setShowEmployeeModal] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingDocEmployee, setViewingDocEmployee] = useState<Employee | null>(null);

  // Job Position Modals
  const [showJobModal, setShowJobModal] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<JobPosition | null>(null);
  const [showPredefinedJobLibrary, setShowPredefinedJobLibrary] = useState<boolean>(false);

  // Employee Form State (Focus on: Nom et Prénom, Numéro de téléphone, Rôle)
  const [empMatricule, setEmpMatricule] = useState<string>('');
  const [empFirstName, setEmpFirstName] = useState<string>('');
  const [empLastName, setEmpLastName] = useState<string>('');
  const [empPhone, setEmpPhone] = useState<string>('+225 ');
  const [empWhatsapp, setEmpWhatsapp] = useState<string>('+225 ');
  const [empEmail, setEmpEmail] = useState<string>('');
  const [empAddress, setEmpAddress] = useState<string>('');
  const [empEstablishmentId, setEmpEstablishmentId] = useState<string>('');
  const [empJobPositionId, setEmpJobPositionId] = useState<string>('');
  const [empRole, setEmpRole] = useState<string>('Réceptionniste');
  const [empContractType, setEmpContractType] = useState<ContractType>('CDI');
  const [empSalary, setEmpSalary] = useState<number>(120000);
  const [empCommissionRate, setEmpCommissionRate] = useState<number>(0);
  const [empStatus, setEmpStatus] = useState<EmployeeStatus>('active');
  const [empPinCode, setEmpPinCode] = useState<string>('1234');
  const [empUsername, setEmpUsername] = useState<string>('');

  // ID Document state for employee
  const [empDocType, setEmpDocType] = useState<'cni' | 'passport' | 'attestation' | 'permis' | 'consulaire'>('cni');
  const [empDocNumber, setEmpDocNumber] = useState<string>('');
  const [empScanUrl, setEmpScanUrl] = useState<string>('');
  const [empScanName, setEmpScanName] = useState<string>('');

  const empFileInputRef = useRef<HTMLInputElement>(null);

  // Job Form State
  const [jobTitle, setJobTitle] = useState<string>('');
  const [jobCode, setJobCode] = useState<string>('');
  const [jobDepartment, setJobDepartment] = useState<string>('Atelier & Blanchisserie');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [jobContractType, setJobContractType] = useState<ContractType>('CDI');
  const [jobBaseSalary, setJobBaseSalary] = useState<number>(150000);
  const [jobRemunMode, setJobRemunMode] = useState<RemunerationMode>('fixed');
  const [jobCommission, setJobCommission] = useState<number>(0);
  const [jobHours, setJobHours] = useState<string>('08h00 - 18h00');
  const [jobDays, setJobDays] = useState<string[]>(['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']);
  const [jobPermissions, setJobPermissions] = useState<PermissionSet>(DEFAULT_PERMISSIONS_ALL);

  const tenantEmployees = state.employees.filter((e) => e.tenantId === state.currentTenantId);
  const tenantJobs = state.jobPositions.filter((j) => j.tenantId === state.currentTenantId);
  const tenantEstablishments = state.establishments.filter((e) => e.tenantId === state.currentTenantId);

  const handleInsertSampleDoc = () => {
    const sampleCniSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
        <rect width="600" height="380" rx="16" fill="#f8fafc" stroke="#f97316" stroke-width="6"/>
        <rect x="0" y="0" width="600" height="70" rx="16" fill="#ea580c"/>
        <text x="300" y="32" font-family="Arial" font-weight="bold" font-size="18" fill="#ffffff" text-anchor="middle">RÉPUBLIQUE DE CÔTE D'IVOIRE</text>
        <text x="300" y="54" font-family="Arial" font-size="13" fill="#ffedd5" text-anchor="middle">CARTE NATIONALE D'IDENTITÉ (ONECI)</text>
        <rect x="30" y="90" width="130" height="160" rx="8" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/>
        <circle cx="95" cy="150" r="38" fill="#94a3b8"/>
        <path d="M55 240 Q95 195 135 240" fill="#64748b"/>
        <text x="95" y="270" font-family="Arial" font-size="11" fill="#64748b" text-anchor="middle">PHOTO OFFICIELLE</text>
        
        <text x="180" y="120" font-family="Arial" font-size="12" font-weight="bold" fill="#64748b">NOM / SURNAME :</text>
        <text x="180" y="142" font-family="Arial" font-size="16" font-weight="bold" fill="#0f172a">${(empLastName || 'KOUADIO').toUpperCase()}</text>
        
        <text x="180" y="175" font-family="Arial" font-size="12" font-weight="bold" fill="#64748b">PRÉNOMS / GIVEN NAMES :</text>
        <text x="180" y="197" font-family="Arial" font-size="15" font-weight="bold" fill="#0f172a">${(empFirstName || 'JEAN MARC').toUpperCase()}</text>
        
        <text x="180" y="230" font-family="Arial" font-size="12" font-weight="bold" fill="#64748b">N° NATIONAL D'IDENTIFICATION (NNI) :</text>
        <text x="180" y="252" font-family="Courier" font-size="16" font-weight="bold" fill="#ea580c">CI-${Math.floor(1000000000 + Math.random() * 9000000000)}</text>
        
        <rect x="30" y="295" width="540" height="60" rx="6" fill="#f1f5f9" stroke="#e2e8f0"/>
        <text x="50" y="322" font-family="Courier" font-size="14" fill="#334155" letter-spacing="3">IDCI00293848299CI<<<<<<<<<<<<<<</text>
        <text x="50" y="342" font-family="Courier" font-size="14" fill="#334155" letter-spacing="3">${(empLastName || 'KOUADIO').toUpperCase()}<<${(empFirstName || 'JEAN').toUpperCase()}<<<<<<<</text>
      </svg>
    `)}`;

    setEmpScanUrl(sampleCniSvg);
    setEmpScanName(`CNI_${empLastName || 'Employe'}_Specimen.svg`);
    if (!empDocNumber) {
      setEmpDocNumber(`CI-${Math.floor(100000000 + Math.random() * 900000000)}`);
    }
    soundFX.playCashChime();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setEmpScanUrl(reader.result as string);
      setEmpScanName(file.name);
      soundFX.playCashChime();
    };
    reader.readAsDataURL(file);
  };

  const openNewEmployeeModal = () => {
    setEditingEmployee(null);
    setEmpMatricule(`EMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setEmpFirstName('');
    setEmpLastName('');
    setEmpPhone('+225 ');
    setEmpWhatsapp('+225 ');
    setEmpEmail('');
    setEmpAddress('');
    setEmpEstablishmentId(tenantEstablishments[0]?.id || 'est-main');
    setEmpJobPositionId(tenantJobs[0]?.id || '');
    setEmpRole(tenantJobs[0]?.title || 'Employé Pressing');
    setEmpContractType('CDI');
    setEmpSalary(120000);
    setEmpCommissionRate(0);
    setEmpStatus('active');
    setEmpPinCode('1234');
    setEmpUsername('');
    setEmpDocType('cni');
    setEmpDocNumber('');
    setEmpScanUrl('');
    setEmpScanName('');
    setShowEmployeeModal(true);
  };

  const openEditEmployeeModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpMatricule(emp.matricule);
    setEmpFirstName(emp.firstName);
    setEmpLastName(emp.lastName);
    setEmpPhone(emp.phone);
    setEmpWhatsapp(emp.whatsapp);
    setEmpEmail(emp.email);
    setEmpAddress(emp.address);
    setEmpEstablishmentId(emp.establishmentId);
    setEmpJobPositionId(emp.jobPositionId);
    setEmpRole(emp.role || emp.jobTitle);
    setEmpContractType(emp.contractType);
    setEmpSalary(emp.salary);
    setEmpCommissionRate(emp.commissionRate || 0);
    setEmpStatus(emp.status);
    setEmpPinCode(emp.pinCode || '1234');
    setEmpUsername(emp.loginUsername);
    setEmpDocType(emp.idCardDocumentType || 'cni');
    setEmpDocNumber(emp.idCardNumber || '');
    setEmpScanUrl(emp.idCardScanUrl || '');
    setEmpScanName(emp.idCardScanName || '');
    setShowEmployeeModal(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const job = tenantJobs.find((j) => j.id === empJobPositionId);

    const empData: Omit<Employee, 'id' | 'tenantId'> = {
      establishmentId: empEstablishmentId,
      matricule: empMatricule,
      firstName: empFirstName.trim(),
      lastName: empLastName.trim(),
      fullName: `${empFirstName.trim()} ${empLastName.trim()}`,
      phone: empPhone.trim(),
      whatsapp: empWhatsapp.trim(),
      email: empEmail.trim(),
      address: empAddress.trim(),
      jobPositionId: empJobPositionId,
      jobTitle: job?.title || empRole || 'Employé',
      jobCode: job?.code || 'staff',
      role: empRole || job?.title || 'Employé',
      department: job?.department || 'Exploitation',
      hireDate: editingEmployee?.hireDate || new Date().toISOString().substring(0, 10),
      contractType: empContractType,
      salary: empSalary,
      commissionRate: empCommissionRate,
      workingDays: job?.workingDays || ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      workingHours: job?.workingHours || '08h00 - 18h00',
      status: empStatus,
      loginUsername: empUsername || `${empFirstName.toLowerCase()}.${empLastName.toLowerCase()}`.replace(/\s+/g, ''),
      pinCode: empPinCode,
      hasChangedDefaultPassword: editingEmployee?.hasChangedDefaultPassword || false,
      idCardDocumentType: empDocType,
      idCardNumber: empDocNumber.trim(),
      idCardScanUrl: empScanUrl,
      idCardScanName: empScanName,
      idCardUploadedAt: empScanUrl ? (editingEmployee?.idCardUploadedAt || new Date().toISOString()) : undefined,
    };

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, empData);
    } else {
      createEmployee(empData);
    }
    setShowEmployeeModal(false);
    soundFX.playCashChime();
  };

  const openNewJobModal = () => {
    setEditingJob(null);
    setJobTitle('');
    setJobCode(`JOB-${Math.floor(10 + Math.random() * 90)}`);
    setJobDepartment('Atelier & Blanchisserie');
    setJobDescription('');
    setJobContractType('CDI');
    setJobBaseSalary(150000);
    setJobRemunMode('fixed');
    setJobCommission(0);
    setJobHours('08h00 - 18h00');
    setJobDays(['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']);
    setJobPermissions(DEFAULT_PERMISSIONS_ALL);
    setShowJobModal(true);
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    const jobData: Omit<JobPosition, 'id' | 'tenantId'> = {
      code: jobCode.toUpperCase(),
      title: jobTitle.trim(),
      department: jobDepartment,
      description: jobDescription.trim(),
      contractType: jobContractType,
      baseSalary: jobBaseSalary,
      remunerationMode: jobRemunMode,
      commissionRate: jobCommission,
      workingHours: jobHours,
      workingDays: jobDays,
      permissions: jobPermissions,
      isPredefined: false,
      status: 'active',
    };

    if (editingJob) {
      updateJobPosition(editingJob.id, jobData);
    } else {
      createJobPosition(jobData);
    }
    setShowJobModal(false);
    soundFX.playCashChime();
  };

  const handleImportPredefinedJob = (predefined: typeof PREDEFINED_JOBS_CATALOG[0]) => {
    createJobPosition({
      ...predefined,
      isCustom: false,
    });
    setShowPredefinedJobLibrary(false);
    soundFX.playCashChime();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">
              Ressources Humaines & Gestion des Employés
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {tenantEmployees.length} employés actifs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fiches employés (Nom, Prénom, Téléphone, Rôle), gestion des pièces d'identité et sécurité des accès.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activeSubTab === 'employees' ? (
            <button
              onClick={openNewEmployeeModal}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Créer un Employé</span>
            </button>
          ) : (
            (userRole === 'client' || userRole === 'super_admin' || userRole === 'owner') && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPredefinedJobLibrary(true)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Catalogue Métiers</span>
                </button>
                <button
                  onClick={openNewJobModal}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Poste Sur-Mesure</span>
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('employees')}
          className={`pb-2.5 flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'employees'
              ? 'border-b-2 border-amber-500 text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Fiches Employés ({tenantEmployees.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('jobs')}
          className={`pb-2.5 flex items-center gap-2 transition cursor-pointer ${
            activeSubTab === 'jobs'
              ? 'border-b-2 border-amber-500 text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Postes de Travail & Matrice RBAC ({tenantJobs.length})</span>
          {userRole !== 'client' && userRole !== 'super_admin' && userRole !== 'owner' && (
            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-mono">
              Admin Only 🔒
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: EMPLOYEES LIST */}
      {activeSubTab === 'employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenantEmployees.map((emp) => {
            const hasIdScan = Boolean(emp.idCardScanUrl);
            const hasCustomPass = Boolean(emp.hasChangedDefaultPassword);

            return (
              <div
                key={emp.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-slate-300 transition-all text-xs flex flex-col justify-between"
              >
                <div>
                  {/* Top line with Avatar and Role */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                        {emp.firstName.charAt(0)}
                        {emp.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">
                          {emp.firstName} {emp.lastName}
                        </h3>
                        <p className="text-[11px] font-semibold text-amber-600">
                          {emp.role || emp.jobTitle}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                      {emp.matricule}
                    </span>
                  </div>

                  {/* Core 3 Details Highlighted */}
                  <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1 font-medium">
                        <Phone className="w-3 h-3 text-slate-400" />
                        Téléphone :
                      </span>
                      <a
                        href={`tel:${emp.phone}`}
                        className="font-mono font-bold text-slate-900 hover:text-amber-600 transition"
                      >
                        {emp.phone}
                      </a>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1 font-medium">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        Rôle / Poste :
                      </span>
                      <span className="font-semibold text-slate-800">
                        {emp.role || emp.jobTitle}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1 font-medium">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        Département :
                      </span>
                      <span className="text-slate-700">{emp.department}</span>
                    </div>
                  </div>

                  {/* Status Badges: ID Card & Password */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {/* ID Document Badge */}
                    {hasIdScan ? (
                      <button
                        type="button"
                        onClick={() => setViewingDocEmployee(emp)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold hover:bg-emerald-100 transition cursor-pointer"
                        title="Cliquer pour afficher la pièce d'identité"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Pièce ID Vérifiée ({emp.idCardDocumentType?.toUpperCase() || 'CNI'})</span>
                        <Eye className="w-2.5 h-2.5 ml-0.5 text-emerald-500" />
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                        <span>Pièce ID en attente (1ère connexion)</span>
                      </span>
                    )}

                    {/* Password Status Badge */}
                    {hasCustomPass ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-semibold">
                        <Lock className="w-3 h-3 text-sky-600" />
                        <span>Mot de passe personnalisé</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
                        <Key className="w-3 h-3 text-slate-500" />
                        <span>Code temporaire (à renouveler)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {hasIdScan && (
                      <button
                        type="button"
                        onClick={() => setViewingDocEmployee(emp)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                        title="Voir la pièce d'identité"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(
                            `Voulez-vous réinitialiser le mot de passe de ${emp.firstName} ${emp.lastName} ? L'employé devra obligatoirement en configurer un nouveau à sa prochaine connexion.`
                          )
                        ) {
                          resetEmployeePassword(emp.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                      title="Réinitialiser le mot de passe"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditEmployeeModal(emp)}
                      className="px-2.5 py-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg border border-slate-200 transition font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Modifier</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Confirmez-vous la suppression de l'employé ${emp.firstName} ${emp.lastName} ?`)) {
                          deleteEmployee(emp.id);
                        }
                      }}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Supprimer employé"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: JOBS & RBAC MATRIX */}
      {activeSubTab === 'jobs' && (
        userRole !== 'client' && userRole !== 'super_admin' && userRole !== 'owner' ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">
                Accès Restreint : Administrateur Client Uniquement
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                La configuration des postes de travail, des salaires de base et de la matrice des habilitations (RBAC) est strictement réservée au compte Administrateur Principal du pressing.
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab('employees')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Retourner aux Fiches Employés
            </button>
          </div>
        ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenantJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-slate-300 transition-all text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                    <p className="text-[11px] text-slate-500">{job.department}</p>
                  </div>
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                    {job.code}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">{job.description}</p>

                {/* Salary details */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rémunération de base :</span>
                    <span className="font-mono font-bold text-slate-900">{formatFCFA(job.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Horaires & Jours :</span>
                    <span className="font-medium text-slate-700">
                      {job.workingHours} ({job.workingDays.length}j/sem)
                    </span>
                  </div>
                </div>

                {/* Permissions Highlights */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Permissions clés :</span>
                  <div className="flex flex-wrap gap-1">
                    {job.permissions.canCreateOrder && (
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                        Créer Dépôts
                      </span>
                    )}
                    {job.permissions.canAcceptPayment && (
                      <span className="text-[9px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded border border-sky-200">
                        Encaisser
                      </span>
                    )}
                    {job.permissions.canCloseCaisse && (
                      <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                        Clôturer Caisse
                      </span>
                    )}
                    {job.permissions.canChangeOrderStatus && (
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                        Avancer Statuts
                      </span>
                    )}
                    {job.permissions.canDeliverOrder && (
                      <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                        Livraisons
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <div className="pt-2 border-t border-slate-100 text-right">
                  <button
                    onClick={() => {
                      setEditingJob(job);
                      setJobTitle(job.title);
                      setJobCode(job.code);
                      setJobDepartment(job.department);
                      setJobDescription(job.description);
                      setJobContractType(job.contractType);
                      setJobBaseSalary(job.baseSalary);
                      setJobRemunMode(job.remunerationMode);
                      setJobCommission(job.commissionRate || 0);
                      setJobHours(job.workingHours);
                      setJobDays(job.workingDays);
                      setJobPermissions(job.permissions);
                      setShowJobModal(true);
                    }}
                    className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 font-semibold cursor-pointer"
                  >
                    Modifier Permissions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )
      )}

      {/* MODAL: CREATE / EDIT EMPLOYEE */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 border border-slate-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingEmployee ? "Modifier la fiche de l'employé" : 'Créer un nouvel employé'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Renseignez les informations obligatoires : Nom, Prénom, Téléphone, Rôle et Pièce d'identité.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEmployeeModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              {/* SECTION 1 : INFORMATIONS ESSENTIELLES (NOM, PRÉNOM, TÉLÉPHONE, RÔLE) */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                  1. Informations Principales Requis par l'Administrateur
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Nom de famille <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={empLastName}
                      onChange={(e) => setEmpLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 bg-white"
                      placeholder="Ex: Soro"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Prénoms <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={empFirstName}
                      onChange={(e) => setEmpFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 bg-white"
                      placeholder="Ex: Bakary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Numéro de téléphone & WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={empPhone}
                      onChange={(e) => {
                        setEmpPhone(e.target.value);
                        setEmpWhatsapp(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 bg-white"
                      placeholder="+225 07 01 23 45 67"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Rôle & Poste de Travail <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={empJobPositionId}
                      onChange={(e) => {
                        setEmpJobPositionId(e.target.value);
                        const j = tenantJobs.find((job) => job.id === e.target.value);
                        if (j) {
                          setEmpRole(j.title);
                          setEmpSalary(j.baseSalary);
                          setEmpCommissionRate(j.commissionRate || 0);
                          setEmpContractType(j.contractType);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 bg-white"
                    >
                      {tenantJobs.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title} ({j.department})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2 : SCAN OU PHOTO DE LA PIÈCE D'IDENTITÉ */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-sky-500" />
                    2. Scan ou Photo de la Pièce d'Identité
                  </span>

                  <button
                    type="button"
                    onClick={handleInsertSampleDoc}
                    className="text-[11px] text-sky-600 hover:text-sky-800 underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Générer un spécimen CNI</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Type de Document</label>
                    <select
                      value={empDocType}
                      onChange={(e) => setEmpDocType(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="cni">Carte Nationale d'Identité (CNI ONECI)</option>
                      <option value="passport">Passeport Biométrique</option>
                      <option value="attestation">Attestation d'Identité</option>
                      <option value="permis">Permis de Conduire</option>
                      <option value="consulaire">Carte Consulaire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">N° de Pièce / NNI</label>
                    <input
                      type="text"
                      value={empDocNumber}
                      onChange={(e) => setEmpDocNumber(e.target.value)}
                      placeholder="Ex: CI-002849102"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono uppercase bg-white"
                    />
                  </div>
                </div>

                {/* Upload & Preview */}
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={empFileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*,.pdf"
                    className="hidden"
                  />

                  {empScanUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-200">
                      <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
                        <img
                          src={empScanUrl}
                          alt="Pièce"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 truncate">
                        <p className="font-bold text-slate-800 truncate text-xs">{empScanName || 'scan_piece.png'}</p>
                        <p className="text-[10px] text-emerald-600 font-semibold">✓ Document attaché</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => empFileInputRef.current?.click()}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer"
                      >
                        Changer
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => empFileInputRef.current?.click()}
                      className="p-4 border-2 border-dashed border-slate-300 hover:border-amber-400 bg-white rounded-xl text-center cursor-pointer transition flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800"
                    >
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span>Importer la photo ou le scan de la pièce (JPG, PNG, PDF)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3 : CONTRAT & RENSEIGNEMENTS COMPLÉMENTAIRES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Matricule</label>
                  <input
                    type="text"
                    value={empMatricule}
                    onChange={(e) => setEmpMatricule(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-mono font-bold bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Agence d'affectation</label>
                  <select
                    value={empEstablishmentId}
                    onChange={(e) => setEmpEstablishmentId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl"
                  >
                    {tenantEstablishments.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Salaire (FCFA)</label>
                  <input
                    type="number"
                    value={empSalary}
                    onChange={(e) => setEmpSalary(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingEmployee ? 'Enregistrer les modifications' : 'Enregistrer la fiche employé'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL: VIEW EMPLOYEE ID CARD DOCUMENT */}
      {viewingDocEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Pièce d'Identité : {viewingDocEmployee.firstName} {viewingDocEmployee.lastName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Type : {viewingDocEmployee.idCardDocumentType?.toUpperCase() || 'CNI'} • N°{' '}
                    {viewingDocEmployee.idCardNumber || 'Non renseigné'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingDocEmployee(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-res Image Preview */}
            <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 flex items-center justify-center min-h-[300px] overflow-hidden">
              {viewingDocEmployee.idCardScanUrl ? (
                <img
                  src={viewingDocEmployee.idCardScanUrl}
                  alt={`Pièce d'identité de ${viewingDocEmployee.fullName}`}
                  className="max-h-[420px] w-auto object-contain rounded-lg shadow-lg"
                />
              ) : (
                <p className="text-xs text-slate-500">Aucun scan fourni pour le moment.</p>
              )}
            </div>

            {/* Document Details Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-400">
              <span>
                Fichier : {viewingDocEmployee.idCardScanName || 'specimen_identite.png'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingDocEmployee(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOM JOB BUILDER */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">
                {editingJob ? 'Modifier le poste & les permissions RBAC' : 'Créer un poste sur-mesure'}
              </h3>
              <button
                type="button"
                onClick={() => setShowJobModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-bold mb-1">Intitulé du poste</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                    placeholder="Ex: Responsable Finition & Bazin"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={jobCode}
                    onChange={(e) => setJobCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Département</label>
                  <select
                    value={jobDepartment}
                    onChange={(e) => setJobDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  >
                    <option value="Atelier & Blanchisserie">Atelier & Blanchisserie</option>
                    <option value="Accueil & Caisse">Accueil & Caisse</option>
                    <option value="Finition & Repassage">Finition & Repassage</option>
                    <option value="Logistique & Livraison">Logistique & Livraison</option>
                    <option value="Direction & Exploitation">Direction & Exploitation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Salaire de base (FCFA)</label>
                  <input
                    type="number"
                    value={jobBaseSalary}
                    onChange={(e) => setJobBaseSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs"
                >
                  {editingJob ? 'Enregistrer modifications' : 'Créer le poste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREDEFINED JOB CATALOG */}
      {showPredefinedJobLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-7 border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Catalogue des Métiers du Pressing</h3>
                <p className="text-xs text-slate-500">Sélectionnez un profil préconfiguré pour l'importer dans vos postes.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPredefinedJobLibrary(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {PREDEFINED_JOBS_CATALOG.map((job, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-400 transition bg-slate-50 hover:bg-white space-y-2 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">{job.title}</h4>
                      <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-bold">
                        {job.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{job.department}</p>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{job.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800">{formatFCFA(job.baseSalary)}</span>
                    <button
                      onClick={() => handleImportPredefinedJob(job)}
                      className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-[11px] cursor-pointer"
                    >
                      Importer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
