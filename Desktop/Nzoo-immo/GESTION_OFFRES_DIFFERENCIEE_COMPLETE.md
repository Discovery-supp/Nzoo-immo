# 🎯 Gestion Différenciée des Offres - Guide Complet

## 📋 Vue d'Ensemble

Le système de gestion des réservations s'adapte automatiquement selon le type d'offre :

### 🗓️ **Offres avec Gestion de Dates**
- **Types** : Co-working, Bureau Privé, Salle de réunion
- **Interface** : Date picker et calendrier
- **Calcul** : Prix basé sur les dates sélectionnées
- **Validation** : Dates obligatoires

### ⏱️ **Offres sans Gestion de Dates**
- **Types** : Domiciliation, autres services
- **Interface** : Sélecteur de durée (mois)
- **Calcul** : Prix mensuel × nombre de mois
- **Validation** : Contrat obligatoire

## 🔧 Configuration des Types d'Offres

### 📊 **Structure des Données (spacesData.ts)**

```typescript
export interface SpaceInfo {
  // ... champs existants ...
  
  // Nouveaux champs pour la gestion différenciée
  requiresDateSelection: boolean; // true pour coworking, bureau-prive, salle-reunion
  contractRequired?: boolean; // true pour les offres sans gestion de dates
  contractText?: string; // Texte du contrat à accepter
  maxMonths?: number; // Nombre maximum de mois pour les offres sans dates
}
```

### 🎯 **Configuration des Espaces**

#### **Offres avec Gestion de Dates**
```typescript
coworking: {
  // ... autres champs ...
  requiresDateSelection: true,
  contractRequired: false
},
'bureau-prive': {
  // ... autres champs ...
  requiresDateSelection: true,
  contractRequired: false
},
'salle-reunion': {
  // ... autres champs ...
  requiresDateSelection: true,
  contractRequired: false
}
```

#### **Offres sans Gestion de Dates**
```typescript
domiciliation: {
  // ... autres champs ...
  requiresDateSelection: false,
  contractRequired: true,
  contractText: 'En souscrivant à ce service de domiciliation, vous acceptez...',
  maxMonths: 12
}
```

## 🎨 **Interface Utilisateur Adaptative**

### 📅 **Offres avec Dates (Co-working, Bureau Privé, Salle de réunion)**

#### **Interface de Sélection**
- **Date picker** : Sélection de plage de dates
- **Calendrier** : Affichage visuel des disponibilités
- **Types d'abonnement** : Journalier, mensuel, annuel, horaire
- **Calcul dynamique** : Prix basé sur la durée sélectionnée

#### **Validation**
```typescript
// Validation pour les offres avec dates
const validateWithDates = () => {
  return selectedDates !== null && 
         formData.fullName && 
         formData.email && 
         formData.phone;
};
```

### ⏱️ **Offres sans Dates (Domiciliation)**

#### **Interface de Sélection**
- **Sélecteur de mois** : 1 à 12 mois maximum
- **Calcul mensuel** : Prix mensuel × nombre de mois
- **Contrat obligatoire** : Texte à lire et accepter
- **Interface simplifiée** : Pas de date picker

#### **Validation**
```typescript
// Validation pour les offres sans dates
const validateWithoutDates = () => {
  return formData.fullName && 
         formData.email && 
         formData.phone && 
         formData.contractAccepted;
};
```

## 💰 **Calcul des Prix**

### 📅 **Offres avec Dates**
```typescript
const calculateTotalWithDates = () => {
  if (!selectedDates) return 0;
  
  const days = calculateDaysBetween(selectedDates[0], selectedDates[1]);
  
  return calculateTotalPrice(days, formData.subscriptionType, {
    daily: spaceInfo.dailyPrice,
    monthly: spaceInfo.monthlyPrice,
    yearly: spaceInfo.yearlyPrice
  });
};
```

### ⏱️ **Offres sans Dates**
```typescript
const calculateTotalWithoutDates = () => {
  return (spaceInfo.monthlyPrice || 0) * formData.selectedMonths;
};
```

## 🗄️ **Base de Données**

### 📊 **Nouvelles Colonnes**

```sql
-- Ajouter les colonnes nécessaires
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS contract_accepted boolean DEFAULT false;

ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS selected_months integer;

ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS subscription_type text DEFAULT 'daily';
```

### 📝 **Structure des Données**

#### **Réservation avec Dates**
```json
{
  "space_type": "coworking",
  "start_date": "2025-01-15",
  "end_date": "2025-01-20",
  "subscription_type": "daily",
  "contract_accepted": null,
  "selected_months": null
}
```

#### **Réservation sans Dates**
```json
{
  "space_type": "domiciliation",
  "start_date": null,
  "end_date": null,
  "subscription_type": "monthly",
  "contract_accepted": true,
  "selected_months": 6
}
```

## 🔄 **Logique de Validation**

### 📋 **Validation par Étape**

