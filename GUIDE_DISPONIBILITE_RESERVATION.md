# Guide - Disponibilité des Bureaux Privés - Page Réservation

## 🎯 Objectif

Modifier la page de réservation pour désactiver automatiquement le bouton de réservation quand les bureaux privés sont indisponibles, évitant ainsi les tentatives de réservation inutiles.

## ✅ Modifications Apportées

### 1. Import du Service de Disponibilité

**Fichier :** `src/pages/ReservationPage.tsx`

```typescript
// Avant
import { checkSpaceAvailability } from '../services/availabilityService';

// Après
import { checkSpaceAvailability, checkGeneralSpaceAvailability } from '../services/availabilityService';
```

### 2. Nouvel État pour la Disponibilité

```typescript
const [spaceAvailability, setSpaceAvailability] = useState<{ isAvailable: boolean; message?: string }>({ isAvailable: true });
```

### 3. Vérification Automatique de Disponibilité

```typescript
// useEffect pour vérifier la disponibilité générale de l'espace
useEffect(() => {
  const checkSpaceGeneralAvailability = async () => {
    if (selectedSpace === 'bureau-prive') {
      try {
        const availability = await checkGeneralSpaceAvailability('bureau-prive');
        setSpaceAvailability({
          isAvailable: availability.isAvailable,
          message: availability.message
        });
      } catch (error) {
        console.warn('Erreur lors de la vérification de disponibilité générale:', error);
        // En cas d'erreur, considérer comme disponible pour ne pas bloquer
        setSpaceAvailability({ isAvailable: true });
      }
    } else {
      // Pour les autres types d'espaces, considérer comme disponible
      setSpaceAvailability({ isAvailable: true });
    }
  };

  checkSpaceGeneralAvailability();
}, [selectedSpace]);
```

### 4. Validation des Étapes Mise à Jour

```typescript
// Fonction de validation des étapes
const validateStep = (step: number) => {
  switch (step) {
    case 1:
      return selectedDates !== null && spaceAvailability.isAvailable;
    case 2:
      return formData.fullName && formData.email && formData.phone && spaceAvailability.isAvailable;
    case 3:
      return selectedPaymentMethod !== null;
    default:
      return true;
  }
};
```

### 5. Boutons Désactivés

**Bouton "Suivant" :**
```typescript
disabled={!validateStep(currentStep) || paymentLoading || !spaceAvailability.isAvailable}
```

**Bouton de Réservation :**
```typescript
disabled={paymentProcessing || paymentLoading || !selectedPaymentMethod || !spaceAvailability.isAvailable}
```

### 6. Alerte Visuelle

```typescript
{/* Alerte de disponibilité pour les bureaux privés */}
{selectedSpace === 'bureau-prive' && !spaceAvailability.isAvailable && (
  <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl">
    <div className="flex items-center">
      <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mr-4 shadow-soft">
        <AlertCircle className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="font-semibold text-red-800 font-body">
          Bureaux privés actuellement indisponibles
        </p>
        <p className="text-sm text-red-600 font-body">
          {spaceAvailability.message || 'Tous les bureaux privés sont actuellement occupés. Veuillez réessayer plus tard.'}
        </p>
      </div>
    </div>
  </div>
)}
```

### 7. Texte du Bouton Adaptatif

```typescript
<span>
  {!spaceAvailability.isAvailable && selectedSpace === 'bureau-prive' 
    ? 'Bureaux indisponibles' 
    : selectedPaymentMethod === 'CASH' 
      ? t.buttons.reserve 
      : t.buttons.pay
  }
</span>
```

## 🔧 Fonctionnement

### 1. Vérification Automatique
- Quand l'utilisateur sélectionne "Bureau privé", le système vérifie automatiquement la disponibilité
- La vérification se fait via `checkGeneralSpaceAvailability('bureau-prive')`
- Le résultat est stocké dans `spaceAvailability`

### 2. Interface Adaptative
- **Si disponible** : Interface normale, boutons actifs
- **Si indisponible** : 
  - Alerte rouge avec message explicatif
  - Boutons désactivés
  - Texte du bouton changé en "Bureaux indisponibles"

