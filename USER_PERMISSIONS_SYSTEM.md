# Système de Permissions des Utilisateurs

## Vue d'ensemble

Ce système gère les permissions des utilisateurs dans l'application, permettant de contrôler l'accès aux différentes fonctionnalités selon le rôle de l'utilisateur.

## Rôles Disponibles

### 1. Admin
- **Accès complet** à toutes les fonctionnalités
- **Gestion des utilisateurs** : voir, créer, modifier, supprimer
- **Gestion des espaces** : voir, créer, modifier, supprimer
- **Gestion des réservations** : voir, créer, modifier, supprimer
- **Statistiques et revenus** : accès complet

### 2. User
- **Accès limité** aux fonctionnalités de base
- **Gestion des espaces** : voir, créer, modifier, supprimer
- **Gestion des réservations** : voir, créer, modifier, supprimer
- **Statistiques et revenus** : accès en lecture seule
- **❌ Pas d'accès** à la gestion des utilisateurs

## Permissions Définies

| Permission ID | Nom | Description | Rôle Requis |
|---------------|-----|-------------|-------------|
| `view_users` | Voir les utilisateurs | Accéder à la gestion des utilisateurs | Admin |
| `manage_users` | Gérer les utilisateurs | Créer, modifier et supprimer des utilisateurs | Admin |
| `view_spaces` | Voir les espaces | Accéder à la gestion des espaces | Both |
| `manage_spaces` | Gérer les espaces | Créer, modifier et supprimer des espaces | Both |
| `view_reservations` | Voir les réservations | Accéder aux réservations | Both |
| `manage_reservations` | Gérer les réservations | Créer, modifier et supprimer des réservations | Both |
| `view_revenue` | Voir les revenus | Accéder aux statistiques de revenus | Both |
| `view_statistics` | Voir les statistiques | Accéder aux statistiques générales | Both |

## Implémentation

### 1. Hook usePermissions

**Fichier :** `src/hooks/usePermissions.ts`

**Fonctionnalités :**
- Définition centralisée des permissions
- Vérification des permissions par utilisateur
- Méthodes utilitaires pour la gestion des permissions

**Utilisation :**
```typescript
const { hasPermission, isAdmin, userProfile } = usePermissions();

// Vérifier une permission spécifique
if (hasPermission('view_users')) {
  // Afficher la section utilisateurs
}
```

### 2. Composant PermissionGuard

**Fichier :** `src/components/PermissionGuard.tsx`

**Fonctionnalités :**
- Protection des sections sensibles
- Affichage d'un message d'accès refusé
- Support de fallback personnalisé

**Utilisation :**
```typescript
<PermissionGuard permissionId="view_users">
  <UserManagement />
</PermissionGuard>
```

### 3. Intégration dans le Dashboard

**Fichier :** `src/pages/AdminDashboard.tsx`

**Modifications :**
- Filtrage des onglets selon les permissions
- Redirection automatique si accès refusé
- Protection du contenu des onglets

## Fonctionnalités de Sécurité

### 1. Filtrage des Onglets
- L'onglet "Utilisateurs" n'apparaît que pour les admins
- Les autres onglets restent accessibles selon les permissions

### 2. Redirection Automatique
- Si un utilisateur tente d'accéder à une section interdite
- Redirection automatique vers l'onglet "Vue d'ensemble"
- Message de log pour tracer les tentatives d'accès

### 3. Protection du Contenu
- Vérification des permissions avant affichage
- Message d'accès refusé informatif
- Affichage du rôle actuel de l'utilisateur

## Utilisation

### Pour les Développeurs

1. **Ajouter une nouvelle permission :**
   ```typescript
   // Dans usePermissions.ts
   {
     id: 'new_permission',
     name: 'Nouvelle Permission',
     description: 'Description de la permission',
     requiredRole: 'admin' // ou 'user' ou 'both'
   }
   ```

2. **Protéger une section :**
   ```typescript
   <PermissionGuard permissionId="new_permission">
     <MonComposant />
   </PermissionGuard>
   ```

3. **Vérifier une permission :**
   ```typescript
   const { hasPermission } = usePermissions();
   if (hasPermission('new_permission')) {
     // Logique conditionnelle
   }
   ```

### Pour les Administrateurs

1. **Gérer les rôles :**
   - Modifier le rôle dans le profil utilisateur
   - Les permissions se mettent à jour automatiquement

2. **Surveiller les accès :**
   - Vérifier les logs de tentatives d'accès
   - Identifier les utilisateurs qui tentent d'accéder aux sections interdites

## Avantages

1. **Sécurité :** Contrôle granulaire des accès
2. **Flexibilité :** Permissions facilement modifiables
3. **Maintenabilité :** Code centralisé et réutilisable
4. **UX :** Messages d'erreur informatifs
5. **Traçabilité :** Logs des tentatives d'accès

## Limitations

1. **Stockage local :** Les permissions sont basées sur le localStorage
2. **Pas de synchronisation serveur :** Pas de validation côté serveur
3. **Pas de permissions dynamiques :** Permissions définies statiquement

## Évolutions Futures

1. **Permissions dynamiques :** Permissions configurables depuis l'interface
2. **Rôles personnalisés :** Création de rôles avec permissions spécifiques
3. **Validation serveur :** Vérification des permissions côté serveur
4. **Audit trail :** Historique détaillé des accès et modifications
5. **Permissions temporaires :** Permissions avec expiration
6. **Permissions conditionnelles :** Permissions basées sur des conditions métier
