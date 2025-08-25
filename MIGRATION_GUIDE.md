# Guide de Migration - Système de Toast Unifié

## 🎯 Objectif

Ce guide vous aide à migrer tous les anciens systèmes de notification vers le nouveau système de toast unifié et moderne.

## 📋 État actuel

### Anciens systèmes identifiés dans le codebase :

1. **UserManagement.tsx** - ✅ **MIGRÉ**
   - Ancien : `showNotification()` avec JSX inline
   - Nouveau : `useToastContext()` avec hooks

2. **ReservationManagement.tsx** - ⏳ **À MIGRER**
   - Ancien : `notification` state avec JSX inline
   - Nouveau : `useToastContext()`

3. **SpaceManagementForm.tsx** - ⏳ **À MIGRER**
   - Ancien : `notification` state avec JSX inline
   - Nouveau : `useToastContext()`

4. **AdminDashboard.tsx** - ⏳ **À MIGRER**
   - Ancien : `notification` state avec JSX inline
   - Nouveau : `useToastContext()`

5. **AddSpaceModal.tsx** - ⏳ **À MIGRER**
   - Ancien : `message` state avec JSX inline
   - Nouveau : `useToastContext()`

6. **DeleteSpaceModal.tsx** - ⏳ **À MIGRER**
   - Ancien : `message` state avec JSX inline
   - Nouveau : `useToastContext()`

7. **ImageUpload.tsx** - ⏳ **À MIGRER**
   - Ancien : `alert()` natif
   - Nouveau : `useToastContext()`

## 🔄 Étapes de migration

### Étape 1 : Importer les dépendances

```tsx
// Ajouter ces imports dans chaque composant
import { useToastContext } from './ToastProvider';
import ToastMessageManager from '../utils/toastMessages';
```

### Étape 2 : Remplacer les états de notification

**AVANT :**
```tsx
const [notification, setNotification] = useState<{
  type: 'success' | 'error' | 'info';
  message: string;
} | null>(null);

const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
  setNotification({ type, message });
  setTimeout(() => setNotification(null), 5000);
};
```

**APRÈS :**
```tsx
const { success, error, warning, info } = useToastContext();

// Configurer la langue si nécessaire
React.useEffect(() => {
  ToastMessageManager.setLanguage(language === 'fr' ? 'FR' : 'EN');
}, [language]);
```

### Étape 3 : Remplacer les appels de notification

**AVANT :**
```tsx
showNotification('success', 'Utilisateur créé avec succès');
showNotification('error', 'Erreur lors de la création');
```

**APRÈS :**
```tsx
success('Utilisateur créé avec succès');
error('Erreur lors de la création');
```

### Étape 4 : Supprimer le JSX de notification

**AVANT :**
```tsx
{notification && (
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-nzoo border-l-4 animate-slideLeft ${
    notification.type === 'success' 
      ? 'bg-green-50 border-green-500 text-green-700' 
      : notification.type === 'error'
      ? 'bg-red-50 border-red-500 text-red-700'
      : 'bg-blue-50 border-blue-500 text-blue-700'
  }`}>
    <div className="flex items-center">
      {notification.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
      {notification.type === 'error' && <XCircle className="w-5 h-5 mr-2" />}
      {notification.type === 'info' && <AlertCircle className="w-5 h-5 mr-2" />}
      <span className="font-medium font-poppins">{notification.message}</span>
      <button
        onClick={() => setNotification(null)}
        className="ml-4 text-nzoo-dark/40 hover:text-nzoo-dark/60"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
)}
```

**APRÈS :**
```tsx
// Plus besoin de JSX ! Le système gère automatiquement l'affichage
```

## 📝 Exemples de migration par composant

### 1. ReservationManagement.tsx

**AVANT :**
```tsx
const [notification, setNotification] = useState<{
  type: 'success' | 'error' | 'info';
  message: string;
} | null>(null);

// Dans les fonctions
setNotification({ type: 'success', message: 'Réservation créée' });

// Dans le JSX
{notification && (
  <div className="fixed top-4 right-4...">
    {/* Ancien code de notification */}
  </div>
)}
```

**APRÈS :**
```tsx
const { success, error, warning, info } = useToastContext();

// Dans les fonctions
success('Réservation créée avec succès');

// Plus de JSX de notification nécessaire !
```

### 2. SpaceManagementForm.tsx

**AVANT :**
```tsx
const [notification, setNotification] = useState<{
  type: 'success' | 'error' | 'info';
  message: string;
} | null>(null);

const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
  setNotification({ type, message });
  setTimeout(() => setNotification(null), 5000);
};
```

**APRÈS :**
```tsx
const { success, error, warning, info } = useToastContext();

// Utilisation directe
success('Espace créé avec succès');
error('Erreur lors de la création de l\'espace');
```

### 3. ImageUpload.tsx

**AVANT :**
```tsx
alert('Veuillez sélectionner un fichier image valide.');
alert('Le fichier est trop volumineux. Taille maximum : 5MB');
alert('Erreur lors de l\'upload de l\'image');
```

**APRÈS :**
```tsx
const { error, warning } = useToastContext();

error('Veuillez sélectionner un fichier image valide.');
warning('Le fichier est trop volumineux. Taille maximum : 5MB');
error('Erreur lors de l\'upload de l\'image');
```

## 🎨 Utilisation avancée

### Messages avec actions
```tsx
addToast('error', 'Erreur de paiement détectée', {
  title: 'Paiement échoué',
  persistent: true,
  action: {
    label: 'Réessayer',
    onClick: () => retryPayment()
  }
});
```

### Messages de validation
```tsx
const validationError = ToastMessageManager.getValidationMessage('email', 'invalid');
error(validationError.message, { title: validationError.title });
```

### Messages de paiement
```tsx
const paymentSuccess = ToastMessageManager.getPaymentMessage('success', 'orange_money');
success(paymentSuccess.message, { title: paymentSuccess.title });
```

## ✅ Checklist de migration

Pour chaque composant à migrer :

- [ ] Ajouter les imports nécessaires
- [ ] Remplacer les états de notification par `useToastContext()`
- [ ] Convertir les appels `showNotification()` vers les hooks appropriés
- [ ] Supprimer le JSX de notification
- [ ] Tester les fonctionnalités
- [ ] Vérifier la cohérence des messages
- [ ] Tester sur mobile et desktop

## 🧪 Tests recommandés

1. **Test de base** : Vérifier que les messages s'affichent correctement
2. **Test de durée** : Vérifier que les messages se ferment automatiquement
3. **Test d'actions** : Vérifier les boutons d'action si présents
4. **Test de file d'attente** : Afficher plusieurs messages rapidement
5. **Test responsive** : Vérifier sur différentes tailles d'écran
6. **Test de langue** : Vérifier le changement de langue

## 🚨 Points d'attention

1. **Cohérence** : Utiliser les mêmes messages partout
2. **Durée** : Adapter la durée selon l'importance du message
3. **Actions** : Ajouter des actions pour les messages importants
4. **Persistance** : Utiliser les messages persistants pour les erreurs critiques
5. **Position** : Vérifier que la position ne gêne pas l'interface

## 📞 Support

Si vous rencontrez des problèmes lors de la migration :

1. Consultez la documentation complète : `TOAST_SYSTEM_README.md`
2. Testez avec le composant de démonstration : `/toast-demo`
3. Vérifiez les exemples dans `ToastExample.tsx`

---

**Objectif** : Migrer tous les composants d'ici la fin de la semaine pour avoir un système de notification unifié et moderne dans toute l'application.


