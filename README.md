# Nzoo Immo - Plateforme de Réservation d'Espaces

Application web moderne pour la réservation d'espaces de travail à Kinshasa.

## 🚀 Déploiement sur Render

### Étapes de déploiement :

1. **Connectez votre repository GitHub à Render**
   - Allez sur [render.com](https://render.com)
   - Créez un compte ou connectez-vous
   - Cliquez sur "New +" → "Web Service"
   - Connectez votre repository GitHub

2. **Configuration automatique**
   - Render détectera automatiquement le fichier `render.yaml`
   - La configuration sera appliquée automatiquement

3. **Variables d'environnement**
   - Dans le dashboard Render, allez dans "Environment"
   - Ajoutez ces variables si vous utilisez Supabase :
     ```
     VITE_SUPABASE_URL=votre_url_supabase
     VITE_SUPABASE_ANON_KEY=votre_cle_supabase
     ```

### Configuration manuelle (alternative) :

Si vous préférez configurer manuellement :

- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm run preview`
- **Publish Directory:** `dist`
- **Node Version:** 18+

## 🛠️ Développement Local

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev

# Construction pour la production
npm run build

# Prévisualisation de la version de production
npm run preview
```

## 📦 Structure du Projet

- `/src/pages/` - Pages principales de l'application
- `/src/components/` - Composants réutilisables
- `/src/services/` - Services (Supabase, API)
- `/src/hooks/` - Hooks React personnalisés
- `/public/` - Assets statiques
- `/supabase/` - Configuration et migrations Supabase

## 🔧 Technologies Utilisées

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Base de données:** Supabase
- **Déploiement:** Render
- **Animations:** Framer Motion
- **Icons:** Lucide React

## 📞 Support

Pour toute question technique, contactez l'équipe de développement.