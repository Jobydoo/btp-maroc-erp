'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { store } from '@/lib/store';
import {
  LayoutDashboard,
  CalendarDays,
  Building,
  Users,
  ClipboardList,
  UserCheck,
  Briefcase,
  Boxes,
  ArrowLeftRight,
  FileSpreadsheet,
  FileText,
  Truck,
  Receipt,
  FileMinus,
  CreditCard,
  ShoppingCart,
  PackageCheck,
  Building2,
  ChevronRight,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [, setTick] = useState(0);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const chantiersActifs = store.chantiersActifs.filter(c => c.statut === 'EN_COURS').length;
  const alertesStock = store.alertesStockCount;
  const devisEnAttente = store.devisActifs.filter(d => d.statut === 'EN_ATTENTE' || d.statut === 'BROUILLON').length;
  const facturesImpayees = store.facturesVenteActives.filter(f => f.statut === 'VALIDEE' || f.statut === 'PARTIELLEMENT_PAYEE').length;

  const currentCompany = store.company;
  const otherCompany = store.societes.find(s => s.id !== store.activeSocieteId);

  const navigationSections = [
    {
      titre: 'GÉNÉRAL & RAPPORTS',
      items: [
        {
          name: 'Tableau de bord',
          href: '/dashboard',
          icon: LayoutDashboard,
          badge: null
        },
        {
          name: 'État de Situation par Date',
          href: '/etat-situation',
          icon: CalendarDays,
          badge: 'Comptable',
          badgeColor: 'bg-emerald-100 text-emerald-800'
        }
      ]
    },
    {
      titre: 'CHANTIERS & BTP',
      items: [
        {
          name: 'Chantiers & Projets',
          href: '/chantiers',
          icon: Building,
          badge: chantiersActifs ? `${chantiersActifs} actifs` : null,
          badgeColor: 'bg-orange-100 text-orange-800'
        },
        {
          name: 'Main-d\'œuvre & Pointage',
          href: '/ouvriers',
          icon: Users,
          badge: `${store.ouvriers.length}`,
          badgeColor: 'bg-slate-100 text-slate-700'
        },
        {
          name: 'Journal de Chantier',
          href: '/journal',
          icon: ClipboardList,
          badge: 'Terrain',
          badgeColor: 'bg-emerald-100 text-emerald-800'
        }
      ]
    },
    {
      titre: 'TIERS',
      items: [
        {
          name: 'Clients (Maîtres d\'ouvrage)',
          href: '/clients',
          icon: UserCheck,
          badge: `${store.clientsActifs.length}`,
          badgeColor: 'bg-blue-100 text-blue-800'
        },
        {
          name: 'Fournisseurs & Sous-traitants',
          href: '/fournisseurs',
          icon: Briefcase,
          badge: `${store.fournisseursActifs.length}`,
          badgeColor: 'bg-purple-100 text-purple-800'
        }
      ]
    },
    {
      titre: 'CATALOGUE & STOCK',
      items: [
        {
          name: 'Articles & Matériaux',
          href: '/articles',
          icon: Boxes,
          badge: alertesStock ? `${alertesStock} alerte(s)` : null,
          badgeColor: 'bg-rose-100 text-rose-800'
        },
        {
          name: 'Mouvements & Suivi Stock',
          href: '/stock-mouvements',
          icon: ArrowLeftRight,
          badge: null
        }
      ]
    },
    {
      titre: 'VENTES (CYCLE CLIENT)',
      items: [
        {
          name: 'Devis (DQE BTP)',
          href: '/ventes/devis',
          icon: FileSpreadsheet,
          badge: devisEnAttente ? `${devisEnAttente}` : null,
          badgeColor: 'bg-blue-100 text-blue-800'
        },
        {
          name: 'Commandes Client',
          href: '/ventes/commandes',
          icon: FileText,
          badge: null
        },
        {
          name: 'Bons de Livraison (BL)',
          href: '/ventes/livraisons',
          icon: Truck,
          badge: null
        },
        {
          name: 'Factures Vente & Décomptes',
          href: '/ventes/factures',
          icon: Receipt,
          badge: facturesImpayees ? `${facturesImpayees} à régler` : null,
          badgeColor: 'bg-amber-100 text-amber-800'
        },
        {
          name: 'Factures d\'Avoir Client',
          href: '/ventes/avoirs',
          icon: FileMinus,
          badge: null
        }
      ]
    },
    {
      titre: 'TRÉSORERIE & RÈGLEMENT',
      items: [
        {
          name: 'Saisie des Règlements',
          href: '/reglements',
          icon: CreditCard,
          badge: `${store.reglementsActifs.length}`,
          badgeColor: 'bg-emerald-100 text-emerald-800'
        }
      ]
    },
    {
      titre: 'ACHATS & APPROVISIONNEMENT',
      items: [
        {
          name: 'Devis Fournisseur',
          href: '/achats/devis',
          icon: ShoppingCart,
          badge: null
        },
        {
          name: 'Bons de Commande',
          href: '/achats/commandes',
          icon: FileText,
          badge: null
        },
        {
          name: 'Bons de Réception',
          href: '/achats/receptions',
          icon: PackageCheck,
          badge: null
        },
        {
          name: 'Factures d\'Achat',
          href: '/achats/factures',
          icon: Receipt,
          badge: null
        },
        {
          name: 'Avoirs Fournisseur',
          href: '/achats/avoirs',
          icon: FileMinus,
          badge: null
        }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-72 bg-slate-900 border-r border-slate-800 text-slate-300 transition-transform duration-200 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3.5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Bloc CHANGER DE SOCIÉTÉ en haut de la sidebar */}
          <div className="p-3 bg-slate-800/90 border border-slate-700/80 rounded-xl text-white shadow-sm">
            <div className="flex items-center justify-between text-[10px] text-btp-orange font-bold uppercase tracking-wider mb-1.5">
              <span>SOCIÉTÉ ACTIVE</span>
              <span className="bg-btp-orange/20 text-btp-orange px-1.5 py-0.2 rounded font-extrabold text-[9px]">
                ERP ACTIF
              </span>
            </div>

            <p className="text-xs font-bold text-white truncate leading-snug">
              {currentCompany.raisonSociale}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
              ICE : {currentCompany.ice} • {currentCompany.ville}
            </p>

            {otherCompany && (
              <div className="mt-2.5 pt-2 border-t border-slate-700/60">
                <button
                  onClick={() => store.switchSociete(otherCompany.id)}
                  className="w-full py-1.5 px-2 bg-slate-700/80 hover:bg-btp-orange hover:text-white rounded-lg text-[11px] font-semibold text-slate-200 transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <RefreshCw className="w-3 h-3 text-btp-orange group-hover:text-white" />
                    <span className="truncate">Changer : {otherCompany.raisonSociale.split(' ')[0]}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-4">
            {navigationSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {sec.titre}
                </p>

                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-btp-orange text-white shadow-sm font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-btp-orange'}`} />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                            isActive ? 'bg-white/20 text-white' : item.badgeColor
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Alerte Approvisionnement / Stock */}
          {alertesStock > 0 && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-200 text-xs">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Alerte Stock ({alertesStock})</span>
              </div>
              <p className="text-[11px] text-rose-300/80 leading-tight">
                Articles en rupture ou sous le seuil minimum d'alerte.
              </p>
              <Link
                href="/articles"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 hover:underline"
              >
                Voir le stock <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}

        </div>

        {/* Footer info in sidebar */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
          <div className="flex items-center justify-between font-semibold">
            <span>Sage BTP 100 Maroc</span>
            <span className="text-emerald-400 font-bold">Connecté</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Devise : MAD • Multi-Sociétés Active
          </p>
        </div>
      </aside>
    </>
  );
}
