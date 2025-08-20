# Gestion Automatique des Réservations

## 🎯 **Nouvelles Règles d'Annulation Automatique**

Ce document décrit les **3 règles d'annulation automatique** implémentées dans le système de gestion des réservations.

### 🔴 **Règle 1: Timeout de Création des Réservations en Attente**
- **Condition** : Réservation en statut "en attente" créée il y a plus de 4 jours
- **Action** : Status → "cancelled"
- **Raison** : "Réservation annulée automatiquement: créée il y a plus de 4 jours"
- **Logique** : `created_at < (today - 4 days)`

### 🟢 **Règle 2: Completion des Réservations Confirmées**
- **Condition** : Réservation en statut "confirmée" dont la date de fin <= aujourd'hui + 12h
- **Action** : Status → "completed"
- **Raison** : "Réservation terminée automatiquement: période de réservation écoulée (12h)"
- **Logique** : `end_date <= (today + 12 hours)`

### 🟡 **Règle 3: Expiration des Réservations en Attente**
- **Condition** : Réservation en statut "en attente" dont la date de fin <= aujourd'hui + 12h
- **Action** : Status → "cancelled"
- **Raison** : "Réservation annulée automatiquement: dépassement de la date limite de 12h"
- **Logique** : `end_date <= (today + 12 hours)`

## 🛠️ **Fichiers Implémentés**

### **Services**
- `src/services/reservationAutoManagement.ts` - Service principal d'annulation automatique
- `src/utils/reservationRules.ts` - Règles centralisées et utilitaires

### **Composants**
- `src/components/AutoReservationManager.tsx` - Interface de gestion automatique
- `src/components/ReservationManagement.tsx` - Bouton de vérification manuelle

### **Tests**
- `scripts/test-new-auto-rules.cjs` - Script de validation des règles

## 🎮 **Utilisation**

### **1. Vérification Manuelle**
```typescript
import { autoUpdateReservationStatuses } from '../services/reservationAutoManagement';

// Exécution avec critères par défaut
const result = await autoUpdateReservationStatuses();
console.log(`Mises à jour: ${result.updatedCount}`);
```

### **2. Critères Personnalisés**
```typescript
import { runAutoUpdateWithCustomCriteria } from '../services/reservationAutoManagement';

// Exécution avec critères personnalisés
const result = await runAutoUpdateWithCustomCriteria(5, 24, 24); // 5 jours, 24h, 24h
```

### **3. Interface Utilisateur**
- **Bouton "Vérifier Statuts"** dans la page de gestion des réservations
- **Composant AutoReservationManager** pour une interface dédiée
- **Mode automatique** avec vérification toutes les 5 minutes

## ⚙️ **Configuration**

### **Critères par Défaut**
```typescript
const DEFAULT_CRITERIA = {
  pendingCreationDays: 4,        // 4 jours pour le timeout
  confirmedCompletionHours: 12,  // 12 heures pour la completion
  pendingExpirationHours: 12     // 12 heures pour l'expiration
};
```

### **Personnalisation**
```typescript
// Exemple de personnalisation
const customCriteria = {
  pendingCreationDays: 7,        // 7 jours
  confirmedCompletionHours: 24,  // 24 heures
  pendingExpirationHours: 6      // 6 heures
};
```

## 📊 **Résultats et Statistiques**

### **Structure des Résultats**
```typescript
interface AutoUpdateResult {
  success: boolean;
  updatedCount: number;
  cancelledCount: number;
  completedCount: number;
  errors: string[];
  details: {
    pendingCancelled: string[];    // IDs des réservations annulées par timeout
    confirmedCompleted: string[];  // IDs des réservations terminées
    pendingExpired: string[];      // IDs des réservations annulées par expiration
  };
}
```

### **Exemple de Résultat**
```json
{
  "success": true,
  "updatedCount": 3,
  "cancelledCount": 2,
  "completedCount": 1,
  "errors": [],
  "details": {
    "pendingCancelled": ["res_001", "res_002"],
    "confirmedCompleted": ["res_003"],
    "pendingExpired": []
  }
}
```

## 🧪 **Tests et Validation**

### **Script de Test**
```bash
node scripts/test-new-auto-rules.cjs
```

### **Cas de Test Validés**
1. ✅ Réservation en attente créée il y a 5 jours → Annulée
2. ✅ Réservation en attente créée il y a 3 jours → Non annulée
3. ✅ Réservation confirmée avec fin dans 11h → Terminée
4. ✅ Réservation confirmée avec fin dans 13h → Non terminée
5. ✅ Réservation en attente avec fin dans 11h → Annulée
6. ✅ Réservation en attente avec fin dans 13h → Non annulée

## 🔄 **Mode Automatique**

### **Configuration**
- **Intervalle** : Toutes les 5 minutes
- **Démarrage** : Bouton "Démarrer Mode Auto"
- **Arrêt** : Bouton "Arrêter Mode Auto"
- **Logs** : Console et interface utilisateur

### **Sécurité**
- Vérification des permissions utilisateur
- Gestion robuste des erreurs
- Logging détaillé de toutes les actions
- Validation des données avant traitement

## 📝 **Notes Techniques**

### **Ordre de Priorité**
1. **Règle 1** (Timeout de création) - Priorité haute
2. **Règle 2** (Completion confirmée) - Priorité moyenne
3. **Règle 3** (Expiration en attente) - Priorité basse

### **Gestion des Erreurs**
- Erreurs individuelles par réservation
- Continuation du traitement en cas d'erreur
- Logging détaillé des erreurs
- Retour d'information à l'utilisateur

### **Performance**
- Traitement par lot des réservations
- Optimisation des requêtes base de données
- Mise à jour atomique des statuts
- Cache des résultats de résumé

## 🎉 **Avantages**

- ✅ **Simplicité** : Seulement 3 règles claires
- ✅ **Flexibilité** : Critères personnalisables
- ✅ **Performance** : Traitement optimisé
- ✅ **Sécurité** : Vérifications et validations
- ✅ **Traçabilité** : Logs détaillés
- ✅ **Interface** : Utilisateur convivial

## 🚀 **Déploiement**

Le système est prêt à être utilisé en production avec :
- Configuration par défaut optimisée
- Interface utilisateur complète
- Tests de validation
- Documentation détaillée

Les nouvelles règles d'annulation automatique sont maintenant opérationnelles ! 🎉

