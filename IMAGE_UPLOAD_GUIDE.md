# Guide d'Upload d'Images - Système d'Espaces

## 🎯 Vue d'ensemble

Ce guide explique comment configurer et utiliser le système d'upload d'images pour les espaces dans votre application Nzoo-immo.

## 📁 Structure des dossiers

```
Nzoo-immo1/
├── public/
│   └── images/
│       └── spaces/          # Images des espaces
│           ├── .gitkeep     # Maintient le dossier dans git
│           └── README.md    # Documentation du dossier
├── src/
│   ├── components/
│   │   └── ImageUpload.tsx  # Composant d'upload
│   └── services/
│       └── imageUploadService.ts  # Service d'upload
└── scripts/
    └── setup-image-upload.js  # Script de configuration
```

## 🚀 Configuration initiale

### 1. Créer la structure des dossiers

```bash
npm run setup:images
```

Ce script va :
- Créer le dossier `public/images/spaces/`
- Ajouter un fichier `.gitkeep`
- Créer un fichier `README.md` avec la documentation

### 2. Configurer Supabase Storage

1. **Créer le bucket "space-images"** :
   - Allez dans votre dashboard Supabase
   - Storage → New Bucket
   - Nom : `space-images`
   - Public bucket : ✅ Activé

2. **Configurer les permissions** :
   ```sql
   -- Permettre l'upload public
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'space-images');
   
   -- Permettre l'insertion
   CREATE POLICY "Public Insert" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'space-images');
   ```

3. **Vérifier les variables d'environnement** :
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 📸 Utilisation dans l'application

### 1. Upload depuis le Dashboard Admin

1. **Accéder au modal d'ajout d'espace** :
   - Dashboard Admin → Espaces → Ajouter un espace

2. **Uploader une image** :
   - Cliquez sur la zone d'upload
   - Sélectionnez une image (PNG, JPG, GIF, WebP)
   - L'image sera automatiquement :
     - Uploadée vers Supabase Storage
     - Sauvegardée dans `public/images/spaces/`
     - Accessible via `/images/spaces/{filename}`

3. **URLs générées** :
   ```
   Format: /images/spaces/space-{timestamp}-{randomId}.{extension}
   Exemple: /images/spaces/space-1703123456789-abc123.jpg
   ```

### 2. Utilisation dans les composants

```tsx
import ImageUpload from './components/ImageUpload';

const MyComponent = () => {
  const handleImageUpload = (imageUrl: string) => {
    console.log('Image uploadée:', imageUrl);
    // imageUrl sera au format: /images/spaces/space-123456.jpg
  };

  return (
    <ImageUpload
      onImageUploaded={handleImageUpload}
      currentImageUrl="/images/spaces/existing-image.jpg"
      spaceKey="my-space-key"
    />
  );
};
```

## 🔧 Fonctionnalités

### ✅ Validation des fichiers
- **Types supportés** : PNG, JPG, JPEG, GIF, WebP
- **Taille maximum** : 5MB
- **Validation automatique** avec messages d'erreur

### ✅ Gestion des erreurs
- Messages d'erreur via le système de toast
- Validation côté client et serveur
- Gestion des erreurs de réseau

### ✅ Prévisualisation
- Aperçu immédiat de l'image sélectionnée
- Possibilité de supprimer et changer l'image
- Support des URLs externes

### ✅ Sauvegarde automatique
- Upload vers Supabase Storage (backup)
- Copie locale dans `public/images/spaces/`
- URLs cohérentes dans toute l'application

## 📱 Affichage des images

### 1. Dans les pages d'espaces

```tsx
// Les images sont accessibles directement
<img 
  src="/images/spaces/space-123456.jpg" 
  alt="Espace de travail"
  className="w-full h-48 object-cover rounded-lg"
/>
```

### 2. Récupération depuis la base de données

```tsx
// L'URL est stockée dans la base de données
const space = {
  title: "Bureau Premium",
  imageUrl: "/images/spaces/space-123456.jpg",
  // ... autres propriétés
};

// Affichage
<img src={space.imageUrl} alt={space.title} />
```

## 🛠️ Maintenance

### Nettoyage des images

```bash
# Supprimer les images non utilisées
# Vérifier les références dans la base de données
# Supprimer manuellement les fichiers orphelins
```

### Sauvegarde

```bash
# Sauvegarder le dossier images
tar -czf images-backup.tar.gz public/images/spaces/

# Restaurer
tar -xzf images-backup.tar.gz
```

## 🔍 Debug

### Vérifier l'upload

1. **Console du navigateur** :
   ```javascript
   // Vérifier les logs d'upload
   console.log('Upload en cours...');
   console.log('Image sauvegardée:', imageUrl);
   ```

2. **Vérifier les fichiers** :
   ```bash
   # Lister les images uploadées
   ls -la public/images/spaces/
   ```

3. **Vérifier Supabase** :
   - Dashboard Supabase → Storage → space-images
   - Vérifier que les fichiers sont présents

### Problèmes courants

1. **Erreur de permission** :
   - Vérifier les politiques Supabase
   - Vérifier les variables d'environnement

2. **Fichier trop volumineux** :
   - Réduire la taille de l'image
   - Utiliser un format plus compressé

3. **Type de fichier non supporté** :
   - Convertir en PNG, JPG, GIF ou WebP
   - Vérifier l'extension du fichier

## 📋 Checklist de déploiement

- [ ] Exécuter `npm run setup:images`
- [ ] Configurer le bucket Supabase "space-images"
- [ ] Vérifier les permissions Supabase
- [ ] Tester l'upload depuis le dashboard
- [ ] Vérifier l'affichage des images
- [ ] Tester la récupération côté espaces
- [ ] Vérifier la sauvegarde dans `public/images/spaces/`

## 🎉 Résultat attendu

Après configuration, vous devriez pouvoir :
1. ✅ Uploader des images depuis le dashboard admin
2. ✅ Voir les images sauvegardées dans `public/images/spaces/`
3. ✅ Afficher les images côté espaces avec les mêmes URLs
4. ✅ Avoir un système robuste avec backup Supabase
5. ✅ Bénéficier de messages d'erreur clairs via le système de toast

---

**Note** : Ce système garantit que les images sont toujours accessibles localement tout en ayant un backup dans le cloud via Supabase Storage.


