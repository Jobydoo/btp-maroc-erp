import {
  User,
  CompanySettings,
  Chantier,
  LotDQE,
  Devis,
  Decompte,
  Materiau,
  Fournisseur,
  BonLivraison,
  Ouvrier,
  Pointage,
  AcomptePaie,
  Depense,
  JournalChantier
} from './types';

export const INITIAL_COMPANY: CompanySettings = {
  id: 'comp-01',
  raisonSociale: 'ATLAS BÂTIMENT & TRAVAUX MAROC S.A.R.L',
  ice: '002891456000034',
  ifNum: '45892134',
  rcNum: '124892 - Casablanca',
  patente: '34891200',
  cnss: '7845129',
  rib: '011 780 0000123456789012 45',
  banque: 'Attijariwafa Bank - Agence Bd Zerktouni, Casablanca',
  adresse: 'Lotissement La Colline II, Immeuble BTP Tech, Sidi Maârouf',
  ville: 'Casablanca',
  email: 'contact@atlas-batiment.ma',
  telephone: '+212 5 22 78 90 00',
  logoUrl: '/logo-btp.png',
  tauxTva: 20
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-01',
    nom: 'Youssef Benjelloun',
    email: 'y.benjelloun@atlas-batiment.ma',
    role: 'GERANT_ADMIN',
    telephone: '+212 6 61 12 34 56',
    avatar: '👨‍💼',
    titre: 'Directeur Général & Gérant'
  },
  {
    id: 'user-02',
    nom: 'Amine El Idrissi',
    email: 'a.elidrissi@atlas-batiment.ma',
    role: 'CHEF_CHANTIER',
    telephone: '+212 6 62 88 99 00',
    avatar: '👷‍♂️',
    titre: 'Conducteur Principal de Travaux'
  },
  {
    id: 'user-03',
    nom: 'Fatima Zahra Mansouri',
    email: 'fz.mansouri@atlas-batiment.ma',
    role: 'COMPTABLE',
    telephone: '+212 6 63 44 55 66',
    avatar: '👩‍💼',
    titre: 'Responsable Comptable & Facturation'
  }
];

export const INITIAL_FOURNISSEURS: Fournisseur[] = [
  {
    id: 'fourn-01',
    nom: 'LafargeHolcim Maroc',
    ice: '001524368000012',
    ifNum: '01089452',
    telephone: '+212 5 22 95 80 00',
    email: 'commandes@lafargeholcim.ma',
    ville: 'Casablanca',
    adresse: 'Km 10 Route d\'El Jadida',
    specialite: 'Ciments CPJ, Béton prêt à l\'emploi (BPE)',
    rib: '007 780 0001234567890123 11'
  },
  {
    id: 'fourn-02',
    nom: 'Sonasid Sidérurgie',
    ice: '001689234000089',
    ifNum: '02045612',
    telephone: '+212 5 22 66 70 00',
    email: 'ventes@sonasid.ma',
    ville: 'Nador / Casablanca',
    adresse: 'Bd Moulay Ismail, Roches Noires',
    specialite: 'Aciers pour béton armé FeE500, Treillis soudé',
    rib: '011 780 0009876543210987 88'
  },
  {
    id: 'fourn-03',
    nom: 'Ciments du Maroc (Heidelberg)',
    ice: '001556789000045',
    ifNum: '03078914',
    telephone: '+212 5 22 29 40 00',
    email: 'contact@cimar.ma',
    ville: 'Casablanca / Safi',
    adresse: '621 Bd Panoramique',
    specialite: 'Ciments spéciaux et liants hydrauliques',
    rib: '022 780 0004567890123456 22'
  },
  {
    id: 'fourn-04',
    nom: 'Sika Maroc',
    ice: '001745892000078',
    ifNum: '04089123',
    telephone: '+212 5 22 30 15 15',
    email: 'commercial@ma.sika.com',
    ville: 'Bouskoura',
    adresse: 'Zone Industrielle Bouskoura',
    specialite: 'Adjuvants béton, Étanchéité & Mortiers techniques'
  },
  {
    id: 'fourn-05',
    nom: 'Comptoir Métallurgique Marocain (CMM)',
    ice: '001891234000067',
    ifNum: '05012345',
    telephone: '+212 5 22 40 50 60',
    email: 'ventes@cmm.co.ma',
    ville: 'Casablanca',
    adresse: 'Angle Bd Emile Zola et Rue Chevalier Bayard',
    specialite: 'Outillage lourd, Tubes acier, Quincaillerie chantier'
  }
];

