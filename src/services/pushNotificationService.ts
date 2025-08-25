import { supabase } from './supabaseClient';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp: number;
  read: boolean;
}

export interface NotificationSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  reservation_reminders: boolean;
  reservation_updates: boolean;
  payment_notifications: boolean;
  system_announcements: boolean;
  marketing_notifications: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

// Vérifier si les notifications push sont supportées
export const isPushNotificationSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Demander la permission pour les notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isPushNotificationSupported()) {
    console.warn('Les notifications push ne sont pas supportées');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error);
    return false;
  }
};

// Vérifier le statut de permission
export const getNotificationPermission = (): NotificationPermission => {
  return Notification.permission;
};

// S'abonner aux notifications push
export const subscribeToPushNotifications = async (): Promise<NotificationSubscription | null> => {
  if (!isPushNotificationSupported()) {
    console.warn('Les notifications push ne sont pas supportées');
    return null;
  }

  try {
    // Demander la permission
    const permission = await requestNotificationPermission();
    if (!permission) {
      console.warn('Permission de notification refusée');
      return null;
    }

    // Enregistrer le service worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // S'abonner aux notifications push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY || '')
    });

    // Sauvegarder l'abonnement dans la base de données
    const { data, error } = await supabase
      .from('push_subscriptions')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        endpoint: subscription.endpoint,
        p256dh: btoa(String.fromCharCode.apply(null, 
          new Uint8Array(subscription.getKey('p256dh') as ArrayBuffer)
        )),
        auth: btoa(String.fromCharCode.apply(null, 
          new Uint8Array(subscription.getKey('auth') as ArrayBuffer)
        ))
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la sauvegarde de l\'abonnement:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de l\'abonnement aux notifications:', error);
    return null;
  }
};

// Se désabonner des notifications push
export const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
    }

    // Supprimer l'abonnement de la base de données
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) {
      console.error('Erreur lors de la suppression de l\'abonnement:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors du désabonnement:', error);
    return false;
  }
};

// Envoyer une notification push
export const sendPushNotification = async (
  userId: string,
  notification: Omit<PushNotification, 'id' | 'timestamp' | 'read'>
): Promise<boolean> => {
  try {
    // Récupérer l'abonnement de l'utilisateur
    const { data: subscription, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      console.warn('Aucun abonnement trouvé pour l\'utilisateur:', userId);
      return false;
    }

    // Envoyer la notification via le serveur
    const response = await fetch('/api/push-notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        },
        notification: {
          ...notification,
          timestamp: Date.now(),
          read: false
        }
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi de la notification');
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    return false;
  }
};

// Récupérer les notifications d'un utilisateur
export const getUserNotifications = async (userId: string): Promise<PushNotification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return [];
  }
};

// Marquer une notification comme lue
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors du marquage de la notification:', error);
    return false;
  }
};

// Supprimer une notification
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    return false;
  }
};

// Récupérer les préférences de notification
export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences | null> => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    return null;
  }
};

// Mettre à jour les préférences de notification
export const updateNotificationPreferences = async (
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences
      });

    if (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error);
    return false;
  }
};

// Fonction utilitaire pour convertir la clé VAPID
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Types de notifications prédéfinies
export const NOTIFICATION_TYPES = {
  RESERVATION_REMINDER: 'reservation_reminder',
  RESERVATION_UPDATE: 'reservation_update',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
  MARKETING: 'marketing'
} as const;

// Templates de notifications
export const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_TYPES.RESERVATION_REMINDER]: {
    title: 'Rappel de réservation',
    body: 'Votre réservation commence dans {time}',
    icon: '/icons/calendar-reminder.png',
    tag: 'reservation-reminder'
  },
  [NOTIFICATION_TYPES.RESERVATION_UPDATE]: {
    title: 'Mise à jour de réservation',
    body: 'Votre réservation a été {action}',
    icon: '/icons/calendar-update.png',
    tag: 'reservation-update'
  },
  [NOTIFICATION_TYPES.PAYMENT_SUCCESS]: {
    title: 'Paiement réussi',
    body: 'Votre paiement de {amount} a été traité avec succès',
    icon: '/icons/payment-success.png',
    tag: 'payment-success'
  },
  [NOTIFICATION_TYPES.PAYMENT_FAILED]: {
    title: 'Échec du paiement',
    body: 'Le paiement de {amount} a échoué. Veuillez réessayer.',
    icon: '/icons/payment-failed.png',
    tag: 'payment-failed'
  }
} as const;
