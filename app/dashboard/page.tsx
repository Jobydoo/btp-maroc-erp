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
  Users,
  UserCheck,
  Briefcase,
  Receipt,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const chantiers = store.chantiersActifs;
  const articlesAlerte = store.articlesActifs.filter(a => a.stockActuel <= a.stockMinimum);
  const facturesVente = store.facturesVenteActives;
  const devisRecents = store.devisActifs;
  const clients = store.clientsActifs;
  const fournisseurs = store.fournisseursActifs;

  const caTotal = store.chiffreAffairesTotal;
  const encoursClient = store.encoursClientARecouvrer;
  const devisEnCours = store.devisEnCoursTotal;

  // Factures impayées
  const facturesImpayees = facturesVente.filter(f => f.statut === 'VALIDEE' || f.statut === 'PARTIELLEMENT_PAYEE');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Quick Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Tableau de Bord Commercial & Chantiers
            </h1>
            <span className="text-xs bg-btp-orange text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {store.company.raisonSociale.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pilotage financier unifié Sage 100 BTP : Chantiers, Ventes, Achats, Stocks et Recouvrement
          </p>
        </div>

        {/* 4 Raccourcis Rapides Demandés */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-all shadow-2xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            Clients
          </Link>

          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-all shadow-2xs"
          >
            <Boxes className="w-3.5 h-3.5 text-slate-600" />
            Catalogue Articles
          </Link>

          <Link
            href="/ventes/devis?action=nouveau"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            Créer un Devis
          </Link>

          <Link
            href="/ventes/factures?action=nouveau"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-btp-orange hover:bg-orange-600 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            <Receipt className="w-3.5 h-3.5" />
            Créer une Facture
          </Link>
        </div>
      </div>

      {/* BANDEAU ROUGE D'ALERTE STOCK (Articles sous le seuil minimum avec bouton 'Voir le stock') */}
      {articlesAlerte.length > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                Alerte Réapprovisionnement Stock : {articlesAlerte.length} matériau(x) sous le seuil d'alerte critique !
              </h2>
              <p className="text-xs text-rose-700 mt-0.5">
                {articlesAlerte.map(a => `${a.designation} (${a.stockActuel} ${a.unite} restants / min ${a.stockMinimum})`).slice(0, 3).join(' • ')}
              </p>
            </div>
          </div>
          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow-xs transition-colors self-start sm:self-auto"
          >
            Voir le stock <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 4 KPIS EN TEMPS RÉEL DEMANDÉS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 : Chiffre d'Affaires */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Chiffre d'Affaires
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formatMAD(caTotal)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span className="text-emerald-600 font-bold">Ventes facturées</span> (TTC en Dirham)
            </div>
          </div>
        </div>

        {/* KPI 2 : Encours Client à Recouvrer */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Encours Client à Recouvrer
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-amber-600 tracking-tight">
              {formatMAD(encoursClient)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span className="font-bold text-amber-600">{facturesImpayees.length}</span> facture(s) en attente
            </div>
          </div>
        </div>

        {/* KPI 3 : Devis en cours */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Devis en Cours
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-blue-600 tracking-tight">
              {formatMAD(devisEnCours)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span className="font-bold text-blue-600">{devisRecents.filter(d => d.statut === 'EN_ATTENTE' || d.statut === 'VALIDE').length}</span> devis DQE actifs
            </div>
          </div>
        </div>

        {/* KPI 4 : Clients & Fournisseurs */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Clients & Fournisseurs
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-2">
              <span>{clients.length + fournisseurs.length}</span>
              <span className="text-xs font-normal text-slate-500">partenaires</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
              <span className="font-bold text-blue-600">{clients.length} Clients</span> • <span className="font-bold text-purple-600">{fournisseurs.length} Fournisseurs</span>
            </div>
          </div>
        </div>

      </div>

      {/* Graphique Comparatif : Budget Prévu vs Coût Réel par Chantier */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-btp-orange" />
              Comparatif : Budget Prévu vs Coût Réel par Chantier
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consommation budgétaire (Matériaux, Main-d'œuvre, Engins) et maîtrise des marges
            </p>
          </div>
          <Link
            href="/chantiers"
            className="text-xs font-bold text-btp-orange hover:underline flex items-center gap-1"
          >
            Tous les chantiers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-4">
          {chantiers.map((ch) => {
            const pctConsomme = Math.min(100, Math.round((ch.coutReelTotalMAD / ch.budgetTotalMAD) * 100));
            const isDepassement = ch.coutReelTotalMAD > ch.budgetTotalMAD;
            const margeRestante = ch.budgetTotalMAD - ch.coutReelTotalMAD;

            return (
              <div key={ch.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {ch.code}
                      </span>
                      <Link href={`/chantiers/${ch.id}`} className="font-bold text-sm text-slate-900 hover:text-btp-orange transition-colors">
                        {ch.nom}
                      </Link>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Client : <strong>{ch.maitreOuvrage}</strong> • Ville : {ch.ville} • Avancement physique : <strong className="text-emerald-600">{ch.avancementGlobalPct}%</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      Coût Réel : {formatMAD(ch.coutReelTotalMAD)} / {formatMAD(ch.budgetTotalMAD)}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                      Marge brute prévisionnelle : <strong className={margeRestante >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{formatMAD(margeRestante)}</strong>
                    </div>
                  </div>
                </div>

                {/* Progress bars combinées */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden flex">
                    <div
                      className={`h-full transition-all ${isDepassement ? 'bg-rose-500' : 'bg-btp-orange'}`}
                      style={{ width: `${pctConsomme}%` }}
                      title={`Budget consommé : ${pctConsomme}%`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>Budget consommé : {pctConsomme}%</span>
                    <span>Avancement travaux : {ch.avancementGlobalPct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2 Colonnes : Factures Vente Récentes & Devis Récents avec badges de statut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Liste des Factures Vente Récentes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              Factures Vente & Décomptes Récents
            </h2>
            <Link href="/ventes/factures" className="text-xs font-bold text-btp-orange hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {facturesVente.slice(0, 5).map((fac) => {
              const badgeClass = 
                fac.statut === 'PAYEE'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : fac.statut === 'PARTIELLEMENT_PAYEE'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-blue-100 text-blue-800 border-blue-200';

              const badgeLabel =
                fac.statut === 'PAYEE'
                  ? 'Payée'
                  : fac.statut === 'PARTIELLEMENT_PAYEE'
                  ? 'Partiellement payée'
                  : 'En attente';

              return (
                <div key={fac.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{fac.numeroFacture}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                        {badgeLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate mt-0.5">{fac.clientNom}</p>
                    <p className="text-[11px] text-slate-400">Échéance : {formatDateFR(fac.dateEcheance)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-extrabold text-slate-900">{formatMAD(fac.totalTTC)}</p>
                    {fac.soldeDu > 0 && (
                      <p className="text-[11px] text-amber-600 font-bold">Reste : {formatMAD(fac.soldeDu)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Liste des Devis Récents */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-btp-orange" />
              Devis Récents (DQE BTP)
            </h2>
            <Link href="/ventes/devis" className="text-xs font-bold text-btp-orange hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {devisRecents.slice(0, 5).map((dev) => {
              const badgeClass =
                dev.statut === 'VALIDE' || dev.statut === 'CONVERTI_CHANTIER' || dev.statut === 'CONVERTI_COMMANDE'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : dev.statut === 'EN_ATTENTE'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-slate-100 text-slate-800 border-slate-200';

              const badgeLabel =
                dev.statut === 'VALIDE' || dev.statut === 'CONVERTI_CHANTIER' || dev.statut === 'CONVERTI_COMMANDE'
                  ? 'Accepté'
                  : dev.statut === 'EN_ATTENTE'
                  ? 'En attente'
                  : 'Brouillon';

              return (
                <div key={dev.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{dev.reference}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                        {badgeLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate mt-0.5">{dev.clientNom}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{dev.objet}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-extrabold text-slate-900">{formatMAD(dev.totalTTC)}</p>
                    <p className="text-[11px] text-slate-400">{dev.items?.length || 0} postes DQE</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
