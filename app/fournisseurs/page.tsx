'use client';

import React, { useState, useEffect } from 'react';
import { store, formatMAD } from '@/lib/store';
import { Fournisseur } from '@/lib/types';
import {
  Briefcase,
  Plus,
  Search,
  Edit,
  Copy,
  Trash2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  X,
  CheckCircle2,
  Building
} from 'lucide-react';

export default function FournisseursPage() {
  const [, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFournisseur, setEditingFournisseur] = useState<Fournisseur | null>(null);

  // Form states
  const [nom, setNom] = useState('');
  const [ice, setIce] = useState('');
  const [ifNum, setIfNum] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [ville, setVille] = useState('Casablanca');
  const [adresse, setAdresse] = useState('');
  const [specialite, setSpecialite] = useState('Ciments & Béton');
  const [rib, setRib] = useState('');
  const [conditionsPaiement, setConditionsPaiement] = useState('30 jours fin de mois');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  const fournisseurs = store.fournisseursActifs.filter(f =>
    f.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.ice.includes(searchTerm) ||
    f.specialite.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.ville.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingFournisseur(null);
    setNom('');
    setIce('');
    setIfNum('');
    setTelephone('');
    setEmail('');
    setVille('Casablanca');
    setAdresse('');
    setSpecialite('Ciments & Béton');
    setRib('');
    setConditionsPaiement('30 jours fin de mois');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: Fournisseur) => {
    setEditingFournisseur(f);
    setNom(f.nom);
    setIce(f.ice);
    setIfNum(f.ifNum);
    setTelephone(f.telephone);
    setEmail(f.email);
    setVille(f.ville);
    setAdresse(f.adresse);
    setSpecialite(f.specialite);
    setRib(f.rib || '');
    setConditionsPaiement(f.conditionsPaiement || '30 jours fin de mois');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    if (editingFournisseur) {
      store.updateFournisseur(editingFournisseur.id, {
        nom,
        ice: ice || '001524368000012',
        ifNum: ifNum || '01089452',
        telephone,
        email,
        ville,
        adresse,
        specialite,
        rib,
        conditionsPaiement
      });
      showToast(`Fournisseur "${nom}" mis à jour.`);
    } else {
      store.addFournisseur({
        nom,
        ice: ice || '001524368000012',
        ifNum: ifNum || '01089452',
        telephone,
        email,
        ville,
        adresse,
        specialite,
        rib,
        conditionsPaiement
      });
      showToast(`Fournisseur "${nom}" ajouté avec succès.`);
    }

    setIsModalOpen(false);
  };

  const handleDuplicate = (f: Fournisseur) => {
    store.duplicateFournisseur(f.id);
    showToast(`Fiche fournisseur "${f.nom}" dupliquée.`);
  };

  const handleDelete = (f: Fournisseur) => {
    if (confirm(`Confirmez-vous la suppression du fournisseur "${f.nom}" ?`)) {
      store.deleteFournisseur(f.id);
      showToast(`Fournisseur "${f.nom}" supprimé.`);
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
              <Briefcase className="w-6 h-6 text-purple-600" />
              Fournisseurs & Sous-traitants BTP
            </h1>
            <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full uppercase">
              {store.company.raisonSociale.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestion des fournisseurs de matériaux (Lafarge, Sonasid, Cimar...), coordonnées bancaires et conditions de paiement
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nouveau Fournisseur
        </button>
      </div>

      {/* Barre de Recherche */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un fournisseur par nom, ICE, spécialité (ciment, acier, étanchéité) ou ville..."
          className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Grille des Fournisseurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fournisseurs.map((f) => (
          <div key={f.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full truncate max-w-[180px]">
                  {f.specialite}
                </span>

                {/* Actions CRUD */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(f)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(f)}
                    className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Dupliquer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(f)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mb-1.5">
                {f.nom}
              </h3>

              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                <p className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-semibold">ICE :</span>
                  <span className="font-mono font-medium">{f.ice}</span>
                </p>
                <p className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span>{f.telephone || '-'}</span>
                </p>
                <p className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{f.email || '-'}</span>
                </p>
                <p className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{f.adresse ? `${f.adresse}, ${f.ville}` : f.ville}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Conditions :</span> {f.conditionsPaiement || '30 jours fin de mois'}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Créer / Modifier Fournisseur */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-400" />
                {editingFournisseur ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur Matériaux'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Raison Sociale / Nom *</label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  required
                  placeholder="Ex: LafargeHolcim Maroc, Sonasid..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ICE (15 chiffres)</label>
                  <input
                    type="text"
                    value={ice}
                    onChange={(e) => setIce(e.target.value)}
                    placeholder="001524368000012"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Spécialité / Métier</label>
                  <input
                    type="text"
                    value={specialite}
                    onChange={(e) => setSpecialite(e.target.value)}
                    placeholder="Ciment, Acier, Échafaudage..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+212 5 22 00 00 00"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="commandes@fournisseur.ma"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Ville</label>
                  <input
                    type="text"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Conditions de Paiement</label>
                  <input
                    type="text"
                    value={conditionsPaiement}
                    onChange={(e) => setConditionsPaiement(e.target.value)}
                    placeholder="Ex: 30j fin de mois par effet LCN"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Adresse complète</label>
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Zone Industrielle..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Relevé d'Identité Bancaire (RIB - 24 chiffres)</label>
                <input
                  type="text"
                  value={rib}
                  onChange={(e) => setRib(e.target.value)}
                  placeholder="011 780 0000123456789012 45"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
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
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  {editingFournisseur ? 'Enregistrer les modifications' : 'Créer le fournisseur'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
