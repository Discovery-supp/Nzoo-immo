# 🏢 Guide d'Utilisation - Gestion des Espaces N'zoo Immo (V2)

## 📋 Vue d'ensemble

Ce système permet de gérer les espaces de coworking avec une logique claire :
1. **Enregistrement** dans le modal de gestion des espaces
2. **Publication** depuis la liste des espaces
3. **Modification** et **suppression** depuis la gestion

## 🎯 Logique de Fonctionnement

### **1. Enregistrement d'un Espace** 📝

**Lieu :** Modal "Ajouter un Espace" dans la gestion

**Champs obligatoires :**
- ✅ **Nom de l'espace**
- ✅ **Description**

**Champs optionnels :**
- 📷 **Photo de l'espace** (chemin vers le dossier public)
- 💰 **Prix** (journalier, mensuel, annuel)
- 👥 **Nombre d'occupants**
- 📊 **Statuts** (actif, publié)

**Processus :**
1. Cliquez sur "Ajouter un Espace"
2. Remplissez les champs obligatoires
3. Optionnellement, saisissez le chemin de l'image
4. Cliquez sur "Enregistrer"
5. L'espace apparaît dans la liste (non publié par défaut)

### **2. Gestion des Images** 📷

**Lors de l'enregistrement :**
- **Image non obligatoire**
- **Saisie manuelle** du chemin : `/images/spaces/nom-image.jpg`
- **Convention** : toutes les images dans `public/images/spaces/`

**Lors de la modification :**
- **Upload d'image** avec prévisualisation
- **Génération automatique** du chemin
- **Saisie manuelle** du chemin possible

**Structure des dossiers :**
```
public/
├── images/
│   └── spaces/
│       ├── espace-1.jpg
│       ├── espace-2.png
│       └── ...
```

### **3. Publication d'Espaces** 🌐

**Lieu :** Liste des espaces dans la gestion

**Processus :**
1. L'espace est d'abord **enregistré** (non publié)
2. Cliquez sur l'icône **œil** pour publier
3. L'espace devient **visible** sur le site public
4. Cliquez sur l'icône **œil barré** pour dépublier

**Règles :**
- ✅ **Espace visible** = `is_active = true` ET `is_published = true`
- ❌ **Espace masqué** = `is_published = false` OU `is_active = false`

## 🎨 Interface Utilisateur

### **Modal d'Ajout d'Espace**

```
┌─────────────────────────────────────────────────────────┐
│ Ajouter un nouvel espace                                │
├─────────────────────────────────────────────────────────┤
│ Informations de base          │ Tarification et Image   │
│ ┌─────────────────────────┐   │ ┌─────────────────────┐ │
│ │ Nom *                   │   │ │ Prix journalier     │ │
│ │ Description *           │   │ │ Prix mensuel        │ │
│ │ Nombre d'occupants      │   │ │ Prix annuel         │ │
│ │ [✓] Espace actif        │   │ │ Photo (optionnel)   │ │
│ │ [ ] Publié sur le site  │   │ │ /images/spaces/...  │ │
│ └─────────────────────────┘   │ └─────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                    [Annuler] [Enregistrer]              │
└─────────────────────────────────────────────────────────┘
```

### **Liste de Gestion des Espaces**

```
┌─────────────────────────────────────────────────────────┐
│ Gestion des Espaces                    [Ajouter Espace] │
├─────────────────────────────────────────────────────────┤
│ [🔍 Recherche] [Type ▼] [Statut ▼] [X espaces trouvés] │
├─────────────────────────────────────────────────────────┤
│ Image │ Nom │ Type │ Prix │ Statut │ [✏️] [👁️] [🗑️] │
│       │     │      │      │        │                    │
│ [img] │Nom  │Type  │$25   │Actif   │ ✏️  │ 👁️  │ 🗑️  │
│       │     │      │      │Non pub │     │     │     │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Configuration

### **Types d'Espaces**

```typescript
type SpaceType = 'coworking' | 'bureau-prive' | 'salle-reunion';
```

### **Statuts par Défaut**

```typescript
interface NewSpace {
  is_active: boolean;    // true par défaut
  is_published: boolean; // false par défaut (à publier manuellement)
}
```

### **Gestion des Images**

```typescript
// Chemin généré automatiquement
const imagePath = `/images/spaces/${fileName}`;

// Exemples de chemins valides
const validPaths = [
  '/images/spaces/espace-coworking.jpg',
  '/images/spaces/bureau-prive.png',
  '/images/spaces/salle-reunion-1.jpg'
];
```

## 📁 Structure des Fichiers

```
src/components/
├── SpaceManagement.tsx      # Interface de gestion principale
├── SimpleSpaceForm.tsx      # Modal d'ajout (chemin manuel)
├── SpaceEditForm.tsx        # Modal de modification (upload + chemin)
├── ImageUpload.tsx          # Composant d'upload d'images
└── PublishedSpaces.tsx      # Affichage public

