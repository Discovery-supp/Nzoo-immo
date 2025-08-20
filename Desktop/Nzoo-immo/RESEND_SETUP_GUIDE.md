# 🚀 Configuration Resend pour Nzoo Immo

## 📧 Pourquoi Resend ?

Resend est une alternative moderne et plus fiable à SendGrid :
- ✅ Plus moderne et fiable
- ✅ Interface plus simple
- ✅ Meilleure délivrabilité
- ✅ Support TypeScript natif
- ✅ Documentation excellente
- ✅ 100 emails/jour gratuits

## 🛠️ Configuration étape par étape

### Étape 1 : Créer un compte Resend

1. **Allez sur Resend** :
   - Ouvrez [resend.com](https://resend.com)
   - Cliquez sur "Get Started"

2. **Créez votre compte** :
   - Utilisez votre email professionnel
   - Choisissez un mot de passe sécurisé
   - Vérifiez votre email

### Étape 2 : Vérifier votre domaine

1. **Dans le dashboard Resend** :
   - Allez dans **Settings > Domains**
   - Cliquez sur **Add Domain**

2. **Ajoutez votre domaine** :
   - Entrez : `nzoo.immo`
   - Suivez les instructions pour configurer les DNS

3. **Alternative : Utiliser un email vérifié** :
   - Si vous ne pouvez pas vérifier le domaine immédiatement
   - Utilisez un email que vous contrôlez (ex: `reservation@nzoo.immo`)

### Étape 3 : Obtenir la clé API

1. **Dans le dashboard Resend** :
   - Allez dans **Settings > API Keys**
   - Cliquez sur **Create API Key**

2. **Configurez la clé** :
   - Nom : `Nzoo Immo Production`
   - Permissions : `Full Access` (ou `Sending` seulement)
   - Copiez la clé API générée

### Étape 4 : Configurer Supabase

1. **Dans votre projet Supabase** :
   - Allez sur [supabase.com](https://supabase.com)
   - Sélectionnez votre projet Nzoo Immo
   - Cliquez sur **Settings** (⚙️)

2. **Edge Functions** :
   - Cliquez sur **Edge Functions**
   - Dans **Environment Variables**, ajoutez :

```
RESEND_API_KEY=votre_clé_api_resend
FROM_EMAIL=reservation@nzoo.immo
```

### Étape 5 : Déployer la fonction

1. **Installer Supabase CLI localement** :
   ```bash
   npm install supabase --save-dev
   ```

2. **Se connecter à votre projet** :
   ```bash
   npx supabase login
   npx supabase link --project-ref votre_ref_projet
   ```

3. **Déployer la fonction** :
   ```bash
   npx supabase functions deploy send-confirmation-email
   ```

## 🧪 Test de la configuration

### Test automatique
```bash
npm run test:resend
```

### Test manuel
1. Ouvrez l'application
2. Allez dans le tableau de bord admin
3. Cliquez sur "Diagnostic Supabase"
4. Testez la fonction email

## 📋 Variables d'environnement finales

Dans votre projet Supabase > Settings > Edge Functions :

```
RESEND_API_KEY=re_votre_clé_api_resend
FROM_EMAIL=reservation@nzoo.immo
```

## 🔍 Diagnostic des problèmes

### Erreur "Invalid API key"
- Vérifiez que la clé API est correcte
- Assurez-vous que la clé a les bonnes permissions

### Erreur "Domain not verified"
- Vérifiez votre domaine dans Resend
- Ou utilisez un email vérifié temporairement

### Erreur "Function not found"
- Déployez la fonction : `npx supabase functions deploy send-confirmation-email`

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans la console du navigateur
2. Utilisez le composant de diagnostic dans l'application
3. Consultez la [documentation Resend](https://resend.com/docs)

## 🎯 Avantages de Resend vs SendGrid

| Fonctionnalité | Resend | SendGrid |
|----------------|--------|----------|
| Interface | ✅ Moderne et simple | ❌ Complexe |
| Documentation | ✅ Excellente | ⚠️ Correcte |
| Support TypeScript | ✅ Natif | ❌ Partiel |
| Délivrabilité | ✅ Excellente | ⚠️ Correcte |
| Prix | ✅ 100 emails/jour gratuits | ⚠️ 100 emails/jour gratuits |
| Configuration | ✅ Simple | ❌ Complexe |

## 🚀 Prochaines étapes

1. Créez votre compte Resend
2. Vérifiez votre domaine
3. Obtenez votre clé API
4. Configurez Supabase
5. Déployez la fonction
6. Testez le système

Une fois configuré, vos emails de réservation fonctionneront parfaitement ! 🎉






