import React, { useState, useEffect } from 'react';
import { Bell, Clock, AlertTriangle, CheckCircle, X, Calendar, User } from 'lucide-react';
import { notificationService, Notification } from '../services/notificationService';



interface NotificationBellProps {
  userRole: string;
  userEmail: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userRole, userEmail }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculer le nombre de notifications non lues
  const unreadCount = notifications.filter(n => !n.read).length;

  // Fonction pour charger les notifications
  const loadNotifications = async () => {
    setLoading(true);
    try {
      console.log('🔔 NotificationBell - Chargement des notifications:', { userRole, userEmail });
      const notificationsList = await notificationService.loadNotifications(userRole, userEmail);
      console.log('🔔 NotificationBell - Notifications reçues:', notificationsList.length);
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    const success = await notificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    }
  };

  // Fonction pour marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    const success = await notificationService.markAllAsRead(userRole, userEmail);
    if (success) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    }
  };

  // Fonction pour supprimer une notification
  const removeNotification = async (notificationId: string) => {
    const success = await notificationService.removeNotification(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
    }
  };

  // Charger les notifications au montage et toutes les 5 minutes
  useEffect(() => {
    loadNotifications();
    
    const interval = setInterval(loadNotifications, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [userRole, userEmail]);

  // Fonction pour obtenir l'icône selon le type de notification
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'expiring':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'exception':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Fonction pour obtenir la couleur selon le type de notification
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'pending':
        return 'border-l-blue-500 bg-blue-50';
      case 'expiring':
        return 'border-l-orange-500 bg-orange-50';
      case 'exception':
        return 'border-l-red-500 bg-red-50';
      case 'overdue':
        return 'border-l-red-600 bg-red-100';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-nzoo-dark/70 hover:text-nzoo-dark transition-colors duration-300 bg-nzoo-gray/20 hover:bg-nzoo-gray/40 rounded-xl"
      >
        <Bell className="w-5 h-5" />
        
        {/* Badge de notifications non lues */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown des notifications */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-nzoo border border-nzoo-gray/20 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-nzoo-gray/20">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-nzoo-dark">Notifications</h3>
              {userRole === 'clients' && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  Vos réservations
                </span>
              )}
              {userRole === 'admin' && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                  Toutes les réservations
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-nzoo-dark/60 hover:text-nzoo-dark transition-colors"
                >
                  Tout marquer comme lu
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-nzoo-dark/40 hover:text-nzoo-dark transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-nzoo-dark/60">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-nzoo-dark mx-auto mb-2"></div>
                Chargement...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-nzoo-dark/60">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-nzoo-gray/20">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                      !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className={`text-sm font-semibold ${
                              !notification.read ? 'text-nzoo-dark' : 'text-nzoo-dark/70'
                            }`}>
                              {notification.title}
                            </h4>
                            {notification.priority === 'urgent' && (
                              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                                Urgent
                              </span>
                            )}
                            {notification.priority === 'high' && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                                Important
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-nzoo-dark/60 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-nzoo-dark/40 mt-2">
                            {notification.timestamp.toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-nzoo-dark/40 hover:text-nzoo-dark transition-colors"
                          >
                            Marquer lu
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-nzoo-dark/40 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-nzoo-gray/20 bg-nzoo-gray/10">
              <div className="flex items-center justify-between text-sm text-nzoo-dark/60">
                <span>{notifications.length} notification(s)</span>
                <span>{unreadCount} non lue(s)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay pour fermer le dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
