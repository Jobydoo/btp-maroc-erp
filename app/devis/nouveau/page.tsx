'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { store, formatMAD } from '@/lib/store';
import { ArrowLeft, Plus, Trash2, Save, FileText, CheckCircle2 } from 'lucide-react';

interface FormItem {
  id: string;
  lotNom: string;
  designation: string;
  unite: string;
  quantite: number;
  prixUnitaireHT: number;
}

const LOTS_PRESETS = [
  '01. Terrassements & Fondations',
  '02. Gros Œuvre & Béton Armé',
  '03. Maçonnerie & Enduits',
  '04. Étanchéité & Isolation',
  '05. Électricité & Éclairage',
  '06. Plomberie & Sanitaire',
  '07. Revêtements & Marbre',
  '08. Menuiserie Aluminium & Bois',
  '09. Peinture & Décoration'
];

export default function NouveauDevisPage() {
  const router = useRouter();

  // Client info
  const [clientNom, setClientNom] = useState('');
  const [clientIce, setClientIce] = useState('');
  const [clientTel, setClientTel] = useState('');
  const [clientVille, setClientVille] = useState('Casablanca');
  const [clientAdresse, setClientAdresse] = useState('');
  const [objet, setObjet] = useState('');
  const [delaiExecution, setDelaiExecution] = useState('5 mois calendaires');
  const [conditionsPaiement, setConditionsPaiement] = useState('20% à la signature, situations mensuelles selon avancement, 10% retenue de garantie.');

  // Items list
  const [items, setItems] = useState<FormItem[]>([
    {
      id: 'it-1',
      lotNom: '01. Terrassements & Fondations',
      designation: 'Fouilles en rigoles dans terrain semi-rocheux et évacuation des déblais',
      unite: 'm³',
      quantite: 350,
      prixUnitaireHT: 95
    },
    {
      id: 'it-2',
      lotNom: '02. Gros Œuvre & Béton Armé',
      designation: 'Béton armé B25 dosé à 350 kg/m³ pour semelles, longrines et poteaux',
      unite: 'm³',
      quantite: 120,
      prixUnitaireHT: 1550
    },
    {
      id: 'it-3',
      lotNom: '02. Gros Œuvre & Béton Armé',
      designation: 'Armatures acier haute adhérence FeE500 Sonasid façonné et posé',
      unite: 'kg',
      quantite: 14000,
      prixUnitaireHT: 14.5
    }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: 'it-' + Date.now(),
        lotNom: '03. Maçonnerie & Enduits',
        designation: '',
        unite: 'm²',
        quantite: 100,
        prixUnitaireHT: 180
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(it => it.id !== id));
  };

  const handleItemChange = (id: string, field: keyof FormItem, val: any) => {
    setItems(items.map(it => it.id === id ? { ...it, [field]: val } : it));
  };

  // Calculations
  const totalHT = items.reduce((s, it) => s + (it.quantite * it.prixUnitaireHT), 0);
  const tauxTva = 20;
  const montantTva = Math.round(totalHT * 0.20 * 100) / 100;
  const totalTTC = totalHT + montantTva;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNom || !objet) {
      alert('Veuillez renseigner le nom du client et l\'objet du devis.');
      return;
    }

    const formattedItems = items.map(it => ({
      id: 'di-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      devisId: '',
      lotNom: it.lotNom,
      designation: it.designation || 'Prestation BTP',
      unite: it.unite,
      quantite: it.quantite,
      prixUnitaireHT: it.prixUnitaireHT,
      totalHT: it.quantite * it.prixUnitaireHT
    }));

    const nouveau = store.addDevis({
      dateDevis: new Date().toISOString().split('T')[0],
      dateValidite: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      clientNom,
      clientIce,
      clientTel,
      clientAdresse,
      clientVille,
      objet,
      statut: 'EN_ATTENTE',
      totalHT,
      items: formattedItems,
      tauxTva,
      conditionsPaiement,
      delaiExecution
    });

    router.push('/devis');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/devis"
            className="p-2 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Créer un Nouveau Devis DQE
            </h1>
            <p className="text-xs text-slate-500">
              Format officiel marocain avec décomposition par lots et TVA 20%
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-btp-orange hover:bg-btp-orange-dark text-white rounded-lg text-xs font-bold shadow-sm transition-all"
        >
          <Save className="w-4 h-4" />
          Enregistrer le Devis
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Informations Client & Objet */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-btp-orange" />
            1. Client & Maître d'Ouvrage
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nom ou Raison Sociale Client *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Société Marocaine d'Investissement SA"
                value={clientNom}
                onChange={(e) => setClientNom(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ICE Client (Maroc)
              </label>
              <input
                type="text"
                placeholder="Ex: 002345678000012"
                value={clientIce}
                onChange={(e) => setClientIce(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Téléphone de Contact
              </label>
              <input
                type="text"
                placeholder="+212 5 XX XX XX XX"
                value={clientTel}
                onChange={(e) => setClientTel(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ville du Projet
              </label>
              <input
                type="text"
                value={clientVille}
                onChange={(e) => setClientVille(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Adresse Complète
              </label>
              <input
                type="text"
                placeholder="Ex: Boulevard d'Anfa, Quartier Gautier"
                value={clientAdresse}
                onChange={(e) => setClientAdresse(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Objet des Travaux *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Construction Clé en main d'une Villa R+1 Contemporaine avec Piscine"
              value={objet}
              onChange={(e) => setObjet(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange font-semibold"
            />
          </div>
        </div>

        {/* Section 2: Postes & Bordereau des Prix DQE */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FileText className="w-4 h-4 text-btp-orange" />
              2. Bordereau des Prix & Postes du Devis
            </h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-xs font-bold text-btp-orange hover:text-btp-orange-dark"
            >
              <Plus className="w-4 h-4" />
              Ajouter une ligne
            </button>
          </div>

          <div className="space-y-3">
            {items.map((it, idx) => (
              <div
                key={it.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                      Lot de Travaux
                    </label>
                    <select
                      value={it.lotNom}
                      onChange={(e) => handleItemChange(it.id, 'lotNom', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-bold text-slate-800"
                    >
                      {LOTS_PRESETS.map(lot => (
                        <option key={lot} value={lot}>{lot}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(it.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded self-end"
                    title="Supprimer cette ligne"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                      Désignation de la Prestation *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Description précise des travaux..."
                      value={it.designation}
                      onChange={(e) => handleItemChange(it.id, 'designation', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                      Unité
                    </label>
                    <select
                      value={it.unite}
                      onChange={(e) => handleItemChange(it.id, 'unite', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded text-center"
                    >
                      <option value="m²">m²</option>
                      <option value="m³">m³</option>
                      <option value="ml">ml</option>
                      <option value="kg">kg</option>
                      <option value="tonne">tonne</option>
                      <option value="forfait">forfait</option>
                      <option value="U">U</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                      Quantité
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={it.quantite}
                      onChange={(e) => handleItemChange(it.id, 'quantite', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded text-right font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                      P.U. HT (MAD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={it.prixUnitaireHT}
                      onChange={(e) => handleItemChange(it.id, 'prixUnitaireHT', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded text-right font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-500 pt-1">
                  Sous-total poste : <strong className="text-slate-900 font-bold">{formatMAD(it.quantite * it.prixUnitaireHT)}</strong>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="w-full py-2 border-2 border-dashed border-slate-200 hover:border-btp-orange text-slate-500 hover:text-btp-orange rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un poste supplémentaire
          </button>
        </div>

        {/* Section 3: Conditions & Récapitulatif Financier */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Conditions Générales & Délais
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Délai d'exécution
              </label>
              <input
                type="text"
                value={delaiExecution}
                onChange={(e) => setDelaiExecution(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Modalités de paiement & Retenue
              </label>
              <textarea
                rows={2}
                value={conditionsPaiement}
                onChange={(e) => setConditionsPaiement(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
              ></textarea>
            </div>
          </div>

          {/* Récapitulatif Total TTC */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Arrêté Financier du Devis
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Total Montant Hors Taxes (HT) :</span>
                <strong className="text-sm font-bold text-slate-800">{formatMAD(totalHT)}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>T.V.A. légale (20.00 %) :</span>
                <strong className="text-sm font-bold text-slate-800">{formatMAD(montantTva)}</strong>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900">NET À PAYER TTC :</span>
                <strong className="text-xl font-black text-btp-orange">{formatMAD(totalTTC)}</strong>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-btp-orange hover:bg-btp-orange-dark text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Valider & Générer le Devis
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}
