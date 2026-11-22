'use client';

import React, { useState, useEffect } from 'react';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import {
  FileMinus,
  Search,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export default function AchatsAvoirsPage() {
  const [, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const avoirs = store.facturesAvoirFournisseurActives.filter(a =>
    a.numeroAvoir.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.fournisseurNom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette facture d’avoir fournisseur ?')) {
      store.facturesAvoirFournisseur = store.facturesAvoirFournisseur.filter(a => a.id !== id);
      store.saveToStorage();
      setTick(t => t + 1);
      showToast('Avoir fournisseur supprimé.');
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
              <FileMinus className="w-6 h-6 text-cyan-700" />
              Factures d'Avoir Fournisseur (Achats BTP)
            </h1>
            <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full uppercase">
              {store.company.raisonSociale.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Avoirs et notes de crédit reçus des fournisseurs de matériaux suite à retours ou litiges de livraison
          </p>
        </div>
      </div>

      {/* Recherche */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par référence (AVF-2026-...) ou nom du fournisseur..."
          className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Liste des Avoirs */}
      <div className="space-y-3">
        {avoirs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            Aucun avoir fournisseur enregistré.
          </div>
        ) : (
          avoirs.map((av) => (
            <div key={av.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 px-2 py-0.5 rounded">
                    {av.numeroAvoir}
                  </span>
                  <span className="text-xs text-slate-400">• Date : {formatDateFR(av.dateAvoir)}</span>
                </div>
                <p className="font-bold text-slate-900 text-sm">{av.fournisseurNom}</p>
                <p className="text-xs text-slate-600">
                  Motif : <em>{av.motif}</em>
                </p>
              </div>

              <div className="flex flex-col md:items-end gap-2">
                <div className="text-left md:text-right">
                  <div className="text-base font-extrabold text-cyan-800">- {formatMAD(av.totalTTC)}</div>
                  <div className="text-[11px] text-slate-500">HT : {formatMAD(av.totalHT)} (TVA 20% : {formatMAD(av.montantTva)})</div>
                </div>

                <button
                  onClick={() => handleDelete(av.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
