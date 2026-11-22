export type Role = 'GERANT_ADMIN' | 'CHEF_CHANTIER' | 'COMPTABLE';

export interface User {
  id: string;
  nom: string;
  email: string;
  role: Role;
  telephone: string;
  avatar: string;
  titre: string;
}

export interface CompanySettings {
  id: string;
  raisonSociale: string;
  nom?: string;
  ice: string;
  ifNum: string;
  rcNum: string;
  patente: string;
  cnss: string;
  rib: string;
  banque: string;
  adresse: string;
  ville: string;
  email: string;
  telephone: string;
  logoUrl: string;
  tauxTva: number;
  description?: string;
}

export type TypeTravaux = 'GROS_OEUVRE' | 'FINITION' | 'VRD' | 'CLE_EN_MAIN';
export type StatutChantier = 'PREPARATION' | 'EN_COURS' | 'EN_PAUSE' | 'LIVRE';

export interface TacheDQE {
  id: string;
  lotId: string;
  designation: string;
  unite: 'm²' | 'm³' | 'ml' | 'kg' | 'tonne' | 'forfait' | 'U' | string;
  quantitePrevue: number;
  prixUnitaireHT: number;
  totalHT: number;
  quantiteRealisee: number;
  avancementPct: number;
}

export interface LotDQE {
  id: string;
  chantierId: string;
  titre: string;
  ordre: number;
  budgetLotMAD: number;
  avancementPct: number;
  taches: TacheDQE[];
}

export interface Chantier {
  id: string;
  societeId?: string;
  code: string;
  nom: string;
  maitreOuvrage: string;
  telClient?: string;
  iceClient?: string;
  ville: string;
  adresse: string;
  typeTravaux: TypeTravaux;
  budgetTotalMAD: number;
  coutReelTotalMAD: number;
  avancementGlobalPct: number;
  statut: StatutChantier;
  dateDebut: string;
  dateFinPrevue: string;
  chefChantierId?: string;
  chefChantierNom?: string;
  notes?: string;
}

// ==========================================
// TIERS : CLIENTS & FOURNISSEURS
// ==========================================
export interface Client {
  id: string;
  societeId?: string;
  codeClient: string;
  nom: string;
  ice: string;
  ifNum: string;
  rcNum: string;
  telephone: string;
  email: string;
  ville: string;
  adresse: string;
  plafondEncoursMAD: number;
  soldeEncoursMAD: number;
  notes?: string;
}

export interface Fournisseur {
  id: string;
  societeId?: string;
  nom: string;
  ice: string;
  ifNum: string;
  telephone: string;
  email: string;
  ville: string;
  adresse: string;
  specialite: string;
  rib?: string;
  conditionsPaiement?: string;
  plafondCreditMAD?: number;
}

// ==========================================
// CATALOGUE & ARTICLES / STOCKS
// ==========================================
export type CategorieMateriau = 
  | 'LIANTS_BETON' 
  | 'ACIER_FERRAILLAGE' 
  | 'AGREGATS' 
  | 'MACONNERIE' 
  | 'ETANCHEITE' 
  | 'SECOND_OEUVRE' 
  | 'QUINCAILLERIE'
  | 'PRESTATION_SERVICE';

export interface Materiau {
  id: string;
  societeId?: string;
  code: string;
  designation: string;
  categorie: CategorieMateriau;
  unite: string;
  stockActuel: number;
  stockMinimum: number;
  seuilAlerte?: number;
  prixUnitaireMoyenMAD: number;
  prixVenteHT?: number;
  fournisseurPrefId?: string;
  fournisseurPrefNom?: string;
}

export type Article = Materiau; // Alias for Sage 100 terminology

export type TypeMouvementStock = 
  | 'ENTREE_ACHAT' 
  | 'SORTIE_CHANTIER' 
  | 'TRANSFERT' 
  | 'INVENTAIRE' 
  | 'RETOUR';

