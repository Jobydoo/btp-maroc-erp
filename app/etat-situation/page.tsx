'use client';

import React, { useState, useEffect } from 'react';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import {
  CalendarDays,
  TrendingUp,
  CreditCard,
  Building,
  Printer,
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Percent,
  CheckCircle2
} from 'lucide-react';

export default function EtatSituationPage() {
  const [, setTick] = useState(0);
  const [dateDebut, setDateDebut] = useState('2026-01-01');
  const [dateFin, setDateFin] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const rapport = store.getEtatSituation(dateDebut, dateFin);
  const company = store.company;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-btp-orange" />
              État de Situation Comptable & Financier
            </h1>
            <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full uppercase">
              {company.raisonSociale.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chiffre d'affaires, achats fournisseurs, marges de chantier et déclaration de TVA marocaine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimer l'État
          </button>
        </div>
      </div>

      {/* Barre de Filtrage par Date */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-btp-orange" />
            Période d'analyse :
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Du :</span>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-btp-orange"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Au :</span>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-btp-orange"
            />
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Devise : <strong>MAD</strong> • Taux TVA standard : <strong>20%</strong>
        </div>
      </div>

      {/* 4 Indicateurs Clés de l'État */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Chiffre d'Affaires HT */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            C.A. Ventes Facturées (HT)
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-2">
            {formatMAD(rapport.chiffreAffairesHT)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            TTC : <strong className="text-slate-800">{formatMAD(rapport.chiffreAffairesTTC)}</strong>
          </div>
        </div>

        {/* Achats Fournisseurs HT */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Achats & Matériaux (HT)
          </span>
          <div className="text-xl font-extrabold text-slate-900 mt-2">
            {formatMAD(rapport.achatsFournisseursHT)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            TTC : <strong className="text-slate-800">{formatMAD(rapport.achatsFournisseursTTC)}</strong>
          </div>
        </div>

        {/* Marge Brute Globale */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Marge Brute Globale
          </span>
          <div className="text-xl font-extrabold text-emerald-600 mt-2">
            {formatMAD(rapport.margeBruteMAD)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Taux de marge : {rapport.margeBrutePct.toFixed(1)}%
          </div>
        </div>

        {/* TVA Nette Due */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            TVA Nette à Déclarer (20%)
          </span>
          <div className="text-xl font-extrabold text-btp-orange mt-2">
            {formatMAD(rapport.tvaNetteDue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            TVA Collectée ({formatMAD(rapport.tvaCollecteeVentes)}) - Déductible
          </div>
        </div>

      </div>

      {/* Déclaration & État de TVA Marocaine (Tableau Récapitulatif) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-btp-orange" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              État Récapitulatif de la Taxe sur la Valeur Ajoutée (TVA Maroc)
            </h2>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded font-mono">
            Régime de Débit / Encaissement
          </span>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Ligne Fiscale</th>
                <th className="p-3">Base Hors Taxes (MAD)</th>
                <th className="p-3 text-center">Taux TVA</th>
                <th className="p-3 text-right">Montant Taxe (MAD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-semibold text-slate-900">01. Opérations imposables au titre des Ventes & Travaux BTP</td>
                <td className="p-3 font-mono">{formatMAD(rapport.chiffreAffairesHT)}</td>
                <td className="p-3 text-center">20%</td>
                <td className="p-3 text-right font-mono font-bold text-slate-900">{formatMAD(rapport.tvaCollecteeVentes)}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">02. Déductions : TVA récupérable sur Achats de Matériaux et Sous-traitance</td>
                <td className="p-3 font-mono">{formatMAD(rapport.achatsFournisseursHT)}</td>
                <td className="p-3 text-center">20%</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-600">- {formatMAD(rapport.tvaDeductibleAchats)}</td>
              </tr>
            </tbody>
            <tfoot className="bg-orange-50 font-bold border-t-2 border-btp-orange">
              <tr>
                <td colSpan={3} className="p-3.5 text-right text-xs uppercase tracking-wider text-slate-900">
                  TVA NETTE DUE AU TRÉSOR PUBLIC DU MAROC (01 - 02) :
                </td>
                <td className="p-3.5 text-right font-mono text-sm text-btp-orange">
                  {formatMAD(rapport.tvaNetteDue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Analyse de Rentabilité par Chantier */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Rentabilité et Marge par Chantier BTP
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {rapport.chantiersPerformance.length} chantiers analysés
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Chantier / Projet</th>
                <th className="p-3 text-center">Avancement</th>
                <th className="p-3 text-right">Budget Prévu HT</th>
                <th className="p-3 text-right">Facturé HT</th>
                <th className="p-3 text-right">Coût Réel Consommé</th>
                <th className="p-3 text-right">Marge Dégagée (MAD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rapport.chantiersPerformance.map((item) => (
                <tr key={item.chantierId} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-600">{item.code}</td>
                  <td className="p-3 font-semibold text-slate-900">{item.nom}</td>
                  <td className="p-3 text-center">
                    <span className="font-bold text-emerald-600">{item.avancementPct}%</span>
                  </td>
                  <td className="p-3 text-right font-mono">{formatMAD(item.budgetMAD)}</td>
                  <td className="p-3 text-right font-mono font-bold text-blue-600">{formatMAD(item.factureMAD)}</td>
                  <td className="p-3 text-right font-mono text-slate-700">{formatMAD(item.coutReelMAD)}</td>
                  <td className={`p-3 text-right font-mono font-bold ${item.margeMAD >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatMAD(item.margeMAD)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Soldes & Recouvrement (Encours) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-900 uppercase">Encours Client Total à Recouvrer</span>
            <span className="text-sm font-extrabold text-amber-700">{formatMAD(rapport.soldeClientsARecouvrer)}</span>
          </div>
          <p className="text-[11px] text-amber-800">
            Somme des factures de vente et décomptes émis restant impayés. Consulter le module Trésorerie pour le lettrage.
          </p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-900 uppercase">Encours Fournisseur Total à Décaisser</span>
            <span className="text-sm font-extrabold text-blue-700">{formatMAD(rapport.soldeFournisseursADecaisser)}</span>
          </div>
          <p className="text-[11px] text-blue-800">
            Dettes fournisseurs sur factures d'achat et livraisons de matériaux à échéance.
          </p>
        </div>
      </div>

    </div>
  );
}
