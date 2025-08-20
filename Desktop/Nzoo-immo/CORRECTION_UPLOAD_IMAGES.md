# 🖼️ Correction : Upload d'Images vers Supabase Storage

## 📋 Problème Identifié

L'upload d'images échoue avec l'erreur "new row violates row-level security policy" car les politiques RLS du stockage Supabase ne sont pas configurées correctement.

## ✅ Solution

### 🔧 Étape 1 : Exécuter la Migration SQL

Exécutez cette migration SQL dans votre **dashboard Supabase** :

```sql
-- Migration pour corriger les politiques RLS du stockage Supabase
-- Cette migration permet la création de buckets et l'upload d'images

-- 1. Créer le bucket space-images s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'space-images',
  'space-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Supprimer les politiques existantes du bucket (si elles existent)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload images" ON storage.objects;

-- 3. Créer une politique permissive pour l'upload d'images
CREATE POLICY "Anyone can upload images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'space-images');

-- 4. Créer une politique pour permettre la lecture publique des images
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'space-images');

-- 5. Créer une politique pour permettre la mise à jour des images
CREATE POLICY "Anyone can update images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'space-images');

-- 6. Créer une politique pour permettre la suppression des images
CREATE POLICY "Anyone can delete images" ON storage.objects
    FOR DELETE USING (bucket_id = 'space-images');

-- 7. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Politiques de stockage corrigées pour le bucket space-images';
    RAISE NOTICE 'L''application peut maintenant uploader des images';
END $$;
```

### 🔧 Comment Exécuter la Migration

1. **Ouvrez votre dashboard Supabase**
2. **Allez dans la section "SQL Editor"**
3. **Copiez-collez le code SQL ci-dessus**
4. **Cliquez sur "Run"**

### 🔧 Étape 2 : Vérifier la Configuration

Après avoir exécuté la migration, testez avec :

```bash
node scripts/init-image-storage.cjs
```

Vous devriez voir :
```
✅ Connexion réussie
✅ Bucket space-images existe déjà
✅ Politiques du bucket vérifiées
🎉 Initialisation terminée avec succès !
```

### 🔧 Étape 3 : Tester l'Upload d'Images

1. **Ouvrez votre application** (http://localhost:5179/)
2. **Allez dans Dashboard → Espaces**
3. **Cliquez sur "Éditer le contenu des espaces"**
4. **Cliquez sur "Modifier" pour un espace**
5. **Cliquez sur "Changer l'image"**
6. **Sélectionnez une image** (JPEG, PNG, WebP, GIF, max 5MB)
7. **L'image sera uploadée** vers Supabase Storage

## 🎯 Résultat Attendu

Après la correction, vous devriez voir dans la console :

```javascript
🔄 Upload en cours... coworking-1701234567890.jpg
✅ Image uploadée avec succès: https://nnkywmfxoohehtyyzzgp.supabase.co/storage/v1/object/public/space-images/coworking-1701234567890.jpg
✅ Données des espaces sauvegardées dans le localStorage
✅ Sauvegarde silencieuse en base de données réussie
```

## 🔍 Diagnostic

Si vous voulez vérifier l'état actuel :

```bash
# Vérifier la connexion et les politiques de stockage
node scripts/init-image-storage.cjs

# Vérifier l'état complet de la base de données
node scripts/check-database-status.cjs
```

## 🚨 Résolution de Problèmes

### ❌ Erreur : "new row violates row-level security policy"

**Solution** : Exécutez la migration SQL ci-dessus

### ❌ Erreur : "bucket not found"

**Solution** : La migration SQL crée automatiquement le bucket

### ❌ Erreur : "permission denied"

**Solution** : Vérifiez que les politiques RLS sont bien appliquées

## 📝 Logs à Surveiller

### ✅ Logs de Succès
```javascript
🔄 Upload en cours... [nom-fichier]
✅ Image uploadée avec succès: [url-supabase]
✅ Données des espaces sauvegardées dans le localStorage
✅ Sauvegarde silencieuse en base de données réussie
```

### ⚠️ Logs d'Erreur
```javascript
❌ Erreur lors de l'upload: [erreur]
🔄 Tentative de création du bucket...
```

## 🎉 Une Fois Corrigé

Votre application pourra :

- ✅ **Uploader des images** directement vers Supabase Storage
- ✅ **Obtenir des URLs publiques** pour les images
- ✅ **Sauvegarder les URLs** en base de données
- ✅ **Afficher les images** depuis le serveur Supabase

L'upload d'images sera alors pleinement opérationnel ! 🚀

