# 🏢 Guide d'Utilisation - Gestion des Espaces N'zoo Immo

## 📋 Vue d'ensemble

Ce système complet permet de gérer les espaces de coworking avec les fonctionnalités suivantes :
- ✅ **Ajout d'espaces** avec formulaire complet
- ✅ **Visualisation** de tous les espaces
- ✅ **Modification** des espaces existants
- ✅ **Suppression** d'espaces
- ✅ **Publication/Dépublier** des espaces
- ✅ **Affichage public** des espaces publiés

## 🚀 Installation

### 1. Mise à jour de la Base de Données

Exécutez le script SQL dans votre base de données Supabase :

```sql
-- Copiez le contenu de scripts/setup-database.sql
-- et exécutez-le dans l'éditeur SQL de Supabase
```

### 2. Ajout de la Colonne is_published

Exécutez également la migration pour ajouter la colonne de publication :

```sql
-- Migration pour ajouter is_published
ALTER TABLE spaces 
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

UPDATE spaces 
SET is_published = true 
WHERE is_published IS NULL;
```

## 🎯 Fonctionnalités

### 📝 **1. Ajout d'un Espace**

**Accès :** Bouton "Ajouter un Espace" dans la gestion

**Champs requis :**
- **Nom de l'espace** (obligatoire)
- **Description** (obligatoire)
- **Type** : Coworking, Bureau Privé, Salle de Réunion
- **Prix** : Journalier, mensuel, annuel
- **Nombre d'occupants**
- **Photo** : Upload ou URL
- **Statuts** : Actif et Publié

**Processus :**
1. Cliquez sur "Ajouter un Espace"
2. Remplissez le formulaire
3. Cliquez sur "Enregistrer"
4. L'espace apparaît dans la liste

### 👁️ **2. Visualisation des Espaces**

**Interface de gestion :**
- **Tableau complet** avec tous les espaces
- **Recherche** par nom ou description
- **Filtres** par type et statut
- **Statistiques** en temps réel

**Colonnes affichées :**
- Image de l'espace
- Nom et description
- Type d'espace
- Prix (journalier/mensuel)
- Statuts (Actif/Inactif, Publié/Non publié)
- Actions (Modifier, Publier, Supprimer)

### ✏️ **3. Modification d'un Espace**

**Accès :** Bouton "Modifier" (icône crayon) dans la liste

**Fonctionnalités :**
- Modification de tous les champs
- Upload de nouvelle image
- Changement des statuts
- Sauvegarde automatique

**Processus :**
1. Cliquez sur l'icône "Modifier"
2. Modifiez les champs souhaités
3. Cliquez sur "Mettre à jour"
4. Les changements sont appliqués

### 🗑️ **4. Suppression d'un Espace**

**Accès :** Bouton "Supprimer" (icône poubelle) dans la liste

**Sécurité :**
- Confirmation obligatoire
- Suppression définitive
- Pas de récupération possible

**Processus :**
1. Cliquez sur l'icône "Supprimer"
2. Confirmez la suppression
3. L'espace est supprimé définitivement

### 🌐 **5. Publication d'Espaces**

**Accès :** Bouton "Publier/Dépublier" (icône œil) dans la liste

**Fonctionnalités :**
- **Publication** : L'espace apparaît sur le site public
- **Dépublier** : L'espace est masqué du site public
- **Statut visuel** : Indicateur de publication

**Règles :**
- Seuls les espaces **actifs ET publiés** apparaissent sur le site public
- Les espaces inactifs ne peuvent pas être publiés
- La publication est instantanée

### 🏠 **6. Affichage Public**

**Page publique :** Composant `PublishedSpaces`

**Fonctionnalités :**
- **Filtrage** par type d'espace
- **Cartes visuelles** avec images
- **Informations complètes** : prix, capacité, description
- **Bouton de réservation** (à connecter)
- **Statistiques** en temps réel

**Affichage :**
- Seuls les espaces `is_active = true` ET `is_published = true`
- Tri par date de création (plus récents en premier)
- Interface responsive (mobile/desktop)

## 🎨 Interface Utilisateur

### **Gestion des Espaces**

