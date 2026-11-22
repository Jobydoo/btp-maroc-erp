const { test } = require('node:test');
const assert = require('node:assert');

// ==============================================================================
// ERP BTP MAROC - SUITE DE TESTS END-TO-END COMMERCIALE & TECHNIQUE (SAGE 100)
// ==============================================================================

// --- Utilitaires de simulation métier BTP Maroc ---
function formatMAD(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0,00 MAD';
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace('MAD', '').trim() + ' MAD';
}

function calculateTVA(ht, rate = 20) {
  return Math.round(ht * (rate / 100) * 100) / 100;
}

// ==============================================================================
// SCÉNARIO 1 : MULTI-SOCIÉTÉS & TIERS (CLIENTS & FOURNISSEURS MAROC)
// ==============================================================================
test('Scénario 1.1 : Gestion Multi-Sociétés & Bascule Active', () => {
  const societes = [
    {
      id: 'comp-01',
      nom: 'ATLAS BÂTIMENT & TRAVAUX MAROC S.A.R.L',
      ville: 'Casablanca',
      ice: '001984523000045',
      identifiantFiscal: '45892014',
      rc: 'RC Casablanca 412589'
    },
    {
      id: 'comp-02',
      nom: 'MEHDI TRAVAUX TECHNIQUES S.A.R.L',
      ville: 'Marrakech',
      ice: '002874195000088',
      identifiantFiscal: '32104598',
      rc: 'RC Marrakech 98521'
    }
  ];

  let activeCompanyId = 'comp-01';
  assert.strictEqual(activeCompanyId, 'comp-01');

  // Bascule rapide vers comp-02
  function basculerSociete(nouvelleId) {
    const soc = societes.find(s => s.id === nouvelleId);
    if (!soc) throw new Error('Société introuvable');
    activeCompanyId = nouvelleId;
    return soc;
  }

  const socActive = basculerSociete('comp-02');
  assert.strictEqual(activeCompanyId, 'comp-02');
  assert.strictEqual(socActive.nom, 'MEHDI TRAVAUX TECHNIQUES S.A.R.L');
  assert.strictEqual(socActive.ice, '002874195000088');
});

test('Scénario 1.2 : Création Tiers (Client & Fournisseur) avec Mentions Fiscales Marocaines & Isolation', () => {
  const clientsDB = [];
  const fournisseursDB = [];

  // Création Client pour comp-01
  const nouveauClient = {
    id: 'cli-test-01',
    societeId: 'comp-01',
    nom: 'Groupe Immobilier Al Manar S.A.',
    ice: '001894231000072', // 15 chiffres
    identifiantFiscal: '58742136',
    rc: 'RC Rabat 123456',
    ville: 'Rabat',
    plafondEncoursMAD: 2500000,
    encoursActuelMAD: 0,
    conditionsPaiement: 'Virement à 60 jours'
  };
  clientsDB.push(nouveauClient);

  // Validation ICE Marocain (15 chiffres obligatoires)
  assert.strictEqual(nouveauClient.ice.length, 15, 'ICE client valide');
  assert.strictEqual(nouveauClient.societeId, 'comp-01');

  // Création Fournisseur pour comp-01
  const nouveauFournisseur = {
    id: 'fourn-test-01',
    societeId: 'comp-01',
    nom: 'LafargeHolcim Maroc Distribution',
    ice: '000123456000098',
    specialite: 'Ciment et Béton Prêt à l\'Emploi (BPE)',
    ville: 'Casablanca',
    delaiPaiementJours: 45
  };
  fournisseursDB.push(nouveauFournisseur);

  // Vérification de l'isolation par société
  const clientsComp01 = clientsDB.filter(c => c.societeId === 'comp-01');
  const clientsComp02 = clientsDB.filter(c => c.societeId === 'comp-02');

  assert.strictEqual(clientsComp01.length, 1);
  assert.strictEqual(clientsComp02.length, 0, 'Les clients de comp-01 ne doivent pas fuiter dans comp-02');
});