export interface StockMouvement {
  id: string;
  societeId?: string;
  dateMouvement: string;
  type: TypeMouvementStock;
  articleId: string;
  articleDesignation: string;
  quantite: number;
  unite: string;
  coutUnitaireMAD: number;
  coutTotalMAD: number;
  source: string;
  destination: string;
  chantierId?: string;
  chantierNom?: string;
  referencePiece?: string;
  notes?: string;
  materiauId?: string;
  prixUnitaireHT?: number;
  valeurTotaleHT?: number;
}

// ==========================================
// LIGNES DE DOCUMENTS COMMERCIAUX
// ==========================================
export interface DocumentCommercialItem {
  id: string;
  designation: string;
  unite: string;
  quantite: number;
  prixUnitaireHT: number;
  totalHT: number;
  lotNom?: string;
  articleId?: string;
}

// ==========================================
// CYCLE DES VENTES (DEVIS -> COMMANDE -> BL -> FACTURE -> AVOIR)
// ==========================================
export type StatutDevis = 'BROUILLON' | 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | 'CONVERTI_COMMANDE' | 'CONVERTI_CHANTIER';

export interface DevisItem extends DocumentCommercialItem {
  devisId: string;
}

export interface Devis {
  id: string;
  societeId?: string;
  reference: string;
  dateDevis: string;
  dateValidite: string;
  clientId?: string;
  clientNom: string;
  clientIce: string;
  clientTel: string;
  clientAdresse: string;
  clientVille: string;
  objet: string;
  chantierId?: string;
  statut: StatutDevis;
  items: DevisItem[];
  totalHT: number;
  tauxTva: number;
  montantTva: number;
  totalTTC: number;
  conditionsPaiement: string;
  delaiExecution: string;
  commandeId?: string;
}

export type StatutCommandeClient = 'CONFIRMEE' | 'EN_COURS' | 'LIVREE' | 'FACTUREE' | 'ANNULEE';

export interface CommandeClient {
  id: string;
  societeId?: string;
  reference: string; // CC-2026-XXXX
  dateCommande: string;
  clientId: string;
  clientNom: string;
  clientIce: string;
  chantierId?: string;
  chantierNom?: string;
  devisId?: string;
  devisReference?: string;
  items: DocumentCommercialItem[];
  totalHT: number;
  tauxTva: number;
  montantTva: number;
  totalTTC: number;
  delaiLivraison: string;
  statut: StatutCommandeClient;
  notes?: string;
}

export type StatutLivraisonVente = 'EN_PREPARATION' | 'EXPEDIE' | 'LIVRE' | 'SIGNE' | 'FACTURE';
export type StatutBonLivraison = StatutLivraisonVente;

export interface BonLivraisonVente {
  id: string;
  societeId?: string;
  reference: string; // BLV-2026-XXXX
  dateLivraison: string;
  clientId: string;
  clientNom: string;
  clientIce: string;
  chantierId?: string;
  chantierNom?: string;
  commandeId?: string;
  commandeReference?: string;
  factureId?: string;
  adresseLivraison?: string;
  chauffeur?: string;
  vehicule?: string;
  livreurNom?: string;
  vehiculeImmatriculation?: string;
  items: DocumentCommercialItem[];
  totalHT: number;
  tauxTva: number;
  montantTva: number;
  totalTTC: number;
  statut: StatutLivraisonVente;
  notes?: string;
}

export type TypeFactureVente = 'FACTURE_DOIT' | 'DECOMPTE_PROVISOIRE' | 'FACTURE_FINALE' | 'DEFINITIVE';
export type StatutFactureVente = 'BROUILLON' | 'VALIDEE' | 'PARTIELLEMENT_PAYEE' | 'PAYEE' | 'ANNULEE';
export type StatutFacture = StatutFactureVente;

export interface FactureVente {
  id: string;
  societeId?: string;
  numeroFacture: string; // FAC-2026-XXXX
  dateFacture: string;
  dateEcheance: string;
  clientId: string;
  clientNom: string;
  clientIce: string;
  clientAdresse?: string;
  clientVille?: string;
  chantierId?: string;
  chantierNom?: string;
  devisId?: string;
  commandeId?: string;
  commandeReference?: string;
  blId?: string;
  bonLivraisonId?: string;
  bonLivraisonReference?: string;
  conditionsPaiement?: string;
  modePaiement?: string;
  typeFacture: TypeFactureVente;
  pourcentageAvancement?: number;
  retenueGarantiePct?: number; // 0 ou 10%
  montantRetenueMAD?: number;
  items: DocumentCommercialItem[];
  totalHT: number;
  tauxTva: number;
  montantTva: number;
  totalTTC: number;
  montantRegle: number;
  soldeDu: number;
  statut: StatutFactureVente;
  notes?: string;
}

