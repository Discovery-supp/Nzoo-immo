// --- Audit Log ---
import AdminAuditLog from '../components/AdminAuditLog';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Users, 
  Building, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Mail,
  Phone,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  Bell,
  Settings,
  PieChart,
  Activity,
  RefreshCw,
  BarChart3 as BarChartIcon,
  FileText,
  User,
  Camera,
  Save,
  EyeOff,
  Shield,
  Crown,
  X,
  Info,
  Brain
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useReservations } from '../hooks/useReservations';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import SpaceManagementForm from '../components/SpaceManagementForm';
import ReservationManagement from '../components/ReservationManagement';
import UserManagement from '../components/UserManagement';
import RevenueModal from '../components/RevenueModal';
import PermissionGuard from '../components/PermissionGuard';
import NotificationStats from '../components/NotificationStats';
import AIFollowUpManager from '../components/AIFollowUpManager';

import { generateAndDownloadInvoice } from '../services/invoiceService';
import { profileService } from '../services/profileService';
import { supabase } from '../lib/supabase';

interface AdminDashboardProps {
  language: 'fr' | 'en';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ language }) => {
  // Utiliser le hook d'authentification pour vérifier les permissions
  const { user: userProfile, isAdmin } = useAuth();
  
  // Définir l'onglet actif par défaut selon le rôle
  const [activeTab, setActiveTab] = useState(() => {
    return userProfile?.role === 'clients' ? 'reservations' : 'overview';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // today, week, month, all
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statsStartDate, setStatsStartDate] = useState('');
  const [statsEndDate, setStatsEndDate] = useState('');
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [displayedClients, setDisplayedClients] = useState<any[]>([]);
  
  // États pour la gestion du profil
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileFormData, setProfileFormData] = useState({
    full_name: userProfile?.full_name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    company: userProfile?.company || '',
    address: userProfile?.address || '',
    activity: userProfile?.activity || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Utiliser le hook pour récupérer les vraies données
  const { reservations, loading, error, refetch } = useReservations(
    userProfile ? { email: userProfile.email, role: userProfile.role } : undefined
  );
  
  // Logs de débogage simples
  console.log('🔍 Dashboard - État:', {
    userProfile: userProfile ? { email: userProfile.email, role: userProfile.role } : null,
    reservationsCount: reservations?.length || 0,
    loading,
    error
  });
  
  // Logs supplémentaires pour diagnostiquer le problème client
  if (userProfile?.role === 'clients') {
    console.log('🔍 Dashboard - Client détecté:', {
      email: userProfile.email,
      role: userProfile.role,
      hasReservations: reservations && reservations.length > 0,
      reservationsCount: reservations?.length || 0,
      reservations: reservations?.map(r => ({ id: r.id, email: r.email, full_name: r.full_name }))
    });
    
    // Vérifier que toutes les réservations appartiennent bien au client
    const otherReservations = reservations?.filter(r => r.email !== userProfile.email);
    if (otherReservations && otherReservations.length > 0) {
      console.error('🚨 ERREUR: Le client voit des réservations d\'autres utilisateurs:', otherReservations);
    } else {
      console.log('✅ Filtrage correct: Le client ne voit que ses propres réservations');
    }
  }
  
  // Utiliser le hook de permissions
  const { hasPermission } = usePermissions();

  // Vérifier et rediriger si l'utilisateur essaie d'accéder à des onglets restreints
  React.useEffect(() => {
    const restrictedTabs = ['clients', 'users', 'audit'];
    if (activeTab && restrictedTabs.includes(activeTab) && userProfile?.role !== 'admin') {
      console.log('🚫 Accès restreint détecté, redirection vers overview');
      setActiveTab('overview');
      showNotification('error', 'Accès restreint : Seuls les administrateurs peuvent accéder à cette section');
    }
  }, [activeTab, userProfile?.role]);

  // Fonction pour afficher les notifications
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fonction pour supprimer un client
  const handleDeleteClient = async (clientEmail: string) => {
    console.log('👋 Tentative de suppression du client:', clientEmail);
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
      console.log('✅ Confirmation reçue, suppression du client:', clientEmail);
      
      try {
        // Supprimer le client de la base de données
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('email', clientEmail)
          .eq('role', 'clients');

        if (error) {
          console.error('🚨 Erreur lors de la suppression en base:', error);
          showNotification('error', 'Erreur lors de la suppression en base de données');
          return;
        }

        console.log('✅ Client supprimé avec succès de la base de données');
        
        // Supprimer le client de la liste affichée immédiatement
        setDisplayedClients(prev => {
          const newList = prev.filter(client => client.email !== clientEmail);
          console.log('🎉 Client supprimé de la liste affichée:', clientEmail);
          console.log('🎉 Nouveau nombre de clients:', newList.length);
          return newList;
        });

        // Mettre à jour la liste des clients
        setClients(prev => prev.filter(client => client.email !== clientEmail));
        
        showNotification('success', 'Client supprimé avec succès');
        
        // Recharger les clients pour s'assurer de la cohérence
        setTimeout(() => {
          loadClients();
        }, 1000);
        
      } catch (err) {
        console.error('🚨 Erreur lors de la suppression:', err);
        showNotification('error', 'Erreur lors de la suppression');
        
        // En cas d'erreur, recharger les clients pour restaurer l'état
        loadClients();
      }
    }
  };

  // Vérifier si l'utilisateur a accès à l'onglet actuel
  useEffect(() => {
    // Pour les clients, forcer l'onglet réservations SAUF pour l'onglet profile
    if (userProfile?.role === 'clients' && activeTab !== 'reservations' && activeTab !== 'profile') {
      console.log('👋 Client détecté - Redirection vers l\'onglet réservations');
      setActiveTab('reservations');
      return;
    }
    
    // Protection pour l'onglet audit - seuls les administrateurs peuvent y accéder
    if (activeTab === 'audit' && userProfile?.role !== 'admin') {
      console.log('🚫 Tentative d\'accès non autorisé à l\'onglet audit - Redirection vers overview');
      showNotification('error', 'Accès restreint : Seuls les administrateurs peuvent accéder au journal d\'audit');
      setActiveTab('overview');
      return;
    }
  }, [activeTab, hasPermission, isAdmin, userProfile?.role]);

  // Défilement automatique vers l'onglet actif
  useEffect(() => {
    const activeTabElement = document.getElementById(`tab-${activeTab}`);
    const navContainer = activeTabElement?.closest('nav');
    
    if (activeTabElement && navContainer) {
      // Attendre un peu pour que le DOM soit mis à jour
      setTimeout(() => {
        const containerRect = navContainer.getBoundingClientRect();
        const elementRect = activeTabElement.getBoundingClientRect();
        
        // Vérifier si l'élément est visible dans le conteneur
        const isVisible = 
          elementRect.left >= containerRect.left && 
          elementRect.right <= containerRect.right;
        
        if (!isVisible) {
          // Calculer la position de défilement pour centrer l'élément
          const scrollLeft = activeTabElement.offsetLeft - (navContainer.clientWidth / 2) + (activeTabElement.clientWidth / 2);
          
          navContainer.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          });
        }
      }, 150);
    }
  }, [activeTab]);



  // Fonction pour rafraîchir les données
  const handleRefresh = async () => {
    console.log('🔄 Refreshing dashboard data...');
    await refetch();
    setLastRefresh(new Date());
  };

  // Auto-refresh des données toutes les 30 secondes
  useEffect(() => {
    // Désactiver l'auto-refresh automatique pour éviter les actualisations constantes
    // const interval = setInterval(() => {
    //   console.log('🔄 Auto-refreshing dashboard data...');
    //   refetch();
    //   setLastRefresh(new Date());
    // }, 30000); // 30 secondes

    // return () => clearInterval(interval);
  }, [refetch]);

  // Charger les clients depuis la base de données
  const [clients, setClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  // Fonction pour charger les clients
  const loadClients = async () => {
    console.log('🔄 Chargement des clients...');
    setClientsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('role', 'clients')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('🚨 Erreur lors du chargement des clients:', error);
        showNotification('error', 'Erreur lors du chargement des clients');
        // Garder les données existantes en cas d'erreur
        return;
      }

      console.log('✅ Clients chargés avec succès:', data?.length || 0);
      
      // Mettre à jour les états de manière sûre
      if (data) {
        setClients(data);
        setDisplayedClients(data);
      } else {
        setClients([]);
        setDisplayedClients([]);
      }
      
    } catch (err) {
      console.error('🚨 Erreur lors du chargement des clients:', err);
      showNotification('error', 'Erreur lors du chargement des clients');
      // Garder les données existantes en cas d'erreur
    } finally {
      setClientsLoading(false);
    }
  };

  // Initialiser les clients affichés
  useEffect(() => {
    if (activeTab === 'clients') {
      loadClients();
    }
  }, [activeTab]);

  // Protection contre les erreurs de rendu
  const safeDisplayedClients = displayedClients || [];
  const safeClients = clients || [];

  const translations = {
    fr: {
      title: 'Tableau de Bord Administrateur',
      subtitle: 'Gérez vos réservations et suivez vos performances',
      clientTitle: 'Mon Espace Personnel',
      clientSubtitle: 'Gérez vos réservations et suivez vos activités',
      tabs: {
        overview: 'Vue d\'ensemble',
        reservations: 'Réservations',
        reservationManagement: 'Gestion Réservations',
        revenue: 'Revenus',
        clients: 'Clients',
        statistics: 'Statistiques',
        users: 'Utilisateurs'
      },
      stats: {
        totalReservations: 'Réservations Totales',
        totalRevenue: 'Revenus Totaux',
        todayReservations: 'Réservations Aujourd\'hui',
        weekReservations: 'Cette Semaine',
        monthReservations: 'Ce Mois',
        averageAmount: 'Montant Moyen',
        coworkingRevenue: 'Revenus Coworking',
        privateOfficeRevenue: 'Revenus Bureau Privé',
        meetingRoomRevenue: 'Revenus Salle Réunion'
      },
      reservations: {
        pending: 'En Attente',
        confirmed: 'Confirmées',
        cancelled: 'Annulées',
        completed: 'Terminées',
        all: 'Toutes'
      },
      filters: {
        today: 'Aujourd\'hui',
        week: 'Cette semaine',
        month: 'Ce mois',
        all: 'Toutes'
      },
      actions: {
        export: 'Exporter',
        contact: 'Contacter',
        approve: 'Approuver',
        reject: 'Rejeter',
        view: 'Voir',
        edit: 'Modifier',
        delete: 'Supprimer',
        add: 'Ajouter',
        search: 'Rechercher...',
        filter: 'Filtrer',
        downloadInvoice: 'Télécharger Facture'
      },
      errors: {
        confirmedOnly: 'Seules les réservations confirmées peuvent générer une facture'
      },
      charts: {
        revenueByType: 'Revenus par Type d\'Espace',
        reservationsOverTime: 'Évolution des Réservations',
        dailyStats: 'Statistiques Quotidiennes'
      },
      clients: {
        totalClients: 'Total Clients',
        newThisMonth: 'Nouveaux ce mois',
        topClients: 'Meilleurs Clients'
      }
    },
    en: {
      title: 'Admin Dashboard',
      subtitle: 'Manage your reservations and track your performance',
      clientTitle: 'My Personal Space',
      clientSubtitle: 'Manage your reservations and track your activities',
      tabs: {
        overview: 'Overview',
        reservations: 'Reservations',
        reservationManagement: 'Reservation Management',
        revenue: 'Revenue',
        clients: 'Clients',
        statistics: 'Statistics',
        users: 'Users'
      },
      stats: {
        totalReservations: 'Total Reservations',
        totalRevenue: 'Total Revenue',
        todayReservations: 'Today\'s Reservations',
        weekReservations: 'This Week',
        monthReservations: 'This Month',
        averageAmount: 'Average Amount',
        coworkingRevenue: 'Coworking Revenue',
        privateOfficeRevenue: 'Private Office Revenue',
        meetingRoomRevenue: 'Meeting Room Revenue'
      },
      reservations: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        cancelled: 'Cancelled',
        completed: 'Completed',
        all: 'All'
      },
      filters: {
        today: 'Today',
        week: 'This week',
        month: 'This month',
        all: 'All'
      },
      actions: {
        export: 'Export',
        contact: 'Contact',
        approve: 'Approve',
        reject: 'Reject',
        view: 'View',
        edit: 'Edit',
        delete: 'Delete',
        add: 'Add',
        search: 'Search...',
        filter: 'Filter',
        downloadInvoice: 'Download Invoice'
      },
      errors: {
        confirmedOnly: 'Only confirmed reservations can generate an invoice'
      },
      charts: {
        revenueByType: 'Revenue by Space Type',
        reservationsOverTime: 'Reservations Over Time',
        dailyStats: 'Daily Statistics'
      },
      clients: {
        totalClients: 'Total Clients',
        newThisMonth: 'New This Month',
        topClients: 'Top Clients'
      }
    }
  };

  const t = translations[language];

  // Fonctions de calcul des statistiques
  const calculateStats = () => {
    console.log('🔍 Calculating stats with reservations:', reservations.length);
    console.log('🔍 Reservations data:', reservations);
    
    // Toujours retourner des statistiques, même si vides
    const defaultStats = {
      totalReservations: 0,
      totalRevenue: 0,
      todayReservations: 0,
      weekReservations: 0,
      monthReservations: 0,
      averageAmount: 0,
      revenueByType: {
        coworking: 0,
        'bureau_prive': 0,
        'bureau-prive': 0,
        'salle-reunion': 0,
        'domiciliation': 0
      }
    };
    
    if (!reservations.length) {
      console.log('🔍 No reservations found, returning default stats');
      return defaultStats;
    }

    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    console.log('🔍 Date filters:', {
      today: today.toDateString(),
      startOfWeek: startOfWeek.toDateString(),
      startOfMonth: startOfMonth.toDateString()
    });

    const stats = reservations.reduce((acc, reservation) => {
      const reservationDate = new Date(reservation.created_at);
      const amount = Number(reservation.amount) || 0;
      
      console.log('🔍 Processing reservation:', {
        id: reservation.id,
        amount,
        space_type: reservation.space_type,
        date: reservationDate.toDateString()
      });

      // Total
      acc.totalReservations += 1;
      acc.totalRevenue += amount;

      // Par période
      if (reservationDate.toDateString() === today.toDateString()) {
        acc.todayReservations += 1;
      }
      if (reservationDate >= startOfWeek) {
        acc.weekReservations += 1;
      }
      if (reservationDate >= startOfMonth) {
        acc.monthReservations += 1;
      }

      // Par type d'espace
      const spaceType = reservation.space_type;
      console.log('🔍 Processing space type:', spaceType, 'with amount:', amount);
      
      if (spaceType === 'coworking') {
        acc.revenueByType.coworking += amount;
      } else if (spaceType === 'bureau_prive' || spaceType === 'bureau-prive') {
        acc.revenueByType['bureau_prive'] += amount;
        acc.revenueByType['bureau-prive'] += amount;
      } else if (spaceType === 'salle-reunion' || spaceType === 'salle_reunion') {
        acc.revenueByType['salle-reunion'] += amount;
      } else if (spaceType === 'domiciliation') {
        acc.revenueByType.domiciliation += amount;
      } else {
        console.log('⚠️ Type d\'espace non reconnu:', spaceType);
      }

      return acc;
    }, {
      totalReservations: 0,
      totalRevenue: 0,
      todayReservations: 0,
      weekReservations: 0,
      monthReservations: 0,
      averageAmount: 0,
      revenueByType: {
        coworking: 0,
        'bureau_prive': 0,
        'bureau-prive': 0,
        'salle-reunion': 0,
        domiciliation: 0
      }
    });

    stats.averageAmount = stats.totalReservations > 0 ? stats.totalRevenue / stats.totalReservations : 0;

    console.log('🔍 Calculated stats:', stats);
    return stats;
  };

  const stats = calculateStats();

  // Données pour les graphiques
  const revenueByTypeData = [
    { name: 'Coworking', value: stats.revenueByType.coworking, color: '#3B82F6' },
    { name: 'Bureau Privé', value: stats.revenueByType['bureau_prive'] + stats.revenueByType['bureau-prive'], color: '#10B981' },
    { name: 'Salle Réunion', value: stats.revenueByType['salle-reunion'], color: '#F59E0B' }
  ].filter(item => item.value > 0); // Ne montrer que les types avec des revenus

  // Données pour l'évolution des réservations (derniers 30 jours)
  const getReservationsOverTime = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        count: 0,
        revenue: 0
      };
    });

    reservations.forEach(reservation => {
      const reservationDate = reservation.created_at.split('T')[0];
      const dayData = last30Days.find(day => day.date === reservationDate);
      if (dayData) {
        dayData.count += 1;
        dayData.revenue += Number(reservation.amount) || 0;
      }
    });

    console.log('🔍 Reservations over time data:', last30Days.slice(-7)); // Log derniers 7 jours
    return last30Days.map(day => ({
      ...day,
      displayDate: new Date(day.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    }));
  };

  const reservationsOverTime = getReservationsOverTime();

  // Calcul des clients uniques
  const getClientsStats = () => {
    console.log('🔥 Calculating client stats...');
    const uniqueClients = new Map();
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    reservations.forEach(reservation => {
      const email = reservation.email;
      
      if (!uniqueClients.has(email)) {
        uniqueClients.set(email, {
          email,
          full_name: reservation.full_name,
          phone: reservation.phone,
          company: reservation.company,
          totalReservations: 0,
          totalSpent: 0,
          lastReservation: reservation.created_at,
          isNewThisMonth: new Date(reservation.created_at) >= startOfMonth
        });
      }
      
      const client = uniqueClients.get(email);
      client.totalReservations += 1;
      client.totalSpent += Number(reservation.amount) || 0;
      
      if (new Date(reservation.created_at) > new Date(client.lastReservation)) {
        client.lastReservation = reservation.created_at;
      }
    });

    const clientsArray = Array.from(uniqueClients.values());
    const newThisMonth = clientsArray.filter(client => client.isNewThisMonth).length;

    console.log('🔥 Client stats calculated:', {
      total: clientsArray.length,
      newThisMonth,
      topClientsCount: clientsArray.slice(0, 10).length
    });

    return {
      totalClients: clientsArray.length,
      newThisMonth,
      topClients: clientsArray
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10)
    };
  };

  const clientsStats = getClientsStats();

  // Filtrage des réservations
  const getFilteredReservations = () => {
    let filtered = reservations;

    // Pour les clients, s'assurer qu'ils ne voient que leurs propres réservations
    if (userProfile?.role === 'clients') {
      filtered = filtered.filter(r => r.email === userProfile.email);
      console.log('🔒 Filtrage client appliqué:', {
        userEmail: userProfile.email,
        filteredCount: filtered.length,
        allReservationsCount: reservations.length
      });
    }

    // Filtre par statut
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.space_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par date
    if (dateFilter !== 'all') {
      const today = new Date();
      const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      filtered = filtered.filter(r => {
        const reservationDate = new Date(r.created_at);
        switch (dateFilter) {
          case 'today':
            return reservationDate.toDateString() === today.toDateString();
          case 'week':
            return reservationDate >= startOfWeek;
          case 'month':
            return reservationDate >= startOfMonth;
          default:
            return true;
        }
      });
    }

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const filteredReservations = getFilteredReservations();

  // Fonction pour obtenir les réservations filtrées par période pour les statistiques
  const getStatsFilteredReservations = () => {
    // Si aucune date n'est sélectionnée, retourner toutes les réservations
    if (!statsStartDate && !statsEndDate) {
      return reservations;
    }

    // Si seulement une date est sélectionnée, utiliser cette date pour les deux
    const startDate = statsStartDate ? new Date(statsStartDate) : new Date(statsEndDate!);
    const endDate = statsEndDate ? new Date(statsEndDate + 'T23:59:59') : new Date(statsStartDate + 'T23:59:59');

    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.created_at);
      return reservationDate >= startDate && reservationDate <= endDate;
    });
  };

  const statsFilteredReservations = getStatsFilteredReservations();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-nzoo-dark" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-nzoo-gray/20 text-nzoo-dark border-nzoo-gray/30';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatSpaceType = (spaceType: string) => {
    const types = {
      'coworking': 'Coworking',
      'bureau-prive': 'Bureau Privé',
      'salle-reunion': 'Salle Réunion'
    };
    return types[spaceType as keyof typeof types] || spaceType;
  };

  // Fonction pour exporter les données
  const exportReservations = () => {
    let dataToExport = filteredReservations;
    
    // Si des dates sont sélectionnées, filtrer par période
    if (startDate && endDate) {
      dataToExport = dataToExport.filter(reservation => {
        const reservationDate = new Date(reservation.created_at);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return reservationDate >= start && reservationDate <= end;
      });
    }
    
    // Préparer les données pour l'export CSV
    const csvData = dataToExport.map(reservation => ({
      'Nom complet': reservation.full_name,
      'Email': reservation.email,
      'Téléphone': reservation.phone,
      'Entreprise': reservation.company || '',
      'Type d\'espace': formatSpaceType(reservation.space_type),
      'Date de début': new Date(reservation.start_date).toLocaleDateString('fr-FR'),
      'Date de fin': new Date(reservation.end_date).toLocaleDateString('fr-FR'),
      'Occupants': reservation.occupants,
      'Montant': reservation.amount,
      'Méthode de paiement': reservation.payment_method,
      'Statut': t.reservations[reservation.status as keyof typeof t.reservations],
      'Date de création': new Date(reservation.created_at).toLocaleDateString('fr-FR'),
      'Notes': reservation.notes || '',
      'Notes admin': reservation.admin_notes || ''
    }));
    
    // Créer le contenu CSV
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => {
        return headers.map(header => {
          const value = row[header as keyof typeof row];
          return `"${value}"`;
        }).join(',');
      })
    ].join('\n');
    
    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reservations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonction pour télécharger la facture d'une réservation
  const handleDownloadInvoice = async (reservation: any) => {
    // Vérifier que la réservation est confirmée
    if (reservation.status !== 'confirmed') {
      alert('Seules les réservations confirmées peuvent générer une facture');
      return;
    }

    setDownloadingInvoice(reservation.id);
    try {
      await generateAndDownloadInvoice(reservation);
      console.log('✅ Facture téléchargée avec succès');
      // Afficher une notification de succès
      setNotification({
        type: 'success',
        message: 'Facture générée et téléchargée avec succès'
      });
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement de la facture:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du téléchargement de la facture';
      setNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setDownloadingInvoice(null);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="rounded-full h-12 w-12 border-b-2 border-nzoo-dark mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Erreur: {error}</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards avec design moderne */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft p-8 border border-gray-100 hover:shadow-xl transition-all duration-500 transform hover:scale-105 group">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-600 mb-1 font-montserrat">{t.stats.totalReservations}</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-nzoo-dark to-nzoo-dark bg-clip-text text-transparent font-montserrat">{stats.totalReservations}</p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">+12% ce mois</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-nzoo-dark to-nzoo-dark p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft p-8 border border-gray-100 hover:shadow-xl transition-all duration-500 transform hover:scale-105 group">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-600 mb-1 font-montserrat">{t.stats.totalRevenue}</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-montserrat">${stats.totalRevenue.toFixed(2)}</p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">+8% ce mois</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft p-8 border border-gray-100 hover:shadow-xl transition-all duration-500 transform hover:scale-105 group">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-600 mb-1 font-montserrat">{t.stats.todayReservations}</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-montserrat">{stats.todayReservations}</p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-orange-600 font-medium">Aujourd'hui</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft p-8 border border-gray-100 hover:shadow-xl transition-all duration-500 transform hover:scale-105 group">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-600 mb-1 font-montserrat">{t.stats.averageAmount}</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-montserrat">${stats.averageAmount.toFixed(2)}</p>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-xs text-purple-600 font-medium">Par réservation</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Période Stats avec design moderne */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-soft p-8 border border-blue-100 hover:shadow-xl transition-all duration-500 transform hover:scale-105 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 font-montserrat">{t.stats.weekReservations}</h3>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-2xl shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-montserrat">{stats.weekReservations}</p>
          <div className="flex items-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-blue-600 font-medium">Cette semaine</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-soft p-8 border border-green-100 hover:shadow-xl transition-all duration-500 transform hover:scale-105 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 font-montserrat">{t.stats.monthReservations}</h3>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-2xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-montserrat">{stats.monthReservations}</p>
          <div className="flex items-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-600 font-medium">Ce mois</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-soft p-8 border border-purple-100 hover:shadow-xl transition-all duration-500 transform hover:scale-105 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 font-montserrat">{t.clients.totalClients}</h3>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-3 rounded-2xl shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-montserrat">{clientsStats.totalClients}</p>
          <div className="flex items-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-purple-600 font-medium">Clients uniques</span>
          </div>
        </div>
      </div>

      {/* Charts avec design moderne */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft p-8 border border-gray-100 hover:shadow-xl transition-all duration-500">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 font-montserrat">{t.charts.revenueByType}</h3>
              <p className="text-gray-600 text-sm font-poppins">Répartition des revenus par type d'espace</p>
            </div>
            <button 
              onClick={handleRefresh}
              className="p-3 text-gray-600 hover:text-gray-800 bg-white/50 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300"
              title="Actualiser"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          
          {revenueByTypeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <RechartsPieChart>
              <Pie
                data={revenueByTypeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: $${value}`}
              >
                {revenueByTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Revenus']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-gray-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <PieChart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-poppins text-gray-600 mb-2">Aucune donnée de revenus disponible</p>
                <button 
                  onClick={handleRefresh}
                  className="text-nzoo-dark hover:text-nzoo-dark/80 text-sm underline font-poppins hover:no-underline transition-all duration-300"
                >
                  Actualiser les données
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft p-8 border border-gray-100 hover:shadow-xl transition-all duration-500">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 font-montserrat">{t.charts.reservationsOverTime}</h3>
              <p className="text-gray-600 text-sm font-poppins">Évolution des réservations sur 30 jours</p>
            </div>
            <button 
              onClick={handleRefresh}
              className="p-3 text-gray-600 hover:text-gray-800 bg-white/50 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300"
              title="Actualiser"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={reservationsOverTime}>
              <defs>
                <linearGradient id="colorReservations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#183154" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#183154" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="displayDate" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#183154" 
                strokeWidth={3}
                fill="url(#colorReservations)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Debug Information */}
      <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
        <h4 className="font-semibold text-yellow-800 mb-4 font-montserrat">🔍 Diagnostic des Données de Revenus</h4>
        <div className="text-sm text-yellow-700 space-y-2 font-poppins">
          <p><strong>État du chargement:</strong> {loading ? 'Chargement...' : 'Terminé'}</p>
          <p><strong>Erreur:</strong> {error || 'Aucune erreur'}</p>
          <p><strong>Total réservations chargées:</strong> {reservations.length}</p>
          <p><strong>Revenus total calculé:</strong> ${stats.totalRevenue.toFixed(2)}</p>
          <p><strong>Types d'espaces trouvés:</strong> {[...new Set(reservations.map(r => r.space_type))].join(', ') || 'Aucun'}</p>
          <p><strong>Dernière actualisation:</strong> {lastRefresh.toLocaleString('fr-FR')}</p>
          <p><strong>Utilisateur actuel:</strong> {userProfile?.email} ({userProfile?.role})</p>
          {reservations.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
              <p className="font-semibold mb-2">Exemples de réservations:</p>
              {reservations.slice(0, 3).map((r, i) => (
                <p key={i} className="text-xs">
                  ID: {r.id} | Type: {r.space_type} | Montant: ${r.amount} | Statut: {r.status}
                </p>
              ))}
            </div>
          )}
        </div>
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          🔄 Actualiser les données
        </button>
      </div>
    </div>
  );

  const renderReservations = () => (
    <div className="space-y-8">
      {/* Filters avec design moderne */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft p-8 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-3 font-montserrat">Rechercher une réservation</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t.actions.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-nzoo-dark focus:border-nzoo-dark transition-all duration-300 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 font-montserrat">Statut</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-nzoo-dark focus:border-nzoo-dark transition-all duration-300 bg-white/80 backdrop-blur-sm min-w-[150px]"
              >
                <option value="all">{t.reservations.all}</option>
                <option value="pending">{t.reservations.pending}</option>
                <option value="confirmed">{t.reservations.confirmed}</option>
                <option value="completed">{t.reservations.completed}</option>
                <option value="cancelled">{t.reservations.cancelled}</option>
              </select>
            </div>
            
            {/* Sélection de période avec design amélioré */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 font-montserrat">Période</label>
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-4 rounded-2xl border-2 border-gray-200">
                <Calendar className="w-5 h-5 text-gray-500" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nzoo-dark focus:border-nzoo-dark text-sm bg-white transition-all duration-300"
                  placeholder="Date de début"
                />
                <span className="text-gray-400 font-medium">à</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nzoo-dark focus:border-nzoo-dark text-sm bg-white transition-all duration-300"
                  placeholder="Date de fin"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={exportReservations}
                className="px-6 py-4 bg-gradient-to-r from-nzoo-dark to-nzoo-dark text-white rounded-2xl hover:from-nzoo-dark/90 hover:to-nzoo-dark/90 flex items-center gap-3 transition-all duration-300 shadow-soft hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                <Download className="w-5 h-5" />
                {t.actions.export}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reservations Table avec design moderne */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-xl font-bold text-gray-800 font-montserrat">Liste des Réservations</h3>
          <p className="text-gray-600 text-sm font-poppins mt-1">
            {filteredReservations.length} réservation{filteredReservations.length > 1 ? 's' : ''} trouvée{filteredReservations.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="overflow-x-auto">
          {filteredReservations.length === 0 ? (
            // Message pour les clients sans réservations
            <div className="p-12 text-center">
              {userProfile?.role === 'clients' ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 font-montserrat">
                    Aucune réservation pour votre compte
                  </h3>
                  <p className="text-gray-600 font-poppins max-w-md mx-auto">
                    Vous n'avez pas encore effectué de réservation avec votre compte ({userProfile.email}). Commencez par explorer nos espaces et réservez votre premier espace de travail !
                  </p>
                  <div className="mt-6 space-y-3">
                    <Link
                      to="/reservation/coworking"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-nzoo-dark to-nzoo-dark text-white rounded-2xl hover:from-nzoo-dark/90 hover:to-nzoo-dark/90 transition-all duration-300 shadow-soft hover:shadow-xl transform hover:scale-105 font-semibold"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Réserver un espace
                    </Link>
                    <div className="text-sm text-gray-500">
                      Connecté en tant que : <span className="font-semibold">{userProfile.email}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 font-montserrat">
                    Aucune réservation trouvée
                  </h3>
                  <p className="text-gray-600 font-poppins">
                    Aucune réservation ne correspond aux critères de recherche.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-white">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-montserrat">Client</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-montserrat">Espace</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-montserrat">Période</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-montserrat">Montant</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-montserrat">Statut</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-montserrat">Date</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-montserrat">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 group">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900 font-montserrat">{reservation.full_name}</div>
                      <div className="text-sm text-gray-500 font-poppins">{reservation.email}</div>
                      <div className="text-sm text-gray-400 font-poppins">{reservation.phone}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900 font-montserrat">{formatSpaceType(reservation.space_type)}</div>
                      <div className="text-sm text-gray-500 font-poppins">{reservation.occupants} personne{reservation.occupants > 1 ? 's' : ''}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900 font-montserrat">
                        {new Date(reservation.start_date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-gray-500 font-poppins">
                        au {new Date(reservation.end_date).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-green-600 font-montserrat">${reservation.amount}</div>
                      <div className="text-sm text-gray-500 font-poppins capitalize">{reservation.payment_method.replace('_', ' ')}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold border-2 transition-all duration-300 ${getStatusColor(reservation.status)}`}>
                      {getStatusIcon(reservation.status)}
                      <span className="ml-2 font-montserrat">{t.reservations[reservation.status as keyof typeof t.reservations]}</span>
                    </span>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 font-montserrat">
                      {new Date(reservation.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-sm text-gray-500 font-poppins">
                      {new Date(reservation.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownloadInvoice(reservation)}
                        disabled={downloadingInvoice === reservation.id || reservation.status !== 'confirmed'}
                        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg transition-all duration-300 ${
                          reservation.status === 'confirmed'
                            ? 'text-white bg-gradient-to-r from-nzoo-dark to-nzoo-dark hover:from-nzoo-dark/90 hover:to-nzoo-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nzoo-dark'
                            : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={reservation.status === 'confirmed' ? t.actions.downloadInvoice : t.errors.confirmedOnly}
                      >
                        {downloadingInvoice === reservation.id ? (
                          <div className="rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <FileText className="w-4 h-4 mr-1" />
                        )}
                        {downloadingInvoice === reservation.id ? 'Génération...' : 'Facture'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-8">
      {/* Header avec bouton d'analyse détaillée */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analyse des Revenus</h2>
          <p className="text-gray-600">Vue d'ensemble des revenus et analyse détaillée</p>
        </div>
        <button
          onClick={() => setShowRevenueModal(true)}
                        className="px-6 py-3 bg-nzoo-dark text-white rounded-lg hover:bg-nzoo-dark/80 flex items-center gap-2 transition-colors"
        >
          <BarChartIcon className="w-5 h-5" />
          Analyse Détaillée
        </button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.stats.coworkingRevenue}</h3>
                          <p className="text-2xl font-bold text-nzoo-dark">${stats.revenueByType.coworking.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {reservations.filter(r => r.space_type === 'coworking').length} réservations
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.stats.privateOfficeRevenue}</h3>
          <p className="text-2xl font-bold text-green-600">${(stats.revenueByType['bureau_prive'] + stats.revenueByType['bureau-prive']).toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {reservations.filter(r => r.space_type === 'bureau_prive' || r.space_type === 'bureau-prive').length} réservations
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.stats.meetingRoomRevenue}</h3>
          <p className="text-2xl font-bold text-orange-600">${stats.revenueByType['salle-reunion'].toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {reservations.filter(r => r.space_type === 'salle-reunion').length} réservations
          </p>
        </div>
      </div>

      {/* Domiciliation Revenue */}
      {stats.revenueByType.domiciliation > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenus Domiciliation</h3>
          <p className="text-2xl font-bold text-purple-600">${stats.revenueByType.domiciliation.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {reservations.filter(r => r.space_type === 'domiciliation').length} réservations
          </p>
        </div>
      )}

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Évolution des Revenus (30 derniers jours)</h3>
          <button 
            onClick={handleRefresh}
                            className="text-nzoo-dark hover:text-nzoo-dark/80 p-2 rounded-lg hover:bg-nzoo-gray/10"
            title="Actualiser le graphique"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={reservationsOverTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="displayDate" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, 'Revenus']} />
            <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Résumé des données */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total période:</span>
              <span className="font-semibold ml-2">${reservationsOverTime.reduce((sum, day) => sum + day.revenue, 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-600">Réservations:</span>
              <span className="font-semibold ml-2">{reservationsOverTime.reduce((sum, day) => sum + day.count, 0)}</span>
            </div>
            <div>
              <span className="text-gray-600">Moyenne/jour:</span>
              <span className="font-semibold ml-2">${(reservationsOverTime.reduce((sum, day) => sum + day.revenue, 0) / 30).toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-600">Dernière MAJ:</span>
              <span className="font-semibold ml-2">{lastRefresh.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="space-y-8">
      {/* Client Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.clients.totalClients}</h3>
          <p className="text-2xl font-bold text-nzoo-dark">{safeDisplayedClients.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.clients.newThisMonth}</h3>
          <p className="text-2xl font-bold text-green-600">
            {safeDisplayedClients.filter(c => {
              const today = new Date();
              const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
              return new Date(c.created_at) >= startOfMonth;
            }).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Clients Actifs</h3>
          <p className="text-2xl font-bold text-purple-600">
            {safeDisplayedClients.filter(c => c.is_active).length}
          </p>
        </div>
      </div>

      {/* Top Clients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{t.clients.topClients}</h3>
          <button
            onClick={loadClients}
            disabled={clientsLoading}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-nzoo-dark text-white rounded-lg hover:bg-nzoo-dark/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${clientsLoading ? '' : ''}`} />
            {clientsLoading ? 'Chargement...' : 'Actualiser'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réservations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Dépensé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière Réservation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientsLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="rounded-full h-6 w-6 border-b-2 border-nzoo-dark"></div>
                      <span className="text-gray-500">Chargement des clients...</span>
                    </div>
                  </td>
                </tr>
              ) : safeDisplayedClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun client trouvé
                  </td>
                </tr>
              ) : (
                                safeDisplayedClients.map((client, index) => (
                  <tr key={client.email || `client-${index}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{client.full_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{client.email || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{client.phone || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.company || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {(reservations || []).filter(r => r.email === client.email).length}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${(reservations || [])
                        .filter(r => r.email === client.email)
                        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
                        .toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(() => {
                        const clientReservations = (reservations || []).filter(r => r.email === client.email);
                        if (clientReservations.length > 0) {
                          const lastReservation = clientReservations.sort((a, b) => 
                            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                          )[0];
                          return new Date(lastReservation.created_at).toLocaleDateString('fr-FR');
                        }
                        return 'Aucune';
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => client.email && handleDeleteClient(client.email)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Supprimer le client"
                        disabled={!client.email}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Fonction pour gérer le changement d'avatar
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fonction pour gérer les changements de formulaire profil
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileFormData({
      ...profileFormData,
      [e.target.name]: e.target.value
    });
  };

  // Fonction pour sauvegarder les modifications du profil
  const handleSaveProfile = async () => {
    if (!userProfile) return;
    
    setIsLoadingProfile(true);
    setProfileMessage(null);
    
    try {
      // Upload de l'avatar si un nouveau fichier a été sélectionné
      if (avatarFile) {
        console.log('🖼️ Upload de l\'avatar...');
        const avatarResult = await profileService.uploadAvatar(userProfile.id, avatarFile);
        if (!avatarResult.success) {
          setProfileMessage({ type: 'error', text: avatarResult.message });
          setIsLoadingProfile(false);
          return;
        }
        console.log('✅ Avatar uploadé avec succès');
      }

      // Préparer les données de mise à jour
      const updateData: any = {};
      
      if (profileFormData.full_name !== userProfile.full_name) updateData.full_name = profileFormData.full_name;
      if (profileFormData.email !== userProfile.email) updateData.email = profileFormData.email;
      if (profileFormData.phone !== userProfile.phone) updateData.phone = profileFormData.phone;
      if (profileFormData.company !== userProfile.company) updateData.company = profileFormData.company;
      if (profileFormData.address !== userProfile.address) updateData.address = profileFormData.address;
      if (profileFormData.activity !== userProfile.activity) updateData.activity = profileFormData.activity;
      
      if (profileFormData.newPassword && profileFormData.currentPassword) {
        updateData.currentPassword = profileFormData.currentPassword;
        updateData.newPassword = profileFormData.newPassword;
      }

      // Mettre à jour le profil
      const result = await profileService.updateProfile(userProfile.id, updateData);
      
      if (result.success) {
        setProfileMessage({ type: 'success', text: result.message });
        setIsEditingProfile(false);
        
        // Réinitialiser les champs de mot de passe et l'avatar
        setProfileFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setAvatarFile(null);
        setAvatarPreview(null);
        
        // Recharger les données utilisateur si nécessaire
        window.location.reload();
      } else {
        setProfileMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setProfileMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Fonction pour annuler les modifications du profil
  const handleCancelProfile = () => {
    setProfileFormData({
      full_name: userProfile?.full_name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
      company: userProfile?.company || '',
      address: userProfile?.address || '',
      activity: userProfile?.activity || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditingProfile(false);
  };

  // Fonction pour obtenir l'icône du rôle
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'user':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'clients':
        return <User className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  // Fonction pour obtenir le nom du rôle
  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'user':
        return 'Utilisateur';
      case 'clients':
        return 'Client';
      default:
        return 'Utilisateur';
    }
  };

  // Fonction pour obtenir la couleur du rôle
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'user':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'clients':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderProfileModal = () => (
    <>
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Mon Profil</h2>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
      {/* Message */}
      {profileMessage && (
        <div className={`p-4 rounded-lg ${
          profileMessage.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {profileMessage.text}
        </div>
      )}

      {/* Avatar Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            {isEditingProfile && (
              <button
                onClick={() => document.getElementById('avatar-input')?.click()}
                className="absolute -bottom-2 -right-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                title="Changer la photo de profil"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              {userProfile?.full_name || userProfile?.username}
            </h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(userProfile?.role || '')} mt-2`}>
              {getRoleIcon(userProfile?.role || '')}
              <span className="ml-1">{getRoleName(userProfile?.role || '')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Informations Personnelles</h4>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            disabled={isLoadingProfile}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditingProfile ? (
              <>
                <X className="w-4 h-4" />
                <span>Annuler</span>
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </>
            )}
          </button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nom complet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            {isEditingProfile ? (
              <input
                type="text"
                name="full_name"
                value={profileFormData.full_name}
                onChange={handleProfileInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">{userProfile?.full_name || 'Non renseigné'}</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            {isEditingProfile ? (
              <input
                type="email"
                name="email"
                value={profileFormData.email}
                onChange={handleProfileInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">{userProfile?.email}</span>
              </div>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            {isEditingProfile ? (
              <input
                type="tel"
                name="phone"
                value={profileFormData.phone}
                onChange={handleProfileInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">{userProfile?.phone || 'Non renseigné'}</span>
              </div>
            )}
          </div>

          {/* Entreprise */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entreprise
            </label>
            {isEditingProfile ? (
              <input
                type="text"
                name="company"
                value={profileFormData.company}
                onChange={handleProfileInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">{userProfile?.company || 'Non renseigné'}</span>
              </div>
            )}
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            {isEditingProfile ? (
              <input
                type="text"
                name="address"
                value={profileFormData.address}
                onChange={handleProfileInputChange}
                placeholder="Votre adresse complète"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 text-gray-500">📍</div>
                <span className="text-gray-900">{userProfile?.address || 'Non renseigné'}</span>
              </div>
            )}
          </div>

          {/* Activité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activité
            </label>
            {isEditingProfile ? (
              <input
                type="text"
                name="activity"
                value={profileFormData.activity}
                onChange={handleProfileInputChange}
                placeholder="Votre domaine d'activité"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 text-gray-500">💼</div>
                <span className="text-gray-900">{userProfile?.activity || 'Non renseigné'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Informations système */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Informations Système</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Membre depuis :</span>
              <span className="text-gray-900">
                {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('fr-FR') : 'N/A'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Statut :</span>
              <span className="text-gray-900">
                {userProfile?.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        {isEditingProfile && (
          <div className="mt-6 p-4 border border-gray-200 rounded-lg">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Changer le mot de passe</h5>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={profileFormData.currentPassword}
                    onChange={handleProfileInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={profileFormData.newPassword}
                  onChange={handleProfileInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={profileFormData.confirmPassword}
                  onChange={handleProfileInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {isEditingProfile && (
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancelProfile}
              disabled={isLoadingProfile}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={isLoadingProfile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingProfile ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Sauvegarder</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
          </div>
        </div>
      )}
    </>
  );

  const tabs = [
    // Onglets de base pour tous les utilisateurs (admin et user)
    { id: 'overview', label: t.tabs.overview, icon: BarChart3 },
    { id: 'reservations', label: t.tabs.reservations, icon: Calendar },
    { id: 'reservationManagement', label: t.tabs.reservationManagement, icon: Calendar },
    { id: 'spaces', label: 'Espaces', icon: Building },
    { id: 'revenue', label: t.tabs.revenue, icon: DollarSign },
    { id: 'statistics', label: t.tabs.statistics, icon: TrendingUp },
    { id: 'aiFollowUps', label: 'Relances IA', icon: Brain },
    // Onglets réservés aux administrateurs uniquement
    ...(userProfile?.role === 'admin' ? [
      { id: 'clients', label: t.tabs.clients, icon: Users },
      { id: 'users', label: t.tabs.users, icon: Users },
      { id: 'audit', label: 'Audit', icon: BarChart3 }
    ] : []),
    { id: 'profile', label: 'Mon Profil', icon: User }
  ];
  
  // Logs pour diagnostiquer les onglets
  console.log('🔍 Dashboard - Onglets disponibles:', {
    userRole: userProfile?.role,
    isAdmin: isAdmin(),
    tabsCount: tabs.length,
    tabs: tabs.map(tab => ({ id: tab.id, label: tab.label })),
    activeTab: activeTab,
    userProfile: userProfile ? { id: userProfile.id, email: userProfile.email, role: userProfile.role } : null,
    hasProfileTab: tabs.some(tab => tab.id === 'profile')
  });





  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-28 pb-8 font-poppins">
      {/* Notification */}
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header avec design moderne */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-nzoo-dark to-nzoo-dark rounded-2xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-nzoo-dark to-nzoo-dark bg-clip-text text-transparent mb-2 font-montserrat">
                      {userProfile?.role === 'clients' ? t.clientTitle : t.title}
                    </h1>
                    <p className="text-nzoo-dark/70 font-poppins text-lg">
                      {userProfile?.role === 'clients' ? t.clientSubtitle : t.subtitle}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-3 text-gray-400 hover:text-gray-600 relative bg-white/50 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300">
                  <Bell className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-poppins shadow-lg">
                    {stats.todayReservations}
                  </span>
                </button>
                <button 
                  onClick={handleRefresh}
                  className="p-3 text-nzoo-dark/60 hover:text-nzoo-dark transition-all duration-300 bg-white/50 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-medium hover:scale-105"
                  title="Actualiser les données"
                >
                  <RefreshCw className="w-6 h-6" />
                </button>
                <button className="p-3 text-nzoo-dark/60 hover:text-nzoo-dark transition-all duration-300 bg-white/50 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-medium hover:scale-105">
                  <Settings className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Indicateur de dernière mise à jour avec design amélioré */}
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-nzoo-dark/50 font-poppins">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Dernière mise à jour : {lastRefresh.toLocaleTimeString('fr-FR')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">Système opérationnel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs avec design moderne et défilement automatique */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative">
            {/* Indicateur de défilement gauche */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/80 to-transparent z-10 pointer-events-none"></div>
            
            {/* Indicateur de défilement droit */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent z-10 pointer-events-none"></div>
            
            <nav className="flex space-x-1 p-2 overflow-x-auto scrollbar-hide scroll-smooth">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    onClick={() => {
                      // Vérifier les permissions pour l'onglet audit
                      if (tab.id === 'audit' && userProfile?.role !== 'admin') {
                        showNotification('error', 'Accès restreint : Seuls les administrateurs peuvent accéder au journal d\'audit');
                        return;
                      }
                      
                      try {
                        const { AuditService } = require('../services/auditService');
                        AuditService.record({
                          actorId: userProfile?.id || 'admin',
                          actorRole: (userProfile?.role === 'admin' ? 'admin' : 'staff'),
                          action: 'UPDATE',
                          target: `tab:${tab.id}`,
                          metadata: { type: 'PAGE_VIEW', label: tab.label },
                          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
                        });
                      } catch {}
                      setActiveTab(tab.id);
                    }}
                    className={`flex-shrink-0 whitespace-nowrap py-4 px-6 rounded-2xl font-medium text-sm flex items-center justify-center space-x-2 transition-all duration-300 font-poppins min-w-max ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-nzoo-dark to-nzoo-dark text-white shadow-lg transform scale-105'
                        : 'text-nzoo-dark/60 hover:text-nzoo-dark hover:bg-white/50 hover:shadow-soft'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content avec design moderne */}
        <div className="animate-fadeIn bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mt-12">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'reservations' && renderReservations()}
          {activeTab === 'reservationManagement' && (console.log('AUDIT_PAGE_VIEW','reservationManagement'), <ReservationManagement language={language} />)}
          {activeTab === 'spaces' && (console.log('AUDIT_PAGE_VIEW','spaces'), <SpaceManagementForm language={language} />)}
          {activeTab === 'revenue' && (console.log('AUDIT_PAGE_VIEW','revenue'), renderRevenue())}
          {activeTab === 'audit' && (
            userProfile?.role === 'admin' ? (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-nzoo-dark">Journal d'audit</h3>
                <AdminAuditLog actorRoleFilter="all" />
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 font-montserrat">
                    Accès Restreint
                  </h3>
                  <p className="text-gray-600 font-poppins max-w-md mx-auto">
                    Vous n'avez pas les permissions nécessaires pour accéder au journal d'audit. 
                    Cette fonctionnalité est réservée aux administrateurs uniquement.
                  </p>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-6 py-3 bg-gradient-to-r from-nzoo-dark to-nzoo-dark text-white rounded-lg hover:from-nzoo-dark/90 hover:to-nzoo-dark/90 transition-all duration-300 flex items-center space-x-2 mx-auto transform hover:scale-105"
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>Retour au Tableau de Bord</span>
                  </button>
                </div>
              </div>
            )
          )}
          {activeTab === 'clients' && userProfile?.role === 'admin' && (console.log('AUDIT_PAGE_VIEW','clients'), renderClients())}
          {activeTab === 'aiFollowUps' && <AIFollowUpManager language={language} />}
          {activeTab === 'profile' && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-6">
                {/* Avatar avec photo de profil actuelle */}
                <div className="relative">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    {userProfile?.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt="Photo de profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                  {userProfile?.avatar_url && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ Photo
                    </div>
                  )}
                </div>
                
                {/* Informations de base */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">{userProfile?.full_name}</h3>
                  <p className="text-gray-600">{userProfile?.email}</p>
                  {userProfile?.phone && (
                    <p className="text-gray-500 text-sm">📞 {userProfile.phone}</p>
                  )}
                  {userProfile?.company && (
                    <p className="text-gray-500 text-sm">🏢 {userProfile.company}</p>
                  )}
                </div>
                
                <div className="max-w-md mx-auto">
                  <p className="text-gray-600 mb-6">
                    Cliquez sur le bouton ci-dessous pour voir et modifier vos informations de profil
                  </p>
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 mx-auto transform hover:scale-105"
                  >
                    <User className="w-5 h-5" />
                    <span>Modifier Mon Profil</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'statistics' && (
            <div className="space-y-8">
              {/* Filtres de période pour les statistiques */}
              <div className="bg-nzoo-white rounded-2xl shadow-soft p-6 border border-nzoo-gray/20">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-nzoo-dark/70 mb-2 font-montserrat">Période d'analyse</label>
                    
                    {/* Sélection de période avec design amélioré */}
                    <div className="flex items-center gap-2 bg-nzoo-gray/10 px-4 py-3 rounded-lg border border-nzoo-gray/30">
                      <Calendar className="w-4 h-4 text-nzoo-dark/60" />
                      <span className="text-sm text-nzoo-dark/70 font-medium font-poppins">Période:</span>
                      <input
                        type="date"
                        value={statsStartDate}
                        onChange={(e) => {
                          setStatsStartDate(e.target.value);
                        }}
                        className="px-3 py-1 border border-nzoo-gray/30 rounded-md focus:ring-2 focus:ring-nzoo-dark focus:border-transparent text-sm bg-white"
                        placeholder="Date de début"
                      />
                      <span className="text-nzoo-dark/40 font-medium">à</span>
                      <input
                        type="date"
                        value={statsEndDate}
                        onChange={(e) => {
                          setStatsEndDate(e.target.value);
                        }}
                        className="px-3 py-1 border border-nzoo-gray/30 rounded-md focus:ring-2 focus:ring-nzoo-dark focus:border-transparent text-sm bg-white"
                        placeholder="Date de fin"
                      />
                    </div>
                    
                    <p className="text-xs text-nzoo-dark/50 mt-2 font-poppins">
                      {statsStartDate && statsEndDate 
                        ? `Statistiques du ${new Date(statsStartDate).toLocaleDateString('fr-FR')} au ${new Date(statsEndDate).toLocaleDateString('fr-FR')}`
                        : 'Sélectionnez une période pour voir les statistiques'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistiques détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-nzoo-white rounded-2xl shadow-soft p-6 border border-nzoo-gray/20">
                  <h4 className="text-sm font-semibold text-nzoo-dark/70 mb-2 font-montserrat">Taux de conversion</h4>
                  <p className="text-3xl font-bold text-green-600 font-montserrat">
                    {statsFilteredReservations.length > 0 ? 
                      ((statsFilteredReservations.filter(r => r.status === 'confirmed').length / statsFilteredReservations.length) * 100).toFixed(1) 
                      : 0}%
                  </p>
                </div>
                <div className="bg-nzoo-white rounded-2xl shadow-soft p-6 border border-nzoo-gray/20">
                  <h4 className="text-sm font-semibold text-nzoo-dark/70 mb-2 font-montserrat">Réservations en attente</h4>
                  <p className="text-3xl font-bold text-yellow-600 font-montserrat">
                    {statsFilteredReservations.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <div className="bg-nzoo-white rounded-2xl shadow-soft p-6 border border-nzoo-gray/20">
                  <h4 className="text-sm font-semibold text-nzoo-dark/70 mb-2 font-montserrat">Réservations annulées</h4>
                  <p className="text-3xl font-bold text-red-600 font-montserrat">
                    {statsFilteredReservations.filter(r => r.status === 'cancelled').length}
                  </p>
                </div>
                <div className="bg-nzoo-white rounded-2xl shadow-soft p-6 border border-nzoo-gray/20">
                  <h4 className="text-sm font-semibold text-nzoo-dark/70 mb-2 font-montserrat">Revenus moyens/client</h4>
                  <p className="text-3xl font-bold text-nzoo-dark font-montserrat">
                    ${(() => {
                      const totalRevenue = statsFilteredReservations.reduce((sum, r) => sum + Number(r.amount), 0);
                      const uniqueClients = new Set(statsFilteredReservations.map(r => r.email)).size;
                      return uniqueClients > 0 ? (totalRevenue / uniqueClients).toFixed(2) : '0.00';
                    })()}
                  </p>
                </div>
              </div>

              {/* Statistiques des notifications */}
              {userProfile && (
                <NotificationStats 
                  userRole={userProfile.role || 'clients'} 
                  userEmail={userProfile.email || ''} 
                />
              )}

              {/* Graphique des statuts */}
              <div className="bg-nzoo-white rounded-2xl shadow-soft p-6 border border-nzoo-gray/20">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-nzoo-dark font-montserrat">Répartition des Statuts</h3>
                  <button 
                    onClick={handleRefresh}
                    className="text-nzoo-dark hover:text-nzoo-dark-light p-2 rounded-xl hover:bg-nzoo-gray/20 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: 'Confirmées', value: statsFilteredReservations.filter(r => r.status === 'confirmed').length, color: '#10B981' },
                        { name: 'En attente', value: statsFilteredReservations.filter(r => r.status === 'pending').length, color: '#F59E0B' },
                        { name: 'Annulées', value: statsFilteredReservations.filter(r => r.status === 'cancelled').length, color: '#EF4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    >
                      {[
                        { name: 'Confirmées', value: statsFilteredReservations.filter(r => r.status === 'confirmed').length, color: '#10B981' },
                        { name: 'En attente', value: statsFilteredReservations.filter(r => r.status === 'pending').length, color: '#F59E0B' },
                        { name: 'Annulées', value: statsFilteredReservations.filter(r => r.status === 'cancelled').length, color: '#EF4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {/* Onglet utilisateurs */}
          {activeTab === 'users' && userProfile?.role === 'admin' && (
            <UserManagement language={language} />
          )}
          
          {/* Modal de revenus */}
          <RevenueModal
            isOpen={showRevenueModal}
            onClose={() => setShowRevenueModal(false)}
            language={language}
          />
          
          {/* Modal de profil */}
          {renderProfileModal()}
          
          {/* Notifications */}
          {notification && (
            <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : notification.type === 'error' 
                ? 'bg-red-500 text-white' 
                : 'bg-blue-500 text-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {notification.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
                  {notification.type === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
                  {notification.type === 'info' && <Info className="w-5 h-5 mr-2" />}
                  <span className="font-medium">{notification.message}</span>
                </div>
                <button
                  onClick={() => setNotification(null)}
                  className="ml-4 text-white hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