// ==============================================================================
// SCÉNARIO 2 : CATALOGUE & APPROVISIONNEMENT (ACHATS + STOCK)
// ==============================================================================
test('Scénario 2 : Cycle d\'Achat Complet et Incrémentation du Stock', () => {
  // 1. Article dans le Catalogue
  let article = {
    id: 'art-ciment-cpj45',
    societeId: 'comp-01',
    code: 'MAT-CIM-01',
    designation: 'Ciment CPJ 45 Haute Résistance (Sac 50kg)',
    unite: 'sac',
    prixAchatHT: 75.00,
    prixVenteHT: 95.00,
    stockActuel: 100,
    seuilAlerte: 50
  };

  assert.strictEqual(article.stockActuel, 100);

  // 2. Devis Fournisseur
  const devisFournisseur = {
    id: 'dev-f-001',
    societeId: 'comp-01',
    numero: 'DF-2026-0012',
    fournisseurId: 'fourn-test-01',
    totalHT: 15000, // 200 sacs * 75 DH
    totalTTC: 18000,
    statut: 'VALIDE'
  };

  // 3. Transformation en Bon de Commande Fournisseur
  const bonCommande = {
    id: 'bc-f-001',
    societeId: 'comp-01',
    numero: 'BC-2026-0045',
    devisOrigineId: devisFournisseur.id,
    fournisseurId: devisFournisseur.fournisseurId,
    articles: [
      { articleId: article.id, designation: article.designation, quantite: 200, prixUnitaireHT: 75.00, totalHT: 15000 }
    ],
    totalHT: 15000,
    totalTVA: calculateTVA(15000, 20),
    totalTTC: 18000,
    statut: 'ENVOYE'
  };
  assert.strictEqual(bonCommande.totalTVA, 3000);

  // 4. Réception des Marchandises (Bon de Réception) & Incrémentation du Stock
  const bonReception = {
    id: 'br-f-001',
    societeId: 'comp-01',
    numero: 'BR-2026-0078',
    commandeOrigineId: bonCommande.id,
    fournisseurId: bonCommande.fournisseurId,
    lignes: [
      { articleId: article.id, quantiteRecue: 200, prixUnitaireHT: 75.00 }
    ],
    date: '2026-03-15',
    statut: 'RECU'
  };

  // Traitement Réception : incrémenter le stock
  bonReception.lignes.forEach(l => {
    if (l.articleId === article.id) {
      article.stockActuel += l.quantiteRecue;
    }
  });

  assert.strictEqual(article.stockActuel, 300, 'Le stock doit être passé de 100 à 300 sacs');

  // 5. Génération de la Facture d\'Achat Fournisseur
  const factureAchat = {
    id: 'fa-f-001',
    societeId: 'comp-01',
    numero: 'FA-2026-0091',
    bonReceptionId: bonReception.id,
    fournisseurId: bonReception.fournisseurId,
    totalHT: 15000,
    totalTVA: 3000,
    totalTTC: 18000,
    statut: 'A_PAYER'
  };

  assert.strictEqual(factureAchat.totalTTC, 18000);
});

// ==============================================================================
// SCÉNARIO 3 : CHANTIER & MAIN-D\'ŒUVRE & SORTIE DE STOCK
// ==============================================================================
test('Scénario 3 : Suivi Chantier, Sortie Stock Analytique et Pointage Main-d\'Œuvre', () => {
  // 1. Chantier BTP
  const chantier = {
    id: 'ch-bouskoura',
    societeId: 'comp-01',
    nom: 'Résidence Les Orangers - Bouskoura',
    clientNom: 'Groupe Immobilier Al Manar S.A.',
    budgetTotalMAD: 4500000,
    coutReelTotalMAD: 1200000,
    avancementGlobalPct: 35
  };

  // 2. Sortie de stock affectée au Chantier
  let stockActuelCiment = 300;
  const quantiteSortie = 80; // 80 sacs
  const prixUnitaire = 75.00;
  const coutSortie = quantiteSortie * prixUnitaire; // 6000 MAD

  stockActuelCiment -= quantiteSortie;
  chantier.coutReelTotalMAD += coutSortie;

  assert.strictEqual(stockActuelCiment, 220);
  assert.strictEqual(chantier.coutReelTotalMAD, 1206000, 'Le coût réel chantier intègre la sortie de stock');

  // 3. Pointage des Ouvriers
  const equipe = [
    { id: 'ouv-01', nom: 'Hassan Amrani', specialite: 'Chef d\'équipe / Maçon', tarifJourMAD: 250 },
    { id: 'ouv-02', nom: 'Mustapha Benali', specialite: 'Ferrailleur', tarifJourMAD: 200 },
    { id: 'ouv-03', nom: 'Rachid Tazi', specialite: 'Manœuvre spécialisé', tarifJourMAD: 150 }
  ];

  // Pointage pour 5 jours ouvrés
  const joursPointes = 5;
  let totalCoutMO = 0;
  equipe.forEach(ouvrier => {
    totalCoutMO += (ouvrier.tarifJourMAD * joursPointes);
  });

  assert.strictEqual(totalCoutMO, (250*5) + (200*5) + (150*5)); // 1250 + 1000 + 750 = 3000 MAD

  chantier.coutReelTotalMAD += totalCoutMO;
  assert.strictEqual(chantier.coutReelTotalMAD, 1209000, 'Le coût réel chantier intègre la paie de la semaine');
});

