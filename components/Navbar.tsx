'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { store } from '@/lib/store';
import { Role } from '@/lib/types';
import { HardHat, UserCheck, ShieldCheck, Calculator, Building2, Bell, Menu, X, ArrowUpRight } from 'lucide-react';

export default function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const [, setTick] = useState(0);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const currentUser = store.currentUser;

  const rolesList: { role: Role; label: string; desc: string; icon: any; color: string }[] = [
    {
      role: 'GERANT_ADMIN',
      label: 'Administrateur / Gérant',
      desc: 'Accès complet (Finances, Marges, Paramètres)',
      icon: ShieldCheck,
      color: 'text-orange-500 bg-orange-50 border-orange-200'
    },
    {
      role: 'CHEF_CHANTIER',
      label: 'Chef de Chantier',
      desc: 'Accès chantiers assignés (Pointage, BL, Journal)',
      icon: HardHat,
      color: 'text-blue-500 bg-blue-50 border-blue-200'
    },
    {
      role: 'COMPTABLE',
      label: 'Responsable Comptable',
      desc: 'Accès devis, décomptes, factures & paies',
      icon: Calculator,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-200'
    }
  ];

  const currentDateStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-btp-dark text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
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
            <div className="w-9 h-9 rounded-lg bg-btp-orange flex items-center justify-center text-white shadow-sm font-bold group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-btp-orange transition-colors">
                  ATLAS BTP MAROC
                </span>
                <span className="hidden sm:inline-block bg-slate-800 border border-slate-700 text-btp-orange text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ERP Chantiers
                </span>
              </div>
              <p className="text-[11px] text-slate-400 capitalize hidden sm:block">
                {currentDateStr}
              </p>
            </div>
          </Link>
        </div>

        {/* Right: Currency pill, Quick Links & Persona Switcher */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Currency Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700/60 rounded-full text-xs font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Devise : <strong className="text-white">MAD (Dirham)</strong>
          </div>

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all"
            >
              <span className="text-xl">{currentUser.avatar}</span>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                  {currentUser.nom}
                  <span className="text-[9px] bg-btp-orange/20 text-btp-orange px-1.5 py-0.2 rounded font-bold">
                    {currentUser.role === 'GERANT_ADMIN' ? 'GÉRANT' : currentUser.role === 'CHEF_CHANTIER' ? 'CHEF' : 'COMPTA'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {currentUser.titre}
                </div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {roleMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setRoleMenuOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 text-slate-900 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Basculer de Rôle (Démo BTP)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Chaque rôle adapte les permissions et les vues
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
                    <span>ICE : 002891456000034</span>
                    <span className="text-btp-orange font-semibold">TVA 20%</span>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
