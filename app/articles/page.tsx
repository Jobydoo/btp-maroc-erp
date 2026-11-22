'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { store, formatMAD } from '@/lib/store';
import { Materiau, CategorieMateriau } from '@/lib/types';
import {
  Boxes,
  Plus,
  Search,
  Edit,
  Copy,
  Trash2,
  AlertTriangle,
  ArrowLeftRight,
  TrendingUp,
  Tag,
  CheckCircle2,
  X,
  Building,
  DollarSign
} from 'lucide-react';

export default function ArticlesPage() {
  const [, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<string>('TOUTES');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Materiau | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [designation, setDesignation] = useState('');
  const [categorie, setCategorie] = useState<CategorieMateriau>('LIANTS_BETON');
  const [unite, setUnite] = useState('Sac');
  const [stockActuel, setStockActuel] = useState(100);
  const [stockMinimum, setStockMinimum] = useState(20);
  const [prixUnitaireMoyenMAD, setPrixUnitaireMoyenMAD] = useState(80);
  const [prixVenteHT, setPrixVenteHT] = useState(100);
  const [fournisseurPrefNom, setFournisseurPrefNom] = useState('LafargeHolcim Maroc');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const articles = store.articlesActifs.filter(a => {
    const matchSearch = a.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategorie === 'TOUTES' || a.categorie === selectedCategorie;
    return matchSearch && matchCat;
  });

  const valeurStock = store.valeurStockTotalMAD;
  const alertesCount = store.alertesStockCount;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setCode('ART-' + Math.floor(1000 + Math.random() * 9000));
    setDesignation('');
    setCategorie('LIANTS_BETON');
    setUnite('Sac');
    setStockActuel(100);
    setStockMinimum(20);
    setPrixUnitaireMoyenMAD(80);
    setPrixVenteHT(100);
    setFournisseurPrefNom(store.fournisseursActifs[0]?.nom || 'LafargeHolcim Maroc');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (art: Materiau) => {
    setEditingArticle(art);
    setCode(art.code);
    setDesignation(art.designation);
    setCategorie(art.categorie);
    setUnite(art.unite);
    setStockActuel(art.stockActuel);
    setStockMinimum(art.stockMinimum);
    setPrixUnitaireMoyenMAD(art.prixUnitaireMoyenMAD);
    setPrixVenteHT(art.prixVenteHT || art.prixUnitaireMoyenMAD * 1.25);
    setFournisseurPrefNom(art.fournisseurPrefNom || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!designation.trim()) return;

    if (editingArticle) {
      store.updateMateriau(editingArticle.id, {
        code,
        designation,
        categorie,
        unite,
        stockActuel: Number(stockActuel),
        stockMinimum: Number(stockMinimum),
        prixUnitaireMoyenMAD: Number(prixUnitaireMoyenMAD),
        prixVenteHT: Number(prixVenteHT),
        fournisseurPrefNom
      });
      showToast(`Article "${designation}" mis à jour.`);
    } else {
      store.addMateriau({
        code,
        designation,
        categorie,
        unite,
        stockActuel: Number(stockActuel),
        stockMinimum: Number(stockMinimum),
        prixUnitaireMoyenMAD: Number(prixUnitaireMoyenMAD),
        prixVenteHT: Number(prixVenteHT),
        fournisseurPrefNom
      });
      showToast(`Article "${designation}" créé dans le catalogue.`);
    }

    setIsModalOpen(false);
  };

  const handleDuplicate = (art: Materiau) => {
    store.duplicateMateriau(art.id);
    showToast(`Article "${art.designation}" dupliqué.`);
  };

  const handleDelete = (art: Materiau) => {
    if (confirm(`Supprimer l'article "${art.designation}" du catalogue ?`)) {
      store.deleteMateriau(art.id);
      showToast(`Article "${art.designation}" supprimé.`);
    }
  };

  const categories = [
    { id: 'TOUTES', label: 'Toutes les catégories' },
    { id: 'LIANTS_BETON', label: 'Liants & Béton' },
    { id: 'ACIER_FERRAILLAGE', label: 'Aciers & Ferraillage' },
    { id: 'AGREGATS', label: 'Sables & Graviers' },
    { id: 'MACONNERIE', label: 'Briques & Maçonnerie' },
    { id: 'ETANCHEITE', label: 'Étanchéité' },
    { id: 'SECOND_OEUVRE', label: 'Second Œuvre & Plomberie' },
    { id: 'PRESTATION_SERVICE', label: 'Prestations & Services' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Boxes className="w-6 h-6 text-btp-orange" />
              Catalogue Articles & Matériaux (Sage 100)
            </h1>
            <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full uppercase">
              {store.company.raisonSociale.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestion du référentiel matériaux, prix d'achat/vente HT en Dirham (MAD), seuils d'alerte et valorisation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/stock-mouvements"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <ArrowLeftRight className="w-4 h-4 text-btp-orange" />
            Suivi des Mouvements
          </Link>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-btp-orange hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nouvel Article
          </button>
        </div>
      </div>

      {/* 3 Cartes Récapitulatives */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Articles Référencés</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{store.articlesActifs.length} articles</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Valorisation du Stock</span>
            <div className="text-xl font-extrabold text-emerald-600 mt-1">{formatMAD(valeurStock)}</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Alertes Rupture / Min</span>
            <div className={`text-xl font-extrabold mt-1 ${alertesCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {alertesCount} article(s)
            </div>
          </div>
          <div className={`p-3 rounded-xl ${alertesCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Filtres et Recherche */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par référence, désignation..."
            className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <select
          value={selectedCategorie}
          onChange={(e) => setSelectedCategorie(e.target.value)}
          className="text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none text-slate-800 font-medium"
        >
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Tableau des Articles */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Réf / Code</th>
                <th className="p-3">Désignation</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3 text-center">Unité</th>
                <th className="p-3 text-right">P.U Achat HT</th>
                <th className="p-3 text-right">P.U Vente HT</th>
                <th className="p-3 text-right">Stock Actuel</th>
                <th className="p-3 text-right">Valeur Stock</th>
                <th className="p-3 text-center">Statut</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.map((art) => {
                const isUnderMin = art.stockActuel <= art.stockMinimum;
                const valeurLigne = art.stockActuel * art.prixUnitaireMoyenMAD;

                return (
                  <tr key={art.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-600">{art.code}</td>
                    <td className="p-3 font-semibold text-slate-900">{art.designation}</td>
                    <td className="p-3 text-slate-600">{art.categorie}</td>
                    <td className="p-3 text-center font-bold text-slate-700">{art.unite}</td>
                    <td className="p-3 text-right font-mono">{formatMAD(art.prixUnitaireMoyenMAD)}</td>
                    <td className="p-3 text-right font-mono text-emerald-600 font-semibold">
                      {formatMAD(art.prixVenteHT || art.prixUnitaireMoyenMAD * 1.25)}
                    </td>
                    <td className="p-3 text-right font-bold font-mono">
                      <span className={isUnderMin ? 'text-rose-600' : 'text-slate-900'}>
                        {art.stockActuel.toLocaleString('fr-FR')} {art.unite}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      {formatMAD(valeurLigne)}
                    </td>
                    <td className="p-3 text-center">
                      {isUnderMin ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> Sous seuil ({art.stockMinimum})
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(art)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(art)}
                          className="p-1.5 text-slate-400 hover:text-btp-orange hover:bg-orange-50 rounded-lg transition-colors"
                          title="Dupliquer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(art)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Supprimer"
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

      {/* Modal Créer / Modifier Article */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Boxes className="w-4 h-4 text-btp-orange" />
                {editingArticle ? 'Modifier l\'Article' : 'Ajouter au Catalogue'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Réf / Code *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Désignation *</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                    placeholder="Ex: Ciment CPJ 45, Acier HA12..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Catégorie</label>
                  <select
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  >
                    <option value="LIANTS_BETON">Liants & Béton</option>
                    <option value="ACIER_FERRAILLAGE">Aciers & Ferraillage</option>
                    <option value="AGREGATS">Sables & Graviers</option>
                    <option value="MACONNERIE">Briques & Maçonnerie</option>
                    <option value="ETANCHEITE">Étanchéité</option>
                    <option value="SECOND_OEUVRE">Second Œuvre</option>
                    <option value="QUINCAILLERIE">Quincaillerie</option>
                    <option value="PRESTATION_SERVICE">Prestation & Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Unité</label>
                  <select
                    value={unite}
                    onChange={(e) => setUnite(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  >
                    <option value="Sac">Sac</option>
                    <option value="Tonne">Tonne</option>
                    <option value="m³">m³</option>
                    <option value="m²">m²</option>
                    <option value="ml">ml</option>
                    <option value="kg">kg</option>
                    <option value="U">Unité (U)</option>
                    <option value="Fût">Fût</option>
                    <option value="forfait">Forfait</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Prix Achat Moyen HT (MAD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prixUnitaireMoyenMAD}
                    onChange={(e) => setPrixUnitaireMoyenMAD(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Prix Vente HT (MAD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prixVenteHT}
                    onChange={(e) => setPrixVenteHT(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Stock Actuel</label>
                  <input
                    type="number"
                    value={stockActuel}
                    onChange={(e) => setStockActuel(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Seuil Alerte Minimum</label>
                  <input
                    type="number"
                    value={stockMinimum}
                    onChange={(e) => setStockMinimum(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Fournisseur Préféré</label>
                <input
                  type="text"
                  value={fournisseurPrefNom}
                  onChange={(e) => setFournisseurPrefNom(e.target.value)}
                  placeholder="LafargeHolcim, Sonasid..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-btp-orange hover:bg-orange-600 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  {editingArticle ? 'Enregistrer les modifications' : 'Ajouter l\'article'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