```
┌─────────────────────────────────────────────────────────┐
│ Gestion des Espaces                    [Ajouter Espace] │
├─────────────────────────────────────────────────────────┤
│ [🔍 Recherche] [Type ▼] [Statut ▼] [X espaces trouvés] │
├─────────────────────────────────────────────────────────┤
│ Image │ Nom │ Type │ Prix │ Statut │ [✏️] [👁️] [🗑️] │
│       │     │      │      │        │                    │
└─────────────────────────────────────────────────────────┘
```

### **Page Publique**

```
┌─────────────────────────────────────────────────────────┐
│                    Nos Espaces                          │
│ [Tous] [Coworking] [Bureaux Privés] [Salles Réunion]   │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │ [Image]     │ │ [Image]     │ │ [Image]     │        │
│ │ Nom         │ │ Nom         │ │ Nom         │        │
│ │ Description │ │ Description │ │ Description │        │
│ │ Prix        │ │ Prix        │ │ Prix        │        │
│ │ [Réserver]  │ │ [Réserver]  │ │ [Réserver]  │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Configuration

### **Types d'Espaces**

```typescript
type SpaceType = 'coworking' | 'bureau-prive' | 'salle-reunion';
```

### **Statuts**

```typescript
interface Space {
  is_active: boolean;    // Espace actif dans le système
  is_published: boolean; // Visible sur le site public
}
```

### **Règles de Publication**

1. **Espace visible sur le site public** = `is_active = true` ET `is_published = true`
2. **Espace masqué** = `is_published = false` OU `is_active = false`
3. **Publication impossible** si `is_active = false`

## 📁 Structure des Fichiers

```
src/components/
├── SpaceManagement.tsx      # Interface de gestion complète
├── SimpleSpaceForm.tsx      # Formulaire d'ajout d'espace
├── SpaceEditForm.tsx        # Formulaire de modification
├── ImageUpload.tsx          # Upload d'images
└── PublishedSpaces.tsx      # Affichage public

scripts/
└── setup-database.sql       # Script de recréation de la table

supabase/migrations/
├── 20250802170000_recreate_spaces_table.sql
└── 20250802180000_add_is_published.sql
```

## 🚀 Utilisation

### **Pour les Administrateurs**

1. **Accédez à la gestion** via le menu admin
2. **Ajoutez des espaces** avec le formulaire complet
3. **Gérez les espaces** : modifiez, supprimez, publiez
4. **Surveillez les statuts** : actif/inactif, publié/non publié

### **Pour les Visiteurs**

1. **Accédez à la page publique** des espaces
2. **Filtrez par type** d'espace
3. **Consultez les détails** : prix, capacité, photos
4. **Réservez** (fonctionnalité à connecter)

## 🔍 Dépannage

### **Espace ne s'affiche pas sur le site public**

1. Vérifiez que `is_active = true`
2. Vérifiez que `is_published = true`
3. Vérifiez la connexion à la base de données

### **Erreur lors de l'ajout/modification**

1. Vérifiez que tous les champs obligatoires sont remplis
2. Vérifiez la connexion Supabase
3. Vérifiez les logs de la console

### **Images non affichées**

1. Vérifiez l'URL de l'image
2. Vérifiez que le fichier existe
3. Vérifiez les permissions d'accès

## 📊 Statistiques

Le système fournit des statistiques en temps réel :
- **Nombre total** d'espaces
- **Espaces par type** (coworking, bureaux, salles)
- **Espaces publiés** vs non publiés
- **Espaces actifs** vs inactifs

## 🔮 Évolutions Futures

### **Fonctionnalités à ajouter :**
- [ ] Système de réservation
- [ ] Calendrier de disponibilité
- [ ] Gestion des paiements
- [ ] Notifications par email
- [ ] Système de commentaires/avis
- [ ] Galerie d'images multiples
- [ ] Géolocalisation des espaces

### **Améliorations techniques :**
- [ ] Cache des images
- [ ] Optimisation des performances
- [ ] Système de backup automatique
- [ ] Logs d'activité détaillés

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2025-08-02  
**Auteur** : N'zoo Immo Team  
**Support** : Consultez les logs et la documentation Supabase
