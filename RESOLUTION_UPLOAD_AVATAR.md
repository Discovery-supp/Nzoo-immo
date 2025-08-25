# Résolution du Problème d'Upload d'Avatar

## Problème Identifié

L'erreur lors de l'upload de l'avatar est causée par l'absence du bucket `user-avatars` dans Supabase Storage.

## Diagnostic Effectué

Le script de diagnostic a révélé :
- ✅ Connexion Supabase OK
- ❌ Bucket `user-avatars` inexistant
- ❌ Upload impossible sans bucket configuré

## Solution Complète

### 1. Création du Bucket de Storage

**Étapes à suivre dans Supabase :**

1. **Accéder au projet Supabase**
   - Ouvrir votre projet Supabase
   - Aller dans l'onglet "Storage"

2. **Créer le bucket**
   - Cliquer sur "New bucket"
   - Nom du bucket : `user-avatars`
   - ✅ Cocher "Public bucket" (pour permettre l'accès public aux avatars)
   - Cliquer sur "Create bucket"

3. **Configurer les politiques RLS (Row Level Security)**

   **Politique pour l'upload (INSERT) :**
   - Aller dans Storage > user-avatars > Policies
   - Cliquer sur "New Policy"
   - Nom : "Allow authenticated uploads"
   - Allowed operation : INSERT
   - Target roles : authenticated
   - Using expression : `true`
   - Cliquer sur "Review" puis "Save policy"

   **Politique pour la lecture (SELECT) :**
   - Cliquer sur "New Policy"
   - Nom : "Allow public reads"
   - Allowed operation : SELECT
   - Target roles : public
   - Using expression : `true`
   - Cliquer sur "Review" puis "Save policy"

### 2. Vérification de la Configuration

Après avoir créé le bucket, exécutez le script de vérification :

```bash
node setup_avatar_storage.cjs
```

Ce script vérifiera que :
- ✅ Le bucket existe
- ✅ Les permissions sont correctes
- ✅ L'upload fonctionne
- ✅ Les URLs publiques sont générées

### 3. Améliorations du Code

Le service de profil a été amélioré avec :

**Validation des fichiers :**
```typescript
// Vérification de la taille (max 5MB)
const maxSize = 5 * 1024 * 1024;
if (file.size > maxSize) {
  throw new Error('Le fichier est trop volumineux. Taille maximum : 5MB');
}

// Vérification du type de fichier
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('Type de fichier non supporté. Formats acceptés : JPEG, PNG, GIF, WebP');
}
```

**Messages d'erreur spécifiques :**
```typescript
if (uploadError.message.includes('bucket')) {
  throw new Error('Bucket de storage non trouvé. Veuillez créer le bucket "user-avatars" dans Supabase.');
} else if (uploadError.message.includes('permission')) {
  throw new Error('Permissions insuffisantes. Vérifiez les politiques RLS du bucket.');
}
```

## Instructions Détaillées

### Étape 1 : Création du Bucket

1. **Ouvrir Supabase Dashboard**
   - Aller sur https://supabase.com/dashboard
   - Sélectionner votre projet

2. **Accéder au Storage**
   - Cliquer sur "Storage" dans le menu de gauche
   - Cliquer sur "New bucket"

3. **Configurer le Bucket**
   ```
   Name: user-avatars
   Public bucket: ✓ (checked)
   File size limit: 5MB (optionnel)
   Allowed MIME types: image/* (optionnel)
   ```

4. **Créer le Bucket**
   - Cliquer sur "Create bucket"

### Étape 2 : Configuration des Politiques

1. **Accéder aux Politiques**
   - Dans Storage, cliquer sur "user-avatars"
   - Cliquer sur l'onglet "Policies"

2. **Politique d'Upload**
   ```
   Policy name: Allow authenticated uploads
   Allowed operation: INSERT
   Target roles: authenticated
   Using expression: true
   ```

3. **Politique de Lecture**
   ```
   Policy name: Allow public reads
   Allowed operation: SELECT
   Target roles: public
   Using expression: true
   ```

### Étape 3 : Test de la Configuration

1. **Exécuter le script de test**
   ```bash
   node setup_avatar_storage.cjs
   ```

2. **Vérifier les résultats**
   - Le script doit afficher "✅ Test d'upload réussi"
   - Le script doit afficher "✅ Configuration du storage terminée avec succès"

### Étape 4 : Test dans l'Application

1. **Se connecter en tant que client**
2. **Aller dans le Dashboard**
3. **Cliquer sur l'onglet "Mon Profil"**
4. **Cliquer sur "Modifier Mon Profil"**
5. **Tester l'upload d'une image**
   - Cliquer sur l'icône caméra
   - Sélectionner une image (JPEG, PNG, GIF, WebP)
   - Taille maximum : 5MB
6. **Sauvegarder les modifications**

## Messages d'Erreur Courants et Solutions

### "Bucket de storage non trouvé"
**Solution :** Créer le bucket `user-avatars` dans Supabase Storage

### "Permissions insuffisantes"
**Solution :** Configurer les politiques RLS du bucket

### "Le fichier est trop volumineux"
**Solution :** Réduire la taille de l'image (max 5MB)

### "Type de fichier non supporté"
**Solution :** Utiliser un format supporté (JPEG, PNG, GIF, WebP)

### "Erreur lors de l'upload"
**Solution :** Vérifier la connexion internet et les permissions du bucket

## Fichiers de Diagnostic

1. **`test_avatar_upload_diagnostic.cjs`** - Diagnostic du problème
2. **`setup_avatar_storage.cjs`** - Configuration et test du storage
3. **`src/services/profileService.ts`** - Service amélioré avec gestion d'erreurs

## Vérification Finale

Après avoir suivi toutes les étapes :

1. ✅ Le bucket `user-avatars` existe dans Supabase Storage
2. ✅ Les politiques RLS sont configurées
3. ✅ Le script de test passe avec succès
4. ✅ L'upload d'avatar fonctionne dans l'application
5. ✅ Les avatars s'affichent correctement dans l'onglet "Mon Profil"

## Support

Si le problème persiste après avoir suivi ces instructions :

1. Vérifiez les logs de la console du navigateur
2. Vérifiez les logs de Supabase
3. Exécutez à nouveau le script de diagnostic
4. Contactez le support technique avec les messages d'erreur spécifiques
