'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import { ArrowLeft, Check, Clock, Calendar, CheckCheck, Users, Building } from 'lucide-react';

export default function PointageExpressPage() {
  const [, setTick] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedChantierId, setSelectedChantierId] = useState(store.chantiers[0]?.id || '');

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const chantiers = store.chantiers;
  const ouvriers = store.ouvriers;
  const pointages = store.pointages;

  const currentChantier = chantiers.find(c => c.id === selectedChantierId);

  // Tout cocher présent en 1 clic
  const handleMarquerTousPresents = () => {
    ouvriers.forEach(ouv => {
      store.enregistrerPointage({
        ouvrierId: ouv.id,
        chantierId: selectedChantierId,
        datePointage: selectedDate,
        valeurPresence: 1,
        heuresSup: 0,
        valideParId: store.currentUser.id
      });
    });
  };

  // Calcul du total journalier imputé
  let totalPresenceJours = 0;
  let totalCoutJourMAD = 0;

  ouvriers.forEach(ouv => {
    const pt = pointages.find(p => p.ouvrierId === ouv.id && p.chantierId === selectedChantierId && p.datePointage === selectedDate);
    const val = pt ? pt.valeurPresence : 1; // default 1
    const hs = pt ? pt.heuresSup : 0;
    totalPresenceJours += val;
    totalCoutJourMAD += (val * ouv.tarifJourMAD) + (hs * (ouv.tarifJourMAD / 8) * 1.25);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/ouvriers"
            className="p-2 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Grille de Pointage Quotidien Express
              <span className="text-xs bg-btp-orange text-white font-semibold px-2 py-0.5 rounded-full uppercase">
                Terrain
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Saisie rapide des présences et imputation automatique du coût de la main-d'œuvre
            </p>
          </div>
        </div>

        <button
          onClick={handleMarquerTousPresents}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4" />
          Tout cocher Présent (1j)
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
            Date de Pointage
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-800"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
            Chantier d'Affectation
          </label>
          <select
            value={selectedChantierId}
            onChange={(e) => setSelectedChantierId(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-800"
          >
            {chantiers.map(c => (
              <option key={c.id} value={c.id}>{c.nom} ({c.ville})</option>
            ))}
          </select>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Effectif Pointé</span>
            <strong className="text-sm font-bold text-slate-900">{totalPresenceJours} journées</strong>
          </div>
          <Users className="w-5 h-5 text-slate-400" />
        </div>

        <div className="p-2.5 bg-orange-50 rounded-lg border border-orange-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-btp-orange block">Coût Journée Imputé</span>
            <strong className="text-sm font-black text-slate-900">{formatMAD(totalCoutJourMAD)}</strong>
          </div>
          <Clock className="w-5 h-5 text-btp-orange" />
        </div>
      </div>

      {/* Pointage Grid Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ouvrier & CIN</th>
                <th className="py-3 px-3">Spécialité</th>
                <th className="py-3 px-3 text-right">Tarif / Jour</th>
                <th className="py-3 px-4 text-center">Présence ({formatDateFR(selectedDate)})</th>
                <th className="py-3 px-3 text-center">Heures Sup</th>
                <th className="py-3 px-4 text-right font-bold text-slate-900">Total Imputé (MAD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ouvriers.map((ouv) => {
                const pt = pointages.find(p => p.ouvrierId === ouv.id && p.chantierId === selectedChantierId && p.datePointage === selectedDate);
                const currentVal = pt ? pt.valeurPresence : 1;
                const currentHS = pt ? pt.heuresSup : 0;
                const totalLigne = (currentVal * ouv.tarifJourMAD) + (currentHS * (ouv.tarifJourMAD / 8) * 1.25);

                return (
                  <tr key={ouv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{ouv.nom}</div>
                      <div className="text-[10px] text-slate-400 font-mono">CIN : {ouv.cin}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                        {ouv.specialite}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-slate-700">
                      {formatMAD(ouv.tarifJourMAD)}
                    </td>

                    {/* Boutons Pointage Rapide (1, 0.5, 0) */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 shadow-xs">
                        {[
                          { label: 'Présent (1j)', val: 1 },
                          { label: '½ Journée', val: 0.5 },
                          { label: 'Absent (0)', val: 0 }
                        ].map((btn) => (
                          <button
                            key={btn.label}
                            onClick={() => {
                              store.enregistrerPointage({
                                ouvrierId: ouv.id,
                                chantierId: selectedChantierId,
                                datePointage: selectedDate,
                                valeurPresence: btn.val,
                                heuresSup: currentHS,
                                valideParId: store.currentUser.id
                              });
                            }}
                            className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                              currentVal === btn.val
                                ? 'bg-btp-orange text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Heures Sup */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="8"
                          value={currentHS}
                          onChange={(e) => {
                            const hs = parseInt(e.target.value, 10) || 0;
                            store.enregistrerPointage({
                              ouvrierId: ouv.id,
                              chantierId: selectedChantierId,
                              datePointage: selectedDate,
                              valeurPresence: currentVal,
                              heuresSup: hs,
                              valideParId: store.currentUser.id
                            });
                          }}
                          className="w-14 px-2 py-1 text-center text-xs border border-slate-300 rounded font-bold"
                        />
                        <span className="text-slate-400 text-[10px]">h</span>
                      </div>
                    </td>

                    {/* Total Imputé */}
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      {formatMAD(totalLigne)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