```typescript
const validateStep = (step: number) => {
  switch (step) {
    case 1:
      // Pour les offres avec dates, vérifier que les dates sont sélectionnées
      if (requiresDateSelection()) {
        return selectedDates !== null;
      }
      // Pour les offres sans dates, toujours valide
      return true;
      
    case 2:
      // Validation de base pour tous les types d'offres
      const basicValidation = formData.fullName && formData.email && formData.phone;
      
      // Pour les offres sans dates, vérifier aussi l'acceptation du contrat
      if (!requiresDateSelection() && spaceInfo?.contractRequired) {
        return basicValidation && formData.contractAccepted;
      }
      
      return basicValidation;
      
    case 3:
      return selectedPaymentMethod !== null;
      
    default:
      return true;
  }
};
```

## 🎯 **Expérience Utilisateur**

### 📱 **Parcours Utilisateur**

#### **Offres avec Dates**
1. **Sélection d'espace** → Co-working, Bureau Privé, Salle de réunion
2. **Sélection de dates** → Date picker et calendrier
3. **Remplissage du formulaire** → Informations personnelles
4. **Paiement** → Moyens de paiement disponibles

#### **Offres sans Dates**
1. **Sélection d'espace** → Domiciliation, autres services
2. **Sélection de durée** → Sélecteur de mois (1-12)
3. **Lecture du contrat** → Texte obligatoire à accepter
4. **Remplissage du formulaire** → Informations personnelles
5. **Paiement** → Moyens de paiement disponibles

### 🎨 **Interface Adaptative**

#### **Affichage Conditionnel**
```tsx
{requiresDateSelection() ? (
  // Interface pour les offres avec dates
  <DatePickerComponent />
) : (
  // Interface pour les offres sans dates
  <DurationSelectorComponent />
)}
```

#### **Calcul Conditionnel**
```tsx
{requiresDateSelection() ? (
  <div>Prix : ${calculateTotalWithDates()}</div>
) : (
  <div>Prix : ${calculateTotalWithoutDates()}</div>
)}
```

## 🧪 **Tests et Validation**

### 📋 **Script de Test**

```bash
# Exécuter le script de test
node test_gestion_offres_differentiees.cjs
```

### ✅ **Points de Validation**

#### **Offres avec Dates**
- [ ] Date picker visible et fonctionnel
- [ ] Calcul des prix basé sur les dates
- [ ] Validation des dates obligatoires
- [ ] Types d'abonnement disponibles

#### **Offres sans Dates**
- [ ] Sélecteur de mois visible
- [ ] Calcul des prix basé sur les mois
- [ ] Contrat obligatoire à accepter
- [ ] Interface simplifiée

## 🚀 **Déploiement**

### 📋 **Étapes de Mise en Place**

1. **Appliquer la migration**
   ```sql
   -- Exécuter le script SQL
   -- add_contract_fields_to_reservations.sql
   ```

2. **Vérifier la configuration**
   ```bash
   # Tester la configuration
   node test_gestion_offres_differentiees.cjs
   ```

3. **Tester l'interface**
   - Aller sur `/reservation?spaceType=coworking`
   - Aller sur `/reservation?spaceType=domiciliation`

### 🔧 **Configuration Manuelle**

#### **Dans Supabase SQL Editor**
```sql
-- Ajouter les colonnes manuellement si nécessaire
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS contract_accepted boolean DEFAULT false;

ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS selected_months integer;

ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS subscription_type text DEFAULT 'daily';
```

## 📊 **Avantages de la Différenciation**

### 🎯 **Pour les Utilisateurs**
- **Interface adaptée** : Expérience optimisée selon le type d'offre
- **Processus simplifié** : Moins de friction pour les offres simples
- **Clarté** : Distinction claire entre les types d'offres

### 🏢 **Pour l'Entreprise**
- **Flexibilité** : Gestion adaptée selon les besoins
- **Efficacité** : Processus optimisé pour chaque type
- **Scalabilité** : Facile d'ajouter de nouveaux types d'offres

## 🔮 **Évolutions Futures**

### 📈 **Améliorations Possibles**
- **Types d'offres hybrides** : Combinaison de dates et d'abonnement
- **Prix dynamiques** : Tarification selon la demande
- **Réservations récurrentes** : Abonnements automatiques
- **Gestion des conflits** : Résolution automatique des conflits

### 🛠️ **Maintenance**
- **Tests réguliers** : Vérification du bon fonctionnement
- **Mise à jour des prix** : Adaptation selon le marché
- **Optimisation** : Amélioration continue de l'expérience

## 📞 **Support**

### 🆘 **En Cas de Problème**
1. **Vérifier la configuration** : Exécuter le script de test
2. **Contrôler la base de données** : Vérifier les colonnes
3. **Tester l'interface** : Vérifier les différents types d'offres
4. **Consulter les logs** : Identifier les erreurs

### 📧 **Contact**
- **Développeur** : Support technique
- **Documentation** : Ce guide et les fichiers de test
- **Base de connaissances** : Scripts de diagnostic
