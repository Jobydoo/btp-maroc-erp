'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import { Chantier, LotDQE, TacheDQE, BonLivraison, Depense, JournalChantier, MeteoType, TypeTravaux, StatutChantier, CategorieDepense } from '@/lib/types';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Layers,
  Boxes,
  Users,
  CreditCard,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Plus,
  MapPin,
  Phone,
  FileText,
  Camera,
  Sun,
  CloudRain,
  Wind,
  Cloud,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  X,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';

export default function FicheChantierPage() {
  const params = useParams();
  const router = useRouter();
  const chantierId = params.id as string;
  const [, setTick] = useState(0);

  const [activeTab, setActiveTab] = useState<'overview' | 'dqe' | 'materiaux' | 'equipe' | 'depenses' | 'journal'>('overview');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Modals state
  const [editChantierModalOpen, setEditChantierModalOpen] = useState(false);
  const [blModalOpen, setBlModalOpen] = useState(false);
  const [depenseModalOpen, setDepenseModalOpen] = useState(false);
  const [journalModalOpen, setJournalModalOpen] = useState(false);

  // Lot & Task Modals State
  const [lotModalOpen, setLotModalOpen] = useState(false);
  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [lotTitre, setLotTitre] = useState('');

  const [tacheModalOpen, setTacheModalOpen] = useState(false);
  const [targetLotId, setTargetLotId] = useState<string | null>(null);
  const [editingTacheId, setEditingTacheId] = useState<string | null>(null);
  const [tacheDesignation, setTacheDesignation] = useState('');
  const [tacheUnite, setTacheUnite] = useState('m³');
  const [tacheQte, setTacheQte] = useState('50');
  const [tachePU, setTachePU] = useState('450');

  // Edit Depense Modal State
  const [editDepenseModalOpen, setEditDepenseModalOpen] = useState(false);
  const [editingDepenseId, setEditingDepenseId] = useState<string | null>(null);
  const [editDepDesignation, setEditDepDesignation] = useState('');
  const [editDepCategorie, setEditDepCategorie] = useState<CategorieDepense>('LOCATION_ENGINS');
  const [editDepMontant, setEditDepMontant] = useState('5000');
  const [editDepFournisseur, setEditDepFournisseur] = useState('');

  // Edit Journal Modal State
  const [editJournalModalOpen, setEditJournalModalOpen] = useState(false);
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [editJTravaux, setEditJTravaux] = useState('');
  const [editJIncidents, setEditJIncidents] = useState('');
  const [editJEffectif, setEditJEffectif] = useState('10');
  const [editJMeteo, setEditJMeteo] = useState<MeteoType>('ENSOLEILLE');
  const [editJTemp, setEditJTemp] = useState('26');

  // New BL Form State
  const [blNumero, setBlNumero] = useState('');
  const [blFournisseurId, setBlFournisseurId] = useState(store.fournisseurs[0]?.id || '');
  const [blMateriauId, setBlMateriauId] = useState(store.materiaux[0]?.id || '');
  const [blQuantite, setBlQuantite] = useState('100');
  const [blPrixUnitaire, setBlPrixUnitaire] = useState('78.50');
  const [blNotes, setBlNotes] = useState('');

  // New Depense Form State
  const [depDesignation, setDepDesignation] = useState('');
  const [depCategorie, setDepCategorie] = useState<CategorieDepense>('LOCATION_ENGINS');
  const [depMontantHT, setDepMontantHT] = useState('5000');
  const [depFournisseur, setDepFournisseur] = useState('');

  // New Journal Report Form State
  const [jMeteo, setJMeteo] = useState<MeteoType>('ENSOLEILLE');
  const [jTemperature, setJTemperature] = useState('25');
  const [jEffectif, setJEffectif] = useState('9');
  const [jTravaux, setJTravaux] = useState('');
  const [jIncidents, setJIncidents] = useState('');
  const [jPhotoUrl, setJPhotoUrl] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800');
  const [jPhotoLegende, setJPhotoLegende] = useState('Avancement travaux du jour');

  // Edit Chantier Form State
  const [cNom, setCNom] = useState('');
  const [cMaitreOuvrage, setCMaitreOuvrage] = useState('');
  const [cTel, setCTel] = useState('');
  const [cIce, setCIce] = useState('');
  const [cVille, setCVille] = useState('Casablanca');
  const [cAdresse, setCAdresse] = useState('');
  const [cType, setCType] = useState<TypeTravaux>('GROS_OEUVRE');
  const [cBudget, setCBudget] = useState('2500000');
  const [cStatut, setCStatut] = useState<StatutChantier>('EN_COURS');
  const [cDateDebut, setCDateDebut] = useState('');
  const [cDateFin, setCDateFin] = useState('');
  const [cNotes, setCNotes] = useState('');

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const showNotification = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 3500);
  };

  const chantier = store.chantiers.find(c => c.id === chantierId);
  const lots = store.lotsDQE.filter(l => l.chantierId === chantierId);
  const bonsLivraison = store.bonsLivraison.filter(bl => bl.chantierId === chantierId);
  const depenses = store.depenses.filter(d => d.chantierId === chantierId);
  const journaux = store.journaux.filter(j => j.chantierId === chantierId);
  const ouvriers = store.ouvriers;

  if (!chantier) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <h2 className="text-lg font-bold text-slate-900">Chantier non trouvé</h2>
        <p className="text-xs text-slate-500 mt-1">Le chantier demandé n'existe pas ou a été supprimé.</p>
        <Link href="/chantiers" className="mt-4 inline-block px-4 py-2 bg-btp-orange text-white rounded-lg text-xs font-bold">
          Retour aux chantiers
        </Link>
      </div>
    );
  }

  // --- Chantier Actions ---
  const openEditChantierModal = () => {
    setCNom(chantier.nom);
    setCMaitreOuvrage(chantier.maitreOuvrage);
    setCTel(chantier.telClient || '');
    setCIce(chantier.iceClient || '');
    setCVille(chantier.ville);
    setCAdresse(chantier.adresse || '');
    setCType(chantier.typeTravaux);
    setCBudget(String(chantier.budgetTotalMAD));
    setCStatut(chantier.statut);
    setCDateDebut(chantier.dateDebut);
    setCDateFin(chantier.dateFinPrevue);
    setCNotes(chantier.notes || '');
    setEditChantierModalOpen(true);
  };

  const handleSaveChantierEdit = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateChantier(chantier.id, {
      nom: cNom,
      maitreOuvrage: cMaitreOuvrage,
      telClient: cTel,
      iceClient: cIce,
      ville: cVille,
      adresse: cAdresse,
      typeTravaux: cType,
      budgetTotalMAD: parseFloat(cBudget) || 0,
      statut: cStatut,
      dateDebut: cDateDebut,
      dateFinPrevue: cDateFin,
      notes: cNotes
    });
    setEditChantierModalOpen(false);
    showNotification(`Chantier "${cNom}" mis à jour avec succès.`);
  };

  const handleDuplicateChantier = () => {
    const clone = store.duplicateChantier(chantier.id);
    if (clone) {
      showNotification(`Chantier dupliqué : "${clone.nom}" (${clone.code}).`);
      router.push(`/chantiers/${clone.id}`);
    }
  };

  const handleDeleteChantier = () => {
    if (window.confirm(`Confirmez-vous la suppression définitive du chantier "${chantier.nom}" (${chantier.code}) ?`)) {
      const ok = store.deleteChantier(chantier.id);
      if (ok) {
        router.push('/chantiers');
      }
    }
  };

  // --- Lot DQE Actions ---
  const openCreateLotModal = () => {
    setEditingLotId(null);
    setLotTitre('');
    setLotModalOpen(true);
  };

  const openEditLotModal = (lot: LotDQE) => {
    setEditingLotId(lot.id);
    setLotTitre(lot.titre);
    setLotModalOpen(true);
  };

  const handleSaveLot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotTitre) return;

    if (editingLotId) {
      store.updateLotDQE(editingLotId, { titre: lotTitre });
      showNotification(`Lot mis à jour : "${lotTitre}".`);
    } else {
      store.addLotDQE(chantier.id, lotTitre);
      showNotification(`Nouveau lot ajouté : "${lotTitre}".`);
    }
    setLotModalOpen(false);
  };

  const handleDuplicateLot = (lotId: string, titre: string) => {
    const clone = store.duplicateLotDQE(lotId);
    if (clone) {
      showNotification(`Lot dupliqué : "${clone.titre}".`);
    }
  };

  const handleDeleteLot = (lotId: string, titre: string) => {
    if (window.confirm(`Supprimer le lot "${titre}" et toutes ses tâches ?`)) {
      store.deleteLotDQE(lotId);
      showNotification(`Lot "${titre}" supprimé.`);
    }
  };

  // --- Tache DQE Actions ---
  const openCreateTacheModal = (lotId: string) => {
    setTargetLotId(lotId);
    setEditingTacheId(null);
    setTacheDesignation('');
    setTacheUnite('m³');
    setTacheQte('50');
    setTachePU('450');
    setTacheModalOpen(true);
  };

  const openEditTacheModal = (lotId: string, t: TacheDQE) => {
    setTargetLotId(lotId);
    setEditingTacheId(t.id);
    setTacheDesignation(t.designation);
    setTacheUnite(t.unite);
    setTacheQte(String(t.quantitePrevue));
    setTachePU(String(t.prixUnitaireHT));
    setTacheModalOpen(true);
  };

  const handleSaveTache = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLotId || !tacheDesignation) return;

    if (editingTacheId) {
      store.updateTacheDQE(targetLotId, editingTacheId, {
        designation: tacheDesignation,
        unite: tacheUnite as any,
        quantitePrevue: parseFloat(tacheQte) || 1,
        prixUnitaireHT: parseFloat(tachePU) || 0
      });
      showNotification(`Tâche "${tacheDesignation}" modifiée.`);
    } else {
      store.addTacheDQE(targetLotId, {
        designation: tacheDesignation,
        unite: tacheUnite as any,
        quantitePrevue: parseFloat(tacheQte) || 1,
        prixUnitaireHT: parseFloat(tachePU) || 0
      });
      showNotification(`Tâche "${tacheDesignation}" ajoutée au lot.`);
    }
    setTacheModalOpen(false);
  };

  const handleDuplicateTache = (lotId: string, tacheId: string) => {
    const clone = store.duplicateTacheDQE(lotId, tacheId);
    if (clone) {
      showNotification(`Tâche dupliquée : "${clone.designation}".`);
    }
  };

  const handleDeleteTache = (lotId: string, tacheId: string, designation: string) => {
    if (window.confirm(`Supprimer la tâche "${designation}" ?`)) {
      store.deleteTacheDQE(lotId, tacheId);
      showNotification(`Tâche "${designation}" supprimée.`);
    }
  };

  // --- Dépense Actions ---
  const handleCreateDepense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depDesignation) return;

    store.addDepense({
      chantierId: chantier.id,
      date: new Date().toISOString().split('T')[0],
      categorie: depCategorie,
      designation: depDesignation,
      montantHT: parseFloat(depMontantHT) || 0,
      fournisseurNom: depFournisseur,
      payePar: 'Compte Chantier'
    });

    setDepenseModalOpen(false);
    setDepDesignation('');
    showNotification("Dépense enregistrée et imputée sur le coût du chantier !");
  };

  const openEditDepenseModal = (d: Depense) => {
    setEditingDepenseId(d.id);
    setEditDepDesignation(d.designation);
    setEditDepCategorie(d.categorie);
    setEditDepMontant(String(d.montantHT));
    setEditDepFournisseur(d.fournisseurNom || '');
    setEditDepenseModalOpen(true);
  };

  const handleSaveDepenseEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepenseId) return;

    store.updateDepense(editingDepenseId, {
      designation: editDepDesignation,
      categorie: editDepCategorie,
      montantHT: parseFloat(editDepMontant) || 0,
      fournisseurNom: editDepFournisseur
    });

    setEditDepenseModalOpen(false);
    showNotification("Dépense modifiée avec succès.");
  };

  const handleDuplicateDepense = (id: string) => {
    const clone = store.duplicateDepense(id);
    if (clone) {
      showNotification(`Dépense dupliquée : "${clone.designation}".`);
    }
  };

  const handleDeleteDepense = (id: string, desig: string) => {
    if (window.confirm(`Supprimer la dépense "${desig}" ? Le coût réel du chantier sera diminué.`)) {
      store.deleteDepense(id);
      showNotification(`Dépense "${desig}" supprimée.`);
    }
  };

  // --- Quick BL Submit ---
  const handleCreateBL = (e: React.FormEvent) => {
    e.preventDefault();
    const mat = store.materiaux.find(m => m.id === blMateriauId);
    const qty = parseFloat(blQuantite) || 1;
    const pu = parseFloat(blPrixUnitaire) || (mat?.prixUnitaireMoyenMAD || 100);

    const blNum = blNumero || `BL-${Date.now().toString().substring(8)}`;
    const blId = 'bl-' + Date.now();
    store.enregistrerBonLivraison({
      numeroBL: blNum,
      chantierId: chantier.id,
      fournisseurId: blFournisseurId,
      dateLivraison: new Date().toISOString().split('T')[0],
      items: [
        {
          id: 'bli-' + Date.now(),
          blId,
          materiauId: blMateriauId,
          designation: mat?.designation || 'Matériau',
          quantite: qty,
          unite: mat?.unite || 'U',
          prixUnitaireHT: pu,
          totalHT: qty * pu
        }
      ],
      statut: 'CONFORME',
      receptionneParId: store.currentUser.id,
      notes: blNotes
    });

    setBlModalOpen(false);
    setBlNumero('');
    showNotification("Bon de Livraison réceptionné ! Coût imputé et stocks mis à jour.");
  };

  // --- Quick Journal Submit ---
  const handleCreateJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jTravaux) return;

    store.ajouterRapportJournal({
      chantierId: chantier.id,
      date: new Date().toISOString().split('T')[0],
      meteo: jMeteo,
      temperature: parseInt(jTemperature, 10) || 24,
      effectifPresent: parseInt(jEffectif, 10) || 8,
      travauxExecutes: jTravaux,
      problemesIncidents: jIncidents || 'Aucun incident à signaler.',
      consignesSecurite: 'Port des EPI vérifié. Sécurité des zones de coulage et tranchées assurée.',
      photos: jPhotoUrl ? [{ url: jPhotoUrl, legende: jPhotoLegende }] : [],
      redigeParId: store.currentUser.id
    });

    setJournalModalOpen(false);
    setJTravaux('');
    setJIncidents('');
    showNotification("Rapport journalier enregistré !");
  };

  const getMeteoIcon = (m: MeteoType) => {
    switch (m) {
      case 'ENSOLEILLE': return <Sun className="w-4 h-4 text-amber-500" />;
      case 'PLUVIEUX': return <CloudRain className="w-4 h-4 text-blue-500" />;
      case 'VENT_FORT': return <Wind className="w-4 h-4 text-slate-500" />;
      default: return <Cloud className="w-4 h-4 text-slate-400" />;
    }
  };

  const soldeRestantMAD = chantier.budgetTotalMAD - chantier.coutReelTotalMAD;
  const isBudgetDepasse = soldeRestantMAD < 0;

  return (
    <div className="space-y-6">
      
      {/* Alert Notification */}
      {alertMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{alertMessage}</span>
          </div>
          <button onClick={() => setAlertMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Navigation & Breadcrumb with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/chantiers"
            className="p-2 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition-all"
            title="Retour à la liste des chantiers"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-btp-orange bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                {chantier.code}
              </span>
              <span className="text-xs font-bold text-slate-500">
                {chantier.ville}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                {chantier.statut}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {chantier.nom}
            </h1>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openEditChantierModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-300 text-blue-700 text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Edit className="w-3.5 h-3.5 text-blue-600" />
            Modifier Chantier
          </button>

          <button
            onClick={handleDuplicateChantier}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 border border-slate-300 text-emerald-700 text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-600" />
            Dupliquer
          </button>

          <button
            onClick={handleDeleteChantier}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 border border-slate-300 text-rose-700 text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            Supprimer
          </button>

          <button
            onClick={() => setBlModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Boxes className="w-3.5 h-3.5 text-btp-orange" />
            Réceptionner BL
          </button>

          <button
            onClick={() => setJournalModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-btp-orange hover:bg-btp-orange-dark text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Rapport Journalier
          </button>
        </div>
      </div>

      {/* Progress & Financial Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Avancement Global */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Avancement Physique
          </span>
          <div className="text-2xl font-extrabold text-btp-orange">
            {chantier.avancementGlobalPct} %
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-btp-orange h-full rounded-full transition-all duration-500"
              style={{ width: `${chantier.avancementGlobalPct}%` }}
            ></div>
          </div>
        </div>

        {/* Budget Marché */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Budget Global Marché
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatMAD(chantier.budgetTotalMAD)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Type : {chantier.typeTravaux}
          </p>
        </div>

        {/* Dépenses Engagées */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Coût Réel Consommé
          </span>
          <div className="text-xl font-bold text-slate-800 mt-1">
            {formatMAD(chantier.coutReelTotalMAD)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {Math.round((chantier.coutReelTotalMAD / (chantier.budgetTotalMAD || 1)) * 100)}% du budget utilisé
          </p>
        </div>

        {/* Solde Disponible */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Solde Prévisionnel
          </span>
          <div className={`text-xl font-bold mt-1 ${isBudgetDepasse ? 'text-rose-600' : 'text-emerald-600'}`}>
            {formatMAD(soldeRestantMAD)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isBudgetDepasse ? 'Dépassement de budget' : 'Marge résiduelle'}
          </p>
        </div>

      </div>

      {/* Navigation Tabs (6 Onglets Métier) */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: Building2 },
            { id: 'dqe', label: `Lots & Tâches DQE (${lots.length})`, icon: Layers },
            { id: 'materiaux', label: `Matériaux & BL (${bonsLivraison.length})`, icon: Boxes },
            { id: 'equipe', label: `Équipe & Pointage (${ouvriers.length})`, icon: Users },
            { id: 'depenses', label: `Dépenses & Déboursés (${depenses.length})`, icon: CreditCard },
            { id: 'journal', label: `Journal & Photos (${journaux.length})`, icon: ClipboardList }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-btp-orange text-btp-orange'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB 1: VUE D'ENSEMBLE */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-btp-orange" />
                Informations Contractuelles & Intervenants
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Maître d'Ouvrage (Client)</span>
                  <strong className="text-slate-900 text-sm">{chantier.maitreOuvrage}</strong>
                  {chantier.iceClient && <p className="text-[11px] font-mono text-slate-500">ICE : {chantier.iceClient}</p>}
                </div>
                <div>
                  <span className="text-slate-400 block">Contact & Téléphone</span>
                  <strong className="text-slate-800">{chantier.telClient || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Emplacement & Ville</span>
                  <strong className="text-slate-800">{chantier.ville} — {chantier.adresse || 'Centre-ville'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Calendrier des Travaux</span>
                  <strong className="text-slate-800">{formatDateFR(chantier.dateDebut)} &rarr; {formatDateFR(chantier.dateFinPrevue)}</strong>
                </div>
              </div>
              {chantier.notes && (
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                  <strong>Notes : </strong> {chantier.notes}
                </div>
              )}
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Répartition des Dépenses Réelles
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Matériaux & Béton', montant: depenses.filter(d => d.categorie === 'MATERIAUX').reduce((s, d) => s + d.montantHT, 0), color: 'bg-blue-500' },
                  { label: 'Main-d\'œuvre & Équipes', montant: depenses.filter(d => d.categorie === 'MAIN_DOEUVRE').reduce((s, d) => s + d.montantHT, 0) || 120000, color: 'bg-btp-orange' },
                  { label: 'Location Engins & Pelles', montant: depenses.filter(d => d.categorie === 'LOCATION_ENGINS').reduce((s, d) => s + d.montantHT, 0), color: 'bg-amber-500' },
                  { label: 'Frais Généraux & Études', montant: depenses.filter(d => d.categorie === 'FRAIS_GENERAUX').reduce((s, d) => s + d.montantHT, 0), color: 'bg-slate-600' }
                ].map((item, idx) => {
                  const pct = chantier.coutReelTotalMAD > 0 ? Math.round((item.montant / chantier.coutReelTotalMAD) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <div>
                          <strong className="text-slate-900">{formatMAD(item.montant)}</strong>
                          <span className="text-[11px] text-slate-400 ml-1.5">({pct}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`${item.color} h-full rounded-full`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-xl text-white shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-btp-orange">Conditions Terrain</span>
                <span className="text-xs text-slate-400">{chantier.ville}</span>
              </div>
              <div className="flex items-center gap-4">
                <Sun className="w-10 h-10 text-amber-400 animate-pulse" />
                <div>
                  <div className="text-2xl font-black">26° C</div>
                  <div className="text-xs text-slate-300">Ensoleillé — Conditions idéales pour coulage béton</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Décomptes Émis</h3>
                <Link href="/devis" className="text-[11px] font-bold text-btp-orange hover:underline">Voir tous &rarr;</Link>
              </div>
              {store.decomptes.filter(d => d.chantierId === chantier.id).map(dec => (
                <div key={dec.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">{dec.numero}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">{dec.statut}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Avancement : {dec.pourcentageCumule}%</span>
                    <strong className="text-slate-900">{formatMAD(dec.montantTTC)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOTS & TÂCHES DQE AVEC ACTIONS MODIFIER, DUPLIQUER, SUPPRIMER */}
      {activeTab === 'dqe' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Lots DQE & Bordereau des Prix Unitaires
              </h2>
              <p className="text-xs text-slate-500">
                Vous pouvez ajouter, modifier, dupliquer et supprimer des lots ou des tâches individuelles.
              </p>
            </div>
            <button
              onClick={openCreateLotModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-btp-orange hover:bg-btp-orange-dark text-white rounded-lg text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Ajouter un Lot
            </button>
          </div>

          <div className="space-y-5">
            {lots.map((lot) => (
              <div key={lot.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Lot Header with Actions */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{lot.titre}</h3>
                    <p className="text-xs text-slate-500">
                      Budget alloué : <strong>{formatMAD(lot.budgetLotMAD)}</strong> • {lot.taches.length} tâche(s)
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Avancement Lot</span>
                      <strong className="text-xs font-bold text-btp-orange">{lot.avancementPct} %</strong>
                    </div>

                    <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                      <button
                        onClick={() => openCreateTacheModal(lot.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-bold text-slate-700"
                        title="Ajouter une tâche dans ce lot"
                      >
                        <Plus className="w-3 h-3 text-btp-orange" />
                        Tâche
                      </button>

                      <button
                        onClick={() => openEditLotModal(lot)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Modifier le titre du lot"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDuplicateLot(lot.id, lot.titre)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                        title="Dupliquer ce lot"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteLot(lot.id, lot.titre)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Supprimer ce lot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tâches du Lot */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-4">Désignation des Travaux</th>
                        <th className="py-2.5 px-2 text-center">Unité</th>
                        <th className="py-2.5 px-2 text-right">Qté Prévue</th>
                        <th className="py-2.5 px-2 text-right">P.U. HT</th>
                        <th className="py-2.5 px-2 text-right">Total HT</th>
                        <th className="py-2.5 px-3 text-center">Qté Réalisée</th>
                        <th className="py-2.5 px-3 text-right">Avancement</th>
                        <th className="py-2.5 px-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lot.taches.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-800 max-w-xs">{t.designation}</td>
                          <td className="py-3 px-2 text-center text-slate-500 font-mono">{t.unite}</td>
                          <td className="py-3 px-2 text-right text-slate-700">{t.quantitePrevue.toLocaleString('fr-FR')}</td>
                          <td className="py-3 px-2 text-right text-slate-700">{formatMAD(t.prixUnitaireHT)}</td>
                          <td className="py-3 px-2 text-right font-bold text-slate-900">{formatMAD(t.totalHT)}</td>
                          
                          {/* Saisie de la Quantité Réalisée */}
                          <td className="py-3 px-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={t.quantiteRealisee}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                store.updateTacheAvancement(chantier.id, lot.id, t.id, val);
                              }}
                              className="w-20 px-2 py-1 text-center font-bold text-xs bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-btp-orange focus:outline-none"
                            />
                          </td>

                          {/* Progression Tâche */}
                          <td className="py-3 px-3 text-right">
                            <span className={`inline-block font-bold text-xs px-2 py-0.5 rounded-full ${
                              t.avancementPct >= 100
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.avancementPct > 0
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {t.avancementPct} %
                            </span>
                          </td>

                          {/* Actions Tâche : Modifier, Dupliquer, Supprimer */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openEditTacheModal(lot.id, t)}
                                title="Modifier cette tâche"
                                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDuplicateTache(lot.id, t.id)}
                                title="Dupliquer cette tâche"
                                className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTache(lot.id, t.id, t.designation)}
                                title="Supprimer cette tâche"
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MATÉRIAUX & BONS DE LIVRAISON */}
      {activeTab === 'materiaux' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Bons de Livraison (BL) Réceptionnés sur ce Chantier
              </h2>
              <p className="text-xs text-slate-500">
                Chaque BL enregistré impute son coût sur le chantier et met à jour les stocks.
              </p>
            </div>
            <button
              onClick={() => setBlModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-btp-orange hover:bg-btp-orange-dark text-white text-xs font-bold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Réceptionner un BL
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">N° BL</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Fournisseur</th>
                    <th className="py-3 px-3">Articles & Quantités</th>
                    <th className="py-3 px-3 text-right">Montant HT</th>
                    <th className="py-3 px-3 text-right">Montant TTC</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bonsLivraison.map((bl) => {
                    const fourn = store.fournisseurs.find(f => f.id === bl.fournisseurId);
                    return (
                      <tr key={bl.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{bl.numeroBL}</td>
                        <td className="py-3 px-3 text-slate-600">{formatDateFR(bl.dateLivraison)}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{fourn?.nom || 'Fournisseur'}</td>
                        <td className="py-3 px-3 text-slate-600">
                          {bl.items.map(it => `${it.designation} (${it.quantite} ${it.unite})`).join(', ')}
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-700">{formatMAD(bl.montantTotalHT)}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">{formatMAD(bl.montantTTC)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="btp-badge bg-emerald-100 text-emerald-800">
                            {bl.statut}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => store.duplicateBonLivraison(bl.id)}
                              title="Dupliquer ce BL"
                              className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Supprimer le BL ${bl.numeroBL} ? Les stocks et le coût réel seront réajustés.`)) {
                                  store.deleteBonLivraison(bl.id);
                                  showNotification(`BL ${bl.numeroBL} supprimé.`);
                                }
                              }}
                              title="Supprimer ce BL"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ÉQUIPE & POINTAGE QUOTIDIEN RAPIDE */}
      {activeTab === 'equipe' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Pointage des Ouvriers du Chantier
              </h2>
              <p className="text-xs text-slate-500">
                Pointez la présence journalière (1 = Présent, 0.5 = Demi-journée, 0 = Absent).
              </p>
            </div>
            <Link
              href="/ouvriers/pointage"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg"
            >
              Grille Multi-Chantiers &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Ouvrier</th>
                    <th className="py-3 px-3">CIN</th>
                    <th className="py-3 px-3">Spécialité</th>
                    <th className="py-3 px-3 text-right">Tarif / Jour</th>
                    <th className="py-3 px-4 text-center">Présence Aujourd'hui</th>
                    <th className="py-3 px-3 text-center">Heures Sup</th>
                    <th className="py-3 px-4 text-right">Coût Imputé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ouvriers.map((ouv) => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const pt = store.pointages.find(p => p.ouvrierId === ouv.id && p.chantierId === chantier.id && p.datePointage === todayStr) || {
                      valeurPresence: 1,
                      heuresSup: 0
                    };

                    const coutJour = ouv.tarifJourMAD * pt.valeurPresence + (pt.heuresSup * (ouv.tarifJourMAD / 8) * 1.25);

                    return (
                      <tr key={ouv.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{ouv.nom}</td>
                        <td className="py-3 px-3 font-mono text-slate-500">{ouv.cin}</td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                            {ouv.specialite}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-700">{formatMAD(ouv.tarifJourMAD)}</td>
                        
                        {/* Boutons Pointage Rapide */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                            {[
                              { label: '1j', val: 1 },
                              { label: '½j', val: 0.5 },
                              { label: '0', val: 0 }
                            ].map((btn) => (
                              <button
                                key={btn.label}
                                onClick={() => {
                                  store.enregistrerPointage({
                                    ouvrierId: ouv.id,
                                    chantierId: chantier.id,
                                    datePointage: todayStr,
                                    valeurPresence: btn.val,
                                    heuresSup: pt.heuresSup,
                                    valideParId: store.currentUser.id
                                  });
                                }}
                                className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                                  pt.valeurPresence === btn.val
                                    ? 'bg-btp-orange text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </td>

                        {/* Heures Sup */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="8"
                            value={pt.heuresSup}
                            onChange={(e) => {
                              const hs = parseInt(e.target.value, 10) || 0;
                              store.enregistrerPointage({
                                ouvrierId: ouv.id,
                                chantierId: chantier.id,
                                datePointage: todayStr,
                                valeurPresence: pt.valeurPresence,
                                heuresSup: hs,
                                valideParId: store.currentUser.id
                              });
                            }}
                            className="w-14 px-1.5 py-0.5 text-center text-xs border border-slate-200 rounded font-semibold"
                          />
                        </td>

                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {formatMAD(coutJour)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DÉPENSES & COÛTS CHANTIER AVEC ACTIONS */}
      {activeTab === 'depenses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Comptabilité Analytique des Dépenses Réelles
              </h2>
              <p className="text-xs text-slate-500">
                Vous pouvez ajouter, modifier, dupliquer ou effacer chaque écriture de dépense.
              </p>
            </div>
            <button
              onClick={() => setDepenseModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4 text-btp-orange" />
              Ajouter une Dépense
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-3">Catégorie</th>
                    <th className="py-3 px-4">Désignation</th>
                    <th className="py-3 px-3">Fournisseur / Tiers</th>
                    <th className="py-3 px-3">Règlement</th>
                    <th className="py-3 px-4 text-right">Montant HT</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {depenses.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-600 font-mono">{formatDateFR(dep.date)}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                          {dep.categorie}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{dep.designation}</td>
                      <td className="py-3 px-3 text-slate-600">{dep.fournisseurNom || '-'}</td>
                      <td className="py-3 px-3 text-slate-500">{dep.payePar}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{formatMAD(dep.montantHT)}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditDepenseModal(dep)}
                            title="Modifier cette dépense"
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicateDepense(dep.id)}
                            title="Dupliquer cette dépense"
                            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDepense(dep.id, dep.designation)}
                            title="Supprimer cette dépense"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: JOURNAL DE CHANTIER TERRAIN & PHOTOS AVEC ACTIONS */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Journal de Bord Quotidien du Chantier
              </h2>
              <p className="text-xs text-slate-500">
                Traçabilité des travaux, effectifs, conditions météo et photos de suivi.
              </p>
            </div>
            <button
              onClick={() => setJournalModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-btp-orange hover:bg-btp-orange-dark text-white text-xs font-bold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nouveau Rapport Journalier
            </button>
          </div>

          <div className="space-y-4">
            {journaux.map((jc) => (
              <div key={jc.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{formatDateFR(jc.date)}</span>
                    <span className="flex items-center gap-1 text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {getMeteoIcon(jc.meteo)} {jc.temperature}° C ({jc.meteo})
                    </span>
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded self-start">
                    Effectif présent : {jc.effectifPresent} ouvriers
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {jc.travauxExecutes}
                </p>

                {jc.problemesIncidents && (
                  <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <strong>Incidents / Problèmes :</strong> {jc.problemesIncidents}
                  </p>
                )}

                {jc.photos && jc.photos.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {jc.photos.map((ph, idx) => (
                      <div key={idx} className="rounded-lg overflow-hidden border border-slate-200">
                        <img src={ph.url} alt={ph.legende} className="w-full h-40 object-cover" />
                        <div className="p-2 bg-white text-[11px] text-slate-600 truncate">{ph.legende}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions Journal */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingJournalId(jc.id);
                      setEditJTravaux(jc.travauxExecutes);
                      setEditJIncidents(jc.problemesIncidents || '');
                      setEditJEffectif(String(jc.effectifPresent));
                      setEditJMeteo(jc.meteo);
                      setEditJTemp(String(jc.temperature));
                      setEditJournalModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 p-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Modifier
                  </button>
                  <button
                    onClick={() => store.duplicateRapportJournal(jc.id)}
                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-emerald-600 p-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Dupliquer
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Supprimer ce rapport du journal ?")) {
                        store.deleteRapportJournal(jc.id);
                        showNotification("Rapport supprimé.");
                      }
                    }}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* MODAL MODIFIER CHANTIER */}
      {editChantierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-btp-dark text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Modifier le Chantier</h3>
                <p className="text-xs text-slate-300">{chantier.code} — {chantier.nom}</p>
              </div>
              <button onClick={() => setEditChantierModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveChantierEdit} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nom du Chantier *</label>
                  <input
                    type="text"
                    required
                    value={cNom}
                    onChange={(e) => setCNom(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maître d'Ouvrage *</label>
                  <input
                    type="text"
                    required
                    value={cMaitreOuvrage}
                    onChange={(e) => setCMaitreOuvrage(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">N° ICE</label>
                  <input
                    type="text"
                    value={cIce}
                    onChange={(e) => setCIce(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={cVille}
                    onChange={(e) => setCVille(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={cTel}
                    onChange={(e) => setCTel(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={cAdresse}
                    onChange={(e) => setCAdresse(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Budget Total (MAD) *</label>
                  <input
                    type="number"
                    required
                    value={cBudget}
                    onChange={(e) => setCBudget(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Statut</label>
                  <select
                    value={cStatut}
                    onChange={(e) => setCStatut(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="PREPARATION">En préparation</option>
                    <option value="EN_COURS">En cours d'exécution</option>
                    <option value="EN_PAUSE">En pause</option>
                    <option value="LIVRE">Livré & Réceptionné</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date Début</label>
                  <input
                    type="date"
                    value={cDateDebut}
                    onChange={(e) => setCDateDebut(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date Fin Prévue</label>
                  <input
                    type="date"
                    value={cDateFin}
                    onChange={(e) => setCDateFin(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={cNotes}
                    onChange={(e) => setCNotes(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditChantierModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-btp-orange hover:bg-btp-orange-dark text-white font-bold rounded-lg"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRÉER / MODIFIER LOT DQE */}
      {lotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">{editingLotId ? 'Modifier le Titre du Lot' : 'Ajouter un Nouveau Lot DQE'}</h3>
              <button onClick={() => setLotModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveLot} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Titre du Lot *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 01. Terrassement & Fouilles, 02. Béton Armé..."
                  value={lotTitre}
                  onChange={(e) => setLotTitre(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLotModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-btp-orange hover:bg-btp-orange-dark text-white font-bold rounded-lg"
                >
                  {editingLotId ? 'Enregistrer' : 'Créer le Lot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRÉER / MODIFIER TÂCHE DQE */}
      {tacheModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">{editingTacheId ? 'Modifier la Tâche' : 'Ajouter une Tâche DQE'}</h3>
              <button onClick={() => setTacheModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveTache} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation de la Tâche / Poste *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Coulage béton armé dosé à 350 kg/m³..."
                  value={tacheDesignation}
                  onChange={(e) => setTacheDesignation(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unité</label>
                  <select
                    value={tacheUnite}
                    onChange={(e) => setTacheUnite(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg"
                  >
                    <option value="m³">m³</option>
                    <option value="m²">m²</option>
                    <option value="ml">ml</option>
                    <option value="Kg">Kg</option>
                    <option value="Tonne">Tonne</option>
                    <option value="Forfait">Forfait</option>
                    <option value="U">Unité</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qté Prévue *</label>
                  <input
                    type="number"
                    required
                    value={tacheQte}
                    onChange={(e) => setTacheQte(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">P.U. HT (MAD) *</label>
                  <input
                    type="number"
                    required
                    value={tachePU}
                    onChange={(e) => setTachePU(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTacheModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-btp-orange hover:bg-btp-orange-dark text-white font-bold rounded-lg"
                >
                  {editingTacheId ? 'Mettre à jour' : 'Ajouter Tâche'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER DÉPENSE */}
      {editDepenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Modifier la Dépense</h3>
              <button onClick={() => setEditDepenseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveDepenseEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation *</label>
                <input
                  type="text"
                  required
                  value={editDepDesignation}
                  onChange={(e) => setEditDepDesignation(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={editDepCategorie}
                    onChange={(e) => setEditDepCategorie(e.target.value as any)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg"
                  >
                    <option value="MATERIAUX">Matériaux</option>
                    <option value="MAIN_DOEUVRE">Main-d'œuvre</option>
                    <option value="LOCATION_ENGINS">Location Engins</option>
                    <option value="SOUS_TRAITANCE">Sous-traitance</option>
                    <option value="FRAIS_GENERAUX">Frais Généraux</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Montant HT (MAD) *</label>
                  <input
                    type="number"
                    required
                    value={editDepMontant}
                    onChange={(e) => setEditDepMontant(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fournisseur / Bénéficiaire</label>
                <input
                  type="text"
                  value={editDepFournisseur}
                  onChange={(e) => setEditDepFournisseur(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditDepenseModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-btp-orange hover:bg-btp-orange-dark text-white font-bold rounded-lg"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER JOURNAL */}
      {editJournalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Modifier le Rapport Journalier</h3>
              <button onClick={() => setEditJournalModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingJournalId) {
                store.updateRapportJournal(editingJournalId, {
                  travauxExecutes: editJTravaux,
                  problemesIncidents: editJIncidents,
                  effectifPresent: parseInt(editJEffectif, 10) || 10,
                  meteo: editJMeteo,
                  temperature: parseInt(editJTemp, 10) || 25
                });
                setEditJournalModalOpen(false);
                showNotification("Rapport de chantier modifié.");
              }
            }} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Travaux Exécutés *</label>
                <textarea
                  rows={3}
                  required
                  value={editJTravaux}
                  onChange={(e) => setEditJTravaux(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Incidents</label>
                <input
                  type="text"
                  value={editJIncidents}
                  onChange={(e) => setEditJIncidents(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Effectif Présent</label>
                  <input
                    type="number"
                    value={editJEffectif}
                    onChange={(e) => setEditJEffectif(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Température (°C)</label>
                  <input
                    type="number"
                    value={editJTemp}
                    onChange={(e) => setEditJTemp(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditJournalModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-btp-orange hover:bg-btp-orange-dark text-white font-bold rounded-lg"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOUVEAU BL */}
      {blModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-btp-dark text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Réceptionner un Bon de Livraison (BL)</h3>
                <p className="text-[11px] text-slate-300">Affectation directe des coûts matériaux sur {chantier.code}</p>
              </div>
              <button onClick={() => setBlModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBL} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">N° Bon de Livraison *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: BL-2026-9812"
                    value={blNumero}
                    onChange={(e) => setBlNumero(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fournisseur Agréé *</label>
                  <select
                    value={blFournisseurId}
                    onChange={(e) => setBlFournisseurId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  >
                    {store.fournisseurs.map(f => (
                      <option key={f.id} value={f.id}>{f.nom} ({f.ville})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Matériau Livré *</label>
                <select
                  value={blMateriauId}
                  onChange={(e) => {
                    setBlMateriauId(e.target.value);
                    const mat = store.materiaux.find(m => m.id === e.target.value);
                    if (mat) setBlPrixUnitaire(String(mat.prixUnitaireMoyenMAD));
                  }}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                >
                  {store.materiaux.map(m => (
                    <option key={m.id} value={m.id}>{m.designation} ({m.unite}) — Stock actuel: {m.stockActuel}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantité Reçue *</label>
                  <input
                    type="number"
                    required
                    value={blQuantite}
                    onChange={(e) => setBlQuantite(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prix Unitaire HT (MAD) *</label>
                  <input
                    type="number"
                    required
                    value={blPrixUnitaire}
                    onChange={(e) => setBlPrixUnitaire(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Montant Total HT imputé :</span>
                <strong className="text-slate-900 font-bold text-sm">
                  {formatMAD((parseFloat(blQuantite) || 0) * (parseFloat(blPrixUnitaire) || 0))}
                </strong>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBlModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 font-bold rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-btp-orange hover:bg-btp-orange-dark text-white font-bold rounded-lg shadow-sm"
                >
                  Valider la Réception BL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOUVELLE DÉPENSE */}
      {depenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Enregistrer une Dépense Directe</h3>
                <p className="text-[11px] text-slate-300">Imputation immédiate sur le coût réel de {chantier.code}</p>
              </div>
              <button onClick={() => setDepenseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDepense} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation de la Dépense *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Location pelle hydraulique 2 jours, analyse béton..."
                  value={depDesignation}
                  onChange={(e) => setDepDesignation(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catégorie *</label>
                  <select
                    value={depCategorie}
                    onChange={(e) => setDepCategorie(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  >
                    <option value="LOCATION_ENGINS">Location Engins & Pelles</option>
                    <option value="MAIN_DOEUVRE">Main-d'œuvre & Primes</option>
                    <option value="SOUS_TRAITANCE">Sous-traitance</option>
                    <option value="MATERIAUX">Achats Matériaux directs</option>
                    <option value="FRAIS_GENERAUX">Frais Généraux & Études</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Montant HT (MAD) *</label>
                  <input
                    type="number"
                    required
                    value={depMontantHT}
                    onChange={(e) => setDepMontantHT(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fournisseur / Prestataire</label>
                <input
                  type="text"
                  placeholder="Ex: Manutention & Levage Maroc, Société d'intérim..."
                  value={depFournisseur}
                  onChange={(e) => setDepFournisseur(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDepenseModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 font-bold rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Enregistrer la Dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOUVEAU RAPPORT JOURNALIER */}
      {journalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Rapport Journalier du Chantier</h3>
                <p className="text-[11px] text-slate-300">Journal de bord pour {chantier.nom}</p>
              </div>
              <button onClick={() => setJournalModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateJournal} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Météo</label>
                  <select
                    value={jMeteo}
                    onChange={(e) => setJMeteo(e.target.value as MeteoType)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  >
                    <option value="ENSOLEILLE">Ensoleillé</option>
                    <option value="PLUVIEUX">Pluvieux</option>
                    <option value="VENT_FORT">Vent fort</option>
                    <option value="CANICULE">Canicule</option>
                    <option value="NUAGEUX">Nuageux</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Température (°C)</label>
                  <input
                    type="number"
                    value={jTemperature}
                    onChange={(e) => setJTemperature(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Effectif Présent</label>
                  <input
                    type="number"
                    value={jEffectif}
                    onChange={(e) => setJEffectif(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Travaux Exécutés Aujourd'hui *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Coulage poteaux axe C-D, ferraillage poutres, pose briques..."
                  value={jTravaux}
                  onChange={(e) => setJTravaux(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Incidents ou Arrêts</label>
                <input
                  type="text"
                  placeholder="Ex: RAS ou retard toupie béton 30 min..."
                  value={jIncidents}
                  onChange={(e) => setJIncidents(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Photo de Terrain (URL)</label>
                <input
                  type="text"
                  value={jPhotoUrl}
                  onChange={(e) => setJPhotoUrl(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setJournalModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 font-bold rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-btp-orange hover:bg-btp-orange-dark text-white font-bold rounded-lg shadow-sm"
                >
                  Enregistrer le Rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
