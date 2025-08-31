# 📧 Guide des Emails de Réservation - Gestion des Paiements en Cash

## 🎯 Vue d'ensemble

Ce guide explique le nouveau système d'envoi d'emails pour les réservations, qui gère différemment les paiements en espèces et les autres méthodes de paiement.

## 🔄 Logique de Gestion des Emails

### 📧 **Réservations avec Paiement en Cash**
- **Email envoyé** : `⏳ Réservation en attente de paiement`
- **Statut** : `pending` (en attente)
- **Action requise** : Paiement en espèces au bureau
- **Délai** : 5 jours pour régulariser le paiement
- **Conséquence** : Annulation automatique après 5 jours

### ✅ **Réservations avec Autres Méthodes de Paiement**
- **Email envoyé** : `🎉 Réservation confirmée`
- **Statut** : `confirmed` (confirmée)
- **Action requise** : Aucune (réservation active)
- **Délai** : Aucun
- **Conséquence** : Réservation maintenue

## 📋 Détails des Emails

### 1. Email d'Attente de Paiement (Cash)

**Sujet** : `⏳ Réservation en attente de paiement - [REFERENCE]`

**Contenu** :
- ⚠️ **Avertissement important** : Annulation automatique dans 5 jours
- 📋 **Détails de la réservation** (référence, espace, dates, montant)
- 💰 **Méthode de paiement** : Cash
- 📍 **Adresse du bureau** : 16, colonel Lukusa, Commune de la Gombe
- 🔄 **Instructions** : Se présenter au bureau pour le paiement

**Style visuel** :
- Couleurs d'avertissement (orange/jaune)
- Encadrés d'information importants
- Mise en forme claire et lisible

### 2. Email de Confirmation (Autres Méthodes)

**Sujet** : `🎉 Réservation confirmée - [REFERENCE]`

**Contenu** :
- ✅ **Confirmation de la réservation**
- 📋 **Détails complets** de la réservation
- 💳 **Méthode de paiement** utilisée
- 🎯 **Statut** : Réservation active et confirmée

**Style visuel** :
- Couleurs de succès (vert)
- Design professionnel et rassurant

## ⏰ Système d'Annulation Automatique

### 🔄 **Fonctionnement**
- **Déclencheur** : Réservations en cash avec statut `pending`
- **Délai** : 5 jours après création
- **Action** : Annulation automatique du statut `pending` vers `cancelled`
- **Notification** : Email d'annulation automatique envoyé au client

### 📧 **Email d'Annulation Automatique**

**Sujet** : `❌ Réservation annulée automatiquement - [REFERENCE]`

**Contenu** :
- ❌ **Annulation automatique** pour non-paiement
- 📋 **Détails** de la réservation annulée
- 🔄 **Instructions** pour créer une nouvelle réservation
- 📍 **Adresse du bureau** pour le paiement

## 🛠️ Implémentation Technique

### 📁 **Fichiers Modifiés**

1. **`src/services/emailServiceDirect.ts`**
   - Nouvelle fonction `sendClientPaymentPendingEmail()`
   - Logique conditionnelle dans `sendReservationEmails()`
   - Gestion des types d'emails selon le mode de paiement

2. **`supabase/functions/auto-cancel-cash-reservations/index.ts`**
   - Fonction Edge Function pour l'annulation automatique
   - Vérification quotidienne des réservations en attente
   - Envoi automatique des emails d'annulation

3. **`test_auto_cancellation.cjs`**
   - Script de test pour vérifier le fonctionnement
   - Simulation des annulations automatiques
   - Vérification des réservations en attente

### 🔧 **Configuration Requise**

#### Variables d'Environnement Supabase
```bash
SUPABASE_URL=https://[votre-projet].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[votre-clé-service]
SUPABASE_ANON_KEY=[votre-clé-anon]
```

#### Déploiement des Edge Functions
```bash
# Déployer la fonction d'annulation automatique
supabase functions deploy auto-cancel-cash-reservations

# Déployer la fonction d'envoi d'emails (si pas déjà fait)
supabase functions deploy send-confirmation-email
```

## 📊 Monitoring et Tests

### 🧪 **Tests Automatiques**

```bash
# Exécuter le script de test
node test_auto_cancellation.cjs
```

**Fonctionnalités testées** :
- ✅ Vérification des réservations en attente
- ✅ Exécution de l'annulation automatique
- ✅ Envoi des emails de notification
- ✅ Mise à jour des statistiques clients

### 📈 **Logs et Suivi**

**Logs disponibles** :
- `📧 [DIRECT]` : Envoi d'emails
- `🔄 [AUTO-CANCEL]` : Annulation automatique
- `🧪 [TEST]` : Tests et vérifications

**Métriques à surveiller** :
- Nombre d'emails d'attente de paiement envoyés
- Nombre de réservations annulées automatiquement
- Taux de régularisation des paiements en cash
- Performance des Edge Functions

## 🚀 Utilisation

### 1. **Création d'une Réservation**
```typescript
// Le système détecte automatiquement le mode de paiement
const reservation = await createReservation({
  // ... autres données
  paymentMethod: 'cash' // ou 'card', 'mobile_money', etc.
});

// L'email approprié est envoyé automatiquement
```

### 2. **Vérification des Statuts**
```typescript
// Réservations en attente de paiement
const pendingCash = await getReservationsByStatus('pending');

// Réservations confirmées
const confirmed = await getReservationsByStatus('confirmed');

// Réservations annulées
const cancelled = await getReservationsByStatus('cancelled');
```

### 3. **Gestion Manuelle (Admin)**
```typescript
// Confirmer une réservation après paiement en cash
await updateReservationStatus(reservationId, 'confirmed');

// Annuler manuellement une réservation
await updateReservationStatus(reservationId, 'cancelled');
```

## ⚠️ Points d'Attention

### 🔒 **Sécurité**
- Vérification des permissions pour les Edge Functions
- Validation des données avant envoi d'emails
- Gestion des erreurs et fallbacks

### 📧 **Limitations des Emails**
- Dépendance du service d'envoi d'emails
- Gestion des échecs d'envoi
- Fallback en mode simulation si nécessaire

### ⏱️ **Performance**
- Exécution quotidienne de l'annulation automatique
- Optimisation des requêtes de base de données
- Gestion des timeouts et des erreurs

## 🔄 Maintenance

### 📅 **Tâches Récurrentes**
- **Quotidien** : Vérification des logs d'annulation automatique
- **Hebdomadaire** : Analyse des taux de régularisation
- **Mensuel** : Optimisation des Edge Functions

### 🐛 **Dépannage**
- Vérifier les logs Supabase
- Tester les Edge Functions individuellement
- Valider la configuration des variables d'environnement

## 📞 Support

Pour toute question ou problème :
- 📧 **Email** : contact@nzooimmo.com
- 📱 **Téléphone** : +243 [numéro]
- 📍 **Bureau** : 16, colonel Lukusa, Commune de la Gombe, Kinshasa

---

**Version** : 1.0  
**Date** : 21 Janvier 2025  
**Auteur** : Équipe Technique Nzoo Immo
