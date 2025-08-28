# Système de Toast/Notification Unifié

## Vue d'ensemble

Ce système de toast unifié offre une gestion centralisée et moderne des messages de notification dans votre application. Il remplace tous les anciens systèmes de notification dispersés par une solution cohérente et réutilisable.

## 🚀 Fonctionnalités

### ✨ Caractéristiques principales
- **Design moderne** avec animations fluides (Framer Motion)
- **Support multilingue** (FR/EN)
- **Barre de progression** automatique
- **Actions personnalisables** (boutons d'action)
- **Messages persistants** ou temporaires
- **Gestion de file d'attente** intelligente
- **Positions multiples** (top-right, top-left, bottom-right, etc.)
- **Responsive design** adapté à tous les écrans

### 🎨 Types de messages
- **Success** : Opérations réussies (vert)
- **Error** : Erreurs et problèmes (rouge)
- **Warning** : Avertissements (orange)
- **Info** : Informations générales (bleu)

## 📦 Installation et Configuration

### 1. Intégration dans App.tsx

```tsx
import { ToastProvider } from './components/ToastProvider';

function App() {
  return (
    <ToastProvider position="top-right" maxToasts={5} defaultDuration={5000}>
      {/* Votre application */}
    </ToastProvider>
  );
}
```

### 2. Utilisation dans les composants

```tsx
import { useToastContext } from './components/ToastProvider';
import ToastMessageManager from '../utils/toastMessages';

const MyComponent = () => {
  const { success, error, warning, info, addToast } = useToastContext();

  // Utilisation simple
  success('Opération réussie !');
  error('Une erreur est survenue');
  warning('Attention requise');
  info('Information importante');

  // Utilisation avancée
  addToast('success', 'Message personnalisé', {
    title: 'Titre personnalisé',
    duration: 8000,
    persistent: false,
    action: {
      label: 'Voir détails',
      onClick: () => console.log('Action cliquée')
    }
  });
};
```

## 🛠️ API de référence

### Hook useToastContext

```tsx
const {
  success,        // (message: string, options?: ToastOptions) => string
  error,          // (message: string, options?: ToastOptions) => string
  warning,        // (message: string, options?: ToastOptions) => string
  info,           // (message: string, options?: ToastOptions) => string
  addToast,       // (type, message, options) => string
  removeToast,    // (id: string) => void
  clearToasts,    // () => void
  toasts          // ToastMessage[]
} = useToastContext();
```

### Options de configuration

```tsx
interface ToastOptions {
  title?: string;           // Titre personnalisé
  duration?: number;        // Durée en millisecondes
  persistent?: boolean;     // Message permanent (pas d'auto-fermeture)
  action?: {               // Action personnalisée
    label: string;
    onClick: () => void;
  };
}
```

### Configuration du provider

```tsx
<ToastProvider
  position="top-right"      // Position des toasts
  maxToasts={5}            // Nombre maximum de toasts simultanés
  defaultDuration={5000}   // Durée par défaut en ms
/>
```

## 📝 Gestionnaire de messages

### ToastMessageManager

Le gestionnaire centralise tous les messages de l'application :

```tsx
import ToastMessageManager from '../utils/toastMessages';

// Configurer la langue
ToastMessageManager.setLanguage('FR'); // ou 'EN'

// Messages de succès
const successMsg = ToastMessageManager.getSuccessMessage('RESERVATION_CREATED');

// Messages d'erreur
const errorMsg = ToastMessageManager.getErrorMessage('CONNECTION_ERROR');

// Messages de validation
const validationMsg = ToastMessageManager.getValidationMessage('email', 'invalid');

// Messages de paiement
const paymentMsg = ToastMessageManager.getPaymentMessage('success', 'orange_money');

// Messages de réservation
const reservationMsg = ToastMessageManager.getReservationMessage('created');

// Messages d'authentification
const authMsg = ToastMessageManager.getAuthMessage('login');

// Messages système
const systemMsg = ToastMessageManager.getSystemMessage('maintenance');
```

## 🔄 Migration depuis l'ancien système

### Avant (ancien système)
```tsx
const [notification, setNotification] = useState(null);

const showNotification = (type, message) => {
  setNotification({ type, message });
  setTimeout(() => setNotification(null), 5000);
};

// Dans le JSX
{notification && (
  <div className="fixed top-4 right-4...">
    {/* Ancien code de notification */}
  </div>
)}
```

### Après (nouveau système)
```tsx
const { success, error, warning, info } = useToastContext();

// Utilisation directe
success('Message de succès');
error('Message d\'erreur');

// Plus besoin de JSX pour les notifications !
```

## 🎯 Exemples d'utilisation

### Messages de base
```tsx
// Succès
success('Réservation créée avec succès');

// Erreur
error('Erreur de connexion à la base de données');

// Avertissement
warning('Votre session expire dans 5 minutes');

// Information
info('Nouvelle mise à jour disponible');
```

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

### Messages personnalisés
```tsx
addToast('success', 'Fichier uploadé avec succès', {
  title: 'Upload terminé',
  duration: 3000,
  action: {
    label: 'Voir le fichier',
    onClick: () => openFile()
  }
});
```

### Messages de validation
```tsx
const validationError = ToastMessageManager.getValidationMessage('email', 'invalid');
error(validationError.message, { title: validationError.title });
```

## 🎨 Personnalisation

### Positions disponibles
- `top-right` (par défaut)
- `top-left`
- `top-center`
- `bottom-right`
- `bottom-left`
- `bottom-center`

### Styles personnalisés
Les styles sont définis dans le composant `Toast.tsx` et utilisent Tailwind CSS. Vous pouvez modifier les couleurs, animations et styles selon vos besoins.

### Animations
Les animations utilisent Framer Motion et peuvent être personnalisées dans `Toast.tsx` et `ToastContainer.tsx`.

## 🔧 Maintenance

### Ajout de nouveaux types de messages
1. Ajoutez les constantes dans `src/constants/index.ts`
2. Créez les méthodes correspondantes dans `ToastMessageManager`
3. Utilisez dans vos composants

### Modification des styles
1. Modifiez les classes Tailwind dans `Toast.tsx`
2. Ajustez les animations dans les composants
3. Testez sur différents écrans

## 🚨 Bonnes pratiques

1. **Utilisez les messages prédéfinis** quand possible
2. **Évitez les messages trop longs** (max 2-3 lignes)
3. **Utilisez des actions** pour les messages importants
4. **Testez sur mobile** pour vérifier la lisibilité
5. **Limitez le nombre de toasts** simultanés (max 5 recommandé)

## 📱 Responsive

Le système s'adapte automatiquement aux différentes tailles d'écran :
- **Desktop** : Position normale avec ombres
- **Tablet** : Ajustement des marges
- **Mobile** : Position optimisée, texte adapté

## 🔍 Debug

Pour déboguer les toasts :
```tsx
const { toasts } = useToastContext();
console.log('Toasts actifs:', toasts);
```

## 📚 Ressources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React Icons](https://lucide.dev/)

---

**Note** : Ce système remplace complètement l'ancien système de notification. Tous les composants existants doivent être migrés pour utiliser ce nouveau système unifié.

