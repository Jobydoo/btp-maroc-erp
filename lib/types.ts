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
}

export type TypeTravaux = 'GROS_OEUVRE' | 'FINITION' | 'VRD' | 'CLE_EN_MAIN';
export type StatutChantier = 'PREPARATION' | 'EN_COURS' | 'EN_PAUSE' | 'LIVRE';

export interface TacheDQE {
  id: string;
  lotId: string;
  designation: string;
  unite: 'm²' | 'm³' | 'ml' | 'kg' | 'tonne' | 'forfait' | 'U';
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
  code: string;
  nom: string;
  maitreOuvrage: string;
  telClient: string;
  iceClient: string;
  ville: string;
  adresse: string;
  typeTravaux: TypeTravaux;
  budgetTotalMAD: number;
  coutReelTotalMAD: number;
  avancementGlobalPct: number;
  statut: StatutChantier;
  dateDebut: string;
  dateFinPrevue: string;
  chefChantierId: string;
  notes?: string;
}

export type StatutDevis = 'BROUILLON' | 'EN_ATTENTE' | 'VALIDE' | 'REFUSE' | 'CONVERTI_CHANTIER';

export interface DevisItem {
  id: string;
  devisId: string;
  lotNom: string;
  designation: string;
  unite: string;
  quantite: number;
  prixUnitaireHT: number;
  totalHT: number;
}

export interface Devis {
  id: string;
  reference: string;
  dateDevis: string;
  dateValidite: string;
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
}

export type StatutDecompte = 'EMIS' | 'VALIDE' | 'PAYE';

export interface Decompte {
  id: string;
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
}

export type CategorieMateriau = 
  | 'LIANTS_BETON' 
  | 'ACIER_FERRAILLAGE' 
  | 'AGREGATS' 
  | 'MACONNERIE' 
  | 'ETANCHEITE' 
  | 'SECOND_OEUVRE' 
  | 'QUINCAILLERIE';

export interface Materiau {
  id: string;
  code: string;
  designation: string;
  categorie: CategorieMateriau;
  unite: string;
  stockActuel: number;
  stockMinimum: number;
  prixUnitaireMoyenMAD: number;
  fournisseurPrefId?: string;
}

export interface Fournisseur {
  id: string;
  nom: string;
  ice: string;
  ifNum: string;
  telephone: string;
  email: string;
  ville: string;
  adresse: string;
  specialite: string;
  rib?: string;
}

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
  numeroBL: string;
  dateLivraison: string;
  chantierId: string;
  fournisseurId: string;
  montantTotalHT: number;
  montantTTC: number;
  statut: 'RECU' | 'CONFORME' | 'LITIGE';
  receptionneParId: string;
  notes?: string;
  items: BonLivraisonItem[];
}

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
