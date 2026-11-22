'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import { Devis, Decompte, StatutDevis } from '@/lib/types';
import { genererPDFDevis, genererPDFDecompte } from '@/lib/pdf-generator';
import {
  FileText,
  PlusCircle,
  Download,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  Calculator,
  Percent,
  Receipt,
  AlertCircle,
  X,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';

export default function DevisPage() {
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<'devis' | 'decomptes'>('devis');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Decompte modal (Create)
  const [decompteModalOpen, setDecompteModalOpen] = useState(false);
  const [selChantierId, setSelChantierId] = useState(store.chantiers[0]?.id || '');
  const [decomptePct, setDecomptePct] = useState('45');
  const [periodeDebut, setPeriodeDebut] = useState('2026-03-01');
  const [periodeFin, setPeriodeFin] = useState('2026-03-31');

  // Devis Edit Modal State
  const [editDevisModalOpen, setEditDevisModalOpen] = useState(false);
  const [editingDevis, setEditingDevis] = useState<Devis | null>(null);
  const [editDevisObjet, setEditDevisObjet] = useState('');
  const [editDevisClient, setEditDevisClient] = useState('');
  const [editDevisIce, setEditDevisIce] = useState('');
  const [editDevisTel, setEditDevisTel] = useState('');
  const [editDevisVille, setEditDevisVille] = useState('Casablanca');
  const [editDevisStatut, setEditDevisStatut] = useState<StatutDevis>('BROUILLON');
  const [editDevisDateValidite, setEditDevisDateValidite] = useState('');

  // Decompte Edit Modal State
  const [editDecompteModalOpen, setEditDecompteModalOpen] = useState(false);
  const [editingDecompte, setEditingDecompte] = useState<Decompte | null>(null);
  const [editDecStatut, setEditDecStatut] = useState<'EMIS' | 'VALIDE' | 'PAYE'>('EMIS');
  const [editDecPct, setEditDecPct] = useState('50');

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const showNotification = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 3500);
  };

  const devisList = store.devis;
  const decomptesList = store.decomptes;
  const company = store.company;

  const handleConvertir = (devisId: string) => {
    const ch = store.convertirDevisEnChantier(devisId);
    if (ch) {
      showNotification(`Succès ! Devis converti en chantier actif : ${ch.nom} (${ch.code})`);
    }
  };

  // --- Devis Actions ---
  const openEditDevisModal = (d: Devis) => {
    setEditingDevis(d);
    setEditDevisObjet(d.objet);
    setEditDevisClient(d.clientNom);
    setEditDevisIce(d.clientIce || '');
    setEditDevisTel(d.clientTel || '');
    setEditDevisVille(d.clientVille || 'Casablanca');
    setEditDevisStatut(d.statut);
    setEditDevisDateValidite(d.dateValidite);
    setEditDevisModalOpen(true);
  };

  const handleSaveDevisEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevis) return;

    store.updateDevis(editingDevis.id, {
      objet: editDevisObjet,
      clientNom: editDevisClient,
      clientIce: editDevisIce,
      clientTel: editDevisTel,
      clientVille: editDevisVille,
      statut: editDevisStatut,
      dateValidite: editDevisDateValidite
    });

    setEditDevisModalOpen(false);
    showNotification(`Devis "${editingDevis.reference}" mis à jour avec succès.`);
  };

  const handleDuplicateDevis = (id: string, ref: string) => {
    const clone = store.duplicateDevis(id);
    if (clone) {
      showNotification(`Devis ${ref} dupliqué sous la référence ${clone.reference}.`);
    }
  };

  const handleDeleteDevis = (id: string, ref: string) => {
    if (window.confirm(`Confirmez-vous la suppression du devis ${ref} ?`)) {
      const ok = store.deleteDevis(id);
      if (ok) {
        showNotification(`Devis ${ref} supprimé.`);
      }
    }
  };

  // --- Decompte Actions ---
  const handleCreerDecompte = (e: React.FormEvent) => {
    e.preventDefault();
    const pct = parseFloat(decomptePct) || 10;
    const dec = store.creerDecompte(selChantierId, pct, periodeDebut, periodeFin);
    if (dec) {
      setDecompteModalOpen(false);
      setActiveTab('decomptes');
      showNotification(`Décompte ${dec.numero} émis avec succès (${dec.pourcentageCumule}% d'avancement).`);
    }
  };

  const openEditDecompteModal = (dec: Decompte) => {
    setEditingDecompte(dec);
    setEditDecStatut(dec.statut);
    setEditDecPct(String(dec.pourcentageCumule));
    setEditDecompteModalOpen(true);
  };

  const handleSaveDecompteEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDecompte) return;

    store.updateDecompte(editingDecompte.id, {
      statut: editDecStatut,
      pourcentageCumule: parseFloat(editDecPct) || editingDecompte.pourcentageCumule
    });

    setEditDecompteModalOpen(false);
    showNotification(`Décompte ${editingDecompte.numero} mis à jour (Statut: ${editDecStatut}).`);
  };

  const handleDuplicateDecompte = (id: string, num: string) => {
    const clone = store.duplicateDecompte(id);
    if (clone) {
      showNotification(`Situation / Décompte ${num} dupliqué sous ${clone.numero}.`);
    }
  };

  const handleDeleteDecompte = (id: string, num: string) => {
    if (window.confirm(`Confirmez-vous la suppression du décompte ${num} ?`)) {
      const ok = store.deleteDecompte(id);
      if (ok) {
        showNotification(`Décompte ${num} supprimé.`);
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

      {/* Header & New Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Devis (DQE) & Décomptes d'Avancement
            <span className="text-xs bg-btp-orange text-white font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Format Maroc
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bordereaux des prix unitaires, édition, duplication, retenue de garantie 10% et exports PDF certifiés
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/devis/nouveau"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-btp-orange hover:bg-btp-orange-dark text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Nouveau Devis DQE
          </Link>

          <button
            onClick={() => setDecompteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <Receipt className="w-4 h-4 text-btp-orange" />
            Émettre un Décompte
          </button>
        </div>
      </div>

      {/* Tabs Selector: Devis vs Décomptes */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('devis')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'devis'
              ? 'border-btp-orange text-btp-orange'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Devis Quantitatifs Estimatifs ({devisList.length})
        </button>

        <button
          onClick={() => setActiveTab('decomptes')}
          className={`py-3 px-4 font-bold text-xs sm:text-sm border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'decomptes'
              ? 'border-btp-orange text-btp-orange'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Décomptes d'Avancement ({decomptesList.length})
        </button>
      </div>

      {/* TAB 1: LISTE DES DEVIS DQE */}
      {activeTab === 'devis' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devisList.map((d) => (
              <div
                key={d.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-btp-orange bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                      {d.reference}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      d.statut === 'VALIDE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : d.statut === 'CONVERTI_CHANTIER'
                        ? 'bg-blue-100 text-blue-800'
                        : d.statut === 'REFUSE'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {d.statut === 'CONVERTI_CHANTIER' ? 'Converti en Chantier' : d.statut}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 mt-1 leading-snug">
                    {d.objet}
                  </h3>

                  <div className="mt-2.5 text-xs text-slate-600 space-y-1">
                    <p>Client : <strong>{d.clientNom}</strong> (ICE: {d.clientIce || 'N/A'})</p>
                    <p>Ville : {d.clientVille} • Validité : {formatDateFR(d.dateValidite)}</p>
                    <p className="text-slate-500 text-[11px]">{d.items.length} poste(s) budgété(s)</p>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total HT</span>
                      <strong className="text-xs font-bold text-slate-700">{formatMAD(d.totalHT)}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Net TTC (TVA 20%)</span>
                      <strong className="text-sm font-black text-slate-900">{formatMAD(d.totalTTC)}</strong>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons: PDF, Convert, Edit, Duplicate, Delete */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => genererPDFDevis(d, company)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg shadow-xs transition-all"
                    >
                      <Download className="w-3.5 h-3.5 text-btp-orange" />
                      PDF Légal
                    </button>

                    {d.statut !== 'CONVERTI_CHANTIER' && (
                      <button
                        onClick={() => handleConvertir(d.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-btp-orange hover:bg-btp-orange-dark text-white text-xs font-bold rounded-lg shadow-xs transition-all"
                      >
                        <Building className="w-3.5 h-3.5" />
                        Convertir
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditDevisModal(d)}
                      title="Modifier ce devis"
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicateDevis(d.id, d.reference)}
                      title="Dupliquer ce devis (créer une copie)"
                      className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteDevis(d.id, d.reference)}
                      title="Supprimer ce devis"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LISTE DES DÉCOMPTES D'AVANCEMENT */}
      {activeTab === 'decomptes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">N° Décompte</th>
                    <th className="py-3 px-3">Chantier Concerné</th>
                    <th className="py-3 px-3">Période</th>
                    <th className="py-3 px-3 text-center">Avancement</th>
                    <th className="py-3 px-3 text-right">Brut Période HT</th>
                    <th className="py-3 px-3 text-right">Retenue 10%</th>
                    <th className="py-3 px-3 text-right font-bold text-slate-900">Net TTC (MAD)</th>
                    <th className="py-3 px-3 text-center">Statut</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {decomptesList.map((dec) => {
                    const ch = store.chantiers.find(c => c.id === dec.chantierId);
                    return (
                      <tr key={dec.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{dec.numero}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{ch?.nom || 'Chantier'}</td>
                        <td className="py-3 px-3 text-slate-500">{formatDateFR(dec.periodeDebut)} au {formatDateFR(dec.periodeFin)}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="bg-orange-50 text-btp-orange font-bold px-2 py-0.5 rounded text-[11px] border border-orange-200">
                            {dec.pourcentageCumule} %
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-700">{formatMAD(dec.montantPeriodeHT)}</td>
                        <td className="py-3 px-3 text-right text-rose-600 font-medium">- {formatMAD(dec.retenueGarantie10Pct)}</td>
                        <td className="py-3 px-3 text-right font-black text-slate-900">{formatMAD(dec.montantTTC)}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            dec.statut === 'PAYE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {dec.statut}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => ch && genererPDFDecompte(dec, ch, company)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-slate-700 text-[11px] font-bold"
                              title="Télécharger le Décompte PDF"
                            >
                              <Download className="w-3 h-3 text-btp-orange" />
                              PDF
                            </button>
                            <button
                              onClick={() => openEditDecompteModal(dec)}
                              className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="Modifier statut ou informations du décompte"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDuplicateDecompte(dec.id, dec.numero)}
                              className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Dupliquer ce décompte"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteDecompte(dec.id, dec.numero)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Supprimer ce décompte"
                            >
                              <Trash2 className="w-3 h-3" />
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

      {/* MODAL MODIFIER DEVIS */}
      {editDevisModalOpen && editingDevis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Modifier le Devis {editingDevis.reference}</h3>
                <p className="text-[11px] text-slate-300">Ajustement des coordonnées client et du statut</p>
              </div>
              <button onClick={() => setEditDevisModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveDevisEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Objet / Titre du Devis *</label>
                <input
                  type="text"
                  required
                  value={editDevisObjet}
                  onChange={(e) => setEditDevisObjet(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom Client *</label>
                  <input
                    type="text"
                    required
                    value={editDevisClient}
                    onChange={(e) => setEditDevisClient(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ICE Client</label>
                  <input
                    type="text"
                    value={editDevisIce}
                    onChange={(e) => setEditDevisIce(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={editDevisTel}
                    onChange={(e) => setEditDevisTel(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={editDevisVille}
                    onChange={(e) => setEditDevisVille(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Statut Commercial</label>
                  <select
                    value={editDevisStatut}
                    onChange={(e) => setEditDevisStatut(e.target.value as StatutDevis)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-btp-orange"
                  >
                    <option value="BROUILLON">Brouillon</option>
                    <option value="EN_ATTENTE">En attente signature</option>
                    <option value="VALIDE">Validé / Accepté</option>
                    <option value="REFUSE">Refusé</option>
                    <option value="CONVERTI_CHANTIER">Converti en Chantier</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date Validité</label>
                  <input
                    type="date"
                    value={editDevisDateValidite}
                    onChange={(e) => setEditDevisDateValidite(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditDevisModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 font-bold rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-btp-orange hover:bg-btp-orange-dark text-white font-bold rounded-lg shadow-sm"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER DÉCOMPTE */}
      {editDecompteModalOpen && editingDecompte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Modifier le Décompte</h3>
                <p className="text-[11px] text-slate-300">{editingDecompte.numero}</p>
              </div>
              <button onClick={() => setEditDecompteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveDecompteEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Statut d'Encaissement *</label>
                <select
                  value={editDecStatut}
                  onChange={(e) => setEditDecStatut(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-btp-orange"
                >
                  <option value="EMIS">Émis (en attente visa)</option>
                  <option value="VALIDE">Validé par Maître d'Œuvre</option>
                  <option value="PAYE">Payé / Encaissé</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Avancement Cumulé (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={editDecPct}
                  onChange={(e) => setEditDecPct(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-btp-orange"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditDecompteModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 font-bold rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-btp-orange hover:bg-btp-orange-dark text-white font-bold rounded-lg shadow-sm"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ÉMETTRE UN DÉCOMPTE */}
      {decompteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Émettre un Décompte d'Avancement</h3>
              <button onClick={() => setDecompteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreerDecompte} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chantier Concerné *</label>
                <select
                  value={selChantierId}
                  onChange={(e) => setSelChantierId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                >
                  {store.chantiers.map(c => (
                    <option key={c.id} value={c.id}>{c.nom} ({c.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Avancement Physique Cumulé du Projet (%) *</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={decomptePct}
                    onChange={(e) => setDecomptePct(e.target.value)}
                    className="w-full px-3 py-1.5 pr-8 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-btp-orange"
                  />
                  <Percent className="w-4 h-4 text-slate-400 absolute right-3 top-2" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Le calcul de la situation précédente et de la retenue de garantie de 10% sera effectué automatiquement.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Début de Période</label>
                  <input
                    type="date"
                    value={periodeDebut}
                    onChange={(e) => setPeriodeDebut(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fin de Période</label>
                  <input
                    type="date"
                    value={periodeFin}
                    onChange={(e) => setPeriodeFin(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDecompteModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 font-bold rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-btp-orange hover:bg-btp-orange-dark text-white font-bold rounded-lg shadow-sm"
                >
                  Générer le Décompte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
