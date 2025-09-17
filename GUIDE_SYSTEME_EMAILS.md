# 📧 Guide de Configuration du Système d'Emails

## 🎯 Vue d'ensemble

Ce guide explique comment configurer et déployer le système d'emails pour les réservations Nzoo Immo.

## 🔍 **Problème identifié :**

Le client ne reçoit pas d'emails car :
1. ❌ La fonction Edge `send-confirmation-email` n'existe pas
2. ❌ Le système d'emails n'est pas configuré
3. ❌ Aucun service d'email n'est intégré

## 🛠️ **Solutions disponibles :**

### **Option 1 : Déploiement de la fonction Edge (Recommandée)**

#### **Étape 1 : Déployer la fonction Edge**
```bash
# Dans le dossier supabase/functions
supabase functions deploy send-confirmation-email
```

#### **Étape 2 : Vérifier les variables d'environnement**
Dans Supabase Dashboard > Settings > Edge Functions, vérifiez :
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

#### **Étape 3 : Tester la fonction**
```bash
# Tester avec curl
curl -X POST https://nnkywmfxoohehtyyzzgp.supabase.co/functions/v1/send-confirmation-email \
  -H "Authorization: Bearer [VOTRE_ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<p>Test email</p>"
  }'
```

### **Option 2 : Intégration d'un service d'email réel**

#### **A. SendGrid (Recommandé)**
1. **Créer un compte SendGrid**
2. **Obtenir une API Key**
3. **Configurer l'expéditeur**
4. **Modifier la fonction Edge**

```typescript
// Dans supabase/functions/send-confirmation-email/index.ts
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'reservations@nzooimmo.com'

// Ajouter la logique SendGrid
if (SENDGRID_API_KEY) {
  // Envoyer via SendGrid
  const result = await sendViaSendGrid(SENDGRID_API_KEY, FROM_EMAIL, to, subject, html)
  if (result.success) {
    return { success: true, provider: 'sendgrid' }
  }
}
```

#### **B. Resend**
1. **Créer un compte Resend**
2. **Obtenir une API Key**
3. **Configurer le domaine**
4. **Intégrer dans la fonction Edge**

#### **C. Service SMTP personnalisé**
1. **Configurer un serveur SMTP**
2. **Créer une fonction d'envoi SMTP**
3. **Intégrer dans la fonction Edge**

## 📋 **Étapes de déploiement :**

### **1. Exécuter la migration SQL**
```sql
-- Dans Supabase SQL Editor, exécuter :
-- supabase/migrations/20250121000000_client_account_management.sql
```

### **2. Déployer la fonction Edge**
```bash
cd supabase/functions
supabase functions deploy send-confirmation-email
```

### **3. Vérifier le déploiement**
```bash
supabase functions list
```

### **4. Tester le système**
```bash
# Exécuter le script de test
node test_email_system.cjs
```

## 🔧 **Configuration des variables d'environnement :**

### **Dans Supabase Dashboard :**
1. **Settings > Edge Functions**
2. **Ajouter les variables :**
   ```
   SUPABASE_URL=https://nnkywmfxoohehtyyzzgp.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=[VOTRE_SERVICE_ROLE_KEY]
   SENDGRID_API_KEY=[VOTRE_SENDGRID_KEY] (optionnel)
   FROM_EMAIL=reservations@nzooimmo.com
   ```

### **Dans le code local :**
```typescript
// src/services/emailServiceDirect.ts
const SUPABASE_URL = 'https://nnkywmfxoohehtyyzzgp.supabase.co'
const SUPABASE_ANON_KEY = '[VOTRE_ANON_KEY]'
```

## 🧪 **Tests et vérifications :**

### **Test 1 : Vérifier la fonction Edge**
```bash
node test_email_system.cjs
```

### **Test 2 : Créer une réservation test**
1. **Aller sur la page de réservation**
2. **Remplir le formulaire**
3. **Choisir "Cash" comme méthode de paiement**
4. **Cliquer sur "Réserver"**
5. **Vérifier la console pour les logs**

### **Test 3 : Vérifier les logs**
```sql
-- Dans Supabase SQL Editor
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 10;
```

## 📊 **Monitoring et logs :**

### **Logs disponibles :**
- 📧 **Console navigateur** : Logs détaillés de l'envoi
- 📧 **Supabase Edge Functions** : Logs de la fonction
- 📧 **Base de données** : Table `email_logs`

### **Métriques à surveiller :**
- ✅ Nombre d'emails envoyés
- ❌ Nombre d'erreurs d'envoi
- ⏱️ Temps de réponse de la fonction Edge
- 📧 Statut des emails (envoyé, échec, en attente)

## 🚨 **Dépannage :**

### **Problème : "Function not found"**
**Solution :** Déployer la fonction Edge
```bash
supabase functions deploy send-confirmation-email
```

### **Problème : "Unauthorized"**
**Solution :** Vérifier les clés API
```bash
# Vérifier dans Supabase Dashboard > Settings > API
```

### **Problème : "CORS error"**
**Solution :** Vérifier les headers CORS dans la fonction Edge

### **Problème : "Email not sent"**
**Solution :** Vérifier les logs et le mode fallback

## 💡 **Recommandations :**

### **Pour la production :**
1. ✅ **Utiliser SendGrid ou Resend** pour un envoi fiable
2. ✅ **Configurer les logs complets** pour le suivi
3. ✅ **Mettre en place des alertes** en cas d'échec
4. ✅ **Tester régulièrement** le système d'emails

### **Pour le développement :**
1. ✅ **Utiliser le mode simulation** pour les tests
2. ✅ **Vérifier les logs** dans la console
3. ✅ **Tester avec des emails valides**

## 📞 **Support :**

En cas de problème :
1. 📧 **Vérifier les logs** dans la console
2. 📧 **Exécuter le script de test** : `node test_email_system.cjs`
3. 📧 **Vérifier la migration SQL** dans Supabase
4. 📧 **Contacter l'équipe technique**

---

**Version :** 1.0  
**Date :** 21 Janvier 2025  
**Auteur :** Équipe Technique Nzoo Immo
