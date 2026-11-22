'use client';

import React, { useState, useEffect } from 'react';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import { BonReception } from '@/lib/types';
import {
  PackageCheck,
  Plus,
  Search,
  Receipt,
  CheckCircle2,
  X,
  Building,
  Boxes,
  Trash2
} from 'lucide-react';

export default function AchatsReceptionsPage() {
  const [, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [fournisseurNom, setFournisseurNom] = useState('LafargeHolcim Maroc');
  const [chantierId, setChantierId] = useState(store.chantiersActifs[0]?.id || '');
  const [affectation, setAffectation] = useState<'STOCK_CENTRAL' | 'CHANTIER_DIRECT'>('CHANTIER_DIRECT');
  const [dateReception, setDateReception] = useState(new Date().toISOString().split('T')[0]);
  const [designation, setDesignation] = useState('Ciment CPJ 45 LafargeHolcim (Sac 50kg)');
  const [quantite, setQuantite] = useState<number>(300);
  const [unite, setUnite] = useState('Sac');
  const [prixUnitaireHT, setPrixUnitaireHT] = useState<number>(78.50);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const receptions = store.bonsReceptionActifs.filter(b =>
    b.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.fournisseurNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.chantierNom && b.chantierNom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const four = store.fournisseursActifs.find(f => f.nom.toLowerCase().includes(fournisseurNom.toLowerCase()));
    const chantier = store.chantiersActifs.find(c => c.id === chantierId);
    const totalHT = quantite * prixUnitaireHT;
    const montantTva = totalHT * 0.20;
    const totalTTC = totalHT + montantTva;

    const count = store.bonsReception.length + 1;
    const ref = `BR-2026-${String(count).padStart(4, '0')}`;

    const newBR: BonReception = {
      id: 'br-' + Date.now().toString(36),
      societeId: store.activeSocieteId,
      reference: ref,
      dateReception,
      fournisseurId: four?.id || 'fourn-01',
      fournisseurNom,
      chantierId: affectation === 'CHANTIER_DIRECT' ? chantierId : undefined,
      chantierNom: affectation === 'CHANTIER_DIRECT' && chantier ? chantier.nom : undefined,
      affectation,
      items: [
        { id: 'bri-1', designation, unite, quantite: Number(quantite), prixUnitaireHT: Number(prixUnitaireHT), totalHT }
      ],
      totalHT,
      tauxTva: 20,
      montantTva,
      totalTTC,
      statut: 'CONFORME',
      receptionnePar: store.currentUser.nom
    };

    store.bonsReception.unshift(newBR);

    // Mettre à jour stock
    const art = store.materiaux.find(m => m.designation.toLowerCase().includes(designation.toLowerCase()));
    if (art) {
      art.stockActuel += Number(quantite);
    }

    // Si affecté à un chantier, créer dépense
    if (affectation === 'CHANTIER_DIRECT' && chantierId) {
      store.addDepense({
        chantierId,
        date: dateReception,
        categorie: 'MATERIAUX',
        designation: `Réception ${ref} : ${quantite} ${unite} de ${designation}`,
        montantHT: totalHT,
        fournisseurNom,
        payePar: 'Bon de Réception'
      });
    }

    store.saveToStorage();
    setTick(t => t + 1);
    showToast(`Bon de réception ${ref} validé.`);
    setIsModalOpen(false);
  };

  const handleFacturer = (brId: string) => {
    try {
      const fa = store.convertirBonReceptionEnFacture(brId);
      showToast(`Facture d'achat ${fa.numeroFacture} générée.`);
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
              <PackageCheck className="w-6 h-6 text-teal-600" />
              Bons de Réception Matériaux (Achats BTP)
            </h1>
            <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full uppercase">
              {store.company.raisonSociale.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Contrôle quantitatif, entrée en stock automatique ou affectation immédiate au coût d'un chantier BTP
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Réception
        </button>
      </div>

      {/* Recherche */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par référence (BR-2026-...), fournisseur ou chantier..."
          className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {receptions.map((br) => (
          <div key={br.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                  {br.reference}
                </span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                  {br.statut}
                </span>
                <span className="text-xs text-slate-400">• Reçu le {formatDateFR(br.dateReception)} par {br.receptionnePar || 'Conducteur travaux'}</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">{br.fournisseurNom}</p>
              <p className="text-xs text-slate-500">
                {br.items[0]?.designation} ({br.items[0]?.quantite} {br.items[0]?.unite}) • Destination : <strong>{br.chantierNom || 'Stock Dépôt Central'}</strong>
              </p>
            </div>

            <div className="flex flex-col md:items-end gap-2">
              <div className="text-left md:text-right">
                <div className="text-base font-extrabold text-slate-900">{formatMAD(br.totalTTC)}</div>
                <div className="text-[11px] text-slate-500">HT : {formatMAD(br.totalHT)} (TVA 20%)</div>
              </div>

              <div className="flex items-center gap-2">
                {br.statut !== 'FACTURE' && (
                  <button
                    onClick={() => handleFacturer(br.id)}
                    className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                    title="Générer la Facture d'Achat Fournisseur"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    → Facture d'Achat
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
                <PackageCheck className="w-4 h-4 text-teal-400" />
                Réceptionner des Matériaux
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
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                >
                  {store.fournisseursActifs.map(f => (
                    <option key={f.id} value={f.nom}>{f.nom} ({f.specialite})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAffectation('CHANTIER_DIRECT')}
                  className={`p-2.5 rounded-xl border text-left ${affectation === 'CHANTIER_DIRECT' ? 'border-teal-600 bg-teal-50' : 'border-slate-200'}`}
                >
                  <p className="font-bold text-slate-900">Affecter au Chantier</p>
                  <p className="text-[10px] text-slate-500">Impute le coût réel</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAffectation('STOCK_CENTRAL')}
                  className={`p-2.5 rounded-xl border text-left ${affectation === 'STOCK_CENTRAL' ? 'border-teal-600 bg-teal-50' : 'border-slate-200'}`}
                >
                  <p className="font-bold text-slate-900">Dépôt Central</p>
                  <p className="text-[10px] text-slate-500">Incrémente le stock</p>
                </button>
              </div>

              {affectation === 'CHANTIER_DIRECT' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Chantier Destinataire</label>
                  <select
                    value={chantierId}
                    onChange={(e) => setChantierId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  >
                    {store.chantiersActifs.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.code} — {ch.nom}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Désignation Matériau Reçu</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Quantité reçue</label>
                  <input
                    type="number"
                    value={quantite}
                    onChange={(e) => setQuantite(Number(e.target.value))}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-teal-600 focus:outline-none"
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
                <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs">
                  Valider la Réception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
