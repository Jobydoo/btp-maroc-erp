'use client';

import React, { useState, useEffect } from 'react';
import { store, formatMAD } from '@/lib/store';
import { Client } from '@/lib/types';
import {
  UserCheck,
  Plus,
  Search,
  Edit,
  Copy,
  Trash2,
  Building,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileSpreadsheet,
  Receipt,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ClientsPage() {
  const [, setTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form states
  const [codeClient, setCodeClient] = useState('');
  const [nom, setNom] = useState('');
  const [ice, setIce] = useState('');
  const [ifNum, setIfNum] = useState('');
  const [rcNum, setRcNum] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [ville, setVille] = useState('Casablanca');
  const [adresse, setAdresse] = useState('');
  const [plafondEncoursMAD, setPlafondEncoursMAD] = useState(2000000);
  const [notes, setNotes] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'nouveau') {
        handleOpenAdd();
      }
    }
  }, []);

  const clients = store.clientsActifs.filter(c =>
    c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ice.includes(searchTerm) ||
    c.ville.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingClient(null);
    const count = store.clients.length + 1;
    setCodeClient(`CLI-${String(count).padStart(3, '0')}`);
    setNom('');
    setIce('');
    setIfNum('');
    setRcNum('');
    setTelephone('');
    setEmail('');
    setVille('Casablanca');
    setAdresse('');
    setPlafondEncoursMAD(2000000);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Client) => {
    setEditingClient(c);
    setCodeClient(c.codeClient);
    setNom(c.nom);
    setIce(c.ice);
    setIfNum(c.ifNum);
    setRcNum(c.rcNum);
    setTelephone(c.telephone);
    setEmail(c.email);
    setVille(c.ville);
    setAdresse(c.adresse);
    setPlafondEncoursMAD(c.plafondEncoursMAD);
    setNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    if (editingClient) {
      store.updateClient(editingClient.id, {
        codeClient,
        nom,
        ice: ice || 'Non spécifié',
        ifNum: ifNum || '12345678',
        rcNum: rcNum || '12345',
        telephone,
        email,
        ville,
        adresse,
        plafondEncoursMAD: Number(plafondEncoursMAD),
        notes
      });
      showToast(`Client "${nom}" mis à jour avec succès.`);
    } else {
      store.addClient({
        codeClient,
        nom,
        ice: ice || 'Non spécifié',
        ifNum: ifNum || '12345678',
        rcNum: rcNum || '12345',
        telephone,
        email,
        ville,
        adresse,
        plafondEncoursMAD: Number(plafondEncoursMAD),
        notes
      });
      showToast(`Client "${nom}" ajouté au répertoire.`);
    }

    setIsModalOpen(false);
  };

  const handleDuplicate = (c: Client) => {
    store.duplicateClient(c.id);
    showToast(`Fiche client "${c.nom}" dupliquée.`);
  };

  const handleDelete = (c: Client) => {
    if (confirm(`Confirmez-vous la suppression du client "${c.nom}" ?`)) {
      store.deleteClient(c.id);
      showToast(`Client "${c.nom}" supprimé.`);
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
              <UserCheck className="w-6 h-6 text-btp-orange" />
              Répertoire des Clients (Maîtres d'Ouvrage)
            </h1>
            <span className="text-xs bg-slate-900 text-white font-bold px-2 py-0.5 rounded-full uppercase">
              {store.company.raisonSociale.split(' ')[0]}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestion des tiers clients, identifiants fiscaux (ICE, IF, RC), encours autorisé et suivi des situations
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-btp-orange hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nouveau Client
        </button>
      </div>

      {/* Barre de Recherche & Filtres */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par raison sociale, ICE, ville (Marrakech, Casablanca...)..."
          className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Grille des Clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((c) => {
          const encoursConsommePct = c.plafondEncoursMAD > 0 ? Math.min(100, Math.round((c.soldeEncoursMAD / c.plafondEncoursMAD) * 100)) : 0;
          const isAlerteEncours = c.soldeEncoursMAD > c.plafondEncoursMAD * 0.8;

          return (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {c.codeClient}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                      {c.ville}
                    </span>
                  </div>

                  {/* Boutons d'action : Modifier, Dupliquer, Supprimer */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier ce client"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(c)}
                      className="p-1.5 text-slate-400 hover:text-btp-orange hover:bg-orange-50 rounded-lg transition-colors"
                      title="Dupliquer ce client"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Supprimer ce client"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-1">
                  {c.nom}
                </h3>

                <div className="space-y-1 text-xs text-slate-600 mb-4">
                  <p className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-semibold">ICE :</span>
                    <span className="font-mono font-medium">{c.ice}</span>
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span>{c.telephone || '-'}</span>
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{c.email || '-'}</span>
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{c.adresse || '-'}</span>
                  </p>
                </div>
              </div>

              {/* Jauge d'encours financier */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 font-medium">Encours Utilisé :</span>
                  <span className={`font-bold ${isAlerteEncours ? 'text-amber-600' : 'text-slate-900'}`}>
                    {formatMAD(c.soldeEncoursMAD)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isAlerteEncours ? 'bg-amber-500' : 'bg-blue-500'}`}
                    style={{ width: `${encoursConsommePct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>Plafond : {formatMAD(c.plafondEncoursMAD)}</span>
                  <span>{encoursConsommePct}%</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Créer / Modifier Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-btp-orange" />
                {editingClient ? 'Modifier le Client' : 'Ajouter un Nouveau Client'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Code Client</label>
                  <input
                    type="text"
                    value={codeClient}
                    onChange={(e) => setCodeClient(e.target.value)}
                    required
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Raison Sociale / Nom *</label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    required
                    placeholder="Ex: Groupe Al Omrane, Dyar Al Mansour..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">ICE (15 chiffres)</label>
                  <input
                    type="text"
                    value={ice}
                    onChange={(e) => setIce(e.target.value)}
                    placeholder="001894562000078"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Identifiant Fiscal (IF)</label>
                  <input
                    type="text"
                    value={ifNum}
                    onChange={(e) => setIfNum(e.target.value)}
                    placeholder="34091284"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Registre Comm. (RC)</label>
                  <input
                    type="text"
                    value={rcNum}
                    onChange={(e) => setRcNum(e.target.value)}
                    placeholder="89210 - Casa"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
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
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@client.ma"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
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
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Plafond d'Encours (MAD)</label>
                  <input
                    type="number"
                    value={plafondEncoursMAD}
                    onChange={(e) => setPlafondEncoursMAD(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Adresse complète</label>
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Angle Boulevard..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes / Conditions Particulières</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Délais de paiement, contact du métreur / conducteur travaux..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-btp-orange focus:outline-none"
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
                  className="px-5 py-2 bg-btp-orange hover:bg-orange-600 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  {editingClient ? 'Enregistrer les modifications' : 'Créer le client'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
