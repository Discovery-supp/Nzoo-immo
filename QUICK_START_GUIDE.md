# 🚀 Guide de Démarrage Rapide - Système d'Upload d'Images

## ⚡ Démarrage en 3 étapes

### 1. **Configurer la structure des dossiers**
```bash
npm run setup:images
```

### 2. **Démarrer le serveur d'upload**
```bash
# Dans un nouveau terminal
npm run upload:server
```

### 3. **Démarrer l'application**
```bash
# Dans un autre terminal
npm run dev
```

## ✅ Vérification

### **Vérifier que le serveur d'upload fonctionne :**
- Ouvrir : http://localhost:3001
- Vous devriez voir : `{"message":"Serveur d'upload d'images actif"}`

### **Vérifier que l'application fonctionne :**
- Ouvrir : http://localhost:5173
- Aller dans Dashboard Admin → Espaces → Ajouter un espace

## 🖼️ Test d'upload

1. **Dans le modal d'ajout d'espace :**
   - Cliquer sur la zone d'upload d'image
   - Sélectionner une image (PNG, JPG, GIF, WebP, max 5MB)
   - L'image sera automatiquement :
     - ✅ Sauvegardée dans `public/images/spaces/`
     - ✅ Uploadée vers Supabase Storage (backup)
     - ✅ Accessible via `/images/spaces/{filename}`

2. **Vérifier la sauvegarde :**
   ```bash
   # Lister les images uploadées
   ls -la public/images/spaces/
   ```

## 🔧 Configuration Supabase (optionnel)

Si vous voulez le backup cloud :

1. **Créer le bucket "space-images"** :
   - Dashboard Supabase → Storage → New Bucket
   - Nom : `space-images`
   - Public bucket : ✅ Activé

2. **Configurer les permissions** :
   ```sql
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'space-images');
   
   CREATE POLICY "Public Insert" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'space-images');
   ```

## 🎯 Résultat attendu

Après configuration, vous devriez pouvoir :
- ✅ Uploader des images depuis le dashboard admin
- ✅ Voir les images sauvegardées dans `public/images/spaces/`
- ✅ Afficher les images côté espaces avec les mêmes URLs
- ✅ Avoir un système robuste avec backup Supabase

## 🚨 Problèmes courants

### **Erreur "Impossible de se connecter au serveur d'upload"**
- Vérifier que le serveur d'upload est démarré : `npm run upload:server`
- Vérifier le port 3001 n'est pas utilisé par une autre application

### **Erreur "Type de fichier non supporté"**
- Utiliser uniquement : PNG, JPG, JPEG, GIF, WebP
- Vérifier l'extension du fichier

### **Erreur "Fichier trop volumineux"**
- Réduire la taille de l'image (max 5MB)
- Utiliser un format plus compressé

## 📁 Structure finale

```
Nzoo-immo1/
├── public/
│   └── images/
│       └── spaces/          # Images uploadées ici
├── server/
│   ├── upload-server.js     # Serveur d'upload
│   └── package.json         # Dépendances du serveur
└── src/
    ├── components/
    │   └── ImageUpload.tsx  # Composant d'upload
    └── services/
        └── imageUploadService.ts  # Service d'upload
```

## 🎉 C'est tout !

Le système est maintenant opérationnel. Les images seront sauvegardées localement et accessibles immédiatement dans votre application.


