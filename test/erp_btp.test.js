const { test } = require('node:test');
const assert = require('node:assert');

test('1. Structure & Intégrité des Données de Démonstration (Maroc)', () => {
  // Test Moroccan fiscal & legal rules
  const tvaRate = 20; // 20% TVA au Maroc
  const retenueGarantieRate = 0.10; // 10% retenue de garantie BTP Maroc

  const totalHT = 100000;
  const tva = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + tva;
  assert.strictEqual(tva, 20000);
  assert.strictEqual(totalTTC, 120000);

  // Retenue de garantie sur situation
  const retenue = totalHT * retenueGarantieRate;
  const netHT = totalHT - retenue;
  assert.strictEqual(retenue, 10000);
  assert.strictEqual(netHT, 90000);
});

test('2. Formatage Monétaire en Dirham Marocain (MAD)', () => {
  function formatMAD(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return '0,00 MAD';
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace('MAD', '').trim() + ' MAD';
  }

  const res1 = formatMAD(3450000);
  assert.ok(res1.includes('3') && res1.includes('450') && res1.includes('MAD'));

  const res2 = formatMAD(0);
  assert.strictEqual(res2, '0,00 MAD');
});

test('3. Algorithme de Calcul Pondéré d\'Avancement des Lots DQE', () => {
  const lots = [
    { titre: '01. Terrassement', budgetLotMAD: 450000, avancementPct: 100 },
    { titre: '02. Béton Armé', budgetLotMAD: 890000, avancementPct: 90 },
    { titre: '03. Maçonnerie', budgetLotMAD: 380000, avancementPct: 65 },
    { titre: '04. Étanchéité', budgetLotMAD: 220000, avancementPct: 40 },
    { titre: '05. Électricité', budgetLotMAD: 490000, avancementPct: 25 },
    { titre: '06. Revêtements', budgetLotMAD: 620000, avancementPct: 0 }
  ];

  const totalBudget = lots.reduce((s, l) => s + l.budgetLotMAD, 0);
  let weightedProgress = 0;
  lots.forEach(l => {
    weightedProgress += (l.budgetLotMAD * l.avancementPct);
  });

  const avancementGlobal = Math.round(weightedProgress / totalBudget);
  assert.strictEqual(avancementGlobal, 56, `Avancement global calculé : ${avancementGlobal}%`);
});

test('4. Conversion d\'un Devis DQE en Chantier Actif', () => {
  const devis = {
    id: 'dev-test-1',
    reference: 'DEV-2026-0099',
    objet: 'Construction Hangar Berrechid',
    clientNom: 'Société Industrielle Berrechid SARL',
    clientTel: '+212 5 23 32 00 11',
    clientIce: '002345678000091',
    totalHT: 1500000,
    items: [
      { lotNom: '01. Terrassement', designation: 'Décapage sol', quantite: 1000, prixUnitaireHT: 35, totalHT: 35000 },
      { lotNom: '02. Dallage', designation: 'Dallage quartzé', quantite: 1200, prixUnitaireHT: 280, totalHT: 336000 }
    ]
  };

  // Simulation conversion
  const nouveauChantier = {
    id: 'ch-test-1',
    code: 'CH-2026-004',
    nom: devis.objet,
    maitreOuvrage: devis.clientNom,
    budgetTotalMAD: devis.totalHT,
    coutReelTotalMAD: 0,
    avancementGlobalPct: 0,
    statut: 'EN_COURS'
  };

  assert.strictEqual(nouveauChantier.budgetTotalMAD, 1500000);
  assert.strictEqual(nouveauChantier.statut, 'EN_COURS');
  assert.strictEqual(nouveauChantier.avancementGlobalPct, 0);
});

