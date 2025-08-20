# 📧 Tutoriel Complet : Configuration Resend + Supabase pour Nzoo Immo

## 🎯 Objectif
Configurer le système d'emails de réservation avec Resend et Supabase pour que les emails de confirmation soient envoyés automatiquement.

---

## 📋 Prérequis
- ✅ Compte Supabase actif
- ✅ Projet Nzoo Immo configuré
- ✅ Accès à votre domaine nzoo.immo

---

## 🚀 Étape 1 : Créer un compte Resend

### 1.1 Accéder à Resend
1. Ouvrez votre navigateur
2. Allez sur [resend.com](https://resend.com)
3. Cliquez sur **"Get Started"** ou **"Sign Up"**

### 1.2 Créer votre compte
1. **Remplissez le formulaire** :
   - Email : votre email professionnel
   - Mot de passe : choisissez un mot de passe sécurisé
   - Nom de l'entreprise : "Nzoo Immo"

2. **Vérifiez votre email** :
   - Vérifiez votre boîte mail
   - Cliquez sur le lien de confirmation

---

## 🔧 Étape 2 : Configurer votre domaine

### 2.1 Accéder aux paramètres du domaine
1. Dans le dashboard Resend
2. Cliquez sur **"Settings"** dans le menu de gauche
3. Cliquez sur **"Domains"**

### 2.2 Ajouter votre domaine
1. Cliquez sur **"Add Domain"**
2. Entrez votre domaine : `nzoo.immo`
3. Cliquez sur **"Add Domain"**

### 2.3 Configurer les DNS
Resend vous donnera des enregistrements DNS à ajouter :

**Exemple d'enregistrements DNS :**
```
Type: TXT
Name: @
Value: resend-verification=abc123...

Type: CNAME
Name: email
Value: track.resend.com
```

**Instructions :**
1. Connectez-vous à votre fournisseur DNS (ex: Cloudflare, GoDaddy)
2. Ajoutez ces enregistrements DNS
3. Attendez la propagation (5-10 minutes)
4. Revenez sur Resend et cliquez sur **"Verify Domain"**

### 2.4 Alternative : Email vérifié
Si vous ne pouvez pas configurer le domaine immédiatement :
1. Dans **Settings > Domains**
2. Cliquez sur **"Add Verified Email"**
3. Entrez : `reservation@nzoo.immo`
4. Vérifiez l'email reçu

---

## 🔑 Étape 3 : Obtenir la clé API

### 3.1 Accéder aux clés API
1. Dans le dashboard Resend
2. Cliquez sur **"Settings"** dans le menu de gauche
3. Cliquez sur **"API Keys"**

### 3.2 Créer une nouvelle clé
1. Cliquez sur **"Create API Key"**
2. **Configurez la clé** :
   - **Name** : `Nzoo Immo Production`
   - **Permissions** : `Full Access` (ou `Sending` seulement)
3. Cliquez sur **"Create API Key"**

### 3.3 Copier la clé API
⚠️ **IMPORTANT** : Copiez immédiatement la clé API, elle ne sera plus visible après !

**Format de la clé** : `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## ⚙️ Étape 4 : Configurer Supabase

### 4.1 Accéder à votre projet Supabase
1. Ouvrez [supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet **Nzoo Immo**

### 4.2 Accéder aux Edge Functions
1. Dans le menu de gauche, cliquez sur **"Settings"** (⚙️)
2. Cliquez sur **"Edge Functions"**

### 4.3 Ajouter les variables d'environnement
1. Dans la section **"Environment Variables"**
2. Cliquez sur **"Add Environment Variable"**

**Ajoutez ces deux variables :**

**Variable 1 :**
- **Name** : `RESEND_API_KEY`
- **Value** : `re_votre_clé_api_resend` (remplacez par votre vraie clé)

**Variable 2 :**
- **Name** : `FROM_EMAIL`
- **Value** : `reservation@nzoo.immo`

3. Cliquez sur **"Save"** pour chaque variable

---

## 🚀 Étape 5 : Déployer la fonction Edge

### 5.1 Installer Supabase CLI (si pas déjà fait)
```bash
npm install supabase --save-dev
```

### 5.2 Se connecter à Supabase
```bash
npx supabase login
```
- Suivez les instructions pour vous connecter

### 5.3 Lier votre projet
```bash
npx supabase link --project-ref votre_ref_projet
```
- Remplacez `votre_ref_projet` par l'ID de votre projet Supabase
- Vous pouvez trouver cet ID dans Settings > General

### 5.4 Déployer la fonction
```bash
npx supabase functions deploy send-confirmation-email
```

---

## 🧪 Étape 6 : Tester la configuration

### 6.1 Test automatique
```bash
npm run test:resend
```

### 6.2 Test manuel
1. Ouvrez votre application Nzoo Immo
2. Allez dans le tableau de bord admin
3. Cliquez sur **"Diagnostic Supabase"**
4. Cliquez sur **"Tester la Fonction Email"**

### 6.3 Test d'une réservation
1. Effectuez une nouvelle réservation
2. Vérifiez que l'email de confirmation est reçu
3. Vérifiez les logs dans la console

---

## ✅ Vérification finale

### 6.1 Logs de succès
Vous devriez voir dans les logs :
```
✅ Email sent successfully via Resend
✅ Client confirmation email sent successfully
✅ Admin acknowledgment email sent successfully
```

### 6.2 Emails reçus
- **Client** : Email de confirmation avec les détails de réservation
- **Admin** : Email d'accusé de réception avec les détails

---

## 🔍 Diagnostic des problèmes

### Problème : "Invalid API key"
**Solution :**
1. Vérifiez que la clé API est correcte
2. Assurez-vous qu'elle commence par `re_`
3. Vérifiez les permissions de la clé

### Problème : "Domain not verified"
**Solution :**
1. Vérifiez que votre domaine est bien configuré dans Resend
2. Vérifiez les enregistrements DNS
3. Utilisez temporairement un email vérifié

### Problème : "Function not found"
**Solution :**
1. Déployez la fonction : `npx supabase functions deploy send-confirmation-email`
2. Vérifiez que vous êtes connecté à Supabase

### Problème : Variables d'environnement non trouvées
**Solution :**
1. Vérifiez que les variables sont bien ajoutées dans Supabase
2. Redéployez la fonction après avoir ajouté les variables

---

## 📞 Support

### Ressources utiles
- [Documentation Resend](https://resend.com/docs)
- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Guide Email Complet](EMAIL_SYSTEM_GUIDE.md)

### En cas de problème
1. Vérifiez les logs dans la console du navigateur
2. Utilisez le composant de diagnostic dans l'application
3. Consultez les guides de résolution

---

## 🎉 Félicitations !

Votre système d'emails de réservation est maintenant configuré et fonctionnel ! 

**Ce qui fonctionne maintenant :**
- ✅ Emails de confirmation automatiques
- ✅ Emails d'accusé de réception pour l'admin
- ✅ Templates HTML personnalisés
- ✅ Gestion des erreurs
- ✅ Logs détaillés

**Prochaines étapes :**
1. Testez avec de vraies réservations
2. Personnalisez les templates si nécessaire
3. Surveillez les logs pour optimiser

---

## 📝 Notes importantes

- **Sécurité** : Ne partagez jamais votre clé API
- **Limites** : Resend gratuit = 100 emails/jour
- **Monitoring** : Surveillez les logs pour détecter les problèmes
- **Backup** : Gardez une copie de votre clé API dans un endroit sûr

---

*Tutoriel créé pour Nzoo Immo - Système de réservation d'espaces de travail*






