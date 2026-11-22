'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import { Ouvrier, SpecialiteOuvrier } from '@/lib/types';
import {
  Users,
  PlusCircle,
  Clock,
  Banknote,
  Phone,
  Shield,
  CreditCard,
  UserCheck,
  Search,
  CheckCircle2,
  X
} from 'lucide-react';

export default function OuvriersPage() {
  const [, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [specFilter, setSpecFilter] = useState<string>('TOUTES');

  // Modals
  const [ouvModalOpen, setOuvModalOpen] = useState(false);
  const [acompteModalOpen, setAcompteModalOpen] = useState(false);

  // New Ouvrier Form
  const [nom, setNom] = useState('');
  const [cin, setCin] = useState('');
  const [tel, setTel] = useState('');
  const [spec, setSpec] = useState<SpecialiteOuvrier>('MACON');
  const [tarifJour, setTarifJour] = useState('280');

  // New Acompte Form
  const [selOuvrierId, setSelOuvrierId] = useState('');
  const [acompteMontant, setAcompteMontant] = useState('500');
  const [selChantierId, setSelChantierId] = useState(store.chantiers[0]?.id || '');

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const ouvriers = store.ouvriers;
  const pointages = store.pointages;
  const acomptes = store.acomptes;

  const filteredOuvriers = ouvriers.filter(o => {
    const matchSearch = o.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSpec = specFilter === 'TOUTES' || o.specialite === specFilter;
    return matchSearch && matchSpec;
  });

  const handleCreateOuvrier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !cin) return;

    store.ouvriers.push({
      id: 'ouv-' + Date.now(),
      matricule: `MAT-01${store.ouvriers.length + 1}`,
      nom,
      cin,
      telephone: tel,
      specialite: spec,
      tarifJourMAD: parseFloat(tarifJour) || 200,
      statutActif: true,
      dateEmbauche: new Date().toISOString().split('T')[0]
    });

    setOuvModalOpen(false);
    setNom('');
    setCin('');
    setTel('');
  };

  const handleCreateAcompte = (e: React.FormEvent) => {
    e.preventDefault();
    const ouvId = selOuvrierId || ouvriers[0]?.id;
    if (!ouvId) return;

    store.enregistrerAcompte({
      ouvrierId: ouvId,
      chantierId: selChantierId,
      date: new Date().toISOString().split('T')[0],
      montantMAD: parseFloat(acompteMontant) || 200,
      type: 'ACOMPTE_ESPECES',
      periodeDebut: '2026-03-01',
      periodeFin: '2026-03-15'
    });

    setAcompteModalOpen(false);
  };

  // Helper calcul paie mensuelle estimée
  const getPaieEstimee = (ouvrierId: string, tarifJour: number) => {
    const workerPoints = pointages.filter(p => p.ouvrierId === ouvrierId);
    const totalJours = workerPoints.reduce((s, p) => s + p.valeurPresence, 0) || 18; // base 18j
    const totalHS = workerPoints.reduce((s, p) => s + p.heuresSup, 0) || 4;
    const brut = (totalJours * tarifJour) + (totalHS * (tarifJour / 8) * 1.25);
    const totalAcomptes = acomptes.filter(a => a.ouvrierId === ouvrierId).reduce((s, a) => s + a.montantMAD, 0);
    const net = Math.max(0, brut - totalAcomptes);

    return { totalJours, brut, totalAcomptes, net };
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Main-d'Œuvre & Registre des Ouvriers
            <span className="text-xs bg-slate-200 text-slate-800 font-semibold px-2 py-0.5 rounded-full">
              {ouvriers.length} ouvriers
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fiches d'identité CIN, spécialités, tarifs journaliers et calcul automatique des acomptes et paies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/ouvriers/pointage"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <Clock className="w-4 h-4 text-btp-orange" />
            Grille de Pointage Express
          </Link>

          <button
            onClick={() => setAcompteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-all"
          >
            <Banknote className="w-4 h-4 text-emerald-600" />
            Verser un Acompte
          </button>

          <button
            onClick={() => setOuvModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-btp-orange hover:bg-btp-orange-dark text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Nouvel Ouvrier
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom d'ouvrier ou numéro CIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
          />
        </div>

        <select
          value={specFilter}
          onChange={(e) => setSpecFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
        >
          <option value="TOUTES">Toutes les spécialités</option>
          <option value="MACON">Maçon qualifié</option>
          <option value="FERRAILLEUR">Ferrailleur</option>
          <option value="BOISEUR">Boiseur / Coffreur</option>
          <option value="MANOEUVRE">Manœuvre</option>
          <option value="CHEF_EQUIPE">Chef d'équipe</option>
          <option value="ELECTRICIEN">Électricien</option>
          <option value="PLOMBIER">Plombier</option>
          <option value="PEINTRE">Peintre / Finition</option>
        </select>
      </div>

      {/* Table des Ouvriers */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Matricule & Nom</th>
                <th className="py-3 px-3">N° CIN Maroc</th>
                <th className="py-3 px-3">Spécialité</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3 text-right">Tarif / Jour</th>
                <th className="py-3 px-3 text-center">Jours Pointés</th>
                <th className="py-3 px-3 text-right">Acomptes Perçus</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">Net Estimé Quinzaine</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOuvriers.map((ouv) => {
                const paie = getPaieEstimee(ouv.id, ouv.tarifJourMAD);

                return (
                  <tr key={ouv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{ouv.nom}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{ouv.matricule}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">{ouv.cin}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                        {ouv.specialite}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{ouv.telephone}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">{formatMAD(ouv.tarifJourMAD)}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">{paie.totalJours} j</td>
                    <td className="py-3 px-3 text-right text-rose-600 font-medium">
                      {paie.totalAcomptes > 0 ? `- ${formatMAD(paie.totalAcomptes)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-emerald-600">
                      {formatMAD(paie.net)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NOUVEL OUVRIER */}
      {ouvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Ajouter un Nouvel Ouvrier</h3>
              <button onClick={() => setOuvModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOuvrier} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom & Prénom *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Hicham Naciri"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">N° CIN (Carte Nationale) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: BH654321"
                    value={cin}
                    onChange={(e) => setCin(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    placeholder="+212 6 XX XX XX XX"
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Spécialité BTP</label>
                  <select
                    value={spec}
                    onChange={(e) => setSpec(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  >
                    <option value="MACON">Maçon qualifié</option>
                    <option value="FERRAILLEUR">Ferrailleur</option>
                    <option value="BOISEUR">Boiseur / Coffreur</option>
                    <option value="MANOEUVRE">Manœuvre</option>
                    <option value="CHEF_EQUIPE">Chef d'équipe</option>
                    <option value="ELECTRICIEN">Électricien</option>
                    <option value="PLOMBIER">Plombier</option>
                    <option value="PEINTRE">Peintre</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarif Journalier (MAD) *</label>
                  <input
                    type="number"
                    step="10"
                    required
                    value={tarifJour}
                    onChange={(e) => setTarifJour(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOuvModalOpen(false)}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-btp-orange hover:bg-btp-orange-dark rounded-lg"
                >
                  Enregistrer l'Ouvrier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VERSER UN ACOMPTE */}
      {acompteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Enregistrer un Acompte sur Salaire</h3>
              <button onClick={() => setAcompteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAcompte} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ouvrier Bénéficiaire *</label>
                <select
                  value={selOuvrierId}
                  onChange={(e) => setSelOuvrierId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                >
                  {ouvriers.map(o => (
                    <option key={o.id} value={o.id}>{o.nom} (CIN: {o.cin} - {o.specialite})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Montant Acompte (MAD) *</label>
                  <input
                    type="number"
                    step="50"
                    required
                    value={acompteMontant}
                    onChange={(e) => setAcompteMontant(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chantier d'Imputation</label>
                  <select
                    value={selChantierId}
                    onChange={(e) => setSelChantierId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  >
                    {store.chantiers.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 text-[11px]">
                L'acompte sera automatiquement déduit du décompte de paie final de fin de quinzaine.
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAcompteModalOpen(false)}
                  className="px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-btp-orange hover:bg-btp-orange-dark rounded-lg"
                >
                  Valider le Versement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