export const INITIAL_MATERIAUX: Materiau[] = [
  {
    id: 'mat-01',
    code: 'CIM-CPJ45',
    designation: 'Ciment CPJ 45 LafargeHolcim (Sac 50kg)',
    categorie: 'LIANTS_BETON',
    unite: 'Sac',
    stockActuel: 340,
    stockMinimum: 100,
    prixUnitaireMoyenMAD: 78.50,
    fournisseurPrefId: 'fourn-01'
  },
  {
    id: 'mat-02',
    code: 'AC-FEE500',
    designation: 'Acier FeE500 haute adhérence Sonasid (HA D12/D14/D16)',
    categorie: 'ACIER_FERRAILLAGE',
    unite: 'Tonne',
    stockActuel: 14.5,
    stockMinimum: 5.0,
    prixUnitaireMoyenMAD: 9400.00,
    fournisseurPrefId: 'fourn-02'
  },
  {
    id: 'mat-03',
    code: 'BPE-B25',
    designation: 'Béton Prêt à l\'Emploi B25 dosé à 350 kg/m³',
    categorie: 'LIANTS_BETON',
    unite: 'm³',
    stockActuel: 0,
    stockMinimum: 0,
    prixUnitaireMoyenMAD: 820.00,
    fournisseurPrefId: 'fourn-01'
  },
  {
    id: 'mat-04',
    code: 'SAB-CONC',
    designation: 'Sable lavé de concassage 0/4 pour mortier et coulis',
    categorie: 'AGREGATS',
    unite: 'm³',
    stockActuel: 48,
    stockMinimum: 20,
    prixUnitaireMoyenMAD: 190.00,
    fournisseurPrefId: 'fourn-03'
  },
  {
    id: 'mat-05',
    code: 'GRAV-G1',
    designation: 'Gravier concassé G1 (15/25) pour béton armé',
    categorie: 'AGREGATS',
    unite: 'm³',
    stockActuel: 65,
    stockMinimum: 30,
    prixUnitaireMoyenMAD: 165.00,
    fournisseurPrefId: 'fourn-03'
  },
  {
    id: 'mat-06',
    code: 'BRIQ-8T',
    designation: 'Brique rouge creuse 8 trous (10x20x30 cm)',
    categorie: 'MACONNERIE',
    unite: 'U',
    stockActuel: 4200,
    stockMinimum: 1500,
    prixUnitaireMoyenMAD: 3.20
  },
  {
    id: 'mat-07',
    code: 'BRIQ-6T',
    designation: 'Brique rouge creuse 6 trous pour cloisons (7x20x30 cm)',
    categorie: 'MACONNERIE',
    unite: 'U',
    stockActuel: 1850,
    stockMinimum: 1200,
    prixUnitaireMoyenMAD: 2.40
  },
  {
    id: 'mat-08',
    code: 'ETAN-SIKA',
    designation: 'Émulsion bitumineuse d\'étanchéité Sika Igol (Fût 25kg)',
    categorie: 'ETANCHEITE',
    unite: 'Fût',
    stockActuel: 18,
    stockMinimum: 8,
    prixUnitaireMoyenMAD: 380.00,
    fournisseurPrefId: 'fourn-04'
  },
  {
    id: 'mat-09',
    code: 'PVC-D110',
    designation: 'Tube PVC rigide assainissement D110 NF (Barre 4m)',
    categorie: 'SECOND_OEUVRE',
    unite: 'ml',
    stockActuel: 92,
    stockMinimum: 40,
    prixUnitaireMoyenMAD: 45.00,
    fournisseurPrefId: 'fourn-05'
  }
];

