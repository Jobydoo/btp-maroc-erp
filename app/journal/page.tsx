'use client';

import React, { useState, useEffect } from 'react';
import { store, formatDateFR } from '@/lib/store';
import { JournalChantier, MeteoType } from '@/lib/types';
import {
  ClipboardList,
  PlusCircle,
  Sun,
  CloudRain,
  Wind,
  Cloud,
  Flame,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Users
} from 'lucide-react';

export default function JournalGlobalPage() {
  const [, setTick] = useState(0);

  // Form State for quick new journal entry
  const [chantierId, setChantierId] = useState(store.chantiers[0]?.id || '');
  const [dateRapport, setDateRapport] = useState(new Date().toISOString().split('T')[0]);
  const [meteo, setMeteo] = useState<MeteoType>('ENSOLEILLE');
  const [temperature, setTemperature] = useState('26');
  const [effectifPresent, setEffectifPresent] = useState('10');
  const [travauxExecutes, setTravauxExecutes] = useState('');
  const [problemesIncidents, setProblemesIncidents] = useState('');
  const [consignesSecurite, setConsignesSecurite] = useState('Port obligatoire des casques, gants et chaussures de sécurité. Balisage des fouilles.');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800');
  const [photoLegende, setPhotoLegende] = useState('Coulage béton semelles et attentes poteaux');
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const chantiers = store.chantiers;
  const journaux = store.journaux;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!travauxExecutes) return;

    store.ajouterRapportJournal({
      chantierId,
      date: dateRapport,
      meteo,
      temperature: parseInt(temperature, 10) || 25,
      effectifPresent: parseInt(effectifPresent, 10) || 8,
      travauxExecutes,
      problemesIncidents: problemesIncidents || 'Aucun incident à signaler.',
      consignesSecurite,
      photos: photoUrl ? [{ url: photoUrl, legende: photoLegende }] : [],
      redigeParId: store.currentUser.id
    });

    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);

    setTravauxExecutes('');
    setProblemesIncidents('');
  };

  const getMeteoIcon = (m: MeteoType) => {
    switch (m) {
      case 'ENSOLEILLE': return <Sun className="w-5 h-5 text-amber-500" />;
      case 'PLUVIEUX': return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'VENT_FORT': return <Wind className="w-5 h-5 text-slate-500" />;
      case 'CANICULE': return <Flame className="w-5 h-5 text-rose-500" />;
      default: return <Cloud className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Journal de Chantier Terrain
            <span className="text-xs bg-btp-orange text-white font-semibold px-2 py-0.5 rounded-full uppercase">
              Mobile-First
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Saisie quotidienne pour les chefs de chantier : météo, effectifs, avancement et photos de terrain
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Rapport journalier enregistré avec succès dans l'historique du chantier !
        </div>
      )}

      {/* Formulaire de Saisie Mobile-First */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-btp-orange" />
          Rapport Quotidien du Jour
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Chantier BTP *</label>
              <select
                value={chantierId}
                onChange={(e) => setChantierId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-btp-orange"
              >
                {chantiers.map(c => (
                  <option key={c.id} value={c.id}>{c.nom} ({c.ville})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date du Rapport</label>
              <input
                type="date"
                required
                value={dateRapport}
                onChange={(e) => setDateRapport(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
              />
            </div>
          </div>

          {/* Météo & Conditions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Conditions Météo</label>
              <select
                value={meteo}
                onChange={(e) => setMeteo(e.target.value as MeteoType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold"
              >
                <option value="ENSOLEILLE">☀️ Ensoleillé</option>
                <option value="NUAGEUX">⛅ Nuageux</option>
                <option value="PLUVIEUX">🌧️ Pluvieux</option>
                <option value="VENT_FORT">💨 Vent fort (Grues ralenties)</option>
                <option value="CANICULE">🔥 Canicule</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Température (°C)</label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Effectif Présent (Ouvriers)</label>
              <input
                type="number"
                value={effectifPresent}
                onChange={(e) => setEffectifPresent(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-btp-orange"
              />
            </div>
          </div>

          {/* Travaux du jour */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Travaux Exécutés & Cadencement *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Ex: Coulage de 42 m³ de béton prêt à l'emploi LafargeHolcim B25 pour le plancher haut du RDC. Vibrage à l'aiguille haute fréquence et lissage de surface..."
              value={travauxExecutes}
              onChange={(e) => setTravauxExecutes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
            ></textarea>
          </div>

          {/* Aléas & Incidents */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Incidents, Retards ou Aléas rencontrés
            </label>
            <input
              type="text"
              placeholder="Ex: Retard livraison acier Sonasid de 2 heures / Visite du bureau de contrôle LPEE"
              value={problemesIncidents}
              onChange={(e) => setProblemesIncidents(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          {/* Photos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">URL Photo de Terrain</label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Légende Photo</label>
              <input
                type="text"
                value={photoLegende}
                onChange={(e) => setPhotoLegende(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-btp-orange hover:bg-btp-orange-dark text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Enregistrer le Rapport du Jour
          </button>
        </form>
      </div>

      {/* Historique des Rapports Récents */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Historique des Derniers Rapports de Chantier
        </h2>

        <div className="space-y-4">
          {journaux.map((j) => {
            const ch = chantiers.find(c => c.id === j.chantierId);
            return (
              <div key={j.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900">{ch?.nom || 'Chantier'}</span>
                    <span className="text-xs text-slate-400 ml-2">({ch?.ville})</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {getMeteoIcon(j.meteo)} {j.temperature}° C
                    </span>
                    <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">
                      {j.effectifPresent} ouvriers
                    </span>
                    <span className="text-slate-500 font-mono">{formatDateFR(j.date)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {j.travauxExecutes}
                </p>

                {j.problemesIncidents && (
                  <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <strong>Incident :</strong> {j.problemesIncidents}
                  </p>
                )}

                {j.photos && j.photos.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {j.photos.map((ph, idx) => (
                      <div key={idx} className="rounded-lg overflow-hidden border border-slate-200">
                        <img src={ph.url} alt={ph.legende} className="w-full h-36 object-cover" />
                        <div className="p-2 bg-white text-[11px] text-slate-600 truncate">
                          {ph.legende}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
