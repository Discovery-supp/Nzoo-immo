import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, TrendingUp, Download, Filter, RefreshCw, User, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useReservations } from '../hooks/useReservations';
import { useAuth } from '../hooks/useAuth';

interface RevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'fr' | 'en';
}

interface RevenueFilters {
  period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  services: string[];
  groupBy: 'day' | 'week' | 'month' | 'service';
}

const RevenueModal: React.FC<RevenueModalProps> = ({ isOpen, onClose, language }) => {
  const { reservations, loading, refetch } = useReservations();
  const { user } = useAuth(); // Ajouter l'import du hook useAuth
  const [filters, setFilters] = useState<RevenueFilters>({
    period: 'month',
    services: ['coworking', 'bureau-prive', 'salle-reunion', 'domiciliation'],
    groupBy: 'day'
  });

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalReservations: 0,
    averageRevenue: 0,
    topService: '',
    topServiceRevenue: 0
  });

  // Services disponibles
  const availableServices = [
    { id: 'coworking', name: 'Coworking', color: '#3B82F6' },
    { id: 'bureau-prive', name: 'Bureau Privé', color: '#10B981' },
    { id: 'salle-reunion', name: 'Salle de Réunion', color: '#F59E0B' },
    { id: 'domiciliation', name: 'Domiciliation', color: '#8B5CF6' }
  ];

  // Calculer les données de revenus basées sur les filtres
  const calculateRevenueData = () => {
    if (!reservations.length) {
      console.log('Aucune réservation trouvée pour l\'utilisateur:', user?.email);
      return;
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    // Définir la période
    switch (filters.period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'week':
        // 7 derniers jours
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'month':
        // Mois en cours
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'quarter':
        // Trimestre en cours
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        endDate = new Date(now.getFullYear(), quarterStart + 3, 0, 23, 59, 59);
        break;
      case 'year':
        // Année en cours
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      case 'custom':
        startDate = filters.startDate ? new Date(filters.startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = filters.endDate ? new Date(filters.endDate + 'T23:59:59') : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    // Filtrer les réservations
    const filteredReservations = reservations.filter(reservation => {
      const reservationDate = new Date(reservation.created_at);
      const isInPeriod = reservationDate >= startDate && reservationDate <= endDate;
      const isSelectedService = filters.services.includes(reservation.space_type);
      return isInPeriod && isSelectedService;
    });

    // Calculer les statistiques
    const totalRevenue = filteredReservations.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalReservations = filteredReservations.length;
    const averageRevenue = totalReservations > 0 ? totalRevenue / totalReservations : 0;

    // Trouver le service le plus rentable
    const serviceRevenue = availableServices.map(service => ({
      service: service.id,
      revenue: filteredReservations
        .filter(r => r.space_type === service.id)
        .reduce((sum, r) => sum + Number(r.amount), 0)
    }));

    const topService = serviceRevenue.reduce((max, current) => 
      current.revenue > max.revenue ? current : max
    );

    setSummary({
      totalRevenue,
      totalReservations,
      averageRevenue,
      topService: availableServices.find(s => s.id === topService.service)?.name || '',
      topServiceRevenue: topService.revenue
    });

    // Générer les données pour les graphiques
    if (filters.groupBy === 'service') {
      const serviceData = availableServices
        .filter(service => filters.services.includes(service.id))
        .map(service => ({
          name: service.name,
          revenue: filteredReservations
            .filter(r => r.space_type === service.id)
            .reduce((sum, r) => sum + Number(r.amount), 0),
          reservations: filteredReservations.filter(r => r.space_type === service.id).length,
          color: service.color
        }))
        .filter(item => item.revenue > 0);

      setRevenueData(serviceData);
    } else {
      // Grouper par période (jour, semaine, mois)
      const periodData: any[] = [];
      
      // Déterminer le nombre de périodes à afficher selon la période sélectionnée
      let numberOfPeriods = 0;
      let periodIncrement = 1;
      
      switch (filters.groupBy) {
        case 'day':
          // Pour les périodes courtes, afficher tous les jours
          if (filters.period === 'today') {
            numberOfPeriods = 1;
          } else if (filters.period === 'week') {
            numberOfPeriods = 7;
          } else if (filters.period === 'month') {
            numberOfPeriods = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
          } else {
            numberOfPeriods = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          }
          periodIncrement = 1;
          break;
        case 'week':
          numberOfPeriods = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
          periodIncrement = 7;
          break;
        case 'month':
          numberOfPeriods = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                           (endDate.getMonth() - startDate.getMonth()) + 1;
          periodIncrement = 30;
          break;
      }

      // Générer les données pour chaque période
      for (let i = 0; i < numberOfPeriods; i++) {
        const periodStart = new Date(startDate);
        let periodEnd = new Date(startDate);

        switch (filters.groupBy) {
          case 'day':
            periodStart.setDate(startDate.getDate() + i);
            periodEnd.setDate(startDate.getDate() + i + 1);
            break;
          case 'week':
            periodStart.setDate(startDate.getDate() + (i * 7));
            periodEnd.setDate(startDate.getDate() + ((i + 1) * 7));
            break;
          case 'month':
            periodStart.setMonth(startDate.getMonth() + i);
            periodEnd.setMonth(startDate.getMonth() + i + 1);
            break;
        }

        const periodReservations = filteredReservations.filter(r => {
          const reservationDate = new Date(r.created_at);
          return reservationDate >= periodStart && reservationDate < periodEnd;
        });

        const periodRevenue = periodReservations.reduce((sum, r) => sum + Number(r.amount), 0);

        // Formater la date d'affichage
        let displayDate = '';
        switch (filters.groupBy) {
          case 'day':
            displayDate = periodStart.toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit' 
            });
            break;
          case 'week':
            const weekEnd = new Date(periodStart);
            weekEnd.setDate(periodStart.getDate() + 6);
            displayDate = `${periodStart.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} - ${weekEnd.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`;
            break;
          case 'month':
            displayDate = periodStart.toLocaleDateString('fr-FR', { 
              month: 'long', 
              year: 'numeric' 
            });
            break;
        }

        periodData.push({
          date: periodStart.toISOString().split('T')[0],
          displayDate,
          revenue: periodRevenue,
          reservations: periodReservations.length
        });
      }

      setRevenueData(periodData);
    }
  };

  useEffect(() => {
    if (isOpen) {
      console.log('🔄 Recalculating revenue data with filters:', filters);
      calculateRevenueData();
    }
  }, [isOpen, filters, reservations]);

  const handleServiceToggle = (serviceId: string) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const handleExport = () => {
    // Logique d'export (CSV, Excel, etc.)
    console.log('Exporting revenue data:', { filters, revenueData, summary });
    alert('Fonctionnalité d\'export à implémenter');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user?.role === 'clients' ? 'Mes Revenus' : 'Analyse des Revenus'}
              </h2>
              <p className="text-gray-600">
                {user?.role === 'clients' 
                  ? 'Analysez vos revenus personnels par période et services' 
                  : 'Analysez vos revenus par période et services'
                }
              </p>
              {user?.role === 'clients' && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <User className="w-3 h-3 mr-1" />
                    Vos réservations uniquement
                  </span>
                  <span className="text-sm text-gray-500">
                    {reservations.length} réservation{reservations.length > 1 ? 's' : ''} analysée{reservations.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {user?.role === 'admin' && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Toutes les réservations
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exporter
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

                     {/* Filtres */}
           <div className="bg-gray-50 rounded-xl p-6 mb-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               {/* Période */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
                 <select
                   value={filters.period}
                   onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value as any }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="today">Aujourd'hui</option>
                   <option value="week">Cette semaine (7 jours)</option>
                   <option value="month">Ce mois</option>
                   <option value="quarter">Ce trimestre</option>
                   <option value="year">Cette année</option>
                   <option value="custom">Période personnalisée</option>
                 </select>
                 <p className="text-xs text-gray-500 mt-1">
                   {filters.period === 'today' && 'Revenus du jour en cours'}
                   {filters.period === 'week' && 'Revenus des 7 derniers jours'}
                   {filters.period === 'month' && 'Revenus du mois en cours'}
                   {filters.period === 'quarter' && 'Revenus du trimestre en cours'}
                   {filters.period === 'year' && 'Revenus de l\'année en cours'}
                   {filters.period === 'custom' && 'Revenus de la période sélectionnée'}
                 </p>
               </div>

              {/* Période personnalisée */}
              {filters.period === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                    <input
                      type="date"
                      value={filters.startDate || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                    <input
                      type="date"
                      value={filters.endDate || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

                             {/* Grouper par */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Grouper par</label>
                 <select
                   value={filters.groupBy}
                   onChange={(e) => setFilters(prev => ({ ...prev, groupBy: e.target.value as any }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="day">Jour</option>
                   <option value="week">Semaine</option>
                   <option value="month">Mois</option>
                   <option value="service">Service</option>
                 </select>
                 <p className="text-xs text-gray-500 mt-1">
                   {filters.groupBy === 'day' && 'Données groupées par jour'}
                   {filters.groupBy === 'week' && 'Données groupées par semaine'}
                   {filters.groupBy === 'month' && 'Données groupées par mois'}
                   {filters.groupBy === 'service' && 'Données groupées par service'}
                 </p>
               </div>
            </div>

            {/* Services */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
              <div className="flex flex-wrap gap-2">
                {availableServices.map(service => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceToggle(service.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.services.includes(service.id)
                        ? 'bg-nzoo-gray/20 text-nzoo-dark border border-nzoo-gray/30'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {service.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

                     {/* Indicateur de période active */}
           <div className="bg-nzoo-gray/10 rounded-xl p-4 border border-nzoo-gray/20 mb-4">
             <div className="flex items-center justify-between">
               <div>
                                   <h4 className="text-sm font-medium text-nzoo-dark">Période analysée</h4>
                                   <p className="text-lg font-semibold text-nzoo-dark">
                   {filters.period === 'today' && 'Aujourd\'hui'}
                   {filters.period === 'week' && 'Cette semaine (7 derniers jours)'}
                   {filters.period === 'month' && 'Ce mois'}
                   {filters.period === 'quarter' && 'Ce trimestre'}
                   {filters.period === 'year' && 'Cette année'}
                   {filters.period === 'custom' && `Du ${filters.startDate} au ${filters.endDate}`}
                 </p>
               </div>
               <div className="text-right">
                 <p className="text-sm text-nzoo-dark">Groupement</p>
                                   <p className="font-medium text-nzoo-dark">
                   {filters.groupBy === 'day' && 'Par jour'}
                   {filters.groupBy === 'week' && 'Par semaine'}
                   {filters.groupBy === 'month' && 'Par mois'}
                   {filters.groupBy === 'service' && 'Par service'}
                 </p>
               </div>
             </div>
           </div>

           {/* Résumé */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-nzoo-gray/10 rounded-xl p-4 border border-nzoo-gray/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-nzoo-dark">
                    {user?.role === 'clients' ? 'Mes Revenus Totaux' : 'Revenus Totaux'}
                  </p>
                  <p className="text-2xl font-bold text-nzoo-dark">${summary.totalRevenue.toFixed(2)}</p>
                </div>
                                  <DollarSign className="w-8 h-8 text-nzoo-dark" />
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    {user?.role === 'clients' ? 'Mes Réservations' : 'Réservations'}
                  </p>
                  <p className="text-2xl font-bold text-green-900">{summary.totalReservations}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    {user?.role === 'clients' ? 'Ma Moyenne' : 'Moyenne'}
                  </p>
                  <p className="text-2xl font-bold text-purple-900">${summary.averageRevenue.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    {user?.role === 'clients' ? 'Mon Meilleur Service' : 'Meilleur Service'}
                  </p>
                  <p className="text-lg font-bold text-orange-900">{summary.topService}</p>
                  <p className="text-sm text-orange-700">${summary.topServiceRevenue.toFixed(2)}</p>
                </div>
                <Filter className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Message si pas de données */}
          {reservations.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center mb-6">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                {user?.role === 'clients' ? 'Aucune réservation trouvée' : 'Aucune donnée disponible'}
              </h3>
              <p className="text-blue-700">
                {user?.role === 'clients' 
                  ? 'Vous n\'avez pas encore de réservations. Créez votre première réservation pour voir vos revenus ici.'
                  : 'Aucune réservation trouvée pour la période sélectionnée.'
                }
              </p>
            </div>
          )}

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique principal */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {filters.groupBy === 'service' 
                  ? (user?.role === 'clients' ? 'Mes Revenus par Service' : 'Revenus par Service')
                  : (user?.role === 'clients' ? 'Évolution de Mes Revenus' : 'Évolution des Revenus')
                }
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                {filters.groupBy === 'service' ? (
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenus']} />
                    <Bar dataKey="revenue" fill="#3B82F6" />
                  </BarChart>
                ) : (
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayDate" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenus']} />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Graphique en secteurs */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {user?.role === 'clients' ? 'Répartition de Mes Revenus par Service' : 'Répartition par Service'}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={availableServices
                      .filter(service => filters.services.includes(service.id))
                      .map(service => ({
                        name: service.name,
                        value: revenueData.find(d => d.name === service.name)?.revenue || 0,
                        color: service.color
                      }))
                      .filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: $${value}`}
                  >
                    {availableServices
                      .filter(service => filters.services.includes(service.id))
                      .map(service => ({
                        name: service.name,
                        value: revenueData.find(d => d.name === service.name)?.revenue || 0,
                        color: service.color
                      }))
                      .filter(item => item.value > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenus']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tableau détaillé */}
          <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {user?.role === 'clients' ? 'Détails de Mes Revenus' : 'Détails des Revenus'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {filters.groupBy === 'service' ? 'Service' : 'Période'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenus
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Réservations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Moyenne
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revenueData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {filters.groupBy === 'service' ? item.name : item.displayDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.reservations}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.reservations > 0 ? (item.revenue / item.reservations).toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueModal;
