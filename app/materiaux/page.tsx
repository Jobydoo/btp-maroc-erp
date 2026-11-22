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
  X
} from 'lucide-react';

export default function MateriauxPage() {
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<'stocks' | 'fournisseurs' | 'bl'>('stocks');
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState<string>('TOUTES');

  // Modals
  const [matModalOpen, setMatModalOpen] = useState(false);
  const [matCode, setMatCode] = useState('');
  const [matDesignation, setMatDesignation] = useState('');
  const [matCategorie, setMatCategorie] = useState<CategorieMateriau>('LIANTS_BETON');
  const [matUnite, setMatUnite] = useState('Sac');
  const [matStock, setMatStock] = useState('100');
  const [matMin, setMatMin] = useState('30');
  const [matPrix, setMatPrix] = useState('80');

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const materiaux = store.materiaux;
  const fournisseurs = store.fournisseurs;
  const bonsLivraison = store.bonsLivraison;

  const filteredMateriaux = materiaux.filter(m => {
    const matchSearch = m.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = catFilter === 'TOUTES' || m.categorie === catFilter;
    return matchSearch && matchCat;
  });

  const handleCreateMateriau = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matDesignation) return;

    store.materiaux.unshift({
      id: 'mat-' + Date.now(),
      code: matCode || `MAT-${Date.now().toString().substring(9)}`,
      designation: matDesignation,
      categorie: matCategorie,
      unite: matUnite,
      stockActuel: parseFloat(matStock) || 0,
      stockMinimum: parseFloat(matMin) || 10,
      prixUnitaireMoyenMAD: parseFloat(matPrix) || 0
    });

    setMatModalOpen(false);
    setMatDesignation('');
    setMatCode('');
  };

  return (
    <div className="space-y-6">
      
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
            Suivi des approvisionnements, alertes de seuil minimum et catalogue des fournisseurs
          </p>
        </div>

        <button
          onClick={() => setMatModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-btp-orange hover:bg-btp-orange-dark text-white rounded-lg text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Ajouter un Matériau
        </button>
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
          Historique Bons de Livraison ({bonsLivraison.length})
        </button>
      </div>

      {/* TAB 1: STOCKS DES MATÉRIAUX */}
      {activeTab === 'stocks' && (
        <div className="space-y-4">
          
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par désignation, référence..."
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FOURNISSEURS AGRÉÉS MAROC */}
      {activeTab === 'fournisseurs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {fournisseurs.map((f) => (
            <div key={f.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs bg-slate-100 font-mono text-slate-700 px-2 py-0.5 rounded font-bold">
                  ICE: {f.ice}
                </span>
                <span className="text-xs text-btp-orange font-bold">{f.ville}</span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900">{f.nom}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{f.specialite}</p>
              </div>

              <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
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
                <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-500 font-mono truncate">
                  RIB: {f.rib}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: BONS DE LIVRAISON GLOBAUX */}
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL NOUVEAU MATÉRIAU */}
      {matModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Ajouter un Nouveau Matériau au Catalogue</h3>
              <button onClick={() => setMatModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateMateriau} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Code Article</label>
                  <input
                    type="text"
                    placeholder="Ex: CIM-CPJ35"
                    value={matCode}
                    onChange={(e) => setMatCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={matCategorie}
                    onChange={(e) => setMatCategorie(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  >
                    <option value="LIANTS_BETON">Liants & Béton</option>
                    <option value="ACIER_FERRAILLAGE">Acier & Ferraillage</option>
                    <option value="AGREGATS">Agrégats (Sable/Gravier)</option>
                    <option value="MACONNERIE">Maçonnerie (Briques)</option>
                    <option value="ETANCHEITE">Étanchéité</option>
                    <option value="SECOND_OEUVRE">Second Œuvre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation Complète *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ciment CPJ 35 Ciments du Maroc (Sac 50kg)"
                  value={matDesignation}
                  onChange={(e) => setMatDesignation(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unité</label>
                  <input
                    type="text"
                    required
                    value={matUnite}
                    onChange={(e) => setMatUnite(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Initial</label>
                  <input
                    type="number"
                    value={matStock}
                    onChange={(e) => setMatStock(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Seuil Min.</label>
                  <input
                    type="number"
                    value={matMin}
                    onChange={(e) => setMatMin(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prix Unitaire Moyen (MAD HT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={matPrix}
                  onChange={(e) => setMatPrix(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMatModalOpen(false)}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-btp-orange hover:bg-btp-orange-dark rounded-lg"
                >
                  Ajouter au Catalogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
