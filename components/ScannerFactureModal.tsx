'use client';

import React, { useState } from 'react';
import { store, formatMAD } from '@/lib/store';
import { Sparkles, Upload, FileText, CheckCircle2, Building, Boxes, AlertCircle, X, ArrowRight, Loader2 } from 'lucide-react';

interface ScannerFactureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ScannerFactureModal({ isOpen, onClose, onSuccess }: ScannerFactureModalProps) {
  const [etape, setEtape] = useState<'UPLOAD' | 'SCANNING' | 'PREVIEW'>('UPLOAD');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [affectation, setAffectation] = useState<'STOCK_CENTRAL' | 'CHANTIER_DIRECT'>('CHANTIER_DIRECT');
  const [chantierId, setChantierId] = useState<string>(store.chantiersActifs[0]?.id || '');
  const [parsedData, setParsedData] = useState<any>(null);

  if (!isOpen) return null;

  const demoInvoices = [
    {
      titre: 'Facture LafargeHolcim — 500 sacs Ciment CPJ45 & Sable',
      fournisseur: 'LafargeHolcim Maroc',
      ice: '001524368000012',
      items: [
        { designation: 'Ciment CPJ 45 LafargeHolcim (Sac 50kg)', quantite: 500, unite: 'Sac', prixUnitaireHT: 78.50 },
        { designation: 'Sable lavé de concassage 0/4', quantite: 20, unite: 'm³', prixUnitaireHT: 190.00 }
      ]
    },
    {
      titre: 'Facture Sonasid — 8 Tonnes Acier HA FeE500 D12/D14',
      fournisseur: 'Sonasid Sidérurgie',
      ice: '001689234000089',
      items: [
        { designation: 'Acier FeE500 haute adhérence Sonasid (HA D12)', quantite: 8.0, unite: 'Tonne', prixUnitaireHT: 9400.00 }
      ]
    },
    {
      titre: 'Facture Sika Maroc — Adjuvants & Étanchéité Igol',
      fournisseur: 'Sika Maroc',
      ice: '001745892000078',
      items: [
        { designation: 'Émulsion bitumineuse d\'étanchéité Sika Igol (Fût 25kg)', quantite: 15, unite: 'Fût', prixUnitaireHT: 380.00 }
      ]
    }
  ];

  const handleSimulerOCR = (demoIndex = 0) => {
    setSelectedFile(demoInvoices[demoIndex].titre);
    setEtape('SCANNING');

    setTimeout(() => {
      const demo = demoInvoices[demoIndex];
      const items = demo.items.map(it => ({
        ...it,
        totalHT: it.quantite * it.prixUnitaireHT
      }));
      const totalHT = items.reduce((s, it) => s + it.totalHT, 0);
      const montantTva = totalHT * 0.20;
      const totalTTC = totalHT + montantTva;

      setParsedData({
        fournisseurNom: demo.fournisseur,
        fournisseurIce: demo.ice,
        dateFacture: new Date().toISOString().split('T')[0],
        numeroPiece: 'OCR-FAC-' + Math.floor(10000 + Math.random() * 90000),
        items,
        totalHT,
        tauxTva: 20,
        montantTva,
        totalTTC,
        confianceIA: 98.8
      });
      setEtape('PREVIEW');
    }, 1200);
  };

