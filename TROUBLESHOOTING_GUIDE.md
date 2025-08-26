# 🔧 Guide de Dépannage - Système d'Upload d'Images

## ✅ État actuel du système

**Le système d'upload fonctionne parfaitement !** ✅
- ✅ Serveur d'upload actif sur le port 3001
- ✅ Upload d'images fonctionnel
- ✅ Sauvegarde dans `public/images/spaces/` opérationnelle
- ✅ API de liste des images fonctionnelle

## 🚀 Comment utiliser le système

### **1. Démarrer l'application**
```bash
# Terminal 1: Serveur d'upload (déjà démarré)
# Le serveur est actif sur http://localhost:3001

# Terminal 2: Application principale
npm run dev
```

### **2. Accéder à l'application**
- Ouvrir votre navigateur
- Aller sur : http://localhost:5173
- Si l'application ne se charge pas, voir la section "Problèmes courants"

### **3. Tester l'upload**
1. Aller dans **Dashboard Admin** → **Espaces** → **Ajouter un espace**
2. Cliquer sur la zone d'upload d'image
3. Sélectionner une image (PNG, JPG, GIF, WebP, max 5MB)
4. L'image sera automatiquement sauvegardée dans `public/images/spaces/`

## 🚨 Problèmes courants et solutions

### **Problème 1: L'application ne se charge pas (http://localhost:5173)**

**Symptômes :**
- Page blanche ou erreur de connexion
- Message "This site can't be reached"

**Solutions :**
```bash
# 1. Vérifier que l'application est démarrée
npm run dev

# 2. Vérifier le port 5173 n'est pas utilisé
netstat -ano | findstr :5173

# 3. Redémarrer l'application
# Ctrl+C pour arrêter, puis npm run dev
```

### **Problème 2: Erreur "Impossible de se connecter au serveur d'upload"**

**Symptômes :**
- Message d'erreur lors de l'upload
- "Impossible de se connecter au serveur d'upload"

**Solutions :**
```bash
# 1. Vérifier que le serveur d'upload est démarré
npm run upload:server

# 2. Tester le serveur
curl http://localhost:3001

# 3. Vérifier le port 3001 n'est pas utilisé
netstat -ano | findstr :3001
```

### **Problème 3: Images non sauvegardées dans public/images/spaces/**

**Symptômes :**
- Upload réussi mais fichier non trouvé dans le dossier

**Solutions :**
```bash
# 1. Vérifier que le dossier existe
ls -la public/images/spaces/

# 2. Recréer la structure si nécessaire
npm run setup:images

# 3. Vérifier les permissions du dossier
```

### **Problème 4: Erreur "Type de fichier non supporté"**

**Symptômes :**
- Message d'erreur lors de l'upload
- Fichier rejeté

**Solutions :**
- Utiliser uniquement : PNG, JPG, JPEG, GIF, WebP
- Vérifier l'extension du fichier
- Réduire la taille si > 5MB

### **Problème 5: Erreur "Fichier trop volumineux"**

**Symptômes :**
- Message d'erreur lors de l'upload
- Fichier rejeté

**Solutions :**
- Réduire la taille de l'image (max 5MB)
- Utiliser un format plus compressé (WebP, JPEG)
- Redimensionner l'image

## 🧪 Tests de diagnostic

### **Test 1: Vérifier le système complet**
```bash
npm run test:upload
```

### **Test 2: Test d'upload réel**
```bash
npm run test:upload-simple
```

### **Test 3: Vérifier les services**
```bash
# Test du serveur d'upload
curl http://localhost:3001

# Test de l'application
curl http://localhost:5173
```

## 📋 Checklist de vérification

### **Avant de commencer :**
- [ ] Serveur d'upload démarré sur le port 3001
- [ ] Application démarrée sur le port 5173
- [ ] Dossier `public/images/spaces/` créé
- [ ] Aucune erreur dans les terminaux

### **Pendant l'upload :**
- [ ] Image sélectionnée (PNG, JPG, GIF, WebP)
- [ ] Taille < 5MB
- [ ] Message de succès affiché
- [ ] Fichier créé dans `public/images/spaces/`

### **Après l'upload :**
- [ ] Image visible dans l'aperçu
- [ ] Fichier accessible via l'URL générée
- [ ] Image s'affiche côté espaces

## 🔍 Debug avancé

### **Vérifier les logs du serveur d'upload :**
```bash
# Dans le terminal du serveur d'upload
# Vous devriez voir :
# ✅ Fichier uploadé: space-1234567890-abc123.png
# 📁 Chemin: /images/spaces/space-1234567890-abc123.png
```

### **Vérifier les logs de l'application :**
```bash
# Dans le terminal de l'application
# Vous devriez voir :
# Local: http://localhost:5173/
# Network: use --host to expose
```

### **Vérifier les fichiers créés :**
```bash
# Lister les images uploadées
ls -la public/images/spaces/

# Vérifier une image spécifique
curl http://localhost:3001/images/spaces/space-1234567890-abc123.png
```

## 🎯 Résolution rapide

Si rien ne fonctionne, suivez ces étapes dans l'ordre :

1. **Arrêter tous les processus :**
   ```bash
   # Ctrl+C dans tous les terminaux
   ```

2. **Redémarrer le serveur d'upload :**
   ```bash
   npm run upload:server
   ```

3. **Redémarrer l'application :**
   ```bash
   npm run dev
   ```

4. **Tester le système :**
   ```bash
   npm run test:upload-simple
   ```

5. **Accéder à l'application :**
   - Ouvrir http://localhost:5173
   - Aller dans Dashboard Admin → Espaces → Ajouter un espace
   - Tester l'upload d'une image

## 📞 Support

Si le problème persiste :

1. **Vérifier les logs d'erreur** dans les terminaux
2. **Exécuter les tests de diagnostic** ci-dessus
3. **Vérifier la configuration** selon ce guide
4. **Redémarrer complètement** le système

---

**💡 Le système est fonctionnel !** Suivez ce guide pour résoudre les problèmes de configuration ou de démarrage.


