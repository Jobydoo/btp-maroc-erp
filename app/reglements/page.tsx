'use client';

import React, { useState, useEffect } from 'react';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import { Reglement, SensReglement, ModeReglement } from '@/lib/types';
import {
  CreditCard,
  Plus,
  Search,
  Edit,
  Copy,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  X,
  Building,
  Briefcase,
  Layers
} from 'lucide-react';

export default function ReglementsPage() {
  const [, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSens, setFilterSens] = useState<string>('TOUS');
  const [filterMode, setFilterMode] = useState<string>('TOUS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReg, setEditingReg] = useState<Reglement | null>(null);

  // Form states
  const [sens, setSens] = useState<SensReglement>('ENCAISSEMENT_CLIENT');
  const [factureId, setFactureId] = useState('');
  const [montantMAD, setMontantMAD] = useState<number>(100000);
  const [modeReglement, setModeReglement] = useState<ModeReglement>('VIREMENT');
  const [referencePiece, setReferencePiece] = useState('VIR-ATTIJARI-' + Math.floor(100000 + Math.random() * 900000));
  const [banque, setBanque] = useState('Attijariwafa Bank');
  const [dateReglement, setDateReglement] = useState(new Date().toISOString().split('T')[0]);
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

  const reglements = store.reglementsActifs.filter(r => {
    const matchSearch = r.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tierNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.factureNumero && r.factureNumero.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.referencePiece.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSens = filterSens === 'TOUS' || r.sens === filterSens;
    const matchMode = filterMode === 'TOUS' || r.modeReglement === filterMode;
    return matchSearch && matchSens && matchMode;
  });

  const totalEncaisse = store.reglementsActifs
    .filter(r => r.sens === 'ENCAISSEMENT_CLIENT')
    .reduce((s, r) => s + r.montantMAD, 0);

  const totalDecaisse = store.reglementsActifs
    .filter(r => r.sens === 'DECAISSEMENT_FOURNISSEUR')
    .reduce((s, r) => s + r.montantMAD, 0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingReg(null);
    setSens('ENCAISSEMENT_CLIENT');
    const firstFac = store.facturesVenteActives.find(f => f.soldeDu > 0);
    setFactureId(firstFac?.id || '');
    setMontantMAD(firstFac?.soldeDu || 50000);
    setModeReglement('VIREMENT');
    setReferencePiece('VIR-ATTIJARI-' + Math.floor(100000 + Math.random() * 900000));
    setBanque('Attijariwafa Bank');
    setDateReglement(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: Reglement) => {
    setEditingReg(r);
    setSens(r.sens);
    setFactureId(r.factureId || '');
    setMontantMAD(r.montantMAD);
    setModeReglement(r.modeReglement);
    setReferencePiece(r.referencePiece);
    setBanque(r.banque || 'Attijariwafa Bank');
    setDateReglement(r.dateReglement);
    setNotes(r.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (montantMAD <= 0) return;

    let tierId = 'cli-01';
    let tierNom = 'Client';
    let factureNumero = '';

    if (sens === 'ENCAISSEMENT_CLIENT') {
      const fac = store.facturesVenteActives.find(f => f.id === factureId);
      if (fac) {
        tierId = fac.clientId;
        tierNom = fac.clientNom;
        factureNumero = fac.numeroFacture;
      }
    } else {
      const fa = store.facturesAchatActives.find(f => f.id === factureId);
      if (fa) {
        tierId = fa.fournisseurId;
        tierNom = fa.fournisseurNom;
        factureNumero = fa.numeroFacture;
      }
    }

    if (editingReg) {
      store.updateReglement(editingReg.id, {
        dateReglement,
        sens,
        tierId,
        tierNom,
        factureId,
        factureNumero,
        montantMAD: Number(montantMAD),
        modeReglement,
        referencePiece,
        banque,
        notes
      });
      showToast(`Règlement ${editingReg.reference} mis à jour.`);
    } else {
      const newR = store.enregistrerReglement({
        dateReglement,
        sens,
        tierId,
        tierNom,
        factureId: factureId || undefined,
        factureNumero: factureNumero || undefined,
        montantMAD: Number(montantMAD),
        modeReglement,
        referencePiece,
        banque,
        statut: 'VALIDE',
        notes
      });
      showToast(`Règlement ${newR.reference} de ${formatMAD(montantMAD)} enregistré avec lettrage.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (r: Reglement) => {
    if (confirm(`Supprimer le règlement ${r.reference} ?`)) {
      store.deleteReglement(r.id);
      showToast(`Règlement supprimé.`);
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
              <CreditCard className="w-6 h-6 text-emerald-600" />
              Trésorerie & Saisie des Règlements (Sage 100)
            </h1>
            <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full uppercase">
              {store.company.raisonSociale.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Encaissements clients, décaissements fournisseurs, lettrage automatique avec factures et suivi d'encours
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Saisir un Règlement
        </button>
      </div>

      {/* 2 Cartes Résumé Trésorerie */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Encaissements Clients
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              + {formatMAD(totalEncaisse)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Règlements reçus (Virements, Chèques, LCN)</p>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Décaissements Fournisseurs
            </span>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">
              - {formatMAD(totalDecaisse)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Paiements émis aux fournisseurs de matériaux</p>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filtres & Recherche */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par référence (REG-2026-...), client, fournisseur, n° facture ou chèque..."
            className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSens}
            onChange={(e) => setFilterSens(e.target.value)}
            className="text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
          >
            <option value="TOUS">Tous les flux (Encaissements & Décaissements)</option>
            <option value="ENCAISSEMENT_CLIENT">Encaissements Clients uniquement</option>
            <option value="DECAISSEMENT_FOURNISSEUR">Décaissements Fournisseurs uniquement</option>
          </select>

          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
          >
            <option value="TOUS">Tous modes</option>
            <option value="VIREMENT">Virement</option>
            <option value="CHEQUE">Chèque</option>
            <option value="EFFET_LCN">Effet LCN</option>
            <option value="ESPECES">Espèces</option>
          </select>
        </div>
      </div>

      {/* Tableau des Règlements */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Réf Règlement</th>
                <th className="p-3">Date</th>
                <th className="p-3">Sens du Flux</th>
                <th className="p-3">Tiers (Client / Fournisseur)</th>
                <th className="p-3">Facture Lettrée</th>
                <th className="p-3">Mode & Réf Pièce</th>
                <th className="p-3 text-right">Montant (MAD)</th>
                <th className="p-3 text-center">Statut</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reglements.map((r) => {
                const isEncaissement = r.sens === 'ENCAISSEMENT_CLIENT';

                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-700">{r.reference}</td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">{formatDateFR(r.dateReglement)}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isEncaissement
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {isEncaissement ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {isEncaissement ? 'Encaissement Client' : 'Décaissement Fournisseur'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{r.tierNom}</td>
                    <td className="p-3 font-mono font-semibold text-slate-600">
                      {r.factureNumero ? (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                          {r.factureNumero}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Acompte sans facture</span>
                      )}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800">{r.modeReglement} ({r.banque || 'Banque'})</p>
                      <p className="font-mono text-[11px] text-slate-500">{r.referencePiece}</p>
                    </td>
                    <td className={`p-3 text-right font-mono font-extrabold text-sm ${isEncaissement ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {isEncaissement ? '+' : '-'} {formatMAD(r.montantMAD)}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {r.statut}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                          title="Modifier"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            store.duplicateReglement(r.id);
                            showToast(`Règlement ${r.reference} dupliqué.`);
                          }}
                          className="p-1.5 text-slate-400 hover:text-btp-orange rounded-lg"
                          title="Dupliquer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
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

      {/* Modal Saisir un Règlement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                {editingReg ? `Modifier Règlement ${editingReg.reference}` : 'Saisie d\'un Nouveau Règlement'}
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
                  <label className="block text-slate-700 font-semibold mb-1">Sens du Flux *</label>
                  <select
                    value={sens}
                    onChange={(e) => {
                      const s = e.target.value as SensReglement;
                      setSens(s);
                      if (s === 'ENCAISSEMENT_CLIENT') {
                        const first = store.facturesVenteActives.find(f => f.soldeDu > 0);
                        setFactureId(first?.id || '');
                        setMontantMAD(first?.soldeDu || 50000);
                      } else {
                        const first = store.facturesAchatActives.find(f => f.soldeDu > 0);
                        setFactureId(first?.id || '');
                        setMontantMAD(first?.soldeDu || 50000);
                      }
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                  >
                    <option value="ENCAISSEMENT_CLIENT">Encaissement Client (Entrée)</option>
                    <option value="DECAISSEMENT_FOURNISSEUR">Décaissement Fournisseur (Sortie)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date d'opération</label>
                  <input
                    type="date"
                    value={dateReglement}
                    onChange={(e) => setDateReglement(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {sens === 'ENCAISSEMENT_CLIENT' ? 'Facture Client à lettrer' : 'Facture Fournisseur à lettrer'}
                </label>
                <select
                  value={factureId}
                  onChange={(e) => {
                    const fid = e.target.value;
                    setFactureId(fid);
                    if (sens === 'ENCAISSEMENT_CLIENT') {
                      const f = store.facturesVenteActives.find(x => x.id === fid);
                      if (f) setMontantMAD(f.soldeDu);
                    } else {
                      const f = store.facturesAchatActives.find(x => x.id === fid);
                      if (f) setMontantMAD(f.soldeDu);
                    }
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                >
                  <option value="">-- Sans facture (Acompte libre) --</option>
                  {sens === 'ENCAISSEMENT_CLIENT' ? (
                    store.facturesVenteActives.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.numeroFacture} — {f.clientNom} (Reste : {formatMAD(f.soldeDu)})
                      </option>
                    ))
                  ) : (
                    store.facturesAchatActives.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.numeroFacture} — {f.fournisseurNom} (Reste : {formatMAD(f.soldeDu)})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Montant à Régler en MAD *</label>
                <input
                  type="number"
                  step="0.01"
                  value={montantMAD}
                  onChange={(e) => setMontantMAD(Number(e.target.value))}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mode de Règlement</label>
                  <select
                    value={modeReglement}
                    onChange={(e) => setModeReglement(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                  >
                    <option value="VIREMENT">Virement Bancaire</option>
                    <option value="CHEQUE">Chèque</option>
                    <option value="EFFET_LCN">Lettre de Change (LCN)</option>
                    <option value="ESPECES">Espèces</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Banque</label>
                  <input
                    type="text"
                    value={banque}
                    onChange={(e) => setBanque(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">N° Pièce / N° Chèque ou Virement</label>
                <input
                  type="text"
                  value={referencePiece}
                  onChange={(e) => setReferencePiece(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  {editingReg ? 'Enregistrer' : 'Valider le Règlement'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
