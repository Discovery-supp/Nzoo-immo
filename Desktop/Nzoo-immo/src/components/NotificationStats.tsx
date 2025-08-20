import React, { useState, useEffect } from 'react';
import { Bell, Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { notificationService, NotificationStats as NotificationStatsType } from '../services/notificationService';

interface NotificationStatsProps {
  userRole: string;
  userEmail: string;
}

const NotificationStats: React.FC<NotificationStatsProps> = ({ userRole, userEmail }) => {
  const [stats, setStats] = useState<NotificationStatsType>({
    total: 0,
    unread: 0,
    pending: 0,
    expiring: 0,
    exceptions: 0,
    overdue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const notificationStats = await notificationService.getNotificationStats(userRole, userEmail);
        setStats(notificationStats);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    
    // Recharger les stats toutes les 2 minutes
    const interval = setInterval(loadStats, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [userRole, userEmail]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-6 border border-nzoo-gray/20">
        <div className="animate-pulse">
          <div className="h-4 bg-nzoo-gray/20 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-nzoo-gray/20 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: userRole === 'clients' ? 'Mes notifications' : 'Total',
      value: stats.total,
      icon: Bell,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Non lues',
      value: stats.unread,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: userRole === 'clients' ? 'Mes réservations en attente' : 'En attente',
      value: stats.pending,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: userRole === 'clients' ? 'Mes réservations qui expirent bientôt' : 'Expirent bientôt',
      value: stats.expiring,
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: userRole === 'clients' ? 'Mes réservations qui expirent aujourd\'hui' : 'Expirent aujourd\'hui',
      value: stats.exceptions,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: userRole === 'clients' ? 'Mes réservations en retard' : 'En retard',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 border border-nzoo-gray/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-semibold text-nzoo-dark font-montserrat">
            {userRole === 'clients' ? 'Mes Notifications' : 'Statistiques des Notifications'}
          </h3>
          {userRole === 'clients' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Vos réservations
            </span>
          )}
          {userRole === 'admin' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Toutes les réservations
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 text-nzoo-dark/60">
          <Bell className="w-5 h-5" />
          <span className="text-sm font-medium">Mise à jour automatique</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-xl border ${stat.borderColor} ${stat.bgColor} transition-all duration-300 hover:shadow-medium`}
            >
              <div className="flex items-center justify-between mb-2">
                <IconComponent className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs text-nzoo-dark/60 font-medium">
                  {stat.title}
                </span>
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              
              {/* Indicateur visuel pour les notifications importantes */}
              {stat.value > 0 && (stat.title === 'Non lues' || stat.title === 'Expirent aujourd\'hui' || stat.title === 'En retard') && (
                <div className="mt-2">
                  <div className={`w-full h-1 rounded-full ${stat.bgColor}`}>
                    <div 
                      className={`h-1 rounded-full ${stat.color.replace('text-', 'bg-')}`}
                      style={{ width: `${Math.min((stat.value / Math.max(stats.total, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Résumé */}
      {stats.total > 0 && (
        <div className="mt-6 p-4 bg-nzoo-gray/10 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-nzoo-dark/70">
                <span className="font-semibold">{stats.unread}</span> notification(s) non lue(s) sur {stats.total} total
              </p>
              {stats.exceptions > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ {stats.exceptions} {userRole === 'clients' ? 'de vos réservations' : 'réservation(s)'} expire(nt) aujourd'hui
                </p>
              )}
              {stats.overdue > 0 && (
                <p className="text-sm text-red-700 mt-1">
                  🚨 {stats.overdue} {userRole === 'clients' ? 'de vos réservations' : 'réservation(s)'} en retard
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-nzoo-dark/50">
                Dernière mise à jour
              </p>
              <p className="text-xs text-nzoo-dark/50">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {stats.total === 0 && (
        <div className="mt-6 p-8 text-center text-nzoo-dark/60">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">
            {userRole === 'clients' ? 'Aucune notification pour vos réservations' : 'Aucune notification'}
          </p>
          <p className="text-sm">
            {userRole === 'clients' 
              ? 'Toutes vos réservations sont à jour' 
              : 'Toutes les réservations sont à jour'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationStats;
