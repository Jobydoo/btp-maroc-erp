'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { store } from '@/lib/store';
import { Search, X, Building, Users, Briefcase, FileText, Receipt, Boxes, ArrowRight, CornerDownLeft } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = store.rechercheGlobale(query);

  const getIconForType = (type: string) => {
    switch (type.toUpperCase().replace(/\s+/g, '_')) {
      case 'CHANTIER':
        return Building;
      case 'CLIENT':
        return Users;
      case 'FOURNISSEUR':
        return Briefcase;
      case 'FACTURE_VENTE':
      case 'FACTURE_ACHAT':
        return Receipt;
      case 'DEVIS':
        return FileText;
      case 'ARTICLE':
        return Boxes;
      default:
        return FileText;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type.toUpperCase().replace(/\s+/g, '_')) {
      case 'CHANTIER':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CLIENT':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FOURNISSEUR':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'FACTURE_VENTE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'FACTURE_ACHAT':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'DEVIS':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ARTICLE':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col">
        
        {/* Champ de recherche */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un client, chantier, fournisseur, facture (FAC-...), devis ou article..."
            className="flex-1 bg-transparent border-none text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
          >
            Échap
          </button>
        </div>

        {/* Résultats */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-1.5">
          {query.trim().length < 2 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Tapez au moins 2 caractères pour rechercher dans toute l'entreprise (ex : <em>Villa</em>, <em>Lafarge</em>, <em>FAC</em>, <em>Ciment</em>, <em>Al Omrane</em>)
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Aucun résultat trouvé pour <strong className="text-slate-800">« {query} »</strong>
            </div>
          ) : (
            results.map((res, idx) => {
              const Icon = getIconForType(res.type);
              const badgeStyle = getBadgeColor(res.type);

              return (
                <Link
                  key={idx}
                  href={res.url}
                  onClick={onClose}
                  className="p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600 group-hover:bg-btp-orange group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-btp-orange transition-colors">
                        {res.titre}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {res.sousTitre}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                      {res.type}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-btp-orange group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Raccourci bas */}
        <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Recherche Multi-Critères :</span>
            <span>Chantiers • Clients • Fournisseurs • Factures • Devis • Stocks</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
            <CornerDownLeft className="w-3 h-3" /> Entrée pour naviguer
          </div>
        </div>

      </div>
    </div>
  );
}
