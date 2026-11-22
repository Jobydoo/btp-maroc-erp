'use client';

import React, { useState, useEffect } from 'react';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import { CommandeFournisseur } from '@/lib/types';
import {
  FileText,
  Plus,
  Search,
  PackageCheck,
  CheckCircle2,
  X,
  Building,
  Copy,
  Trash2,
  Edit
} from 'lucide-react';

export default function AchatsCommandesPage() {
  const [, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCmd, setEditingCmd] = useState<CommandeFournisseur | null>(null);

  // Form states
  const [fournisseurNom, setFournisseurNom] = useState('Sonasid Sidérurgie');
  const [chantierId, setChantierId] = useState(store.chantiersActifs[0]?.id || '');
  const [dateCommande, setDateCommande] = useState(new Date().toISOString().split('T')[0]);
  const [dateLivraisonPrevue, setDateLivraisonPrevue] = useState(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [designation, setDesignation] = useState('Acier FeE500 haute adhérence Sonasid');
  const [quantite, setQuantite] = useState<number>(10);
  const [unite, setUnite] = useState('Tonne');
  const [prixUnitaireHT, setPrixUnitaireHT] = useState<number>(9400);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const commandes = store.commandesFournisseurActives.filter(c =>
    c.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.fournisseurNom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingCmd(null);
    setFournisseurNom(store.fournisseursActifs[0]?.nom || 'LafargeHolcim Maroc');
    setChantierId(store.chantiersActifs[0]?.id || '');
    setDateCommande(new Date().toISOString().split('T')[0]);
    setDateLivraisonPrevue(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setDesignation('Acier HA FeE500 Sonasid');
    setQuantite(5);
    setUnite('Tonne');
    setPrixUnitaireHT(9400);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const four = store.fournisseursActifs.find(f => f.nom.toLowerCase().includes(fournisseurNom.toLowerCase()));
    const chantier = store.chantiersActifs.find(c => c.id === chantierId);
    const totalHT = quantite * prixUnitaireHT;

    const newCmd = store.addCommandeFournisseur({
      dateCommande,
      dateLivraisonPrevue,
      fournisseurId: four?.id || 'fourn-01',
      fournisseurNom,
      fournisseurIce: four?.ice || '001689234000089',
      chantierId,
      chantierNom: chantier?.nom,
      items: [
        { id: 'cfi-1', designation, unite, quantite: Number(quantite), prixUnitaireHT: Number(prixUnitaireHT), totalHT }
      ],
      totalHT,
      tauxTva: 20,
      statut: 'ENVOYEE'
    });

    showToast(`Bon de commande ${newCmd.reference} créé.`);
    setIsModalOpen(false);
  };

  const handleReceptionner = (cmdId: string) => {
    try {
      const br = store.receptionnerCommandeFournisseur(cmdId, 'CHANTIER_DIRECT');
      showToast(`Bon de Réception ${br.reference} créé. Stock et Coût Chantier mis à jour.`);
    } catch (err: any) {
      alert(err.message);
    }
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
              <FileText className="w-6 h-6 text-purple-600" />
              Bons de Commande Fournisseur (Achats BTP)
            </h1>
            <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full uppercase">
              {store.company.raisonSociale.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ordres d'achat envoyés aux fournisseurs de matériaux avec date de livraison prévisionnelle et réception
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nouveau Bon de Commande
        </button>
      </div>

      {/* Recherche */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par référence (BCF-2026-...), fournisseur ou chantier..."
          className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {commandes.map((cmd) => (
          <div key={cmd.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
                  {cmd.reference}
                </span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  {cmd.statut}
                </span>
                <span className="text-xs text-slate-400">• Livr. prévue : {formatDateFR(cmd.dateLivraisonPrevue)}</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">{cmd.fournisseurNom}</p>
              <p className="text-xs text-slate-500">
                {cmd.items[0]?.designation} ({cmd.items[0]?.quantite} {cmd.items[0]?.unite}) • Destination : <strong>{cmd.chantierNom || 'Stock Central'}</strong>
              </p>
            </div>

            <div className="flex flex-col md:items-end gap-2">
              <div className="text-left md:text-right">
                <div className="text-base font-extrabold text-slate-900">{formatMAD(cmd.totalTTC)}</div>
                <div className="text-[11px] text-slate-500">HT : {formatMAD(cmd.totalHT)} (TVA 20%)</div>
              </div>

              <div className="flex items-center gap-2">
                {cmd.statut !== 'RECUE' && (
                  <button
                    onClick={() => handleReceptionner(cmd.id)}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                    title="Générer le Bon de Réception et mettre à jour le stock"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    → Réceptionner (Stock / Chantier)
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                Nouveau Bon de Commande Fournisseur
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Fournisseur</label>
                <select
                  value={fournisseurNom}
                  onChange={(e) => setFournisseurNom(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  {store.fournisseursActifs.map(f => (
                    <option key={f.id} value={f.nom}>{f.nom} ({f.specialite})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Affecter au Chantier</label>
                <select
                  value={chantierId}
                  onChange={(e) => setChantierId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="">-- Dépôt Central (Stock) --</option>
                  {store.chantiersActifs.map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.code} — {ch.nom}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date Commande</label>
                  <input
                    type="date"
                    value={dateCommande}
                    onChange={(e) => setDateCommande(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date Livraison Prévue</label>
                  <input
                    type="date"
                    value={dateLivraisonPrevue}
                    onChange={(e) => setDateLivraisonPrevue(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Désignation Matériau</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quantité</label>
                  <input
                    type="number"
                    value={quantite}
                    onChange={(e) => setQuantite(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Unité</label>
                  <input
                    type="text"
                    value={unite}
                    onChange={(e) => setUnite(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-center"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">P.U HT (MAD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prixUnitaireHT}
                    onChange={(e) => setPrixUnitaireHT(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-right"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900">
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs">
                  Valider la Commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
