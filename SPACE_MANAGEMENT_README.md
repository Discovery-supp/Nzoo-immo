# 🏢 Gestion des Espaces - N'zoo Immo

## 📋 Vue d'ensemble

Ce système permet de gérer les espaces de coworking, bureaux privés et salles de réunion avec un formulaire complet incluant l'upload d'images.

## 🗄️ Structure de la Base de Données

### Table `spaces`

| Colonne | Type | Description | Défaut |
|---------|------|-------------|---------|
| `id` | uuid | Identifiant unique | `gen_random_uuid()` |
| `name` | text | Nom de l'espace | - |
| `type` | text | Type d'espace | `'coworking'` |
| `description` | text | Description détaillée | - |
| `prix_journalier` | numeric | Prix journalier ($) | `0` |
| `prix_mensuel` | numeric | Prix mensuel ($) | `0` |
| `prix_annuel` | numeric | Prix annuel ($) | `0` |
| `nombre_occupants` | integer | Nombre max d'occupants | `1` |
| `photo_espace` | text | URL de la photo principale | `null` |
| `is_active` | boolean | Espace actif | `true` |
| `features` | text[] | Fonctionnalités | `'{}'` |
| `images` | text[] | URLs des images | `'{}'` |
| `availability_status` | text | Statut disponibilité | `'available'` |
| `display_order` | integer | Ordre d'affichage | `0` |
| `admin_notes` | text | Notes administratives | `null` |
| `created_at` | timestamptz | Date création | `now()` |
| `updated_at` | timestamptz | Date modification | `now()` |

## 🚀 Installation et Configuration

### 1. Recréer la Table

Exécutez le script SQL dans votre base de données Supabase :

```sql
-- Copiez le contenu de scripts/setup-database.sql
-- et exécutez-le dans l'éditeur SQL de Supabase
```

### 2. Structure des Dossiers

```
public/
├── images/
│   └── spaces/          # Images des espaces
│       ├── space-123456.jpg
│       ├── space-789012.png
│       └── ...
```

### 3. Composants

- **`SimpleSpaceForm.tsx`** : Formulaire principal d'ajout d'espace
- **`ImageUpload.tsx`** : Composant d'upload d'images
- **`useSpaces.ts`** : Hook pour gérer les espaces

## 📝 Utilisation

### Ajouter un Espace

1. **Cliquez sur "Ajouter un Espace"**
2. **Remplissez les informations :**
   - **Nom** : Nom de l'espace (obligatoire)
   - **Description** : Description détaillée (obligatoire)
   - **Prix** : Journalier, mensuel, annuel
   - **Nombre d'occupants** : Capacité maximale
   - **Photo** : Upload d'image ou URL

3. **Cliquez sur "Enregistrer"**

### Upload d'Images

#### Option 1 : Upload de fichier
- Cliquez sur la zone d'upload
- Sélectionnez une image (PNG, JPG, GIF, max 5MB)
- L'image sera copiée vers `public/images/spaces/`

#### Option 2 : URL manuelle
- Entrez directement l'URL d'une image
- Format : `https://example.com/image.jpg`

## 🎨 Interface Utilisateur

### Formulaire en 2 Colonnes

**Colonne Gauche - Informations de base :**
- Nom de l'espace
- Description
- Nombre d'occupants
- Statut actif

**Colonne Droite - Tarification et Image :**
- Prix (journalier, mensuel, annuel)
- Upload d'image avec prévisualisation

### Fonctionnalités

- ✅ **Validation** : Nom et description obligatoires
- ✅ **Prévisualisation** : Aperçu de l'image avant upload
- ✅ **Responsive** : Interface adaptée mobile/desktop
- ✅ **Feedback** : Messages de succès/erreur
- ✅ **Auto-sauvegarde** : Fermeture automatique après succès

## 🔧 Configuration Avancée

### Types d'Espaces

```typescript
type SpaceType = 'coworking' | 'bureau-prive' | 'salle-reunion';
```

### Statuts de Disponibilité

```typescript
type AvailabilityStatus = 'available' | 'occupied' | 'maintenance';
```

### Fonctionnalités

```typescript
type Features = string[]; // Ex: ['WiFi', 'Imprimante', 'Café']
```

## 📁 Gestion des Images

### Structure des URLs

```
/images/spaces/space-{timestamp}.{extension}
```

### Exemples

- `/images/spaces/space-1733123456789.jpg`
- `/images/spaces/space-1733123456790.png`

### Sécurité

- ✅ **Validation** : Types de fichiers autorisés
- ✅ **Taille** : Maximum 5MB par image
- ✅ **Nom unique** : Timestamp pour éviter les conflits

## 🐛 Dépannage

### Erreur "Column does not exist"

1. Vérifiez que la migration a été exécutée
2. Exécutez le script `setup-database.sql`
3. Vérifiez la connexion Supabase

### Images non affichées

1. Vérifiez que le dossier `public/images/spaces/` existe
2. Vérifiez les permissions de fichiers
3. Vérifiez l'URL dans la base de données

### Formulaire ne s'ouvre pas

1. Vérifiez la console pour les erreurs
2. Vérifiez que tous les composants sont importés
3. Vérifiez la configuration Supabase

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs de la console
2. Vérifiez la configuration Supabase
3. Vérifiez que tous les fichiers sont présents

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2025-08-02  
**Auteur** : N'zoo Immo Team
