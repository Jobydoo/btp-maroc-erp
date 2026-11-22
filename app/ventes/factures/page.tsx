'use client';

import React, { useState, useEffect } from 'react';
import { store, formatMAD, formatDateFR } from '@/lib/store';
import { FactureVente, TypeFactureVente, ModeReglement } from '@/lib/types';
import { genererPDFFactureVente } from '@/lib/pdf-generator';
import {
  Receipt,
  Plus,
  Search,
  Edit,
  Copy,
  Trash2,
  Download,
  CreditCard,
  FileMinus,
  CheckCircle2,
  X,
  Building,
  Clock,
  Layers,
  Percent
} from 'lucide-react';

export default function VentesFacturesPage() {
  const [, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatut, setSelectedStatut] = useState<string>('TOUS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacture, setEditingFacture] = useState<FactureVente | null>(null);

  // Modal Règlement Rapide
  const [reglementModalOpen, setReglementModalOpen] = useState(false);
  const [factureCible, setFactureCible] = useState<FactureVente | null>(null);
  const [montantReglement, setMontantReglement] = useState<number>(0);
  const [modeReglement, setModeReglement] = useState<ModeReglement>('VIREMENT');
  const [refPieceReglement, setRefPieceReglement] = useState('VIR-ATTIJARI-' + Math.floor(100000 + Math.random() * 900000));
  const [banqueReglement, setBanqueReglement] = useState('Attijariwafa Bank');

  // Modal Avoir
  const [avoirModalOpen, setAvoirModalOpen] = useState(false);
  const [motifAvoir, setMotifAvoir] = useState('Remise commerciale suite réclamation');
  const [montantAvoirHT, setMontantAvoirHT] = useState<number>(10000);

  // Form states Facture
  const [clientNom, setClientNom] = useState('');
  const [clientIce, setClientIce] = useState('');
  const [clientVille, setClientVille] = useState('Casablanca');
  const [chantierId, setChantierId] = useState(store.chantiersActifs[0]?.id || '');
  const [typeFacture, setTypeFacture] = useState<TypeFactureVente>('DECOMPTE_PROVISOIRE');
  const [dateFacture, setDateFacture] = useState(new Date().toISOString().split('T')[0]);
  const [dateEcheance, setDateEcheance] = useState(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [pourcentageAvancement, setPourcentageAvancement] = useState<number>(50);
  const [retenueGarantiePct, setRetenueGarantiePct] = useState<number>(10);
  const [designation, setDesignation] = useState('Situation de travaux n° 02 : Gros œuvre & béton armé');
  const [totalHT, setTotalHT] = useState<number>(600000);
  const [notes, setNotes] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const factures = store.facturesVenteActives.filter(f => {
    const matchSearch = f.numeroFacture.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.chantierNom && f.chantierNom.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatut = selectedStatut === 'TOUS' || f.statut === selectedStatut;
    return matchSearch && matchStatut;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingFacture(null);
    const client = store.clientsActifs[0];
    setClientNom(client?.nom || 'Groupe Al Omrane');
    setClientIce(client?.ice || '001894562000078');
    setClientVille(client?.ville || 'Casablanca');
    setChantierId(store.chantiersActifs[0]?.id || '');
    setTypeFacture('DECOMPTE_PROVISOIRE');
    setDateFacture(new Date().toISOString().split('T')[0]);
    setDateEcheance(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setPourcentageAvancement(50);
    setRetenueGarantiePct(10);
    setDesignation('Situation d\'avancement n° 03 : Terrassement et élévation RDC');
    setTotalHT(650000);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: FactureVente) => {
    setEditingFacture(f);
    setClientNom(f.clientNom);
    setClientIce(f.clientIce);
    setClientVille(f.clientVille || 'Casablanca');
    setChantierId(f.chantierId || '');
    setTypeFacture(f.typeFacture);
    setDateFacture(f.dateFacture);
    setDateEcheance(f.dateEcheance);
    setPourcentageAvancement(f.pourcentageAvancement || 0);
    setRetenueGarantiePct(f.retenueGarantiePct);
    setDesignation(f.items[0]?.designation || '');
    setTotalHT(f.totalHT);
    setNotes(f.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNom.trim()) return;

    const chantier = store.chantiersActifs.find(c => c.id === chantierId);
    const client = store.clientsActifs.find(c => c.nom.toLowerCase().includes(clientNom.toLowerCase()));
    const clientId = client?.id || 'cli-01';
    const montantRetenueMAD = retenueGarantiePct > 0 ? (totalHT * (retenueGarantiePct / 100)) : 0;

    if (editingFacture) {
      store.updateFactureVente(editingFacture.id, {
        clientId,
        clientNom,
        clientIce,
        clientVille,
        chantierId,
        chantierNom: chantier?.nom,
        typeFacture,
        dateFacture,
        dateEcheance,
        pourcentageAvancement,
        retenueGarantiePct,
        montantRetenueMAD,
        totalHT: Number(totalHT),
        tauxTva: 20,
        items: [
          { id: 'faci-1', designation, unite: 'forfait', quantite: 1, prixUnitaireHT: Number(totalHT), totalHT: Number(totalHT) }
        ],
        notes
      });
      showToast(`Facture ${editingFacture.numeroFacture} mise à jour.`);
    } else {
      const newFac = store.addFactureVente({
        clientId,
        clientNom,
        clientIce,
        clientVille,
        chantierId,
        chantierNom: chantier?.nom,
        typeFacture,
        dateFacture,
        dateEcheance,
        pourcentageAvancement,
        retenueGarantiePct,
        montantRetenueMAD,
        totalHT: Number(totalHT),
        tauxTva: 20,
        items: [
          { id: 'faci-1', designation, unite: 'forfait', quantite: 1, prixUnitaireHT: Number(totalHT), totalHT: Number(totalHT) }
        ],
        notes
      });
      showToast(`Facture ${newFac.numeroFacture} créée.`);
    }

    setIsModalOpen(false);
  };

  const handleOpenReglement = (f: FactureVente) => {
    setFactureCible(f);
    setMontantReglement(f.soldeDu);
    setModeReglement('VIREMENT');
    setRefPieceReglement('VIR-ATTIJARI-' + Math.floor(100000 + Math.random() * 900000));
    setBanqueReglement('Attijariwafa Bank');
    setReglementModalOpen(true);
  };

  const handleValiderReglement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factureCible || montantReglement <= 0) return;

    store.enregistrerReglement({
      dateReglement: new Date().toISOString().split('T')[0],
      sens: 'ENCAISSEMENT_CLIENT',
      tierId: factureCible.clientId,
      tierNom: factureCible.clientNom,
      factureId: factureCible.id,
      factureNumero: factureCible.numeroFacture,
      montantMAD: Number(montantReglement),
      modeReglement,
      referencePiece: refPieceReglement,
      banque: banqueReglement,
      statut: 'VALIDE',
      notes: `Règlement facture ${factureCible.numeroFacture}`
    });

    showToast(`Règlement de ${formatMAD(montantReglement)} enregistré.`);
    setReglementModalOpen(false);
  };

  const handleOpenAvoir = (f: FactureVente) => {
    setFactureCible(f);
    setMontantAvoirHT(Math.min(25000, f.totalHT * 0.1));
    setMotifAvoir('Avoir commercial sur travaux de finition');
    setAvoirModalOpen(true);
  };

  const handleValiderAvoir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factureCible || montantAvoirHT <= 0) return;

    const av = store.creerAvoirClient(factureCible.id, motifAvoir, Number(montantAvoirHT));
    showToast(`Facture d'avoir ${av.numeroAvoir} générée avec succès.`);
    setAvoirModalOpen(false);
  };

  const handleExportPDF = (f: FactureVente) => {
    genererPDFFactureVente(f, store.company);
    showToast(`PDF de la facture ${f.numeroFacture} généré.`);
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
              <Receipt className="w-6 h-6 text-emerald-600" />
              Factures Vente & Décomptes BTP (Sage 100)
            </h1>
            <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full uppercase">
              {store.company.raisonSociale.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Situations d'avancement, décomptes provisoires avec retenue de garantie 10%, lettrage et recouvrement des créances
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Créer une Facture / Décompte
        </button>
      </div>

      {/* Recherche & Filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par numéro de facture (FAC-2026-...), client, chantier..."
            className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <select
          value={selectedStatut}
          onChange={(e) => setSelectedStatut(e.target.value)}
          className="text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-800 font-medium"
        >
          <option value="TOUS">Tous les statuts de paiement</option>
          <option value="VALIDEE">En attente de paiement (Validée)</option>
          <option value="PARTIELLEMENT_PAYEE">Partiellement payée</option>
          <option value="PAYEE">Payée (Solde 0)</option>
          <option value="BROUILLON">Brouillon</option>
        </select>
      </div>

      {/* Liste des Factures Vente */}
      <div className="space-y-4">
        {factures.map((fac) => {
          const isPayee = fac.statut === 'PAYEE';
          const isPartielle = fac.statut === 'PARTIELLEMENT_PAYEE';
          const isDecompte = fac.typeFacture === 'DECOMPTE_PROVISOIRE';

          return (
            <div key={fac.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                      {fac.numeroFacture}
                    </span>

                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isPayee
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : isPartielle
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {fac.statut}
                    </span>

                    {isDecompte && (
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full">
                        Décompte {fac.pourcentageAvancement ? `${fac.pourcentageAvancement}%` : 'BTP'}
                      </span>
                    )}

                    <span className="text-xs text-slate-400">• Échéance : {formatDateFR(fac.dateEcheance)}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{fac.clientNom}</h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Chantier : <strong>{fac.chantierNom || 'Non assigné'}</strong> • ICE : {fac.clientIce} • Ville : {fac.clientVille || '-'}
                  </p>
                </div>

                <div className="flex flex-col lg:items-end justify-between gap-3">
                  <div className="text-left lg:text-right">
                    <div className="text-lg font-extrabold text-slate-900">{formatMAD(fac.totalTTC)}</div>
                    <div className="text-xs text-slate-500 font-medium">
                      HT : {formatMAD(fac.totalHT)} • TVA 20% : {formatMAD(fac.montantTva)}
                    </div>
                    {fac.soldeDu > 0 ? (
                      <div className="text-xs font-bold text-amber-600 mt-0.5">
                        Reste à encaisser : {formatMAD(fac.soldeDu)}
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-emerald-600 mt-0.5 flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Intégralement payée
                      </div>
                    )}
                  </div>

                  {/* Boutons d'Action Rapide */}
                  <div className="flex flex-wrap items-center gap-2">
                    {fac.soldeDu > 0 && (
                      <button
                        onClick={() => handleOpenReglement(fac)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                        title="Enregistrer un encaissement pour cette facture"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Régler
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenAvoir(fac)}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                      title="Créer une facture d'avoir"
                    >
                      <FileMinus className="w-3.5 h-3.5" />
                      Avoir
                    </button>

                    <button
                      onClick={() => handleExportPDF(fac)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-2xs"
                      title="Télécharger PDF officiel marocain (ICE, TVA 20%, Retenue 10%)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>

                    <div className="h-4 w-px bg-slate-200 mx-1" />

                    <button
                      onClick={() => handleOpenEdit(fac)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        store.duplicateFactureVente(fac.id);
                        showToast(`Facture ${fac.numeroFacture} dupliquée.`);
                      }}
                      className="p-1.5 text-slate-400 hover:text-btp-orange hover:bg-orange-50 rounded-lg transition-colors"
                      title="Dupliquer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Confirmer la suppression de la facture ${fac.numeroFacture} ?`)) {
                          store.deleteFactureVente(fac.id);
                          showToast(`Facture ${fac.numeroFacture} supprimée.`);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Enregistrer un Règlement Rapide */}
      {reglementModalOpen && factureCible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            
            <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Encaisser Facture {factureCible.numeroFacture}
              </h2>
              <button
                onClick={() => setReglementModalOpen(false)}
                className="p-1 rounded-lg hover:bg-emerald-700 text-emerald-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleValiderReglement} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="text-slate-500">Client : <strong className="text-slate-900">{factureCible.clientNom}</strong></p>
                <p className="text-slate-500">Total TTC : <strong className="text-slate-900">{formatMAD(factureCible.totalTTC)}</strong></p>
                <p className="text-amber-600 font-bold">Reste à payer : {formatMAD(factureCible.soldeDu)}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Montant Encaissé (MAD) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={montantReglement}
                  onChange={(e) => setMontantReglement(Number(e.target.value))}
                  max={factureCible.soldeDu}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mode de Paiement</label>
                  <select
                    value={modeReglement}
                    onChange={(e) => setModeReglement(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                  >
                    <option value="VIREMENT">Virement Bancaire</option>
                    <option value="CHEQUE">Chèque Bancaire</option>
                    <option value="EFFET_LCN">Lettre de Change (LCN)</option>
                    <option value="ESPECES">Espèces</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Banque de Dépôt</label>
                  <input
                    type="text"
                    value={banqueReglement}
                    onChange={(e) => setBanqueReglement(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">N° Pièce / Référence Chèque ou Virement</label>
                <input
                  type="text"
                  value={refPieceReglement}
                  onChange={(e) => setRefPieceReglement(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReglementModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  Valider l'Encaissement
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal Créer Facture d'Avoir */}
      {avoirModalOpen && factureCible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            
            <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <FileMinus className="w-4 h-4" />
                Émettre un Avoir sur {factureCible.numeroFacture}
              </h2>
              <button
                onClick={() => setAvoirModalOpen(false)}
                className="p-1 rounded-lg hover:bg-rose-700 text-rose-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleValiderAvoir} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Motif de l'Avoir *</label>
                <input
                  type="text"
                  value={motifAvoir}
                  onChange={(e) => setMotifAvoir(e.target.value)}
                  required
                  placeholder="Ex: Réfraction sur métré, remise commerciale..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Montant Hors Taxes (HT) de l'Avoir (MAD) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={montantAvoirHT}
                  onChange={(e) => setMontantAvoirHT(Number(e.target.value))}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold focus:ring-2 focus:ring-rose-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  TTC déduit : <strong>{formatMAD(montantAvoirHT * 1.20)}</strong> (avec 20% TVA)
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAvoirModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  Confirmer l'Avoir
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal Créer / Modifier Facture */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                {editingFacture ? `Modifier Facture ${editingFacture.numeroFacture}` : 'Nouvelle Facture de Vente / Décompte'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Client *</label>
                  <input
                    type="text"
                    value={clientNom}
                    onChange={(e) => setClientNom(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ICE Client</label>
                  <input
                    type="text"
                    value={clientIce}
                    onChange={(e) => setClientIce(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Chantier rattaché</label>
                  <select
                    value={chantierId}
                    onChange={(e) => setChantierId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    {store.chantiersActifs.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.code} — {ch.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Type de Document</label>
                  <select
                    value={typeFacture}
                    onChange={(e) => setTypeFacture(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none font-bold"
                  >
                    <option value="DECOMPTE_PROVISOIRE">Décompte Provisoire (Avancement BTP)</option>
                    <option value="FACTURE_DOIT">Facture Doit Standard</option>
                    <option value="FACTURE_FINALE">Décompte Général Définitif (DGD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date Facture</label>
                  <input
                    type="date"
                    value={dateFacture}
                    onChange={(e) => setDateFacture(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date Échéance</label>
                  <input
                    type="date"
                    value={dateEcheance}
                    onChange={(e) => setDateEcheance(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Retenue Garantie %</label>
                  <input
                    type="number"
                    value={retenueGarantiePct}
                    onChange={(e) => setRetenueGarantiePct(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Désignation des Prestations / Situation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Total Hors Taxes HT (MAD) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={totalHT}
                  onChange={(e) => setTotalHT(Number(e.target.value))}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  TTC automatique : <strong>{formatMAD(totalHT * 1.20)}</strong> (TVA 20% au Maroc)
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  {editingFacture ? 'Enregistrer' : 'Générer la Facture'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