export interface FactureAvoirClient {
  id: string;
  societeId?: string;
  numeroAvoir: string; // AVC-2026-XXXX
  factureOrigineId: string;
  factureOrigineNumero: string;
  dateAvoir: string;
  clientId: string;
  clientNom: string;
  clientIce?: string;
  chantierId?: string;
  motif: string;
  items?: DocumentCommercialItem[];
  totalHT: number;
  tauxTva: number;
  montantTva: number;
  totalTTC: number;
  statut: 'VALIDE' | 'REMBOURSE';
}

export type StatutDecompte = 'EMIS' | 'VALIDE' | 'PAYE';

export interface Decompte {
  id: string;
  societeId?: string;
  numero: string;
  chantierId: string;
  devisId?: string;
  dateDecompte: string;
  periodeDebut: string;
  periodeFin: string;
  pourcentageCumule: number;
  montantPrecedentHT: number;
  montantPeriodeHT: number;
  montantCumuleHT: number;
  retenueGarantie10Pct: number;
  netAPayerHT: number;
  tva: number;
  montantTTC: number;
  statut: StatutDecompte;
  datePaiement?: string;
  avancementChantierPct?: number;
  montantHTCumule?: number;
  montantHTPrecedent?: number;
  montantHTMois?: number;
  retenueGarantieMois?: number;
  tvaMois?: number;
  montantTTCMois?: number;
  moisConcerne?: string;
}

// ==========================================
// CYCLE DES ACHATS & APPROVISIONNEMENTS
// ==========================================
export type StatutDevisFournisseur = 'RECU' | 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE' | 'CONVERTI_COMMANDE';

export interface DevisFournisseur {
  id: string;
  societeId?: string;
  reference: string; // DA-2026-XXXX
  dateDevis: string;
  fournisseurId: string;
  fournisseurNom: string;
  fournisseurIce?: string;
  chantierId?: string;
  chantierNom?: string;
  items: DocumentCommercialItem[];
  totalHT: number;
  tauxTva: number;
  montantTva: number;
  totalTTC: number;
  statut: StatutDevisFournisseur;
  delaiLivraison?: string;
  conditionsPaiement?: string;
  notes?: string;
}

export type StatutCommandeFournisseur = 'ENVOYEE' | 'PARTIELLEMENT_RECUE' | 'RECUE' | 'FACTUREE' | 'ANNULEE';

export interface CommandeFournisseur {
  id: string;
  societeId?: string;
  reference: string; // BCF-2026-XXXX
  dateCommande: string;
  dateLivraisonPrevue?: string;
  delaiLivraison?: string;
  conditionsPaiement?: string;
  devisFournisseurId?: string;
  fournisseurId: string;
  fournisseurNom: string;
  fournisseurIce?: string;
  chantierId?: string;
  chantierNom?: string;
  items: DocumentCommercialItem[];
  totalHT: number;
  tauxTva: number;
  montantTva: number;
  totalTTC: number;
  statut: StatutCommandeFournisseur;
  notes?: string;
}

export type StatutReception = 'CONFORME' | 'AVEC_RESERVES' | 'FACTURE';

export interface BonReception {
  id: string;
  societeId?: string;
  reference: string; // BR-2026-XXXX
  numeroBLFournisseur?: string;
  commandeFournisseurId?: string;
  commandeFournisseurRef?: string;
  commandeReference?: string;
  dateReception: string;
  fournisseurId: string;
  fournisseurNom: string;
  fournisseurIce?: string;
  chantierId?: string;
  chantierNom?: string;
  affectation: 'STOCK_CENTRAL' | 'CHANTIER_DIRECT';
  items: DocumentCommercialItem[];
  totalHT: number;
  tauxTva: number;
  montantTva: number;
  totalTTC: number;
  statut: StatutReception;
  receptionnePar?: string;
  receptionnaireNom?: string;
  factureAchatId?: string;
  notes?: string;
}

