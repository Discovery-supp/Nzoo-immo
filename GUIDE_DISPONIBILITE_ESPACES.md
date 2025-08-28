# 🎯 Guide de Gestion de Disponibilité des Espaces

## 📋 Vue d'ensemble

Cette fonctionnalité permet aux administrateurs de contrôler la disponibilité des espaces directement depuis l'interface d'administration. Les espaces marqués comme indisponibles ne seront plus affichés dans la page de réservation.

## 🔧 Fonctionnalités

### ✅ Ce qui a été implémenté

1. **Champ de disponibilité dans l'éditeur**
   - Switch ON/OFF dans le formulaire de modification d'espace
   - Indicateur visuel de statut (Disponible/Indisponible)
   - Sauvegarde automatique en base de données

2. **Filtrage automatique**
   - Les espaces indisponibles sont masqués de la page Réservations
   - Logique de fallback : par défaut disponible si non défini

3. **Interface utilisateur**
   - Badge de statut dans l'éditeur de contenu
   - Switch moderne avec animation
   - Messages d'aide contextuels

## 🚀 Comment utiliser

### Pour les Administrateurs

#### 1. Accéder à l'éditeur de contenu
```
Dashboard → Onglet Espaces → Modal Éditeur de contenu
```

#### 2. Modifier un espace
- Cliquer sur le bouton **"Modifier"** pour l'espace souhaité
- Le formulaire d'édition s'ouvre

#### 3. Gérer la disponibilité
- **Section "Disponibilité"** : Switch ON/OFF
- **ON (Disponible)** : L'espace apparaît dans les réservations
- **OFF (Indisponible)** : L'espace est masqué des réservations

#### 4. Sauvegarder
- Cliquer sur **"Sauvegarder"**
- Les modifications sont appliquées immédiatement

### Pour les Clients

#### Page de Réservations
- Seuls les espaces disponibles sont affichés
- Les espaces indisponibles sont automatiquement filtrés
- Aucune action requise côté client

## 🗄️ Structure de la Base de Données

### Table `spaces_content`
```sql
-- Nouvelle colonne ajoutée
ALTER TABLE spaces_content 
ADD COLUMN is_available BOOLEAN DEFAULT true;
```

### Format des Données
```typescript
interface SpaceInfo {
  // ... autres champs
  isAvailable?: boolean; // true = disponible, false = indisponible
}
```

## 🔍 Logique de Disponibilité

### Règles de Filtrage
```typescript
// Un espace est considéré comme disponible si :
space.isAvailable !== false

// Cas de figure :
// - isAvailable: true    → Disponible ✅
// - isAvailable: false   → Indisponible ❌
// - isAvailable: undefined → Disponible ✅ (par défaut)
// - isAvailable: null    → Disponible ✅ (par défaut)
```

### Comportement par Défaut
- **Nouveaux espaces** : Disponibles par défaut
- **Espaces existants** : Disponibles par défaut (migration automatique)
- **Champ manquant** : Traité comme disponible

## 🧪 Tests et Validation

### Script de Test
```bash
node test_disponibilite_espaces.cjs
```

### Tests Automatisés
- ✅ Filtrage des espaces disponibles
- ✅ Logique de disponibilité
- ✅ Validation des données
- ✅ Conversion base de données
- ✅ Interface utilisateur

## 🔄 Migration

### Migration Automatique
La migration `20250120000000_add_is_available_to_spaces_content.sql` :
- Ajoute la colonne `is_available` si elle n'existe pas
- Met à jour les enregistrements existants (disponibles par défaut)
- Ajoute des commentaires explicatifs

### Exécution
```bash
# Via Supabase CLI
supabase db push

# Ou manuellement dans l'éditeur SQL Supabase
```

## 🎨 Interface Utilisateur

### Éditeur de Contenu
- **Badge de statut** : Indicateur visuel (vert/rouge)
- **Switch moderne** : Animation fluide
- **Messages d'aide** : Explications contextuelles

### Page de Réservations
- **Filtrage automatique** : Espaces indisponibles masqués
- **Performance optimisée** : Filtrage côté client
- **Expérience utilisateur** : Aucun changement visible

## 🔧 Configuration Avancée

### Personnalisation des Messages
```typescript
// Dans SpaceContentEditor.tsx
const availabilityMessages = {
  fr: {
    available: 'Disponible',
    unavailable: 'Indisponible',
    help: 'Activez cette option pour rendre l\'espace disponible à la réservation'
  },
  en: {
    available: 'Available',
    unavailable: 'Unavailable',
    help: 'Enable this option to make the space available for booking'
  }
};
```

### Styles CSS
```css
/* Badge de disponibilité */
.availability-badge {
  @apply px-3 py-1 rounded-full text-xs font-semibold;
}

.availability-badge.available {
  @apply bg-green-100 text-green-800;
}

.availability-badge.unavailable {
  @apply bg-red-100 text-red-800;
}
```

## 🚨 Dépannage

### Problèmes Courants

#### 1. L'espace reste visible après désactivation
**Solution** : Vérifier que la sauvegarde s'est bien effectuée
- Recharger la page de réservations
- Vérifier les logs de la console

#### 2. Erreur de sauvegarde
**Solution** : Vérifier la connexion à la base de données
- Vérifier les clés Supabase
- Contrôler les permissions RLS

#### 3. Migration échouée
**Solution** : Exécuter manuellement la migration
```sql
-- Vérifier si la colonne existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'spaces_content' 
AND column_name = 'is_available';

-- Ajouter manuellement si nécessaire
ALTER TABLE spaces_content 
ADD COLUMN is_available BOOLEAN DEFAULT true;
```

## 📈 Évolutions Futures

### Fonctionnalités Potentielles
- [ ] Disponibilité par période (dates spécifiques)
- [ ] Disponibilité par créneaux horaires
- [ ] Notifications automatiques lors des changements
- [ ] Historique des modifications de disponibilité
- [ ] Disponibilité conditionnelle (selon d'autres critères)

### Améliorations Techniques
- [ ] Cache côté serveur pour les performances
- [ ] API REST pour la gestion de disponibilité
- [ ] Webhooks pour les intégrations externes
- [ ] Analytics sur l'utilisation des espaces

## 📞 Support

### En cas de problème
1. Vérifier les logs de la console navigateur
2. Contrôler les logs Supabase
3. Exécuter le script de test
4. Consulter ce guide de dépannage

### Contact
Pour toute question ou problème, consulter la documentation technique ou contacter l'équipe de développement.

---

**Version** : 1.0.0  
**Date** : 2025-01-20  
**Auteur** : Équipe N'zoo Immo
