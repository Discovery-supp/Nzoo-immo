# 📸 Guide Visuel : Configuration Resend + Supabase

## 🎯 Objectif
Ce guide vous accompagne étape par étape avec des descriptions détaillées des écrans pour configurer Resend avec Supabase.

---

## 📱 Étape 1 : Créer un compte Resend

### Écran 1.1 : Page d'accueil Resend
**URL** : https://resend.com

**Ce que vous devriez voir :**
- Logo Resend en haut à gauche
- Bouton "Get Started" ou "Sign Up" au centre
- Design moderne avec des couleurs bleues/blanches
- Section "100 emails/day free" visible

**Action :** Cliquez sur "Get Started"

### Écran 1.2 : Formulaire d'inscription
**Ce que vous devriez voir :**
- Formulaire avec champs :
  - Email (votre email professionnel)
  - Password (mot de passe sécurisé)
  - Company name : "Nzoo Immo"
- Bouton "Create account"

**Action :** Remplissez et cliquez sur "Create account"

### Écran 1.3 : Vérification email
**Ce que vous devriez voir :**
- Message "Check your email"
- Instructions pour vérifier votre boîte mail
- Lien "Resend verification email" si nécessaire

**Action :** Vérifiez votre email et cliquez sur le lien de confirmation

---

## 🔧 Étape 2 : Configurer le domaine

### Écran 2.1 : Dashboard Resend
**Ce que vous devriez voir :**
- Menu de gauche avec :
  - Dashboard
  - Emails
  - Domains
  - Settings
- Section "Quick Stats" au centre
- Bouton "Add Domain" ou section Domains

**Action :** Cliquez sur "Settings" puis "Domains"

### Écran 2.2 : Page Domains
**Ce que vous devriez voir :**
- Liste des domaines (probablement vide)
- Bouton "Add Domain" ou "Add your first domain"
- Section "Verified Emails" (alternative)

**Action :** Cliquez sur "Add Domain"

### Écran 2.3 : Formulaire d'ajout de domaine
**Ce que vous devriez voir :**
- Champ de saisie pour le domaine
- Placeholder : "example.com"
- Bouton "Add Domain"

**Action :** Entrez "nzoo.immo" et cliquez sur "Add Domain"

### Écran 2.4 : Instructions DNS
**Ce que vous devriez voir :**
- Enregistrements DNS à ajouter :
  ```
  Type: TXT
  Name: @
  Value: resend-verification=abc123...
  
  Type: CNAME
  Name: email
  Value: track.resend.com
  ```
- Bouton "Verify Domain"
- Instructions pour votre fournisseur DNS

**Action :** Ajoutez ces enregistrements dans votre DNS, puis cliquez sur "Verify Domain"

---

## 🔑 Étape 3 : Obtenir la clé API

### Écran 3.1 : Page API Keys
**Ce que vous devriez voir :**
- Menu Settings > API Keys
- Liste des clés API (probablement vide)
- Bouton "Create API Key"

**Action :** Cliquez sur "Create API Key"

### Écran 3.2 : Formulaire de création de clé
**Ce que vous devriez voir :**
- Champ "Name" : entrez "Nzoo Immo Production"
- Section "Permissions" :
  - [ ] Full Access
  - [ ] Sending
  - [ ] Read
- Bouton "Create API Key"

**Action :** Sélectionnez "Full Access" et cliquez sur "Create API Key"