export const INITIAL_OUVRIERS: Ouvrier[] = [
  {
    id: 'ouv-01',
    matricule: 'MAT-0101',
    nom: 'Rachid Tazi',
    cin: 'BE458921',
    telephone: '+212 6 71 22 33 44',
    specialite: 'CHEF_EQUIPE',
    tarifJourMAD: 350.00,
    statutActif: true,
    dateEmbauche: '2023-03-01'
  },
  {
    id: 'ouv-02',
    matricule: 'MAT-0102',
    nom: 'Mohamed Benali',
    cin: 'AA892104',
    telephone: '+212 6 72 33 44 55',
    specialite: 'MACON',
    tarifJourMAD: 280.00,
    statutActif: true,
    dateEmbauche: '2023-04-15'
  },
  {
    id: 'ouv-03',
    matricule: 'MAT-0103',
    nom: 'Brahim El Ouahed',
    cin: 'HH120489',
    telephone: '+212 6 73 44 55 66',
    specialite: 'FERRAILLEUR',
    tarifJourMAD: 270.00,
    statutActif: true,
    dateEmbauche: '2023-05-10'
  },
  {
    id: 'ouv-04',
    matricule: 'MAT-0104',
    nom: 'Hassan Ait Said',
    cin: 'SH789123',
    telephone: '+212 6 74 55 66 77',
    specialite: 'BOISEUR',
    tarifJourMAD: 270.00,
    statutActif: true,
    dateEmbauche: '2023-06-01'
  },
  {
    id: 'ouv-05',
    matricule: 'MAT-0105',
    nom: 'Mustapha Drissi',
    cin: 'EE654120',
    telephone: '+212 6 75 66 77 88',
    specialite: 'MANOEUVRE',
    tarifJourMAD: 180.00,
    statutActif: true,
    dateEmbauche: '2024-01-10'
  },
  {
    id: 'ouv-06',
    matricule: 'MAT-0106',
    nom: 'Karim Amrani',
    cin: 'BK321456',
    telephone: '+212 6 76 77 88 99',
    specialite: 'MANOEUVRE',
    tarifJourMAD: 170.00,
    statutActif: true,
    dateEmbauche: '2024-02-01'
  },
  {
    id: 'ouv-07',
    matricule: 'MAT-0107',
    nom: 'Youssef Kabbaj',
    cin: 'CD987123',
    telephone: '+212 6 77 88 99 00',
    specialite: 'ELECTRICIEN',
    tarifJourMAD: 300.00,
    statutActif: true,
    dateEmbauche: '2024-03-01'
  },
  {
    id: 'ouv-08',
    matricule: 'MAT-0108',
    nom: 'Omar Belkacem',
    cin: 'M561234',
    telephone: '+212 6 78 99 00 11',
    specialite: 'PLOMBIER',
    tarifJourMAD: 290.00,
    statutActif: true,
    dateEmbauche: '2024-03-15'
  },
  {
    id: 'ouv-09',
    matricule: 'MAT-0109',
    nom: 'Aziz Chraibi',
    cin: 'F341209',
    telephone: '+212 6 79 00 11 22',
    specialite: 'PEINTRE',
    tarifJourMAD: 260.00,
    statutActif: true,
    dateEmbauche: '2024-04-01'
  },
  {
    id: 'ouv-10',
    matricule: 'MAT-0110',
    nom: 'Hamza Ziyani',
    cin: 'A789456',
    telephone: '+212 6 80 11 22 33',
    specialite: 'MANOEUVRE',
    tarifJourMAD: 170.00,
    statutActif: true,
    dateEmbauche: '2024-05-01'
  }
];

export const INITIAL_CHANTIERS: Chantier[] = [
  {
    id: 'ch-01',
    code: 'CH-2026-001',
    nom: 'Construction Villa R+1 Contemporaine - Marrakech Palmeraie',
    maitreOuvrage: 'M. Mehdi Alami',
    telClient: '+212 6 61 78 90 12',
    iceClient: 'Particulier',
    ville: 'Marrakech',
    adresse: 'Lot 45, Domaine des Oliviers, Route de Fès, Palmeraie',
    typeTravaux: 'CLE_EN_MAIN',
    budgetTotalMAD: 3450000.00,
    coutReelTotalMAD: 1820000.00,
    avancementGlobalPct: 58,
    statut: 'EN_COURS',
    dateDebut: '2026-01-15',
    dateFinPrevue: '2026-11-30',
    chefChantierId: 'user-02',
    notes: 'Terrain plat, sol argileux nécessitant fouilles en rigoles approfondies avec semelles filantes.'
  },
  {
    id: 'ch-02',
    code: 'CH-2026-002',
    nom: 'Immeuble Résidentiel R+4 Les Alizés - Safi Plateau',
    maitreOuvrage: 'Société Immobilière Atlantique SARL',
    telClient: '+212 5 24 62 10 20',
    iceClient: '001982736000021',
    ville: 'Safi',
    adresse: 'Avenue Kennedy, Quartier du Plateau',
    typeTravaux: 'GROS_OEUVRE',
    budgetTotalMAD: 8900000.00,
    coutReelTotalMAD: 6450000.00,
    avancementGlobalPct: 76,
    statut: 'EN_COURS',
    dateDebut: '2025-09-01',
    dateFinPrevue: '2026-08-31',
    chefChantierId: 'user-02',
    notes: 'Structure poteaux-poutres en béton armé B25, dalle pleine au RDC et corps creux aux étages.'
  },
  {
    id: 'ch-03',
    code: 'CH-2026-003',
    nom: 'Aménagement Showroom & Siège Commercial - Casablanca Maârif',
    maitreOuvrage: 'Groupe Maromedia Holding SA',
    telClient: '+212 5 22 25 30 40',
    iceClient: '003124567000088',
    ville: 'Casablanca',
    adresse: '88 Bd Al Massira Al Khadra, Maârif',
    typeTravaux: 'FINITION',
    budgetTotalMAD: 1850000.00,
    coutReelTotalMAD: 320000.00,
    avancementGlobalPct: 18,
    statut: 'EN_COURS',
    dateDebut: '2026-03-01',
    dateFinPrevue: '2026-07-15',
    chefChantierId: 'user-02',
    notes: 'Travaux de nuit autorisés pour nuisances sonores réduites. Climatisation VRV centralisée.'
  }
];

