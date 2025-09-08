import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Eye,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { mobileMoneyService, MobileMoneyPayment } from '../services/mobileMoneyService';

interface PaymentStats {
  total: number;
  pending: number;
  success: number;
  failed: number;
  totalAmount: number;
}

const MobileMoneyDashboard: React.FC = () => {
  const [payments, setPayments] = useState<MobileMoneyPayment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    total: 0,
    pending: 0,
    success: 0,
    failed: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<MobileMoneyPayment | null>(null);

  useEffect(() => {
    loadPayments();
    loadStats();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // En mode développement, on simule des données
      const mockPayments: MobileMoneyPayment[] = [
        {
          id: '1',
          transaction_id: 'TXN001',
          amount: 100,
          currency: 'EUR',
          phone_number: '0991234567',
          operator: 'ORANGE',
          status: 'SUCCESS',
          reservation_id: 'RES001',
          client_email: 'client1@example.com',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString(),
          payment_url: 'https://example.com/pay/1'
        },
        {
          id: '2',
          transaction_id: 'TXN002',
          amount: 150,
          currency: 'EUR',
          phone_number: '0997654321',
          operator: 'AIRTEL',
          status: 'PENDING',
          reservation_id: 'RES002',
          client_email: 'client2@example.com',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString(),
          payment_url: 'https://example.com/pay/2'
        },
        {
          id: '3',
          transaction_id: 'TXN003',
          amount: 75,
          currency: 'EUR',
          phone_number: '0991111111',
          operator: 'MPESE',
          status: 'FAILED',
          reservation_id: 'RES003',
          client_email: 'client3@example.com',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          updated_at: new Date(Date.now() - 7200000).toISOString(),
          error_message: 'Solde insuffisant'
        }
      ];

      setPayments(mockPayments);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des paiements:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const paymentStats = await mobileMoneyService.getPaymentStats();
      setStats(paymentStats);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des statistiques:', error);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter.toUpperCase();
    const matchesSearch = payment.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.phone_number.includes(searchTerm);
    
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      SUCCESS: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      FAILED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status === 'PENDING' ? 'En attente' : 
         status === 'SUCCESS' ? 'Réussi' : 
         status === 'FAILED' ? 'Échoué' : 'Annulé'}
      </span>
    );
  };

  const getOperatorBadge = (operator: string) => {
    const operatorConfig = {
      ORANGE: { color: 'bg-orange-100 text-orange-800', label: 'Orange Money' },
      AIRTEL: { color: 'bg-red-100 text-red-800', label: 'Airtel Money' },
      MPESE: { color: 'bg-green-100 text-green-800', label: 'M-Pesa' }
    };

    const config = operatorConfig[operator as keyof typeof operatorConfig] || operatorConfig.ORANGE;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleRefresh = () => {
    loadPayments();
    loadStats();
  };

  const handlePaymentDetails = (payment: MobileMoneyPayment) => {
    setSelectedPayment(payment);
  };

  const closePaymentDetails = () => {
    setSelectedPayment(null);
  };

  const exportPayments = () => {
    const csvContent = [
      ['Transaction ID', 'Montant', 'Devise', 'Opérateur', 'Statut', 'Client', 'Date'],
      ...filteredPayments.map(p => [
        p.transaction_id,
        p.amount.toString(),
        p.currency,
        p.operator,
        p.status,
        p.client_email,
        new Date(p.created_at).toLocaleDateString('fr-FR')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paiements_mobile_money_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Chargement des paiements...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord Mobile Money</h2>
              <p className="text-gray-600">Gestion des paiements par mobile money</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-600 font-medium">En attente</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Réussis</p>
                <p className="text-2xl font-bold text-green-900">{stats.success}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <XCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-600 font-medium">Échoués</p>
                <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-600 font-bold text-sm">€</span>
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Montant total</p>
                <p className="text-2xl font-bold text-purple-900">{stats.totalAmount} €</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="success">Réussis</option>
                <option value="failed">Échoués</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par email, ID ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
            <button
              onClick={exportPayments}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des paiements */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opérateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 font-mono">
                      {payment.transaction_id}
                    </div>
                    <div className="text-sm text-gray-500">
                      Réservation: {payment.reservation_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {payment.amount} {payment.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getOperatorBadge(payment.operator)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.client_email}</div>
                    <div className="text-sm text-gray-500">{payment.phone_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handlePaymentDetails(payment)}
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun paiement trouvé</p>
          </div>
        )}
      </div>

      {/* Modal de détails du paiement */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Détails du Paiement
              </h3>
              <button
                onClick={closePaymentDetails}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedPayment.transaction_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Montant</label>
                  <p className="text-sm text-gray-900">{selectedPayment.amount} {selectedPayment.currency}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Opérateur</label>
                  <div className="mt-1">{getOperatorBadge(selectedPayment.operator)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client</label>
                  <p className="text-sm text-gray-900">{selectedPayment.client_email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <p className="text-sm text-gray-900">{selectedPayment.phone_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Réservation</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedPayment.reservation_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de création</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedPayment.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>

              {selectedPayment.error_message && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-red-700 mb-2">Message d'erreur</label>
                  <p className="text-sm text-red-600">{selectedPayment.error_message}</p>
                </div>
              )}

              {selectedPayment.payment_url && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-blue-700 mb-2">URL de paiement</label>
                  <a
                    href={selectedPayment.payment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 break-all"
                  >
                    {selectedPayment.payment_url}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closePaymentDetails}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMoneyDashboard;









