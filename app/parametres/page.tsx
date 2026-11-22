'use client';

import React, { useState, useEffect } from 'react';
import { store } from '@/lib/store';
import { CompanySettings } from '@/lib/types';
import { Settings, Save, CheckCircle2, ShieldCheck, Building2, Banknote } from 'lucide-react';

export default function ParametresPage() {
  const [, setTick] = useState(0);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<CompanySettings>({ ...store.company });

  useEffect(() => {
    return store.subscribe(() => {
      setTick(t => t + 1);
      setForm({ ...store.company });
    });
  }, []);

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateCompanySettings(form);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Paramètres de l'Entreprise
            <span className="text-xs bg-slate-200 text-slate-800 font-semibold px-2 py-0.5 rounded-full uppercase">
              Réglementation Maroc
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mentions fiscales et bancaires officielles figurant sur vos Devis, Décomptes et exports PDF
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-btp-orange hover:bg-btp-orange-dark text-white rounded-lg text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          Enregistrer les Modifications
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Paramètres fiscaux et légaux mis à jour avec succès !
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Identité Juridique */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-btp-orange" />
            1. Raison Sociale & Coordonnées
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Raison Sociale de l'Entreprise BTP *
              </label>
              <input
                type="text"
                required
                value={form.raisonSociale}
                onChange={(e) => handleChange('raisonSociale', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-btp-orange"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Téléphone de l'Entreprise</label>
              <input
                type="text"
                value={form.telephone}
                onChange={(e) => handleChange('telephone', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Professionnel</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Adresse du Siège Social</label>
              <input
                type="text"
                value={form.adresse}
                onChange={(e) => handleChange('adresse', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ville du Siège</label>
              <input
                type="text"
                value={form.ville}
                onChange={(e) => handleChange('ville', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Taux de TVA Standard (%)</label>
              <input
                type="number"
                value={form.tauxTva}
                onChange={(e) => handleChange('tauxTva', parseFloat(e.target.value) || 20)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Identifiants Fiscaux Marocains */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            2. Identifiants Légaux Marocains (Obligatoires sur Factures/Devis)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                ICE (15 Chiffres) *
              </label>
              <input
                type="text"
                required
                maxLength={15}
                value={form.ice}
                onChange={(e) => handleChange('ice', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-btp-orange"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Identifiant Fiscal (IF)
              </label>
              <input
                type="text"
                value={form.ifNum}
                onChange={(e) => handleChange('ifNum', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Registre de Commerce (RC)
              </label>
              <input
                type="text"
                value={form.rcNum}
                onChange={(e) => handleChange('rcNum', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                N° de Patente
              </label>
              <input
                type="text"
                value={form.patente}
                onChange={(e) => handleChange('patente', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Numéro d'Affiliation CNSS
              </label>
              <input
                type="text"
                value={form.cnss}
                onChange={(e) => handleChange('cnss', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>
        </div>

        {/* Coordonnées Bancaires Maroc (RIB) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-blue-500" />
            3. Domiciliation Bancaire & Relevé d'Identité Bancaire (RIB)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Banque & Agence</label>
              <input
                type="text"
                value={form.banque}
                onChange={(e) => handleChange('banque', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">RIB (24 Caractères)</label>
              <input
                type="text"
                value={form.rib}
                onChange={(e) => handleChange('rib', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

      </form>

    </div>
  );
}
