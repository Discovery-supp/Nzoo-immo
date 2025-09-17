# Configuration de l'Authentification Sociale

Ce guide vous explique comment configurer l'authentification sociale (Google, Apple, Facebook) pour votre application Nzoo Immo.

## 📋 Prérequis

- Un projet Supabase configuré
- Des comptes développeur pour les fournisseurs d'authentification

## 🔧 Configuration Supabase

### 1. Configuration des fournisseurs OAuth dans Supabase

1. Connectez-vous à votre dashboard Supabase
2. Allez dans **Authentication** > **Providers**
3. Activez et configurez chaque fournisseur :

#### Google OAuth
- Activez Google
- Ajoutez votre `Client ID` et `Client Secret`
- Configurez les URLs de redirection : `https://your-domain.com/auth/callback`

#### Facebook OAuth
- Activez Facebook
- Ajoutez votre `App ID` et `App Secret`
- Configurez les URLs de redirection : `https://your-domain.com/auth/callback`

#### Apple OAuth
- Activez Apple
- Ajoutez votre `Client ID`, `Team ID`, `Key ID` et `Private Key`
- Configurez les URLs de redirection : `https://your-domain.com/auth/callback`

### 2. Variables d'environnement

Créez un fichier `.env.local` avec les variables suivantes :

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# URLs de redirection
VITE_AUTH_REDIRECT_URL=https://your-domain.com/auth/callback
```

## 🌐 Configuration des fournisseurs

### Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez l'API Google+ 
4. Créez des identifiants OAuth 2.0
5. Ajoutez les URLs de redirection autorisées :
   - `https://your-domain.com/auth/callback`
   - `http://localhost:5173/auth/callback` (pour le développement)

### Facebook OAuth

1. Allez sur [Facebook Developers](https://developers.facebook.com/)
2. Créez une nouvelle application
3. Ajoutez le produit "Facebook Login"
4. Configurez les URLs de redirection OAuth :
   - `https://your-domain.com/auth/callback`
   - `http://localhost:5173/auth/callback` (pour le développement)

### Apple OAuth

1. Allez sur [Apple Developer](https://developer.apple.com/)
2. Créez un identifiant d'application
3. Activez "Sign In with Apple"
4. Créez une clé privée
5. Configurez les URLs de redirection :
   - `https://your-domain.com/auth/callback`
   - `http://localhost:5173/auth/callback` (pour le développement)

## 🚀 Déploiement

### Configuration pour Netlify

1. Ajoutez les variables d'environnement dans les paramètres Netlify
2. Configurez les redirections dans `_redirects` :

```
/auth/callback  /auth/callback  200
```

### Configuration pour Vercel

1. Ajoutez les variables d'environnement dans les paramètres Vercel
2. Configurez les redirections dans `vercel.json` :

```json
{
  "redirects": [
    {
      "source": "/auth/callback",
      "destination": "/auth/callback",
      "permanent": false
    }
  ]
}
```

## 🔒 Sécurité

### Bonnes pratiques

1. **URLs de redirection** : Utilisez toujours HTTPS en production
2. **Variables d'environnement** : Ne commitez jamais les clés secrètes
3. **Validation** : Validez toujours les tokens côté serveur
4. **Rate limiting** : Implémentez une limitation de taux pour les tentatives de connexion

### Permissions utilisateur

Les utilisateurs authentifiés via les réseaux sociaux ont par défaut le rôle `clients`. Vous pouvez modifier cette logique dans `src/services/socialAuthService.ts`.

## 🐛 Dépannage

### Erreurs courantes

1. **"Invalid redirect URI"** : Vérifiez que l'URL de redirection est correctement configurée
2. **"Client ID not found"** : Vérifiez vos variables d'environnement
3. **"CORS error"** : Assurez-vous que les domaines sont autorisés

### Logs de débogage

Activez les logs de débogage dans la console du navigateur pour voir les détails des erreurs d'authentification.

## 📱 Test

### Test local

1. Lancez l'application en mode développement : `npm run dev`
2. Testez chaque fournisseur d'authentification
3. Vérifiez que les redirections fonctionnent correctement

### Test en production

1. Déployez l'application
2. Testez l'authentification sur le domaine de production
3. Vérifiez que les sessions persistent correctement

## 🔄 Mise à jour

Pour mettre à jour la configuration :

1. Modifiez les paramètres dans Supabase
2. Mettez à jour les variables d'environnement
3. Redéployez l'application
4. Testez l'authentification

## 📞 Support

En cas de problème :

1. Vérifiez les logs de la console
2. Consultez la documentation Supabase
3. Vérifiez la configuration des fournisseurs OAuth
4. Contactez l'équipe de développement
