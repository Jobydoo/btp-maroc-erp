'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import { Chantier, LotDQE, TacheDQE, BonLivraison, Depense, JournalChantier, MeteoType } from '@/lib/types';
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
  X
} from 'lucide-react';

export default function FicheChantierPage() {
  const params = useParams();
  const router = useRouter();
  const chantierId = params.id as string;
  const [, setTick] = useState(0);

  const [activeTab, setActiveTab] = useState<'overview' | 'dqe' | 'materiaux' | 'equipe' | 'depenses' | 'journal'>('overview');

  // Modals state
  const [blModalOpen, setBlModalOpen] = useState(false);
  const [depenseModalOpen, setDepenseModalOpen] = useState(false);
  const [journalModalOpen, setJournalModalOpen] = useState(false);

  // New BL Form State
  const [blNumero, setBlNumero] = useState('');
  const [blFournisseurId, setBlFournisseurId] = useState(store.fournisseurs[0]?.id || '');
  const [blMateriauId, setBlMateriauId] = useState(store.materiaux[0]?.id || '');
  const [blQuantite, setBlQuantite] = useState('100');
  const [blPrixUnitaire, setBlPrixUnitaire] = useState('78.50');
  const [blNotes, setBlNotes] = useState('');

  // New Depense Form State
  const [depDesignation, setDepDesignation] = useState('');
  const [depCategorie, setDepCategorie] = useState<'MATERIAUX' | 'MAIN_DOEUVRE' | 'LOCATION_ENGINS' | 'SOUS_TRAITANCE' | 'FRAIS_GENERAUX'>('LOCATION_ENGINS');
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

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

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
        <p className="text-xs text-slate-500 mt-1">Le chantier demandé n'existe pas ou a été déplacé.</p>
        <Link href="/chantiers" className="mt-4 inline-block px-4 py-2 bg-btp-orange text-white rounded-lg text-xs font-bold">
          Retour aux chantiers
        </Link>
      </div>
    );
  }

  // Quick BL Submit
  const handleCreateBL = (e: React.FormEvent) => {
    e.preventDefault();
    const mat = store.materiaux.find(m => m.id === blMateriauId);
    const qty = parseFloat(blQuantite) || 1;
    const pu = parseFloat(blPrixUnitaire) || (mat?.prixUnitaireMoyenMAD || 100);

    store.enregistrerBonLivraison({
      numeroBL: blNumero || `BL-${Date.now().toString().substring(8)}`,
      dateLivraison: new Date().toISOString().split('T')[0],
      chantierId: chantier.id,
      fournisseurId: blFournisseurId,
      statut: 'CONFORME',
      receptionneParId: store.currentUser.id,
      notes: blNotes,
      items: [
        {
          id: 'bli-' + Date.now(),
          blId: '',
          materiauId: blMateriauId,
          designation: mat?.designation || 'Matériau BTP',
          quantite: qty,
          unite: mat?.unite || 'U',
          prixUnitaireHT: pu,
          totalHT: qty * pu
        }
      ]
    });

    setBlModalOpen(false);
    setBlNumero('');
    setBlNotes('');
  };

  // Quick Depense Submit
  const handleCreateDepense = (e: React.FormEvent) => {
    e.preventDefault();
    const ht = parseFloat(depMontantHT) || 0;
    const ttc = Math.round(ht * 1.20 * 100) / 100;

    store.depenses.unshift({
      id: 'dep-' + Date.now(),
      chantierId: chantier.id,
      date: new Date().toISOString().split('T')[0],
      categorie: depCategorie,
      designation: depDesignation || 'Dépense diverse chantier',
      montantHT: ht,
      montantTTC: ttc,
      fournisseurNom: depFournisseur,
      payePar: 'Compte Chantier'
    });

    chantier.coutReelTotalMAD += ht;
    store.updateChantier(chantier.id, { coutReelTotalMAD: chantier.coutReelTotalMAD });

    setDepenseModalOpen(false);
    setDepDesignation('');
    setDepFournisseur('');
  };

  // Quick Journal Submit
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
      
      {/* Top Navigation & Breadcrumb */}
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
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {chantier.nom}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setBlModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Boxes className="w-4 h-4 text-btp-orange" />
            Réceptionner un BL
          </button>

          <button
            onClick={() => setJournalModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-btp-orange hover:bg-btp-orange-dark text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <ClipboardList className="w-4 h-4" />
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
            { id: 'dqe', label: `Lots & DQE (${lots.length})`, icon: Layers },
            { id: 'materiaux', label: `Matériaux & BL (${bonsLivraison.length})`, icon: Boxes },
            { id: 'equipe', label: 'Équipe & Pointage', icon: Users },
            { id: 'depenses', label: `Dépenses (${depenses.length})`, icon: CreditCard },
            { id: 'journal', label: `Journal Terrain (${journaux.length})`, icon: ClipboardList }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-2 border-b-2 font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
                  isSelected
                    ? 'border-btp-orange text-btp-orange'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-btp-orange' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB 1: VUE D'ENSEMBLE */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Détails Contractuels */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-btp-orange" />
                Données Administratives & Maître d'Ouvrage
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Maître d'Ouvrage</span>
                  <strong className="text-slate-900 text-sm">{chantier.maitreOuvrage}</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">ICE Client : {chantier.iceClient || 'N/A'}</p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Téléphone / Contact</span>
                  <strong className="text-slate-900 text-sm">{chantier.telClient || '+212 5 XX XX XX XX'}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Localisation du Chantier</span>
                  <strong className="text-slate-900">{chantier.adresse}, {chantier.ville}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Conducteur de Travaux Assigné</span>
                  <strong className="text-slate-900">Amine El Idrissi (Chef Principal)</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date de démarrage effectif</span>
                  <strong className="text-slate-900">{formatDateFR(chantier.dateDebut)}</strong>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date de livraison contractuelle</span>
                  <strong className="text-slate-900">{formatDateFR(chantier.dateFinPrevue)}</strong>
                </div>
              </div>

              {chantier.notes && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                  <strong className="block text-slate-900 font-bold mb-1">Spécificités techniques du terrain :</strong>
                  {chantier.notes}
                </div>
              )}
            </div>

            {/* Décomposition Analytique des Dépenses Réelles */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Répartition des Coûts du Chantier par Poste
              </h3>

              <div className="space-y-3">
                {[
                  { label: 'Matériaux & Béton (Bons de Livraison)', montant: depenses.filter(d => d.categorie === 'MATERIAUX').reduce((s, d) => s + d.montantHT, 0), color: 'bg-blue-500' },
                  { label: 'Main-d\'œuvre & Équipes', montant: depenses.filter(d => d.categorie === 'MAIN_DOEUVRE').reduce((s, d) => s + d.montantHT, 0) || 120000, color: 'bg-btp-orange' },
                  { label: 'Location Engins & Matériel (Pelles, Grues)', montant: depenses.filter(d => d.categorie === 'LOCATION_ENGINS').reduce((s, d) => s + d.montantHT, 0), color: 'bg-amber-500' },
                  { label: 'Frais Généraux & Études de sol', montant: depenses.filter(d => d.categorie === 'FRAIS_GENERAUX').reduce((s, d) => s + d.montantHT, 0), color: 'bg-slate-600' }
                ].map((item, idx) => {
                  const pct = chantier.coutReelTotalMAD > 0 ? Math.round((item.montant / chantier.coutReelTotalMAD) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{item.label}</span>
                        <div className="text-right">
                          <strong className="text-slate-900">{formatMAD(item.montant)}</strong>
                          <span className="text-[11px] text-slate-400 ml-1.5 font-normal">({pct}%)</span>
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

          {/* Right Col: Météo & Décomptes du Chantier */}
          <div className="space-y-6">
            
            {/* Condition Météo du Chantier */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-xl text-white shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-btp-orange">
                  Conditions Terrain Actuelles
                </span>
                <span className="text-xs text-slate-400">{chantier.ville}</span>
              </div>
              <div className="flex items-center gap-4">
                <Sun className="w-10 h-10 text-amber-400 animate-pulse" />
                <div>
                  <div className="text-2xl font-black">26° C</div>
                  <div className="text-xs text-slate-300">Ensoleillé — Conditions idéales pour coulage béton</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-700">
                Humidité 42% • Vent modéré 12 km/h • Indice de cure béton conforme LPEE.
              </p>
            </div>

            {/* Décomptes d'avancement émis pour ce chantier */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Situations & Décomptes
                </h3>
                <Link href="/devis" className="text-[11px] font-bold text-btp-orange hover:underline">
                  Facturation &rarr;
                </Link>
              </div>

              {store.decomptes.filter(d => d.chantierId === chantier.id).map(dec => (
                <div key={dec.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900">{dec.numero}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                      {dec.statut}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Avancement : {dec.pourcentageCumule}%</span>
                    <strong className="text-slate-900 font-bold">{formatMAD(dec.montantTTC)}</strong>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: LOTS & DQE (SUIVI D'AVANCEMENT EN DIRECT) */}
      {activeTab === 'dqe' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Décomposition du Marché par Lots & Bordereau des Prix
              </h2>
              <p className="text-xs text-slate-500">
                Modifiez la quantité réalisée sur chaque tâche : le pourcentage d'avancement du chantier se recalcule automatiquement.
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold self-start">
              Budget Lots : {formatMAD(lots.reduce((s, l) => s + l.budgetLotMAD, 0))}
            </span>
          </div>

          <div className="space-y-4">
            {lots.map((lot) => (
              <div key={lot.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Lot Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{lot.titre}</h3>
                    <p className="text-xs text-slate-500">
                      Budget alloué : <strong>{formatMAD(lot.budgetLotMAD)}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Avancement Lot</span>
                      <strong className="text-xs font-bold text-btp-orange">{lot.avancementPct} %</strong>
                    </div>
                    <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-btp-orange h-full rounded-full transition-all"
                        style={{ width: `${lot.avancementPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Tâches du Lot */}
                <div className="divide-y divide-slate-100 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-4">Désignation des Travaux</th>
                        <th className="py-2.5 px-2 text-center">Unité</th>
                        <th className="py-2.5 px-2 text-right">Qté Prévue</th>
                        <th className="py-2.5 px-2 text-right">P.U. HT</th>
                        <th className="py-2.5 px-2 text-right">Total HT</th>
                        <th className="py-2.5 px-3 text-center">Qté Réalisée</th>
                        <th className="py-2.5 px-4 text-right">Avancement</th>
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
                              max={t.quantitePrevue * 1.5}
                              value={t.quantiteRealisee}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                store.updateTacheAvancement(chantier.id, lot.id, t.id, val);
                              }}
                              className="w-20 px-2 py-1 text-center font-bold text-xs bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-btp-orange focus:outline-none"
                            />
                          </td>

                          {/* Progression Tâche */}
                          <td className="py-3 px-4 text-right">
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
                Chaque BL enregistré impute automatiquement son coût sur le chantier et alimente les stocks.
              </p>
            </div>
            <button
              onClick={() => setBlModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-btp-orange hover:bg-btp-orange-dark text-white text-xs font-bold rounded-lg shadow-sm self-start"
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
                            <CheckCircle2 className="w-3 h-3" /> {bl.statut}
                          </span>
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
                Pointage des Ouvriers & Compagnons du Chantier
              </h2>
              <p className="text-xs text-slate-500">
                Pointez la présence du jour (1 = Journée, 0.5 = Demi-journée, 0 = Absent). Les coûts MO sont imputés en direct.
              </p>
            </div>
            <Link
              href="/ouvriers/pointage"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg self-start"
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

      {/* TAB 5: DÉPENSES & COÛTS CHANTIER */}
      {activeTab === 'depenses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Comptabilité Analytique des Dépenses Réelles
              </h2>
              <p className="text-xs text-slate-500">
                Historique de tous les flux financiers engagés sur ce chantier.
              </p>
            </div>
            <button
              onClick={() => setDepenseModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm self-start"
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
                    <th className="py-3 px-3">Fournisseur / Bénéficiaire</th>
                    <th className="py-3 px-3">Mode Règlement</th>
                    <th className="py-3 px-4 text-right">Montant HT</th>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: JOURNAL DE CHANTIER TERRAIN & PHOTOS */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Journal de Bord Quotidien du Chef de Chantier
              </h2>
              <p className="text-xs text-slate-500">
                Traçabilité des travaux exécutés, météo, effectifs présents et photographies d'avancement.
              </p>
            </div>
            <button
              onClick={() => setJournalModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-btp-orange hover:bg-btp-orange-dark text-white text-xs font-bold rounded-lg shadow-sm self-start"
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

                <div className="space-y-2 text-xs">
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">Travaux réalisés :</strong>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {jc.travauxExecutes}
                    </p>
                  </div>

                  {jc.problemesIncidents && (
                    <div>
                      <strong className="block text-amber-700 font-bold mb-0.5">Incidents & Aléas :</strong>
                      <p className="text-amber-800 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/80">
                        {jc.problemesIncidents}
                      </p>
                    </div>
                  )}
                </div>

                {/* Galerie Photos */}
                {jc.photos && jc.photos.length > 0 && (
                  <div className="pt-2">
                    <strong className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Photographies de terrain
                    </strong>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {jc.photos.map((ph, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden border border-slate-200 group relative">
                          <img
                            src={ph.url}
                            alt={ph.legende}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="p-2 bg-white text-[11px] text-slate-600 truncate font-medium">
                            {ph.legende}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: RÉCEPTIONNER UN BON DE LIVRAISON */}
      {blModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Enregistrer un Bon de Livraison (BL)</h3>
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
                    placeholder="BL-2026-XXXX"
                    value={blNumero}
                    onChange={(e) => setBlNumero(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fournisseur BTP *</label>
                  <select
                    value={blFournisseurId}
                    onChange={(e) => setBlFournisseurId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  >
                    {store.fournisseurs.map(f => (
                      <option key={f.id} value={f.id}>{f.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Matériau reçu *</label>
                <select
                  value={blMateriauId}
                  onChange={(e) => setBlMateriauId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                >
                  {store.materiaux.map(m => (
                    <option key={m.id} value={m.id}>{m.designation} ({m.unite})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantité livrée</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={blQuantite}
                    onChange={(e) => setBlQuantite(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prix Unitaire HT (MAD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={blPrixUnitaire}
                    onChange={(e) => setBlPrixUnitaire(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarques / Pesée</label>
                <input
                  type="text"
                  placeholder="Ex: Conforme à la pesée, bon d'accompagnement signé"
                  value={blNotes}
                  onChange={(e) => setBlNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBlModalOpen(false)}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-btp-orange hover:bg-btp-orange-dark rounded-lg"
                >
                  Valider la Réception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AJOUTER UNE DÉPENSE */}
      {depenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Ajouter une Dépense au Chantier</h3>
              <button onClick={() => setDepenseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDepense} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catégorie de Dépense</label>
                <select
                  value={depCategorie}
                  onChange={(e) => setDepCategorie(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                >
                  <option value="LOCATION_ENGINS">Location Engins & Pelles</option>
                  <option value="MAIN_DOEUVRE">Main-d'œuvre & Primes</option>
                  <option value="MATERIAUX">Achats Matériaux & Quincaillerie</option>
                  <option value="SOUS_TRAITANCE">Sous-traitance spécialisée</option>
                  <option value="FRAIS_GENERAUX">Frais Généraux & Raccordements</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Location Groupe Électrogène 45kVA (10 jours)"
                  value={depDesignation}
                  onChange={(e) => setDepDesignation(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Montant HT (MAD) *</label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={depMontantHT}
                    onChange={(e) => setDepMontantHT(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fournisseur</label>
                  <input
                    type="text"
                    placeholder="Ex: Tractafric Maroc"
                    value={depFournisseur}
                    onChange={(e) => setDepFournisseur(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDepenseModalOpen(false)}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-btp-orange hover:bg-btp-orange-dark rounded-lg"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: NOUVEAU RAPPORT JOURNALIER */}
      {journalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Rapport Quotidien du Chef de Chantier</h3>
              <button onClick={() => setJournalModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateJournal} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Météo</label>
                  <select
                    value={jMeteo}
                    onChange={(e) => setJMeteo(e.target.value as MeteoType)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg"
                  >
                    <option value="ENSOLEILLE">☀️ Ensoleillé</option>
                    <option value="NUAGEUX">⛅ Nuageux</option>
                    <option value="PLUVIEUX">🌧️ Pluvieux</option>
                    <option value="VENT_FORT">💨 Vent fort</option>
                    <option value="CANICULE">🔥 Canicule</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Température (°C)</label>
                  <input
                    type="number"
                    value={jTemperature}
                    onChange={(e) => setJTemperature(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Effectif Présent</label>
                  <input
                    type="number"
                    value={jEffectif}
                    onChange={(e) => setJEffectif(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Travaux Exécutés Aujourd'hui *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Fin coulage dallage RDC avec béton B25. Début ferraillage poteaux..."
                  value={jTravaux}
                  onChange={(e) => setJTravaux(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Problèmes / Incidents rencontrés</label>
                <input
                  type="text"
                  placeholder="Ex: Retard livraison sable, panne compresseur..."
                  value={jIncidents}
                  onChange={(e) => setJIncidents(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lien Photo d'avancement</label>
                  <input
                    type="text"
                    value={jPhotoUrl}
                    onChange={(e) => setJPhotoUrl(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Légende Photo</label>
                  <input
                    type="text"
                    value={jPhotoLegende}
                    onChange={(e) => setJPhotoLegende(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setJournalModalOpen(false)}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-btp-orange hover:bg-btp-orange-dark rounded-lg"
                >
                  Publier le Rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
