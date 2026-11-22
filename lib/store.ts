import {
  Chantier,
  LotDQE,
  TacheDQE,
  Devis,
  Decompte,
  Materiau,
  Fournisseur,
  BonLivraison,
  Ouvrier,
  Pointage,
  AcomptePaie,
  Depense,
  JournalChantier,
  CompanySettings,
  User,
  Role
} from './types';
import {
  INITIAL_COMPANY,
  INITIAL_USERS,
  INITIAL_CHANTIERS,
  INITIAL_LOTS_DQE,
  INITIAL_DEVIS,
  INITIAL_DECOMPTES,
  INITIAL_FOURNISSEURS,
  INITIAL_MATERIAUX,
  INITIAL_OUVRIERS,
  INITIAL_BONS_LIVRAISON,
  INITIAL_DEPENSES,
  INITIAL_POINTAGES,
  INITIAL_ACOMPTES,
  INITIAL_JOURNAUX
} from './mock-data';

// Helper formatting for Moroccan Dirhams (MAD)
export function formatMAD(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0,00 MAD';
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace('MAD', '').trim() + ' MAD';
}

export function formatDateFR(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

// Client Storage Keys
const STORAGE_PREFIX = 'BTP_MAROC_ERP_';

class DataStore {
  company: CompanySettings = INITIAL_COMPANY;
  users: User[] = INITIAL_USERS;
  currentUser: User = INITIAL_USERS[0]; // Gerant par défaut
  chantiers: Chantier[] = INITIAL_CHANTIERS;
  lotsDQE: LotDQE[] = INITIAL_LOTS_DQE;
  devis: Devis[] = INITIAL_DEVIS;
  decomptes: Decompte[] = INITIAL_DECOMPTES;
  fournisseurs: Fournisseur[] = INITIAL_FOURNISSEURS;
  materiaux: Materiau[] = INITIAL_MATERIAUX;
  ouvriers: Ouvrier[] = INITIAL_OUVRIERS;
  bonsLivraison: BonLivraison[] = INITIAL_BONS_LIVRAISON;
  depenses: Depense[] = INITIAL_DEPENSES;
  pointages: Pointage[] = INITIAL_POINTAGES;
  acomptes: AcomptePaie[] = INITIAL_ACOMPTES;
  journaux: JournalChantier[] = INITIAL_JOURNAUX;
  private listeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      const getStored = (key: string) => {
        const item = localStorage.getItem(STORAGE_PREFIX + key);
        return item ? JSON.parse(item) : null;
      };

      const c = getStored('company');
      if (c) this.company = c;

      const ch = getStored('chantiers');
      if (ch) this.chantiers = ch;

      const l = getStored('lotsDQE');
      if (l) this.lotsDQE = l;

      const dev = getStored('devis');
      if (dev) this.devis = dev;

      const dec = getStored('decomptes');
      if (dec) this.decomptes = dec;

      const mat = getStored('materiaux');
      if (mat) this.materiaux = mat;

      const four = getStored('fournisseurs');
      if (four) this.fournisseurs = four;

      const ouv = getStored('ouvriers');
      if (ouv) this.ouvriers = ouv;

      const bl = getStored('bonsLivraison');
      if (bl) this.bonsLivraison = bl;

      const dep = getStored('depenses');
      if (dep) this.depenses = dep;

      const pt = getStored('pointages');
      if (pt) this.pointages = pt;

      const jc = getStored('journaux');
      if (jc) this.journaux = jc;

      const roleSaved = localStorage.getItem(STORAGE_PREFIX + 'current_role');
      if (roleSaved) {
        const found = this.users.find(u => u.role === roleSaved);
        if (found) this.currentUser = found;
      }
    } catch (e) {
      console.warn('Error loading BTP store from localStorage', e);
    }
  }

  saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_PREFIX + 'company', JSON.stringify(this.company));
      localStorage.setItem(STORAGE_PREFIX + 'chantiers', JSON.stringify(this.chantiers));
      localStorage.setItem(STORAGE_PREFIX + 'lotsDQE', JSON.stringify(this.lotsDQE));
      localStorage.setItem(STORAGE_PREFIX + 'devis', JSON.stringify(this.devis));
      localStorage.setItem(STORAGE_PREFIX + 'decomptes', JSON.stringify(this.decomptes));
      localStorage.setItem(STORAGE_PREFIX + 'materiaux', JSON.stringify(this.materiaux));
      localStorage.setItem(STORAGE_PREFIX + 'fournisseurs', JSON.stringify(this.fournisseurs));
      localStorage.setItem(STORAGE_PREFIX + 'ouvriers', JSON.stringify(this.ouvriers));
      localStorage.setItem(STORAGE_PREFIX + 'bonsLivraison', JSON.stringify(this.bonsLivraison));
      localStorage.setItem(STORAGE_PREFIX + 'depenses', JSON.stringify(this.depenses));
      localStorage.setItem(STORAGE_PREFIX + 'pointages', JSON.stringify(this.pointages));
      localStorage.setItem(STORAGE_PREFIX + 'journaux', JSON.stringify(this.journaux));
      localStorage.setItem(STORAGE_PREFIX + 'current_role', this.currentUser.role);
    } catch (e) {
      console.warn('Error saving BTP store to localStorage', e);
    }
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // --- Authentification & Société ---

  switchRole(role: Role) {
    const user = this.users.find(u => u.role === role);
    if (user) {
      this.currentUser = user;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_PREFIX + 'current_role', role);
      }
      this.notify();
    }
  }

  updateCompanySettings(settings: Partial<CompanySettings>) {
    this.company = { ...this.company, ...settings };
    this.saveToStorage();
  }

  // ==========================================
  // 1. CHANTIERS (PROJETS BTP) : CRUD + DUPLIQUER
  // ==========================================

  addChantier(chantier: Omit<Chantier, 'id' | 'code' | 'coutReelTotalMAD' | 'avancementGlobalPct'>) {
    const newId = 'ch-' + Date.now();
    const count = this.chantiers.length + 1;
    const code = `CH-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;
    const nouveau: Chantier = {
      ...chantier,
      id: newId,
      code,
      coutReelTotalMAD: 0,
      avancementGlobalPct: 0
    };
    this.chantiers.unshift(nouveau);
    this.saveToStorage();
    return nouveau;
  }

  updateChantier(id: string, updates: Partial<Chantier>) {
    this.chantiers = this.chantiers.map(c => c.id === id ? { ...c, ...updates } : c);
    this.saveToStorage();
  }

  duplicateChantier(id: string): Chantier | null {
    const original = this.chantiers.find(c => c.id === id);
    if (!original) return null;

    const newId = 'ch-' + Date.now();
    const count = this.chantiers.length + 1;
    const code = `CH-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

    const clone: Chantier = {
      ...original,
      id: newId,
      code,
      nom: `[Copie] ${original.nom}`,
      statut: 'PREPARATION',
      avancementGlobalPct: 0,
      coutReelTotalMAD: 0,
      dateDebut: new Date().toISOString().split('T')[0],
      dateFinPrevue: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      notes: `Dupliqué depuis ${original.code} - ${original.nom}. ${original.notes || ''}`
    };

    this.chantiers.unshift(clone);

    // Dupliquer également les lots DQE associés
    const originalLots = this.lotsDQE.filter(l => l.chantierId === id);
    originalLots.forEach((lot, lIdx) => {
      const newLotId = `lot-${Date.now()}-${lIdx}`;
      const clonedTaches: TacheDQE[] = lot.taches.map((t, tIdx) => ({
        ...t,
        id: `t-${Date.now()}-${lIdx}-${tIdx}`,
        lotId: newLotId,
        quantiteRealisee: 0,
        avancementPct: 0
      }));

      this.lotsDQE.push({
        ...lot,
        id: newLotId,
        chantierId: newId,
        avancementPct: 0,
        taches: clonedTaches
      });
    });

    this.saveToStorage();
    return clone;
  }

  deleteChantier(id: string): boolean {
    const index = this.chantiers.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.chantiers.splice(index, 1);
    // Nettoyer les données liées
    this.lotsDQE = this.lotsDQE.filter(l => l.chantierId !== id);
    this.depenses = this.depenses.filter(d => d.chantierId !== id);
    this.bonsLivraison = this.bonsLivraison.filter(bl => bl.chantierId !== id);
    this.journaux = this.journaux.filter(j => j.chantierId !== id);
    this.decomptes = this.decomptes.filter(dec => dec.chantierId !== id);

    this.saveToStorage();
    return true;
  }

  // ==========================================
  // 2. LOTS & TÂCHES DQE : CRUD + DUPLIQUER
  // ==========================================

  recalculateChantierAvancement(chantierId: string) {
    const lots = this.lotsDQE.filter(l => l.chantierId === chantierId);
    if (!lots.length) return;
    const totalBudget = lots.reduce((sum, l) => sum + l.budgetLotMAD, 0);
    if (totalBudget <= 0) return;

    let weightedAvancement = 0;
    lots.forEach(l => {
      weightedAvancement += (l.budgetLotMAD * l.avancementPct);
    });

    const globalPct = Math.min(100, Math.round(weightedAvancement / totalBudget));
    this.updateChantier(chantierId, { avancementGlobalPct: globalPct });
  }

  addLotDQE(chantierId: string, titre: string, ordre?: number): LotDQE {
    const existing = this.lotsDQE.filter(l => l.chantierId === chantierId);
    const newLot: LotDQE = {
      id: `lot-${Date.now()}-${existing.length + 1}`,
      chantierId,
      titre,
      ordre: ordre || existing.length + 1,
      budgetLotMAD: 0,
      avancementPct: 0,
      taches: []
    };
    this.lotsDQE.push(newLot);
    this.saveToStorage();
    return newLot;
  }

  updateLotDQE(lotId: string, updates: Partial<LotDQE>) {
    this.lotsDQE = this.lotsDQE.map(l => l.id === lotId ? { ...l, ...updates } : l);
    const lot = this.lotsDQE.find(l => l.id === lotId);
    if (lot) this.recalculateChantierAvancement(lot.chantierId);
    this.saveToStorage();
  }

  duplicateLotDQE(lotId: string): LotDQE | null {
    const original = this.lotsDQE.find(l => l.id === lotId);
    if (!original) return null;

    const newLotId = `lot-${Date.now()}`;
    const clonedTaches: TacheDQE[] = original.taches.map((t, idx) => ({
      ...t,
      id: `t-${Date.now()}-${idx}`,
      lotId: newLotId,
      quantiteRealisee: 0,
      avancementPct: 0
    }));

    const clonedLot: LotDQE = {
      ...original,
      id: newLotId,
      titre: `[Copie] ${original.titre}`,
      ordre: original.ordre + 1,
      avancementPct: 0,
      taches: clonedTaches
    };

    this.lotsDQE.push(clonedLot);
    this.recalculateChantierAvancement(original.chantierId);
    this.saveToStorage();
    return clonedLot;
  }

  deleteLotDQE(lotId: string): boolean {
    const lot = this.lotsDQE.find(l => l.id === lotId);
    if (!lot) return false;
    const chantierId = lot.chantierId;

    this.lotsDQE = this.lotsDQE.filter(l => l.id !== lotId);
    this.recalculateChantierAvancement(chantierId);
    this.saveToStorage();
    return true;
  }

  addTacheDQE(lotId: string, tache: Omit<TacheDQE, 'id' | 'lotId' | 'totalHT' | 'quantiteRealisee' | 'avancementPct'>): TacheDQE | null {
    const lot = this.lotsDQE.find(l => l.id === lotId);
    if (!lot) return null;

    const totalHT = (tache.quantitePrevue || 1) * (tache.prixUnitaireHT || 0);
    const newTache: TacheDQE = {
      ...tache,
      id: `t-${Date.now()}-${lot.taches.length + 1}`,
      lotId,
      totalHT,
      quantiteRealisee: 0,
      avancementPct: 0
    };

    lot.taches.push(newTache);
    lot.budgetLotMAD = lot.taches.reduce((s, t) => s + t.totalHT, 0);
    this.recalculateChantierAvancement(lot.chantierId);
    this.saveToStorage();
    return newTache;
  }

  updateTacheDQE(lotId: string, tacheId: string, updates: Partial<TacheDQE>) {
    const lot = this.lotsDQE.find(l => l.id === lotId);
    if (!lot) return;

    lot.taches = lot.taches.map(t => {
      if (t.id === tacheId) {
        const merged = { ...t, ...updates };
        merged.totalHT = (merged.quantitePrevue || 1) * (merged.prixUnitaireHT || 0);
        merged.avancementPct = Math.min(100, Math.round(((merged.quantiteRealisee || 0) / (merged.quantitePrevue || 1)) * 100));
        return merged;
      }
      return t;
    });

    lot.budgetLotMAD = lot.taches.reduce((s, t) => s + t.totalHT, 0);

    const totalTachesHT = lot.budgetLotMAD;
    if (totalTachesHT > 0) {
      let lotProg = 0;
      lot.taches.forEach(t => {
        lotProg += (t.totalHT * (t.avancementPct / 100));
      });
      lot.avancementPct = Math.min(100, Math.round((lotProg / totalTachesHT) * 100));
    }

    this.recalculateChantierAvancement(lot.chantierId);
    this.saveToStorage();
  }

  duplicateTacheDQE(lotId: string, tacheId: string): TacheDQE | null {
    const lot = this.lotsDQE.find(l => l.id === lotId);
    if (!lot) return null;
    const original = lot.taches.find(t => t.id === tacheId);
    if (!original) return null;

    const clone: TacheDQE = {
      ...original,
      id: `t-${Date.now()}-${lot.taches.length + 1}`,
      designation: `[Copie] ${original.designation}`,
      quantiteRealisee: 0,
      avancementPct: 0
    };

    lot.taches.push(clone);
    lot.budgetLotMAD = lot.taches.reduce((s, t) => s + t.totalHT, 0);
    this.recalculateChantierAvancement(lot.chantierId);
    this.saveToStorage();
    return clone;
  }

  deleteTacheDQE(lotId: string, tacheId: string): boolean {
    const lot = this.lotsDQE.find(l => l.id === lotId);
    if (!lot) return false;

    lot.taches = lot.taches.filter(t => t.id !== tacheId);
    lot.budgetLotMAD = lot.taches.reduce((s, t) => s + t.totalHT, 0);

    const totalTachesHT = lot.budgetLotMAD;
    if (totalTachesHT > 0) {
      let lotProg = 0;
      lot.taches.forEach(t => {
        lotProg += (t.totalHT * (t.avancementPct / 100));
      });
      lot.avancementPct = Math.min(100, Math.round((lotProg / totalTachesHT) * 100));
    } else {
      lot.avancementPct = 0;
    }

    this.recalculateChantierAvancement(lot.chantierId);
    this.saveToStorage();
    return true;
  }

  updateTacheAvancement(chantierId: string, lotId: string, tacheId: string, quantiteRealisee: number) {
    const lot = this.lotsDQE.find(l => l.id === lotId);
    if (!lot) return;

    const tache = lot.taches.find(t => t.id === tacheId);
    if (!tache) return;

    tache.quantiteRealisee = quantiteRealisee;
    tache.avancementPct = Math.min(100, Math.round((quantiteRealisee / (tache.quantitePrevue || 1)) * 100));

    const totalTachesHT = lot.taches.reduce((s, t) => s + t.totalHT, 0);
    if (totalTachesHT > 0) {
      let lotProg = 0;
      lot.taches.forEach(t => {
        lotProg += (t.totalHT * (t.avancementPct / 100));
      });
      lot.avancementPct = Math.min(100, Math.round((lotProg / totalTachesHT) * 100));
    }

    this.recalculateChantierAvancement(chantierId);
    this.saveToStorage();
  }

  // ==========================================
  // 3. DEVIS (DQE) : CRUD + DUPLIQUER
  // ==========================================

  addDevis(devis: Omit<Devis, 'id' | 'reference' | 'totalHT' | 'montantTva' | 'totalTTC'>) {
    const newId = 'dev-' + Date.now();
    const count = this.devis.length + 1;
    const reference = `DEV-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
    const totalHT = devis.items.reduce((s, it) => s + (it.quantite * it.prixUnitaireHT), 0);
    const tauxTva = devis.tauxTva || 20;
    const montantTva = Math.round(totalHT * (tauxTva / 100) * 100) / 100;
    const totalTTC = totalHT + montantTva;

    const nouveau: Devis = {
      ...devis,
      id: newId,
      reference,
      totalHT,
      tauxTva,
      montantTva,
      totalTTC
    };

    this.devis.unshift(nouveau);
    this.saveToStorage();
    return nouveau;
  }

  updateDevis(id: string, updates: Partial<Devis>) {
    this.devis = this.devis.map(d => {
      if (d.id === id) {
        const merged = { ...d, ...updates };
        if (updates.items) {
          merged.totalHT = merged.items.reduce((s, it) => s + (it.quantite * it.prixUnitaireHT), 0);
          merged.montantTva = Math.round(merged.totalHT * ((merged.tauxTva || 20) / 100) * 100) / 100;
          merged.totalTTC = merged.totalHT + merged.montantTva;
        }
        return merged;
      }
      return d;
    });
    this.saveToStorage();
  }

  duplicateDevis(id: string): Devis | null {
    const original = this.devis.find(d => d.id === id);
    if (!original) return null;

    const newId = 'dev-' + Date.now();
    const count = this.devis.length + 1;
    const reference = `DEV-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const clone: Devis = {
      ...original,
      id: newId,
      reference,
      objet: `[Copie] ${original.objet}`,
      statut: 'BROUILLON',
      chantierId: undefined,
      dateDevis: new Date().toISOString().split('T')[0],
      dateValidite: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      items: original.items.map((it, idx) => ({
        ...it,
        id: `item-${Date.now()}-${idx}`
      }))
    };

    this.devis.unshift(clone);
    this.saveToStorage();
    return clone;
  }

  deleteDevis(id: string): boolean {
    const index = this.devis.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.devis.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  convertirDevisEnChantier(devisId: string): Chantier | null {
    const d = this.devis.find(dev => dev.id === devisId);
    if (!d) return null;

    d.statut = 'CONVERTI_CHANTIER';

    const count = this.chantiers.length + 1;
    const code = `CH-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;
    const nouveauChantier: Chantier = {
      id: 'ch-' + Date.now(),
      code,
      nom: d.objet,
      maitreOuvrage: d.clientNom,
      telClient: d.clientTel,
      iceClient: d.clientIce,
      ville: d.clientVille || 'Casablanca',
      adresse: d.clientAdresse || '',
      typeTravaux: 'CLE_EN_MAIN',
      budgetTotalMAD: d.totalHT,
      coutReelTotalMAD: 0,
      avancementGlobalPct: 0,
      statut: 'EN_COURS',
      dateDebut: new Date().toISOString().split('T')[0],
      dateFinPrevue: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      chefChantierId: 'user-02',
      notes: `Chantier généré automatiquement depuis le Devis ${d.reference}.`
    };

    this.chantiers.unshift(nouveauChantier);
    d.chantierId = nouveauChantier.id;

    const lotMap = new Map<string, TacheDQE[]>();
    d.items.forEach((it, idx) => {
      const lotNom = it.lotNom || '01. Travaux Généraux';
      if (!lotMap.has(lotNom)) {
        lotMap.set(lotNom, []);
      }
      lotMap.get(lotNom)!.push({
        id: `t-${Date.now()}-${idx}`,
        lotId: '',
        designation: it.designation,
        unite: (it.unite as any) || 'U',
        quantitePrevue: it.quantite,
        prixUnitaireHT: it.prixUnitaireHT,
        totalHT: it.totalHT,
        quantiteRealisee: 0,
        avancementPct: 0
      });
    });

    let ordre = 1;
    lotMap.forEach((taches, lotTitre) => {
      const lotId = `lot-${Date.now()}-${ordre}`;
      const budgetLot = taches.reduce((s, t) => s + t.totalHT, 0);
      taches.forEach(t => t.lotId = lotId);

      this.lotsDQE.push({
        id: lotId,
        chantierId: nouveauChantier.id,
        titre: lotTitre,
        ordre: ordre++,
        budgetLotMAD: budgetLot,
        avancementPct: 0,
        taches
      });
    });

    this.saveToStorage();
    return nouveauChantier;
  }

  // ==========================================
  // 4. DÉCOMPTES : CRUD + DUPLIQUER
  // ==========================================

  creerDecompte(chantierId: string, pourcentageCumule: number, periodeDebut: string, periodeFin: string) {
    const ch = this.chantiers.find(c => c.id === chantierId);
    if (!ch) return null;

    const existants = this.decomptes.filter(d => d.chantierId === chantierId);
    const numero = `DEC-${String(existants.length + 1).padStart(2, '0')}-${ch.code}`;
    const dernierCumuleHT = existants.length > 0 ? existants[existants.length - 1].montantCumuleHT : 0;

    const montantCumuleHT = Math.round(ch.budgetTotalMAD * (pourcentageCumule / 100) * 100) / 100;
    const montantPeriodeHT = Math.max(0, montantCumuleHT - dernierCumuleHT);
    const retenueGarantie10Pct = Math.round(montantPeriodeHT * 0.10 * 100) / 100;
    const netAPayerHT = montantPeriodeHT - retenueGarantie10Pct;
    const tva = Math.round(netAPayerHT * 0.20 * 100) / 100;
    const montantTTC = netAPayerHT + tva;

    const nouveau: Decompte = {
      id: 'dec-' + Date.now(),
      numero,
      chantierId,
      dateDecompte: new Date().toISOString().split('T')[0],
      periodeDebut,
      periodeFin,
      pourcentageCumule,
      montantPrecedentHT: dernierCumuleHT,
      montantPeriodeHT,
      montantCumuleHT,
      retenueGarantie10Pct,
      netAPayerHT,
      tva,
      montantTTC,
      statut: 'EMIS'
    };

    this.decomptes.unshift(nouveau);
    this.saveToStorage();
    return nouveau;
  }

  updateDecompte(id: string, updates: Partial<Decompte>) {
    this.decomptes = this.decomptes.map(d => d.id === id ? { ...d, ...updates } : d);
    this.saveToStorage();
  }

  duplicateDecompte(id: string): Decompte | null {
    const orig = this.decomptes.find(d => d.id === id);
    if (!orig) return null;

    const count = this.decomptes.filter(d => d.chantierId === orig.chantierId).length + 1;
    const clone: Decompte = {
      ...orig,
      id: 'dec-' + Date.now(),
      numero: `${orig.numero}-BIS`,
      dateDecompte: new Date().toISOString().split('T')[0],
      statut: 'EMIS'
    };

    this.decomptes.unshift(clone);
    this.saveToStorage();
    return clone;
  }

  deleteDecompte(id: string): boolean {
    const index = this.decomptes.findIndex(d => d.id === id);
    if (index === -1) return false;
    this.decomptes.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // ==========================================
  // 5. MATÉRIAUX & FOURNISSEURS : CRUD + DUPLIQUER
  // ==========================================

  addMateriau(mat: Omit<Materiau, 'id'>) {
    const nouveau: Materiau = {
      ...mat,
      id: 'mat-' + Date.now()
    };
    this.materiaux.unshift(nouveau);
    this.saveToStorage();
    return nouveau;
  }

  updateMateriau(id: string, updates: Partial<Materiau>) {
    this.materiaux = this.materiaux.map(m => m.id === id ? { ...m, ...updates } : m);
    this.saveToStorage();
  }

  duplicateMateriau(id: string): Materiau | null {
    const orig = this.materiaux.find(m => m.id === id);
    if (!orig) return null;

    const clone: Materiau = {
      ...orig,
      id: 'mat-' + Date.now(),
      code: `${orig.code}-COPY`,
      designation: `[Copie] ${orig.designation}`
    };

    this.materiaux.unshift(clone);
    this.saveToStorage();
    return clone;
  }

  deleteMateriau(id: string): boolean {
    const index = this.materiaux.findIndex(m => m.id === id);
    if (index === -1) return false;
    this.materiaux.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  addFournisseur(f: Omit<Fournisseur, 'id'>) {
    const nouveau: Fournisseur = {
      ...f,
      id: 'fourn-' + Date.now()
    };
    this.fournisseurs.unshift(nouveau);
    this.saveToStorage();
    return nouveau;
  }

  updateFournisseur(id: string, updates: Partial<Fournisseur>) {
    this.fournisseurs = this.fournisseurs.map(f => f.id === id ? { ...f, ...updates } : f);
    this.saveToStorage();
  }

  duplicateFournisseur(id: string): Fournisseur | null {
    const orig = this.fournisseurs.find(f => f.id === id);
    if (!orig) return null;

    const clone: Fournisseur = {
      ...orig,
      id: 'fourn-' + Date.now(),
      nom: `[Copie] ${orig.nom}`
    };

    this.fournisseurs.unshift(clone);
    this.saveToStorage();
    return clone;
  }

  deleteFournisseur(id: string): boolean {
    const index = this.fournisseurs.findIndex(f => f.id === id);
    if (index === -1) return false;
    this.fournisseurs.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // ==========================================
  // 6. OUVRIERS & MAIN-D'ŒUVRE : CRUD + DUPLIQUER
  // ==========================================

  addOuvrier(ouv: Omit<Ouvrier, 'id' | 'matricule'>) {
    const matricule = `MAT-${new Date().getFullYear().toString().substring(2)}${String(this.ouvriers.length + 1).padStart(3, '0')}`;
    const nouveau: Ouvrier = {
      ...ouv,
      id: 'ouv-' + Date.now(),
      matricule
    };
    this.ouvriers.unshift(nouveau);
    this.saveToStorage();
    return nouveau;
  }

  updateOuvrier(id: string, updates: Partial<Ouvrier>) {
    this.ouvriers = this.ouvriers.map(o => o.id === id ? { ...o, ...updates } : o);
    this.saveToStorage();
  }

  duplicateOuvrier(id: string): Ouvrier | null {
    const orig = this.ouvriers.find(o => o.id === id);
    if (!orig) return null;

    const matricule = `MAT-${new Date().getFullYear().toString().substring(2)}${String(this.ouvriers.length + 1).padStart(3, '0')}`;
    const clone: Ouvrier = {
      ...orig,
      id: 'ouv-' + Date.now(),
      matricule,
      nom: `[Copie] ${orig.nom}`,
      cin: `${orig.cin}-BIS`
    };

    this.ouvriers.unshift(clone);
    this.saveToStorage();
    return clone;
  }

  deleteOuvrier(id: string): boolean {
    const index = this.ouvriers.findIndex(o => o.id === id);
    if (index === -1) return false;
    this.ouvriers.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // ==========================================
  // 7. BONS DE LIVRAISON & DÉPENSES : CRUD + DUPLIQUER
  // ==========================================

  enregistrerBonLivraison(bl: Omit<BonLivraison, 'id' | 'montantTotalHT' | 'montantTTC'>) {
    const totalHT = bl.items.reduce((s, it) => s + (it.quantite * it.prixUnitaireHT), 0);
    const totalTTC = Math.round(totalHT * 1.20 * 100) / 100;

    const nouveauBL: BonLivraison = {
      ...bl,
      id: 'bl-' + Date.now(),
      montantTotalHT: totalHT,
      montantTTC: totalTTC
    };

    this.bonsLivraison.unshift(nouveauBL);

    // Mettre à jour les stocks de matériaux
    bl.items.forEach(it => {
      const mat = this.materiaux.find(m => m.id === it.materiauId);
      if (mat) {
        mat.stockActuel += it.quantite;
      }
    });

    // Enregistrer automatiquement la dépense correspondante
    const fourn = this.fournisseurs.find(f => f.id === bl.fournisseurId);
    this.depenses.unshift({
      id: 'dep-' + Date.now(),
      chantierId: bl.chantierId,
      date: bl.dateLivraison,
      categorie: 'MATERIAUX',
      designation: `BL N° ${bl.numeroBL} (${fourn?.nom || 'Fournisseur'})`,
      montantHT: totalHT,
      montantTTC: totalTTC,
      fournisseurNom: fourn?.nom,
      payePar: 'Compte Chantier'
    });

    // Mettre à jour le coût réel du chantier
    const ch = this.chantiers.find(c => c.id === bl.chantierId);
    if (ch) {
      ch.coutReelTotalMAD += totalHT;
    }

    this.saveToStorage();
    return nouveauBL;
  }

  duplicateBonLivraison(id: string): BonLivraison | null {
    const orig = this.bonsLivraison.find(b => b.id === id);
    if (!orig) return null;

    return this.enregistrerBonLivraison({
      ...orig,
      numeroBL: `${orig.numeroBL}-BIS`,
      dateLivraison: new Date().toISOString().split('T')[0],
      items: orig.items.map(it => ({ ...it }))
    });
  }

  deleteBonLivraison(id: string): boolean {
    const index = this.bonsLivraison.findIndex(b => b.id === id);
    if (index === -1) return false;
    const bl = this.bonsLivraison[index];

    // Déduire des stocks
    bl.items.forEach(it => {
      const mat = this.materiaux.find(m => m.id === it.materiauId);
      if (mat) {
        mat.stockActuel = Math.max(0, mat.stockActuel - it.quantite);
      }
    });

    // Déduire du coût réel du chantier
    const ch = this.chantiers.find(c => c.id === bl.chantierId);
    if (ch) {
      ch.coutReelTotalMAD = Math.max(0, ch.coutReelTotalMAD - bl.montantTotalHT);
    }

    this.bonsLivraison.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  addDepense(dep: Omit<Depense, 'id' | 'montantTTC'>) {
    const montantTTC = Math.round(dep.montantHT * 1.20 * 100) / 100;
    const nouveau: Depense = {
      ...dep,
      id: 'dep-' + Date.now(),
      montantTTC
    };
    this.depenses.unshift(nouveau);

    const ch = this.chantiers.find(c => c.id === dep.chantierId);
    if (ch) {
      ch.coutReelTotalMAD += dep.montantHT;
    }

    this.saveToStorage();
    return nouveau;
  }

  updateDepense(id: string, updates: Partial<Depense>) {
    const old = this.depenses.find(d => d.id === id);
    if (!old) return;

    const diffHT = (updates.montantHT !== undefined) ? (updates.montantHT - old.montantHT) : 0;
    if (diffHT !== 0) {
      const ch = this.chantiers.find(c => c.id === old.chantierId);
      if (ch) ch.coutReelTotalMAD += diffHT;
    }

    this.depenses = this.depenses.map(d => {
      if (d.id === id) {
        const merged = { ...d, ...updates };
        if (updates.montantHT !== undefined) {
          merged.montantTTC = Math.round(merged.montantHT * 1.20 * 100) / 100;
        }
        return merged;
      }
      return d;
    });

    this.saveToStorage();
  }

  duplicateDepense(id: string): Depense | null {
    const orig = this.depenses.find(d => d.id === id);
    if (!orig) return null;

    return this.addDepense({
      chantierId: orig.chantierId,
      date: new Date().toISOString().split('T')[0],
      categorie: orig.categorie,
      designation: `[Copie] ${orig.designation}`,
      montantHT: orig.montantHT,
      fournisseurNom: orig.fournisseurNom,
      payePar: orig.payePar,
      pieceJointe: orig.pieceJointe
    });
  }

  deleteDepense(id: string): boolean {
    const index = this.depenses.findIndex(d => d.id === id);
    if (index === -1) return false;
    const dep = this.depenses[index];

    const ch = this.chantiers.find(c => c.id === dep.chantierId);
    if (ch) {
      ch.coutReelTotalMAD = Math.max(0, ch.coutReelTotalMAD - dep.montantHT);
    }

    this.depenses.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // ==========================================
  // 8. POINTAGES & ACOMPTES
  // ==========================================

  enregistrerPointage(pointage: Omit<Pointage, 'id'>) {
    const existantIndex = this.pointages.findIndex(
      p => p.ouvrierId === pointage.ouvrierId && 
           p.chantierId === pointage.chantierId && 
           p.datePointage === pointage.datePointage
    );

    if (existantIndex >= 0) {
      this.pointages[existantIndex] = { ...this.pointages[existantIndex], ...pointage };
    } else {
      this.pointages.push({
        ...pointage,
        id: 'pt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
      });
    }

    const ouv = this.ouvriers.find(o => o.id === pointage.ouvrierId);
    if (ouv && pointage.valeurPresence > 0) {
      const coutJournee = ouv.tarifJourMAD * pointage.valeurPresence;
      const ch = this.chantiers.find(c => c.id === pointage.chantierId);
      if (ch) {
        ch.coutReelTotalMAD += coutJournee;
      }
    }

    this.saveToStorage();
  }

  enregistrerAcompte(acompte: Omit<AcomptePaie, 'id'>) {
    const nouveau: AcomptePaie = {
      ...acompte,
      id: 'ac-' + Date.now()
    };
    this.acomptes.unshift(nouveau);
    this.saveToStorage();
    return nouveau;
  }

  // ==========================================
  // 9. JOURNAL DE CHANTIER : CRUD + DUPLIQUER
  // ==========================================

  ajouterRapportJournal(rapport: Omit<JournalChantier, 'id'>) {
    const nouveau: JournalChantier = {
      ...rapport,
      id: 'jc-' + Date.now()
    };
    this.journaux.unshift(nouveau);
    this.saveToStorage();
    return nouveau;
  }

  updateRapportJournal(id: string, updates: Partial<JournalChantier>) {
    this.journaux = this.journaux.map(j => j.id === id ? { ...j, ...updates } : j);
    this.saveToStorage();
  }

  duplicateRapportJournal(id: string): JournalChantier | null {
    const orig = this.journaux.find(j => j.id === id);
    if (!orig) return null;

    const clone: JournalChantier = {
      ...orig,
      id: 'jc-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      travauxExecutes: `[Reporté] ${orig.travauxExecutes}`,
      photos: orig.photos ? [...orig.photos] : []
    };

    this.journaux.unshift(clone);
    this.saveToStorage();
    return clone;
  }

  deleteRapportJournal(id: string): boolean {
    const index = this.journaux.findIndex(j => j.id === id);
    if (index === -1) return false;
    this.journaux.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // ==========================================
  // 10. MÉTRIQUES GLOBALES POUR DASHBOARD
  // ==========================================

  getExecutiveKPIs() {
    const caEngage = this.chantiers.reduce((s, c) => s + c.budgetTotalMAD, 0);
    const coutTotal = this.chantiers.reduce((s, c) => s + c.coutReelTotalMAD, 0);
    const margeNetteMAD = caEngage - coutTotal;
    const margeNettePct = caEngage > 0 ? Math.round((margeNetteMAD / caEngage) * 1000) / 10 : 0;
    const chantiersActifs = this.chantiers.filter(c => c.statut === 'EN_COURS').length;
    const alertesStock = this.materiaux.filter(m => m.stockActuel <= m.stockMinimum).length;

    const currentMonth = new Date().toISOString().substring(0, 7);
    const depensesMois = this.depenses
      .filter(d => d.date.startsWith(currentMonth))
      .reduce((s, d) => s + d.montantHT, 0);

    const decomptesImpayes = this.decomptes.filter(d => d.statut === 'EMIS' || d.statut === 'VALIDE');
    const montantImpayeMAD = decomptesImpayes.reduce((s, d) => s + d.montantTTC, 0);

    return {
      caEngage,
      coutTotal,
      margeNetteMAD,
      margeNettePct,
      chantiersActifs,
      depensesMois,
      alertesStock,
      decomptesImpayesCount: decomptesImpayes.length,
      montantImpayeMAD
    };
  }
}

export const store = new DataStore();
