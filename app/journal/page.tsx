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
  Users,
  Edit,
  Copy,
  Trash2,
  X
} from 'lucide-react';

export default function JournalGlobalPage() {
  const [, setTick] = useState(0);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

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

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<JournalChantier | null>(null);
  const [editTravaux, setEditTravaux] = useState('');
  const [editIncidents, setEditIncidents] = useState('');
  const [editEffectif, setEditEffectif] = useState('10');
  const [editMeteo, setEditMeteo] = useState<MeteoType>('ENSOLEILLE');
  const [editTemp, setEditTemp] = useState('26');
  const [editDate, setEditDate] = useState('');

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const showNotification = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 3500);
  };

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

    showNotification("Rapport journalier enregistré avec succès dans le journal de chantier !");
    setTravauxExecutes('');
    setProblemesIncidents('');
  };

  const openEditModal = (j: JournalChantier) => {
    setEditingReport(j);
    setEditTravaux(j.travauxExecutes);
    setEditIncidents(j.problemesIncidents || '');
    setEditEffectif(String(j.effectifPresent));
    setEditMeteo(j.meteo);
    setEditTemp(String(j.temperature));
    setEditDate(j.date);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    store.updateRapportJournal(editingReport.id, {
      travauxExecutes: editTravaux,
      problemesIncidents: editIncidents,
      effectifPresent: parseInt(editEffectif, 10) || 10,
      meteo: editMeteo,
      temperature: parseInt(editTemp, 10) || 25,
      date: editDate
    });

    setEditModalOpen(false);
    showNotification("Rapport de chantier modifié avec succès.");
  };

  const handleDuplicate = (id: string) => {
    const clone = store.duplicateRapportJournal(id);
    if (clone) {
      showNotification(`Rapport dupliqué vers la date d'aujourd'hui.`);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Confirmez-vous la suppression de ce rapport de chantier ?")) {
      const ok = store.deleteRapportJournal(id);
      if (ok) {
        showNotification("Rapport supprimé de l'historique.");
      }
    }
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
            Saisie quotidienne, édition, duplication, météo marocaine, effectifs et photos d'avancement
          </p>
        </div>
      </div>

      {/* Formulaire de Saisie Mobile-First */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-btp-orange" />
          Nouveau Rapport Quotidien
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
                value={dateRapport}
                onChange={(e) => setDateRapport(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
              />
            </div>
          </div>

          {/* Météo & Effectif */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Conditions Météo</label>
              <select
                value={meteo}
                onChange={(e) => setMeteo(e.target.value as MeteoType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
              >
                <option value="ENSOLEILLE">Ensoleillé / Beau temps</option>
                <option value="PLUVIEUX">Pluvieux (Intempéries)</option>
                <option value="VENT_FORT">Vent fort / Chergui</option>
                <option value="CANICULE">Forte chaleur / Canicule</option>
                <option value="NUAGEUX">Nuageux</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Température (°C)</label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Effectif Présent sur Chantier *</label>
              <input
                type="number"
                required
                value={effectifPresent}
                onChange={(e) => setEffectifPresent(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-blue-700"
              />
            </div>
          </div>

          {/* Travaux Exécutés */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Travaux Exécutés Aujourd'hui (Lots, Tâches, Matériaux mis en œuvre) *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Ex: Coulage béton armé dalle haute R+1 (35 m³). Pose ferraillage poteaux. Pose briques cloisons rez-de-chaussée..."
              value={travauxExecutes}
              onChange={(e) => setTravauxExecutes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
            />
          </div>

          {/* Incidents & Problèmes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Incidents, Blocages ou Arrêts</label>
            <input
              type="text"
              placeholder="Ex: Retard livraison toupie béton (45 min), coupure eau temporaire..."
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

      {/* Historique des Rapports Récents with Actions */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Historique des Rapports de Chantier ({journaux.length})
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

                {/* Actions Footer : Modifier, Dupliquer, Supprimer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => openEditModal(j)}
                    title="Modifier ce rapport"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded text-xs font-semibold transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDuplicate(j.id)}
                    title="Dupliquer pour aujourd'hui"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded text-xs font-semibold transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Dupliquer
                  </button>
                  <button
                    onClick={() => handleDelete(j.id)}
                    title="Supprimer ce rapport"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL MODIFIER RAPPORT JOURNAL */}
      {editModalOpen && editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 bg-btp-dark text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Modifier le Rapport de Chantier</h3>
                <p className="text-[11px] text-slate-300">Date : {formatDateFR(editDate)}</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Météo</label>
                  <select
                    value={editMeteo}
                    onChange={(e) => setEditMeteo(e.target.value as MeteoType)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  >
                    <option value="ENSOLEILLE">Ensoleillé</option>
                    <option value="PLUVIEUX">Pluvieux</option>
                    <option value="VENT_FORT">Vent fort</option>
                    <option value="CANICULE">Canicule</option>
                    <option value="NUAGEUX">Nuageux</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Effectif</label>
                  <input
                    type="number"
                    value={editEffectif}
                    onChange={(e) => setEditEffectif(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Travaux Exécutés *</label>
                <textarea
                  rows={3}
                  required
                  value={editTravaux}
                  onChange={(e) => setEditTravaux(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Incidents ou Remarques</label>
                <input
                  type="text"
                  value={editIncidents}
                  onChange={(e) => setEditIncidents(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
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

    </div>
  );
}