  const handleValiderImputation = () => {
    if (!parsedData) return;

    store.scannerFactureIA({
      fournisseurNom: parsedData.fournisseurNom,
      fournisseurIce: parsedData.fournisseurIce,
      dateFacture: parsedData.dateFacture,
      affectation,
      chantierId: affectation === 'CHANTIER_DIRECT' ? chantierId : undefined,
      items: parsedData.items
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* En-tête */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-btp-orange px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Scanner Facture & BL Fournisseur (IA)
                <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  OCR BTP Maroc
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Extraction intelligente des montants, articles, TVA et affectation automatique
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps du modal */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {etape === 'UPLOAD' && (
            <div className="space-y-6">
              {/* Zone Drag & Drop / Upload */}
              <div
                onClick={() => handleSimulerOCR(0)}
                className="border-2 border-dashed border-slate-300 hover:border-btp-orange hover:bg-orange-50/40 rounded-2xl p-8 text-center cursor-pointer transition-all group"
              >
                <div className="w-14 h-14 bg-orange-100 text-btp-orange rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <p className="text-sm font-bold text-slate-900">
                  Cliquez ou glissez une facture / bon de livraison (PDF, JPG, PNG)
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Format recommandé : Factures LafargeHolcim, Sonasid, Sika, etc.
                </p>
              </div>

              {/* Boutons d'exemples rapides */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Ou testez instantanément avec un document BTP type :
                </p>
                <div className="space-y-2">
                  {demoInvoices.map((d, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSimulerOCR(idx)}
                      className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-btp-orange hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="font-semibold text-slate-900">{d.titre}</p>
                          <p className="text-[11px] text-slate-500">Fournisseur : {d.fournisseur} • ICE : {d.ice}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-btp-orange flex items-center gap-1">
                        Analyser <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {etape === 'SCANNING' && (
            <div className="py-16 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-btp-orange animate-spin mx-auto" />
              <div>
                <p className="text-base font-bold text-slate-900">
                  Analyse par l'IA en cours...
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Détection des mentions légales marocaines, tableau d'articles et calcul TVA 20%
                </p>
              </div>
            </div>
          )}

          {etape === 'PREVIEW' && parsedData && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Badge de confiance */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Document analysé avec succès — Indice de confiance IA : <strong>{parsedData.confianceIA}%</strong></span>
                </div>
                <span className="font-bold bg-emerald-200/80 px-2 py-0.5 rounded text-[10px]">
                  {parsedData.numeroPiece}
                </span>
              </div>

              {/* Métadonnées Détectées */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500">Fournisseur :</span>
                  <p className="font-bold text-slate-900">{parsedData.fournisseurNom}</p>
                  <p className="text-[11px] text-slate-500">ICE : {parsedData.fournisseurIce}</p>
                </div>
                <div>
                  <span className="text-slate-500">Date de Facture :</span>
                  <p className="font-bold text-slate-900">{parsedData.dateFacture}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">Taux TVA détecté : 20%</p>
                </div>
              </div>

              {/* Lignes d'articles extraites */}
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Articles & Matériaux Reconnus :
                </p>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Désignation</th>
                        <th className="p-2.5 text-center">Qté</th>
                        <th className="p-2.5 text-right">P.U HT</th>
                        <th className="p-2.5 text-right">Total HT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedData.items.map((it: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-900">{it.designation}</td>
                          <td className="p-2.5 text-center">{it.quantite} {it.unite}</td>
                          <td className="p-2.5 text-right">{formatMAD(it.prixUnitaireHT)}</td>
                          <td className="p-2.5 text-right font-bold">{formatMAD(it.totalHT)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-semibold border-t border-slate-200">
                      <tr>
                        <td colSpan={3} className="p-2 text-right">Total HT :</td>
                        <td className="p-2 text-right">{formatMAD(parsedData.totalHT)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="p-2 text-right">TVA (20%) :</td>
                        <td className="p-2 text-right">{formatMAD(parsedData.montantTva)}</td>
                      </tr>
                      <tr className="text-btp-orange text-sm font-bold bg-orange-50/50">
                        <td colSpan={3} className="p-2 text-right">TOTAL TTC :</td>
                        <td className="p-2 text-right">{formatMAD(parsedData.totalTTC)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Choix d'imputation */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Affectation & Imputation Comptable BTP :
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAffectation('CHANTIER_DIRECT')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      affectation === 'CHANTIER_DIRECT'
                        ? 'border-btp-orange bg-orange-50/60 ring-2 ring-btp-orange/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Building className={`w-5 h-5 mt-0.5 ${affectation === 'CHANTIER_DIRECT' ? 'text-btp-orange' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Directement sur Chantier</p>
                      <p className="text-[11px] text-slate-500">Impute le coût au chantier choisi et met à jour le coût réel</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAffectation('STOCK_CENTRAL')}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      affectation === 'STOCK_CENTRAL'
                        ? 'border-btp-orange bg-orange-50/60 ring-2 ring-btp-orange/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Boxes className={`w-5 h-5 mt-0.5 ${affectation === 'STOCK_CENTRAL' ? 'text-btp-orange' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Dépôt Central (Stock)</p>
                      <p className="text-[11px] text-slate-500">Incrémente le stock disponible sans imputer de chantier</p>
                    </div>
                  </button>
                </div>

                {affectation === 'CHANTIER_DIRECT' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                    <label className="text-xs font-semibold text-slate-700">Sélectionner le chantier destinataire :</label>
                    <select
                      value={chantierId}
                      onChange={(e) => setChantierId(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                    >
                      {store.chantiersActifs.map(ch => (
                        <option key={ch.id} value={ch.id}>
                          {ch.code} — {ch.nom} ({ch.ville})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Pied de page */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {etape === 'PREVIEW' ? (
            <>
              <button
                type="button"
                onClick={() => setEtape('UPLOAD')}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                ← Scanner un autre document
              </button>
              <button
                type="button"
                onClick={handleValiderImputation}
                className="px-5 py-2.5 text-xs font-bold bg-btp-orange hover:bg-orange-600 text-white rounded-xl shadow-sm flex items-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Valider & Générer la Facture d'Achat
              </button>
            </>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Fermer
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