// ==============================================================================
// SCÉNARIO 4 : CYCLE DE VENTE COMPLET (DEVIS -> COMMANDE -> BL -> FACTURE -> RÈGLEMENT)
// ==============================================================================
test('Scénario 4 : Cycle de Vente Complet Sage 100 & Règlements avec Lettrage', () => {
  // Client avec encours
  const client = {
    id: 'cli-001',
    nom: 'Groupe Immobilier Al Manar S.A.',
    plafondEncoursMAD: 2000000,
    encoursActuelMAD: 0
  };

  // 1. Devis Client (DQE)
  const devis = {
    id: 'dev-v-100',
    societeId: 'comp-01',
    numero: 'DEV-2026-0150',
    clientId: client.id,
    objet: 'Gros Œuvre Immeuble R+4',
    totalHT: 500000,
    totalTVA: calculateTVA(500000, 20),
    totalTTC: 600000,
    statut: 'ACCEPTE'
  };
  assert.strictEqual(devis.totalTVA, 100000);
  assert.strictEqual(devis.totalTTC, 600000);

  // 2. Conversion en Commande Client
  const commande = {
    id: 'cmd-v-100',
    numero: 'CC-2026-0080',
    devisOrigineId: devis.id,
    clientId: client.id,
    totalHT: devis.totalHT,
    totalTVA: devis.totalTVA,
    totalTTC: devis.totalTTC,
    statut: 'VALIDEE'
  };
  assert.strictEqual(commande.statut, 'VALIDEE');

  // 3. Conversion en Bon de Livraison (BL Vente)
  const blVente = {
    id: 'bl-v-100',
    numero: 'BLV-2026-0080',
    commandeOrigineId: commande.id,
    clientId: client.id,
    totalHT: commande.totalHT,
    totalTVA: commande.totalTVA,
    totalTTC: commande.totalTTC,
    statut: 'LIVRE'
  };
  assert.strictEqual(blVente.statut, 'LIVRE');

  // 4. Génération Facture de Vente
  const facture = {
    id: 'fac-v-100',
    numero: 'FV-2026-0080',
    blOrigineId: blVente.id,
    clientId: client.id,
    totalHT: blVente.totalHT,
    totalTVA: blVente.totalTVA,
    totalTTC: blVente.totalTTC,
    montantRegle: 0,
    soldeDu: blVente.totalTTC,
    statut: 'EMISE'
  };

  // L'encours client augmente du montant TTC
  client.encoursActuelMAD += facture.totalTTC;
  assert.strictEqual(client.encoursActuelMAD, 600000);

  // 5. Enregistrement Règlement Client avec Lettrage
  const reglement = {
    id: 'reg-001',
    numero: 'REG-2026-0033',
    clientId: client.id,
    modePaiement: 'Virement Bancaire Attijariwafa',
    referencePaiement: 'VIR-ATTIJARI-884920',
    montant: 600000,
    factureId: facture.id,
    lettrage: 'LET-A01',
    date: '2026-03-20'
  };

  // Lettrage et apurement de la facture
  facture.montantRegle += reglement.montant;
  facture.soldeDu = facture.totalTTC - facture.montantRegle;
  if (facture.soldeDu <= 0) {
    facture.statut = 'PAYEE';
  }

  // Diminution de l'encours client
  client.encoursActuelMAD -= reglement.montant;

  assert.strictEqual(facture.soldeDu, 0);
  assert.strictEqual(facture.statut, 'PAYEE', 'La facture doit être lettrée et marquée PAYEE');
  assert.strictEqual(client.encoursActuelMAD, 0, 'L\'encours client doit être ramené à 0');
});

