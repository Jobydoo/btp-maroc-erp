'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import {
  TrendingUp,
  Building,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Boxes,
  Users
} from 'lucide-react';

export default function DashboardPage() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const kpis = store.getExecutiveKPIs();
  const chantiers = store.chantiers;
  const materiauxAlerte = store.materiaux.filter(m => m.stockActuel <= m.stockMinimum);
  const decomptesImpayes = store.decomptes.filter(d => d.statut === 'EMIS' || d.statut === 'VALIDE');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Tableau de Bord Exécutif
            <span className="text-xs bg-btp-orange text-white font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
              BTP Maroc
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Indicateurs financiers en Dirham (MAD), avancement des lots et pilotage des chantiers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/chantiers?nouveau=true"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-btp-orange hover:bg-btp-orange-dark text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Nouveau Chantier
          </Link>

          <Link
            href="/devis/nouveau"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            Nouveau Devis DQE
          </Link>

          <Link
            href="/ouvriers/pointage"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-all"
          >
            <Users className="w-4 h-4 text-btp-orange" />
            Pointage Express
          </Link>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: CA Engagé */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              CA Engagé (Chantiers)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formatMAD(kpis.caEngage)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span className="font-bold text-blue-600">{chantiers.length}</span> chantiers sous contrat
            </div>
          </div>
        </div>

        {/* KPI 2: Dépenses Mois */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Dépenses du Mois (HT)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formatMAD(kpis.depensesMois || 232250)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-700 mt-1">
              <span>Matériaux, MO & Location Engins</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Marge Nette Globale */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Marge Nette Prévisionnelle
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-emerald-600 tracking-tight">
              {formatMAD(kpis.margeNetteMAD)}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] mt-1">
              <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded text-[10px]">
                {kpis.margeNettePct} %
              </span>
              <span className="text-slate-500">marge brute consolidée</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Chantiers Actifs & Alertes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Chantiers Actifs
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-btp-orange flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              {kpis.chantiersActifs}
              <span className="text-xs font-medium text-slate-400">sur {chantiers.length}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] mt-1">
              {kpis.alertesStock > 0 ? (
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {kpis.alertesStock} rupture(s) stock
                </span>
              ) : (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Stocks approvisionnés
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Comparative Section: Budget vs Coût Réel par Chantier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Comparatif Graphique & Avancement */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-btp-orange" />
                Budget Prévu vs Coût Réel par Chantier
              </h2>
              <p className="text-xs text-slate-500">
                Comparaison financière et suivi de la consommation budgétaire en direct
              </p>
            </div>
            <Link
              href="/chantiers"
              className="text-xs text-btp-orange hover:text-btp-orange-dark font-bold flex items-center gap-1"
            >
              Voir tous <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="mt-5 space-y-6">
            {chantiers.map((ch) => {
              const ratio = ch.budgetTotalMAD > 0 ? Math.round((ch.coutReelTotalMAD / ch.budgetTotalMAD) * 100) : 0;
              const isOver = ch.coutReelTotalMAD > ch.budgetTotalMAD;

              return (
                <div key={ch.id} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/chantiers/${ch.id}`}
                          className="font-bold text-sm text-slate-900 hover:text-btp-orange transition-colors"
                        >
                          {ch.nom}
                        </Link>
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded">
                          {ch.ville}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Client : {ch.maitreOuvrage}  •  Code : {ch.code}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">
                        {formatMAD(ch.coutReelTotalMAD)} <span className="font-normal text-slate-400">/ {formatMAD(ch.budgetTotalMAD)}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        isOver ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {ratio}% consommé
                      </span>
                    </div>
                  </div>

                  {/* Dual Progress Bars: Coût Consommé vs Avancement Réalisé */}
                  <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-200/60">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>Avancement physique des travaux :</span>
                      <strong className="text-btp-orange font-bold">{ch.avancementGlobalPct} %</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-btp-orange h-full rounded-full transition-all duration-500"
                        style={{ width: `${ch.avancementGlobalPct}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                      <span>Consommation financière du budget :</span>
                      <strong className={isOver ? 'text-rose-600 font-bold' : 'text-slate-700'}>{ratio} %</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-500' : 'bg-slate-800'}`}
                        style={{ width: `${Math.min(100, ratio)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Bloc Alertes BTP Maroc */}
        <div className="space-y-6">
          
          {/* Alertes Matériaux & Stocks */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Alertes de Stock Minimum
              </h3>
              <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                {materiauxAlerte.length} critique(s)
              </span>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {materiauxAlerte.length > 0 ? (
                materiauxAlerte.map(mat => (
                  <div key={mat.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{mat.designation}</p>
                      <p className="text-[11px] text-slate-500">
                        Reste : <strong className="text-rose-600">{mat.stockActuel} {mat.unite}</strong> (Min : {mat.stockMinimum})
                      </p>
                    </div>
                    <Link
                      href="/materiaux"
                      className="text-[11px] font-bold text-btp-orange hover:underline px-2 py-1 bg-orange-50 rounded"
                    >
                      Commander
                    </Link>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  Tous les stocks sont au-dessus du seuil minimum.
                </div>
              )}
            </div>
          </div>

          {/* Décomptes & Factures Clients en Attente */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-500" />
                Décomptes en Attente de Paiement
              </h3>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {decomptesImpayes.length} situation(s)
              </span>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {decomptesImpayes.length > 0 ? (
                decomptesImpayes.map(dec => {
                  const ch = chantiers.find(c => c.id === dec.chantierId);
                  return (
                    <div key={dec.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-900">{dec.numero}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[170px]">
                          {ch?.nom || 'Chantier'} ({dec.pourcentageCumule}% avancement)
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{formatMAD(dec.montantTTC)}</div>
                        <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.2 rounded">
                          {dec.statut}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  Aucun décompte impayé en souffrance.
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Total en attente TTC :</span>
              <strong className="text-slate-900 font-bold">{formatMAD(kpis.montantImpayeMAD)}</strong>
            </div>
          </div>

          {/* Mentions Légales & Fiscale Entreprise */}
          <div className="p-4 bg-slate-900 rounded-xl text-white text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-btp-orange text-[11px] uppercase tracking-wider">
                Cadre Réglementaire BTP Maroc
              </span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                TVA 20%
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Retenue de garantie légale fixée à <strong>10%</strong> sur toutes les situations d’avancement. Devis et décomptes conformes aux exigences de l'ICE, IF, RC et CNSS.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
