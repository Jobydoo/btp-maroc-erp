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
  Role,
  Client,
  Article,
  StockMouvement,
  CommandeClient,
  BonLivraisonVente,
  FactureVente,
  FactureAvoirClient,
  DevisFournisseur,
  CommandeFournisseur,
  BonReception,
  FactureAchat,
  FactureAvoirFournisseur,
  Reglement,
  ScannerFactureResult,
  EtatSituationData,
  CategorieMateriau
} from './types';

import {
  INITIAL_COMPANIES,
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
  INITIAL_JOURNAUX,
  INITIAL_CLIENTS,
  INITIAL_COMMANDES_CLIENT,
  INITIAL_LIVRAISONS_VENTE,
  INITIAL_FACTURES_VENTE,
  INITIAL_FACTURES_AVOIR_CLIENT,
  INITIAL_DEVIS_FOURNISSEUR,
  INITIAL_COMMANDES_FOURNISSEUR,
  INITIAL_BONS_RECEPTION,
  INITIAL_FACTURES_ACHAT,
  INITIAL_FACTURES_AVOIR_FOURNISSEUR,
  INITIAL_REGLEMENTS,
  INITIAL_STOCK_MOUVEMENTS
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
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('fr-MA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

// Local storage key constants
const STORAGE_PREFIX = 'erp_btp_maroc_';

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(STORAGE_PREFIX + key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    console.warn(`Erreur lecture storage ${key}:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Erreur écriture storage ${key}:`, e);
  }
}

export class DataStore {
  // Multi-companies state
  companies: CompanySettings[] = INITIAL_COMPANIES;
  activeSocieteId: string = INITIAL_COMPANY.id;

  // Active Company alias for single-tenant UI compatibility
  get company(): CompanySettings & { nom: string } {
    const soc = this.companies.find(c => c.id === this.activeSocieteId) || this.companies[0] || INITIAL_COMPANY;
    return {
      ...soc,
      nom: soc.nom || soc.raisonSociale
    };
  }

  // Auth & Roles
  users: User[] = INITIAL_USERS;
  currentUser: User = INITIAL_USERS[0];

  // Core entities
  clients: Client[] = INITIAL_CLIENTS;
  fournisseurs: Fournisseur[] = INITIAL_FOURNISSEURS;
  materiaux: Materiau[] = INITIAL_MATERIAUX; // Catalogue Articles
  stockMouvements: StockMouvement[] = INITIAL_STOCK_MOUVEMENTS;

  // Ventes (Sales cycle)
  devis: Devis[] = INITIAL_DEVIS;
  commandesClient: CommandeClient[] = INITIAL_COMMANDES_CLIENT;
  livraisonsVente: BonLivraisonVente[] = INITIAL_LIVRAISONS_VENTE;
  facturesVente: FactureVente[] = INITIAL_FACTURES_VENTE;
  avoirsClient: FactureAvoirClient[] = INITIAL_FACTURES_AVOIR_CLIENT;

  // Achats (Purchase cycle)
  devisFournisseur: DevisFournisseur[] = INITIAL_DEVIS_FOURNISSEUR;
  commandesFournisseur: CommandeFournisseur[] = INITIAL_COMMANDES_FOURNISSEUR;
  bonsReception: BonReception[] = INITIAL_BONS_RECEPTION;
  facturesAchat: FactureAchat[] = INITIAL_FACTURES_ACHAT;
  avoirsFournisseur: FactureAvoirFournisseur[] = INITIAL_FACTURES_AVOIR_FOURNISSEUR;

  // Trésorerie
  reglements: Reglement[] = INITIAL_REGLEMENTS;

  // Chantiers & Terrain
  chantiers: Chantier[] = INITIAL_CHANTIERS;
  lotsDQE: LotDQE[] = INITIAL_LOTS_DQE;
  decomptes: Decompte[] = INITIAL_DECOMPTES;
  ouvriers: Ouvrier[] = INITIAL_OUVRIERS;
  pointages: Pointage[] = INITIAL_POINTAGES;
  acomptes: AcomptePaie[] = INITIAL_ACOMPTES;
  journaux: JournalChantier[] = INITIAL_JOURNAUX;
  depenses: Depense[] = INITIAL_DEPENSES;
  bonsLivraison: BonLivraison[] = INITIAL_BONS_LIVRAISON;

  private listeners: (() => void)[] = [];

  constructor() {
    this.loadState();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.saveState();
    this.listeners.forEach(l => l());
  }

  private loadState() {
    if (typeof window === 'undefined') return;

    this.companies = getStored('companies', INITIAL_COMPANIES);
    this.activeSocieteId = getStored('activeSocieteId', INITIAL_COMPANY.id);
    this.users = getStored('users', INITIAL_USERS);
    this.currentUser = getStored('currentUser', INITIAL_USERS[0]);

    this.clients = getStored('clients', INITIAL_CLIENTS);
    this.fournisseurs = getStored('fournisseurs', INITIAL_FOURNISSEURS);
    this.materiaux = getStored('materiaux', INITIAL_MATERIAUX);
    this.stockMouvements = getStored('stockMouvements', INITIAL_STOCK_MOUVEMENTS);

    this.devis = getStored('devis', INITIAL_DEVIS);
    this.commandesClient = getStored('commandesClient', INITIAL_COMMANDES_CLIENT);
    this.livraisonsVente = getStored('livraisonsVente', INITIAL_LIVRAISONS_VENTE);
    this.facturesVente = getStored('facturesVente', INITIAL_FACTURES_VENTE);
    this.avoirsClient = getStored('avoirsClient', INITIAL_FACTURES_AVOIR_CLIENT);

    this.devisFournisseur = getStored('devisFournisseur', INITIAL_DEVIS_FOURNISSEUR);
    this.commandesFournisseur = getStored('commandesFournisseur', INITIAL_COMMANDES_FOURNISSEUR);
    this.bonsReception = getStored('bonsReception', INITIAL_BONS_RECEPTION);
    this.facturesAchat = getStored('facturesAchat', INITIAL_FACTURES_ACHAT);
    this.avoirsFournisseur = getStored('avoirsFournisseur', INITIAL_FACTURES_AVOIR_FOURNISSEUR);

    this.reglements = getStored('reglements', INITIAL_REGLEMENTS);

    this.chantiers = getStored('chantiers', INITIAL_CHANTIERS);
    this.lotsDQE = getStored('lotsDQE', INITIAL_LOTS_DQE);
    this.decomptes = getStored('decomptes', INITIAL_DECOMPTES);
    this.ouvriers = getStored('ouvriers', INITIAL_OUVRIERS);
    this.pointages = getStored('pointages', INITIAL_POINTAGES);
    this.acomptes = getStored('acomptes', INITIAL_ACOMPTES);
    this.journaux = getStored('journaux', INITIAL_JOURNAUX);
    this.depenses = getStored('depenses', INITIAL_DEPENSES);
    this.bonsLivraison = getStored('bonsLivraison', INITIAL_BONS_LIVRAISON);
  }

  private saveState() {
    if (typeof window === 'undefined') return;

    setStored('companies', this.companies);
    setStored('activeSocieteId', this.activeSocieteId);
    setStored('users', this.users);
    setStored('currentUser', this.currentUser);

    setStored('clients', this.clients);
    setStored('fournisseurs', this.fournisseurs);
    setStored('materiaux', this.materiaux);
    setStored('stockMouvements', this.stockMouvements);

    setStored('devis', this.devis);
    setStored('commandesClient', this.commandesClient);
    setStored('livraisonsVente', this.livraisonsVente);
    setStored('facturesVente', this.facturesVente);
    setStored('avoirsClient', this.avoirsClient);

    setStored('devisFournisseur', this.devisFournisseur);
    setStored('commandesFournisseur', this.commandesFournisseur);
    setStored('bonsReception', this.bonsReception);
    setStored('facturesAchat', this.facturesAchat);
    setStored('avoirsFournisseur', this.avoirsFournisseur);

    setStored('reglements', this.reglements);

    setStored('chantiers', this.chantiers);
    setStored('lotsDQE', this.lotsDQE);
    setStored('decomptes', this.decomptes);
    setStored('ouvriers', this.ouvriers);
    setStored('pointages', this.pointages);
    setStored('acomptes', this.acomptes);
    setStored('journaux', this.journaux);
    setStored('depenses', this.depenses);
    setStored('bonsLivraison', this.bonsLivraison);
  }

  // ==========================================
  // MULTI-SOCIÉTÉS
  // ==========================================
  get societes(): CompanySettings[] {
    return this.companies;
  }

  setActiveCompany(societeId: string) {
    const soc = this.companies.find(c => c.id === societeId);
    if (!soc) return;
    this.activeSocieteId = societeId;
    this.notify();
  }

  switchActiveCompany() {
    const other = this.companies.find(c => c.id !== this.activeSocieteId);
    if (other) {
      this.setActiveCompany(other.id);
    }
  }

  switchSociete(societeId?: string) {
    if (societeId) {
      this.setActiveCompany(societeId);
    } else {
      this.switchActiveCompany();
    }
  }

  updateCompany(id: string, data: Partial<CompanySettings>) {
    this.companies = this.companies.map(c => c.id === id ? { ...c, ...data } : c);
    this.notify();
  }

  updateCompanySettings(data: Partial<CompanySettings>) {
    this.updateCompany(this.activeSocieteId, data);
  }

  // ==========================================
  // RÔLES & UTILISATEURS
  // ==========================================
  setCurrentUser(user: User) {
    this.currentUser = user;
    this.notify();
  }

  setCurrentRole(role: Role) {
    const u = this.users.find(usr => usr.role === role);
    if (u) {
      this.currentUser = u;
    } else {
      this.currentUser = { ...this.currentUser, role };
    }
    this.notify();
  }

  switchRole(role: Role) {
    this.setCurrentRole(role);
  }

  hasRole(allowedRoles: Role[]): boolean {
    return allowedRoles.includes(this.currentUser.role);
  }

  // Scoped getters for active company
  getActiveClients(): Client[] {
    return this.clients.filter(c => !c.societeId || c.societeId === this.activeSocieteId);
  }

  getActiveFournisseurs(): Fournisseur[] {
    return this.fournisseurs.filter(f => !f.societeId || f.societeId === this.activeSocieteId);
  }

  getActiveArticles(): Materiau[] {
    return this.materiaux.filter(m => !m.societeId || m.societeId === this.activeSocieteId);
  }

  getActiveChantiers(): Chantier[] {
    return this.chantiers.filter(c => !c.societeId || c.societeId === this.activeSocieteId);
  }

  getActiveDevis(): Devis[] {
    return this.devis.filter(d => !d.societeId || d.societeId === this.activeSocieteId);
  }

  getActiveCommandesClient(): CommandeClient[] {
    return this.commandesClient.filter(c => !c.societeId || c.societeId === this.activeSocieteId);
  }

  getActiveLivraisonsVente(): BonLivraisonVente[] {
    return this.livraisonsVente.filter(l => !l.societeId || l.societeId === this.activeSocieteId);
  }

  getActiveFacturesVente(): FactureVente[] {
    return this.facturesVente.filter(f => !f.societeId || f.societeId === this.activeSocieteId);
  }

  getActiveFacturesAchat(): FactureAchat[] {
    return this.facturesAchat.filter(f => !f.societeId || f.societeId === this.activeSocieteId);
  }

  getActiveReglements(): Reglement[] {
    return this.reglements.filter(r => !r.societeId || r.societeId === this.activeSocieteId);
  }

  saveToStorage() {
    this.saveState();
  }

  // Active items properties
  get clientsActifs(): Client[] {
    return this.getActiveClients();
  }

  get fournisseursActifs(): Fournisseur[] {
    return this.getActiveFournisseurs();
  }

  get articlesActifs(): Materiau[] {
    return this.getActiveArticles();
  }

  get materiauxActifs(): Materiau[] {
    return this.getActiveArticles();
  }

  get valeurStockTotalMAD(): number {
    return this.getActiveArticles().reduce((sum, a) => sum + (a.stockActuel * a.prixUnitaireMoyenMAD), 0);
  }

  get alertesStockCount(): number {
    return this.getActiveArticles().filter(a => a.stockActuel <= (a.stockMinimum || a.seuilAlerte || 0)).length;
  }

  get chiffreAffairesTotal(): number {
    return this.getActiveFacturesVente().reduce((sum, f) => sum + f.totalTTC, 0);
  }

  get encoursClientARecouvrer(): number {
    return this.getActiveClients().reduce((sum, c) => sum + (c.soldeEncoursMAD || 0), 0);
  }

  get devisEnCoursTotal(): number {
    return this.getActiveDevis().filter(d => d.statut === 'EN_ATTENTE' || d.statut === 'BROUILLON').reduce((sum, d) => sum + d.totalTTC, 0);
  }

  get chantiersActifs(): Chantier[] {
    return this.getActiveChantiers();
  }

  get devisActifs(): Devis[] {
    return this.getActiveDevis();
  }

  get commandesClientActives(): CommandeClient[] {
    return this.getActiveCommandesClient();
  }

  get livraisonsVenteActives(): BonLivraisonVente[] {
    return this.getActiveLivraisonsVente();
  }

  get facturesVenteActives(): FactureVente[] {
    return this.getActiveFacturesVente();
  }

  get facturesAvoirClientActives(): FactureAvoirClient[] {
    return this.avoirsClient.filter(a => !a.societeId || a.societeId === this.activeSocieteId);
  }

  get devisFournisseurActifs(): DevisFournisseur[] {
    return this.devisFournisseur.filter(d => !d.societeId || d.societeId === this.activeSocieteId);
  }

  get commandesFournisseurActives(): CommandeFournisseur[] {
    return this.commandesFournisseur.filter(c => !c.societeId || c.societeId === this.activeSocieteId);
  }

  get bonsReceptionActifs(): BonReception[] {
    return this.bonsReception.filter(b => !b.societeId || b.societeId === this.activeSocieteId);
  }

  get facturesAchatActives(): FactureAchat[] {
    return this.getActiveFacturesAchat();
  }

  get facturesAvoirFournisseurActives(): FactureAvoirFournisseur[] {
    return this.avoirsFournisseur.filter(a => !a.societeId || a.societeId === this.activeSocieteId);
  }

  get reglementsActifs(): Reglement[] {
    return this.getActiveReglements();
  }

  get stockMouvementsActifs(): StockMouvement[] {
    return this.stockMouvements.filter(m => !m.societeId || m.societeId === this.activeSocieteId);
  }

  get facturesAvoirFournisseur(): FactureAvoirFournisseur[] {
    return this.avoirsFournisseur;
  }
  set facturesAvoirFournisseur(val: FactureAvoirFournisseur[]) {
    this.avoirsFournisseur = val;
    this.notify();
  }

  get facturesAvoirClient(): FactureAvoirClient[] {
    return this.avoirsClient;
  }
  set facturesAvoirClient(val: FactureAvoirClient[]) {
    this.avoirsClient = val;
    this.notify();
  }

  creerAvoirClient(factureId: string, motif: string, montantHT?: number): FactureAvoirClient {
    return this.creerAvoirVente(factureId, motif, montantHT);
  }

  creerAvoirFournisseur(factureAchatId: string, motif: string, montantHT?: number): FactureAvoirFournisseur {
    const fa = this.facturesAchat.find(f => f.id === factureAchatId);
    if (!fa) throw new Error('Facture achat introuvable');

    const count = this.avoirsFournisseur.length + 1;
    const ref = `AVF-2026-${String(count).padStart(4, '0')}`;
    const ht = montantHT || fa.totalHT;
    const tva = ht * (fa.tauxTva / 100);
    const ttc = ht + tva;

    const newAvoir: FactureAvoirFournisseur = {
      id: 'avf-' + Date.now().toString(36),
      societeId: fa.societeId || this.activeSocieteId,
      numeroAvoir: ref,
      factureAchatOrigineId: fa.id,
      factureOrigineId: fa.id,
      factureOrigineNumero: fa.numeroFacture,
      fournisseurId: fa.fournisseurId,
      fournisseurNom: fa.fournisseurNom,
      dateAvoir: new Date().toISOString().split('T')[0],
      motif,
      totalHT: ht,
      tauxTva: fa.tauxTva,
      montantTva: tva,
      totalTTC: ttc,
      statut: 'VALIDE'
    };

    fa.soldeDu = Math.max(0, fa.soldeDu - ttc);
    if (fa.soldeDu <= 0.01) {
      fa.statut = 'PAYEE';
    }

    this.avoirsFournisseur.unshift(newAvoir);
    this.notify();
    return newAvoir;
  }

  // ==========================================
  // CLIENTS
  // ==========================================
  addClient(data: Omit<Client, 'id' | 'soldeEncoursMAD'>): Client {
    const count = this.clients.length + 1;
    const newClient: Client = {
      ...data,
      id: 'cli-' + Date.now().toString(36),
      societeId: data.societeId || this.activeSocieteId,
      codeClient: data.codeClient || `CL-${String(count).padStart(4, '0')}`,
      soldeEncoursMAD: 0
    };
    this.clients.unshift(newClient);
    this.notify();
    return newClient;
  }

  updateClient(id: string, data: Partial<Client>) {
    this.clients = this.clients.map(c => c.id === id ? { ...c, ...data } : c);
    this.notify();
  }

  duplicateClient(id: string): Client | undefined {
    const orig = this.clients.find(c => c.id === id);
    if (!orig) return undefined;
    const clone: Client = {
      ...orig,
      id: 'cli-' + Date.now().toString(36),
      codeClient: orig.codeClient + '-COP',
      nom: orig.nom + ' (Copie)',
      soldeEncoursMAD: 0
    };
    this.clients.unshift(clone);
    this.notify();
    return clone;
  }

  deleteClient(id: string): boolean {
    this.clients = this.clients.filter(c => c.id !== id);
    this.notify();
    return true;
  }

  // Recalculer l'encours réel d'un client à partir de ses factures impayées
  recalculerSoldeClient(clientId: string) {
    const totalImpaye = this.facturesVente
      .filter(f => f.clientId === clientId && f.statut !== 'ANNULEE')
      .reduce((s, f) => s + (f.soldeDu || 0), 0);

    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      client.soldeEncoursMAD = totalImpaye;
    }
  }

  // ==========================================
  // FOURNISSEURS
  // ==========================================
  addFournisseur(data: Omit<Fournisseur, 'id'>): Fournisseur {
    const newFournisseur: Fournisseur = {
      ...data,
      id: 'fourn-' + Date.now().toString(36),
      societeId: data.societeId || this.activeSocieteId
    };
    this.fournisseurs.unshift(newFournisseur);
    this.notify();
    return newFournisseur;
  }

  updateFournisseur(id: string, data: Partial<Fournisseur>) {
    this.fournisseurs = this.fournisseurs.map(f => f.id === id ? { ...f, ...data } : f);
    this.notify();
  }

  duplicateFournisseur(id: string): Fournisseur | undefined {
    const orig = this.fournisseurs.find(f => f.id === id);
    if (!orig) return undefined;
    const clone: Fournisseur = {
      ...orig,
      id: 'fourn-' + Date.now().toString(36),
      nom: orig.nom + ' (Copie)'
    };
    this.fournisseurs.unshift(clone);
    this.notify();
    return clone;
  }

  deleteFournisseur(id: string): boolean {
    this.fournisseurs = this.fournisseurs.filter(f => f.id !== id);
    this.notify();
    return true;
  }

  // ==========================================
  // CATALOGUE ARTICLES & MATÉRIAUX
  // ==========================================
  addMateriau(data: Omit<Materiau, 'id'>): Materiau {
    const newMat: Materiau = {
      ...data,
      id: 'mat-' + Date.now().toString(36),
      societeId: data.societeId || this.activeSocieteId
    };
    this.materiaux.unshift(newMat);
    this.notify();
    return newMat;
  }

  updateMateriau(id: string, data: Partial<Materiau>) {
    this.materiaux = this.materiaux.map(m => m.id === id ? { ...m, ...data } : m);
    this.notify();
  }

  duplicateMateriau(id: string): Materiau | undefined {
    const orig = this.materiaux.find(m => m.id === id);
    if (!orig) return undefined;
    const clone: Materiau = {
      ...orig,
      id: 'mat-' + Date.now().toString(36),
      code: orig.code + '-CPY',
      designation: orig.designation + ' (Copie)'
    };
    this.materiaux.unshift(clone);
    this.notify();
    return clone;
  }

  deleteMateriau(id: string): boolean {
    this.materiaux = this.materiaux.filter(m => m.id !== id);
    this.notify();
    return true;
  }

  // ==========================================
  // STOCKS & MOUVEMENTS
  // ==========================================
  enregistrerMouvementStock(data: Omit<StockMouvement, 'id'> & { coutTotalMAD?: number; coutUnitaireMAD?: number; prixUnitaireHT?: number; valeurTotaleHT?: number; materiauId?: string }): StockMouvement {
    const coutUnitaire = data.coutUnitaireMAD !== undefined ? data.coutUnitaireMAD : (data.prixUnitaireHT || 0);
    const coutTotal = data.coutTotalMAD !== undefined ? data.coutTotalMAD : (data.valeurTotaleHT !== undefined ? data.valeurTotaleHT : (data.quantite * coutUnitaire));
    const artId = data.articleId || data.materiauId || '';

    const newMvt: StockMouvement = {
      ...data,
      id: 'mvt-' + Date.now().toString(36),
      societeId: data.societeId || this.activeSocieteId,
      coutUnitaireMAD: coutUnitaire,
      coutTotalMAD: coutTotal,
      valeurTotaleHT: coutTotal,
      articleId: artId
    };

    const mat = this.materiaux.find(m => m.id === artId || m.designation === data.articleDesignation);
    if (mat) {
      if (data.type === 'ENTREE_ACHAT' || (data.type as any) === 'AJUSTEMENT_POSITIF') {
        mat.stockActuel += data.quantite;
      } else if (data.type === 'SORTIE_CHANTIER' || (data.type as any) === 'AJUSTEMENT_NEGATIF') {
        mat.stockActuel = Math.max(0, mat.stockActuel - data.quantite);
      }
    }

    if (data.type === 'SORTIE_CHANTIER' && data.chantierId) {
      const ch = this.chantiers.find(c => c.id === data.chantierId);
      if (ch) {
        ch.coutReelTotalMAD += (coutTotal * 1.20);
      }
    }

    this.stockMouvements.unshift(newMvt);
    this.notify();
    return newMvt;
  }

  // ==========================================
  // DEVIS (CYCLE DE VENTE DQE)
  // ==========================================
  addDevis(devis: Omit<Devis, 'id' | 'reference' | 'montantTva' | 'totalTTC' | 'totalHT' | 'statut'> & { totalHT?: number; tauxTva?: number; montantTva?: number; totalTTC?: number; statut?: Devis['statut'] }): Devis {
    const count = this.devis.length + 1;
    const ref = `DEV-2026-${String(count).padStart(4, '0')}`;
    const items = devis.items || [];
    const totalHT = devis.totalHT !== undefined ? devis.totalHT : items.reduce((s, it) => s + (it.totalHT || (it.quantite * it.prixUnitaireHT)), 0);
    const tauxTva = devis.tauxTva !== undefined ? devis.tauxTva : 20;
    const montantTva = totalHT * (tauxTva / 100);
    const totalTTC = totalHT + montantTva;

    const newDevis: Devis = {
      ...devis,
      id: 'dev-' + Date.now().toString(36),
      societeId: devis.societeId || this.activeSocieteId,
      reference: ref,
      totalHT,
      tauxTva,
      montantTva,
      totalTTC,
      statut: devis.statut || 'EN_ATTENTE'
    };

    this.devis.unshift(newDevis);
    this.notify();
    return newDevis;
  }

  updateDevis(id: string, data: Partial<Devis>) {
    this.devis = this.devis.map(d => {
      if (d.id === id) {
        const totalHT = data.totalHT !== undefined ? data.totalHT : d.totalHT;
        const tauxTva = data.tauxTva !== undefined ? data.tauxTva : d.tauxTva;
        const montantTva = totalHT * (tauxTva / 100);
        const totalTTC = totalHT + montantTva;
        return { ...d, ...data, totalHT, tauxTva, montantTva, totalTTC };
      }
      return d;
    });
    this.notify();
  }

  duplicateDevis(id: string): Devis | undefined {
    const orig = this.devis.find(d => d.id === id);
    if (!orig) return undefined;
    const count = this.devis.length + 1;
    const ref = `DEV-2026-${String(count).padStart(4, '0')}`;
    const clone: Devis = {
      ...orig,
      id: 'dev-' + Date.now().toString(36),
      reference: ref,
      objet: orig.objet + ' [Copie]',
      statut: 'BROUILLON',
      dateDevis: new Date().toISOString().split('T')[0]
    };
    this.devis.unshift(clone);
    this.notify();
    return clone;
  }

  deleteDevis(id: string): boolean {
    this.devis = this.devis.filter(d => d.id !== id);
    this.notify();
    return true;
  }

  convertirDevisEnCommande(devisId: string): CommandeClient {
    const dev = this.devis.find(d => d.id === devisId);
    if (!dev) throw new Error('Devis introuvable');

    const count = this.commandesClient.length + 1;
    const ref = `CC-2026-${String(count).padStart(4, '0')}`;

    const newCmd: CommandeClient = {
      id: 'cmd-' + Date.now().toString(36),
      societeId: dev.societeId || this.activeSocieteId,
      reference: ref,
      dateCommande: new Date().toISOString().split('T')[0],
      clientId: dev.clientId || 'cli-01',
      clientNom: dev.clientNom,
      clientIce: dev.clientIce,
      chantierId: dev.chantierId,
      devisId: dev.id,
      devisReference: dev.reference,
      items: dev.items.map(it => ({ ...it })),
      totalHT: dev.totalHT,
      tauxTva: dev.tauxTva,
      montantTva: dev.montantTva,
      totalTTC: dev.totalTTC,
      delaiLivraison: dev.delaiExecution || '30 jours',
      statut: 'CONFIRMEE',
      notes: `Généré à partir du devis ${dev.reference}`
    };

    dev.statut = 'CONVERTI_COMMANDE';
    dev.commandeId = newCmd.id;

    this.commandesClient.unshift(newCmd);
    this.notify();
    return newCmd;
  }

  // ==========================================
  // COMMANDES CLIENT
  // ==========================================
  addCommandeClient(cmd: Omit<CommandeClient, 'id' | 'reference' | 'montantTva' | 'totalTTC' | 'totalHT' | 'statut'> & { totalHT?: number; tauxTva?: number; montantTva?: number; totalTTC?: number; statut?: CommandeClient['statut'] }): CommandeClient {
    const count = this.commandesClient.length + 1;
    const ref = `CC-2026-${String(count).padStart(4, '0')}`;
    const items = cmd.items || [];
    const totalHT = cmd.totalHT !== undefined ? cmd.totalHT : items.reduce((s, it) => s + (it.totalHT || (it.quantite * it.prixUnitaireHT)), 0);
    const tauxTva = cmd.tauxTva !== undefined ? cmd.tauxTva : 20;
    const montantTva = totalHT * (tauxTva / 100);
    const totalTTC = totalHT + montantTva;

    const newCmd: CommandeClient = {
      ...cmd,
      id: 'cmd-' + Date.now().toString(36),
      societeId: cmd.societeId || this.activeSocieteId,
      reference: ref,
      totalHT,
      tauxTva,
      montantTva,
      totalTTC,
      statut: cmd.statut || 'CONFIRMEE'
    };

    this.commandesClient.unshift(newCmd);
    this.notify();
    return newCmd;
  }

  updateCommandeClient(id: string, data: Partial<CommandeClient>) {
    this.commandesClient = this.commandesClient.map(c => c.id === id ? { ...c, ...data } : c);
    this.notify();
  }

  duplicateCommandeClient(id: string): CommandeClient | undefined {
    const orig = this.commandesClient.find(c => c.id === id);
    if (!orig) return undefined;
    const count = this.commandesClient.length + 1;
    const clone: CommandeClient = {
      ...orig,
      id: 'cmd-' + Date.now().toString(36),
      reference: `CC-2026-${String(count).padStart(4, '0')}`,
      dateCommande: new Date().toISOString().split('T')[0],
      statut: 'CONFIRMEE'
    };
    this.commandesClient.unshift(clone);
    this.notify();
    return clone;
  }

  deleteCommandeClient(id: string): boolean {
    this.commandesClient = this.commandesClient.filter(c => c.id !== id);
    this.notify();
    return true;
  }

  convertirCommandeEnBL(commandeId: string): BonLivraisonVente {
    const cmd = this.commandesClient.find(c => c.id === commandeId);
    if (!cmd) throw new Error('Commande client introuvable');

    const count = this.livraisonsVente.length + 1;
    const ref = `BLV-2026-${String(count).padStart(4, '0')}`;

    const newBL: BonLivraisonVente = {
      id: 'blv-' + Date.now().toString(36),
      societeId: cmd.societeId || this.activeSocieteId,
      reference: ref,
      dateLivraison: new Date().toISOString().split('T')[0],
      clientId: cmd.clientId,
      clientNom: cmd.clientNom,
      clientIce: cmd.clientIce,
      chantierId: cmd.chantierId,
      commandeId: cmd.id,
      commandeReference: cmd.reference,
      items: cmd.items.map(it => ({ ...it })),
      totalHT: cmd.totalHT,
      tauxTva: cmd.tauxTva,
      montantTva: cmd.montantTva,
      totalTTC: cmd.totalTTC,
      statut: 'LIVRE',
      livreurNom: 'Chauffeur Société',
      vehiculeImmatriculation: '45-A-12345',
      notes: `Généré à partir de la commande ${cmd.reference}`
    };

    cmd.statut = 'LIVREE';
    this.livraisonsVente.unshift(newBL);
    this.notify();
    return newBL;
  }

  // ==========================================
  // BONS DE LIVRAISON CLIENT (BL VENTE)
  // ==========================================
  addBonLivraisonVente(data: Omit<BonLivraisonVente, 'id' | 'reference' | 'montantTva' | 'totalTTC' | 'totalHT' | 'statut'> & { totalHT?: number; tauxTva?: number; montantTva?: number; totalTTC?: number; statut?: BonLivraisonVente['statut'] }): BonLivraisonVente {
    const count = this.livraisonsVente.length + 1;
    const ref = `BLV-2026-${String(count).padStart(4, '0')}`;
    const items = data.items || [];
    const totalHT = data.totalHT !== undefined ? data.totalHT : items.reduce((s, it) => s + (it.totalHT || (it.quantite * it.prixUnitaireHT)), 0);
    const tauxTva = data.tauxTva !== undefined ? data.tauxTva : 20;
    const montantTva = totalHT * (tauxTva / 100);
    const totalTTC = totalHT + montantTva;

    const newBL: BonLivraisonVente = {
      ...data,
      id: 'blv-' + Date.now().toString(36),
      societeId: data.societeId || this.activeSocieteId,
      reference: ref,
      totalHT,
      tauxTva,
      montantTva,
      totalTTC,
      statut: data.statut || 'LIVRE'
    };

    this.livraisonsVente.unshift(newBL);
    this.notify();
    return newBL;
  }

  updateBonLivraisonVente(id: string, data: Partial<BonLivraisonVente>) {
    this.livraisonsVente = this.livraisonsVente.map(l => l.id === id ? { ...l, ...data } : l);
    this.notify();
  }

  duplicateBonLivraisonVente(id: string): BonLivraisonVente | undefined {
    const orig = this.livraisonsVente.find(l => l.id === id);
    if (!orig) return undefined;
    const count = this.livraisonsVente.length + 1;
    const clone: BonLivraisonVente = {
      ...orig,
      id: 'blv-' + Date.now().toString(36),
      reference: `BLV-2026-${String(count).padStart(4, '0')}`,
      dateLivraison: new Date().toISOString().split('T')[0]
    };
    this.livraisonsVente.unshift(clone);
    this.notify();
    return clone;
  }

  deleteBonLivraisonVente(id: string): boolean {
    this.livraisonsVente = this.livraisonsVente.filter(l => l.id !== id);
    this.notify();
    return true;
  }

  convertirBLEnFacture(blId: string): FactureVente {
    const bl = this.livraisonsVente.find(l => l.id === blId);
    if (!bl) throw new Error('Bon de livraison introuvable');

    const count = this.facturesVente.length + 1;
    const ref = `FAC-2026-${String(count).padStart(4, '0')}`;

    const newFac: FactureVente = {
      id: 'fac-' + Date.now().toString(36),
      societeId: bl.societeId || this.activeSocieteId,
      numeroFacture: ref,
      typeFacture: 'DEFINITIVE',
      dateFacture: new Date().toISOString().split('T')[0],
      dateEcheance: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      clientId: bl.clientId,
      clientNom: bl.clientNom,
      clientIce: bl.clientIce,
      chantierId: bl.chantierId,
      bonLivraisonId: bl.id,
      bonLivraisonReference: bl.reference,
      commandeReference: bl.commandeReference,
      items: bl.items.map(it => ({ ...it })),
      totalHT: bl.totalHT,
      tauxTva: bl.tauxTva,
      montantTva: bl.montantTva,
      totalTTC: bl.totalTTC,
      montantRegle: 0,
      soldeDu: bl.totalTTC,
      statut: 'VALIDEE',
      conditionsPaiement: 'Virement bancaire à 60 jours',
      notes: `Établi à partir du BL ${bl.reference}`
    };

    bl.statut = 'FACTURE';
    bl.factureId = newFac.id;

    this.facturesVente.unshift(newFac);
    this.recalculerSoldeClient(bl.clientId);
    this.notify();
    return newFac;
  }

  // ==========================================
  // FACTURES VENTE
  // ==========================================
  addFactureVente(data: Omit<FactureVente, 'id' | 'numeroFacture' | 'montantTva' | 'totalTTC' | 'montantRegle' | 'soldeDu' | 'totalHT' | 'statut'> & { totalHT?: number; tauxTva?: number; montantTva?: number; totalTTC?: number; soldeDu?: number; montantRegle?: number; statut?: FactureVente['statut'] }): FactureVente {
    const count = this.facturesVente.length + 1;
    const ref = `FAC-2026-${String(count).padStart(4, '0')}`;
    const items = data.items || [];
    const totalHT = data.totalHT !== undefined ? data.totalHT : items.reduce((s, it) => s + (it.totalHT || (it.quantite * it.prixUnitaireHT)), 0);
    const tauxTva = data.tauxTva !== undefined ? data.tauxTva : 20;
    const montantTva = totalHT * (tauxTva / 100);
    const totalTTC = totalHT + montantTva;
    const montantRegle = data.montantRegle || 0;
    const soldeDu = data.soldeDu !== undefined ? data.soldeDu : Math.max(0, totalTTC - montantRegle);

    const newFac: FactureVente = {
      ...data,
      id: 'fac-' + Date.now().toString(36),
      societeId: data.societeId || this.activeSocieteId,
      numeroFacture: ref,
      totalHT,
      tauxTva,
      montantTva,
      totalTTC,
      montantRegle,
      soldeDu,
      statut: data.statut || 'VALIDEE'
    };

    this.facturesVente.unshift(newFac);
    this.recalculerSoldeClient(data.clientId);
    this.notify();
    return newFac;
  }

  updateFactureVente(id: string, data: Partial<FactureVente>) {
    this.facturesVente = this.facturesVente.map(f => {
      if (f.id === id) {
        const updated = { ...f, ...data };
        if (data.totalHT !== undefined || data.tauxTva !== undefined) {
          const ht = updated.totalHT;
          const tva = ht * (updated.tauxTva / 100);
          updated.montantTva = tva;
          updated.totalTTC = ht + tva;
          updated.soldeDu = Math.max(0, updated.totalTTC - updated.montantRegle);
        }
        return updated;
      }
      return f;
    });
    this.notify();
  }

  duplicateFactureVente(id: string): FactureVente | undefined {
    const orig = this.facturesVente.find(f => f.id === id);
    if (!orig) return undefined;
    const count = this.facturesVente.length + 1;
    const clone: FactureVente = {
      ...orig,
      id: 'fac-' + Date.now().toString(36),
      numeroFacture: `FAC-2026-${String(count).padStart(4, '0')}`,
      dateFacture: new Date().toISOString().split('T')[0],
      montantRegle: 0,
      soldeDu: orig.totalTTC,
      statut: 'BROUILLON'
    };
    this.facturesVente.unshift(clone);
    this.notify();
    return clone;
  }

  deleteFactureVente(id: string): boolean {
    const fac = this.facturesVente.find(f => f.id === id);
    this.facturesVente = this.facturesVente.filter(f => f.id !== id);
    if (fac) this.recalculerSoldeClient(fac.clientId);
    this.notify();
    return true;
  }

  creerAvoirVente(factureId: string, motif: string, montantHT?: number): FactureAvoirClient {
    const fac = this.facturesVente.find(f => f.id === factureId);
    if (!fac) throw new Error('Facture introuvable');

    const count = this.avoirsClient.length + 1;
    const ref = `AV-2026-${String(count).padStart(4, '0')}`;
    const ht = montantHT || fac.totalHT;
    const tva = ht * (fac.tauxTva / 100);
    const ttc = ht + tva;

    const newAvoir: FactureAvoirClient = {
      id: 'av-' + Date.now().toString(36),
      societeId: fac.societeId || this.activeSocieteId,
      numeroAvoir: ref,
      factureOrigineId: fac.id,
      factureOrigineNumero: fac.numeroFacture,
      clientId: fac.clientId,
      clientNom: fac.clientNom,
      clientIce: fac.clientIce,
      items: fac.items ? fac.items.map(it => ({ ...it })) : [],
      dateAvoir: new Date().toISOString().split('T')[0],
      motif,
      totalHT: ht,
      tauxTva: fac.tauxTva,
      montantTva: tva,
      totalTTC: ttc,
      statut: 'VALIDE'
    };

    fac.soldeDu = Math.max(0, fac.soldeDu - ttc);
    if (fac.soldeDu <= 0.01) {
      fac.statut = 'PAYEE';
    }

    this.avoirsClient.unshift(newAvoir);
    this.recalculerSoldeClient(fac.clientId);
    this.notify();
    return newAvoir;
  }

  // ==========================================
  // ACHATS : DEVIS FOURNISSEUR
  // ==========================================
  addDevisFournisseur(dev: Omit<DevisFournisseur, 'id' | 'reference' | 'montantTva' | 'totalTTC' | 'totalHT' | 'statut'> & { totalHT?: number; tauxTva?: number; montantTva?: number; totalTTC?: number; statut?: DevisFournisseur['statut'] }): DevisFournisseur {
    const count = this.devisFournisseur.length + 1;
    const ref = `DF-2026-${String(count).padStart(4, '0')}`;
    const items = dev.items || [];
    const totalHT = dev.totalHT !== undefined ? dev.totalHT : items.reduce((s, it) => s + (it.totalHT || (it.quantite * it.prixUnitaireHT)), 0);
    const tauxTva = dev.tauxTva !== undefined ? dev.tauxTva : 20;
    const montantTva = totalHT * (tauxTva / 100);
    const totalTTC = totalHT + montantTva;

    const newDev: DevisFournisseur = {
      ...dev,
      id: 'df-' + Date.now().toString(36),
      societeId: dev.societeId || this.activeSocieteId,
      reference: ref,
      totalHT,
      tauxTva,
      montantTva,
      totalTTC,
      statut: dev.statut || 'RECU'
    };

    this.devisFournisseur.unshift(newDev);
    this.notify();
    return newDev;
  }

  convertirDevisFournisseurEnCommande(devisId: string): CommandeFournisseur {
    const dev = this.devisFournisseur.find(d => d.id === devisId);
    if (!dev) throw new Error('Devis fournisseur introuvable');

    const count = this.commandesFournisseur.length + 1;
    const ref = `BCF-2026-${String(count).padStart(4, '0')}`;

    const newCmd: CommandeFournisseur = {
      id: 'bcf-' + Date.now().toString(36),
      societeId: dev.societeId || this.activeSocieteId,
      reference: ref,
      dateCommande: new Date().toISOString().split('T')[0],
      fournisseurId: dev.fournisseurId,
      fournisseurNom: dev.fournisseurNom,
      fournisseurIce: dev.fournisseurIce,
      chantierId: dev.chantierId,
      devisFournisseurId: dev.id,
      items: dev.items.map(it => ({ ...it })),
      totalHT: dev.totalHT,
      tauxTva: dev.tauxTva,
      montantTva: dev.montantTva,
      totalTTC: dev.totalTTC,
      delaiLivraison: dev.delaiLivraison || '7 jours',
      statut: 'ENVOYEE',
      conditionsPaiement: dev.conditionsPaiement || 'LCN à 60 jours fin de mois'
    };

    dev.statut = 'ACCEPTE';
    this.commandesFournisseur.unshift(newCmd);
    this.notify();
    return newCmd;
  }

  // ==========================================
  // ACHATS : COMMANDES FOURNISSEUR (BCF)
  // ==========================================
  addCommandeFournisseur(cmd: Omit<CommandeFournisseur, 'id' | 'reference' | 'montantTva' | 'totalTTC' | 'totalHT' | 'statut'> & { totalHT?: number; tauxTva?: number; montantTva?: number; totalTTC?: number; statut?: CommandeFournisseur['statut'] }): CommandeFournisseur {
    const count = this.commandesFournisseur.length + 1;
    const ref = `BCF-2026-${String(count).padStart(4, '0')}`;
    const items = cmd.items || [];
    const totalHT = cmd.totalHT !== undefined ? cmd.totalHT : items.reduce((s, it) => s + (it.totalHT || (it.quantite * it.prixUnitaireHT)), 0);
    const tauxTva = cmd.tauxTva !== undefined ? cmd.tauxTva : 20;
    const montantTva = totalHT * (tauxTva / 100);
    const totalTTC = totalHT + montantTva;

    const newCmd: CommandeFournisseur = {
      ...cmd,
      id: 'bcf-' + Date.now().toString(36),
      societeId: cmd.societeId || this.activeSocieteId,
      reference: ref,
      totalHT,
      tauxTva,
      montantTva,
      totalTTC,
      statut: cmd.statut || 'ENVOYEE'
    };

    this.commandesFournisseur.unshift(newCmd);
    this.notify();
    return newCmd;
  }

  updateCommandeFournisseur(id: string, data: Partial<CommandeFournisseur>) {
    this.commandesFournisseur = this.commandesFournisseur.map(c => c.id === id ? { ...c, ...data } : c);
    this.notify();
  }

  duplicateCommandeFournisseur(id: string): CommandeFournisseur | undefined {
    const orig = this.commandesFournisseur.find(c => c.id === id);
    if (!orig) return undefined;
    const count = this.commandesFournisseur.length + 1;
    const clone: CommandeFournisseur = {
      ...orig,
      id: 'bcf-' + Date.now().toString(36),
      reference: `BCF-2026-${String(count).padStart(4, '0')}`,
      dateCommande: new Date().toISOString().split('T')[0],
      statut: 'ENVOYEE'
    };
    this.commandesFournisseur.unshift(clone);
    this.notify();
    return clone;
  }

  deleteCommandeFournisseur(id: string): boolean {
    this.commandesFournisseur = this.commandesFournisseur.filter(c => c.id !== id);
    this.notify();
    return true;
  }

  receptionnerCommandeFournisseur(cmdId: string, affectation: 'STOCK_CENTRAL' | 'CHANTIER_DIRECT', chantierId?: string): BonReception {
    const cmd = this.commandesFournisseur.find(c => c.id === cmdId);
    if (!cmd) throw new Error('Commande fournisseur introuvable');

    const count = this.bonsReception.length + 1;
    const ref = `BR-2026-${String(count).padStart(4, '0')}`;

    const newBR: BonReception = {
      id: 'br-' + Date.now().toString(36),
      societeId: cmd.societeId || this.activeSocieteId,
      reference: ref,
      numeroBLFournisseur: `BL-F-${Date.now().toString().substring(7)}`,
      dateReception: new Date().toISOString().split('T')[0],
      fournisseurId: cmd.fournisseurId,
      fournisseurNom: cmd.fournisseurNom,
      fournisseurIce: cmd.fournisseurIce,
      commandeFournisseurId: cmd.id,
      commandeReference: cmd.reference,
      affectation,
      chantierId: affectation === 'CHANTIER_DIRECT' ? (chantierId || cmd.chantierId) : undefined,
      items: cmd.items.map(it => ({ ...it })),
      totalHT: cmd.totalHT,
      tauxTva: cmd.tauxTva,
      montantTva: cmd.montantTva,
      totalTTC: cmd.totalTTC,
      statut: 'CONFORME',
      receptionnaireNom: this.currentUser.nom,
      notes: `Réception de la commande ${cmd.reference}`
    };

    if (affectation === 'STOCK_CENTRAL') {
      newBR.items.forEach(it => {
        const mat = this.materiaux.find(m => m.id === it.articleId || m.designation.toLowerCase() === it.designation.toLowerCase());
        if (mat) {
          mat.stockActuel += it.quantite;
        }
      });
    } else if (affectation === 'CHANTIER_DIRECT') {
      const targetChId = chantierId || cmd.chantierId;
      if (targetChId) {
        const ch = this.chantiers.find(c => c.id === targetChId);
        if (ch) ch.coutReelTotalMAD += cmd.totalTTC;
      }
    }

    cmd.statut = 'RECUE';
    this.bonsReception.unshift(newBR);
    this.notify();
    return newBR;
  }

  // ==========================================
  // ACHATS : BONS DE RÉCEPTION (BR)
  // ==========================================
  convertirBREnFactureAchat(brId: string): FactureAchat {
    const br = this.bonsReception.find(b => b.id === brId);
    if (!br) throw new Error('Bon de réception introuvable');

    const count = this.facturesAchat.length + 1;
    const ref = `FA-2026-${String(count).padStart(4, '0')}`;

    const newFA: FactureAchat = {
      id: 'fa-' + Date.now().toString(36),
      societeId: br.societeId || this.activeSocieteId,
      numeroFacture: ref,
      dateFacture: new Date().toISOString().split('T')[0],
      dateEcheance: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      fournisseurId: br.fournisseurId,
      fournisseurNom: br.fournisseurNom,
      fournisseurIce: br.fournisseurIce,
      bonReceptionId: br.id,
      bonReceptionReference: br.reference,
      bonLivraisonFournisseurRef: br.numeroBLFournisseur,
      affectation: br.affectation,
      chantierId: br.chantierId,
      items: br.items.map(it => ({ ...it })),
      totalHT: br.totalHT,
      tauxTva: br.tauxTva,
      montantTva: br.montantTva,
      totalTTC: br.totalTTC,
      montantRegle: 0,
      soldeDu: br.totalTTC,
      statut: 'A_PAYER',
      modePaiement: 'LCN',
      notes: `Généré à partir du Bon de Réception ${br.reference}`
    };

    br.statut = 'FACTURE';
    br.factureAchatId = newFA.id;

    this.facturesAchat.unshift(newFA);
    this.notify();
    return newFA;
  }

  convertirBonReceptionEnFacture(brId: string): FactureAchat {
    return this.convertirBREnFactureAchat(brId);
  }

  // ==========================================
  // ACHATS : FACTURES D'ACHAT
  // ==========================================
  addFactureAchat(data: Omit<FactureAchat, 'id' | 'numeroFacture' | 'montantTva' | 'totalTTC' | 'montantRegle' | 'soldeDu' | 'totalHT' | 'statut'> & { totalHT?: number; tauxTva?: number; montantTva?: number; totalTTC?: number; soldeDu?: number; montantRegle?: number; statut?: FactureAchat['statut'] }): FactureAchat {
    const count = this.facturesAchat.length + 1;
    const ref = `FA-2026-${String(count).padStart(4, '0')}`;
    const items = data.items || [];
    const totalHT = data.totalHT !== undefined ? data.totalHT : items.reduce((s, it) => s + (it.totalHT || (it.quantite * it.prixUnitaireHT)), 0);
    const tauxTva = data.tauxTva !== undefined ? data.tauxTva : 20;
    const montantTva = totalHT * (tauxTva / 100);
    const totalTTC = totalHT + montantTva;
    const montantRegle = data.montantRegle || 0;
    const soldeDu = data.soldeDu !== undefined ? data.soldeDu : Math.max(0, totalTTC - montantRegle);

    const newFA: FactureAchat = {
      ...data,
      id: 'fa-' + Date.now().toString(36),
      societeId: data.societeId || this.activeSocieteId,
      numeroFacture: ref,
      totalHT,
      tauxTva,
      montantTva,
      totalTTC,
      montantRegle,
      soldeDu,
      statut: data.statut || 'A_PAYER'
    };

    this.facturesAchat.unshift(newFA);
    this.notify();
    return newFA;
  }

  updateFactureAchat(id: string, data: Partial<FactureAchat>) {
    this.facturesAchat = this.facturesAchat.map(f => {
      if (f.id === id) {
        const updated = { ...f, ...data };
        if (data.totalHT !== undefined || data.tauxTva !== undefined) {
          const ht = updated.totalHT;
          const tva = ht * (updated.tauxTva / 100);
          updated.montantTva = tva;
          updated.totalTTC = ht + tva;
          updated.soldeDu = Math.max(0, updated.totalTTC - updated.montantRegle);
        }
        return updated;
      }
      return f;
    });
    this.notify();
  }

  duplicateFactureAchat(id: string): FactureAchat | undefined {
    const orig = this.facturesAchat.find(f => f.id === id);
    if (!orig) return undefined;
    const count = this.facturesAchat.length + 1;
    const clone: FactureAchat = {
      ...orig,
      id: 'fa-' + Date.now().toString(36),
      numeroFacture: `FA-2026-${String(count).padStart(4, '0')}`,
      dateFacture: new Date().toISOString().split('T')[0],
      montantRegle: 0,
      soldeDu: orig.totalTTC,
      statut: 'A_PAYER'
    };
    this.facturesAchat.unshift(clone);
    this.notify();
    return clone;
  }

  deleteFactureAchat(id: string): boolean {
    this.facturesAchat = this.facturesAchat.filter(f => f.id !== id);
    this.notify();
    return true;
  }

  // ==========================================
  // TRÉSORERIE & RÈGLEMENTS
  // ==========================================
  enregistrerReglement(data: Omit<Reglement, 'id' | 'reference'>): Reglement {
    const count = this.reglements.length + 1;
    const ref = `REG-2026-${String(count).padStart(4, '0')}`;

    const newReg: Reglement = {
      ...data,
      id: 'reg-' + Date.now().toString(36),
      societeId: data.societeId || this.activeSocieteId,
      reference: ref,
      statut: data.statut || 'VALIDE'
    };

    if (data.sens === 'ENCAISSEMENT_CLIENT' && data.factureId) {
      const fac = this.facturesVente.find(f => f.id === data.factureId);
      if (fac) {
        fac.montantRegle = (fac.montantRegle || 0) + data.montantMAD;
        fac.soldeDu = Math.max(0, fac.totalTTC - fac.montantRegle);
        if (fac.soldeDu <= 0.01) {
          fac.statut = 'PAYEE';
        } else {
          fac.statut = 'PARTIELLEMENT_PAYEE';
        }
        this.recalculerSoldeClient(fac.clientId);
      }
    } else if (data.sens === 'DECAISSEMENT_FOURNISSEUR' && data.factureId) {
      const fa = this.facturesAchat.find(f => f.id === data.factureId);
      if (fa) {
        fa.montantRegle = (fa.montantRegle || 0) + data.montantMAD;
        fa.soldeDu = Math.max(0, fa.totalTTC - fa.montantRegle);
        if (fa.soldeDu <= 0.01) {
          fa.statut = 'PAYEE';
        } else {
          fa.statut = 'PARTIELLEMENT_PAYEE';
        }
      }
    }

    this.reglements.unshift(newReg);
    this.notify();
    return newReg;
  }

  updateReglement(id: string, data: Partial<Reglement>) {
    this.reglements = this.reglements.map(r => r.id === id ? { ...r, ...data } : r);
    this.notify();
  }

  duplicateReglement(id: string): Reglement | undefined {
    const orig = this.reglements.find(r => r.id === id);
    if (!orig) return undefined;
    const count = this.reglements.length + 1;
    const clone: Reglement = {
      ...orig,
      id: 'reg-' + Date.now().toString(36),
      reference: `REG-2026-${String(count).padStart(4, '0')}`,
      dateReglement: new Date().toISOString().split('T')[0]
    };
    this.reglements.unshift(clone);
    this.notify();
    return clone;
  }

  deleteReglement(id: string): boolean {
    this.reglements = this.reglements.filter(r => r.id !== id);
    this.notify();
    return true;
  }

  // ==========================================
  // SCANNER FACTURE IA (OCR)
  // ==========================================
  scannerFactureIA(
    paramOrNomFichier: string | {
      fournisseurNom?: string;
      fournisseurIce?: string;
      dateFacture?: string;
      affectation?: 'STOCK_CENTRAL' | 'CHANTIER_DIRECT';
      chantierId?: string;
      items?: Array<{ designation: string; quantite: number; unite: string; prixUnitaireHT: number; totalHT?: number }>;
    },
    imputationArg?: 'STOCK_CENTRAL' | 'CHANTIER_DIRECT',
    chantierIdArg?: string
  ): ScannerFactureResult {
    let result: ScannerFactureResult;
    let imputation: 'STOCK_CENTRAL' | 'CHANTIER_DIRECT' = 'STOCK_CENTRAL';
    let targetChantierId: string | undefined = chantierIdArg;
    let sourceNom = 'Scan OCR';

    if (typeof paramOrNomFichier === 'object' && paramOrNomFichier !== null) {
      const p = paramOrNomFichier;
      imputation = p.affectation || imputationArg || 'STOCK_CENTRAL';
      targetChantierId = p.chantierId || chantierIdArg;
      sourceNom = `Scan IA ${p.fournisseurNom || ''}`.trim();

      const items = p.items || [];
      const totalHT = items.reduce((s, it) => s + (it.totalHT !== undefined ? it.totalHT : (it.quantite * it.prixUnitaireHT)), 0);
      const totalTVA = totalHT * 0.20;
      const totalTTC = totalHT + totalTVA;

      result = {
        fournisseurNom: p.fournisseurNom || 'LafargeHolcim Maroc Distribution',
        fournisseurIce: p.fournisseurIce || '000123456000098',
        numeroFacture: 'FA-OCR-' + Math.floor(1000 + Math.random() * 9000),
        date: p.dateFacture || new Date().toISOString().split('T')[0],
        totalHT,
        totalTVA,
        totalTTC,
        confiancePct: 98.5,
        lignes: items.map(it => ({
          designation: it.designation,
          quantite: it.quantite,
          unite: it.unite,
          prixUnitaireHT: it.prixUnitaireHT,
          totalHT: it.totalHT !== undefined ? it.totalHT : (it.quantite * it.prixUnitaireHT)
        }))
      };
    } else {
      const nomFichier: string = typeof paramOrNomFichier === 'string' ? paramOrNomFichier : 'facture';
      imputation = imputationArg || 'STOCK_CENTRAL';
      targetChantierId = chantierIdArg;
      sourceNom = nomFichier;

      if (nomFichier.toLowerCase().includes('sonasid') || nomFichier.toLowerCase().includes('acier')) {
        result = {
          fournisseurNom: 'Sonasid Nador S.A.',
          fournisseurIce: '001548792000031',
          numeroFacture: 'FA-SONASID-' + Math.floor(1000 + Math.random() * 9000),
          date: new Date().toISOString().split('T')[0],
          totalHT: 115000,
          totalTVA: 23000,
          totalTTC: 138000,
          confiancePct: 98,
          lignes: [
            { designation: 'Acier Haute Adhérence FE 500 Ø12mm (Tonne)', quantite: 10, unite: 'tonne', prixUnitaireHT: 7800, totalHT: 78000 },
            { designation: 'Acier Haute Adhérence FE 500 Ø14mm (Tonne)', quantite: 5, unite: 'tonne', prixUnitaireHT: 7400, totalHT: 37000 }
          ]
        };
      } else if (nomFichier.toLowerCase().includes('sika') || nomFichier.toLowerCase().includes('etancheite')) {
        result = {
          fournisseurNom: 'Sika Maroc S.A.',
          fournisseurIce: '001654987000019',
          numeroFacture: 'FA-SIKA-' + Math.floor(1000 + Math.random() * 9000),
          date: new Date().toISOString().split('T')[0],
          totalHT: 18500,
          totalTVA: 3700,
          totalTTC: 22200,
          confiancePct: 97,
          lignes: [
            { designation: 'Adjuvant Hydrofuge de Masse Sika Plastocrete (Fût 200L)', quantite: 2, unite: 'fut', prixUnitaireHT: 4500, totalHT: 9000 },
            { designation: 'Membrane d\'étanchéité bitumineuse SBS 4mm (Rouleau 10m²)', quantite: 50, unite: 'rouleau', prixUnitaireHT: 190, totalHT: 9500 }
          ]
        };
      } else {
        result = {
          fournisseurNom: 'LafargeHolcim Maroc Distribution',
          fournisseurIce: '000123456000098',
          numeroFacture: 'FA-LH-' + Math.floor(1000 + Math.random() * 9000),
          date: new Date().toISOString().split('T')[0],
          totalHT: 34000,
          totalTVA: 6800,
          totalTTC: 40800,
          confiancePct: 99,
          lignes: [
            { designation: 'Ciment CPJ 45 Haute Résistance (Sac 50kg)', quantite: 400, unite: 'sac', prixUnitaireHT: 76, totalHT: 30400 },
            { designation: 'Sable Concasse 0/4 Tamise Extra (Tonne)', quantite: 20, unite: 'tonne', prixUnitaireHT: 180, totalHT: 3600 }
          ]
        };
      }
    }

    const fourn = this.fournisseurs.find(f => f.ice === result.fournisseurIce || f.nom.toLowerCase().includes(result.fournisseurNom.toLowerCase()));
    const fournId = fourn?.id || this.fournisseurs[0]?.id || 'fourn-01';

    const newFA = this.addFactureAchat({
      fournisseurId: fournId,
      fournisseurNom: result.fournisseurNom,
      fournisseurIce: result.fournisseurIce,
      affectation: imputation,
      chantierId: imputation === 'CHANTIER_DIRECT' ? targetChantierId : undefined,
      dateFacture: result.date || result.dateFacture || new Date().toISOString().split('T')[0],
      dateEcheance: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      items: (result.lignes || result.items || []).map(l => ({
        id: 'fai-' + Math.random().toString(36).substring(2, 9),
        designation: l.designation,
        quantite: l.quantite,
        unite: l.unite,
        prixUnitaireHT: l.prixUnitaireHT,
        totalHT: l.totalHT
      })),
      totalHT: result.totalHT,
      tauxTva: 20,
      montantTva: result.totalTVA || result.montantTva || (result.totalHT * 0.20),
      totalTTC: result.totalTTC,
      statut: 'A_PAYER',
      modePaiement: 'LCN',
      notes: `Extrait automatiquement via Scanner Facture IA (${sourceNom}) - Imputation: ${imputation}`
    });

    if (imputation === 'STOCK_CENTRAL') {
      (result.lignes || result.items || []).forEach(l => {
        const mat = this.materiaux.find(m => m.designation.toLowerCase().includes(l.designation.toLowerCase()));
        if (mat) {
          mat.stockActuel += l.quantite;
        }
      });
    } else if (imputation === 'CHANTIER_DIRECT' && targetChantierId) {
      const ch = this.chantiers.find(c => c.id === targetChantierId);
      if (ch) {
        ch.coutReelTotalMAD += result.totalTTC;
      }
    }

    return result;
  }

  // ==========================================
  // RECHERCHE GLOBALE INTELLIGENTE (CTRL+K)
  // ==========================================
  rechercheGlobale(term: string) {
    if (!term || term.trim().length < 2) return [];
    const q = term.toLowerCase().trim();
    const results: Array<{ id: string; type: string; titre: string; sousTitre: string; url: string }> = [];

    this.clients.filter(c => c.nom.toLowerCase().includes(q) || (c.ice && c.ice.includes(q)) || (c.codeClient && c.codeClient.toLowerCase().includes(q))).forEach(c => {
      results.push({ id: c.id, type: 'Client', titre: c.nom, sousTitre: `ICE: ${c.ice} • Encours: ${formatMAD(c.soldeEncoursMAD)}`, url: '/clients' });
    });

    this.fournisseurs.filter(f => f.nom.toLowerCase().includes(q) || (f.ice && f.ice.includes(q)) || (f.specialite && f.specialite.toLowerCase().includes(q))).forEach(f => {
      results.push({ id: f.id, type: 'Fournisseur', titre: f.nom, sousTitre: `Spécialité: ${f.specialite} • ICE: ${f.ice}`, url: '/fournisseurs' });
    });

    this.chantiers.filter(ch => ch.nom.toLowerCase().includes(q) || ch.code.toLowerCase().includes(q) || ch.ville.toLowerCase().includes(q)).forEach(ch => {
      results.push({ id: ch.id, type: 'Chantier', titre: `${ch.code} - ${ch.nom}`, sousTitre: `${ch.ville} • Budget: ${formatMAD(ch.budgetTotalMAD)} (${ch.avancementGlobalPct}%)`, url: `/chantiers/${ch.id}` });
    });

    this.materiaux.filter(m => m.designation.toLowerCase().includes(q) || m.code.toLowerCase().includes(q)).forEach(m => {
      results.push({ id: m.id, type: 'Article', titre: `${m.code} - ${m.designation}`, sousTitre: `Stock: ${m.stockActuel} ${m.unite} • Prix Achat: ${formatMAD(m.prixUnitaireMoyenMAD)}`, url: '/articles' });
    });

    this.facturesVente.filter(f => f.numeroFacture.toLowerCase().includes(q) || f.clientNom.toLowerCase().includes(q)).forEach(f => {
      results.push({ id: f.id, type: 'Facture Vente', titre: f.numeroFacture, sousTitre: `${f.clientNom} • Total: ${formatMAD(f.totalTTC)} [${f.statut}]`, url: '/ventes/factures' });
    });

    this.devis.filter(d => d.reference.toLowerCase().includes(q) || d.clientNom.toLowerCase().includes(q) || d.objet.toLowerCase().includes(q)).forEach(d => {
      results.push({ id: d.id, type: 'Devis', titre: d.reference, sousTitre: `${d.clientNom} • ${d.objet} • ${formatMAD(d.totalTTC)}`, url: '/ventes/devis' });
    });

    return results.slice(0, 15);
  }

  // ==========================================
  // ÉTAT DE SITUATION PAR DATE
  // ==========================================
  getEtatSituation(dateDebut: string, dateFin: string): EtatSituationData {
    const soc = this.company;

    const facturesVente = this.facturesVente.filter(f =>
      (!f.societeId || f.societeId === this.activeSocieteId) &&
      (!dateDebut || f.dateFacture >= dateDebut) &&
      (!dateFin || f.dateFacture <= dateFin)
    );

    const facturesAchat = this.facturesAchat.filter(f =>
      (!f.societeId || f.societeId === this.activeSocieteId) &&
      (!dateDebut || f.dateFacture >= dateDebut) &&
      (!dateFin || f.dateFacture <= dateFin)
    );

    const caTotalHT = facturesVente.reduce((s, f) => s + f.totalHT, 0);
    const caTotalTTC = facturesVente.reduce((s, f) => s + f.totalTTC, 0);
    const tvaCollectee = facturesVente.reduce((s, f) => s + f.montantTva, 0);

    const achatsTotalHT = facturesAchat.reduce((s, f) => s + f.totalHT, 0);
    const achatsTotalTTC = facturesAchat.reduce((s, f) => s + f.totalTTC, 0);
    const tvaDeductible = facturesAchat.reduce((s, f) => s + f.montantTva, 0);

    const margeBruteMAD = caTotalHT - achatsTotalHT;
    const margePct = caTotalHT > 0 ? Math.round((margeBruteMAD / caTotalHT) * 100) : 0;
    const tvaNetteDue = Math.max(0, tvaCollectee - tvaDeductible);

    const reglements = this.reglements.filter(r =>
      (!r.societeId || r.societeId === this.activeSocieteId) &&
      (!dateDebut || r.dateReglement >= dateDebut) &&
      (!dateFin || r.dateReglement <= dateFin)
    );

    const encaissementsMAD = reglements.filter(r => r.sens === 'ENCAISSEMENT_CLIENT').reduce((s, r) => s + r.montantMAD, 0);
    const decaissementsMAD = reglements.filter(r => r.sens === 'DECAISSEMENT_FOURNISSEUR').reduce((s, r) => s + r.montantMAD, 0);

    const totalCreancesClientsMAD = this.getActiveClients().reduce((s, c) => s + (c.soldeEncoursMAD || 0), 0);
    const totalDettesFournisseursMAD = this.getActiveFacturesAchat().reduce((s, f) => s + (f.soldeDu || 0), 0);

    const chantiersPerf = this.getActiveChantiers().map(ch => ({
      chantierId: ch.id,
      chantierCode: ch.code,
      chantierNom: ch.nom,
      budgetMAD: ch.budgetTotalMAD,
      coutReelMAD: ch.coutReelTotalMAD,
      margeMAD: ch.budgetTotalMAD - ch.coutReelTotalMAD,
      margePct: ch.budgetTotalMAD > 0 ? Math.round(((ch.budgetTotalMAD - ch.coutReelTotalMAD) / ch.budgetTotalMAD) * 100) : 0,
      avancementPct: ch.avancementGlobalPct
    }));

    return {
      periode: { debut: dateDebut, fin: dateFin },
      chiffreAffairesHT: caTotalHT,
      chiffreAffairesTVA: tvaCollectee,
      chiffreAffairesTTC: caTotalTTC,
      achatsFournisseursHT: achatsTotalHT,
      achatsFournisseursTVA: tvaDeductible,
      achatsFournisseursTTC: achatsTotalTTC,
      margeBruteMAD,
      margeBrutePct: margePct,
      soldeClientsARecouvrer: totalCreancesClientsMAD,
      soldeFournisseursADecaisser: totalDettesFournisseursMAD,
      tvaCollecteeVentes: tvaCollectee,
      tvaDeductibleAchats: tvaDeductible,
      tvaNetteDue,
      chantiersPerformance: this.getActiveChantiers().map(ch => ({
        chantierId: ch.id,
        code: ch.code,
        nom: ch.nom,
        budgetMAD: ch.budgetTotalMAD,
        coutReelMAD: ch.coutReelTotalMAD,
        factureMAD: ch.budgetTotalMAD * (ch.avancementGlobalPct / 100),
        margeMAD: ch.budgetTotalMAD - ch.coutReelTotalMAD,
        margePct: ch.budgetTotalMAD > 0 ? Math.round(((ch.budgetTotalMAD - ch.coutReelTotalMAD) / ch.budgetTotalMAD) * 100) : 0,
        avancementPct: ch.avancementGlobalPct
      })),
      societeNom: soc.nom,
      dateDebut,
      dateFin,
      caTotalHT,
      caTotalTTC,
      tvaCollectee,
      achatsTotalHT,
      achatsTotalTTC,
      tvaDeductible,
      margePct,
      encaissementsMAD,
      decaissementsMAD,
      totalCreancesClientsMAD,
      totalDettesFournisseursMAD,
      chantiersPerf
    };
  }

  // ==========================================
  // KPIS TABLEAU DE BORD EXÉCUTIF
  // ==========================================
  getExecutiveKPIs() {
    const chantiers = this.getActiveChantiers();
    const factures = this.getActiveFacturesVente();
    const devis = this.getActiveDevis();
    const articles = this.getActiveArticles();
    const clients = this.getActiveClients();
    const fournisseurs = this.getActiveFournisseurs();

    const chiffreAffairesEngage = chantiers.reduce((s, c) => s + c.budgetTotalMAD, 0);
    const depensesTotalesReelles = chantiers.reduce((s, c) => s + c.coutReelTotalMAD, 0);
    const margeNetteMAD = chiffreAffairesEngage - depensesTotalesReelles;
    const margeNettePct = chiffreAffairesEngage > 0 ? Math.round((margeNetteMAD / chiffreAffairesEngage) * 100) : 0;
    const chantiersActifsCount = chantiers.filter(c => c.statut === 'EN_COURS' || c.statut === 'PREPARATION').length;

    const encoursClientTotalMAD = clients.reduce((s, c) => s + (c.soldeEncoursMAD || 0), 0);
    const devisEnCoursTotalMAD = devis.filter(d => d.statut === 'EN_ATTENTE' || d.statut === 'BROUILLON').reduce((s, d) => s + d.totalTTC, 0);
    const devisEnCoursCount = devis.filter(d => d.statut === 'EN_ATTENTE' || d.statut === 'BROUILLON').length;

    const stockAlerteCount = articles.filter(a => a.stockActuel <= a.seuilAlerte).length;
    const articlesEnAlerte = articles.filter(a => a.stockActuel <= a.seuilAlerte);

    return {
      chiffreAffairesEngage,
      depensesTotalesReelles,
      margeNetteMAD,
      margeNettePct,
      chantiersActifsCount,
      encoursClientTotalMAD,
      devisEnCoursTotalMAD,
      devisEnCoursCount,
      clientsCount: clients.length,
      fournisseursCount: fournisseurs.length,
      stockAlerteCount,
      articlesEnAlerte
    };
  }

  // ==========================================
  // CHANTIERS (GESTION BTP)
  // ==========================================
  addChantier(data: Omit<Chantier, 'id' | 'code' | 'coutReelTotalMAD' | 'avancementGlobalPct'>): Chantier {
    const count = this.chantiers.length + 1;
    const code = `CH-2026-${String(count).padStart(3, '0')}`;
    const newChantier: Chantier = {
      ...data,
      id: 'ch-' + Date.now().toString(36),
      societeId: data.societeId || this.activeSocieteId,
      code,
      coutReelTotalMAD: 0,
      avancementGlobalPct: 0,
      dateDebut: data.dateDebut || new Date().toISOString().split('T')[0]
    };
    this.chantiers.unshift(newChantier);
    this.notify();
    return newChantier;
  }

  updateChantier(id: string, data: Partial<Chantier>) {
    this.chantiers = this.chantiers.map(c => c.id === id ? { ...c, ...data } : c);
    this.notify();
  }

  duplicateChantier(id: string): Chantier | undefined {
    const orig = this.chantiers.find(c => c.id === id);
    if (!orig) return undefined;
    const count = this.chantiers.length + 1;
    const clone: Chantier = {
      ...orig,
      id: 'ch-' + Date.now().toString(36),
      code: `CH-2026-${String(count).padStart(3, '0')}`,
      nom: orig.nom + ' [Copie]',
      coutReelTotalMAD: 0,
      avancementGlobalPct: 0,
      statut: 'PREPARATION',
      dateDebut: new Date().toISOString().split('T')[0]
    };
    this.chantiers.unshift(clone);
    this.notify();
    return clone;
  }

  deleteChantier(id: string): boolean {
    this.chantiers = this.chantiers.filter(c => c.id !== id);
    this.lotsDQE = this.lotsDQE.filter(l => l.chantierId !== id);
    this.depenses = this.depenses.filter(d => d.chantierId !== id);
    this.bonsLivraison = this.bonsLivraison.filter(b => b.chantierId !== id);
    this.journaux = this.journaux.filter(j => j.chantierId !== id);
    this.notify();
    return true;
  }

  // ==========================================
  // DQE : LOTS & TÂCHES
  // ==========================================
  addLotDQE(chantierId: string, titre: string, budgetLotMAD = 0): LotDQE {
    const lotsChantier = this.lotsDQE.filter(l => l.chantierId === chantierId);
    const newLot: LotDQE = {
      id: 'lot-' + Date.now().toString(36),
      chantierId,
      titre,
      ordre: lotsChantier.length + 1,
      budgetLotMAD: budgetLotMAD || 0,
      avancementPct: 0,
      taches: []
    };
    this.lotsDQE.push(newLot);
    this.recalculerAvancementChantier(chantierId);
    this.notify();
    return newLot;
  }

  updateLotDQE(lotId: string, titreOrData: string | Partial<LotDQE>, budgetLotMAD?: number) {
    const lot = this.lotsDQE.find(l => l.id === lotId);
    if (lot) {
      if (typeof titreOrData === 'string') {
        lot.titre = titreOrData;
        if (budgetLotMAD !== undefined) lot.budgetLotMAD = budgetLotMAD;
      } else {
        Object.assign(lot, titreOrData);
      }
      this.recalculerAvancementChantier(lot.chantierId);
      this.notify();
    }
  }

  duplicateLotDQE(lotId: string): LotDQE | undefined {
    const orig = this.lotsDQE.find(l => l.id === lotId);
    if (!orig) return undefined;
    const lotsChantier = this.lotsDQE.filter(l => l.chantierId === orig.chantierId);
    const clone: LotDQE = {
      ...orig,
      id: 'lot-' + Date.now().toString(36),
      titre: orig.titre + ' (Copie)',
      ordre: lotsChantier.length + 1,
      taches: orig.taches.map(t => ({
        ...t,
        id: 't-' + Math.random().toString(36).substring(2, 9),
        lotId: 'lot-' + Date.now().toString(36),
        quantiteRealisee: 0,
        avancementPct: 0
      }))
    };
    this.lotsDQE.push(clone);
    this.recalculerAvancementChantier(orig.chantierId);
    this.notify();
    return clone;
  }

  deleteLotDQE(lotId: string): boolean {
    const lot = this.lotsDQE.find(l => l.id === lotId);
    if (!lot) return false;
    const chantierId = lot.chantierId;
    this.lotsDQE = this.lotsDQE.filter(l => l.id !== lotId);
    this.recalculerAvancementChantier(chantierId);
    this.notify();
    return true;
  }

  addTacheDQE(lotId: string, data: Omit<TacheDQE, 'id' | 'lotId' | 'totalHT' | 'quantiteRealisee' | 'avancementPct'>): TacheDQE {
    const lot = this.lotsDQE.find(l => l.id === lotId);
    if (!lot) throw new Error('Lot DQE introuvable');
    const totalHT = data.quantitePrevue * data.prixUnitaireHT;
    const newTache: TacheDQE = {
      ...data,
      id: 't-' + Date.now().toString(36),
      lotId,
      totalHT,
      quantiteRealisee: 0,
      avancementPct: 0
    };
    lot.taches.push(newTache);
    this.recalculerAvancementLot(lot);
    this.recalculerAvancementChantier(lot.chantierId);
    this.notify();
    return newTache;
  }

  updateTacheDQE(arg1: string, arg2: string | Partial<TacheDQE>, arg3?: Partial<TacheDQE>) {
    const tacheId = typeof arg2 === 'string' ? arg2 : arg1;
    const data = typeof arg2 === 'object' ? arg2 : (arg3 || {});
    for (const lot of this.lotsDQE) {
      const idx = lot.taches.findIndex(t => t.id === tacheId);
      if (idx !== -1) {
        const current = lot.taches[idx];
        const updated = { ...current, ...data };
        if (data.quantitePrevue !== undefined || data.prixUnitaireHT !== undefined) {
          updated.totalHT = (updated.quantitePrevue || 0) * (updated.prixUnitaireHT || 0);
        }
        if (data.quantiteRealisee !== undefined && updated.quantitePrevue > 0) {
          updated.avancementPct = Math.min(100, Math.round((updated.quantiteRealisee / updated.quantitePrevue) * 100));
        }
        lot.taches[idx] = updated;
        this.recalculerAvancementLot(lot);
        this.recalculerAvancementChantier(lot.chantierId);
        this.notify();
        break;
      }
    }
  }

  duplicateTacheDQE(arg1: string, arg2?: string): TacheDQE | undefined {
    const tacheId = arg2 || arg1;
    for (const lot of this.lotsDQE) {
      const t = lot.taches.find(t => t.id === tacheId);
      if (t) {
        const clone: TacheDQE = {
          ...t,
          id: 't-' + Math.random().toString(36).substring(2, 9),
          designation: t.designation + ' (Copie)',
          quantiteRealisee: 0,
          avancementPct: 0
        };
        lot.taches.push(clone);
        this.recalculerAvancementLot(lot);
        this.recalculerAvancementChantier(lot.chantierId);
        this.notify();
        return clone;
      }
    }
    return undefined;
  }

  deleteTacheDQE(arg1: string, arg2?: string): boolean {
    const tacheId = arg2 || arg1;
    for (const lot of this.lotsDQE) {
      const idx = lot.taches.findIndex(t => t.id === tacheId);
      if (idx !== -1) {
        lot.taches.splice(idx, 1);
        this.recalculerAvancementLot(lot);
        this.recalculerAvancementChantier(lot.chantierId);
        this.notify();
        return true;
      }
    }
    return false;
  }

  updateTacheAvancement(chantierId: string, lotId: string, tacheId: string, avancementPct: number) {
    const lot = this.lotsDQE.find(l => l.id === lotId);
    if (lot) {
      const t = lot.taches.find(t => t.id === tacheId);
      if (t) {
        t.avancementPct = Math.min(100, Math.max(0, avancementPct));
        t.quantiteRealisee = Math.round(((t.quantitePrevue || 0) * t.avancementPct) / 100);
        this.recalculerAvancementLot(lot);
        this.recalculerAvancementChantier(chantierId);
        this.notify();
      }
    }
  }

  private recalculerAvancementLot(lot: LotDQE) {
    if (!lot.taches || lot.taches.length === 0) {
      lot.avancementPct = 0;
      return;
    }
    const totalHT = lot.taches.reduce((s, t) => s + (t.totalHT || 0), 0);
    if (totalHT === 0) {
      lot.avancementPct = 0;
      return;
    }
    let realiseHT = 0;
    lot.taches.forEach(t => {
      realiseHT += ((t.totalHT || 0) * (t.avancementPct / 100));
    });
    lot.avancementPct = Math.min(100, Math.round((realiseHT / totalHT) * 100));
  }

  private recalculerAvancementChantier(chantierId: string) {
    const lots = this.lotsDQE.filter(l => l.chantierId === chantierId);
    const ch = this.chantiers.find(c => c.id === chantierId);
    if (!ch) return;

    if (lots.length === 0) {
      ch.avancementGlobalPct = 0;
      return;
    }

    const totalBudgetLots = lots.reduce((s, l) => s + l.budgetLotMAD, 0);
    if (totalBudgetLots === 0) {
      const avg = lots.reduce((s, l) => s + l.avancementPct, 0) / lots.length;
      ch.avancementGlobalPct = Math.round(avg);
      return;
    }

    let weightedSum = 0;
    lots.forEach(l => {
      weightedSum += (l.budgetLotMAD * l.avancementPct);
    });
    ch.avancementGlobalPct = Math.min(100, Math.round(weightedSum / totalBudgetLots));
  }

  // ==========================================
  // DÉCOMPTES (SITUATIONS BTP)
  // ==========================================
  creerDecompte(
    chantierId: string,
    pctOrMois: number | string,
    arg3?: string | number,
    arg4?: string
  ): Decompte {
    const ch = this.chantiers.find(c => c.id === chantierId);
    const budgetTotal = ch?.budgetTotalMAD || 1000000;
    const count = this.decomptes.filter(d => d.chantierId === chantierId).length + 1;

    let pct: number;
    let periodeDebut: string;
    let periodeFin: string;

    if (typeof pctOrMois === 'number') {
      pct = pctOrMois;
      periodeDebut = typeof arg3 === 'string' ? arg3 : new Date().toISOString().split('T')[0];
      periodeFin = arg4 || new Date().toISOString().split('T')[0];
    } else {
      pct = ch?.avancementGlobalPct || 20;
      periodeDebut = new Date().toISOString().split('T')[0];
      periodeFin = new Date().toISOString().split('T')[0];
    }

    const previousDecomptes = this.decomptes.filter(d => d.chantierId === chantierId);
    const montantPrecedentHT = previousDecomptes.reduce((s, d) => s + (d.montantPeriodeHT || d.montantHTMois || 0), 0);
    const montantCumuleHT = Math.round(budgetTotal * (pct / 100));
    const montantPeriodeHT = Math.max(0, montantCumuleHT - montantPrecedentHT);
    const retenueGarantie10Pct = Math.round(montantPeriodeHT * 0.10);
    const netAPayerHT = montantPeriodeHT - retenueGarantie10Pct;
    const tva = Math.round(netAPayerHT * 0.20);
    const montantTTC = netAPayerHT + tva;

    const newDecompte: Decompte = {
      id: 'dec-' + Date.now().toString(36),
      societeId: ch?.societeId || this.activeSocieteId,
      numero: `DEC-${String(count).padStart(3, '0')}`,
      chantierId,
      dateDecompte: new Date().toISOString().split('T')[0],
      periodeDebut,
      periodeFin,
      pourcentageCumule: pct,
      montantPrecedentHT,
      montantPeriodeHT,
      montantCumuleHT,
      retenueGarantie10Pct,
      netAPayerHT,
      tva,
      montantTTC,
      statut: 'EMIS',
      avancementChantierPct: pct,
      montantHTCumule: montantCumuleHT,
      montantHTPrecedent: montantPrecedentHT,
      montantHTMois: montantPeriodeHT,
      retenueGarantieMois: retenueGarantie10Pct,
      tvaMois: tva,
      montantTTCMois: montantTTC,
      moisConcerne: typeof pctOrMois === 'string' ? pctOrMois : `${periodeDebut} au ${periodeFin}`
    };

    this.decomptes.unshift(newDecompte);
    this.notify();
    return newDecompte;
  }

  updateDecompte(id: string, data: Partial<Decompte>) {
    this.decomptes = this.decomptes.map(d => d.id === id ? { ...d, ...data } : d);
    this.notify();
  }

  duplicateDecompte(id: string): Decompte | undefined {
    const orig = this.decomptes.find(d => d.id === id);
    if (!orig) return undefined;
    const clone: Decompte = {
      ...orig,
      id: 'dec-' + Date.now().toString(36),
      numero: orig.numero + '-COP',
      statut: 'EMIS',
      dateDecompte: new Date().toISOString().split('T')[0]
    };
    this.decomptes.push(clone);
    this.notify();
    return clone;
  }

  deleteDecompte(id: string): boolean {
    this.decomptes = this.decomptes.filter(d => d.id !== id);
    this.notify();
    return true;
  }

  // ==========================================
  // OUVRIERS & MAIN-D'OEUVRE
  // ==========================================
  addOuvrier(ouvrier: Omit<Ouvrier, 'id' | 'matricule'>): Ouvrier {
    const count = this.ouvriers.length + 1;
    const matricule = `MAT-${String(count).padStart(4, '0')}`;
    const newOuv: Ouvrier = {
      ...ouvrier,
      id: 'ouv-' + Date.now().toString(36),
      societeId: ouvrier.societeId || this.activeSocieteId,
      matricule
    };
    this.ouvriers.push(newOuv);
    this.notify();
    return newOuv;
  }

  updateOuvrier(id: string, data: Partial<Ouvrier>) {
    this.ouvriers = this.ouvriers.map(o => o.id === id ? { ...o, ...data } : o);
    this.notify();
  }

  duplicateOuvrier(id: string): Ouvrier | undefined {
    const orig = this.ouvriers.find(o => o.id === id);
    if (!orig) return undefined;
    const count = this.ouvriers.length + 1;
    const clone: Ouvrier = {
      ...orig,
      id: 'ouv-' + Date.now().toString(36),
      matricule: `MAT-${String(count).padStart(4, '0')}`,
      nom: orig.nom + ' [Copie]'
    };
    this.ouvriers.push(clone);
    this.notify();
    return clone;
  }

  deleteOuvrier(id: string): boolean {
    this.ouvriers = this.ouvriers.filter(o => o.id !== id);
    this.pointages = this.pointages.filter(p => p.ouvrierId !== id);
    this.acomptes = this.acomptes.filter(a => a.ouvrierId !== id);
    this.notify();
    return true;
  }

  enregistrerPointage(
    arg1: string | (Partial<Pointage> & { ouvrierId: string; chantierId: string; datePointage: string }),
    chantierId?: string,
    datePointage?: string,
    valeurPresence?: number,
    heuresSup = 0,
    notes?: string
  ) {
    let pOuvrierId: string;
    let pChantierId: string;
    let pDate: string;
    let pPresence: number;
    let pHeuresSup: number;
    let pNotes: string | undefined;

    if (typeof arg1 === 'object') {
      pOuvrierId = arg1.ouvrierId;
      pChantierId = arg1.chantierId;
      pDate = arg1.datePointage;
      pPresence = arg1.valeurPresence !== undefined ? arg1.valeurPresence : 1;
      pHeuresSup = arg1.heuresSup || 0;
      pNotes = arg1.notes;
    } else {
      pOuvrierId = arg1;
      pChantierId = chantierId!;
      pDate = datePointage!;
      pPresence = valeurPresence !== undefined ? valeurPresence : 1;
      pHeuresSup = heuresSup || 0;
      pNotes = notes;
    }

    const existingIdx = this.pointages.findIndex(p => p.ouvrierId === pOuvrierId && p.chantierId === pChantierId && p.datePointage === pDate);
    if (existingIdx !== -1) {
      this.pointages[existingIdx] = {
        ...this.pointages[existingIdx],
        valeurPresence: pPresence,
        heuresSup: pHeuresSup,
        notes: pNotes
      };
    } else {
      this.pointages.push({
        id: 'pt-' + Date.now().toString(36),
        societeId: this.activeSocieteId,
        ouvrierId: pOuvrierId,
        chantierId: pChantierId,
        datePointage: pDate,
        valeurPresence: pPresence,
        heuresSup: pHeuresSup,
        notes: pNotes,
        valideParId: this.currentUser.id
      });
    }

    const ouv = this.ouvriers.find(o => o.id === pOuvrierId);
    if (ouv && pPresence > 0) {
      const tauxHoraire = ouv.tarifJourMAD / 8;
      const coutJournee = (ouv.tarifJourMAD * pPresence) + (pHeuresSup * tauxHoraire * 1.25);
      const ch = this.chantiers.find(c => c.id === pChantierId);
      if (ch) {
        ch.coutReelTotalMAD += coutJournee;
      }
    }

    this.notify();
  }

  enregistrerAcompte(data: Omit<AcomptePaie, 'id'>): AcomptePaie {
    const newAcompte: AcomptePaie = {
      ...data,
      id: 'ac-' + Date.now().toString(36),
      societeId: data.societeId || this.activeSocieteId
    };
    this.acomptes.unshift(newAcompte);
    this.notify();
    return newAcompte;
  }

  // ==========================================
  // DÉPENSES DU CHANTIER
  // ==========================================
  addDepense(data: Omit<Depense, 'id' | 'montantTTC'>): Depense {
    const montantTTC = data.montantHT * 1.20;
    const newDep: Depense = {
      ...data,
      id: 'dep-' + Date.now().toString(36),
      societeId: data.societeId || this.activeSocieteId,
      montantTTC
    };
    this.depenses.unshift(newDep);
    const ch = this.chantiers.find(c => c.id === data.chantierId);
    if (ch) ch.coutReelTotalMAD += montantTTC;
    this.notify();
    return newDep;
  }

  updateDepense(id: string, data: Partial<Depense>) {
    const dep = this.depenses.find(d => d.id === id);
    if (!dep) return;
    const ancienTTC = dep.montantTTC;
    const nouveauHT = data.montantHT !== undefined ? data.montantHT : dep.montantHT;
    const nouveauTTC = nouveauHT * 1.20;
    const delta = nouveauTTC - ancienTTC;
    Object.assign(dep, data, { montantHT: nouveauHT, montantTTC: nouveauTTC });
    const ch = this.chantiers.find(c => c.id === dep.chantierId);
    if (ch) ch.coutReelTotalMAD += delta;
    this.notify();
  }

  duplicateDepense(id: string): Depense | undefined {
    const orig = this.depenses.find(d => d.id === id);
    if (!orig) return undefined;
    return this.addDepense({
      chantierId: orig.chantierId,
      date: new Date().toISOString().split('T')[0],
      categorie: orig.categorie,
      designation: orig.designation + ' (Copie)',
      montantHT: orig.montantHT,
      fournisseurNom: orig.fournisseurNom,
      payePar: orig.payePar,
      pieceJointe: orig.pieceJointe
    });
  }

  deleteDepense(id: string): boolean {
    const dep = this.depenses.find(d => d.id === id);
    if (!dep) return false;
    const ch = this.chantiers.find(c => c.id === dep.chantierId);
    if (ch) ch.coutReelTotalMAD = Math.max(0, ch.coutReelTotalMAD - dep.montantTTC);
    this.depenses = this.depenses.filter(d => d.id !== id);
    this.notify();
    return true;
  }

  // ==========================================
  // JOURNAL DE CHANTIER (TERRAIN)
  // ==========================================
  ajouterRapportJournal(rapport: Omit<JournalChantier, 'id'>): JournalChantier {
    const newJ: JournalChantier = {
      ...rapport,
      id: 'jc-' + Date.now().toString(36),
      societeId: rapport.societeId || this.activeSocieteId
    };
    this.journaux.unshift(newJ);
    this.notify();
    return newJ;
  }

  updateRapportJournal(id: string, data: Partial<JournalChantier>) {
    this.journaux = this.journaux.map(j => j.id === id ? { ...j, ...data } : j);
    this.notify();
  }

  duplicateRapportJournal(id: string): JournalChantier | undefined {
    const orig = this.journaux.find(j => j.id === id);
    if (!orig) return undefined;
    const clone: JournalChantier = {
      ...orig,
      id: 'jc-' + Date.now().toString(36),
      date: new Date().toISOString().split('T')[0],
      travauxExecutes: orig.travauxExecutes + ' [Report]'
    };
    this.journaux.unshift(clone);
    this.notify();
    return clone;
  }

  deleteRapportJournal(id: string): boolean {
    this.journaux = this.journaux.filter(j => j.id !== id);
    this.notify();
    return true;
  }

  // ==========================================
  // BONS DE LIVRAISON DE CHANTIER (LEGACY)
  // ==========================================
  enregistrerBonLivraison(data: Partial<BonLivraison> & { chantierId: string; fournisseurId: string }): BonLivraison {
    const count = this.bonsLivraison.length + 1;
    const items = data.items || [];
    const totalHT = items.reduce((s, it) => s + (it.totalHT || (it.quantite * it.prixUnitaireHT)), 0);
    const totalTTC = totalHT * 1.20;

    const newBL: BonLivraison = {
      id: data.id || 'bl-' + Date.now().toString(36),
      societeId: data.societeId || this.activeSocieteId,
      numeroBL: data.numeroBL || `BL-2026-${String(count).padStart(3, '0')}`,
      chantierId: data.chantierId,
      fournisseurId: data.fournisseurId,
      dateLivraison: data.dateLivraison || new Date().toISOString().split('T')[0],
      items: items.map(it => ({ ...it })),
      montantTotalHT: totalHT,
      montantTTC: totalTTC,
      montantTotalTTC: totalTTC,
      statut: data.statut || 'CONFORME',
      receptionneParId: data.receptionneParId || this.currentUser.id,
      notes: data.notes
    };

    this.bonsLivraison.unshift(newBL);

    const ch = this.chantiers.find(c => c.id === data.chantierId);
    if (ch) {
      ch.coutReelTotalMAD += totalTTC;
    }

    this.notify();
    return newBL;
  }

  duplicateBonLivraison(id: string): BonLivraison | undefined {
    const orig = this.bonsLivraison.find(b => b.id === id);
    if (!orig) return undefined;
    const count = this.bonsLivraison.length + 1;
    const clone: BonLivraison = {
      ...orig,
      id: 'bl-' + Date.now().toString(36),
      numeroBL: `BL-2026-${String(count).padStart(3, '0')}`,
      dateLivraison: new Date().toISOString().split('T')[0]
    };
    this.bonsLivraison.unshift(clone);
    this.notify();
    return clone;
  }

  deleteBonLivraison(id: string): boolean {
    this.bonsLivraison = this.bonsLivraison.filter(b => b.id !== id);
    this.notify();
    return true;
  }

  // ==========================================
  // CONVERSION DEVIS EN CHANTIER ACTIF
  // ==========================================
  convertirDevisEnChantier(devisId: string): Chantier {
    const devis = this.devis.find(d => d.id === devisId);
    if (!devis) throw new Error('Devis introuvable');

    const nouveauChantier = this.addChantier({
      societeId: devis.societeId || this.activeSocieteId,
      nom: devis.objet,
      maitreOuvrage: devis.clientNom,
      ville: devis.clientVille || 'Casablanca',
      adresse: devis.clientAdresse || 'Maroc',
      typeTravaux: 'CLE_EN_MAIN',
      budgetTotalMAD: devis.totalHT,
      dateDebut: new Date().toISOString().split('T')[0],
      dateFinPrevue: devis.dateValidite,
      chefChantierId: 'usr-chef-01',
      chefChantierNom: 'Youssef El Amrani',
      statut: 'EN_COURS'
    });

    const lotsGroupes: { [key: string]: typeof devis.items } = {};
    devis.items.forEach(item => {
      const lotNom = item.lotNom || '01. Travaux Généraux';
      if (!lotsGroupes[lotNom]) lotsGroupes[lotNom] = [];
      lotsGroupes[lotNom].push(item);
    });

    Object.entries(lotsGroupes).forEach(([lotNom, items]) => {
      const budgetLot = items.reduce((sum, it) => sum + it.totalHT, 0);
      const newLot = this.addLotDQE(nouveauChantier.id, lotNom, budgetLot);

      items.forEach(it => {
        this.addTacheDQE(newLot.id, {
          designation: it.designation,
          unite: (it.unite as any) || 'forfait',
          quantitePrevue: it.quantite,
          prixUnitaireHT: it.prixUnitaireHT
        });
      });
    });

    devis.statut = 'CONVERTI_CHANTIER';
    devis.chantierId = nouveauChantier.id;
    this.notify();

    return nouveauChantier;
  }
}

export const store = new DataStore();
