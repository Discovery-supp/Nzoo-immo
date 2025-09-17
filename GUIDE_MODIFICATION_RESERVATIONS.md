# 🔧 Guide de Modification des Réservations

## 🎯 Vue d'ensemble

Ce guide explique comment utiliser la nouvelle fonctionnalité de **modification des réservations** directement dans le dashboard administrateur. Les administrateurs peuvent maintenant modifier tous les détails d'une réservation et sauvegarder les changements directement dans la base de données.

## 🚀 **Fonctionnalités disponibles :**

### **Champs modifiables :**
- ✅ **Informations client** : Nom, email, téléphone, entreprise, activité, adresse
- ✅ **Détails réservation** : Type d'espace, abonnement, dates, occupants, montant
- ✅ **Paiement** : Méthode de paiement, statut
- ✅ **Notes** : Notes client et notes administrateur

### **Actions possibles :**
- ✅ **Modification complète** de tous les champs
- ✅ **Sauvegarde directe** en base de données
- ✅ **Validation des données** avant sauvegarde
- ✅ **Rechargement automatique** des réservations après modification

## 📱 **Comment utiliser :**

### **1. Accéder à la modification :**
1. Aller dans le **Dashboard Administrateur**
2. Cliquer sur l'onglet **"Réservations"**
3. Dans la liste des réservations, cliquer sur le bouton **"Modifier"** (icône crayon)
4. Le modal de modification s'ouvre avec toutes les données de la réservation

### **2. Modifier les informations :**
- **Champs obligatoires** : Nom, email, téléphone, activité, type d'espace, dates, occupants, montant
- **Champs optionnels** : Entreprise, adresse, notes
- **Validation automatique** : Les champs requis sont marqués avec un astérisque (*)

### **3. Sauvegarder les modifications :**
1. Cliquer sur le bouton **"Sauvegarder"** (icône disquette)
2. Les données sont **sauvegardées directement en base**
3. **Confirmation** affichée en cas de succès
4. **Rechargement automatique** de la liste des réservations

## 🎨 **Interface utilisateur :**

### **Modal de modification :**
```
┌─────────────────────────────────────────────────────────┐
│ ✕ Modifier la Réservation                              │
├─────────────────────────────────────────────────────────┤
│ [Informations client]                                   │
│ Nom complet *    │ Email *                             │
│ Téléphone *      │ Entreprise                          │
│ Activité *       │ Adresse                             │
│                                                   │
│ [Informations de réservation]                           │
│ Type d'espace *  │ Type d'abonnement *                │
│ Date début *     │ Date fin *                          │
│ Occupants *      │ Montant *                           │
│ Paiement *       │ Statut *                            │
│                                                   │
│ [Notes]                                                │
│ Notes client     │ Notes administrateur                │
│                                                   │
│ [Actions]                                               │
│ [Annuler]        [Sauvegarder]                        │
└─────────────────────────────────────────────────────────┘
```

### **Boutons d'action :**
- **Modifier** : Ouvre le modal de modification
- **Facture** : Télécharge la facture (si confirmée)
- **Sauvegarder** : Enregistre les modifications en base
- **Annuler** : Ferme le modal sans sauvegarder

## 🔒 **Sécurité et permissions :**

### **Accès :**
- ✅ **Administrateurs** : Accès complet à toutes les réservations
- ✅ **Utilisateurs** : Accès limité (selon les permissions)
- ✅ **Clients** : Accès uniquement à leurs propres réservations

### **Validation :**
- ✅ **Champs obligatoires** vérifiés avant sauvegarde
- ✅ **Types de données** validés (nombres, dates, emails)
- ✅ **Permissions** vérifiées avant modification

## 📊 **Gestion des erreurs :**

### **Types d'erreurs :**
- ❌ **Erreur de validation** : Champs obligatoires manquants
- ❌ **Erreur de base** : Problème de connexion ou de permissions
- ❌ **Erreur de sauvegarde** : Échec de la mise à jour

### **Gestion des erreurs :**
- ✅ **Messages d'erreur** clairs et informatifs
- ✅ **Validation en temps réel** des champs
- ✅ **Rollback automatique** en cas d'échec
- ✅ **Notifications** de succès/erreur

## 🔄 **Flux de modification :**

### **Étape 1 : Ouverture du modal**
```typescript
const handleEditReservation = (reservation: any) => {
  setEditingReservation(reservation);
  setEditReservationFormData({
    full_name: reservation.full_name || '',
    email: reservation.email || '',
    // ... autres champs
  });
  setIsEditReservationModalOpen(true);
};
```

### **Étape 2 : Modification des données**
```typescript
const handleEditReservationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setEditReservationFormData(prev => ({
    ...prev,
    [name]: name === 'amount' || name === 'occupants' ? Number(value) : value
  }));
};
```

### **Étape 3 : Sauvegarde en base**
```typescript
const handleSaveReservation = async () => {
  const { error } = await supabase
    .from('reservations')
    .update({
      full_name: editReservationFormData.full_name,
      email: editReservationFormData.email,
      // ... autres champs
      updated_at: new Date().toISOString()
    })
    .eq('id', editingReservation.id);
  
  if (!error) {
    showNotification('success', 'Réservation mise à jour avec succès');
    refetch(); // Recharger les données
  }
};
```

## 🎯 **Cas d'usage courants :**

### **1. Correction d'erreurs :**
- **Email incorrect** : Modifier l'adresse email du client
- **Montant erroné** : Ajuster le prix de la réservation
- **Dates incorrectes** : Corriger la période de réservation

### **2. Mise à jour de statut :**
- **Confirmation** : Passer de "en attente" à "confirmée"
- **Terminaison** : Marquer comme "terminée"
- **Annulation** : Changer le statut à "annulée"

### **3. Modification des détails :**
- **Changement d'espace** : Modifier le type d'espace réservé
- **Ajustement d'occupants** : Modifier le nombre de personnes
- **Mise à jour des notes** : Ajouter des informations administratives

## 🚨 **Bonnes pratiques :**

### **Avant modification :**
- ✅ **Vérifier les permissions** de l'utilisateur
- ✅ **Valider les données** avant sauvegarde
- ✅ **Sauvegarder l'état initial** si nécessaire

### **Pendant modification :**
- ✅ **Utiliser la validation** en temps réel
- ✅ **Vérifier la cohérence** des données
- ✅ **Informer l'utilisateur** des changements

### **Après modification :**
- ✅ **Confirmer la sauvegarde** avec un message
- ✅ **Recharger les données** pour refléter les changements
- ✅ **Auditer les modifications** si nécessaire

## 🔧 **Maintenance et support :**

### **Vérifications régulières :**
- ✅ **Logs de modification** dans la base de données
- ✅ **Historique des changements** par réservation
- ✅ **Performance** des requêtes de mise à jour

### **Dépannage :**
- ✅ **Vérifier les permissions** de l'utilisateur
- ✅ **Contrôler la connexion** à la base de données
- ✅ **Valider la structure** des données

---

**Version :** 1.0  
**Date :** 21 Janvier 2025  
**Auteur :** Équipe Technique Nzoo Immo
