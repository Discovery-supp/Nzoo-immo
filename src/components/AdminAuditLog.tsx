import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  Shield,
  Crown,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  DollarSign,
  Building,
  Mail,
  Phone,
  Settings,
  LogOut,
  LogIn,
  Plus,
  Edit,
  Trash,
  CreditCard,
  Ban
} from 'lucide-react';
import { AuditService, AuditEntry, AuditAction } from '../services/auditService';

interface AdminAuditLogProps {
  actorRoleFilter?: 'all' | 'admin' | 'staff' | 'system';
  limit?: number;
}

const AdminAuditLog: React.FC<AdminAuditLogProps> = ({ 
  actorRoleFilter = 'all', 
  limit = 100 
}) => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'staff' | 'system'>(actorRoleFilter);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Charger les logs
  const loadLogs = () => {
    setLoading(true);
    try {
      const allLogs = AuditService.list({ limit });
      setLogs(allLogs);
      setFilteredLogs(allLogs);
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Appliquer les filtres
  const applyFilters = () => {
    let filtered = [...logs];

    // Filtre par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.target?.toLowerCase().includes(term) ||
        log.actorId.toLowerCase().includes(term) ||
        (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(term))
      );
    }

    // Filtre par action
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Filtre par rôle
    if (roleFilter !== 'all') {
      filtered = filtered.filter(log => log.actorRole === roleFilter);
    }

    // Filtre par date
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

      filtered = filtered.filter(log => {
        const logDate = new Date(log.createdAt);
        switch (dateFilter) {
          case 'today':
            return logDate >= today;
          case 'week':
            return logDate >= weekAgo;
          case 'month':
            return logDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredLogs(filtered);
  };

  // Effet pour appliquer les filtres quand ils changent
  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, actionFilter, roleFilter, dateFilter]);

  // Charger les logs au montage
  useEffect(() => {
    loadLogs();
  }, []);

  // Exporter les logs
  const exportLogs = () => {
    const csvData = filteredLogs.map(log => ({
      'Date': new Date(log.createdAt).toLocaleString('fr-FR'),
      'Utilisateur': log.actorId,
      'Rôle': log.actorRole,
      'Action': log.action,
      'Cible': log.target || '',
      'Métadonnées': log.metadata ? JSON.stringify(log.metadata) : '',
      'IP': log.ip || '',
      'User Agent': log.userAgent || ''
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Vider les logs
  const clearLogs = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider tous les logs d\'audit ? Cette action est irréversible.')) {
      AuditService.clear();
      loadLogs();
    }
  };

  // Obtenir l'icône pour une action
  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case 'LOGIN':
        return <LogIn className="w-4 h-4 text-green-600" />;
      case 'LOGOUT':
        return <LogOut className="w-4 h-4 text-red-600" />;
      case 'CREATE':
        return <Plus className="w-4 h-4 text-blue-600" />;
      case 'UPDATE':
        return <Edit className="w-4 h-4 text-yellow-600" />;
      case 'DELETE':
        return <Trash className="w-4 h-4 text-red-600" />;
      case 'PAYMENT_ATTEMPT':
        return <CreditCard className="w-4 h-4 text-orange-600" />;
      case 'PAYMENT_SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PAYMENT_FAILED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'RESERVATION_CREATE':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'RESERVATION_CANCEL':
        return <Ban className="w-4 h-4 text-red-600" />;
      case 'PROFILE_UPDATE':
        return <User className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  // Obtenir l'icône pour un rôle
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'staff':
        return <Shield className="w-4 h-4 text-blue-600" />;
      case 'system':
        return <Settings className="w-4 h-4 text-gray-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  // Obtenir la couleur pour un rôle
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'staff':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'system':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir la couleur pour une action
  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case 'LOGIN':
      case 'PAYMENT_SUCCESS':
      case 'RESERVATION_CREATE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'LOGOUT':
      case 'DELETE':
      case 'PAYMENT_FAILED':
      case 'RESERVATION_CANCEL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CREATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'UPDATE':
      case 'PROFILE_UPDATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PAYMENT_ATTEMPT':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Traduire les actions
  const translateAction = (action: AuditAction) => {
    const translations: Record<AuditAction, string> = {
      LOGIN: 'Connexion',
      LOGOUT: 'Déconnexion',
      CREATE: 'Création',
      UPDATE: 'Modification',
      DELETE: 'Suppression',
      PAYMENT_ATTEMPT: 'Tentative de paiement',
      PAYMENT_SUCCESS: 'Paiement réussi',
      PAYMENT_FAILED: 'Paiement échoué',
      RESERVATION_CREATE: 'Création réservation',
      RESERVATION_CANCEL: 'Annulation réservation',
      PROFILE_UPDATE: 'Mise à jour profil'
    };
    return translations[action] || action;
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-montserrat">Journal d'Audit</h2>
            <p className="text-gray-600 font-poppins">Suivi de toutes les activités du système</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadLogs}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
            <button
              onClick={exportLogs}
              className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
            <button
              onClick={clearLogs}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Vider</span>
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Logs Filtrés</p>
                <p className="text-2xl font-bold text-gray-900">{filteredLogs.length}</p>
              </div>
              <Filter className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(log => {
                    const today = new Date();
                    const logDate = new Date(log.createdAt);
                    return logDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cette Semaine</p>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.filter(log => {
                    const now = new Date();
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    const logDate = new Date(log.createdAt);
                    return logDate >= weekAgo;
                  }).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft p-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-montserrat">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher dans les logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtre par action */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-montserrat">Action</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as AuditAction | 'all')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les actions</option>
              <option value="LOGIN">Connexion</option>
              <option value="LOGOUT">Déconnexion</option>
              <option value="CREATE">Création</option>
              <option value="UPDATE">Modification</option>
              <option value="DELETE">Suppression</option>
              <option value="PAYMENT_ATTEMPT">Tentative de paiement</option>
              <option value="PAYMENT_SUCCESS">Paiement réussi</option>
              <option value="PAYMENT_FAILED">Paiement échoué</option>
              <option value="RESERVATION_CREATE">Création réservation</option>
              <option value="RESERVATION_CANCEL">Annulation réservation</option>
              <option value="PROFILE_UPDATE">Mise à jour profil</option>
            </select>
          </div>

          {/* Filtre par rôle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-montserrat">Rôle</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'staff' | 'system')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="staff">Staff</option>
              <option value="system">Système</option>
            </select>
          </div>

          {/* Filtre par date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 font-montserrat">Période</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | 'week' | 'month')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des logs */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg font-semibold text-gray-900 font-montserrat">Logs d'Audit</h3>
          <p className="text-gray-600 text-sm font-poppins mt-1">
            {filteredLogs.length} log{filteredLogs.length > 1 ? 's' : ''} trouvé{filteredLogs.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="rounded-full h-6 w-6 border-b-2 border-blue-600 animate-spin"></div>
                <span className="text-gray-500">Chargement des logs...</span>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 font-montserrat">
                Aucun log trouvé
              </h3>
              <p className="text-gray-600 font-poppins">
                Aucun log d'audit ne correspond aux critères de recherche.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-montserrat">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-montserrat">Utilisateur</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-montserrat">Rôle</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-montserrat">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-montserrat">Cible</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-montserrat">Détails</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 font-montserrat">
                        {new Date(log.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-gray-500 font-poppins">
                        {new Date(log.createdAt).toLocaleTimeString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 font-montserrat">
                        {log.actorId}
                      </div>
                      {log.ip && (
                        <div className="text-sm text-gray-500 font-poppins">
                          IP: {log.ip}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getRoleColor(log.actorRole)}`}>
                        {getRoleIcon(log.actorRole)}
                        <span className="ml-1 font-montserrat">
                          {log.actorRole === 'admin' ? 'Admin' : 
                           log.actorRole === 'staff' ? 'Staff' : 
                           log.actorRole === 'system' ? 'Système' : log.actorRole}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                        <span className="ml-1 font-montserrat">{translateAction(log.action)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 font-montserrat">
                        {log.target || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-poppins">
                        {log.metadata ? (
                          <details className="cursor-pointer">
                            <summary className="text-blue-600 hover:text-blue-800">
                              Voir les détails
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-gray-500">Aucun détail</span>
                        )}
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
};

export default AdminAuditLog;
