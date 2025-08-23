# 📧 Configuration Email - Nzoo Immo

## 🎯 Vue d'ensemble

Ce guide vous accompagne pour configurer le système d'emails de réservation de Nzoo Immo. Le système envoie automatiquement des emails de confirmation aux clients et des accusés de réception à l'administration.

## 🚀 Solution Recommandée : Resend

Nous recommandons **Resend** au lieu de SendGrid car :
- ✅ Plus moderne et fiable
- ✅ Interface plus simple
- ✅ Meilleure délivrabilité
- ✅ Support TypeScript natif
- ✅ 100 emails/jour gratuits

---

## 📚 Guides Disponibles

### 1. **TUTORIEL_RESEND_SUPABASE.md** - Guide Complet
**Description** : Tutoriel étape par étape avec instructions détaillées
**Contenu** :
- Création du compte Resend
- Configuration du domaine
- Obtention de la clé API
- Configuration Supabase
- Déploiement de la fonction
- Tests et vérification

### 2. **CAPTURES_ECRAN_RESEND.md** - Guide Visuel
**Description** : Descriptions détaillées des écrans pour chaque étape
**Contenu** :
- Ce que vous devriez voir à chaque étape
- Actions à effectuer
- Écrans de succès et d'erreur
- Solutions aux problèmes courants

### 3. **RESEND_SETUP_GUIDE.md** - Guide Rapide
**Description** : Guide condensé pour une configuration rapide
**Contenu** :
- Instructions essentielles
- Avantages de Resend vs SendGrid
- Diagnostic des problèmes

### 4. **EMAIL_SYSTEM_GUIDE.md** - Documentation Technique
**Description** : Documentation complète du système d'email
**Contenu** :
- Architecture du système
- Templates d'emails
- Gestion des erreurs
- Personnalisation

### 5. **EMAIL_TROUBLESHOOTING.md** - Résolution des Problèmes
**Description** : Guide de dépannage complet
**Contenu** :
- Problèmes courants et solutions
- Diagnostic automatique
- Support et ressources

---

## 🛠️ Scripts de Test Disponibles

### Tests automatiques
```bash
# Test général de la configuration email
npm run test:email

# Test spécifique Resend
npm run test:resend

# Test de configuration Resend
npm run test:resend-config

# Test SendGrid (si vous préférez)
npm run test:sendgrid
```

### Test manuel
1. Ouvrez l'application Nzoo Immo
2. Allez dans le tableau de bord admin
3. Cliquez sur "Diagnostic Supabase"
4. Testez la fonction email

---

## 📋 Variables d'Environnement Requises

### Dans Supabase > Settings > Edge Functions

**Pour Resend (Recommandé) :**
```
RESEND_API_KEY=re_votre_clé_api_resend
FROM_EMAIL=reservation@nzoo.immo
```

**Pour SendGrid (Alternative) :**
```
SENDGRID_API_KEY=votre_clé_api_sendgrid
FROM_EMAIL=reservation@nzoo.immo
```

---

## 🚀 Étapes Rapides pour Resend

### 1. Créer un compte Resend
- Allez sur [resend.com](https://resend.com)
- Créez un compte gratuit
- Vérifiez votre email

### 2. Configurer le domaine
- Dans Settings > Domains
- Ajoutez `nzoo.immo`
- Configurez les DNS selon les instructions

### 3. Obtenir la clé API
- Dans Settings > API Keys
- Créez une nouvelle clé
- Copiez la clé (format : `re_xxxxxxxxx`)

### 4. Configurer Supabase
- Dans votre projet Supabase > Settings > Edge Functions
- Ajoutez les variables d'environnement
- Déployez la fonction

### 5. Tester
```bash
npm run test:resend-config
```

---

## 🔍 Diagnostic des Problèmes

### Problème : "Invalid API key"
**Solution :**
- Vérifiez que la clé API est correcte
- Assurez-vous qu'elle commence par `re_` (Resend)
- Vérifiez les permissions de la clé

### Problème : "Domain not verified"
**Solution :**
- Vérifiez que votre domaine est bien configuré dans Resend
- Vérifiez les enregistrements DNS
- Utilisez temporairement un email vérifié

### Problème : "Function not found"
**Solution :**
- Déployez la fonction : `npx supabase functions deploy send-confirmation-email`
- Vérifiez que vous êtes connecté à Supabase

### Problème : Variables d'environnement non trouvées
**Solution :**
- Vérifiez que les variables sont bien ajoutées dans Supabase
- Redéployez la fonction après avoir ajouté les variables

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
4. Testez avec les scripts automatiques

---

## 🎉 Résultat Final

Une fois configuré, votre système d'emails fonctionnera automatiquement :

### Emails envoyés automatiquement
- ✅ **Email de confirmation client** : Détails de la réservation
- ✅ **Email d'accusé de réception admin** : Notification de nouvelle réservation
- ✅ **Templates HTML personnalisés** : Design professionnel Nzoo Immo
- ✅ **Gestion des erreurs** : Logs détaillés et fallback
- ✅ **Support multilingue** : Français et anglais

### Fonctionnalités
- Envoi automatique lors de chaque réservation
- Templates HTML avec design moderne
- Gestion des erreurs et retry automatique
- Logs détaillés pour le monitoring
- Support de plusieurs services d'email

---

## 📝 Notes Importantes

- **Sécurité** : Ne partagez jamais votre clé API
- **Limites** : Resend gratuit = 100 emails/jour
- **Monitoring** : Surveillez les logs pour détecter les problèmes
- **Backup** : Gardez une copie de votre clé API dans un endroit sûr

---

*Configuration Email - Nzoo Immo - Système de réservation d'espaces de travail*





