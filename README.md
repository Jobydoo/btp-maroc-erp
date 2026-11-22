# ATLAS BTP MAROC — ERP Moderne de Gestion de Chantiers & Construction

[![Next.js Version](https://img.shields.io/badge/Next.js-v14.2.18%20(App%20Router)-black.svg?logo=next.js)](https://nextjs.org/)
[![React Version](https://img.shields.io/badge/React-v18.3.1-blue.svg?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-8%2F8%20Passing%20(100%25)-success.svg)]()
[![Réglementation Maroc](https://img.shields.io/badge/Conformit%C3%A9-ICE%20%7C%20IF%20%7C%20RC%20%7C%20CNSS-red.svg)]()

Solution web full-stack, moderne, rapide et responsive conçue spécifiquement pour les **entreprises de construction, entreprises générales de BTP et promoteurs immobiliers au Maroc**.

Elle relie en temps réel le travail de **bureau** (devis DQE, facturation, situations de travaux, achats, marges) et le **terrain** (pointage des ouvriers sur smartphone, réceptions des matériaux par bon de livraison, journal quotidien avec photos).

---

## 🏛️ Architecture & Modules Métiers

```text
btp-maroc-erp/
├── app/
│   ├── layout.tsx                # Structure globale, Thème Bleu Ardoise (#0F172A) & Orange Sécurité (#F97316)
│   ├── page.tsx                  # Redirection automatique vers /dashboard
│   ├── dashboard/page.tsx        # Tableau de bord exécutif (KPIs en MAD, Graphique Budget vs Réel, Alertes)
│   ├── chantiers/
│   │   ├── page.tsx              # Répertoire des chantiers (Recherche, filtres type/ville, création)
│   │   └── [id]/page.tsx         # Fiche 360° du chantier (6 Onglets Métier : Vue, Lots DQE, BL, Équipe, Dépenses, Journal)
│   ├── devis/
│   │   ├── page.tsx              # Devis DQE, Décomptes d'avancement & Conversion en Chantier
│   │   └── nouveau/page.tsx      # Éditeur de bordereau des prix DQE par lots (TVA 20%, MAD)
│   ├── materiaux/page.tsx        # Stocks, jauges de seuil critique & Fournisseurs agréés (LafargeHolcim, Sonasid...)
│   ├── ouvriers/
│   │   ├── page.tsx              # Annuaire main-d'œuvre (CIN, spécialités, tarifs/j) & calcul des paies
│   │   └── pointage/page.tsx     # Grille de pointage journalier express (1j, ½j, absent, heures sup)
│   ├── journal/page.tsx          # Journal de bord mobile-first (Météo, effectifs, travaux, incidents, photos)
│   └── parametres/page.tsx       # Mentions légales marocaines (ICE, IF, RC, Patente, CNSS, RIB)
├── components/
│   ├── Navbar.tsx                # ShellBar avec Sélecteur instantané de Rôle (Gérant, Chef, Comptable)
│   └── Sidebar.tsx               # Navigation latérale avec compteurs réactifs en temps réel
├── lib/
│   ├── types.ts                  # Définitions TypeScript complètes (14 entités BTP)
│   ├── mock-data.ts              # Données de démonstration marocaines (Marrakech, Safi, Casablanca, 10 ouvriers)
│   ├── store.ts                  # Reactive In-Memory & LocalStorage Data Store
│   └── pdf-generator.ts          # Générateur officiel de Devis et Décomptes PDF certifiés
└── test/
    └── erp_btp.test.js           # Suite de tests unitaires automatisés (100% passants)
```

---

## 🇲🇦 Fonctionnalités Spécialisées pour le BTP au Maroc

### 1. Authentification & Sélecteur de Rôles Interactif
* **Administrateur / Gérant (`GERANT_ADMIN`)** : Contrôle complet des finances, marges nettes, validation des offres et configuration fiscale.
* **Chef de Chantier (`CHEF_CHANTIER`)** : Vue opérationnelle sur les chantiers assignés, saisie du pointage journalier, réception des bons de livraison (BL) et rédaction du journal de chantier avec photos.
* **Responsable Comptable (`COMPTABLE`)** : Accès direct aux devis, situations de travaux (décomptes), dépenses analytiques et gestion de la paie des compagnons.

### 2. Tableau de Bord Exécutif (Dashboard)
* **KPIs consolidés en Dirham Marocain (MAD)** :
  * Chiffre d'affaires engagé sur l'ensemble des marchés.
  * Dépenses réelles du mois en cours (Matériaux, Main-d'œuvre, Engins, Sous-traitance).
  * Marge nette prévisionnelle (en MAD et en %).
  * Nombre de chantiers actifs et alertes prioritaires.
* **Graphique comparatif Budget prévu vs Coût réel** par chantier avec jauge de consommation financière.
* **Bloc d'alertes automatiques** : ruptures de stocks imminentes (ciment, aciers, sables) et décomptes clients impayés.

### 3. Gestion Complète des Chantiers (Fiche 6-en-1)
Chaque chantier dispose de 6 onglets métiers synchronisés :
1. **Vue d'ensemble** : Données du maître d'ouvrage, ICE client, géolocalisation, météo locale en direct et décomposition analytique des coûts.
2. **Lots & DQE** : Décomposition par lots de travaux (*Terrassement, Béton armé, Maçonnerie, Étanchéité, etc.*). Modification de la quantité réalisée recalculant immédiatement l'avancement global du chantier.
3. **Matériaux & BL** : Historique des réceptions avec imputation automatique du montant sur les dépenses du chantier.
4. **Équipe & Pointage** : Liste des ouvriers affectés avec saisie tactile journalière.
5. **Dépenses** : Comptabilité analytique ventilée par poste.
6. **Journal & Photos** : Journal de bord terrain avec photos haute résolution d'avancement.

### 4. Devis (DQE), Décomptes & Facturation (Format Maroc)
* **Devis DQE structuré par lots** avec calcul automatique de la TVA légale marocaine de **20 %**.
* **Conversion en Chantier en 1 Clic** : Transforme automatiquement un devis accepté en un chantier actif avec génération de tous les lots et tâches associés.
* **Gestion des Décomptes d'avancement** intégrant la retenue de garantie légale marocaine de **10 %** libérable à la réception définitive.
* **Génération de PDF certifiés** incluant toutes les mentions légales obligatoires au Maroc (*Logo, ICE, IF, RC, Patente, CNSS, RIB bancaire*).

### 5. Matériaux & Fournisseurs Agréés
* Annuaire des fournisseurs leaders au Maroc : **LafargeHolcim Maroc**, **Sonasid Sidérurgie**, **Ciments du Maroc**, **Sika Maroc**, **Comptoir Métallurgique Marocain (CMM)**.
* Gestion des stocks avec jauge visuelle et avertissement automatique dès dépassement du seuil critique.
* Enregistrement rapide des Bons de Livraison (BL) avec mise à jour instantanée des stocks.

### 6. Main-d'Œuvre, Pointage Quotidien & Acomptes
* Répertoire complet des compagnons avec numéro de **CIN** (Carte d'Identité Nationale), spécialités (*Maçon, Ferrailleur, Boiseur/Coffreur, Manœuvre, Électricien, Plombier, Peintre*) et tarifs journaliers en MAD.
* **Grille de Pointage Express** : bouton 1 clic pour valider `Présent (1j)`, `Demi-journée (0.5j)`, `Absent (0)` ou ajouter des `Heures Supplémentaires (+25%)`.
* Bouton **"Tout cocher Présent (1j)"** pour le pointage matinal en moins de 10 secondes.
* Gestion des **acomptes en espèces** et déduction automatique lors du calcul des paies de quinzaine.

### 7. Journal de Chantier Mobile-First
* Interface optimisée pour smartphone permettant au chef de chantier sur site de consigner :
  * Météo du jour (*Ensoleillé, Nuageux, Pluvieux, Vent fort affectant les grues, Canicule*).
  * Température et effectif présent.
  * Travaux exécutés et cadencement.
  * Aléas, retards de livraison et consignes de sécurité.
  * Ajout de photographies de terrain avec légendes explicatives.

---

## 📊 Données de Démonstration (Seed Réaliste)

L'application est pré-remplie avec des données immédiatement utilisables :
1. **Construction Villa R+1 Contemporaine - Marrakech Palmeraie** (Budget : `3 450 000 MAD`, Avancement : `58 %`).
2. **Immeuble Résidentiel R+4 Les Alizés - Safi Plateau** (Budget : `8 900 000 MAD`, Avancement : `76 %`).
3. **Aménagement Showroom & Siège Commercial - Casablanca Maârif** (Budget : `1 850 000 MAD`, Avancement : `18 %`).
4. **10 Ouvriers BTP qualifiés** avec CIN réels et tarifs journaliers entre `170 MAD/j` et `350 MAD/j`.
5. **2 Devis modèles** (Hangar Berrechid `2,15 M MAD HT`, Surélévation Agdal Rabat `1,28 M MAD HT`).

---

## 🚀 Instructions d'Installation & Lancement Local

### 1. Cloner ou Ouvrir le Projet
```bash
cd C:\Users\hp\.gemini\antigravity\scratch\btp-maroc-erp
```

### 2. Installer les Dépendances
```bash
npm install
```

### 3. Lancer les Tests Automatisés
```bash
npm test
```
Résultat : **8/8 Tests Unitaires et Métiers validés à 100%**.

### 4. Lancer le Serveur de Développement
```bash
npm run dev
```
Ouvrez votre navigateur sur [http://localhost:3000](http://localhost:3000).

### 5. Compiler pour la Production
```bash
npm run build
npm start
```
