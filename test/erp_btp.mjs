import { test } from 'node:test';
import assert from 'node:assert';
import { INITIAL_CHANTIERS, INITIAL_OUVRIERS, INITIAL_DEVIS, INITIAL_COMPANY } from '../lib/mock-data.ts';
import { store } from '../lib/store.ts';

test('1. Initial Seed Data & Moroccan Entities Verification', () => {
  assert.strictEqual(INITIAL_CHANTIERS.length, 3, 'Should have 3 initial chantiers in Morocco');
  assert.strictEqual(INITIAL_OUVRIERS.length, 10, 'Should have 10 initial construction workers');
  assert.strictEqual(INITIAL_DEVIS.length, 2, 'Should have 2 sample Devis DQE');
  assert.strictEqual(INITIAL_COMPANY.ice, '002891456000034', 'Company should have valid 15-digit Moroccan ICE');
  assert.strictEqual(INITIAL_COMPANY.tauxTva, 20, 'Moroccan TVA should be 20%');

  // Verify Cities
  const cities = INITIAL_CHANTIERS.map(c => c.ville);
  assert.ok(cities.includes('Marrakech'));
  assert.ok(cities.includes('Safi'));
  assert.ok(cities.includes('Casablanca'));
});

test('2. Dynamic Chantier Progress & DQE Task Recalculation', () => {
  const ch01 = store.chantiers.find(c => c.id === 'ch-01');
  assert.ok(ch01, 'Chantier 1 should exist');

  // Initial progress is 58%
  assert.strictEqual(ch01.avancementGlobalPct, 58);

  // Update a task in Lot 1
  store.updateTacheAvancement('ch-01', 'lot-01-ch01', 't-01', 420);
  assert.ok(ch01.avancementGlobalPct >= 50);
});

test('3. Devis DQE Creation & 1-Click Conversion to Active Chantier', () => {
  const initialChantiersCount = store.chantiers.length;

  const nouveauDevis = store.addDevis({
    dateDevis: '2026-04-01',
    dateValidite: '2026-07-01',
    clientNom: 'Société BTP Test SARL',
    clientIce: '002998877000011',
    clientTel: '+212 5 22 00 11 22',
    clientAdresse: 'Zone Industrielle Sapino',
    clientVille: 'Nouaceur',
    objet: 'Construction Magasin Stockage Pièces Industrielles',
    statut: 'VALIDE',
    items: [
      { id: 'item-1', devisId: '', lotNom: '01. Terrassement', designation: 'Fouilles en rigoles', unite: 'm³', quantite: 100, prixUnitaireHT: 90, totalHT: 9000 },
      { id: 'item-2', devisId: '', lotNom: '02. Gros Œuvre', designation: 'Béton armé B25', unite: 'm³', quantite: 50, prixUnitaireHT: 1500, totalHT: 75000 }
    ],
    tauxTva: 20,
    conditionsPaiement: 'Avance 20%',
    delaiExecution: '3 mois'
  });

  assert.strictEqual(nouveauDevis.totalHT, 84000);
  assert.strictEqual(nouveauDevis.montantTva, 16800);
  assert.strictEqual(nouveauDevis.totalTTC, 100800);

  // Convert to Chantier
  const nouveauChantier = store.convertirDevisEnChantier(nouveauDevis.id);
  assert.ok(nouveauChantier, 'Conversion should return new Chantier');
  assert.strictEqual(store.chantiers.length, initialChantiersCount + 1, 'Chantiers count should increase by 1');
  assert.strictEqual(nouveauDevis.statut, 'CONVERTI_CHANTIER');
  assert.strictEqual(nouveauChantier.budgetTotalMAD, 84000);
});

test('4. Décomptes d\'Avancement with 10% Guarantee Retention & 20% TVA', () => {
  const ch = store.chantiers[0];

  const decompte = store.creerDecompte(ch.id, 70, '2026-04-01', '2026-04-30');
  assert.ok(decompte, 'Decompte should be created');
  assert.strictEqual(decompte.statut, 'EMIS');
  assert.ok(decompte.retenueGarantie10Pct > 0, 'Should apply 10% legal guarantee retention');
  assert.ok(decompte.montantTTC > 0, 'Net to pay TTC should be computed');
});

test('5. Bon de Livraison Reception & Automatic Expense Imputation', () => {
  const ch = store.chantiers[0];
  const initialCost = ch.coutReelTotalMAD;
  const initialExpensesCount = store.depenses.length;

  const mat = store.materiaux[0];
  const initialStock = mat.stockActuel;

  const bl = store.enregistrerBonLivraison({
    numeroBL: 'BL-TEST-999',
    dateLivraison: '2026-04-10',
    chantierId: ch.id,
    fournisseurId: store.fournisseurs[0].id,
    statut: 'CONFORME',
    receptionneParId: 'user-02',
    notes: 'Livraison test',
    items: [
      { id: 'bli-t1', blId: '', materiauId: mat.id, designation: mat.designation, quantite: 50, unite: mat.unite, prixUnitaireHT: 78.50, totalHT: 3925.00 }
    ]
  });

  assert.strictEqual(bl.montantTotalHT, 3925);
  assert.strictEqual(mat.stockActuel, initialStock + 50, 'Stock should increase by delivered quantity');
  assert.strictEqual(store.depenses.length, initialExpensesCount + 1, 'Expense should be auto-recorded');
  assert.strictEqual(ch.coutReelTotalMAD, initialCost + 3925, 'Chantier real cost should increase');
});

test('6. Workforce Pointage & Labor Cost Imputation', () => {
  const ouv = store.ouvriers[0]; // 350 MAD/j
  const ch = store.chantiers[0];
  const initialCost = ch.coutReelTotalMAD;

  store.enregistrerPointage({
    ouvrierId: ouv.id,
    chantierId: ch.id,
    datePointage: '2026-04-12',
    valeurPresence: 1, // 1 full day
    heuresSup: 0,
    valideParId: 'user-02'
  });

  assert.strictEqual(ch.coutReelTotalMAD, initialCost + 350, 'Chantier cost should reflect 1 day wage');
});

test('7. Executive Dashboard KPIs Aggregation in MAD', () => {
  const kpis = store.getExecutiveKPIs();

  assert.ok(kpis.caEngage > 0, 'CA engage should be positive');
  assert.ok(kpis.chantiersActifs > 0, 'Active chantiers should be positive');
  assert.ok(kpis.margeNetteMAD > 0, 'Net margin should be positive');
});

test('8. Role Switcher & Permissions', () => {
  store.switchRole('CHEF_CHANTIER');
  assert.strictEqual(store.currentUser.role, 'CHEF_CHANTIER');
  assert.strictEqual(store.currentUser.nom, 'Amine El Idrissi');

  store.switchRole('COMPTABLE');
  assert.strictEqual(store.currentUser.role, 'COMPTABLE');
  assert.strictEqual(store.currentUser.nom, 'Fatima Zahra Mansouri');

  store.switchRole('GERANT_ADMIN');
  assert.strictEqual(store.currentUser.role, 'GERANT_ADMIN');
  assert.strictEqual(store.currentUser.nom, 'Youssef Benjelloun');
});
