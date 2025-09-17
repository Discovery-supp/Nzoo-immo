# 💰 Guide de Correction du Calcul des Prix des Réservations

## 🎯 Vue d'ensemble

Ce guide explique les corrections apportées au calcul des prix des réservations pour résoudre le problème de **doublement du prix** lors de la sélection d'une période d'un mois.

## ❌ **Problème identifié :**

### **Avant la correction :**
- ❌ **Calcul incorrect** : `Math.ceil(days / 30)` doublait le prix
- ❌ **Exemple** : 31 jours = `Math.ceil(31/30) = 2` → Prix × 2
- ❌ **Logique brisée** : Même 30 jours exacts pouvaient donner des résultats incorrects

### **Exemple concret :**
```
Réservation d'un mois (30 jours) :
- Prix mensuel : 100€
- Calcul : Math.ceil(30/30) = 1 → 100€ ✅

Réservation d'un mois + 1 jour (31 jours) :
- Prix mensuel : 100€  
- Calcul : Math.ceil(31/30) = 2 → 200€ ❌ (DOUBLE !)
```

## ✅ **Solutions implémentées :**

### **1. Correction de `calculateTotalPrice` dans `dateUtils.ts` :**

#### **Avant :**
```typescript
case 'monthly':
  const months = Math.ceil(days / 30);
  total = (prices.monthly || 0) * months;
  break;
```

#### **Après :**
```typescript
case 'monthly':
  // Pour les abonnements mensuels, calculer le nombre de mois de manière plus précise
  // Si c'est exactement 30 jours ou moins, c'est 1 mois
  // Si c'est plus de 30 jours, calculer proportionnellement
  if (days <= 30) {
    total = prices.monthly || 0;
  } else {
    // Calculer le nombre de mois de manière proportionnelle
    const months = days / 30;
    total = (prices.monthly || 0) * months;
  }
  break;
```

### **2. Correction de la logique de domiciliation :**

#### **Avant :**
```typescript
if (selectedSpace === 'domiciliation') {
  return (spaceInfo.monthlyPrice || 0) * Math.ceil(days / 30);
}
```

#### **Après :**
```typescript
if (selectedSpace === 'domiciliation') {
  // Pour la domiciliation, calculer proportionnellement au lieu d'arrondir vers le haut
  if (days <= 30) {
    return spaceInfo.monthlyPrice || 0;
  } else {
    return (spaceInfo.monthlyPrice || 0) * (days / 30);
  }
}
```

## 🔧 **Comment ça fonctionne maintenant :**

### **1. Calcul proportionnel :**
- ✅ **30 jours ou moins** = Prix mensuel complet
- ✅ **31-60 jours** = Prix proportionnel (ex: 31 jours = 1.03 mois)
- ✅ **Plus de 60 jours** = Prix proportionnel (ex: 90 jours = 3 mois)

### **2. Exemples de calculs :**

#### **Réservation d'un mois exact (30 jours) :**
```
Prix mensuel : 100€
Calcul : 30 jours ≤ 30 → 100€ ✅
```

#### **Réservation d'un mois + 1 jour (31 jours) :**
```
Prix mensuel : 100€
Calcul : 31 jours > 30 → 100€ × (31/30) = 103.33€ ✅
```

#### **Réservation de 2 mois (60 jours) :**
```
Prix mensuel : 100€
Calcul : 60 jours > 30 → 100€ × (60/30) = 200€ ✅
```

#### **Réservation de 3 mois (90 jours) :**
```
Prix mensuel : 100€
Calcul : 90 jours > 30 → 100€ × (90/30) = 300€ ✅
```

## 📊 **Types d'abonnements supportés :**

### **1. Abonnement quotidien (`daily`) :**
```typescript
case 'daily':
  total = (prices.daily || 0) * days;
  break;
```
- **Calcul** : Prix journalier × Nombre de jours
- **Exemple** : 5€/jour × 7 jours = 35€

### **2. Abonnement mensuel (`monthly`) :**
```typescript
case 'monthly':
  if (days <= 30) {
    total = prices.monthly || 0;
  } else {
    const months = days / 30;
    total = (prices.monthly || 0) * months;
  }
  break;
```
- **Calcul** : Prix mensuel × (Nombre de jours / 30)
- **Exemple** : 100€/mois × (45 jours / 30) = 150€

### **3. Abonnement annuel (`yearly`) :**
```typescript
case 'yearly':
  const years = Math.ceil(days / 365);
  total = (prices.yearly || 0) * years;
  break;
```
- **Calcul** : Prix annuel × Nombre d'années (arrondi vers le haut)
- **Exemple** : 1000€/an × 1 an = 1000€

## 🎨 **Interface utilisateur :**

### **1. Sélection de dates :**
- ✅ **Sélection d'une seule date** → Création automatique d'une période d'un mois
- ✅ **Sélection d'une plage** → Calcul précis du nombre de jours
- ✅ **Périodes rapides** → Boutons pour 1, 2, 3 mois

### **2. Affichage du prix :**
- ✅ **Prix en temps réel** lors de la sélection des dates
- ✅ **Détail du calcul** dans la console pour le débogage
- ✅ **Validation** avant la soumission

## 🔍 **Logs de débogage ajoutés :**

### **1. Sélection de dates :**
```typescript
console.log('📅 Sélection d\'une seule date:', {
  startDate: startDate.toISOString(),
  endDate: endDate.toISOString(),
  days: calculateDaysBetween(startDate, endDate)
});
```

### **2. Calcul du prix :**
```typescript
console.log('💰 Calcul du prix total:', {
  selectedSpace,
  days,
  subscriptionType: formData.subscriptionType,
  dailyPrice: spaceInfo.dailyPrice,
  monthlyPrice: spaceInfo.monthlyPrice,
  yearlyPrice: spaceInfo.yearlyPrice
});
```

### **3. Prix domiciliation :**
```typescript
console.log('💰 Prix domiciliation (≤30 jours):', total);
console.log('💰 Prix domiciliation (>30 jours):', total, `(${days} jours / 30 = ${days/30} mois)`);
```

## 🚀 **Déploiement et test :**

### **1. Vérification des corrections :**
- ✅ **Tester** une réservation d'un mois exact (30 jours)
- ✅ **Tester** une réservation d'un mois + 1 jour (31 jours)
- ✅ **Vérifier** que le prix n'est plus doublé

### **2. Validation des calculs :**
- ✅ **Prix mensuel** : 100€ pour 30 jours
- ✅ **Prix proportionnel** : 103.33€ pour 31 jours
- ✅ **Prix multiple** : 200€ pour 60 jours

### **3. Test des différents espaces :**
- ✅ **Coworking** : Calcul proportionnel
- ✅ **Bureau privé** : Calcul proportionnel
- ✅ **Domiciliation** : Calcul proportionnel
- ✅ **Salle réunion** : Calcul proportionnel

## 🔧 **Maintenance et évolutions :**

### **1. Ajout de nouveaux types d'abonnement :**
```typescript
case 'weekly':
  const weeks = Math.ceil(days / 7);
  total = (prices.weekly || 0) * weeks;
  break;
```

### **2. Gestion des prix spéciaux :**
```typescript
// Prix réduit pour les longues durées
if (days > 90) {
  total = total * 0.9; // 10% de réduction
}
```

### **3. Calcul des taxes :**
```typescript
const taxRate = 0.18; // 18% de TVA
const totalWithTax = total * (1 + taxRate);
```

---

**Version :** 1.0  
**Date :** 21 Janvier 2025  
**Auteur :** Équipe Technique Nzoo Immo