export const INITIAL_LOTS_DQE: LotDQE[] = [
  // Lots pour Villa Marrakech (ch-01)
  {
    id: 'lot-01-ch01',
    chantierId: 'ch-01',
    titre: '01. Terrassements & Fondations',
    ordre: 1,
    budgetLotMAD: 450000.00,
    avancementPct: 100,
    taches: [
      { id: 't-01', lotId: 'lot-01-ch01', designation: 'Fouilles en pleine masse et en rigoles dans terrain semi-rocheux', unite: 'm³', quantitePrevue: 420, prixUnitaireHT: 95, totalHT: 39900, quantiteRealisee: 420, avancementPct: 100 },
      { id: 't-02', lotId: 'lot-01-ch01', designation: 'Gros béton de calage et béton de propreté dosé à 200 kg/m³', unite: 'm³', quantitePrevue: 55, prixUnitaireHT: 650, totalHT: 35750, quantiteRealisee: 55, avancementPct: 100 },
      { id: 't-03', lotId: 'lot-01-ch01', designation: 'Béton armé pour semelles isolées et longrines dosé à 350 kg/m³', unite: 'm³', quantitePrevue: 110, prixUnitaireHT: 1450, totalHT: 159500, quantiteRealisee: 110, avancementPct: 100 },
      { id: 't-04', lotId: 'lot-01-ch01', designation: 'Hérissonnage en pierres sèches e=20cm avec damage mécanique', unite: 'm²', quantitePrevue: 280, prixUnitaireHT: 85, totalHT: 23800, quantiteRealisee: 280, avancementPct: 100 }
    ]
  },
  {
    id: 'lot-02-ch01',
    chantierId: 'ch-01',
    titre: '02. Structure & Béton Armé Superstructure',
    ordre: 2,
    budgetLotMAD: 890000.00,
    avancementPct: 90,
    taches: [
      { id: 't-05', lotId: 'lot-02-ch01', designation: 'Poteaux, voiles et raidisseurs en béton armé dosé à 350 kg/m³', unite: 'm³', quantitePrevue: 85, prixUnitaireHT: 1850, totalHT: 157250, quantiteRealisee: 85, avancementPct: 100 },
      { id: 't-06', lotId: 'lot-02-ch01', designation: 'Poutres, chaînages et linteaux en béton armé', unite: 'm³', quantitePrevue: 92, prixUnitaireHT: 1800, totalHT: 165600, quantiteRealisee: 85, avancementPct: 92 },
      { id: 't-07', lotId: 'lot-02-ch01', designation: 'Plancher corps creux 16+4 cm pour RDC et étage', unite: 'm²', quantitePrevue: 480, prixUnitaireHT: 340, totalHT: 163200, quantiteRealisee: 450, avancementPct: 94 },
      { id: 't-08', lotId: 'lot-02-ch01', designation: 'Armatures acier FeE500 haute adhérence façonné et posé', unite: 'kg', quantitePrevue: 24000, prixUnitaireHT: 14.5, totalHT: 348000, quantiteRealisee: 22000, avancementPct: 91 }
    ]
  },
  {
    id: 'lot-03-ch01',
    chantierId: 'ch-01',
    titre: '03. Maçonnerie & Cloisonnement',
    ordre: 3,
    budgetLotMAD: 380000.00,
    avancementPct: 65,
    taches: [
      { id: 't-09', lotId: 'lot-03-ch01', designation: 'Double cloison extérieure en briques creuses de 8 et 6 trous avec lame d\'air', unite: 'm²', quantitePrevue: 360, prixUnitaireHT: 240, totalHT: 86400, quantiteRealisee: 260, avancementPct: 72 },
      { id: 't-10', lotId: 'lot-03-ch01', designation: 'Cloisons intérieures simples en briques creuses de 6 trous', unite: 'm²', quantitePrevue: 420, prixUnitaireHT: 130, totalHT: 54600, quantiteRealisee: 290, avancementPct: 69 },
      { id: 't-11', lotId: 'lot-03-ch01', designation: 'Enduit intérieur au mortier de ciment batard dressé à la règle', unite: 'm²', quantitePrevue: 1100, prixUnitaireHT: 65, totalHT: 71500, quantiteRealisee: 600, avancementPct: 54 }
    ]
  },
  {
    id: 'lot-04-ch01',
    chantierId: 'ch-01',
    titre: '04. Étanchéité & Isolation',
    ordre: 4,
    budgetLotMAD: 220000.00,
    avancementPct: 40,
    taches: [
      { id: 't-12', lotId: 'lot-04-ch01', designation: 'Forme de pente en béton maigre e=7cm mini', unite: 'm²', quantitePrevue: 260, prixUnitaireHT: 110, totalHT: 28600, quantiteRealisee: 260, avancementPct: 100 },
      { id: 't-13', lotId: 'lot-04-ch01', designation: 'Complexe d\'étanchéité multicouche avec membrane SBS auto-protégée', unite: 'm²', quantitePrevue: 260, prixUnitaireHT: 280, totalHT: 72800, quantiteRealisee: 50, avancementPct: 19 }
    ]
  },
  {
    id: 'lot-05-ch01',
    chantierId: 'ch-01',
    titre: '05. Électricité & Plomberie Sanitaire',
    ordre: 5,
    budgetLotMAD: 490000.00,
    avancementPct: 25,
    taches: [
      { id: 't-14', lotId: 'lot-05-ch01', designation: 'Pose gaines ICTA et boîtes d\'encastrement sous dalle et cloisons', unite: 'forfait', quantitePrevue: 1, prixUnitaireHT: 120000, totalHT: 120000, quantiteRealisee: 0.6, avancementPct: 60 },
      { id: 't-15', lotId: 'lot-05-ch01', designation: 'Réseau d\'évacuation PVC et arrivées multicouche encastrées', unite: 'forfait', quantitePrevue: 1, prixUnitaireHT: 95000, totalHT: 95000, quantiteRealisee: 0.4, avancementPct: 40 }
    ]
  },
  {
    id: 'lot-06-ch01',
    chantierId: 'ch-01',
    titre: '06. Revêtements & Peinture',
    ordre: 6,
    budgetLotMAD: 620000.00,
    avancementPct: 0,
    taches: [
      { id: 't-16', lotId: 'lot-06-ch01', designation: 'Fourniture et pose marbre Thala ou Volubilis dans salon et hall', unite: 'm²', quantitePrevue: 160, prixUnitaireHT: 580, totalHT: 92800, quantiteRealisee: 0, avancementPct: 0 },
      { id: 't-17', lotId: 'lot-06-ch01', designation: 'Carrelage grès cérame 60x60 premier choix pour chambres', unite: 'm²', quantitePrevue: 220, prixUnitaireHT: 260, totalHT: 57200, quantiteRealisee: 0, avancementPct: 0 }
    ]
  }
];