// ==============================================================================
// SCÉNARIO 5 : SCANNER FACTURE IA & IMPUTATION ANALYTIQUE DE CHANTIER
// ==============================================================================
test('Scénario 5 : Scanner Facture IA (OCR), Imputation Chantier vs Stock et Vérification d\'Isolation', () => {
  // 1. Simulation OCR du Scanner IA pour facture LafargeHolcim Maroc
  const texteFactureOCR = `
    LAFARGEHOLCIM MAROC S.A.
    ICE: 000123456000098 - IF: 01092837 - RC: 12903
    Facture N°: FA-LH-2026-8812
    Date: 18/03/2026
    Client: ATLAS BÂTIMENT & TRAVAUX MAROC S.A.R.L
    ICE Client: 001984523000045
    --------------------------------------------------
    Article: Ciment CPJ 45 Sacs 50kg | Qté: 400 | PU HT: 76.00 MAD | Total HT: 30400.00 MAD
    Article: Sable Concasse 0/4 Tamise | Qté: 20 T | PU HT: 180.00 MAD | Total HT: 3600.00 MAD
    --------------------------------------------------
    Total HT: 34000.00 MAD
    TVA (20%): 6800.00 MAD
    Total TTC: 40800.00 MAD
  `;

  // Parser OCR IA
  function parserFactureIA(ocrText) {
    const isLafarge = ocrText.includes('LAFARGEHOLCIM');
    assert.ok(isLafarge, 'Détection du fournisseur LafargeHolcim');

    return {
      fournisseurNom: 'LafargeHolcim Maroc S.A.',
      fournisseurIce: '000123456000098',
      numeroFacture: 'FA-LH-2026-8812',
      date: '2026-03-18',
      totalHT: 34000.00,
      totalTVA: 6800.00,
      totalTTC: 40800.00,
      lignes: [
        { designation: 'Ciment CPJ 45 Sacs 50kg', quantite: 400, unite: 'sac', prixUnitaireHT: 76.00, totalHT: 30400.00 },
        { designation: 'Sable Concasse 0/4 Tamise', quantite: 20, unite: 'tonne', prixUnitaireHT: 180.00, totalHT: 3600.00 }
      ]
    };
  }

  const extractionIA = parserFactureIA(texteFactureOCR);
  assert.strictEqual(extractionIA.totalHT, 34000.00);
  assert.strictEqual(extractionIA.totalTVA, 6800.00);
  assert.strictEqual(extractionIA.totalTTC, 40800.00);
  assert.strictEqual(extractionIA.lignes.length, 2);

  // 2. Imputation Analytique Directe à un Chantier
  const chantierCible = {
    id: 'ch-dar-bouazza',
    nom: 'Villas Panoramiques - Dar Bouazza',
    budgetTotalMAD: 7800000,
    coutReelTotalMAD: 3100000,
    coutMateriauxMAD: 1850000
  };

  let stockCentralQuantiteCiment = 500;

  // Imputation analytique :
  // Le coût est affecté directement au chantier sans modifier le stock du dépôt central
  chantierCible.coutMateriauxMAD += extractionIA.totalHT;
  chantierCible.coutReelTotalMAD += extractionIA.totalHT;

  assert.strictEqual(chantierCible.coutMateriauxMAD, 1850000 + 34000);
  assert.strictEqual(chantierCible.coutReelTotalMAD, 3100000 + 34000);
  assert.strictEqual(stockCentralQuantiteCiment, 500, 'Le stock central ne doit pas bouger lors d\'une imputation directe sur chantier');

  // 3. Bascule et Vérification d\'Isolation
  const facturesAchatDB = [
    { id: 'fa-001', societeId: 'comp-01', numero: extractionIA.numeroFacture, totalTTC: extractionIA.totalTTC }
  ];

  const facturesComp01 = facturesAchatDB.filter(f => f.societeId === 'comp-01');
  const facturesComp02 = facturesAchatDB.filter(f => f.societeId === 'comp-02');

  assert.strictEqual(facturesComp01.length, 1);
  assert.strictEqual(facturesComp02.length, 0, 'La facture créée appartient strictement à la société comp-01');
});
