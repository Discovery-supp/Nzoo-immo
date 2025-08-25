# Système d'Ajout d'Espaces

## Vue d'ensemble

Ce système permet d'ajouter de nouvelles publications d'espaces directement depuis la page des espaces, en plus de la modification des espaces existants via le modal "Éditeur de Contenu des Espaces".

## Fonctionnalités

### 1. Bouton "Ajouter un nouvel espace"

**Localisation :** Page des espaces, sous le titre "Choisissez votre espace"

**Fonctionnalités :**
- Bouton vert avec icône Plus
- Animation au survol (rotation de l'icône)
- Ouvre le modal d'ajout d'espace

### 2. Modal d'Ajout d'Espace (`AddSpaceModal`)

**Fichier :** `src/components/AddSpaceModal.tsx`

**Champs disponibles :**
- **Clé de l'espace** (unique) : Identifiant de l'espace (ex: salle-reunion, bureau-luxe)
- **Titre** : Nom de l'espace
- **Description** : Description détaillée
- **Image** : Upload d'image personnalisée
- **Équipements** : Liste d'équipements avec ajout/suppression dynamique
- **Prix** : Journalier, mensuel, annuel, horaire
- **Capacité** : Nombre maximum d'occupants

**Validation :**
- Clé unique obligatoire
- Titre obligatoire
- Description obligatoire
- Vérification que la clé n'existe pas déjà

### 3. Gestion des Nouveaux Espaces

**Affichage :**
- Couleur générée automatiquement basée sur la clé
- Type d'espace généré à partir de la clé
- Image personnalisée ou image par défaut
- Capacité affichée dynamiquement

**Fonctions de génération :**
- `getSpaceColor()` : Génère une couleur basée sur la clé
- `getSpaceType()` : Génère un type d'espace à partir de la clé
- `getSpaceCapacity()` : Affiche la capacité pour tous les espaces

### 4. Suppression d'Espaces Ajoutés

**Bouton de suppression :**
- Visible uniquement pour les espaces ajoutés (pas les espaces par défaut)
- Apparaît au survol de la carte d'espace
- Icône de poubelle rouge

**Modal de confirmation (`DeleteSpaceModal`) :**
- Confirmation avant suppression
- Avertissement que l'action ne peut pas être annulée
- Suppression définitive des données

## Flux de Données

### 1. Ajout d'un nouvel espace

1. L'utilisateur clique sur "Ajouter un nouvel espace"
2. Le modal s'ouvre avec un formulaire complet
3. L'utilisateur remplit les informations
4. Validation des données
5. Sauvegarde dans le localStorage via `SpaceContentService`
6. Émission d'un événement `spaceContentUpdated`
7. Mise à jour automatique de la page des espaces
8. Fermeture du modal avec message de succès

### 2. Suppression d'un espace

1. L'utilisateur survole un espace ajouté
2. Le bouton de suppression apparaît
3. Clic sur le bouton de suppression
4. Ouverture du modal de confirmation
5. Confirmation de la suppression
6. Suppression des données du localStorage
7. Émission d'un événement `spaceContentUpdated`
8. Mise à jour automatique de la page
9. Fermeture du modal avec message de succès

## Différences avec l'Éditeur de Contenu

| Fonctionnalité | Éditeur de Contenu | Ajout d'Espace |
|---|---|---|
| **Objectif** | Modifier les espaces existants | Créer de nouveaux espaces |
| **Accès** | Dashboard d'administration | Page des espaces |
| **Données** | Fusion avec les données par défaut | Création complète |
| **Suppression** | Réinitialisation aux valeurs par défaut | Suppression définitive |
| **Validation** | Validation des modifications | Validation de création |

## Utilisation

### Pour les Utilisateurs

1. **Ajouter un espace :**
   - Aller sur la page des espaces
   - Cliquer sur "Ajouter un nouvel espace"
   - Remplir le formulaire
   - Cliquer sur "Créer l'espace"

2. **Supprimer un espace :**
   - Survoler un espace ajouté
   - Cliquer sur l'icône de poubelle
   - Confirmer la suppression

### Pour les Développeurs

1. **Ajouter de nouveaux champs :**
   - Modifier l'interface `NewSpaceData` dans `AddSpaceModal.tsx`
   - Ajouter les champs dans le formulaire
   - Mettre à jour la logique de sauvegarde

2. **Modifier la validation :**
   - Ajuster les règles de validation dans `handleSubmit`
   - Ajouter de nouveaux messages d'erreur

3. **Personnaliser l'affichage :**
   - Modifier les fonctions `getSpaceColor`, `getSpaceType`, `getSpaceCapacity`
   - Ajuster les styles des cartes d'espaces

## Avantages

1. **Simplicité :** Ajout direct depuis la page des espaces
2. **Flexibilité :** Création d'espaces personnalisés
3. **Persistance :** Sauvegarde automatique dans le localStorage
4. **Réversibilité :** Suppression possible des espaces ajoutés
5. **Intégration :** Cohérence avec le système existant

## Limitations

1. **Stockage local :** Les nouveaux espaces ne sont pas partagés entre navigateurs
2. **Pas de synchronisation serveur :** Pas de sauvegarde en base de données
3. **Pas de versioning :** Pas d'historique des ajouts/suppressions

## Évolutions Futures

1. **Synchronisation serveur :** Sauvegarder les nouveaux espaces en base de données
2. **Gestion des images :** Upload vers un service de stockage
3. **Validation avancée :** Règles de validation plus sophistiquées
4. **Prévisualisation :** Mode aperçu avant création
5. **Templates :** Modèles d'espaces prédéfinis
6. **Import/Export :** Possibilité d'importer/exporter des configurations d'espaces