export const INITIAL_DEVIS: Devis[] = [
  {
    id: 'dev-01',
    reference: 'DEV-2026-0042',
    dateDevis: '2026-02-10',
    dateValidite: '2026-05-10',
    clientNom: 'Société LogiMaroc Logistics SARL',
    clientIce: '002345678000091',
    clientTel: '+212 5 23 32 40 50',
    clientAdresse: 'Lot 12, Parc Industriel Sapino, Berrechid',
    clientVille: 'Berrechid',
    objet: 'Construction Hangar Industriel de Stockage (2 400 m²) & Plateforme VRD',
    statut: 'VALIDE',
    totalHT: 2150000.00,
    tauxTva: 20,
    montantTva: 430000.00,
    totalTTC: 2580000.00,
    conditionsPaiement: 'Avance 20% à la commande, 70% par décomptes mensuels d\'avancement, 10% retenue de garantie libérable à la réception définitive (12 mois).',
    delaiExecution: '6 mois calendaires à compter de l\'ordre de service (OS).',
    items: [
      { id: 'di-01', devisId: 'dev-01', lotNom: '01. Terrassement & VRD', designation: 'Décapage terre végétale e=20cm et nivellement laser', unite: 'm²', quantite: 3200, prixUnitaireHT: 35, totalHT: 112000 },
      { id: 'di-02', devisId: 'dev-01', lotNom: '01. Terrassement & VRD', designation: 'Fouilles en rigoles pour massifs de charpente métallique', unite: 'm³', quantite: 380, prixUnitaireHT: 85, totalHT: 32300 },
      { id: 'di-03', devisId: 'dev-01', lotNom: '02. Fondations & Dallage', designation: 'Massifs isolés et longrines en béton armé B25 dosé 350 kg/m³', unite: 'm³', quantite: 180, prixUnitaireHT: 1450, totalHT: 261000 },
      { id: 'di-04', devisId: 'dev-01', lotNom: '02. Fondations & Dallage', designation: 'Dallage industriel en béton quartzé lissé finition hélicoptère e=18cm', unite: 'm²', quantite: 2400, prixUnitaireHT: 290, totalHT: 696000 },
      { id: 'di-05', devisId: 'dev-01', lotNom: '03. Charpente & Bardage', designation: 'Fourniture et montage ossature charpente métallique profilés IPE/HEA', unite: 'tonne', quantite: 45, prixUnitaireHT: 16500, totalHT: 742500 },
      { id: 'di-06', devisId: 'dev-01', lotNom: '03. Charpente & Bardage', designation: 'Couverture et bardage en panneaux sandwich double peau e=50mm', unite: 'm²', quantite: 2800, prixUnitaireHT: 110, totalHT: 306200 }
    ]
  },
  {
    id: 'dev-02',
    reference: 'DEV-2026-0043',
    dateDevis: '2026-03-05',
    dateValidite: '2026-06-05',
    clientNom: 'Cabinet d\'Ingénierie & Architecture ArchiMed',
    clientIce: '001998877000033',
    clientTel: '+212 5 37 77 88 99',
    clientAdresse: '42 Avenue de France, Agdal',
    clientVille: 'Rabat',
    objet: 'Surélévation R+2 et Réhabilitation Façade Bâtiment Administratif',
    statut: 'EN_ATTENTE',
    totalHT: 1280000.00,
    tauxTva: 20,
    montantTva: 256000.00,
    totalTTC: 1536000.00,
    conditionsPaiement: 'Acompte 30% à la signature, 60% au fur et à mesure des situations de travaux, 10% solde à la livraison.',
    delaiExecution: '4 mois à compter du démarrage effectif.',
    items: [
      { id: 'di-07', devisId: 'dev-02', lotNom: '01. Démolition & Renforcement', designation: 'Dépose acrotère existant et reprise en sous-œuvre des poteaux R+1', unite: 'forfait', quantite: 1, prixUnitaireHT: 180000, totalHT: 180000 },
      { id: 'di-08', devisId: 'dev-02', lotNom: '02. Structure Métallique & Plancher', designation: 'Structure légère en profilés tubulaires acier et plancher collaborant', unite: 'm²', quantite: 320, prixUnitaireHT: 1650, totalHT: 528000 },
      { id: 'di-09', devisId: 'dev-02', lotNom: '03. Façade Rideau Aluminium', designation: 'Façade mur-rideau vitrage trempé isolant thermique STADIP 66.2', unite: 'm²', quantite: 140, prixUnitaireHT: 2400, totalHT: 336000 },
      { id: 'di-10', devisId: 'dev-02', lotNom: '04. Cloisonnement & Finitions', designation: 'Cloisons amovibles vitrées et faux plafonds acoustiques 60x60', unite: 'm²', quantite: 300, prixUnitaireHT: 786.67, totalHT: 236000 }
    ]
  }
];

