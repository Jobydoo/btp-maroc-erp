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

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_PREFIX + 'company', JSON.stringify(this.company));
      localStorage.setItem(STORAGE_PREFIX + 'chantiers', JSON.stringify(this.chantiers));
      localStorage.setItem(STORAGE_PREFIX + 'lotsDQE', JSON.stringify(this.lotsDQE));
      localStorage.setItem(STORAGE_PREFIX + 'devis', JSON.stringify(this.devis));
      localStorage.setItem(STORAGE_PREFIX + 'decomptes', JSON.stringify(this.decomptes));
      localStorage.setItem(STORAGE_PREFIX + 'materiaux', JSON.stringify(this.materiaux));
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

  // --- Actions ---

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

  // Chantiers CRUD
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

  updateTacheAvancement(chantierId: string, lotId: string, tacheId: string, quantiteRealisee: number) {
    const lot = this.lotsDQE.find(l => l.id === lotId);
    if (!lot) return;

    const tache = lot.taches.find(t => t.id === tacheId);
    if (!tache) return;

    tache.quantiteRealisee = quantiteRealisee;
    tache.avancementPct = Math.min(100, Math.round((quantiteRealisee / (tache.quantitePrevue || 1)) * 100));

    // Recalculer l'avancement du lot
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

  // Devis & Conversion
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

  convertirDevisEnChantier(devisId: string): Chantier | null {
    const d = this.devis.find(dev => dev.id === devisId);
    if (!d) return null;

    // 1. Marquer le devis comme CONVERTI_CHANTIER
    d.statut = 'CONVERTI_CHANTIER';

    // 2. Créer le nouveau Chantier
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

    // 3. Regrouper les items du devis par lot et créer les LotsDQE et TachesDQE
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

  // Décomptes d'avancement
  creerDecompte(chantierId: string, pourcentageCumule: number, periodeDebut: string, periodeFin: string) {
    const ch = this.chantiers.find(c => c.id === chantierId);
    if (!ch) return null;

    const existants = this.decomptes.filter(d => d.chantierId === chantierId);
    const numero = `DEC-${String(existants.length + 1).padStart(2, '0')}-${ch.code}`;
    const dernierCumuleHT = existants.length > 0 ? existants[existants.length - 1].montantCumuleHT : 0;

    const montantCumuleHT = Math.round(ch.budgetTotalMAD * (pourcentageCumule / 100) * 100) / 100;
    const montantPeriodeHT = Math.max(0, montantCumuleHT - dernierCumuleHT);
    const retenueGarantie10Pct = Math.round(montantPeriodeHT * 0.10 * 100) / 100; // 10% retenue légale BTP Maroc
    const netAPayerHT = montantPeriodeHT - retenueGarantie10Pct;
    const tva = Math.round(netAPayerHT * 0.20 * 100) / 100; // 20% TVA
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

  // Bons de Livraison & Stocks
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

  // Pointages & Paie
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

    // Calcul et répercussion sur les coûts MO du chantier
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

  // Journal de Chantier
  ajouterRapportJournal(rapport: Omit<JournalChantier, 'id'>) {
    const nouveau: JournalChantier = {
      ...rapport,
      id: 'jc-' + Date.now()
    };
    this.journaux.unshift(nouveau);
    this.saveToStorage();
    return nouveau;
  }

  // Métriques globales pour Dashboard
  getExecutiveKPIs() {
    const caEngage = this.chantiers.reduce((s, c) => s + c.budgetTotalMAD, 0);
    const coutTotal = this.chantiers.reduce((s, c) => s + c.coutReelTotalMAD, 0);
    const margeNetteMAD = caEngage - coutTotal;
    const margeNettePct = caEngage > 0 ? Math.round((margeNetteMAD / caEngage) * 1000) / 10 : 0;
    const chantiersActifs = this.chantiers.filter(c => c.statut === 'EN_COURS').length;
    const alertesStock = this.materiaux.filter(m => m.stockActuel <= m.stockMinimum).length;

    // Calcul des dépenses du mois en cours
    const currentMonth = new Date().toISOString().substring(0, 7);
    const depensesMois = this.depenses
      .filter(d => d.date.startsWith(currentMonth))
      .reduce((s, d) => s + d.montantHT, 0);

    // Décomptes en attente de paiement
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