export type StatutFactureAchat = 'A_PAYER' | 'PARTIELLEMENT_PAYEE' | 'PAYEE';

export interface FactureAchat {
  id: string;
  societeId?: string;
  numeroFacture: string; // FA-2026-XXXX
  numeroFactureFournisseur?: string; // N° sur le papier du fournisseur
  dateFacture: string;
  dateEcheance: string;
  fournisseurId: string;
  fournisseurNom: string;
  fournisseurIce: string;
  chantierId?: string;
  chantierNom?: string;
  bonReceptionId?: string;
  bonReceptionReference?: string;
  bonLivraisonFournisseurRef?: string;
  affectation?: 'STOCK_CENTRAL' | 'CHANTIER_DIRECT';
  modePaiement?: string;
  sourceScannerIA?: boolean;
  items: DocumentCommercialItem[];
  totalHT: number;
  tauxTva: number;
  montantTva: number;
  totalTTC: number;
  montantRegle: number;
  soldeDu: number;
  statut: StatutFactureAchat;
  pieceJointeUrl?: string;
  notes?: string;
}

export interface FactureAvoirFournisseur {
  id: string;
  societeId?: string;
  numeroAvoir: string; // AVF-2026-XXXX
  factureAchatOrigineId: string;
  factureOrigineId?: string;
  factureOrigineNumero?: string;
  dateAvoir: string;
  fournisseurId: string;
  fournisseurNom: string;
  motif: string;
  items?: DocumentCommercialItem[];
  totalHT: number;
  tauxTva: number;
  montantTva: number;
  totalTTC: number;
  statut: 'VALIDE' | 'DEDUIT';
}

// ==========================================
// TRÉSORERIE & RÈGLEMENTS
// ==========================================
export type ModeReglement = 'VIREMENT' | 'CHEQUE' | 'ESPECES' | 'EFFET_LCN';
export type SensReglement = 'ENCAISSEMENT_CLIENT' | 'DECAISSEMENT_FOURNISSEUR';
export type StatutReglement = 'VALIDE' | 'EN_ATTENTE_ENCAISSEMENT' | 'REJETE';

export interface Reglement {
  id: string;
  societeId?: string;
  reference: string; // REG-2026-XXXX
  dateReglement: string;
  sens: SensReglement;
  tierId: string;
  tierNom: string;
  factureId?: string;
  factureNumero?: string;
  montantMAD: number;
  modeReglement: ModeReglement;
  referencePiece: string; // N° chèque, N° virement, LCN
  banque?: string;
  dateEcheance?: string;
  statut: StatutReglement;
  notes?: string;
}

// ==========================================
// BONS DE LIVRAISON FOURNISSEUR BTP (LEGACY / CHANTIER)
// ==========================================
export interface BonLivraisonItem {
  id: string;
  blId: string;
  materiauId: string;
  designation: string;
  quantite: number;
  unite: string;
  prixUnitaireHT: number;
  totalHT: number;
}

export interface BonLivraison {
  id: string;
  societeId?: string;
  numeroBL: string;
  dateLivraison: string;
  chantierId: string;
  fournisseurId: string;
  montantTotalHT: number;
  montantTTC: number;
  montantTotalTTC?: number;
  statut: 'RECU' | 'CONFORME' | 'LITIGE';
  receptionneParId: string;
  notes?: string;
  items: BonLivraisonItem[];
}

// ==========================================
// MAIN-D'OEUVRE & JOURNAL TERRAIN
// ==========================================
export type SpecialiteOuvrier = 
  | 'MACON' 
  | 'FERRAILLEUR' 
  | 'BOISEUR' 
  | 'MANOEUVRE' 
  | 'CHEF_EQUIPE' 
  | 'ELECTRICIEN' 
  | 'PLOMBIER' 
  | 'PEINTRE';

