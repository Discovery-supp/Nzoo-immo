# Configuration Supabase pour Nzoo Immo

## 🚀 Configuration rapide

### 1. Créer un fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
VITE_SUPABASE_URL=https://nnkywmfxoohehtyyzzgp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk
```

### 2. Configuration des emails (SendGrid)

Pour que les emails de confirmation fonctionnent, vous devez configurer SendGrid :

#### a) Créer un compte SendGrid
1. Allez sur [sendgrid.com](https://sendgrid.com)
2. Créez un compte gratuit (100 emails/jour)
3. Vérifiez votre domaine d'email

#### b) Obtenir la clé API
1. Dans votre dashboard SendGrid, allez dans Settings > API Keys
2. Créez une nouvelle clé API avec les permissions "Mail Send"
3. Copiez la clé API

#### c) Configurer Supabase Edge Functions
1. Dans votre projet Supabase, allez dans Settings > Edge Functions
2. Ajoutez les variables d'environnement suivantes :
   ```
   SENDGRID_API_KEY=votre_clé_api_sendgrid
   FROM_EMAIL=votre_email_verifie@votredomaine.com
   ```

#### d) Déployer la fonction Edge
```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Se connecter à votre projet
supabase login
supabase link --project-ref votre_ref_projet

# Déployer la fonction d'email
supabase functions deploy send-confirmation-email
```

### 3. Redémarrer le serveur de développement

```bash
npm run dev
```

## 🔧 Configuration manuelle

Si vous avez votre propre projet Supabase :

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez l'URL et la clé anon

### 2. Configurer les variables d'environnement

Remplacez les valeurs dans `.env.local` par vos propres clés :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon
```

### 3. Exécuter les migrations

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter à votre projet
supabase login
supabase link --project-ref votre_ref_projet

# Exécuter les migrations
supabase db push
```

## 📋 Tables nécessaires

Le projet nécessite les tables suivantes :

- `spaces` - Gestion des espaces
- `reservations` - Gestion des réservations
- `clients` - Gestion des clients
- `payments` - Gestion des paiements

## 🔍 Diagnostic des problèmes

### Erreur "Invalid API key"
- Vérifiez que votre clé API est correcte
- Assurez-vous que le projet Supabase est actif

### Erreur "relation does not exist"
- Exécutez les migrations : `supabase db push`
- Vérifiez que toutes les tables sont créées

### Erreur de connexion réseau
- Vérifiez votre connexion internet
- Vérifiez que Supabase n'est pas en maintenance

## 🛠️ Commandes utiles

```bash
# Vérifier la connexion Supabase
supabase status

# Voir les logs
supabase logs

# Réinitialiser la base de données
supabase db reset

# Générer les types TypeScript
supabase gen types typescript --local > src/lib/database.types.ts
```

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez la console du navigateur pour les erreurs
2. Utilisez le composant de diagnostic dans l'application
3. Consultez la [documentation Supabase](https://supabase.com/docs)

## 🔒 Sécurité

- Les clés anon sont publiques et peuvent être exposées côté client
- Utilisez Row Level Security (RLS) pour protéger vos données
- Ne partagez jamais vos clés service_role
