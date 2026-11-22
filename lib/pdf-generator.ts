import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Devis, Decompte, Chantier, CompanySettings, FactureVente, CommandeClient, BonLivraisonVente, EtatSituationData } from './types';
import { formatMAD, formatDateFR } from './store';

// ==========================================
// EXPORT PDF : DEVIS / DQE
// ==========================================
export function genererPDFDevis(devis: Devis, company: CompanySettings) {
  const doc = new jsPDF();

  // Header - Entreprise Marocaine
  doc.setFillColor(15, 23, 42); // Bleu ardoise #0F172A
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(company.raisonSociale, 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${company.adresse} — ${company.ville}`, 14, 22);
  doc.text(`Tél : ${company.telephone}  |  Email : ${company.email}`, 14, 28);

  // Badge DEVIS / DQE
  doc.setFillColor(249, 115, 22); // Orange BTP #F97316
  doc.roundedRect(150, 8, 48, 20, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS ESTIMATIF', 153, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${devis.reference}`, 153, 23);

  // Bloc Client & Projet
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT & MAÎTRE D\'OUVRAGE :', 14, 46);

  doc.setFont('helvetica', 'normal');
  doc.text(`Nom / Raison : ${devis.clientNom}`, 14, 52);
  doc.text(`ICE Client : ${devis.clientIce || 'Non spécifié'}`, 14, 57);
  doc.text(`Adresse / Ville : ${devis.clientAdresse || '-'}, ${devis.clientVille || '-'}`, 14, 62);
  doc.text(`Téléphone : ${devis.clientTel || '-'}`, 14, 67);

  // Cadre droit Date & Validité
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(125, 42, 73, 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(125, 42, 73, 26, 2, 2, 'D');

  doc.setFontSize(9);
  doc.text(`Date d'émission : ${formatDateFR(devis.dateDevis)}`, 129, 49);
  doc.text(`Validité de l'offre : ${formatDateFR(devis.dateValidite)}`, 129, 56);
  doc.text(`Délai d'exécution : ${devis.delaiExecution || '6 mois'}`, 129, 63);

  // Objet du Devis
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('OBJET DES TRAVAUX :', 14, 76);
  doc.setFont('helvetica', 'normal');
  doc.text(devis.objet, 14, 82, { maxWidth: 180 });

  // Tableau des Postes DQE
  const tableRows = devis.items.map((it, idx) => [
    idx + 1,
    it.lotNom || 'Travaux',
    it.designation,
    it.unite,
    it.quantite.toLocaleString('fr-FR'),
    it.prixUnitaireHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
    it.totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })
  ]);

  autoTable(doc, {
    startY: 88,
    head: [['N°', 'Lot', 'Désignation des Prestations', 'U', 'Qté', 'P.U. HT (MAD)', 'Total HT (MAD)']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 32 },
      2: { cellWidth: 70 },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 16, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 26, halign: 'right' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Récapitulatif Financier
  const summaryX = 125;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Hors Taxes (HT) :', summaryX, finalY);
  doc.text(formatMAD(devis.totalHT), 198, finalY, { align: 'right' });

  doc.text(`T.V.A. (${devis.tauxTva || 20} %) :`, summaryX, finalY + 6);
  doc.text(formatMAD(devis.montantTva), 198, finalY + 6, { align: 'right' });

  doc.setFillColor(249, 115, 22);
  doc.rect(summaryX - 2, finalY + 10, 75, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL NET TTC (MAD) :', summaryX + 2, finalY + 16);
  doc.text(formatMAD(devis.totalTTC), 198, finalY + 16, { align: 'right' });

  // Conditions & Signatures
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Modalités de paiement :', 14, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(devis.conditionsPaiement || '20% avance, situations mensuelles, 10% retenue de garantie.', 14, finalY + 5, { maxWidth: 105 });

  // Cadres Signatures
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, finalY + 18, 48, 26);
  doc.rect(68, finalY + 18, 48, 26);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Cachet & Signature Entreprise', 16, finalY + 23);
  doc.text('Bon pour Accord Client', 70, finalY + 23);

  // Footer mentions légales marocaines
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(241, 245, 249);
  doc.rect(0, pageHeight - 16, 210, 16, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const legalLine = `${company.raisonSociale} — ICE: ${company.ice} | IF: ${company.ifNum} | RC: ${company.rcNum} | CNSS: ${company.cnss} | Patente: ${company.patente}`;
  const bankLine = `Banque: ${company.banque} | RIB: ${company.rib}`;
  doc.text(legalLine, 105, pageHeight - 9, { align: 'center' });
  doc.text(bankLine, 105, pageHeight - 4, { align: 'center' });

  doc.save(`Devis_${devis.reference}.pdf`);
}

// ==========================================
// EXPORT PDF : FACTURE VENTE & DÉCOMPTE (SAGE 100 BTP)
// ==========================================
export function genererPDFFactureVente(facture: FactureVente, company: CompanySettings) {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(company.raisonSociale, 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${company.adresse} — ${company.ville}`, 14, 22);
  doc.text(`ICE : ${company.ice}  |  Tél : ${company.telephone}`, 14, 28);

  // Badge FACTURE
  const isDecompte = facture.typeFacture === 'DECOMPTE_PROVISOIRE';
  doc.setFillColor(isDecompte ? 16 : 249, isDecompte ? 185 : 115, isDecompte ? 129 : 22);
  doc.roundedRect(138, 8, 60, 20, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(isDecompte ? 'DÉCOMPTE TRAVAUX' : 'FACTURE DE VENTE', 141, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${facture.numeroFacture}`, 141, 23);

  // Bloc Client
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À :', 14, 46);

  doc.setFont('helvetica', 'normal');
  doc.text(`Raison Sociale : ${facture.clientNom}`, 14, 52);
  doc.text(`ICE Client : ${facture.clientIce || 'Non spécifié'}`, 14, 57);
  doc.text(`Ville / Destination : ${facture.clientVille || '-'}`, 14, 62);
  if (facture.chantierNom) {
    doc.text(`Chantier rattaché : ${facture.chantierNom}`, 14, 67);
  }

  // Bloc Dates & Échéance
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(125, 42, 73, 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(125, 42, 73, 26, 2, 2, 'D');

  doc.setFontSize(9);
  doc.text(`Date Facture : ${formatDateFR(facture.dateFacture)}`, 129, 49);
  doc.text(`Date Échéance : ${formatDateFR(facture.dateEcheance)}`, 129, 56);
  doc.text(`Statut Règlement : ${facture.statut}`, 129, 63);

  // Tableau des Prestations / Articles
  const tableRows = facture.items.map((it, idx) => [
    idx + 1,
    it.designation,
    it.unite || 'U',
    it.quantite.toLocaleString('fr-FR'),
    it.prixUnitaireHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
    it.totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 })
  ]);

  autoTable(doc, {
    startY: 76,
    head: [['N°', 'Désignation des Travaux / Fournitures', 'Unité', 'Quantité', 'P.U. HT (MAD)', 'Total HT (MAD)']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3.5
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 95 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 18, halign: 'right' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 26, halign: 'right' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Récapitulatif Financier
  const summaryX = 115;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Brut HT :', summaryX, finalY);
  doc.text(formatMAD(facture.totalHT), 198, finalY, { align: 'right' });

  let offset = 6;
  if (facture.retenueGarantiePct && facture.retenueGarantiePct > 0) {
    doc.text(`Retenue de garantie (${facture.retenueGarantiePct} %) :`, summaryX, finalY + offset);
    doc.text(`- ${formatMAD(facture.montantRetenueMAD)}`, 198, finalY + offset, { align: 'right' });
    offset += 6;
  }

  doc.text(`TVA (${facture.tauxTva || 20} %) :`, summaryX, finalY + offset);
  doc.text(formatMAD(facture.montantTva), 198, finalY + offset, { align: 'right' });
  offset += 7;

  doc.setFillColor(30, 41, 59);
  doc.rect(summaryX - 2, finalY + offset, 85, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL TTC (MAD) :', summaryX + 2, finalY + offset + 6);
  doc.text(formatMAD(facture.totalTTC), 198, finalY + offset + 6, { align: 'right' });
  offset += 14;

  // Montant Réglé et Solde Dû
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Montant déjà réglé :', summaryX, finalY + offset);
  doc.text(formatMAD(facture.montantRegle || 0), 198, finalY + offset, { align: 'right' });
  offset += 6;

  doc.setFillColor(241, 245, 249);
  doc.rect(summaryX - 2, finalY + offset, 85, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(facture.soldeDu > 0 ? 185 : 16, facture.soldeDu > 0 ? 28 : 185, facture.soldeDu > 0 ? 28 : 129);
  doc.text('NET RESTE À PAYER :', summaryX + 2, finalY + offset + 6);
  doc.text(formatMAD(facture.soldeDu || 0), 198, finalY + offset + 6, { align: 'right' });

  // Coordonnées bancaires pour virement
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMATIONS DE RÈGLEMENT :', 14, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Banque : ${company.banque}`, 14, finalY + 5);
  doc.text(`RIB : ${company.rib}`, 14, finalY + 10);
  doc.text(`Règlement par virement bancaire ou chèque barré à l'ordre de :`, 14, finalY + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(company.raisonSociale, 14, finalY + 20);

  // Footer mentions légales marocaines
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(241, 245, 249);
  doc.rect(0, pageHeight - 16, 210, 16, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const legalLine = `${company.raisonSociale} — ICE: ${company.ice} | IF: ${company.ifNum} | RC: ${company.rcNum} | CNSS: ${company.cnss} | Patente: ${company.patente}`;
  const bankLine = `Banque: ${company.banque} | RIB: ${company.rib}`;
  doc.text(legalLine, 105, pageHeight - 9, { align: 'center' });
  doc.text(bankLine, 105, pageHeight - 4, { align: 'center' });

  doc.save(`Facture_${facture.numeroFacture}.pdf`);
}

// ==========================================
// EXPORT PDF : COMMANDE CLIENT
// ==========================================
export function genererPDFCommandeClient(commande: CommandeClient, company: CompanySettings) {
  const doc = new jsPDF();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 36, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(company.raisonSociale, 14, 15);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${company.adresse} — ${company.ville}`, 14, 22);

  doc.setFillColor(59, 130, 246); // Bleu
  doc.roundedRect(138, 8, 60, 20, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BON DE COMMANDE', 141, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Réf : ${commande.reference}`, 141, 23);

  doc.save(`Commande_${commande.reference}.pdf`);
}

// ==========================================
// EXPORT PDF : BON DE LIVRAISON CLIENT
// ==========================================
export function genererPDFBonLivraison(bl: BonLivraisonVente, company: CompanySettings) {
  const doc = new jsPDF();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 36, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(company.raisonSociale, 14, 15);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${company.adresse} — ${company.ville}`, 14, 22);

  doc.setFillColor(245, 158, 11); // Amber
  doc.roundedRect(138, 8, 60, 20, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BON DE LIVRAISON', 141, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Réf : ${bl.reference}`, 141, 23);

  doc.save(`BL_${bl.reference}.pdf`);
}

// ==========================================
// EXPORT PDF : DÉCOMPTE BTP
// ==========================================
export function genererPDFDecompte(decompte: Decompte, chantier: Chantier, company: CompanySettings) {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(company.raisonSociale, 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${company.adresse} — ${company.ville}`, 14, 22);
  doc.text(`ICE : ${company.ice}  |  Tél : ${company.telephone}`, 14, 28);

  // Badge DÉCOMPTE D'AVANCEMENT
  doc.setFillColor(16, 185, 129); // Vert émeraude #10B981
  doc.roundedRect(140, 8, 58, 20, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DÉCOMPTE / SITUATION', 143, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Réf : ${decompte.numero}`, 143, 23);

  // Bloc Chantier & Client
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CHANTIER CONCERNÉ :', 14, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom : ${chantier.nom}`, 14, 52);
  doc.text(`Maître d'ouvrage : ${chantier.maitreOuvrage} (ICE: ${chantier.iceClient || 'N/A'})`, 14, 57);
  doc.text(`Localisation : ${chantier.adresse}, ${chantier.ville}`, 14, 62);
  doc.text(`Budget Global Marché : ${formatMAD(chantier.budgetTotalMAD)}`, 14, 67);

  // Période de la situation
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(125, 42, 73, 26, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(125, 42, 73, 26, 2, 2, 'D');

  doc.setFontSize(9);
  doc.text(`Date Situation : ${formatDateFR(decompte.dateDecompte)}`, 129, 49);
  doc.text(`Période du : ${formatDateFR(decompte.periodeDebut)}`, 129, 56);
  doc.text(`Au : ${formatDateFR(decompte.periodeFin)}`, 129, 63);

  // Tableau récapitulatif de la situation d'avancement
  const rows = [
    ['1', 'Avancement physique cumulé à date', `${decompte.pourcentageCumule} %`],
    ['2', 'Montant cumulé des travaux exécutés HT', formatMAD(decompte.montantCumuleHT)],
    ['3', 'Décompte précédent déjà facturé HT', formatMAD(decompte.montantPrecedentHT)],
    ['4', 'Montant brut de la présente situation HT (2 - 3)', formatMAD(decompte.montantPeriodeHT)],
    ['5', 'Retenue de garantie légale 10% (BTP Maroc)', `- ${formatMAD(decompte.retenueGarantie10Pct)}`],
    ['6', 'Net d\'avancement Hors Taxes (4 - 5)', formatMAD(decompte.netAPayerHT)],
    ['7', 'TVA 20% sur net HT', formatMAD(decompte.tva)],
    ['8', 'NET À PAYER TTC AU TITRE DU PRÉSENT DÉCOMPTE', formatMAD(decompte.montantTTC)]
  ];

  autoTable(doc, {
    startY: 76,
    head: [['Poste', 'Description du calcul de situation', 'Montant en MAD']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 125 },
      2: { cellWidth: 48, halign: 'right', fontStyle: 'bold' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;

  // Signatures
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, finalY, 55, 30);
  doc.rect(78, finalY, 55, 30);
  doc.rect(142, finalY, 55, 30);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Le Chef de Chantier', 16, finalY + 6);
  doc.text('Le Maître d\'Œuvre / Architecte', 80, finalY + 6);
  doc.text('Le Maître d\'Ouvrage (Client)', 144, finalY + 6);

  // Footer mentions légales
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(241, 245, 249);
  doc.rect(0, pageHeight - 16, 210, 16, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const legalLine = `${company.raisonSociale} — ICE: ${company.ice} | IF: ${company.ifNum} | RC: ${company.rcNum} | CNSS: ${company.cnss}`;
  const bankLine = `Banque: ${company.banque} | RIB: ${company.rib}`;
  doc.text(legalLine, 105, pageHeight - 9, { align: 'center' });
  doc.text(bankLine, 105, pageHeight - 4, { align: 'center' });

  doc.save(`Decompte_${decompte.numero}.pdf`);
}
