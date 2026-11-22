'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { store } from '@/lib/store';
import { Role } from '@/lib/types';
import {
  HardHat,
  ShieldCheck,
  Calculator,
  Building2,
  Menu,
  Sparkles,
  Plus,
  Search,
  RefreshCw,
  ChevronDown,
  Building
} from 'lucide-react';
import ScannerFactureModal from './ScannerFactureModal';
import AjouterDocumentModal from './AjouterDocumentModal';
import GlobalSearchModal from './GlobalSearchModal';

export default function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const [, setTick] = useState(0);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [ajouterDocOpen, setAjouterDocOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentUser = store.currentUser;
  const currentCompany = store.company;
  const otherCompany = store.societes.find(s => s.id !== store.activeSocieteId);

  const rolesList: { role: Role; label: string; desc: string; icon: any; color: string }[] = [
    {
      role: 'GERANT_ADMIN',
      label: 'Propriétaire ERP / Direction',
      desc: 'Accès complet (Finances, Marges, Paramètres)',
      icon: ShieldCheck,
      color: 'text-orange-500 bg-orange-50 border-orange-200'
    },
    {
      role: 'COMPTABLE',
      label: 'Comptable & Facturation',
      desc: 'Accès devis, décomptes, factures & paies',
      icon: Calculator,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-200'
    },
    {
      role: 'CHEF_CHANTIER',
      label: 'Chef de Chantier',
      desc: 'Accès chantiers assignés (Pointage, BL, Journal)',
      icon: HardHat,
      color: 'text-blue-500 bg-blue-50 border-blue-200'
    }
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-btp-dark text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Gauche : Bouton menu mobile + Logo & Sélecteur de Société Active */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none"
                aria-label="Ouvrir le menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-btp-orange flex items-center justify-center text-white shadow-sm font-bold group-hover:scale-105 transition-transform flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="hidden xl:block">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-white group-hover:text-btp-orange transition-colors">
                    {currentCompany.raisonSociale.split(' ')[0]} ERP
                  </span>
                  <span className="bg-slate-800 border border-slate-700 text-btp-orange text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Sage BTP
                  </span>
                </div>
              </div>
            </Link>

            {/* Sélecteur de Société Active Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCompanyMenuOpen(!companyMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all"
                title="Changer de Société active"
              >
                <Building className="w-4 h-4 text-btp-orange flex-shrink-0" />
                <div className="max-w-[130px] sm:max-w-[180px] truncate">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {currentCompany.raisonSociale}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {currentCompany.ville} • ICE: {currentCompany.ice.substring(0, 7)}...
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </button>

              {companyMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCompanyMenuOpen(false)}></div>
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 text-slate-900 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Sociétés Actives (Multi-Sociétés)
                      </p>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                        {store.societes.length} filiales
                      </span>
                    </div>

                    <div className="p-2 space-y-1">
                      {store.societes.map(soc => {
                        const isCurrent = soc.id === store.activeSocieteId;
                        return (
                          <button
                            key={soc.id}
                            onClick={() => {
                              store.switchSociete(soc.id);
                              setCompanyMenuOpen(false);
                            }}
                            className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-all ${
                              isCurrent
                                ? 'bg-orange-50/80 border border-btp-orange/40 font-medium'
                                : 'hover:bg-slate-50 border border-transparent'
                            }`}
                          >
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-700 mt-0.5">
                              <Building className="w-4 h-4 text-btp-orange" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {soc.raisonSociale}
                                </p>
                                {isCurrent && (
                                  <span className="text-[10px] bg-btp-orange text-white font-bold px-1.5 py-0.2 rounded">
                                    Active
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 truncate">
                                {soc.ville} • ICE : {soc.ice}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {otherCompany && (
                      <div className="px-3 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            store.switchSociete(otherCompany.id);
                            setCompanyMenuOpen(false);
                          }}
                          className="w-full text-center py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Passer à {otherCompany.raisonSociale.split(' ')[0]} ({otherCompany.ville})
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Bouton de bascule rapide instantané */}
            {otherCompany && (
              <button
                onClick={() => store.switchSociete(otherCompany.id)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700/80 transition-colors"
                title={`Basculer vers ${otherCompany.raisonSociale}`}
              >
                <RefreshCw className="w-3 h-3 text-btp-orange" />
                <span className="truncate max-w-[140px]">Passer à {otherCompany.raisonSociale.split(' ')[0]}</span>
              </button>
            )}
          </div>

          {/* Centre : Barre de Recherche Globale */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span>Recherche globale (Chantiers, Tiers, Factures...)</span>
              </div>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 border border-slate-700 rounded text-slate-400">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Droite : Boutons Actions Rapides + Profil */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Bouton Mobile Recherche */}
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Recherche"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Bouton Scanner Facture (IA) */}
            <button
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-sm transition-all transform active:scale-95"
              title="Scanner une facture fournisseur avec reconnaissance IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Scanner Facture (IA)</span>
              <span className="sm:hidden">Scanner IA</span>
            </button>

            {/* Bouton + Ajouter un Document (Sage 100) */}
            <button
              onClick={() => setAjouterDocOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-btp-orange hover:bg-orange-600 text-white text-xs font-bold shadow-sm transition-all transform active:scale-95"
              title="Créer rapidement un Devis, Commande, BL, Facture ou Règlement"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden lg:inline">+ Ajouter un Document (Sage 100)</span>
              <span className="lg:hidden">+ Document</span>
            </button>

            {/* Persona & Rôle Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all"
              >
                <span className="text-lg">{currentUser.avatar}</span>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                    {currentUser.nom.split(' ')[0]}
                    <span className="text-[9px] bg-btp-orange/20 text-btp-orange px-1.5 py-0.2 rounded font-bold uppercase">
                      {currentUser.role === 'GERANT_ADMIN' ? 'DIRECTION' : currentUser.role === 'COMPTABLE' ? 'COMPTA' : 'CHEF'}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setRoleMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 text-slate-900 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Permissions & Rôles ERP
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Chaque profil adapte les droits d'accès aux modules
                      </p>
                    </div>

                    <div className="p-2 space-y-1">
                      {rolesList.map(item => {
                        const Icon = item.icon;
                        const isSelected = currentUser.role === item.role;
                        return (
                          <button
                            key={item.role}
                            onClick={() => {
                              store.switchRole(item.role);
                              setRoleMenuOpen(false);
                            }}
                            className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all ${
                              isSelected
                                ? 'bg-slate-100/80 border border-slate-300 font-medium'
                                : 'hover:bg-slate-50 border border-transparent'
                            }`}
                          >
                            <div className={`p-2 rounded-lg border ${item.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900">
                                  {item.label}
                                </span>
                                {isSelected && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                                    Actif
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                {item.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Devise : <strong>MAD</strong></span>
                      <span className="text-btp-orange font-semibold">TVA Maroc 20%</span>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Modals intégrés */}
      <ScannerFactureModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />

      <AjouterDocumentModal
        isOpen={ajouterDocOpen}
        onClose={() => setAjouterDocOpen(false)}
        onOpenScanner={() => setScannerOpen(true)}
      />

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
