# 🚀 Configuration CinetPay pour les Paiements Mobile Money

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer CinetPay pour permettre les paiements par mobile money (Orange Money et Airtel Money) dans votre application N'zoo Immo.

## 🔧 Étape 1 : Créer un compte CinetPay

### 1. Inscription
1. **Allez sur** [https://cinetpay.com](https://cinetpay.com)
2. **Cliquez sur "Créer un compte"**
3. **Remplissez le formulaire** avec vos informations
4. **Vérifiez votre email** et activez votre compte

### 2. Configuration du compte
1. **Connectez-vous** à votre dashboard CinetPay
2. **Allez dans "Paramètres"** → "API Keys"
3. **Générez vos clés API** :
   - **API Key** : Clé principale pour l'authentification
   - **Site ID** : Identifiant de votre site

## 🔑 Étape 2 : Configuration des Variables d'Environnement

### Créer le fichier `.env.local`

Créez un fichier `.env.local` à la racine de votre projet :

```bash
# Configuration CinetPay
REACT_APP_CINETPAY_API_KEY=votre_api_key_ici
REACT_APP_CINETPAY_SITE_ID=votre_site_id_ici
REACT_APP_CINETPAY_ENVIRONMENT=TEST

# URLs de retour (optionnel - sera automatiquement configuré)
REACT_APP_PAYMENT_SUCCESS_URL=http://localhost:5174/payment/success
REACT_APP_PAYMENT_CANCEL_URL=http://localhost:5174/payment/cancel
```

### Variables d'environnement expliquées

| Variable | Description | Exemple |
|----------|-------------|---------|
| `REACT_APP_CINETPAY_API_KEY` | Votre clé API CinetPay | `cp_api_key_1234567890abcdef` |
| `REACT_APP_CINETPAY_SITE_ID` | Votre ID de site CinetPay | `123456` |
| `REACT_APP_CINETPAY_ENVIRONMENT` | Environnement (TEST/PROD) | `TEST` |

## 🧪 Étape 3 : Test en Mode Développement

### 1. Mode Test
- **Utilisez** `REACT_APP_CINETPAY_ENVIRONMENT=TEST`
- **Les paiements** sont simulés
- **Aucun vrai argent** n'est débité
- **Parfait** pour tester l'intégration

### 2. Tester l'intégration
1. **Lancez votre application** : `npm run dev`
2. **Allez sur** la page de réservation
3. **Sélectionnez** Orange Money ou Airtel Money
4. **Remplissez** le formulaire
5. **Cliquez** sur "Payer"
6. **Vérifiez** que la page de paiement s'ouvre

## 🚀 Étape 4 : Passage en Production

### 1. Configuration Production
```bash
# Dans votre fichier .env.production
REACT_APP_CINETPAY_API_KEY=votre_vraie_api_key
REACT_APP_CINETPAY_SITE_ID=votre_vrai_site_id
REACT_APP_CINETPAY_ENVIRONMENT=PROD
```

### 2. URLs de Production
```bash
REACT_APP_PAYMENT_SUCCESS_URL=https://votre-domaine.com/payment/success
REACT_APP_PAYMENT_CANCEL_URL=https://votre-domaine.com/payment/cancel
```

## 📱 Méthodes de Paiement Supportées

### ✅ Orange Money
- **Canal** : `ORANGE`
- **Pays** : République du Congo
- **Devise** : XAF (Franc CFA)

### ✅ Airtel Money
- **Canal** : `AIRTEL`
- **Pays** : République du Congo
- **Devise** : XAF (Franc CFA)

### ✅ Cartes Bancaires
- **VISA** : Cartes Visa internationales
- **Mastercard** : Cartes Mastercard internationales

## 🔍 Diagnostic des Problèmes

### ❌ Erreur : "Configuration CinetPay manquante"
**Solution** : Vérifiez que vos variables d'environnement sont bien configurées

### ❌ Erreur : "Impossible d'ouvrir la page de paiement"
**Solution** : Autorisez les popups dans votre navigateur

### ❌ Erreur : "Paiement annulé"
**Solution** : Vérifiez que vous utilisez un numéro de téléphone valide

### ❌ Erreur : "API Key invalide"
**Solution** : Vérifiez votre clé API dans le dashboard CinetPay

## 📞 Support CinetPay

### Contact
- **Email** : support@cinetpay.com
- **Téléphone** : +242 06 123 4567
- **Documentation** : [https://docs.cinetpay.com](https://docs.cinetpay.com)

### Ressources
- **Dashboard** : [https://admin.cinetpay.com](https://admin.cinetpay.com)
- **API Documentation** : [https://api.cinetpay.com](https://api.cinetpay.com)
- **Statuts des services** : [https://status.cinetpay.com](https://status.cinetpay.com)

## 🎯 Prochaines Étapes

1. **Testez** l'intégration en mode développement
2. **Configurez** vos vraies clés API
3. **Testez** en mode production
4. **Surveillez** les transactions dans votre dashboard CinetPay

## ✅ Checklist de Configuration

- [ ] Compte CinetPay créé
- [ ] API Key générée
- [ ] Site ID obtenu
- [ ] Variables d'environnement configurées
- [ ] Test en mode développement réussi
- [ ] Configuration production prête
- [ ] URLs de retour configurées

---

**💡 Conseil** : Commencez toujours par tester en mode `TEST` avant de passer en production !
