# N'zoo Immo - Plateforme de Gestion Immobilière Intelligente

## 🚀 **Vue d'ensemble**

N'zoo Immo est une plateforme moderne de gestion immobilière développée avec React, TypeScript et Supabase. Elle permet la gestion complète des espaces de travail, des réservations et des paiements.

## ✨ **Fonctionnalités Principales**

### 🏢 **Gestion des Espaces**
- Espaces de coworking
- Bureaux privés
- Services de domiciliation
- Salles de réunion

### 📅 **Système de Réservations**
- Réservation en ligne
- Gestion des disponibilités
- Mise à jour automatique des statuts
- Génération de factures

### 💳 **Méthodes de Paiement**
- Espèces
- Orange Money
- Airtel Money
- Carte VISA

### 👥 **Gestion des Utilisateurs**
- Authentification sécurisée
- Système de permissions
- Tableau de bord administrateur
- Interface client

## 🛠️ **Technologies Utilisées**

- **Frontend** : React 18, TypeScript, Tailwind CSS
- **Backend** : Supabase (PostgreSQL, Auth, Storage)
- **Paiements** : Intégration mobile money
- **Emails** : Templates HTML personnalisés
- **Factures** : Génération PDF automatique

## 📁 **Structure du Projet**

```
src/
├── config/
│   └── app.config.ts          # Configuration centralisée
├── constants/
│   └── index.ts               # Constantes centralisées
├── types/
│   └── index.ts               # Types TypeScript centralisés
├── components/                # Composants React réutilisables
├── pages/                     # Pages de l'application
├── services/                  # Services métier
├── hooks/                     # Hooks personnalisés
├── lib/                       # Bibliothèques et utilitaires
└── data/                      # Données statiques
```

## 🚀 **Installation et Démarrage**

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase

### Installation
```bash
# Cloner le projet
git clone [repository-url]
cd Nzoo-immo

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase

# Démarrer le serveur de développement
npm run dev
```

### Variables d'Environnement
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon
```

## 🔧 **Configuration**

### Configuration Centralisée
Le projet utilise une configuration centralisée dans `src/config/app.config.ts` :

```typescript
export const APP_CONFIG = {
  app: { name: 'N\'zoo Immo', version: '2.0.0' },
  spaces: { types: { coworking: { maxCapacity: 4 } } },
  payments: { methods: { cash: { autoGenerateInvoice: false } } },
  // ... configuration complète
};
```

### Types Centralisés
Tous les types TypeScript sont centralisés dans `src/types/index.ts` :

```typescript
export interface Reservation extends BaseEntity {
  full_name: string;
  email: string;
  // ... types complets
}
```

### Constantes Centralisées
Les constantes sont centralisées dans `src/constants/index.ts` :

```typescript
export const SPACE_TYPES = {
  COWORKING: 'coworking',
  BUREAU_PRIVE: 'bureau_prive',
  // ... constantes complètes
};
```

## 📊 **Fonctionnalités Avancées**

### 🔄 **Gestion Automatique des Réservations**
- Mise à jour automatique des statuts

- Notification des administrateurs

### 📧 **Système d'Emails**
- Confirmation automatique aux clients
- Notification aux administrateurs
- Templates HTML personnalisés

### 📄 **Génération de Factures**
- Génération automatique pour les paiements mobile money
- Templates PDF personnalisés
- Intégration avec le système de réservations

### 🔐 **Système de Permissions**
- Rôles administrateur et utilisateur
- Permissions granulaires
- Interface adaptative selon les droits

## 🧪 **Tests**

```bash
# Lancer les tests
npm test

# Tests avec couverture
npm run test:coverage
```

## 📦 **Build et Déploiement**

```bash
# Build de production
npm run build

# Prévisualisation du build
npm run preview

# Déploiement
npm run deploy
```

## 🔍 **Débogage**

### Logs de Développement
```typescript
// Activer les logs de debug
import { DEVELOPMENT } from './constants';
console.log('Debug:', DEVELOPMENT.DEBUG);
```

### Outils de Développement
- React Developer Tools
- Supabase Dashboard
- Browser DevTools

## 📈 **Performance**

### Optimisations Implémentées
- Lazy loading des composants
- Code splitting automatique
- Optimisation des images
- Cache intelligent

### Métriques
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

## 🔒 **Sécurité**

### Authentification
- JWT tokens sécurisés
- Sessions persistantes
- Protection CSRF

### Validation
- Validation côté client et serveur
- Sanitisation des données
- Protection contre les injections

## 🤝 **Contribution**

### Guidelines
1. Suivre les conventions TypeScript
2. Utiliser les types centralisés
3. Respecter la structure des dossiers
4. Ajouter des tests pour les nouvelles fonctionnalités

### Workflow
1. Fork du projet
2. Créer une branche feature
3. Développer et tester
4. Soumettre une pull request

## 📝 **Documentation**

- **Guide d'installation** : Ce fichier
- **API Reference** : `docs/api.md`
- **Architecture** : `docs/architecture.md`
- **Optimisations** : `PROJECT_OPTIMIZATION_REPORT.md`

## 🐛 **Dépannage**

### Problèmes Courants

#### Erreur de connexion Supabase
```bash
# Vérifier les variables d'environnement
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

#### Erreurs de build
```bash
# Nettoyer le cache
npm run clean
npm install
npm run build
```

#### Problèmes de permissions
- Vérifier les rôles dans Supabase
- Contrôler les politiques RLS
- Vérifier les tokens d'authentification

## 📞 **Support**

- **Email** : support@nzoo-immo.com
- **Documentation** : [Lien vers la documentation]
- **Issues** : [Lien vers GitHub Issues]

## 📄 **Licence**

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Version** : 2.0.0  
**Dernière mise à jour** : $(date)  
**Statut** : Production Ready
