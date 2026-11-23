'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import { Chantier, TypeTravaux, StatutChantier } from '@/lib/types';
import {
  Building2,
  PlusCircle,
  Search,
  Filter,
  MapPin,
  Calendar,
  Layers,
  TrendingUp,
  X,
  CheckCircle2,
  Clock,
  PauseCircle,
  CheckCheck,
  Edit,
  Copy,
  Trash2,
  AlertCircle
} from 'lucide-react';

function ChantiersContent() {
  const searchParams = useSearchParams();
  const [, setTick] = useState(0);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('TOUS');
  const [statutFilter, setStatutFilter] = useState<string>('TOUS');
  const [villeFilter, setVilleFilter] = useState<string>('TOUTES');

  // Modal State (Create & Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChantierId, setEditingChantierId] = useState<string | null>(null);

  // Form Fields
  const [nom, setNom] = useState('');
  const [maitreOuvrage, setMaitreOuvrage] = useState('');
  const [telClient, setTelClient] = useState('');
  const [iceClient, setIceClient] = useState('');
  const [ville, setVille] = useState('Casablanca');
  const [adresse, setAdresse] = useState('');
  const [typeTravaux, setTypeTravaux] = useState<TypeTravaux>('GROS_OEUVRE');
  const [budgetTotalMAD, setBudgetTotalMAD] = useState('2500000');
  const [statut, setStatut] = useState<StatutChantier>('EN_COURS');
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split('T')[0]);
  const [dateFinPrevue, setDateFinPrevue] = useState(new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Notification message
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  useEffect(() => {
    if (searchParams.get('nouveau') === 'true' || searchParams.get('action') === 'nouveau') {
      openCreateModal();
    }
  }, [searchParams]);

  const showNotification = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 3500);
  };

  const openCreateModal = () => {
    setEditingChantierId(null);
    setNom('');
    setMaitreOuvrage('');
    setTelClient('');
    setIceClient('');
    setVille('Casablanca');
    setAdresse('');
    setTypeTravaux('GROS_OEUVRE');
    setBudgetTotalMAD('2500000');
    setStatut('EN_COURS');
    setDateDebut(new Date().toISOString().split('T')[0]);
    setDateFinPrevue(new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]);
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (ch: Chantier) => {
    setEditingChantierId(ch.id);
    setNom(ch.nom);
    setMaitreOuvrage(ch.maitreOuvrage);
    setTelClient(ch.telClient || '');
    setIceClient(ch.iceClient || '');
    setVille(ch.ville);
    setAdresse(ch.adresse || '');
    setTypeTravaux(ch.typeTravaux);
    setBudgetTotalMAD(String(ch.budgetTotalMAD));
    setStatut(ch.statut);
    setDateDebut(ch.dateDebut);
    setDateFinPrevue(ch.dateFinPrevue);
    setNotes(ch.notes || '');
    setModalOpen(true);
  };

  const handleSaveChantier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !maitreOuvrage) return;

    if (editingChantierId) {
      // Modification
      store.updateChantier(editingChantierId, {
        nom,
        maitreOuvrage,
        telClient,
        iceClient,
        ville,
        adresse,
        typeTravaux,
        budgetTotalMAD: parseFloat(budgetTotalMAD) || 0,
        statut,
        dateDebut,
        dateFinPrevue,
        notes
      });
      showNotification(`Chantier "${nom}" mis à jour avec succès !`);
    } else {
      // Création
      const created = store.addChantier({
        nom,
        maitreOuvrage,
        telClient,
        iceClient,
        ville,
        adresse,
        typeTravaux,
        budgetTotalMAD: parseFloat(budgetTotalMAD) || 0,
        statut,
        dateDebut,
        dateFinPrevue,
        chefChantierId: 'user-02',
        notes
      });
      showNotification(`Chantier "${created.nom}" (${created.code}) créé avec succès !`);
    }

    setModalOpen(false);
  };

  const handleDuplicate = (id: string, nomChantier: string) => {
    const clone = store.duplicateChantier(id);
    if (clone) {
      showNotification(`Chantier dupliqué avec succès : "${clone.nom}" (${clone.code})`);
    }
  };

  const handleDelete = (id: string, nomChantier: string) => {
    if (window.confirm(`Confirmez-vous la suppression DÉFINITIVE du chantier "${nomChantier}" ?\nToutes les dépenses, tâches et pointages associés seront effacés.`)) {
      const ok = store.deleteChantier(id);
      if (ok) {
        showNotification(`Chantier "${nomChantier}" supprimé avec succès.`);
      }
    }
  };

  const chantiers = store.chantiers;

  // Filtrage
  const filteredChantiers = chantiers.filter(ch => {
    const matchSearch = ch.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.maitreOuvrage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.ville.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = typeFilter === 'TOUS' || ch.typeTravaux === typeFilter;
    const matchStatut = statutFilter === 'TOUS' || ch.statut === statutFilter;
    const matchVille = villeFilter === 'TOUTES' || ch.ville.toLowerCase() === villeFilter.toLowerCase();

    return matchSearch && matchType && matchStatut && matchVille;
  });

  const getStatutBadge = (st: StatutChantier) => {
    switch (st) {
      case 'EN_COURS':
        return <span className="btp-badge bg-orange-100 text-orange-800"><Clock className="w-3 h-3" /> En cours</span>;
      case 'PREPARATION':
        return <span className="btp-badge bg-blue-100 text-blue-800"><Calendar className="w-3 h-3" /> En préparation</span>;
      case 'EN_PAUSE':
        return <span className="btp-badge bg-amber-100 text-amber-800"><PauseCircle className="w-3 h-3" /> En pause</span>;
      case 'LIVRE':
        return <span className="btp-badge bg-emerald-100 text-emerald-800"><CheckCheck className="w-3 h-3" /> Livré</span>;
      default:
        return null;
    }
  };

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

      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Gestion des Chantiers
            <span className="text-xs bg-slate-200 text-slate-800 font-semibold px-2 py-0.5 rounded-full">
              {filteredChantiers.length} projet(s)
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervision technique, budgétaire, édition, duplication et archivage des chantiers
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-btp-orange hover:bg-btp-orange-dark text-white rounded-lg text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Nouveau Chantier
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher chantier, client, ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-btp-orange"
            />
          </div>

          {/* Type Travaux */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-btp-orange"
            >
              <option value="TOUS">Tous les types de travaux</option>
              <option value="GROS_OEUVRE">Gros Œuvre</option>
              <option value="FINITION">Second Œuvre & Finition</option>
              <option value="VRD">VRD & Terrassement</option>
              <option value="CLE_EN_MAIN">Projet Clé en main</option>
            </select>
          </div>

          {/* Statut */}
          <div>
            <select
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-btp-orange"
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="EN_COURS">En cours d'exécution</option>
              <option value="PREPARATION">En préparation</option>
              <option value="EN_PAUSE">En pause</option>
              <option value="LIVRE">Livré & Réceptionné</option>
            </select>
          </div>

          {/* Ville */}
          <div>
            <select
              value={villeFilter}
              onChange={(e) => setVilleFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-btp-orange"
            >
              <option value="TOUTES">Toutes les villes</option>
              <option value="Casablanca">Casablanca</option>
              <option value="Marrakech">Marrakech</option>
              <option value="Safi">Safi</option>
              <option value="Rabat">Rabat</option>
              <option value="Tanger">Tanger</option>
              <option value="Agadir">Agadir</option>
              <option value="Fès">Fès</option>
            </select>
          </div>

        </div>
      </div>

      {/* Chantiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredChantiers.map((ch) => {
          const ratioCout = ch.budgetTotalMAD > 0 ? Math.round((ch.coutReelTotalMAD / ch.budgetTotalMAD) * 100) : 0;
          const isOverBudget = ch.coutReelTotalMAD > ch.budgetTotalMAD;

          return (
            <div
              key={ch.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                {/* Header: Code & Statut */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-slate-500 font-mono">
                    {ch.code}
                  </span>
                  {getStatutBadge(ch.statut)}
                </div>

                {/* Nom du chantier */}
                <Link
                  href={`/chantiers/${ch.id}`}
                  className="block font-bold text-base text-slate-900 group-hover:text-btp-orange transition-colors leading-snug line-clamp-2"
                >
                  {ch.nom}
                </Link>

                {/* Client & Localisation */}
                <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">Client : <strong>{ch.maitreOuvrage}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ch.ville} {ch.adresse ? `— ${ch.adresse}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Livraison prévue : <strong>{formatDateFR(ch.dateFinPrevue)}</strong></span>
                  </div>
                </div>

                {/* Progress Bar Avancement Physique */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">Avancement des lots :</span>
                    <strong className="text-btp-orange font-bold">{ch.avancementGlobalPct} %</strong>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-btp-orange h-full rounded-full transition-all duration-500"
                      style={{ width: `${ch.avancementGlobalPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Budget vs Coût Réel */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Budget Marché</span>
                    <strong className="text-slate-900 font-bold">{formatMAD(ch.budgetTotalMAD)}</strong>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Dépenses Réelles</span>
                    <strong className={isOverBudget ? 'text-rose-600 font-bold' : 'text-slate-700 font-bold'}>
                      {formatMAD(ch.coutReelTotalMAD)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Card Footer with Actions : Ouvrir, Modifier, Dupliquer, Supprimer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                <Link
                  href={`/chantiers/${ch.id}`}
                  className="font-bold text-btp-orange hover:text-btp-orange-dark flex items-center gap-1 text-[11px]"
                >
                  Ouvrir <span aria-hidden="true">&rarr;</span>
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(ch)}
                    title="Modifier ce chantier"
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDuplicate(ch.id, ch.nom)}
                    title="Dupliquer ce chantier (cloner lots & tâches)"
                    className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(ch.id, ch.nom)}
                    title="Supprimer ce chantier"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Créer / Modifier Chantier */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-btp-dark text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">
                  {editingChantierId ? 'Modifier le Chantier' : 'Créer un Nouveau Chantier'}
                </h3>
                <p className="text-xs text-slate-300">
                  {editingChantierId ? 'Mise à jour des informations contractuelles et budgétaires' : 'Initialisation du dossier technique et budgétaire'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveChantier} className="p-6 space-y-4 overflow-y-auto text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nom du Projet / Chantier *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Construction Villa R+1 Palmeraie, Immeuble R+4..."
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client (Maître d'Ouvrage) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nom société ou particulier"
                    value={maitreOuvrage}
                    onChange={(e) => setMaitreOuvrage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">N° ICE Client (Maroc)</label>
                  <input
                    type="text"
                    placeholder="15 chiffres (Ex: 002345678000045)"
                    value={iceClient}
                    onChange={(e) => setIceClient(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone Client</label>
                  <input
                    type="text"
                    placeholder="+212 6..."
                    value={telClient}
                    onChange={(e) => setTelClient(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ville</label>
                  <select
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  >
                    <option value="Casablanca">Casablanca</option>
                    <option value="Marrakech">Marrakech</option>
                    <option value="Safi">Safi</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Tanger">Tanger</option>
                    <option value="Agadir">Agadir</option>
                    <option value="Fès">Fès</option>
                    <option value="Meknès">Meknès</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Adresse ou Emplacement Chantier</label>
                  <input
                    type="text"
                    placeholder="Ex: Lotissement Al Wifaq, Boulevard Zerktouni..."
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type de Travaux</label>
                  <select
                    value={typeTravaux}
                    onChange={(e) => setTypeTravaux(e.target.value as TypeTravaux)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  >
                    <option value="GROS_OEUVRE">Gros Œuvre (Béton armé, Maçonnerie)</option>
                    <option value="FINITION">Second Œuvre & Finition</option>
                    <option value="VRD">VRD, Assainissement & Terrassement</option>
                    <option value="CLE_EN_MAIN">Projet Clé en main</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Budget Marché Global (MAD HT) *</label>
                  <input
                    type="number"
                    required
                    value={budgetTotalMAD}
                    onChange={(e) => setBudgetTotalMAD(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Statut du Chantier</label>
                  <select
                    value={statut}
                    onChange={(e) => setStatut(e.target.value as StatutChantier)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  >
                    <option value="PREPARATION">En préparation</option>
                    <option value="EN_COURS">En cours d'exécution</option>
                    <option value="EN_PAUSE">En pause</option>
                    <option value="LIVRE">Livré & Réceptionné</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date de Démarrage</label>
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date de Fin / Livraison Prévue</label>
                  <input
                    type="date"
                    value={dateFinPrevue}
                    onChange={(e) => setDateFinPrevue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Notes & Spécifications Techniques</label>
                  <textarea
                    rows={2}
                    placeholder="Instructions particulières, géotechnique, architecte, bureau de contrôle..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-btp-orange hover:bg-btp-orange-dark text-white font-bold rounded-lg shadow-sm transition-all"
                >
                  {editingChantierId ? 'Enregistrer les Modifications' : 'Créer le Chantier'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ChantiersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Chargement des chantiers...</div>}>
      <ChantiersContent />
    </Suspense>
  );
}
