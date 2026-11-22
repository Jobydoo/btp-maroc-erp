'use client';

import React, { useState, useEffect } from 'react';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import { BonLivraisonVente } from '@/lib/types';
import { genererPDFBonLivraison } from '@/lib/pdf-generator';
import {
  Truck,
  Plus,
  Search,
  Edit,
  Copy,
  Trash2,
  Download,
  Receipt,
  CheckCircle2,
  X,
  MapPin
} from 'lucide-react';

export default function VentesLivraisonsPage() {
  const [, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBL, setEditingBL] = useState<BonLivraisonVente | null>(null);

  // Form states
  const [clientNom, setClientNom] = useState('');
  const [clientIce, setClientIce] = useState('');
  const [chantierId, setChantierId] = useState(store.chantiersActifs[0]?.id || '');
  const [dateLivraison, setDateLivraison] = useState(new Date().toISOString().split('T')[0]);
  const [adresseLivraison, setAdresseLivraison] = useState('Sur le chantier');
  const [chauffeur, setChauffeur] = useState('Équipe logistique');
  const [designation, setDesignation] = useState('Livraison et pose armatures et béton B25');
  const [totalHT, setTotalHT] = useState(350000);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const livraisons = store.livraisonsVenteActives.filter(l =>
    l.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.chantierNom && l.chantierNom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingBL(null);
    const client = store.clientsActifs[0];
    setClientNom(client?.nom || 'Groupe Al Omrane');
    setClientIce(client?.ice || '001894562000078');
    setChantierId(store.chantiersActifs[0]?.id || '');
    setDateLivraison(new Date().toISOString().split('T')[0]);
    setAdresseLivraison('Sur site');
    setChauffeur('Équipe logistique');
    setDesignation('Achèvement de lot de travaux gros œuvre');
    setTotalHT(350000);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bl: BonLivraisonVente) => {
    setEditingBL(bl);
    setClientNom(bl.clientNom);
    setClientIce(bl.clientIce);
    setChantierId(bl.chantierId || '');
    setDateLivraison(bl.dateLivraison);
    setAdresseLivraison(bl.adresseLivraison);
    setChauffeur(bl.chauffeur || '');
    setDesignation(bl.items[0]?.designation || '');
    setTotalHT(bl.totalHT);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNom.trim()) return;

    const chantier = store.chantiersActifs.find(c => c.id === chantierId);

    if (editingBL) {
      store.updateBonLivraisonVente(editingBL.id, {
        clientNom,
        clientIce,
        chantierId,
        chantierNom: chantier?.nom,
        dateLivraison,
        adresseLivraison,
        chauffeur,
        totalHT: Number(totalHT),
        tauxTva: 20,
        items: [
          { id: 'bli-1', designation, unite: 'forfait', quantite: 1, prixUnitaireHT: Number(totalHT), totalHT: Number(totalHT) }
        ]
      });
      showToast(`Bon de livraison ${editingBL.reference} mis à jour.`);
    } else {
      const newBL = store.addBonLivraisonVente({
        clientId: 'cli-01',
        clientNom,
        clientIce,
        chantierId,
        chantierNom: chantier?.nom,
        dateLivraison,
        adresseLivraison,
        chauffeur,
        totalHT: Number(totalHT),
        tauxTva: 20,
        statut: 'LIVRE',
        items: [
          { id: 'bli-1', designation, unite: 'forfait', quantite: 1, prixUnitaireHT: Number(totalHT), totalHT: Number(totalHT) }
        ]
      });
      showToast(`Bon de livraison ${newBL.reference} créé.`);
    }

    setIsModalOpen(false);
  };

  const handleTransformerEnFacture = (blId: string) => {
    try {
      const fac = store.convertirBLEnFacture(blId);
      showToast(`Facture Vente générée : ${fac.numeroFacture}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportPDF = (bl: BonLivraisonVente) => {
    genererPDFBonLivraison(bl, store.company);
    showToast(`PDF du bon de livraison ${bl.reference} généré.`);
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
              <Truck className="w-6 h-6 text-amber-500" />
              Bons de Livraison Vente (BL Chantiers)
            </h1>
            <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full uppercase">
              {store.company.raisonSociale.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Attestations de livraison et réceptions sur chantier, transformables en factures de vente d'un clic
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nouveau Bon de Livraison
        </button>
      </div>

      {/* Recherche */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par référence (BLV-2026-...), client ou chantier..."
          className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Liste des BL */}
      <div className="space-y-3">
        {livraisons.map((bl) => (
          <div key={bl.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                  {bl.reference}
                </span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  {bl.statut}
                </span>
                <span className="text-xs text-slate-400">• Date : {formatDateFR(bl.dateLivraison)}</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">{bl.clientNom}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>Chantier : <strong>{bl.chantierNom || 'Non assigné'}</strong> ({bl.adresseLivraison})</span>
              </p>
            </div>

            <div className="flex flex-col md:items-end gap-2">
              <div className="text-left md:text-right">
                <div className="text-base font-extrabold text-slate-900">{formatMAD(bl.totalTTC)}</div>
                <div className="text-[11px] text-slate-500">HT : {formatMAD(bl.totalHT)} (TVA 20%)</div>
              </div>

              <div className="flex items-center gap-2">
                {!bl.factureId && (
                  <button
                    onClick={() => handleTransformerEnFacture(bl.id)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                    title="Générer la Facture Vente correspondante"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    → Facture Vente
                  </button>
                )}

                <button
                  onClick={() => handleExportPDF(bl)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleOpenEdit(bl)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    store.duplicateBonLivraisonVente(bl.id);
                    showToast(`Bon de livraison ${bl.reference} dupliqué.`);
                  }}
                  className="p-1.5 text-slate-400 hover:text-btp-orange rounded-lg"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Supprimer le bon de livraison ${bl.reference} ?`)) {
                      store.deleteBonLivraisonVente(bl.id);
                      showToast(`Bon de livraison supprimé.`);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Créer / Modifier BL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                {editingBL ? `Modifier le Bon de Livraison ${editingBL.reference}` : 'Nouveau Bon de Livraison (BL)'}
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
                  <label className="block text-slate-700 font-semibold mb-1">Client *</label>
                  <input
                    type="text"
                    value={clientNom}
                    onChange={(e) => setClientNom(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ICE Client</label>
                  <input
                    type="text"
                    value={clientIce}
                    onChange={(e) => setClientIce(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Chantier de destination</label>
                <select
                  value={chantierId}
                  onChange={(e) => setChantierId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {store.chantiersActifs.map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.code} — {ch.nom}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date livraison</label>
                  <input
                    type="date"
                    value={dateLivraison}
                    onChange={(e) => setDateLivraison(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Chauffeur / Livreur</label>
                  <input
                    type="text"
                    value={chauffeur}
                    onChange={(e) => setChauffeur(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Désignation des Éléments Livrés</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Valeur Livrée HT (MAD) *</label>
                <input
                  type="number"
                  value={totalHT}
                  onChange={(e) => setTotalHT(Number(e.target.value))}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
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
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  {editingBL ? 'Enregistrer' : 'Valider le bon de livraison'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
