import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  type: 'pending' | 'expiring' | 'exception' | 'overdue';
  title: string;
  message: string;
  timestamp: Date;
  reservationId?: string;
  userId?: string;
  userEmail?: string; // Ajout de l'email pour vérification de sécurité
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface NotificationStats {
  total: number;
  unread: number;
  pending: number;
  expiring: number;
  exceptions: number;
  overdue: number;
}

class NotificationService {
  // Charger toutes les notifications pour un utilisateur
  async loadNotifications(userRole: string, userEmail: string): Promise<Notification[]> {
    try {
      console.log('🔔 Chargement des notifications pour:', { userRole, userEmail });
      
      // Validation des paramètres d'entrée
      if (!userRole || userRole.trim() === '') {
        console.warn('🔒 ATTENTION: Rôle utilisateur vide ou non défini, utilisation du rôle par défaut "clients"');
        userRole = 'clients';
      }
      
      if (!userEmail || userEmail.trim() === '') {
        console.warn('🔒 ATTENTION: Email utilisateur vide ou non défini');
        return [];
      }
      
      // Vérification de sécurité : les clients ne peuvent voir que leurs propres réservations
      if (userRole === 'clients') {
        if (!userEmail) {
          console.error('🔒 ERREUR: Email requis pour les clients');
          return [];
        }
        
        console.log('🔔 Filtrage strict pour client avec email:', userEmail);
        const { data: reservations, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('email', userEmail) // Filtrage strict par email
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erreur lors du chargement des réservations client:', error);
          return [];
        }

        console.log('🔔 Réservations client trouvées:', reservations?.length || 0);
        return this.processReservationsToNotifications(reservations || [], userRole, userEmail);
      } 
      
      // Pour les admins/users : accès à toutes les réservations
      else if (userRole === 'admin' || userRole === 'user') {
        console.log('🔔 Chargement de toutes les réservations pour admin/user');
        const { data: reservations, error } = await supabase
          .from('reservations')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erreur lors du chargement des réservations admin:', error);
          return [];
        }

        console.log('🔔 Réservations admin trouvées:', reservations?.length || 0);
        return this.processReservationsToNotifications(reservations || [], userRole, userEmail);
      }
      
      // Rôle non reconnu
      else {
        console.error('🔒 ERREUR: Rôle non reconnu:', userRole);
        return [];
      }
    } catch (error) {
      console.error('Erreur dans le service de notifications:', error);
      return [];
    }
  }

  // Traiter les réservations pour générer les notifications
  private processReservationsToNotifications(reservations: any[], userRole?: string, userEmail?: string): Notification[] {
    const currentDate = new Date();
    const notifications: Notification[] = [];

    // Vérification de sécurité supplémentaire pour les clients
    if (userRole === 'clients' && userEmail) {
      // Filtrer une seconde fois pour s'assurer qu'aucune réservation d'un autre client n'est traitée
      reservations = reservations.filter(reservation => reservation.email === userEmail);
      console.log('🔒 Vérification de sécurité: réservations filtrées pour client:', reservations.length);
    }

    reservations.forEach((reservation) => {
      const startDate = new Date(reservation.start_date);
      const endDate = new Date(reservation.end_date);
      const daysUntilExpiry = Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysUntilStart = Math.ceil((startDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      // NOTIFICATIONS POUR LES CLIENTS (seulement leurs propres réservations)
      if (userRole === 'clients') {
        // Vérification de sécurité : s'assurer que la réservation appartient bien au client
        if (reservation.email !== userEmail) {
          console.warn('🔒 TENTATIVE D\'ACCÈS NON AUTORISÉ: Réservation ne correspond pas au client', {
            reservationEmail: reservation.email,
            userEmail: userEmail,
            reservationId: reservation.id
          });
          return; // Ignorer cette réservation
        }

        // Notification de confirmation de réservation
        if (reservation.status === 'confirmed' && daysUntilStart > 0) {
          notifications.push({
            id: `confirmed-${reservation.id}`,
            type: 'pending',
            title: '✅ Réservation confirmée !',
            message: `Votre réservation #${reservation.id} a été confirmée. Début le ${startDate.toLocaleDateString('fr-FR')}`,
            timestamp: new Date(reservation.created_at),
            reservationId: reservation.id,
            userEmail: userEmail, // Ajout de l'email pour traçabilité
            read: false,
            priority: 'medium'
          });
        }

        // Notification de réservation en attente
        if (reservation.status === 'pending') {
          notifications.push({
            id: `pending-${reservation.id}`,
            type: 'pending',
            title: '⏳ Réservation en attente',
            message: `Votre réservation #${reservation.id} est en attente de confirmation`,
            timestamp: new Date(reservation.created_at),
            reservationId: reservation.id,
            userEmail: userEmail,
            read: false,
            priority: 'medium'
          });
        }

        // Notification 3 jours avant le début
        if (daysUntilStart === 3 && reservation.status === 'confirmed') {
          notifications.push({
            id: `starting-soon-${reservation.id}`,
            type: 'expiring',
            title: '🚀 Votre réservation commence bientôt',
            message: `Votre réservation #${reservation.id} commence dans 3 jours (${startDate.toLocaleDateString('fr-FR')})`,
            timestamp: new Date(),
            reservationId: reservation.id,
            userEmail: userEmail,
            read: false,
            priority: 'high'
          });
        }

        // Notification 1 jour avant le début
        if (daysUntilStart === 1 && reservation.status === 'confirmed') {
          notifications.push({
            id: `starting-tomorrow-${reservation.id}`,
            type: 'expiring',
            title: '📅 Votre réservation commence demain',
            message: `Votre réservation #${reservation.id} commence demain (${startDate.toLocaleDateString('fr-FR')})`,
            timestamp: new Date(),
            reservationId: reservation.id,
            userEmail: userEmail,
            read: false,
            priority: 'high'
          });
        }

        // Notification le jour du début
        if (daysUntilStart === 0 && reservation.status === 'confirmed') {
          notifications.push({
            id: `starting-today-${reservation.id}`,
            type: 'exception',
            title: '🎉 Votre réservation commence aujourd\'hui !',
            message: `Votre réservation #${reservation.id} commence aujourd'hui. Bon travail !`,
            timestamp: new Date(),
            reservationId: reservation.id,
            userEmail: userEmail,
            read: false,
            priority: 'urgent'
          });
        }

        // Notification 1 jour avant la fin
        if (daysUntilExpiry === 1 && reservation.status === 'confirmed') {
          notifications.push({
            id: `ending-tomorrow-${reservation.id}`,
            type: 'expiring',
            title: '⚠️ Votre réservation se termine demain',
            message: `Votre réservation #${reservation.id} se termine demain (${endDate.toLocaleDateString('fr-FR')})`,
            timestamp: new Date(),
            reservationId: reservation.id,
            userEmail: userEmail,
            read: false,
            priority: 'high'
          });
        }

        // Notification le jour de la fin
        if (daysUntilExpiry === 0 && reservation.status === 'confirmed') {
          notifications.push({
            id: `ending-today-${reservation.id}`,
            type: 'exception',
            title: '📋 Votre réservation se termine aujourd\'hui',
            message: `Votre réservation #${reservation.id} se termine aujourd'hui. Merci de votre confiance !`,
            timestamp: new Date(),
            reservationId: reservation.id,
            userEmail: userEmail,
            read: false,
            priority: 'urgent'
          });
        }

        // Notification de réservation expirée
        if (daysUntilExpiry < 0 && reservation.status === 'confirmed') {
          notifications.push({
            id: `expired-${reservation.id}`,
            type: 'overdue',
            title: '❌ Réservation expirée',
            message: `Votre réservation #${reservation.id} a expiré depuis ${Math.abs(daysUntilExpiry)} jour(s)`,
            timestamp: new Date(),
            reservationId: reservation.id,
            userEmail: userEmail,
            read: false,
            priority: 'urgent'
          });
        }
      }

      // NOTIFICATIONS POUR LES ADMINISTRATEURS (toutes les réservations)
      if (userRole === 'admin' || userRole === 'user') {
        // Notifications pour les réservations en attente depuis plus de 24h
        const hoursSinceCreation = (currentDate.getTime() - new Date(reservation.created_at).getTime()) / (1000 * 60 * 60);
        if (reservation.status === 'pending' && hoursSinceCreation > 24) {
          notifications.push({
            id: `pending-old-${reservation.id}`,
            type: 'pending',
            title: '⏰ Réservation en attente depuis longtemps',
            message: `Réservation #${reservation.id} de ${reservation.full_name} (${reservation.email}) en attente depuis ${Math.floor(hoursSinceCreation)}h`,
            timestamp: new Date(),
            reservationId: reservation.id,
            userEmail: reservation.email, // Email du client concerné
            read: false,
            priority: 'high'
          });
        }

        // Notifications pour les réservations qui commencent aujourd'hui
        if (daysUntilStart === 0 && reservation.status === 'confirmed') {
          notifications.push({
            id: `starting-${reservation.id}`,
            type: 'pending',
            title: '🚀 Réservation commence aujourd\'hui',
            message: `Réservation #${reservation.id} de ${reservation.full_name} (${reservation.email}) commence aujourd'hui`,
            timestamp: new Date(),
            reservationId: reservation.id,
            userEmail: reservation.email,
            read: false,
            priority: 'medium'
          });
        }

        // Notifications pour les réservations qui se terminent aujourd'hui
        if (daysUntilExpiry === 0 && reservation.status === 'confirmed') {
          notifications.push({
            id: `ending-${reservation.id}`,
            type: 'expiring',
            title: '📋 Réservation se termine aujourd\'hui',
            message: `Réservation #${reservation.id} de ${reservation.full_name} (${reservation.email}) se termine aujourd'hui`,
            timestamp: new Date(),
            reservationId: reservation.id,
            userEmail: reservation.email,
            read: false,
            priority: 'medium'
          });
        }

        // Notifications pour les réservations expirées
        if (daysUntilExpiry < 0 && reservation.status === 'confirmed') {
          notifications.push({
            id: `overdue-admin-${reservation.id}`,
            type: 'overdue',
            title: '❌ Réservation expirée',
            message: `Réservation #${reservation.id} de ${reservation.full_name} (${reservation.email}) a expiré depuis ${Math.abs(daysUntilExpiry)} jour(s)`,
            timestamp: new Date(),
            reservationId: reservation.id,
            userEmail: reservation.email,
            read: false,
            priority: 'urgent'
          });
        }
      }
    });

    // Trier par priorité et date
    return notifications.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  // Obtenir les statistiques des notifications
  async getNotificationStats(userRole: string, userEmail: string): Promise<NotificationStats> {
    // Vérification de sécurité : les clients ne peuvent voir que leurs propres statistiques
    if (userRole === 'clients' && !userEmail) {
      console.error('🔒 ERREUR: Email requis pour les statistiques client');
      return {
        total: 0,
        unread: 0,
        pending: 0,
        expiring: 0,
        exceptions: 0,
        overdue: 0
      };
    }

    const notifications = await this.loadNotifications(userRole, userEmail);
    
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      pending: notifications.filter(n => n.type === 'pending').length,
      expiring: notifications.filter(n => n.type === 'expiring').length,
      exceptions: notifications.filter(n => n.type === 'exception').length,
      overdue: notifications.filter(n => n.type === 'overdue').length
    };
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: string, userRole: string, userEmail: string): Promise<boolean> {
    try {
      // Vérification de sécurité : les clients ne peuvent marquer que leurs propres notifications
      if (userRole === 'clients') {
        // Dans une implémentation complète, on vérifierait que la notification appartient bien au client
        console.log('🔒 Marquage comme lu pour client:', { notificationId, userEmail });
      }
      
      // Dans une implémentation complète, on sauvegarderait cela en base
      // Pour l'instant, on retourne true pour simuler le succès
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      return false;
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(userRole: string, userEmail: string): Promise<boolean> {
    try {
      // Vérification de sécurité : les clients ne peuvent marquer que leurs propres notifications
      if (userRole === 'clients' && !userEmail) {
        console.error('🔒 ERREUR: Email requis pour marquer toutes les notifications comme lues');
        return false;
      }
      
      // Dans une implémentation complète, on sauvegarderait cela en base
      // Pour l'instant, on retourne true pour simuler le succès
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      return false;
    }
  }

  // Supprimer une notification
  async removeNotification(notificationId: string, userRole: string, userEmail: string): Promise<boolean> {
    try {
      // Vérification de sécurité : les clients ne peuvent supprimer que leurs propres notifications
      if (userRole === 'clients') {
        // Dans une implémentation complète, on vérifierait que la notification appartient bien au client
        console.log('🔒 Suppression de notification pour client:', { notificationId, userEmail });
      }
      
      // Dans une implémentation complète, on supprimerait cela de la base
      // Pour l'instant, on retourne true pour simuler le succès
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return false;
    }
  }

  // Créer une notification personnalisée
  async createCustomNotification(
    type: Notification['type'],
    title: string,
    message: string,
    userId: string,
    userEmail: string,
    reservationId?: string,
    priority: Notification['priority'] = 'medium'
  ): Promise<Notification> {
    const notification: Notification = {
      id: `custom-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date(),
      userId,
      userEmail, // Ajout de l'email pour traçabilité
      reservationId,
      read: false,
      priority
    };

    // Dans une implémentation complète, on sauvegarderait cela en base
    return notification;
  }

  // Vérifier les notifications en temps réel
  async checkRealTimeNotifications(userRole: string, userEmail: string): Promise<Notification[]> {
    // Cette fonction pourrait être appelée périodiquement pour vérifier les nouvelles notifications
    return this.loadNotifications(userRole, userEmail);
  }
}

export const notificationService = new NotificationService();
