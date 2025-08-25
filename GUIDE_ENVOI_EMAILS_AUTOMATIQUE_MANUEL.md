# 📧 Guide d'Envoi d'Emails - Automatique et Manuel

## 🎯 Vue d'ensemble

Le système de gestion des réservations offre **deux modes d'envoi d'emails** pour les clients :

1. **Envoi automatique** : Se déclenche automatiquement lors de la confirmation
2. **Envoi manuel** : Permet d'envoyer un email à tout moment

## 🔄 Envoi Automatique

### ✅ **Déclenchement automatique**
- **Quand** : Dès qu'un administrateur change le statut d'une réservation à "confirmed"
- **Comment** : Aucune intervention manuelle requise
- **Où** : Dans le modal de gestion des réservations

### 📧 **Processus automatique**
```typescript
// Dans handleStatusChange()
if (newStatus === 'confirmed') {
  // Envoi automatique d'email de confirmation
  const emailResult = await sendConfirmationEmail({
    to: reservation.email,
    subject: `Confirmation de votre réservation - ${reservation.full_name}`,
    reservationData: { ... }
  });
}
```

### 🔔 **Notifications automatiques**
- ✅ **Succès** : "Email de confirmation envoyé automatiquement au client"
- ⚠️ **Avertissement** : "Statut mis à jour mais erreur lors de l'envoi de l'email de confirmation"

## 👆 Envoi Manuel

### ✅ **Déclenchement manuel**
- **Quand** : À tout moment, selon les besoins de l'administrateur
- **Comment** : Clic sur le bouton "Envoyer email manuellement" (icône 📧) → Ouvre un modal
- **Où** : Dans la liste des actions de chaque réservation

### 📝 **Modal d'Email Personnalisé**
- ✅ **Ouverture** : Clic sur l'icône 📧 dans la liste des réservations
- ✅ **Champs** : 
  - Sujet de l'email (pré-rempli)
  - Message personnalisé (pré-rempli avec template)
- ✅ **Informations** : Affichage des détails de la réservation
- ✅ **Validation** : Bouton d'envoi désactivé si champs vides
- ✅ **Envoi** : Bouton avec spinner pendant l'envoi

### 📧 **Processus manuel**
```typescript
// Dans handleSendEmail()
const emailResult = await sendConfirmationEmail({
  to: reservation.email,
  subject: `Mise à jour de votre réservation - ${reservation.full_name}`,
  reservationData: { ... }
});
```

### 🔔 **Notifications manuelles**
- ✅ **Succès** : "Email manuel envoyé avec succès"
- ❌ **Erreur** : "Erreur lors de l'envoi de l'email manuel"

## 🎨 Interface Utilisateur

### 📋 **Bouton d'envoi manuel**
- **Icône** : 📧 (Send)
- **Couleur** : Vert (text-green-600)
- **Tooltip** : "Envoyer email manuellement"
- **État** : Désactivé pendant l'envoi (spinner)

### 🔄 **Indicateurs visuels**
- **Envoi en cours** : Spinner animé
- **Succès** : Notification verte
- **Erreur** : Notification rouge
- **Avertissement** : Notification orange

## 📊 Comparaison des Modes

| Aspect | Envoi Automatique | Envoi Manuel |
|--------|-------------------|--------------|
| **Déclenchement** | Changement de statut → "confirmed" | Clic sur bouton |
| **Fréquence** | Une fois par confirmation | Illimitée |
| **Sujet** | "Confirmation de votre réservation" | "Mise à jour de votre réservation" |
| **Contenu** | Email de confirmation standard | Email de mise à jour |
| **Notification** | Auto-email success/warning | Manual email success/error |

## 🚀 Utilisation Recommandée

### 🔄 **Envoi Automatique**
- ✅ **Confirmation initiale** : Quand une réservation est confirmée
- ✅ **Processus standard** : Pour toutes les confirmations
- ✅ **Cohérence** : Garantit que tous les clients confirmés reçoivent un email

### 👆 **Envoi Manuel**
- ✅ **Suivi client** : Envoyer des mises à jour supplémentaires
- ✅ **Résolution de problèmes** : Renvoyer un email en cas d'échec
- ✅ **Communication personnalisée** : Envoyer des informations spécifiques
- ✅ **Réservations existantes** : Envoyer un email à une réservation déjà confirmée

## 🔧 Configuration Technique

### 📧 **Service d'email**
```typescript
// Utilise le même service pour les deux modes
import { sendConfirmationEmail } from '../services/emailService';

// Fonction Edge Supabase pour l'envoi sécurisé
const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
  body: { to, subject, html, reservationData }
});
```

### 🌐 **Template HTML**
- **Automatique** : Template de confirmation standard
- **Manuel** : Template de mise à jour standard
- **Personnalisable** : Contenu adapté selon le contexte

## 📝 Logs et Suivi

### 🔍 **Logs automatiques**
```javascript
console.log('📧 Envoi automatique d\'email de confirmation pour la réservation:', reservationId);
console.log('✅ Email de confirmation envoyé avec succès');
console.error('❌ Erreur lors de l\'envoi automatique de l\'email:', error);
```

### 🔍 **Logs manuels**
```javascript
console.log('📧 Envoi manuel d\'email pour la réservation:', reservationId);
console.log('✅ Email manuel envoyé avec succès');
console.error('❌ Erreur lors de l\'envoi manuel de l\'email:', error);
```

## 🧪 Tests

### ✅ **Test automatique**
1. Changer le statut d'une réservation à "confirmed"
2. Vérifier que l'email est envoyé automatiquement
3. Vérifier les notifications appropriées

### ✅ **Test manuel**
1. Cliquer sur le bouton d'envoi d'email
2. Vérifier que l'email est envoyé
3. Vérifier les notifications appropriées

## 🎯 Avantages

### 🔄 **Envoi Automatique**
- ✅ **Cohérence** : Tous les clients confirmés reçoivent un email
- ✅ **Efficacité** : Aucune intervention manuelle requise
- ✅ **Fiabilité** : Processus standardisé

### 👆 **Envoi Manuel**
- ✅ **Flexibilité** : Envoi à tout moment
- ✅ **Personnalisation** : Communication adaptée
- ✅ **Contrôle** : Gestion manuelle des communications

## 🔒 Sécurité

- ✅ **Fonction Edge** : Envoi sécurisé via Supabase
- ✅ **Validation** : Vérification des données avant envoi
- ✅ **Gestion d'erreurs** : Traitement approprié des échecs
- ✅ **Logs** : Suivi complet des envois

## 📞 Support

En cas de problème avec l'envoi d'emails :
1. Vérifier les logs dans la console
2. Contrôler la configuration Supabase
3. Tester avec l'envoi manuel
4. Vérifier la fonction Edge `send-confirmation-email`