test('5. Imputation Analytique d\'un Bon de Livraison (BL) Matériaux', () => {
  let stockActuelCiment = 340;
  let coutReelChantier = 1820000;

  const bl = {
    numeroBL: 'BL-2026-105',
    quantite: 200, // 200 sacs
    prixUnitaireHT: 78.50, // MAD
    totalHT: 200 * 78.50 // 15700 MAD
  };

  // Réception
  stockActuelCiment += bl.quantite;
  coutReelChantier += bl.totalHT;

  assert.strictEqual(stockActuelCiment, 540);
  assert.strictEqual(coutReelChantier, 1835700);
});

test('6. Saisie de Pointage & Calcul Coût Main-d\'Œuvre avec Heures Sup', () => {
  const ouvrier = {
    nom: 'Brahim El Ouahed',
    specialite: 'FERRAILLEUR',
    tarifJourMAD: 270.00
  };

  const pointage = {
    valeurPresence: 1, // Journée complète
    heuresSup: 2 // 2h supplémentaires
  };

  const tauxHoraireNormal = ouvrier.tarifJourMAD / 8; // 8 heures par jour
  const tauxHoraireSup = tauxHoraireNormal * 1.25; // Majoration légale 25%

  const coutTotalJournee = (pointage.valeurPresence * ouvrier.tarifJourMAD) + (pointage.heuresSup * tauxHoraireSup);

  assert.strictEqual(coutTotalJournee, 270 + (2 * (270 / 8) * 1.25));
  assert.strictEqual(coutTotalJournee, 354.375);
});

test('7. Calcul Situation & Décompte d\'Avancement BTP Maroc', () => {
  const budgetMarcheHT = 3450000;
  const avancementCumulePct = 60; // 60% à date
  const precedentFactureHT = 1207500; // Situation N-1

  const cumuleHT = budgetMarcheHT * (avancementCumulePct / 100); // 2 070 000
  const brutPeriodeHT = cumuleHT - precedentFactureHT; // 862 500
  const retenueGarantie10 = brutPeriodeHT * 0.10; // 86 250
  const netHT = brutPeriodeHT - retenueGarantie10; // 776 250
  const tva20 = netHT * 0.20; // 155 250
  const netTTC = netHT + tva20; // 931 500

  assert.strictEqual(cumuleHT, 2070000);
  assert.strictEqual(brutPeriodeHT, 862500);
  assert.strictEqual(retenueGarantie10, 86250);
  assert.strictEqual(netHT, 776250);
  assert.strictEqual(tva20, 155250);
  assert.strictEqual(netTTC, 931500);
});

test('8. Permissions & Rôles Métier BTP (Gérant, Chef de Chantier, Comptable)', () => {
  const roles = ['GERANT_ADMIN', 'CHEF_CHANTIER', 'COMPTABLE'];

  function checkPermission(role, module) {
    if (role === 'GERANT_ADMIN') return true; // accès total
    if (role === 'CHEF_CHANTIER') {
      return ['chantiers_assignes', 'pointage', 'reception_bl', 'journal_terrain'].includes(module);
    }
    if (role === 'COMPTABLE') {
      return ['devis', 'decomptes', 'factures', 'depenses', 'paies'].includes(module);
    }
    return false;
  }

  // Chef de chantier
  assert.strictEqual(checkPermission('CHEF_CHANTIER', 'pointage'), true);
  assert.strictEqual(checkPermission('CHEF_CHANTIER', 'journal_terrain'), true);
  assert.strictEqual(checkPermission('CHEF_CHANTIER', 'parametres_fiscaux'), false);

  // Comptable
  assert.strictEqual(checkPermission('COMPTABLE', 'devis'), true);
  assert.strictEqual(checkPermission('COMPTABLE', 'decomptes'), true);
  assert.strictEqual(checkPermission('COMPTABLE', 'journal_terrain'), false);

  // Gérant Admin
  assert.strictEqual(checkPermission('GERANT_ADMIN', 'parametres_fiscaux'), true);
  assert.strictEqual(checkPermission('GERANT_ADMIN', 'pointage'), true);
});