### Écran 3.3 : Clé API générée
**Ce que vous devriez voir :**
- Clé API au format : `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Message d'avertissement : "Make sure to copy your API key now. You won't be able to see it again!"
- Bouton "Copy" ou "Done"

**Action :** Copiez immédiatement la clé API !

---

## ⚙️ Étape 4 : Configurer Supabase

### Écran 4.1 : Dashboard Supabase
**URL** : https://supabase.com

**Ce que vous devriez voir :**
- Liste de vos projets
- Projet "Nzoo Immo" dans la liste
- Menu de navigation à gauche

**Action :** Cliquez sur votre projet Nzoo Immo

### Écran 4.2 : Menu Settings
**Ce que vous devriez voir :**
- Menu de gauche avec :
  - Table Editor
  - SQL Editor
  - Authentication
  - Storage
  - Edge Functions
  - Settings (⚙️)
- Sous-menu Settings

**Action :** Cliquez sur "Settings" puis "Edge Functions"

### Écran 4.3 : Page Edge Functions
**Ce que vous devriez voir :**
- Section "Environment Variables"
- Liste des variables (probablement vide)
- Bouton "Add Environment Variable" ou "+"

**Action :** Cliquez sur "Add Environment Variable"

### Écran 4.4 : Formulaire d'ajout de variable
**Ce que vous devriez voir :**
- Champ "Name" : entrez "RESEND_API_KEY"
- Champ "Value" : collez votre clé API Resend
- Bouton "Save"

**Action :** Ajoutez la première variable, puis ajoutez la seconde :
- Name : "FROM_EMAIL"
- Value : "reservation@nzoo.immo"

---

## 🚀 Étape 5 : Déployer la fonction

### Écran 5.1 : Terminal/Console
**Ce que vous devriez voir :**
- Terminal ouvert dans votre projet
- Invite de commande : `C:\Users\hp\Desktop\Nzoo-immo-master>`

**Action :** Exécutez les commandes une par une

### Écran 5.2 : Connexion Supabase CLI
**Commande :** `npx supabase login`

**Ce que vous devriez voir :**
- Message "You can generate an access token from https://supabase.com/dashboard/account/tokens"
- Lien à ouvrir dans le navigateur
- Instructions pour copier le token

**Action :** Suivez les instructions pour vous connecter

### Écran 5.3 : Liaison du projet
**Commande :** `npx supabase link --project-ref votre_ref_projet`

**Ce que vous devriez voir :**
- Message de succès : "Finished supabase link"
- Confirmation de la liaison

### Écran 5.4 : Déploiement
**Commande :** `npx supabase functions deploy send-confirmation-email`

**Ce que vous devriez voir :**
- Messages de progression
- "Deployed function send-confirmation-email"
- Message de succès final

---

## 🧪 Étape 6 : Tester la configuration

### Écran 6.1 : Test automatique
**Commande :** `npm run test:resend-config`

**Ce que vous devriez voir :**
- Checklist de configuration
- Instructions détaillées
- Résultat du test

### Écran 6.2 : Test manuel dans l'application
**Ce que vous devriez voir :**
- Application Nzoo Immo ouverte
- Tableau de bord admin
- Section "Diagnostic Supabase"
- Bouton "Tester la Fonction Email"

**Action :** Cliquez sur "Tester la Fonction Email"

### Écran 6.3 : Résultat du test
**Ce que vous devriez voir :**
- Message de succès ou d'erreur
- Détails de la réponse
- Instructions si erreur

---

## ✅ Écrans de succès

### Écran de succès 1 : Configuration réussie
**Ce que vous devriez voir :**
```
✅ Configuration Resend réussie !
Vos emails de réservation fonctionnent maintenant.
```

### Écran de succès 2 : Email reçu
**Ce que vous devriez voir :**
- Email de test dans votre boîte mail
- Sujet : "Test Configuration Resend - Nzoo Immo"
- Contenu HTML formaté
- Détails du test

### Écran de succès 3 : Réservation test
**Ce que vous devriez voir :**
- Réservation créée avec succès
- Email de confirmation reçu
- Email d'accusé de réception pour l'admin

---

## ❌ Écrans d'erreur courants

### Erreur 1 : "Invalid API key"
**Ce que vous devriez voir :**
- Message d'erreur 401
- "The provided authorization grant is invalid"

**Solution :** Vérifiez que la clé API est correcte et commence par "re_"

### Erreur 2 : "Domain not verified"
**Ce que vous devriez voir :**
- Message d'erreur de domaine
- Instructions pour vérifier le domaine

**Solution :** Vérifiez les enregistrements DNS ou utilisez un email vérifié

### Erreur 3 : "Function not found"
**Ce que vous devriez voir :**
- Message d'erreur 404
- "Edge Function not found"

**Solution :** Déployez la fonction avec `npx supabase functions deploy send-confirmation-email`

---

## 📞 Support visuel

### Où trouver de l'aide
- **Documentation Resend** : https://resend.com/docs
- **Documentation Supabase** : https://supabase.com/docs
- **Guides locaux** : TUTORIEL_RESEND_SUPABASE.md

### Captures d'écran utiles
Si vous rencontrez des problèmes, prenez des captures d'écran de :
1. La page d'erreur
2. Les logs de la console
3. Les variables d'environnement dans Supabase
4. La configuration dans Resend

---

*Guide visuel créé pour Nzoo Immo - Configuration Resend + Supabase*





