'use client';

import React, { useState, useEffect } from 'react';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import { FactureAchat } from '@/lib/types';
import {
  Receipt,
  Plus,
  Search,
  Sparkles,
  CreditCard,
  CheckCircle2,
  X,
  Edit,
  Copy,
  Trash2,
  Building
} from 'lucide-react';
import ScannerFactureModal from '@/components/ScannerFactureModal';

export default function AchatsFacturesPage() {
  const [, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingFA, setEditingFA] = useState<FactureAchat | null>(null);

  // Form states
  const [fournisseurNom, setFournisseurNom] = useState('LafargeHolcim Maroc');
  const [fournisseurIce, setFournisseurIce] = useState('001524368000012');
  const [numeroFactureFournisseur, setNumeroFactureFournisseur] = useState('FAC-LH-99214');
  const [dateFacture, setDateFacture] = useState(new Date().toISOString().split('T')[0]);
  const [dateEcheance, setDateEcheance] = useState(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [chantierId, setChantierId] = useState(store.chantiersActifs[0]?.id || '');
  const [designation, setDesignation] = useState('Achat 600 sacs Ciment CPJ45');
  const [totalHT, setTotalHT] = useState<number>(47100);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const factures = store.facturesAchatActives.filter(f =>
    f.numeroFacture.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.fournisseurNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.numeroFactureFournisseur && f.numeroFactureFournisseur.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingFA(null);
    setFournisseurNom(store.fournisseursActifs[0]?.nom || 'LafargeHolcim Maroc');
    setFournisseurIce(store.fournisseursActifs[0]?.ice || '001524368000012');
    setNumeroFactureFournisseur('FAC-LH-' + Math.floor(10000 + Math.random() * 90000));
    setDateFacture(new Date().toISOString().split('T')[0]);
    setDateEcheance(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setChantierId(store.chantiersActifs[0]?.id || '');
    setDesignation('Achat matériaux gros œuvre');
    setTotalHT(50000);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chantier = store.chantiersActifs.find(c => c.id === chantierId);
    const totalTTC = totalHT * 1.20;

    if (editingFA) {
      store.updateFactureAchat(editingFA.id, {
        fournisseurNom,
        fournisseurIce,
        numeroFactureFournisseur,
        dateFacture,
        dateEcheance,
        chantierId,
        chantierNom: chantier?.nom,
        totalHT: Number(totalHT),
        tauxTva: 20
      });
      showToast(`Facture fournisseur ${editingFA.numeroFacture} mise à jour.`);
    } else {
      const newFA = store.addFactureAchat({
        numeroFactureFournisseur,
        dateFacture,
        dateEcheance,
        fournisseurId: 'fourn-01',
        fournisseurNom,
        fournisseurIce,
        chantierId,
        chantierNom: chantier?.nom,
        sourceScannerIA: false,
        items: [
          { id: 'fai-1', designation, unite: 'forfait', quantite: 1, prixUnitaireHT: Number(totalHT), totalHT: Number(totalHT) }
        ],
        totalHT: Number(totalHT),
        tauxTva: 20,
        statut: 'A_PAYER'
      });
      showToast(`Facture d'achat ${newFA.numeroFacture} enregistrée.`);
    }

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
              <Receipt className="w-6 h-6 text-cyan-600" />
              Factures d'Achat Fournisseurs (Sage 100)
            </h1>
            <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full uppercase">
              {store.company.raisonSociale.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Contrôle des factures fournisseurs, TVA récupérable, échéancier de paiement et intégration OCR IA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Scanner Facture (IA)
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Facture
          </button>
        </div>
      </div>

      {/* Recherche */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par numéro interne (FA-2026-...), n° fournisseur ou nom..."
          className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Liste des Factures d'Achat */}
      <div className="space-y-3">
        {factures.map((fa) => {
          const isPayee = fa.statut === 'PAYEE';

          return (
            <div key={fa.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded">
                    {fa.numeroFacture}
                  </span>
                  {fa.numeroFactureFournisseur && (
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Papier N° : {fa.numeroFactureFournisseur}
                    </span>
                  )}
                  {fa.sourceScannerIA && (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" /> Scanner IA
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isPayee
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {fa.statut}
                  </span>
                  <span className="text-xs text-slate-400">• Échéance : {formatDateFR(fa.dateEcheance)}</span>
                </div>
                <p className="font-bold text-slate-900 text-sm">{fa.fournisseurNom}</p>
                <p className="text-xs text-slate-500">
                  Chantier affecté : <strong>{fa.chantierNom || 'Stock Central'}</strong> • ICE : {fa.fournisseurIce}
                </p>
              </div>

              <div className="flex flex-col md:items-end gap-2">
                <div className="text-left md:text-right">
                  <div className="text-base font-extrabold text-slate-900">{formatMAD(fa.totalTTC)}</div>
                  <div className="text-[11px] text-slate-500">HT : {formatMAD(fa.totalHT)} • TVA 20% récupérable : {formatMAD(fa.montantTva)}</div>
                  {fa.soldeDu > 0 && (
                    <div className="text-xs font-bold text-amber-600">Reste à décaisser : {formatMAD(fa.soldeDu)}</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer la facture d'achat ${fa.numeroFacture} ?`)) {
                        store.deleteFactureAchat(fa.id);
                        showToast(`Facture supprimée.`);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Créer Facture */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-cyan-400" />
                Saisir une Facture Fournisseur
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fournisseur</label>
                  <select
                    value={fournisseurNom}
                    onChange={(e) => {
                      setFournisseurNom(e.target.value);
                      const f = store.fournisseursActifs.find(x => x.nom === e.target.value);
                      if (f) setFournisseurIce(f.ice);
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                  >
                    {store.fournisseursActifs.map(f => (
                      <option key={f.id} value={f.nom}>{f.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">N° sur Papier Fournisseur</label>
                  <input
                    type="text"
                    value={numeroFactureFournisseur}
                    onChange={(e) => setNumeroFactureFournisseur(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Chantier d'affectation</label>
                <select
                  value={chantierId}
                  onChange={(e) => setChantierId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                >
                  <option value="">-- Dépôt Central (Stock) --</option>
                  {store.chantiersActifs.map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.code} — {ch.nom}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date Facture</label>
                  <input
                    type="date"
                    value={dateFacture}
                    onChange={(e) => setDateFacture(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date Échéance</label>
                  <input
                    type="date"
                    value={dateEcheance}
                    onChange={(e) => setDateEcheance(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Désignation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Montant Total Hors Taxes HT (MAD) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={totalHT}
                  onChange={(e) => setTotalHT(Number(e.target.value))}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Total TTC avec 20% TVA : <strong>{formatMAD(totalHT * 1.20)}</strong>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900">
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-xs">
                  Valider la Facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Scanner IA */}
      <ScannerFactureModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSuccess={() => showToast('Facture fournisseur importée avec succès via le Scanner IA !')}
      />

    </div>
  );
}
