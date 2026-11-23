'use client';

import React, { useState, useEffect } from 'react';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import { CommandeClient } from '@/lib/types';
import { genererPDFCommandeClient } from '@/lib/pdf-generator';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Copy,
  Trash2,
  Download,
  Truck,
  CheckCircle2,
  X,
  Clock,
  Building
} from 'lucide-react';

export default function VentesCommandesPage() {
  const [, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCmd, setEditingCmd] = useState<CommandeClient | null>(null);

  // Form states
  const [clientNom, setClientNom] = useState('');
  const [clientIce, setClientIce] = useState('');
  const [chantierId, setChantierId] = useState(store.chantiersActifs[0]?.id || '');
  const [dateCommande, setDateCommande] = useState(new Date().toISOString().split('T')[0]);
  const [delaiLivraison, setDelaiLivraison] = useState('30 jours');
  const [designation, setDesignation] = useState('Fourniture et pose gros œuvre tranche 1');
  const [totalHT, setTotalHT] = useState(500000);
  const [notes, setNotes] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'nouveau') {
        handleOpenAdd();
      }
    }
  }, []);

  const commandes = store.commandesClientActives.filter(c =>
    c.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.chantierNom && c.chantierNom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingCmd(null);
    const client = store.clientsActifs[0];
    setClientNom(client?.nom || 'Groupe Al Omrane');
    setClientIce(client?.ice || '001894562000078');
    setChantierId(store.chantiersActifs[0]?.id || '');
    setDateCommande(new Date().toISOString().split('T')[0]);
    setDelaiLivraison('30 jours');
    setDesignation('Travaux de structure et dallage quartzé');
    setTotalHT(450000);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cmd: CommandeClient) => {
    setEditingCmd(cmd);
    setClientNom(cmd.clientNom);
    setClientIce(cmd.clientIce);
    setChantierId(cmd.chantierId || '');
    setDateCommande(cmd.dateCommande);
    setDelaiLivraison(cmd.delaiLivraison);
    setDesignation(cmd.items[0]?.designation || '');
    setTotalHT(cmd.totalHT);
    setNotes(cmd.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNom.trim()) return;

    const chantier = store.chantiersActifs.find(c => c.id === chantierId);

    if (editingCmd) {
      store.updateCommandeClient(editingCmd.id, {
        clientNom,
        clientIce,
        chantierId,
        chantierNom: chantier?.nom,
        dateCommande,
        delaiLivraison,
        totalHT: Number(totalHT),
        tauxTva: 20,
        items: [
          { id: 'ci-1', designation, unite: 'forfait', quantite: 1, prixUnitaireHT: Number(totalHT), totalHT: Number(totalHT) }
        ],
        notes
      });
      showToast(`Commande ${editingCmd.reference} modifiée.`);
    } else {
      const newCmd = store.addCommandeClient({
        clientId: 'cli-01',
        clientNom,
        clientIce,
        chantierId,
        chantierNom: chantier?.nom,
        dateCommande,
        delaiLivraison,
        totalHT: Number(totalHT),
        tauxTva: 20,
        statut: 'CONFIRMEE',
        items: [
          { id: 'ci-1', designation, unite: 'forfait', quantite: 1, prixUnitaireHT: Number(totalHT), totalHT: Number(totalHT) }
        ],
        notes
      });
      showToast(`Commande ${newCmd.reference} enregistrée.`);
    }

    setIsModalOpen(false);
  };

  const handleTransformerEnBL = (commandeId: string) => {
    try {
      const bl = store.convertirCommandeEnBL(commandeId);
      showToast(`Bon de Livraison Vente généré : ${bl.reference}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportPDF = (cmd: CommandeClient) => {
    genererPDFCommandeClient(cmd, store.company);
    showToast(`PDF de la commande ${cmd.reference} généré.`);
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
              <FileText className="w-6 h-6 text-blue-600" />
              Commandes Client (Ventes BTP)
            </h1>
            <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full uppercase">
              {store.company.raisonSociale.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestion des ordres de commande client, planning d'engagement et transformation en Bon de Livraison (BL)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Commande
        </button>
      </div>

      {/* Recherche */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par référence (CC-2026-...), client ou chantier..."
          className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Liste des Commandes */}
      <div className="space-y-3">
        {commandes.map((cmd) => (
          <div key={cmd.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                  {cmd.reference}
                </span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  {cmd.statut}
                </span>
                <span className="text-xs text-slate-400">• Date : {formatDateFR(cmd.dateCommande)}</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">{cmd.clientNom}</p>
              <p className="text-xs text-slate-500">
                Chantier : <strong>{cmd.chantierNom || 'Non assigné'}</strong> • Délai : {cmd.delaiLivraison}
              </p>
            </div>

            <div className="flex flex-col md:items-end gap-2">
              <div className="text-left md:text-right">
                <div className="text-base font-extrabold text-slate-900">{formatMAD(cmd.totalTTC)}</div>
                <div className="text-[11px] text-slate-500">HT : {formatMAD(cmd.totalHT)} (TVA 20%)</div>
              </div>

              <div className="flex items-center gap-2">
                {cmd.statut !== 'LIVREE' && (
                  <button
                    onClick={() => handleTransformerEnBL(cmd.id)}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                    title="Générer le Bon de Livraison"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    → Bon de Livraison (BL)
                  </button>
                )}

                <button
                  onClick={() => handleExportPDF(cmd)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleOpenEdit(cmd)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    store.duplicateCommandeClient(cmd.id);
                    showToast(`Commande ${cmd.reference} dupliquée.`);
                  }}
                  className="p-1.5 text-slate-400 hover:text-btp-orange rounded-lg"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Supprimer la commande ${cmd.reference} ?`)) {
                      store.deleteCommandeClient(cmd.id);
                      showToast(`Commande supprimée.`);
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

      {/* Modal Créer / Modifier */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                {editingCmd ? `Modifier Commande ${editingCmd.reference}` : 'Nouvelle Commande Client'}
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
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ICE Client</label>
                  <input
                    type="text"
                    value={clientIce}
                    onChange={(e) => setClientIce(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Chantier rattaché</label>
                <select
                  value={chantierId}
                  onChange={(e) => setChantierId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {store.chantiersActifs.map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.code} — {ch.nom}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date commande</label>
                  <input
                    type="date"
                    value={dateCommande}
                    onChange={(e) => setDateCommande(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Délai convenu</label>
                  <input
                    type="text"
                    value={delaiLivraison}
                    onChange={(e) => setDelaiLivraison(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Désignation des Prestations</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Total Montant HT (MAD) *</label>
                <input
                  type="number"
                  value={totalHT}
                  onChange={(e) => setTotalHT(Number(e.target.value))}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  {editingCmd ? 'Enregistrer' : 'Créer la commande'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