### 3. Validation des Étapes
- Les étapes 1 et 2 vérifient maintenant la disponibilité en plus des autres critères
- Impossible de passer à l'étape suivante si les bureaux sont indisponibles

## 📊 Capacités Configurées

```typescript
const maxCapacities = {
  'coworking': 4,
  'bureau-prive': 3,
  'domiciliation': 1
};
```

## 🎨 Interface Utilisateur

### États Visuels

1. **Bureaux Disponibles :**
   - ✅ Interface normale
   - ✅ Boutons actifs
   - ✅ Texte "Réserver" ou "Payer"

2. **Bureaux Indisponibles :**
   - ❌ Alerte rouge avec icône d'avertissement
   - ❌ Boutons grisés et désactivés
   - ❌ Texte "Bureaux indisponibles"

### Messages d'Information

- **Disponible** : "X places disponibles"
- **Complet** : "Tous les bureaux privés sont actuellement occupés"

## 🧪 Tests

### Script de Test
Le fichier `test_disponibilite_reservation.cjs` vérifie :

1. **Scénarios de disponibilité** ✅
   - Bureaux disponibles (1-2 réservations)
   - Bureaux complets (3+ réservations)
   - Réservations annulées (ne comptent pas)

2. **Logique d'interface** ✅
   - Texte des boutons adaptatif
   - États visuels corrects

3. **Validation des étapes** ✅
   - Blocage des étapes si indisponible
   - Autorisation si disponible

## 🔄 Gestion des Erreurs

### Fallback en Cas d'Erreur
```typescript
catch (error) {
  console.warn('Erreur lors de la vérification de disponibilité générale:', error);
  // En cas d'erreur, considérer comme disponible pour ne pas bloquer
  setSpaceAvailability({ isAvailable: true });
}
```

### Autres Types d'Espaces
- Les autres types d'espaces (coworking, domiciliation) ne sont pas affectés
- Ils restent toujours considérés comme disponibles

## 📋 Instructions d'Utilisation

### Pour Tester la Fonctionnalité

1. **Allez sur la page de réservation**
2. **Sélectionnez "Bureau privé"**
3. **Vérifiez que :**
   - Une alerte rouge s'affiche si les bureaux sont indisponibles
   - Le bouton "Suivant" est désactivé
   - Le bouton de réservation affiche "Bureaux indisponibles"

### Pour Rendre les Bureaux Disponibles

1. **Connectez-vous à Supabase Dashboard**
2. **Allez dans la table "reservations"**
3. **Filtrez par `space_type = "bureau-prive"`**
4. **Supprimez ou annulez les réservations existantes :**
   - Supprimez les réservations de test
   - Changez le statut de "confirmed" à "cancelled"
   - Ou modifiez les dates pour libérer des places
5. **Actualisez la page de réservation**

## 🎯 Avantages

### Pour les Utilisateurs
- ✅ **Clarté** : Information immédiate sur la disponibilité
- ✅ **Économie de temps** : Pas de tentative de réservation inutile
- ✅ **Transparence** : Messages explicatifs sur l'état

### Pour l'Administration
- ✅ **Prévention d'erreurs** : Pas de réservations impossibles
- ✅ **Gestion automatique** : Pas d'intervention manuelle nécessaire
- ✅ **Interface cohérente** : Même logique que la page des espaces

## 🔮 Évolutions Possibles

### Fonctionnalités Futures
1. **Notification en temps réel** : Actualisation automatique quand un bureau se libère
2. **Liste d'attente** : Permettre de s'inscrire pour être notifié
3. **Réservation anticipée** : Permettre de réserver pour une date future
4. **Gestion des priorités** : Système de priorité pour certains clients

### Améliorations Techniques
1. **Cache de disponibilité** : Optimiser les performances
2. **WebSocket** : Mises à jour en temps réel
3. **Historique** : Suivi des changements de disponibilité

## ✅ Résumé

Le système de disponibilité pour la page de réservation est maintenant opérationnel. Les bureaux privés seront automatiquement désactivés quand ils sont occupés, offrant une expérience utilisateur claire et évitant les tentatives de réservation impossibles.

**Statut :** ✅ **IMPLÉMENTÉ ET TESTÉ**
