'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import { Devis, DevisItem } from '@/lib/types';
import { genererPDFDevis } from '@/lib/pdf-generator';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Edit,
  Copy,
  Trash2,
  Download,
  Building,
  ArrowRight,
  CheckCircle2,
  X,
  FileCheck,
  Building2,
  Clock,
  Layers
} from 'lucide-react';

export default function VentesDevisPage() {
  const [, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatut, setSelectedStatut] = useState<string>('TOUS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevis, setEditingDevis] = useState<Devis | null>(null);

  // Form states
  const [clientNom, setClientNom] = useState('');
  const [clientIce, setClientIce] = useState('');
  const [clientVille, setClientVille] = useState('Casablanca');
  const [clientTel, setClientTel] = useState('');
  const [clientAdresse, setClientAdresse] = useState('');
  const [objet, setObjet] = useState('');
  const [dateDevis, setDateDevis] = useState(new Date().toISOString().split('T')[0]);
  const [dateValidite, setDateValidite] = useState(new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [delaiExecution, setDelaiExecution] = useState('4 mois');
  const [conditionsPaiement, setConditionsPaiement] = useState('Avance 20%, situations mensuelles, retenue 10%');
  const [items, setItems] = useState<Omit<DevisItem, 'id' | 'devisId'>[]>([
    { lotNom: '01. Gros Œuvre', designation: 'Béton armé dosé 350 kg/m³ pour semelles et poteaux', unite: 'm³', quantite: 80, prixUnitaireHT: 1450, totalHT: 116000 },
    { lotNom: '02. Ferraillage', designation: 'Aciers haute adhérence Sonasid FeE500 façonné et posé', unite: 'kg', quantite: 8500, prixUnitaireHT: 14.50, totalHT: 123250 }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const devisList = store.devisActifs.filter(d => {
    const matchSearch = d.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.objet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = selectedStatut === 'TOUS' || d.statut === selectedStatut;
    return matchSearch && matchStatut;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingDevis(null);
    const client = store.clientsActifs[0];
    setClientNom(client?.nom || 'Groupe Al Omrane');
    setClientIce(client?.ice || '001894562000078');
    setClientVille(client?.ville || 'Casablanca');
    setClientTel(client?.telephone || '+212 5 22 00 00 00');
    setClientAdresse(client?.adresse || 'Centre Ville');
    setObjet('Construction Bâtiment R+2 & VRD');
    setDateDevis(new Date().toISOString().split('T')[0]);
    setDateValidite(new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setDelaiExecution('4 mois');
    setConditionsPaiement('Avance 20%, situations mensuelles, 10% retenue de garantie');
    setItems([
      { lotNom: '01. Gros Œuvre', designation: 'Béton armé dosé 350 kg/m³ pour semelles et poteaux', unite: 'm³', quantite: 80, prixUnitaireHT: 1450, totalHT: 116000 },
      { lotNom: '02. Ferraillage', designation: 'Aciers haute adhérence Sonasid FeE500 façonné et posé', unite: 'kg', quantite: 8500, prixUnitaireHT: 14.50, totalHT: 123250 }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: Devis) => {
    setEditingDevis(d);
    setClientNom(d.clientNom);
    setClientIce(d.clientIce);
    setClientVille(d.clientVille);
    setClientTel(d.clientTel);
    setClientAdresse(d.clientAdresse);
    setObjet(d.objet);
    setDateDevis(d.dateDevis);
    setDateValidite(d.dateValidite);
    setDelaiExecution(d.delaiExecution);
    setConditionsPaiement(d.conditionsPaiement);
    setItems(d.items.map(it => ({
      lotNom: it.lotNom,
      designation: it.designation,
      unite: it.unite,
      quantite: it.quantite,
      prixUnitaireHT: it.prixUnitaireHT,
      totalHT: it.totalHT
    })));
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setItems([...items, { lotNom: '03. Maçonnerie', designation: 'Double cloison en briques creuses', unite: 'm²', quantite: 100, prixUnitaireHT: 220, totalHT: 22000 }]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = value;
    if (field === 'quantite' || field === 'prixUnitaireHT') {
      const q = field === 'quantite' ? Number(value) : updated[idx].quantite;
      const pu = field === 'prixUnitaireHT' ? Number(value) : updated[idx].prixUnitaireHT;
      updated[idx].totalHT = q * pu;
    }
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objet.trim() || items.length === 0) return;

    const totalHT = items.reduce((s, it) => s + it.totalHT, 0);

    if (editingDevis) {
      store.updateDevis(editingDevis.id, {
        clientNom,
        clientIce,
        clientVille,
        clientTel,
        clientAdresse,
        objet,
        dateDevis,
        dateValidite,
        delaiExecution,
        conditionsPaiement,
        items: items.map((it, i) => ({
          ...it,
          id: 'di-' + Date.now() + i,
          devisId: editingDevis.id
        })),
        totalHT,
        tauxTva: 20
      });
      showToast(`Devis ${editingDevis.reference} mis à jour.`);
    } else {
      const newDev = store.addDevis({
        clientNom,
        clientIce,
        clientVille,
        clientTel,
        clientAdresse,
        objet,
        dateDevis,
        dateValidite,
        delaiExecution,
        conditionsPaiement,
        statut: 'EN_ATTENTE',
        totalHT,
        tauxTva: 20,
        items: items.map((it, i) => ({
          ...it,
          id: 'di-' + Date.now() + i,
          devisId: ''
        }))
      });
      showToast(`Devis ${newDev.reference} créé avec succès.`);
    }

    setIsModalOpen(false);
  };

  const handleTransformerEnCommande = (devisId: string) => {
    try {
      const cmd = store.convertirDevisEnCommande(devisId);
      showToast(`Devis transformé en Commande Client : ${cmd.reference}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTransformerEnChantier = (devisId: string) => {
    try {
      const ch = store.convertirDevisEnChantier(devisId);
      showToast(`Devis transformé en Chantier Actif : ${ch.code} — ${ch.nom}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleExportPDF = (d: Devis) => {
    genererPDFDevis(d, store.company);
    showToast(`PDF du devis ${d.reference} généré.`);
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
              <FileSpreadsheet className="w-6 h-6 text-btp-orange" />
              Devis Quantitatifs Estimatifs (DQE BTP)
            </h1>
            <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full uppercase">
              {store.company.raisonSociale.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chiffrage structuré par lots (Terrassement, Béton armé, Maçonnerie), conversion en commande ou chantier en 1 clic
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-btp-orange hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nouveau Devis DQE
        </button>
      </div>

      {/* Filtres & Recherche */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par référence (DEV-2026-...), client ou objet du marché..."
            className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <select
          value={selectedStatut}
          onChange={(e) => setSelectedStatut(e.target.value)}
          className="text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none text-slate-800 font-medium"
        >
          <option value="TOUS">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente de validation</option>
          <option value="VALIDE">Validé / Accepté</option>
          <option value="CONVERTI_COMMANDE">Converti en Commande</option>
          <option value="CONVERTI_CHANTIER">Converti en Chantier</option>
          <option value="BROUILLON">Brouillon</option>
        </select>
      </div>

      {/* Liste des Devis DQE */}
      <div className="space-y-4">
        {devisList.map((d) => {
          const isValide = d.statut === 'VALIDE';
          const isConverti = d.statut === 'CONVERTI_COMMANDE' || d.statut === 'CONVERTI_CHANTIER';

          return (
            <div key={d.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                      {d.reference}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isValide || isConverti
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : d.statut === 'EN_ATTENTE'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}>
                      {d.statut}
                    </span>
                    <span className="text-xs text-slate-400">• Émis le {formatDateFR(d.dateDevis)}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{d.objet}</h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Client : <strong>{d.clientNom}</strong> • ICE : {d.clientIce || 'N/A'} • Ville : {d.clientVille}
                  </p>
                </div>

                <div className="flex flex-col lg:items-end justify-between gap-3">
                  <div className="text-left lg:text-right">
                    <div className="text-lg font-extrabold text-slate-900">{formatMAD(d.totalTTC)}</div>
                    <div className="text-xs text-slate-500 font-medium">
                      HT : {formatMAD(d.totalHT)} • TVA 20% : {formatMAD(d.montantTva)}
                    </div>
                  </div>

                  {/* Actions 1-clic */}
                  <div className="flex flex-wrap items-center gap-2">
                    {d.statut !== 'CONVERTI_COMMANDE' && (
                      <button
                        onClick={() => handleTransformerEnCommande(d.id)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                        title="Créer une commande client"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        → Commande
                      </button>
                    )}

                    {d.statut !== 'CONVERTI_CHANTIER' && (
                      <button
                        onClick={() => handleTransformerEnChantier(d.id)}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-btp-orange font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                        title="Créer directement le chantier avec ses lots DQE"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        → Chantier
                      </button>
                    )}

                    <button
                      onClick={() => handleExportPDF(d)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-2xs"
                      title="Télécharger PDF aux normes marocaines"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>

                    <div className="h-4 w-px bg-slate-200 mx-1" />

                    <button
                      onClick={() => handleOpenEdit(d)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        store.duplicateDevis(d.id);
                        showToast(`Devis ${d.reference} dupliqué.`);
                      }}
                      className="p-1.5 text-slate-400 hover:text-btp-orange hover:bg-orange-50 rounded-lg transition-colors"
                      title="Dupliquer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Supprimer le devis ${d.reference} ?`)) {
                          store.deleteDevis(d.id);
                          showToast(`Devis ${d.reference} supprimé.`);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Aperçu des Postes DQE */}
              {d.items && d.items.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    Postes du DQE ({d.items.length}) :
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {d.items.slice(0, 3).map((it, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
                        <p className="font-semibold text-slate-900 truncate">{it.designation}</p>
                        <p className="text-slate-500 mt-0.5">
                          {it.quantite} {it.unite} × {formatMAD(it.prixUnitaireHT)} = <strong className="text-slate-800">{formatMAD(it.totalHT)}</strong>
                        </p>
                      </div>
                    ))}
                    {d.items.length > 3 && (
                      <div className="p-2 bg-slate-50/60 rounded-lg border border-dashed border-slate-200 text-[11px] text-slate-500 flex items-center justify-center">
                        + {d.items.length - 3} autre(s) prestation(s)
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Créer / Modifier Devis DQE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-btp-orange" />
                {editingDevis ? `Modifier le Devis ${editingDevis.reference}` : 'Nouveau Devis Quantitatif Estimatif (DQE)'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Client / Maître d'Ouvrage *</label>
                  <input
                    type="text"
                    value={clientNom}
                    onChange={(e) => setClientNom(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ICE Client</label>
                  <input
                    type="text"
                    value={clientIce}
                    onChange={(e) => setClientIce(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Objet du Marché / Travaux *</label>
                <input
                  type="text"
                  value={objet}
                  onChange={(e) => setObjet(e.target.value)}
                  required
                  placeholder="Ex: Construction Villa R+1, Travaux de Dallage Quartzé..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date d'émission</label>
                  <input
                    type="date"
                    value={dateDevis}
                    onChange={(e) => setDateDevis(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date validité</label>
                  <input
                    type="date"
                    value={dateValidite}
                    onChange={(e) => setDateValidite(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Délai d'exécution</label>
                  <input
                    type="text"
                    value={delaiExecution}
                    onChange={(e) => setDelaiExecution(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
              </div>

              {/* Postes DQE */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Lignes du Devis DQE par Lots :
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Ajouter une prestation
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-slate-200">
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={it.lotNom || ''}
                          onChange={(e) => handleItemChange(idx, 'lotNom', e.target.value)}
                          placeholder="Lot..."
                          className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-[11px]"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={it.designation}
                          onChange={(e) => handleItemChange(idx, 'designation', e.target.value)}
                          placeholder="Désignation travaux..."
                          required
                          className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-[11px]"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="text"
                          value={it.unite}
                          onChange={(e) => handleItemChange(idx, 'unite', e.target.value)}
                          className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-[11px] text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={it.quantite}
                          onChange={(e) => handleItemChange(idx, 'quantite', Number(e.target.value))}
                          className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-[11px] text-right font-mono"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          value={it.prixUnitaireHT}
                          onChange={(e) => handleItemChange(idx, 'prixUnitaireHT', Number(e.target.value))}
                          className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-[11px] text-right font-mono"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-700">
                  Total HT calculé : <strong>{formatMAD(items.reduce((s, it) => s + it.totalHT, 0))}</strong>
                  <span className="text-slate-400 ml-2">(+20% TVA)</span>
                </div>
                <div className="flex items-center gap-2">
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
                    {editingDevis ? 'Mettre à jour le devis' : 'Valider le devis'}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
