# Guide des Notifications Push et Intégration Calendrier

Ce guide explique l'implémentation des notifications push mobiles et de l'intégration des calendriers externes (Google, Outlook, iCal) pour votre application Nzoo Immo.

## 📱 Notifications Push Mobiles

### 🎯 Fonctionnalités Implémentées

#### **Service Worker (`public/sw.js`)**
- ✅ Gestion des notifications push
- ✅ Cache des ressources statiques
- ✅ Synchronisation en arrière-plan
- ✅ Gestion des clics sur notifications
- ✅ Support hors ligne

#### **Service de Notifications (`src/services/pushNotificationService.ts`)**
- ✅ Abonnement/désabonnement aux notifications
- ✅ Gestion des permissions
- ✅ Envoi de notifications
- ✅ Gestion des préférences utilisateur
- ✅ Templates de notifications prédéfinis

#### **Centre de Notifications (`src/components/NotificationCenter.tsx`)**
- ✅ Interface utilisateur moderne
- ✅ Compteur de notifications non lues
- ✅ Actions rapides (marquer comme lu, supprimer)
- ✅ Animations fluides
- ✅ Support multilingue

### 🔧 Configuration Requise

#### **Variables d'Environnement**
```env
# Clés VAPID pour les notifications push
VITE_VAPID_PUBLIC_KEY=votre_cle_publique_vapid
VITE_VAPID_PRIVATE_KEY=votre_cle_privee_vapid

# Configuration Supabase
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme_supabase
```

#### **Tables Supabase**
```sql
-- Table des abonnements push
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des notifications
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  icon TEXT,
  badge TEXT,
  tag TEXT,
  require_interaction BOOLEAN DEFAULT FALSE,
  silent BOOLEAN DEFAULT FALSE,
  timestamp BIGINT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des préférences de notification
CREATE TABLE notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reservation_reminders BOOLEAN DEFAULT TRUE,
  reservation_updates BOOLEAN DEFAULT TRUE,
  payment_notifications BOOLEAN DEFAULT TRUE,
  system_announcements BOOLEAN DEFAULT TRUE,
  marketing_notifications BOOLEAN DEFAULT FALSE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 🚀 Utilisation

#### **Abonnement aux Notifications**
```typescript
import { subscribeToPushNotifications } from '../services/pushNotificationService';

// Demander l'abonnement
const subscription = await subscribeToPushNotifications();
if (subscription) {
  console.log('Abonnement réussi');
}
```

#### **Envoi de Notification**
```typescript
import { sendPushNotification } from '../services/pushNotificationService';

// Envoyer une notification
await sendPushNotification(userId, {
  title: 'Nouvelle réservation',
  body: 'Votre réservation a été confirmée',
  icon: '/icons/reservation.png',
  data: { reservationId: '123' }
});
```

#### **Intégration dans le Header**
```typescript
import NotificationCenter from '../components/NotificationCenter';

// Dans votre composant Header
<NotificationCenter language="fr" />
```

## 📅 Intégration Calendrier

### 🎯 Fonctionnalités Implémentées

#### **Service d'Intégration (`src/services/calendarIntegrationService.ts`)**
- ✅ Authentification Google Calendar
- ✅ Authentification Outlook Calendar
- ✅ Support des calendriers iCal
- ✅ Synchronisation bidirectionnelle
- ✅ Gestion des événements

#### **Interface d'Intégration (`src/components/CalendarIntegration.tsx`)**
- ✅ Interface moderne et intuitive
- ✅ Gestion des connexions multiples
- ✅ Synchronisation manuelle
- ✅ Statuts en temps réel
- ✅ Support multilingue

### 🔧 Configuration Requise

#### **Variables d'Environnement**
```env
# Google Calendar API
VITE_GOOGLE_CLIENT_ID=votre_client_id_google
VITE_GOOGLE_CLIENT_SECRET=votre_client_secret_google

# Microsoft Graph API
VITE_MICROSOFT_CLIENT_ID=votre_client_id_microsoft
VITE_MICROSOFT_CLIENT_SECRET=votre_client_secret_microsoft
```

#### **Tables Supabase**
```sql
-- Table des intégrations de calendrier
CREATE TABLE calendar_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('google', 'outlook', 'ical')),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#4285F4',
  enabled BOOLEAN DEFAULT TRUE,
  sync_direction TEXT DEFAULT 'one_way' CHECK (sync_direction IN ('one_way', 'two_way')),
  last_sync TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des événements de calendrier