export const INITIAL_DECOMPTES: Decompte[] = [
  {
    id: 'dec-01',
    numero: 'DEC-01-CH01',
    chantierId: 'ch-01',
    devisId: 'dev-01',
    dateDecompte: '2026-02-28',
    periodeDebut: '2026-01-15',
    periodeFin: '2026-02-28',
    pourcentageCumule: 35.0,
    montantPrecedentHT: 0.00,
    montantPeriodeHT: 1207500.00,
    montantCumuleHT: 1207500.00,
    retenueGarantie10Pct: 120750.00,
    netAPayerHT: 1086750.00,
    tva: 217350.00,
    montantTTC: 1304100.00,
    statut: 'PAYE',
    datePaiement: '2026-03-15'
  },
  {
    id: 'dec-02',
    numero: 'DEC-02-CH01',
    chantierId: 'ch-01',
    devisId: 'dev-01',
    dateDecompte: '2026-04-10',
    periodeDebut: '2026-03-01',
    periodeFin: '2026-03-31',
    pourcentageCumule: 58.0,
    montantPrecedentHT: 1207500.00,
    montantPeriodeHT: 793500.00,
    montantCumuleHT: 2001000.00,
    retenueGarantie10Pct: 79350.00,
    netAPayerHT: 714150.00,
    tva: 142830.00,
    montantTTC: 856980.00,
    statut: 'VALIDE'
  }
];

