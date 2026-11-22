'use client';

import React, { useState, useEffect } from 'react';
import { store, formatMAD } from '@/lib/store';
import { Materiau, Fournisseur, CategorieMateriau } from '@/lib/types';
import {
  Boxes,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Phone,
  MapPin,
  TrendingDown,
  Layers,
  Search,
  X,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';

export default function MateriauxPage() {
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<'stocks' | 'fournisseurs' | 'bl'>('stocks');
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState<string>('TOUTES');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Material Modal (Create & Edit)
  const [matModalOpen, setMatModalOpen] = useState(false);
  const [editingMatId, setEditingMatId] = useState<string | null>(null);
  const [matCode, setMatCode] = useState('');
  const [matDesignation, setMatDesignation] = useState('');
  const [matCategorie, setMatCategorie] = useState<CategorieMateriau>('LIANTS_BETON');
  const [matUnite, setMatUnite] = useState('Sac');
  const [matStock, setMatStock] = useState('100');
  const [matMin, setMatMin] = useState('30');
  const [matPrix, setMatPrix] = useState('80');

  // Supplier Modal (Create & Edit)
  const [fournModalOpen, setFournModalOpen] = useState(false);
  const [editingFournId, setEditingFournId] = useState<string | null>(null);
  const [fournNom, setFournNom] = useState('');
  const [fournIce, setFournIce] = useState('');
  const [fournIfNum, setFournIfNum] = useState('');
  const [fournSpecialite, setFournSpecialite] = useState('');
  const [fournTel, setFournTel] = useState('');
  const [fournEmail, setFournEmail] = useState('');
  const [fournAdresse, setFournAdresse] = useState('');
  const [fournVille, setFournVille] = useState('Casablanca');
  const [fournRib, setFournRib] = useState('');

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const showNotification = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 3500);
  };

  const materiaux = store.materiaux;
  const fournisseurs = store.fournisseurs;
  const bonsLivraison = store.bonsLivraison;

  const filteredMateriaux = materiaux.filter(m => {
    const matchSearch = m.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = catFilter === 'TOUTES' || m.categorie === catFilter;
    return matchSearch && matchCat;
  });

  // --- Material Actions ---
  const openCreateMatModal = () => {
    setEditingMatId(null);
    setMatCode(`MAT-${Date.now().toString().substring(9)}`);
    setMatDesignation('');
    setMatCategorie('LIANTS_BETON');
    setMatUnite('Sac');
    setMatStock('100');
    setMatMin('30');
    setMatPrix('80');
    setMatModalOpen(true);
  };

  const openEditMatModal = (m: Materiau) => {
    setEditingMatId(m.id);
    setMatCode(m.code);
    setMatDesignation(m.designation);
    setMatCategorie(m.categorie);
    setMatUnite(m.unite);
    setMatStock(String(m.stockActuel));
    setMatMin(String(m.stockMinimum));
    setMatPrix(String(m.prixUnitaireMoyenMAD));
    setMatModalOpen(true);
  };

  const handleSaveMateriau = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matDesignation) return;

    if (editingMatId) {
      store.updateMateriau(editingMatId, {
        code: matCode,
        designation: matDesignation,
        categorie: matCategorie,
        unite: matUnite,
        stockActuel: parseFloat(matStock) || 0,
        stockMinimum: parseFloat(matMin) || 10,
        prixUnitaireMoyenMAD: parseFloat(matPrix) || 0
      });
      showNotification(`Matériau "${matDesignation}" modifié avec succès.`);
    } else {
      const created = store.addMateriau({
        code: matCode || `MAT-${Date.now().toString().substring(9)}`,
        designation: matDesignation,
        categorie: matCategorie,
        unite: matUnite,
        stockActuel: parseFloat(matStock) || 0,
        stockMinimum: parseFloat(matMin) || 10,
        prixUnitaireMoyenMAD: parseFloat(matPrix) || 0
      });
      showNotification(`Matériau "${created.designation}" ajouté au catalogue.`);
    }

    setMatModalOpen(false);
  };

  const handleDuplicateMat = (id: string, name: string) => {
    const clone = store.duplicateMateriau(id);
    if (clone) {
      showNotification(`Matériau dupliqué : "${clone.designation}" (${clone.code}).`);
    }
  };

  const handleDeleteMat = (id: string, name: string) => {
    if (window.confirm(`Confirmez-vous la suppression du matériau "${name}" du stock ?`)) {
      const ok = store.deleteMateriau(id);
      if (ok) {
        showNotification(`Matériau "${name}" supprimé.`);
      }
    }
  };

  // --- Fournisseur Actions ---
  const openCreateFournModal = () => {
    setEditingFournId(null);
    setFournNom('');
    setFournIce('');
    setFournIfNum('12345678');
    setFournSpecialite('Matériaux de construction & Gros Œuvre');
    setFournTel('+212 5...');
    setFournEmail('');
    setFournAdresse('');
    setFournVille('Casablanca');
    setFournRib('');
    setFournModalOpen(true);
  };

  const openEditFournModal = (f: Fournisseur) => {
    setEditingFournId(f.id);
    setFournNom(f.nom);
    setFournIce(f.ice);
    setFournIfNum(f.ifNum || '12345678');
    setFournSpecialite(f.specialite);
    setFournTel(f.telephone);
    setFournEmail(f.email || '');
    setFournAdresse(f.adresse);
    setFournVille(f.ville);
    setFournRib(f.rib || '');
    setFournModalOpen(true);
  };

  const handleSaveFournisseur = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fournNom || !fournIce) return;

    if (editingFournId) {
      store.updateFournisseur(editingFournId, {
        nom: fournNom,
        ice: fournIce,
        ifNum: fournIfNum || '12345678',
        specialite: fournSpecialite,
        telephone: fournTel,
        email: fournEmail,
        adresse: fournAdresse,
        ville: fournVille,
        rib: fournRib
      });
      showNotification(`Fournisseur "${fournNom}" mis à jour avec succès.`);
    } else {
      const created = store.addFournisseur({
        nom: fournNom,
        ice: fournIce,
        ifNum: fournIfNum || '12345678',
        specialite: fournSpecialite,
        telephone: fournTel,
        email: fournEmail,
        adresse: fournAdresse,
        ville: fournVille,
        rib: fournRib
      });
      showNotification(`Fournisseur "${created.nom}" ajouté à l'annuaire.`);
    }

    setFournModalOpen(false);
  };

  const handleDuplicateFourn = (id: string, name: string) => {
    const clone = store.duplicateFournisseur(id);
    if (clone) {
      showNotification(`Fournisseur dupliqué : "${clone.nom}".`);
    }
  };

  const handleDeleteFourn = (id: string, name: string) => {
    if (window.confirm(`Confirmez-vous la suppression du fournisseur "${name}" ?`)) {
      const ok = store.deleteFournisseur(id);
      if (ok) {
        showNotification(`Fournisseur "${name}" supprimé.`);
      }
    }
  };

  // --- Bon de Livraison Actions ---
  const handleDuplicateBL = (id: string, num: string) => {
    const clone = store.duplicateBonLivraison(id);
    if (clone) {
      showNotification(`Bon de Livraison ${num} dupliqué sous le N° ${clone.numeroBL}.`);
    }
  };

  const handleDeleteBL = (id: string, num: string) => {
    if (window.confirm(`Supprimer le BL ${num} ? Les stocks reçus et le coût du chantier seront recalculés.`)) {
      const ok = store.deleteBonLivraison(id);
      if (ok) {
        showNotification(`BL ${num} supprimé et stocks réajustés.`);
      }
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Matériaux, Fournisseurs & Stocks
            <span className="text-xs bg-slate-200 text-slate-800 font-semibold px-2 py-0.5 rounded-full">
              BTP Maroc
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Suivi des approvisionnements, édition, duplication, alertes de stock et catalogue des fournisseurs
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'fournisseurs' ? (
            <button
              onClick={openCreateFournModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-btp-orange hover:bg-btp-orange-dark text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Nouveau Fournisseur
            </button>
          ) : (
            <button
              onClick={openCreateMatModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-btp-orange hover:bg-btp-orange-dark text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Ajouter un Matériau
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('stocks')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'stocks'
              ? 'border-btp-orange text-btp-orange'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Stocks & Alertes de Seuil ({materiaux.length})
        </button>

        <button
          onClick={() => setActiveTab('fournisseurs')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'fournisseurs'
              ? 'border-btp-orange text-btp-orange'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Fournisseurs Agréés ({fournisseurs.length})
        </button>

        <button
          onClick={() => setActiveTab('bl')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'bl'
              ? 'border-btp-orange text-btp-orange'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Bons de Livraison & Réceptions ({bonsLivraison.length})
        </button>
      </div>

      {/* TAB 1: STOCKS DES MATÉRIAUX AVEC ACTIONS */}
      {activeTab === 'stocks' && (
        <div className="space-y-4">
          
          {/* Filtres */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par désignation ou code matériau..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
              />
            </div>

            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
            >
              <option value="TOUTES">Toutes les catégories</option>
              <option value="LIANTS_BETON">Liants & Béton</option>
              <option value="ACIER_FERRAILLAGE">Acier & Ferraillage</option>
              <option value="AGREGATS">Agrégats (Sable, Gravier)</option>
              <option value="MACONNERIE">Briques & Maçonnerie</option>
              <option value="ETANCHEITE">Étanchéité & Adjuvants</option>
              <option value="SECOND_OEUVRE">Second Œuvre & Assainissement</option>
            </select>
          </div>

          {/* Table Stocks */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Désignation Matériau</th>
                    <th className="py-3 px-3">Catégorie</th>
                    <th className="py-3 px-3 text-right">Prix Moyen</th>
                    <th className="py-3 px-4 text-center">Niveau de Stock</th>
                    <th className="py-3 px-4 text-center">État / Alerte</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMateriaux.map((m) => {
                    const isBas = m.stockActuel <= m.stockMinimum;
                    const ratio = m.stockMinimum > 0 ? Math.min(100, Math.round((m.stockActuel / (m.stockMinimum * 2)) * 100)) : 100;

                    return (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{m.code}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{m.designation}</td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                            {m.categorie}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-700">
                          {formatMAD(m.prixUnitaireMoyenMAD)} <span className="text-slate-400 font-normal">/{m.unite}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-block text-left w-36">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-bold text-slate-900">{m.stockActuel} {m.unite}</span>
                              <span className="text-slate-400">Min: {m.stockMinimum}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${isBas ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${ratio}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isBas ? (
                            <span className="btp-badge bg-rose-100 text-rose-800">
                              <AlertTriangle className="w-3 h-3" /> Seuil Critique
                            </span>
                          ) : (
                            <span className="btp-badge bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Approvisionné
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditMatModal(m)}
                              title="Modifier ce matériau"
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicateMat(m.id, m.designation)}
                              title="Dupliquer ce matériau"
                              className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMat(m.id, m.designation)}
                              title="Supprimer ce matériau"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
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

      {/* TAB 2: FOURNISSEURS AGRÉÉS MAROC AVEC ACTIONS */}
      {activeTab === 'fournisseurs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {fournisseurs.map((f) => (
            <div key={f.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-slate-100 font-mono text-slate-700 px-2 py-0.5 rounded font-bold">
                    ICE: {f.ice}
                  </span>
                  <span className="text-xs text-btp-orange font-bold">{f.ville}</span>
                </div>

                <h3 className="font-bold text-base text-slate-900 mt-2">{f.nom}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{f.specialite}</p>

                <div className="space-y-1 text-xs text-slate-600 pt-3 border-t border-slate-100 mt-3">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{f.telephone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{f.adresse}</span>
                  </div>
                </div>

                {f.rib && (
                  <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-500 font-mono truncate mt-2">
                    RIB: {f.rib}
                  </div>
                )}
              </div>

              {/* Actions Fournisseur */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                <button
                  onClick={() => openEditFournModal(f)}
                  title="Modifier ce fournisseur"
                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDuplicateFourn(f.id, f.nom)}
                  title="Dupliquer ce fournisseur"
                  className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteFourn(f.id, f.nom)}
                  title="Supprimer ce fournisseur"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: BONS DE LIVRAISON GLOBAUX AVEC ACTIONS */}
      {activeTab === 'bl' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">N° BL</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Chantier</th>
                  <th className="py-3 px-3">Fournisseur</th>
                  <th className="py-3 px-3">Articles Livrés</th>
                  <th className="py-3 px-4 text-right">Total HT</th>
                  <th className="py-3 px-4 text-right font-bold text-slate-900">Total TTC (MAD)</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bonsLivraison.map((bl) => {
                  const ch = store.chantiers.find(c => c.id === bl.chantierId);
                  const fourn = store.fournisseurs.find(f => f.id === bl.fournisseurId);

                  return (
                    <tr key={bl.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{bl.numeroBL}</td>
                      <td className="py-3 px-3 text-slate-600">{bl.dateLivraison}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{ch?.nom || 'Chantier'}</td>
                      <td className="py-3 px-3 text-slate-700">{fourn?.nom}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {bl.items.map(it => `${it.designation} (${it.quantite} ${it.unite})`).join(', ')}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">{formatMAD(bl.montantTotalHT)}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">{formatMAD(bl.montantTTC)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="btp-badge bg-emerald-100 text-emerald-800">
                          {bl.statut}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleDuplicateBL(bl.id, bl.numeroBL)}
                            title="Dupliquer ce Bon de Livraison"
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBL(bl.id, bl.numeroBL)}
                            title="Supprimer ce BL (réajuste les stocks)"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
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
      )}

      {/* MODAL CRÉER / MODIFIER MATÉRIAU */}
      {matModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  {editingMatId ? 'Modifier la Fiche Matériau' : 'Ajouter un Nouveau Matériau'}
                </h3>
                <p className="text-[11px] text-slate-300">Catalogue des consommables et fournitures chantier</p>
              </div>
              <button onClick={() => setMatModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMateriau} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Code Référence *</label>
                  <input
                    type="text"
                    required
                    value={matCode}
                    onChange={(e) => setMatCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catégorie *</label>
                  <select
                    value={matCategorie}
                    onChange={(e) => setMatCategorie(e.target.value as CategorieMateriau)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  >
                    <option value="LIANTS_BETON">Liants & Béton</option>
                    <option value="ACIER_FERRAILLAGE">Acier & Ferraillage</option>
                    <option value="AGREGATS">Agrégats</option>
                    <option value="MACONNERIE">Briques & Maçonnerie</option>
                    <option value="ETANCHEITE">Étanchéité</option>
                    <option value="SECOND_OEUVRE">Second Œuvre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation du Matériau *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ciment CPJ 45 (Sac 50kg), Rond à béton FeE500..."
                  value={matDesignation}
                  onChange={(e) => setMatDesignation(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-btp-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unité de Mesure</label>
                  <select
                    value={matUnite}
                    onChange={(e) => setMatUnite(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  >
                    <option value="Sac">Sac</option>
                    <option value="Tonne">Tonne</option>
                    <option value="m³">Mètre Cube (m³)</option>
                    <option value="m²">Mètre Carré (m²)</option>
                    <option value="ml">Mètre Linéaire (ml)</option>
                    <option value="Unité">Unité</option>
                    <option value="Kg">Kilogramme (Kg)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prix Unitaire Moyen (MAD) *</label>
                  <input
                    type="number"
                    required
                    value={matPrix}
                    onChange={(e) => setMatPrix(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Actuel Initial</label>
                  <input
                    type="number"
                    value={matStock}
                    onChange={(e) => setMatStock(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Seuil Minimum (Alerte)</label>
                  <input
                    type="number"
                    value={matMin}
                    onChange={(e) => setMatMin(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMatModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 font-bold rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-btp-orange hover:bg-btp-orange-dark text-white font-bold rounded-lg shadow-sm"
                >
                  {editingMatId ? 'Enregistrer Modifications' : 'Ajouter au Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRÉER / MODIFIER FOURNISSEUR */}
      {fournModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  {editingFournId ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur BTP'}
                </h3>
                <p className="text-[11px] text-slate-300">Coordonnées et informations bancaires</p>
              </div>
              <button onClick={() => setFournModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveFournisseur} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Raison Sociale / Nom *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: LafargeHolcim Maroc, Sonasid..."
                  value={fournNom}
                  onChange={(e) => setFournNom(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-btp-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">N° ICE Maroc *</label>
                  <input
                    type="text"
                    required
                    placeholder="15 chiffres"
                    value={fournIce}
                    onChange={(e) => setFournIce(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={fournVille}
                    onChange={(e) => setFournVille(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Spécialité Fournisseur</label>
                <input
                  type="text"
                  placeholder="Ex: Ciment & Liants hydrauliques, Aciers & Treillis..."
                  value={fournSpecialite}
                  onChange={(e) => setFournSpecialite(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    placeholder="+212 5..."
                    value={fournTel}
                    onChange={(e) => setFournTel(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="contact@fournisseur.ma"
                    value={fournEmail}
                    onChange={(e) => setFournEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={fournAdresse}
                  onChange={(e) => setFournAdresse(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">RIB Bancaire (24 chiffres)</label>
                <input
                  type="text"
                  placeholder="011 780 0000 123456789012 34"
                  value={fournRib}
                  onChange={(e) => setFournRib(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-btp-orange"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFournModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 font-bold rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-btp-orange hover:bg-btp-orange-dark text-white font-bold rounded-lg shadow-sm"
                >
                  {editingFournId ? 'Mettre à Jour' : 'Ajouter Fournisseur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
