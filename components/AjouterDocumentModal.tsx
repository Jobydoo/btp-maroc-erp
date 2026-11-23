'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  FileText,
  Truck,
  Receipt,
  FileMinus,
  ShoppingCart,
  PackageCheck,
  CreditCard,
  X,
  ArrowRight,
  Sparkles,
  UserCheck,
  Briefcase,
  Boxes,
  Building
} from 'lucide-react';

interface AjouterDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScanner?: () => void;
}

export default function AjouterDocumentModal({ isOpen, onClose, onOpenScanner }: AjouterDocumentModalProps) {
  if (!isOpen) return null;

  const sections = [
    {
      titre: 'Cycle Client & Ventes (Normes Sage 100 BTP)',
      description: 'Documents commerciaux adressés aux maîtres d\'ouvrage et clients',
      items: [
        {
          nom: 'Devis Quantitatif Estimatif (DQE)',
          desc: 'Élaborer une proposition commerciale chiffrée par lots BTP',
          icon: FileSpreadsheet,
          color: 'text-orange-500 bg-orange-50 border-orange-200',
          href: '/ventes/devis?action=nouveau'
        },
        {
          nom: 'Commande Client',
          desc: 'Enregistrer une commande ferme avec engagement de planning',
          icon: FileText,
          color: 'text-blue-500 bg-blue-50 border-blue-200',
          href: '/ventes/commandes?action=nouveau'
        },
        {
          nom: 'Bon de Livraison Vente (BL)',
          desc: 'Constater l\'avancement ou la livraison de matériaux sur site',
          icon: Truck,
          color: 'text-amber-500 bg-amber-50 border-amber-200',
          href: '/ventes/livraisons?action=nouveau'
        },
        {
          nom: 'Facture Vente & Décompte Provisoire',
          desc: 'Facturer une situation de travaux (avec retenue 10% et TVA 20%)',
          icon: Receipt,
          color: 'text-emerald-500 bg-emerald-50 border-emerald-200',
          href: '/ventes/factures?action=nouveau'
        },
        {
          nom: 'Facture d\'Avoir Client',
          desc: 'Émettre un avoir en réduction sur une facture client émise',
          icon: FileMinus,
          color: 'text-rose-500 bg-rose-50 border-rose-200',
          href: '/ventes/avoirs?action=nouveau'
        }
      ]
    },
    {
      titre: 'Cycle Fournisseur & Achats',
      description: 'Approvisionnement matériaux et gestion des sous-traitants',
      items: [
        {
          nom: 'Devis Fournisseur (Demande de prix)',
          desc: 'Consulter des fournisseurs de ciment, acier, agrégats',
          icon: ShoppingCart,
          color: 'text-indigo-500 bg-indigo-50 border-indigo-200',
          href: '/achats/devis?action=nouveau'
        },
        {
          nom: 'Bon de Commande Fournisseur',
          desc: 'Passer un ordre d\'achat vers Lafarge, Sonasid ou Cimar',
          icon: FileText,
          color: 'text-purple-500 bg-purple-50 border-purple-200',
          href: '/achats/commandes?action=nouveau'
        },
        {
          nom: 'Bon de Réception (Entrée Stock / Chantier)',
          desc: 'Contrôler la conformité et incrémenter le stock',
          icon: PackageCheck,
          color: 'text-teal-500 bg-teal-50 border-teal-200',
          href: '/achats/receptions?action=nouveau'
        },
        {
          nom: 'Facture d\'Achat Fournisseur',
          desc: 'Enregistrer une facture fournisseur manuellement',
          icon: Receipt,
          color: 'text-cyan-500 bg-cyan-50 border-cyan-200',
          href: '/achats/factures?action=nouveau'
        }
      ]
    },
    {
      titre: 'Trésorerie & Encaissements',
      description: 'Gestion des règlements et lettrage bancaire',
      items: [
        {
          nom: 'Saisie d\'un Règlement (Client ou Fournisseur)',
          desc: 'Enregistrer un paiement (Chèque, Virement, LCN, Espèces)',
          icon: CreditCard,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
          href: '/reglements?action=nouveau'
        }
      ]
    },
    {
      titre: 'Tiers & Référentiel BTP (Créations Rapides)',
      description: 'Enregistrer de nouveaux partenaires, chantiers ou matériaux dans l\'ERP',
      items: [
        {
          nom: 'Nouveau Client (Maître d\'Ouvrage)',
          desc: 'Créer une fiche client avec ICE, IF, RC, plafond et conditions',
          icon: UserCheck,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          href: '/clients?action=nouveau'
        },
        {
          nom: 'Nouveau Fournisseur de Matériaux',
          desc: 'Ajouter un fournisseur ou sous-traitant avec RIB et ICE',
          icon: Briefcase,
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          href: '/fournisseurs?action=nouveau'
        },
        {
          nom: 'Nouvel Article / Matériau',
          desc: 'Ajouter un matériau au catalogue avec prix d\'achat et vente',
          icon: Boxes,
          color: 'text-amber-600 bg-amber-50 border-amber-200',
          href: '/articles?action=nouveau'
        },
        {
          nom: 'Nouveau Chantier BTP',
          desc: 'Initialiser un nouveau projet de construction et ses lots DQE',
          icon: Building,
          color: 'text-orange-600 bg-orange-50 border-orange-200',
          href: '/chantiers?action=nouveau'
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* En-tête */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-btp-orange px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              Créer un Document Commercial
              <span className="text-[10px] bg-white/20 text-white font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Sage 100 BTP
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Choisissez le type de document à créer. Tous les documents sont reliés aux Chantiers et aux Tiers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bannière OCR IA */}
        {onOpenScanner && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 text-xs">
              <Sparkles className="w-4 h-4 text-btp-orange" />
              <span>Vous disposez d'une facture papier ou d'un PDF ? Utilisez le <strong>Scanner Facture (IA)</strong> pour une saisie en 5 secondes.</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenScanner();
              }}
              className="px-3 py-1 bg-btp-orange hover:bg-orange-600 text-white font-bold text-xs rounded-lg shadow-sm whitespace-nowrap transition-colors"
            >
              Lancer le Scanner IA
            </button>
          </div>
        )}

        {/* Liste des documents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {sections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {sec.titre}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {sec.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sec.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      onClick={onClose}
                      className="p-3 rounded-xl border border-slate-200 hover:border-btp-orange hover:bg-orange-50/20 flex items-start gap-3 transition-all group"
                    >
                      <div className={`p-2 rounded-lg border ${item.color} group-hover:scale-105 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-btp-orange transition-colors">
                            {item.nom}
                          </p>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-btp-orange group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Pied de page */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Devise légale : <strong>MAD (Dirham marocain)</strong> • TVA standard : <strong>20%</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-600 hover:text-slate-900"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}
