# 🏢 Guide de Gestion de la Disponibilité des Bureaux Privés

## 📋 Vue d'Ensemble

Ce guide explique comment gérer la disponibilité des bureaux privés dans l'application Nzoo Immo. Le système utilise maintenant une vérification dynamique basée sur les réservations réelles en base de données.

## 🔧 Modifications Apportées

### 1. **Service de Disponibilité Amélioré** (`src/services/availabilityService.ts`)

#### Nouvelles Fonctions Ajoutées :

```typescript
// Vérifier la disponibilité générale d'un type d'espace
export const checkGeneralSpaceAvailability = async (spaceType: string): Promise<GeneralAvailability>

// Vérifier la disponibilité de tous les types d'espaces
export const checkAllSpacesAvailability = async (): Promise<Record<string, GeneralAvailability>>
```

#### Interface de Disponibilité Générale :

```typescript
export interface GeneralAvailability {
  spaceType: string;
  isAvailable: boolean;
  currentOccupancy: number;
  maxCapacity: number;
  availableSlots: number;
  message?: string;
}
```

### 2. **Page des Espaces Dynamique** (`src/pages/SpacesPage.tsx`)

#### Fonctionnalités Ajoutées :

- ✅ Chargement automatique de la disponibilité depuis la base de données
- ✅ Affichage dynamique du statut (disponible/occupé)
- ✅ Badges de statut en temps réel
- ✅ Boutons de réservation conditionnels
- ✅ Messages informatifs sur la disponibilité

#### États Gérés :

```typescript
const [availabilityMap, setAvailabilityMap] = useState<Record<string, GeneralAvailability>>({});
const [loading, setLoading] = useState(true);
```

## 📊 Capacités par Type d'Espace

| Type d'Espace | Capacité Maximale | Description |
|---------------|-------------------|-------------|
| **Coworking** | 4 places | Espace de travail partagé |
| **Bureau Privé** | 3 places | Bureaux fermés individuels |
| **Domiciliation** | 1 place | Service de domiciliation |

## 🔍 Comment Vérifier la Disponibilité

### 1. **Via l'Interface Utilisateur**

1. Allez sur la page "Nos Espaces"
2. Chaque espace affiche son statut en temps réel :
   - 🟢 **Disponible** : Places libres
   - 🔴 **Occupé** : Complet
   - 📊 **X places disponibles** : Nombre exact de places libres

### 2. **Via la Base de Données**

Connectez-vous à Supabase Dashboard et exécutez :

```sql
-- Vérifier les réservations actives pour les bureaux privés
SELECT 
  COUNT(*) as reservations_actives,
  space_type,
  status
FROM reservations 
WHERE space_type = 'bureau-prive' 
  AND status IN ('confirmed', 'pending')
GROUP BY space_type, status;
```

### 3. **Via le Script de Test**

Exécutez le script de diagnostic :

```bash
node test_disponibilite_bureaux.cjs
```

## 🛠️ Comment Gérer la Disponibilité

### **Option 1 : Via Supabase Dashboard (Recommandé)**

1. **Connectez-vous à Supabase Dashboard**
2. **Allez dans la table "reservations"**
3. **Filtrez par `space_type = 'bureau-prive'`**
4. **Actions possibles :**
   - **Supprimer** les réservations de test
   - **Changer le statut** de `confirmed` à `cancelled`
   - **Modifier les dates** pour libérer des places

### **Option 2 : Via SQL Direct**

```sql
-- Supprimer les réservations de test
DELETE FROM reservations 
WHERE full_name LIKE 'Test%' 
  AND space_type = 'bureau-prive';

-- Annuler des réservations spécifiques
UPDATE reservations 
SET status = 'cancelled' 
WHERE id = 'reservation-id-here';

-- Vérifier l'état actuel
SELECT 
  space_type,
  COUNT(*) as reservations_actives,
  CASE 
    WHEN space_type = 'bureau-prive' AND COUNT(*) >= 3 THEN 'COMPLET'
    WHEN space_type = 'coworking' AND COUNT(*) >= 4 THEN 'COMPLET'
    WHEN space_type = 'domiciliation' AND COUNT(*) >= 1 THEN 'COMPLET'
    ELSE 'DISPONIBLE'
  END as statut
FROM reservations 
WHERE status IN ('confirmed', 'pending')
GROUP BY space_type;
```