public/
└── images/
    └── spaces/              # Dossier des images d'espaces
        ├── espace-1.jpg
        ├── espace-2.png
        └── ...

scripts/
└── setup-database.sql       # Script de recréation de la table
```

## 🚀 Utilisation Détaillée

### **Étape 1 : Enregistrement**

1. **Accédez** à la gestion des espaces
2. **Cliquez** sur "Ajouter un Espace"
3. **Remplissez** les champs obligatoires :
   - Nom de l'espace
   - Description
4. **Optionnellement** :
   - Saisissez le chemin de l'image
   - Définissez les prix
   - Ajustez le nombre d'occupants
5. **Cliquez** sur "Enregistrer"
6. L'espace apparaît dans la liste (non publié)

### **Étape 2 : Publication**

1. **Trouvez** l'espace dans la liste
2. **Cliquez** sur l'icône **œil** (👁️)
3. L'espace devient **publié** et visible sur le site public
4. Le statut change de "Non publié" à "Publié"

### **Étape 3 : Modification**

1. **Cliquez** sur l'icône **crayon** (✏️)
2. **Modifiez** les champs souhaités
3. **Pour l'image** :
   - Upload d'une nouvelle image, OU
   - Saisie manuelle du chemin
4. **Cliquez** sur "Mettre à jour"

### **Étape 4 : Suppression**

1. **Cliquez** sur l'icône **poubelle** (🗑️)
2. **Confirmez** la suppression
3. L'espace est supprimé définitivement

## 📊 Workflow Complet

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Enregistrement│    │    Publication  │    │   Modification  │
│                 │    │                 │    │                 │
│ • Nom *         │───▶│ • Cliquer 👁️   │───▶│ • Cliquer ✏️    │
│ • Description * │    │ • Statut publié │    │ • Modifier      │
│ • Image (opt)   │    │ • Visible public│    │ • Upload image  │
│ • Non publié    │    │                 │    │ • Sauvegarder   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Affichage     │    │   Site Public   │    │   Suppression   │
│   dans Liste    │    │                 │    │                 │
│                 │    │ • Espaces visibles│   │ • Cliquer 🗑️   │
│ • Tous espaces  │    │ • Filtrage      │    │ • Confirmation  │
│ • Statuts       │    │ • Réservation   │    │ • Suppression   │
│ • Actions       │    │ • Détails       │    │   définitive    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔍 Dépannage

### **Espace ne s'affiche pas sur le site public**

1. ✅ Vérifiez que `is_active = true`
2. ✅ Vérifiez que `is_published = true`
3. ✅ Vérifiez la connexion à la base de données

### **Image non affichée**

1. ✅ Vérifiez le chemin : `/images/spaces/nom-image.jpg`
2. ✅ Vérifiez que le fichier existe dans `public/images/spaces/`
3. ✅ Vérifiez l'extension du fichier (.jpg, .png, .gif)

### **Erreur lors de l'enregistrement**

1. ✅ Vérifiez que le nom et la description sont remplis
2. ✅ Vérifiez la connexion Supabase
3. ✅ Vérifiez les logs de la console

## 📋 Checklist de Mise en Place

### **Base de Données**
- [ ] Exécuter `scripts/setup-database.sql`
- [ ] Exécuter la migration `is_published`
- [ ] Vérifier la connexion Supabase

### **Dossiers**
- [ ] Créer `public/images/spaces/`
- [ ] Vérifier les permissions d'écriture
- [ ] Ajouter quelques images de test

### **Composants**
- [ ] Intégrer `SpaceManagement` dans l'admin
- [ ] Intégrer `PublishedSpaces` dans le public
- [ ] Tester l'ajout d'espaces
- [ ] Tester la publication
- [ ] Tester la modification

## 🎯 Avantages de cette Approche

### **Pour l'Administrateur**
- ✅ **Enregistrement simple** : seuls nom et description obligatoires
- ✅ **Publication contrôlée** : pas de publication automatique
- ✅ **Gestion flexible** : modification et suppression faciles
- ✅ **Images optionnelles** : pas de blocage si pas d'image

### **Pour le Développeur**
- ✅ **Logique claire** : enregistrement → publication → modification
- ✅ **Chemins standardisés** : `/images/spaces/` pour toutes les images
- ✅ **Interface intuitive** : icônes claires pour chaque action
- ✅ **Validation appropriée** : champs obligatoires vs optionnels

---

**Version** : 2.0.0  
**Dernière mise à jour** : 2025-08-02  
**Auteur** : N'zoo Immo Team  
**Logique** : Enregistrement → Publication → Modification
