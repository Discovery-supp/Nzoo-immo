# Système de Gestion du Contenu des Espaces

## Vue d'ensemble

Ce système permet de modifier dynamiquement le contenu des espaces (titre, description, prix, équipements, images) via le modal "Éditeur de Contenu des Espaces" dans le dashboard d'administration, et d'appliquer ces modifications directement à la page des espaces en temps réel.

## Architecture

### 1. Service de Persistance (`SpaceContentService`)

**Fichier :** `src/services/spaceContentService.ts`

- **Fonctionnalités :**
  - Sauvegarde des modifications dans le localStorage
  - Fusion des données modifiées avec les données par défaut
  - Gestion des timestamps de modification
  - Réinitialisation aux valeurs par défaut

- **Méthodes principales :**
  - `saveContent(data)` : Sauvegarde les modifications
  - `getSavedContent()` : Récupère les données sauvegardées
  - `mergeWithDefault(defaultData, language)` : Fusionne avec les données par défaut
  - `resetContent()` : Réinitialise aux valeurs par défaut

### 2. Hook Personnalisé (`useSpaceContent`)

**Fichier :** `src/hooks/useSpaceContent.ts`

- **Fonctionnalités :**
  - Gestion de l'état des espaces avec persistance
  - Écoute des événements de mise à jour
  - Synchronisation automatique entre les composants

### 3. Éditeur de Contenu (`SpaceContentEditor`)

**Fichier :** `src/components/SpaceContentEditor.tsx`

- **Fonctionnalités :**
  - Interface d'édition pour chaque espace
  - Sauvegarde automatique dans le localStorage
  - Indicateur de modifications
  - Bouton de réinitialisation

### 4. Indicateur de Modifications (`SpaceContentIndicator`)

**Fichier :** `src/components/SpaceContentIndicator.tsx`

- **Fonctionnalités :**
  - Affichage visuel des modifications actives
  - Date de dernière modification
  - Bouton de réinitialisation rapide

## Flux de Données

### 1. Modification via l'Éditeur

1. L'utilisateur ouvre le modal "Éditeur de Contenu des Espaces"
2. Il modifie les données d'un espace (titre, description, prix, etc.)
3. Il clique sur "Sauvegarder"
4. Les données sont sauvegardées dans le localStorage via `SpaceContentService`
5. Un événement `spaceContentUpdated` est émis
6. La page des espaces se met à jour automatiquement

### 2. Affichage sur la Page des Espaces

1. La page des espaces utilise le hook `useSpaceContent`
2. Le hook récupère les données fusionnées (défaut + modifications)
3. Les données sont affichées avec les modifications appliquées
4. L'indicateur de modifications s'affiche si des modifications existent

### 3. Réinitialisation

1. L'utilisateur clique sur le bouton de réinitialisation
2. Les données sauvegardées sont supprimées du localStorage
3. Les données par défaut sont restaurées
4. La page se met à jour automatiquement

## Utilisation

### Pour les Administrateurs

1. **Accéder à l'éditeur :**
   - Aller dans le dashboard d'administration
   - Cliquer sur "Éditer le contenu" dans la section Gestion des Espaces

2. **Modifier un espace :**
   - Cliquer sur "Modifier" pour l'espace souhaité
   - Modifier les champs (titre, description, prix, équipements)
   - Cliquer sur "Sauvegarder"

3. **Réinitialiser :**
   - Utiliser le bouton "Réinitialiser aux valeurs par défaut" dans l'éditeur
   - Ou utiliser l'indicateur flottant sur la page des espaces

### Pour les Développeurs

1. **Ajouter un nouveau champ :**
   - Modifier l'interface `SpaceInfo` dans `spacesData.ts`
   - Ajouter le champ dans `SpaceContentEditor`
   - Mettre à jour la logique de fusion dans `SpaceContentService`

2. **Étendre les fonctionnalités :**
   - Ajouter de nouveaux types d'espaces dans `spacesData.ts`
   - Créer de nouveaux composants d'édition si nécessaire

## Avantages

1. **Persistance :** Les modifications sont sauvegardées et persistent entre les sessions
2. **Temps réel :** Les modifications sont appliquées immédiatement
3. **Réversible :** Possibilité de revenir aux valeurs par défaut
4. **Sécurisé :** Les données par défaut ne sont jamais perdues
5. **Performant :** Utilisation du localStorage pour un accès rapide

## Limitations

1. **Stockage local :** Les modifications sont stockées localement (navigateur)
2. **Pas de synchronisation :** Les modifications ne sont pas partagées entre les navigateurs
3. **Pas de versioning :** Pas d'historique des modifications

## Évolutions Futures

1. **Synchronisation serveur :** Sauvegarder les modifications dans la base de données
2. **Versioning :** Historique des modifications avec possibilité de rollback
3. **Collaboration :** Partage des modifications entre administrateurs
4. **Validation :** Règles de validation pour les données saisies
5. **Prévisualisation :** Mode aperçu avant sauvegarde
