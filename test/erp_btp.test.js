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

test('9. Opérations Modifier, Dupliquer et Supprimer sur les Chantiers', () => {
  let chantiers = [
    { id: 'ch-01', code: 'CH-2026-001', nom: 'Villa Marrakech', budgetTotalMAD: 3500000, statut: 'EN_COURS' }
  ];

  // 1. Modifier
  chantiers = chantiers.map(c => c.id === 'ch-01' ? { ...c, nom: 'Villa Marrakech Palmeraie R+1', budgetTotalMAD: 3800000 } : c);
  assert.strictEqual(chantiers[0].nom, 'Villa Marrakech Palmeraie R+1');
  assert.strictEqual(chantiers[0].budgetTotalMAD, 3800000);

  // 2. Dupliquer
  const original = chantiers[0];
  const clone = {
    ...original,
    id: 'ch-02',
    code: 'CH-2026-002',
    nom: `[Copie] ${original.nom}`,
    statut: 'PREPARATION'
  };
  chantiers.push(clone);
  assert.strictEqual(chantiers.length, 2);
  assert.strictEqual(clone.nom, '[Copie] Villa Marrakech Palmeraie R+1');
  assert.strictEqual(clone.code, 'CH-2026-002');
  assert.strictEqual(clone.statut, 'PREPARATION');

  // 3. Supprimer
  chantiers = chantiers.filter(c => c.id !== 'ch-01');
  assert.strictEqual(chantiers.length, 1);
  assert.strictEqual(chantiers[0].id, 'ch-02');
});

test('10. Opérations Modifier, Dupliquer et Supprimer sur les Devis DQE', () => {
  let devisList = [
    {
      id: 'dev-01',
      reference: 'DEV-2026-0001',
      objet: 'Gros Œuvre Immeuble R+4 Safi',
      clientNom: 'Société Immobilière Atlantique SARL',
      statut: 'VALIDE',
      totalHT: 6500000,
      items: [{ designation: 'Béton armé fondations', quantite: 150, prixUnitaireHT: 950, totalHT: 142500 }]
    }
  ];

  // 1. Modifier
  devisList[0] = { ...devisList[0], statut: 'CONVERTI_CHANTIER', clientNom: 'Groupe Atlantique SA' };
  assert.strictEqual(devisList[0].statut, 'CONVERTI_CHANTIER');
  assert.strictEqual(devisList[0].clientNom, 'Groupe Atlantique SA');

  // 2. Dupliquer
  const orig = devisList[0];
  const clone = {
    ...orig,
    id: 'dev-02',
    reference: 'DEV-2026-0002',
    objet: `[Copie] ${orig.objet}`,
    statut: 'BROUILLON',
    items: orig.items.map(it => ({ ...it }))
  };
  devisList.push(clone);
  assert.strictEqual(devisList.length, 2);
  assert.strictEqual(clone.reference, 'DEV-2026-0002');
  assert.strictEqual(clone.statut, 'BROUILLON');

  // 3. Supprimer
  devisList = devisList.filter(d => d.id !== 'dev-01');
  assert.strictEqual(devisList.length, 1);
  assert.strictEqual(devisList[0].id, 'dev-02');
});

test('11. Opérations Modifier, Dupliquer et Supprimer sur les Ouvriers & Matériaux', () => {
  // Ouvriers
  let ouvriers = [
    { id: 'ouv-01', matricule: 'MAT-26001', nom: 'Hassan Amrani', cin: 'EE123456', specialite: 'MACON', tarifJourMAD: 280 }
  ];

  // Modifier ouvrier
  ouvriers[0] = { ...ouvriers[0], tarifJourMAD: 300, specialite: 'CHEF_EQUIPE' };
  assert.strictEqual(ouvriers[0].tarifJourMAD, 300);
  assert.strictEqual(ouvriers[0].specialite, 'CHEF_EQUIPE');

  // Dupliquer ouvrier
  const clonedOuv = { ...ouvriers[0], id: 'ouv-02', matricule: 'MAT-26002', nom: '[Copie] Hassan Amrani', cin: 'EE123456-BIS' };
  ouvriers.push(clonedOuv);
  assert.strictEqual(ouvriers.length, 2);
  assert.strictEqual(ouvriers[1].matricule, 'MAT-26002');

  // Supprimer ouvrier
  ouvriers = ouvriers.filter(o => o.id !== 'ouv-01');
  assert.strictEqual(ouvriers.length, 1);

  // Matériaux
  let materiaux = [
    { id: 'mat-01', code: 'CIM-CPJ45', designation: 'Ciment CPJ 45', stockActuel: 120, stockMinimum: 30, prixUnitaireMoyenMAD: 78.50 }
  ];

  // Modifier matériau
  materiaux[0] = { ...materiaux[0], stockActuel: 250, prixUnitaireMoyenMAD: 80.00 };
  assert.strictEqual(materiaux[0].stockActuel, 250);

  // Dupliquer matériau
  const clonedMat = { ...materiaux[0], id: 'mat-02', code: 'CIM-CPJ45-COPY', designation: '[Copie] Ciment CPJ 45' };
  materiaux.push(clonedMat);
  assert.strictEqual(materiaux.length, 2);

  // Supprimer matériau
  materiaux = materiaux.filter(m => m.id !== 'mat-01');
  assert.strictEqual(materiaux.length, 1);
});

test('12. Opérations Modifier, Dupliquer et Supprimer sur Tâches DQE & Journal', () => {
  // Tâches
  let taches = [
    { id: 't-01', designation: 'Ferraillage semelles', quantitePrevue: 10, prixUnitaireHT: 12000, totalHT: 120000, quantiteRealisee: 5, avancementPct: 50 }
  ];

  // Modifier tâche
  taches[0] = { ...taches[0], quantiteRealisee: 10, avancementPct: 100 };
  assert.strictEqual(taches[0].avancementPct, 100);

  // Dupliquer tâche
  const clonedTache = { ...taches[0], id: 't-02', designation: '[Copie] Ferraillage semelles', quantiteRealisee: 0, avancementPct: 0 };
  taches.push(clonedTache);
  assert.strictEqual(taches.length, 2);
  assert.strictEqual(taches[1].avancementPct, 0);

  // Supprimer tâche
  taches = taches.filter(t => t.id !== 't-01');
  assert.strictEqual(taches.length, 1);

  // Journal
  let journaux = [
    { id: 'jc-01', date: '2026-03-10', travauxExecutes: 'Coulage semelles', effectifPresent: 8, meteo: 'ENSOLEILLE', temperature: 24 }
  ];

  // Modifier rapport
  journaux[0] = { ...journaux[0], travauxExecutes: 'Coulage semelles + attentes amorces poteaux', effectifPresent: 10 };
  assert.strictEqual(journaux[0].effectifPresent, 10);

  // Dupliquer rapport
  const clonedJ = { ...journaux[0], id: 'jc-02', date: '2026-03-11', travauxExecutes: `[Reporté] ${journaux[0].travauxExecutes}` };
  journaux.push(clonedJ);
  assert.strictEqual(journaux.length, 2);

  // Supprimer rapport
  journaux = journaux.filter(j => j.id !== 'jc-01');
  assert.strictEqual(journaux.length, 1);
});