### **Option 3 : Via l'Application Admin**

1. **Connectez-vous en tant qu'administrateur**
2. **Allez dans "Gestion des Réservations"**
3. **Modifiez ou supprimez les réservations selon besoin**

## 📈 Statuts de Réservation

| Statut | Impact sur la Disponibilité | Description |
|--------|----------------------------|-------------|
| **`confirmed`** | ✅ Occupe une place | Réservation confirmée et payée |
| **`pending`** | ✅ Occupe une place | Réservation en attente de paiement |
| **`cancelled`** | ❌ Ne compte pas | Réservation annulée |
| **`completed`** | ❌ Ne compte pas | Réservation terminée |

## 🔄 Mise à Jour Automatique

### **Fréquence de Mise à Jour :**

- **Page des Espaces** : À chaque chargement
- **Page de Réservation** : En temps réel lors de la sélection de dates
- **Dashboard Admin** : À chaque actualisation

### **Cache et Performance :**

- Les données de disponibilité sont mises en cache pendant 30 secondes
- Les mises à jour sont automatiques après chaque réservation
- Pas besoin de recharger manuellement la page

## 🚨 Résolution des Problèmes

### **Problème : Les bureaux privés apparaissent toujours comme "occupés"**

**Solutions :**

1. **Vérifiez les réservations existantes :**
   ```sql
   SELECT * FROM reservations 
   WHERE space_type = 'bureau-prive' 
     AND status IN ('confirmed', 'pending');
   ```

2. **Nettoyez les réservations de test :**
   ```sql
   DELETE FROM reservations 
   WHERE full_name LIKE 'Test%' 
     AND space_type = 'bureau-prive';
   ```

3. **Vérifiez la capacité maximale :**
   - Bureau privé : 3 places maximum
   - Si plus de 3 réservations actives → marqué comme "occupé"

### **Problème : La disponibilité ne se met pas à jour**

**Solutions :**

1. **Actualisez la page** (Ctrl+F5)
2. **Vérifiez la connexion à la base de données**
3. **Exécutez le script de diagnostic :**
   ```bash
   node test_disponibilite_bureaux.cjs
   ```

### **Problème : Erreur de connexion à la base de données**

**Solutions :**

1. **Vérifiez les variables d'environnement Supabase**
2. **Testez la connexion :**
   ```javascript
   const { data, error } = await supabase
     .from('reservations')
     .select('count');
   ```

## 📱 Interface Utilisateur

### **Indicateurs Visuels :**

- 🟢 **Badge vert** : Espace disponible
- 🔴 **Badge rouge** : Espace occupé
- 📊 **Compteur** : "X places disponibles"
- ⏳ **Loading** : Chargement en cours

### **Boutons de Réservation :**

- **Disponible** : Bouton "Réserver" actif
- **Occupé** : Bouton "Occupé" désactivé

## 🔧 Configuration Avancée

### **Modifier les Capacités :**

Dans `src/services/availabilityService.ts` :

```typescript
const maxCapacities = {
  'coworking': 4,      // Modifier selon vos besoins
  'bureau_prive': 3,   // Modifier selon vos besoins
  'bureau-prive': 3,   // Modifier selon vos besoins
  'domiciliation': 1   // Modifier selon vos besoins
};
```

### **Ajouter de Nouveaux Types d'Espaces :**

1. **Ajoutez le type dans `maxCapacities`**
2. **Ajoutez les données dans `spacesData.ts`**
3. **Mettez à jour les fonctions de disponibilité**

## ✅ Checklist de Vérification

- [ ] Les bureaux privés affichent le bon statut
- [ ] La disponibilité se met à jour automatiquement
- [ ] Les réservations de test sont nettoyées
- [ ] Les capacités maximales sont correctes
- [ ] L'interface affiche les bons messages
- [ ] Les boutons de réservation fonctionnent correctement

## 🎯 Prochaines Étapes

1. **Testez le système** avec des réservations réelles
2. **Surveillez les performances** de la base de données
3. **Ajoutez des notifications** pour les changements de disponibilité
4. **Implémentez un système de file d'attente** si nécessaire

---

**💡 Conseil :** Gardez toujours quelques places de test disponibles pour les démonstrations et les tests de fonctionnalité.