export const INITIAL_BONS_LIVRAISON: BonLivraison[] = [
  {
    id: 'bl-01',
    numeroBL: 'BL-2026-089',
    dateLivraison: '2026-03-12',
    chantierId: 'ch-01',
    fournisseurId: 'fourn-01',
    montantTotalHT: 47100.00,
    montantTTC: 56520.00,
    statut: 'CONFORME',
    receptionneParId: 'user-02',
    notes: 'Livraison ciment CPJ 45 par camion plateau 600 sacs. Bon de pesée joint.',
    items: [
      { id: 'bli-01', blId: 'bl-01', materiauId: 'mat-01', designation: 'Ciment CPJ 45 LafargeHolcim (Sac 50kg)', quantite: 600, unite: 'Sac', prixUnitaireHT: 78.50, totalHT: 47100.00 }
    ]
  },
  {
    id: 'bl-02',
    numeroBL: 'BL-2026-094',
    dateLivraison: '2026-03-18',
    chantierId: 'ch-01',
    fournisseurId: 'fourn-02',
    montantTotalHT: 112800.00,
    montantTTC: 135360.00,
    statut: 'CONFORME',
    receptionneParId: 'user-02',
    notes: 'Aciers façonnés Sonasid pour semelles et longrines. Contrôlé au pied à coulisse.',
    items: [
      { id: 'bli-02', blId: 'bl-02', materiauId: 'mat-02', designation: 'Acier FeE500 haute adhérence Sonasid', quantite: 12.0, unite: 'Tonne', prixUnitaireHT: 9400.00, totalHT: 112800.00 }
    ]
  },
  {
    id: 'bl-03',
    numeroBL: 'BL-2026-102',
    dateLivraison: '2026-03-24',
    chantierId: 'ch-02',
    fournisseurId: 'fourn-03',
    montantTotalHT: 24700.00,
    montantTTC: 29640.00,
    statut: 'CONFORME',
    receptionneParId: 'user-02',
    notes: 'Sable et graviers pour coulage poteaux R+3 Safi.',
    items: [
      { id: 'bli-03', blId: 'bl-03', materiauId: 'mat-04', designation: 'Sable lavé de concassage 0/4', quantite: 70, unite: 'm³', prixUnitaireHT: 190.00, totalHT: 13300.00 },
      { id: 'bli-04', blId: 'bl-03', materiauId: 'mat-05', designation: 'Gravier concassé G1 (15/25)', quantite: 69.1, unite: 'm³', prixUnitaireHT: 165.00, totalHT: 11400.00 }
    ]
  }
];

export const INITIAL_DEPENSES: Depense[] = [
  { id: 'dep-01', chantierId: 'ch-01', date: '2026-03-12', categorie: 'MATERIAUX', designation: 'Achat 600 sacs Ciment CPJ45 LafargeHolcim', montantHT: 47100.00, montantTTC: 56520.00, fournisseurNom: 'LafargeHolcim Maroc', payePar: 'Virement bancaire' },
  { id: 'dep-02', chantierId: 'ch-01', date: '2026-03-18', categorie: 'MATERIAUX', designation: 'Lot 12 Tonnes Aciers Sonasid HA FeE500', montantHT: 112800.00, montantTTC: 135360.00, fournisseurNom: 'Sonasid Sidérurgie', payePar: 'Virement bancaire' },
  { id: 'dep-03', chantierId: 'ch-01', date: '2026-03-20', categorie: 'LOCATION_ENGINS', designation: 'Location Pelle Caterpillar 320 GC avec chauffeur (5 jours)', montantHT: 22500.00, montantTTC: 27000.00, fournisseurNom: 'Tractafric Equipment Maroc', payePar: 'Chèque barré' },
  { id: 'dep-04', chantierId: 'ch-01', date: '2026-03-25', categorie: 'MAIN_DOEUVRE', designation: 'Paie quinzaine équipe gros œuvre (10 ouvriers)', montantHT: 42350.00, montantTTC: 42350.00, payePar: 'Espèces avec émargement' },
  { id: 'dep-05', chantierId: 'ch-01', date: '2026-03-28', categorie: 'FRAIS_GENERAUX', designation: 'Branchement provisoire eau et électricité RADEEMA', montantHT: 8500.00, montantTTC: 10200.00, fournisseurNom: 'RADEEMA Marrakech', payePar: 'Chèque' }
];