CREATE TABLE calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  all_day BOOLEAN DEFAULT FALSE,
  recurrence TEXT,
  attendees JSONB,
  organizer TEXT,
  calendar_id UUID REFERENCES calendar_integrations(id) ON DELETE CASCADE,
  external_id TEXT,
  source TEXT NOT NULL CHECK (source IN ('google', 'outlook', 'ical', 'internal')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 🚀 Utilisation

#### **Connexion Google Calendar**
```typescript
import { authenticateGoogleCalendar } from '../services/calendarIntegrationService';

// Connecter Google Calendar
const success = await authenticateGoogleCalendar();
if (success) {
  console.log('Google Calendar connecté');
}
```

#### **Ajout d'un Calendrier iCal**
```typescript
import { addICalCalendar } from '../services/calendarIntegrationService';

// Ajouter un calendrier iCal
const success = await addICalCalendar(
  'https://example.com/calendar.ics',
  'Mon Calendrier'
);
```

#### **Synchronisation**
```typescript
import { syncCalendarEvents } from '../services/calendarIntegrationService';

// Synchroniser les événements
const result = await syncCalendarEvents(integrationId, startDate, endDate);
console.log(`${result.events_added} événements ajoutés`);
```

#### **Intégration dans l'Interface**
```typescript
import CalendarIntegration from '../components/CalendarIntegration';

// Dans votre page de paramètres
<CalendarIntegration language="fr" />
```

## 🔐 Configuration des APIs

### **Google Calendar API**

1. **Créer un projet Google Cloud**
   - Allez sur [Google Cloud Console](https://console.cloud.google.com/)
   - Créez un nouveau projet
   - Activez l'API Google Calendar

2. **Créer des identifiants OAuth 2.0**
   - Allez dans "APIs & Services" > "Credentials"
   - Cliquez sur "Create Credentials" > "OAuth 2.0 Client IDs"
   - Configurez les URLs de redirection autorisées

3. **Configurer les scopes**
   - `https://www.googleapis.com/auth/calendar` (lecture/écriture)
   - `https://www.googleapis.com/auth/calendar.events` (événements)

### **Microsoft Graph API**

1. **Créer une application Azure**
   - Allez sur [Azure Portal](https://portal.azure.com/)
   - Créez une nouvelle application d'entreprise
   - Configurez les redirections URI

2. **Configurer les permissions**
   - `Calendars.ReadWrite` (lecture/écriture des calendriers)
   - `Calendars.ReadWrite.Shared` (calendriers partagés)

3. **Obtenir les clés d'API**
   - Récupérez le Client ID et Client Secret
   - Configurez les variables d'environnement

## 📱 Notifications Push - Configuration Serveur

### **Génération des Clés VAPID**

```bash
# Installer web-push
npm install web-push

# Générer les clés
npx web-push generate-vapid-keys
```

### **API Endpoint pour l'Envoi**

```javascript
// Exemple d'endpoint serveur (Node.js/Express)
app.post('/api/push-notifications/send', async (req, res) => {
  const { subscription, notification } = req.body;
  
  try {
    const payload = JSON.stringify(notification);
    const options = {
      vapidDetails: {
        subject: 'mailto:your-email@example.com',
        publicKey: process.env.VAPID_PUBLIC_KEY,
        privateKey: process.env.VAPID_PRIVATE_KEY
      },
      TTL: 60
    };
    
    await webpush.sendNotification(subscription, payload, options);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🎨 Personnalisation

### **Styles des Notifications**

```css
/* Personnalisation des notifications push */
.notification-custom {
  --notification-bg: #ffffff;
  --notification-border: #e5e7eb;
  --notification-text: #374151;
  --notification-accent: #3b82f6;
}
```

### **Templates de Notifications**

```typescript
// Templates prédéfinis
const NOTIFICATION_TEMPLATES = {
  RESERVATION_REMINDER: {
    title: 'Rappel de réservation',
    body: 'Votre réservation commence dans {time}',
    icon: '/icons/calendar-reminder.png'
  },
  PAYMENT_SUCCESS: {
    title: 'Paiement réussi',
    body: 'Votre paiement de {amount} a été traité',
    icon: '/icons/payment-success.png'
  }
};
```

## 🔄 Synchronisation Automatique

### **Synchronisation Périodique**

```typescript
// Synchronisation automatique toutes les heures
setInterval(async () => {
  const integrations = await getUserCalendarIntegrations(userId);
  
  for (const integration of integrations) {
    if (integration.enabled) {
      await syncCalendarEvents(integration.id, startDate, endDate);
    }
  }
}, 3600000); // 1 heure
```

### **Synchronisation en Temps Réel**

```typescript
// Écouter les changements de réservation
const handleReservationChange = async (reservation) => {
  // Créer l'événement dans les calendriers externes
  const integrations = await getUserCalendarIntegrations(userId);
  
  for (const integration of integrations) {
    if (integration.sync_direction === 'two_way') {
      await createExternalEvent(integration.id, {
        title: `Réservation - ${reservation.space_name}`,
        start: reservation.start_date,
        end: reservation.end_date,
        location: reservation.location
      });
    }
  }
};
```

## 🐛 Dépannage

### **Problèmes Courants**

#### **Notifications Push**
1. **"Permission denied"** : Vérifiez les paramètres du navigateur
2. **"Service Worker not found"** : Vérifiez que `/sw.js` est accessible
3. **"VAPID keys invalid"** : Vérifiez vos clés VAPID

#### **Intégration Calendrier**
1. **"Invalid redirect URI"** : Vérifiez les URLs de redirection
2. **"Scope not authorized"** : Vérifiez les permissions OAuth
3. **"Token expired"** : Implémentez le refresh token

### **Logs de Débogage**

```typescript
// Activer les logs détaillés
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Notification subscription:', subscription);
  console.log('Calendar sync result:', result);
}
```

## 📚 Ressources

- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [Google Calendar API](https://developers.google.com/calendar)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/)
- [iCal Specification](https://tools.ietf.org/html/rfc5545)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## ✅ Checklist de Déploiement

- [x] Service Worker configuré
- [x] Clés VAPID générées
- [x] Tables Supabase créées
- [x] APIs Google/Microsoft configurées
- [x] Variables d'environnement définies
- [x] Endpoints serveur implémentés
- [x] Tests de notifications effectués
- [x] Synchronisation calendrier testée
- [x] Documentation utilisateur créée

## 🚀 Avantages

1. **Engagement Utilisateur** : Notifications push pour maintenir l'engagement
2. **Productivité** : Synchronisation automatique des calendriers
3. **Expérience Unifiée** : Intégration transparente avec les outils existants
4. **Fiabilité** : Service Worker pour le support hors ligne
5. **Flexibilité** : Support de multiples fournisseurs de calendrier
6. **Performance** : Cache intelligent et synchronisation optimisée