export interface Ouvrier {
  id: string;
  societeId?: string;
  matricule: string;
  nom: string;
  cin: string;
  telephone: string;
  specialite: SpecialiteOuvrier;
  tarifJourMAD: number;
  statutActif: boolean;
  dateEmbauche: string;
}

export interface Pointage {
  id: string;
  societeId?: string;
  ouvrierId: string;
  chantierId: string;
  datePointage: string; // YYYY-MM-DD
  valeurPresence: number; // 0, 0.5, 1
  heuresSup: number;
  notes?: string;
  valideParId: string;
}

export interface AcomptePaie {
  id: string;
  societeId?: string;
  ouvrierId: string;
  chantierId: string;
  date: string;
  montantMAD: number;
  type: 'ACOMPTE_ESPECES' | 'SOLDE_QUINZAINE';
  periodeDebut: string;
  periodeFin: string;
}

export type CategorieDepense = 
  | 'MATERIAUX' 
  | 'MAIN_DOEUVRE' 
  | 'SOUS_TRAITANCE' 
  | 'LOCATION_ENGINS' 
  | 'FRAIS_GENERAUX' 
  | 'TRANSPORT';

export interface Depense {
  id: string;
  societeId?: string;
  chantierId: string;
  date: string;
  categorie: CategorieDepense;
  designation: string;
  montantHT: number;
  montantTTC: number;
  fournisseurNom?: string;
  payePar: string;
  pieceJointe?: string;
}

export type MeteoType = 'ENSOLEILLE' | 'NUAGEUX' | 'PLUVIEUX' | 'VENT_FORT' | 'CANICULE';

export interface JournalChantier {
  id: string;
  societeId?: string;
  chantierId: string;
  date: string; // YYYY-MM-DD
  meteo: MeteoType;
  temperature: number;
  effectifPresent: number;
  travauxExecutes: string;
  problemesIncidents: string;
  consignesSecurite: string;
  photos: { url: string; legende: string }[];
  redigeParId: string;
}

// ==========================================
// SCANNER FACTURE IA & RAPPORTS
// ==========================================
export interface ScannerFactureResult {
  fournisseurNom: string;
  fournisseurIce: string;
  dateFacture?: string;
  date?: string;
  numeroPiece?: string;
  numeroFacture?: string;
  items?: {
    designation: string;
    quantite: number;
    unite: string;
    prixUnitaireHT: number;
    totalHT: number;
  }[];
  lignes?: {
    designation: string;
    quantite: number;
    unite: string;
    prixUnitaireHT: number;
    totalHT: number;
  }[];
  totalHT: number;
  tauxTva?: number;
  montantTva?: number;
  totalTVA?: number;
  totalTTC: number;
  confianceIA?: number; // ex: 98%
  confiancePct?: number;
}

export interface EtatSituationData {
  periode: { debut: string; fin: string };
  chiffreAffairesHT: number;
  chiffreAffairesTVA: number;
  chiffreAffairesTTC: number;
  achatsFournisseursHT: number;
  achatsFournisseursTVA: number;
  achatsFournisseursTTC: number;
  margeBruteMAD: number;
  margeBrutePct: number;
  soldeClientsARecouvrer: number;
  soldeFournisseursADecaisser: number;
  tvaCollecteeVentes: number;
  tvaDeductibleAchats: number;
  tvaNetteDue: number;
  chantiersPerformance: {
    chantierId: string;
    code: string;
    nom: string;
    budgetMAD: number;
    coutReelMAD: number;
    factureMAD: number;
    margeMAD: number;
    margePct?: number;
    avancementPct: number;
  }[];
  societeNom?: string;
  dateDebut?: string;
  dateFin?: string;
  caTotalHT?: number;
  caTotalTTC?: number;
  tvaCollectee?: number;
  achatsTotalHT?: number;
  achatsTotalTTC?: number;
  tvaDeductible?: number;
  margePct?: number;
  encaissementsMAD?: number;
  decaissementsMAD?: number;
  totalCreancesClientsMAD?: number;
  totalDettesFournisseursMAD?: number;
  chantiersPerf?: any[];
}