export const INITIAL_POINTAGES: Pointage[] = [
  { id: 'pt-01', ouvrierId: 'ouv-01', chantierId: 'ch-01', datePointage: '2026-03-23', valeurPresence: 1, heuresSup: 2, notes: 'Supervision ferraillage semelles', valideParId: 'user-02' },
  { id: 'pt-02', ouvrierId: 'ouv-02', chantierId: 'ch-01', datePointage: '2026-03-23', valeurPresence: 1, heuresSup: 0, notes: '', valideParId: 'user-02' },
  { id: 'pt-03', ouvrierId: 'ouv-03', chantierId: 'ch-01', datePointage: '2026-03-23', valeurPresence: 1, heuresSup: 2, notes: 'Ligaturage armatures longrines', valideParId: 'user-02' },
  { id: 'pt-04', ouvrierId: 'ouv-04', chantierId: 'ch-01', datePointage: '2026-03-23', valeurPresence: 1, heuresSup: 1, notes: 'Coffrage joues de poutres', valideParId: 'user-02' },
  { id: 'pt-05', ouvrierId: 'ouv-05', chantierId: 'ch-01', datePointage: '2026-03-23', valeurPresence: 1, heuresSup: 0, notes: 'Aide coulage', valideParId: 'user-02' },
  { id: 'pt-06', ouvrierId: 'ouv-06', chantierId: 'ch-01', datePointage: '2026-03-23', valeurPresence: 0.5, heuresSup: 0, notes: 'Demi-journée matin', valideParId: 'user-02' },
  { id: 'pt-07', ouvrierId: 'ouv-07', chantierId: 'ch-01', datePointage: '2026-03-23', valeurPresence: 1, heuresSup: 0, notes: 'Passage fourreaux', valideParId: 'user-02' },
  { id: 'pt-08', ouvrierId: 'ouv-08', chantierId: 'ch-01', datePointage: '2026-03-23', valeurPresence: 0, heuresSup: 0, notes: 'Absent justifié', valideParId: 'user-02' },
  { id: 'pt-09', ouvrierId: 'ouv-09', chantierId: 'ch-01', datePointage: '2026-03-23', valeurPresence: 1, heuresSup: 0, notes: '', valideParId: 'user-02' },
  { id: 'pt-10', ouvrierId: 'ouv-10', chantierId: 'ch-01', datePointage: '2026-03-23', valeurPresence: 1, heuresSup: 0, notes: '', valideParId: 'user-02' }
];

export const INITIAL_ACOMPTES: AcomptePaie[] = [
  { id: 'ac-01', ouvrierId: 'ouv-02', chantierId: 'ch-01', date: '2026-03-15', montantMAD: 500.00, type: 'ACOMPTE_ESPECES', periodeDebut: '2026-03-01', periodeFin: '2026-03-15' },
  { id: 'ac-02', ouvrierId: 'ouv-05', chantierId: 'ch-01', date: '2026-03-15', montantMAD: 300.00, type: 'ACOMPTE_ESPECES', periodeDebut: '2026-03-01', periodeFin: '2026-03-15' }
];

export const INITIAL_JOURNAUX: JournalChantier[] = [
  {
    id: 'jc-01',
    chantierId: 'ch-01',
    date: '2026-03-23',
    meteo: 'ENSOLEILLE',
    temperature: 24,
    effectifPresent: 9,
    travauxExecutes: 'Coulage du béton B25 pour les semelles S1 à S8 de la zone Est. Pose des fers d\'attente poteaux en acier D14. Arrosage continu pour cure du béton.',
    problemesIncidents: 'Léger retard de 45 minutes de la deuxième toupie de béton en raison d\'un bouchon sur l\'avenue Abdelkrim Khattabi.',
    consignesSecurite: 'Port du casque et des bottes de sécurité vérifié sur l\'ensemble des compagnons. Clôture de protection autour des fouilles renforcée.',
    photos: [
      { url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800', legende: 'Coulage continu des semelles filantes zone Est' },
      { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800', legende: 'Vérification du ferraillage et ligaturage des attentes poteaux' }
    ],
    redigeParId: 'user-02'
  },
  {
    id: 'jc-02',
    chantierId: 'ch-01',
    date: '2026-03-24',
    meteo: 'NUAGEUX',
    temperature: 21,
    effectifPresent: 10,
    travauxExecutes: 'Décoffrage latéral des semelles et application d\'un enduit bitumineux d\'étanchéité Sika Igol sur les faces en contact avec le sol. Remblaiement périphérique au tout-venant.',
    problemesIncidents: 'Aucun incident à signaler. Contrôle de conformité de l\'étanchéité validé par le bureau de contrôle LPEE.',
    consignesSecurite: 'Zone de compactage balisée. Port des gants et masques lors de l\'application de l\'enduit bitumineux.',
    photos: [
      { url: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800', legende: 'Application de l\'enduit d\'étanchéité bitumineuse sur semelles' }
    ],
    redigeParId: 'user-02'
  }
];
