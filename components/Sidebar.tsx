'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { store } from '@/lib/store';
import {
  LayoutDashboard,
  Building,
  FileSpreadsheet,
  Boxes,
  Users,
  ClipboardList,
  Settings,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [, setTick] = useState(0);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const chantiersEnCours = store.chantiers.filter(c => c.statut === 'EN_COURS').length;
  const alertesStock = store.materiaux.filter(m => m.stockActuel <= m.stockMinimum).length;
  const devisEnAttente = store.devis.filter(d => d.statut === 'EN_ATTENTE' || d.statut === 'BROUILLON').length;

  const navigation = [
    {
      name: 'Tableau de bord',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'Chantiers (Projets)',
      href: '/chantiers',
      icon: Building,
      badge: chantiersEnCours ? `${chantiersEnCours} actifs` : null,
      badgeColor: 'bg-orange-100 text-orange-800'
    },
    {
      name: 'Devis & Décomptes',
      href: '/devis',
      icon: FileSpreadsheet,
      badge: devisEnAttente ? `${devisEnAttente} en cours` : null,
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      name: 'Matériaux & Stocks',
      href: '/materiaux',
      icon: Boxes,
      badge: alertesStock ? `${alertesStock} alertes` : null,
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    {
      name: 'Main-d\'œuvre & Paies',
      href: '/ouvriers',
      icon: Users,
      badge: `${store.ouvriers.length} ouvriers`,
      badgeColor: 'bg-slate-100 text-slate-700'
    },
    {
      name: 'Journal de Chantier',
      href: '/journal',
      icon: ClipboardList,
      badge: 'Terrain',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      name: 'Paramètres Société',
      href: '/parametres',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Quick Notice */}
          <div className="p-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl text-white shadow-sm">
            <div className="flex items-center justify-between text-xs text-btp-orange font-bold uppercase tracking-wider mb-1">
              <span>BTP MAROC ERP</span>
              <span className="text-[10px] bg-btp-orange text-white px-1.5 py-0.2 rounded font-bold">PRO</span>
            </div>
            <p className="text-xs text-slate-300 font-medium truncate">
              {store.company.raisonSociale}
            </p>
            <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>ICE : {store.company.ice.substring(0, 7)}...</span>
              <span className="text-emerald-400 font-medium">Casablanca</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Modules Métiers BTP
            </p>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-btp-orange text-white shadow-sm font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-btp-orange'}`} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Alert Box for Low Stock / Delays */}
          {alertesStock > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Alerte Approvisionnement</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-tight">
                {alertesStock} matériau(x) en dessous du seuil minimum. Vérifier les bons de livraison.
              </p>
              <Link
                href="/materiaux"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:underline"
              >
                Gérer les stocks <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500">
          <div className="flex items-center justify-between font-medium">
            <span>Version 2.0 (Maroc)</span>
            <span className="text-btp-orange font-bold">100% Hors-Ligne</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Synchronisation locale continue
          </p>
        </div>
      </aside>
    </>
  );
}
