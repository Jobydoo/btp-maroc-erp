'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import { TypeMouvementStock } from '@/lib/types';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Boxes,
  Building,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  X,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

export default function StockMouvementsPage() {
  const [, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('TOUS');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [dateMouvement, setDateMouvement] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TypeMouvementStock>('SORTIE_CHANTIER');
  const [articleId, setArticleId] = useState(store.articlesActifs[0]?.id || '');
  const [quantite, setQuantite] = useState<number>(50);
  const [source, setSource] = useState('Dépôt Central');
  const [destination, setDestination] = useState('Chantier Villa Marrakech');
  const [chantierId, setChantierId] = useState(store.chantiersActifs[0]?.id || '');
  const [referencePiece, setReferencePiece] = useState('BS-' + Math.floor(1000 + Math.random() * 9000));
  const [notes, setNotes] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const mouvements = store.stockMouvementsActifs.filter(m => {
    const matchSearch = m.articleDesignation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.chantierNom && m.chantierNom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.referencePiece && m.referencePiece.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = filterType === 'TOUS' || m.type === filterType;
    return matchSearch && matchType;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenModal = () => {
    setDateMouvement(new Date().toISOString().split('T')[0]);
    setType('SORTIE_CHANTIER');
    setArticleId(store.articlesActifs[0]?.id || '');
    setQuantite(50);
    setSource('Dépôt Central');
    setDestination(store.chantiersActifs[0]?.nom || 'Chantier');
    setChantierId(store.chantiersActifs[0]?.id || '');
    setReferencePiece('BS-' + Math.floor(1000 + Math.random() * 9000));
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const article = store.articlesActifs.find(a => a.id === articleId);
    if (!article) return;

    const chantier = store.chantiersActifs.find(c => c.id === chantierId);
    const coutUnitaire = article.prixUnitaireMoyenMAD;
    const coutTotal = coutUnitaire * quantite;

    store.enregistrerMouvementStock({
      dateMouvement,
      type,
      articleId: article.id,
      articleDesignation: article.designation,
      quantite: Number(quantite),
      unite: article.unite,
      coutUnitaireMAD: coutUnitaire,
      coutTotalMAD: coutTotal,
      source,
      destination: type === 'SORTIE_CHANTIER' && chantier ? chantier.nom : destination,
      chantierId: type === 'SORTIE_CHANTIER' ? chantierId : undefined,
      chantierNom: type === 'SORTIE_CHANTIER' && chantier ? chantier.nom : undefined,
      referencePiece,
      notes
    });

    showToast(`Mouvement enregistré : ${quantite} ${article.unite} de ${article.designation}.`);
    setIsModalOpen(false);
  };

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
              <ArrowLeftRight className="w-6 h-6 text-btp-orange" />
              Mouvements & Traçabilité des Stocks BTP
            </h1>
            <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full uppercase">
              {store.company.raisonSociale.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Entrées achats, transferts entre dépôts et sorties directes imputées aux chantiers de construction
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-btp-orange hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Enregistrer un Mouvement
        </button>
      </div>

      {/* Filtres et Recherche */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par article, chantier rattaché, n° pièce (BL, BS)..."
            className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none text-slate-800 font-medium"
        >
          <option value="TOUS">Tous les types de mouvement</option>
          <option value="SORTIE_CHANTIER">Sorties vers Chantier</option>
          <option value="ENTREE_ACHAT">Entrées Achats Fournisseurs</option>
          <option value="TRANSFERT">Transferts Dépôt</option>
          <option value="RETOUR">Retours Chantier</option>
        </select>
      </div>

      {/* Tableau des Mouvements */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Réf Pièce</th>
                <th className="p-3">Article / Matériau</th>
                <th className="p-3 text-center">Quantité</th>
                <th className="p-3 text-right">Coût Unitaire HT</th>
                <th className="p-3 text-right">Coût Total HT</th>
                <th className="p-3">Origine → Destination / Chantier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mouvements.map((m) => {
                const isSortie = m.type === 'SORTIE_CHANTIER';
                const isEntree = m.type === 'ENTREE_ACHAT';

                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500 whitespace-nowrap">{formatDateFR(m.dateMouvement)}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isSortie
                          ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : isEntree
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {isSortie ? <ArrowUpRight className="w-3 h-3" /> : isEntree ? <ArrowDownLeft className="w-3 h-3" /> : <RefreshCw className="w-3 h-3" />}
                        {isSortie ? 'Sortie Chantier' : isEntree ? 'Entrée Achat' : m.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">{m.referencePiece || '-'}</td>
                    <td className="p-3 font-semibold text-slate-900">{m.articleDesignation}</td>
                    <td className="p-3 text-center font-bold text-slate-800 font-mono">
                      {m.quantite} {m.unite}
                    </td>
                    <td className="p-3 text-right font-mono">{formatMAD(m.coutUnitaireMAD)}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{formatMAD(m.coutTotalMAD)}</td>
                    <td className="p-3 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">{m.source}</span>
                        <span className="text-slate-400">→</span>
                        <strong className={m.chantierNom ? 'text-btp-orange' : 'text-slate-900'}>
                          {m.chantierNom || m.destination}
                        </strong>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Enregistrer Mouvement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-btp-orange" />
                Enregistrer un Mouvement de Stock
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date du mouvement</label>
                  <input
                    type="date"
                    value={dateMouvement}
                    onChange={(e) => setDateMouvement(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Type de Mouvement</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none font-bold"
                  >
                    <option value="SORTIE_CHANTIER">Sortie vers Chantier (Imputation coût)</option>
                    <option value="ENTREE_ACHAT">Entrée Approvisionnement (Achat)</option>
                    <option value="TRANSFERT">Transfert Inter-dépôts</option>
                    <option value="RETOUR">Retour Chantier vers Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Sélectionner l'Article / Matériau *</label>
                <select
                  value={articleId}
                  onChange={(e) => setArticleId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none font-medium text-slate-900"
                >
                  {store.articlesActifs.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.code} — {a.designation} (Stock actuel : {a.stockActuel} {a.unite})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quantité à Mouvementer *</label>
                  <input
                    type="number"
                    value={quantite}
                    onChange={(e) => setQuantite(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">N° Bon / Référence Pièce</label>
                  <input
                    type="text"
                    value={referencePiece}
                    onChange={(e) => setReferencePiece(e.target.value)}
                    placeholder="BS-0012, BL-9041..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
              </div>

              {type === 'SORTIE_CHANTIER' && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                  <label className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-btp-orange" />
                    Chantier Destinataire (Imputation directe au Coût Réel) :
                  </label>
                  <select
                    value={chantierId}
                    onChange={(e) => setChantierId(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none font-medium"
                  >
                    {store.chantiersActifs.map(ch => (
                      <option key={ch.id} value={ch.id}>
                        {ch.code} — {ch.nom} ({ch.ville})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Source / Dépôt Origine</label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
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
                  Enregistrer le Mouvement
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
