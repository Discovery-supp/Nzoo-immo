import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, Settings, Clock, Mail } from 'lucide-react';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  deleteNotification,
  PushNotification 
} from '../services/pushNotificationService';

interface NotificationCenterProps {
  language?: 'fr' | 'en';
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  language = 'fr',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const translations = {
    fr: {
      title: 'Notifications',
      noNotifications: 'Aucune notification',
      markAllRead: 'Tout marquer comme lu',
      settings: 'Paramètres',
      loading: 'Chargement...',
      delete: 'Supprimer',
      markRead: 'Marquer comme lu',
      ago: 'il y a',
      minutes: 'minutes',
      hours: 'heures',
      days: 'jours',
      today: 'Aujourd\'hui',
      yesterday: 'Hier'
    },
    en: {
      title: 'Notifications',
      noNotifications: 'No notifications',
      markAllRead: 'Mark all as read',
      settings: 'Settings',
      loading: 'Loading...',
      delete: 'Delete',
      markRead: 'Mark as read',
      ago: 'ago',
      minutes: 'minutes',
      hours: 'hours',
      days: 'days',
      today: 'Today',
      yesterday: 'Yesterday'
    }
  };

  const t = translations[language];

  // Charger les notifications
  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Récupérer l'ID utilisateur depuis Supabase
      const { data: { user } } = await import('../services/supabaseClient').then(m => m.supabase.auth.getUser());
      
      if (user) {
        const userNotifications = await getUserNotifications(user.id);
        setNotifications(userNotifications);
        setUnreadCount(userNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marquer une notification comme lue
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const success = await markNotificationAsRead(notificationId);
      if (success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  // Supprimer une notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const success = await deleteNotification(notificationId);
      if (success) {
        const notification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  };

  // Marquer toutes les notifications comme lues
  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(unreadNotifications.map(n => markNotificationAsRead(n.id)));
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  };

  // Formater la date relative
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t.ago.replace('{time}', '1 ' + t.minutes);
    if (minutes < 60) return t.ago.replace('{time}', `${minutes} ${t.minutes}`);
    if (hours < 24) return t.ago.replace('{time}', `${hours} ${t.hours}`);
    if (days === 1) return t.yesterday;
    if (days < 7) return t.ago.replace('{time}', `${days} ${t.days}`);
    
    return new Date(timestamp).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  // Charger les notifications au montage et quand le centre s'ouvre
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label={t.title}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Centre de notifications */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* Panneau de notifications */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* En-tête */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">{t.title}</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {t.markAllRead}
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Liste des notifications */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    {t.loading}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>{t.noNotifications}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Icône */}
                          <div className="flex-shrink-0">
                            {notification.icon ? (
                              <img 
                                src={notification.icon} 
                                alt="" 
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Mail className="w-4 h-4 text-blue-600" />
                              </div>
                            )}
                          </div>

                          {/* Contenu */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${
                                  !notification.read ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.body}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    {formatRelativeTime(notification.timestamp)}
                                  </span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-1 ml-2">
                                {!notification.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="p-1 hover:bg-green-100 rounded-full transition-colors"
                                    title={t.markRead}
                                  >
                                    <Check className="w-3 h-3 text-green-600" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                  title={t.delete}
                                >
                                  <Trash2 className="w-3 h-3 text-red-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pied de page */}
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Naviguer vers les paramètres de notification
                  }}
                  className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {t.settings}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
