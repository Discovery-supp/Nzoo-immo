import React, { useState } from 'react';
import { Smartphone, CreditCard, BarChart3, Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileMoneyPaymentForm from '../components/MobileMoneyPaymentForm';
import MobileMoneyDashboard from '../components/MobileMoneyDashboard';
import { MobileMoneyPayment } from '../services/mobileMoneyService';

const MobileMoneyDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'payment' | 'dashboard' | 'settings'>('payment');
  const [demoPayment, setDemoPayment] = useState<MobileMoneyPayment | null>(null);

  const tabs = [
    {
      id: 'payment',
      label: 'Nouveau Paiement',
      icon: CreditCard,
      description: 'Créer un nouveau paiement mobile money'
    },
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      icon: BarChart3,
      description: 'Gérer et surveiller tous les paiements'
    },
    {
      id: 'settings',
      label: 'Configuration',
      icon: Settings,
      description: 'Paramètres et configuration CinetPay'
    }
  ];

  const handlePaymentSuccess = (payment: MobileMoneyPayment) => {
    setDemoPayment(payment);
    console.log('✅ Paiement réussi:', payment);
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ Erreur de paiement:', error);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'payment':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Démonstration Paiement Mobile Money
              </h2>
              <p className="text-gray-600 text-lg">
                Testez le système de paiement mobile money avec des données simulées
              </p>
            </div>

            <MobileMoneyPaymentForm
              reservationId="DEMO-001"
              amount={100}
              currency="EUR"
              clientEmail="demo@nzooimmo.com"
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />

            {demoPayment && (
              <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Paiement de Démonstration Créé !
                  </h3>
                  <p className="text-green-700 mb-4">
                    Ce paiement est simulé pour la démonstration. En production, il serait traité par CinetPay.
                  </p>
                  <div className="bg-white rounded-xl p-4 inline-block">
                    <p className="text-sm text-gray-600">
                      <strong>ID:</strong> {demoPayment.id} | 
                      <strong> Statut:</strong> {demoPayment.status} | 
                      <strong> Montant:</strong> {demoPayment.amount} {demoPayment.currency}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'dashboard':
        return <MobileMoneyDashboard />;

      case 'settings':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuration CinetPay</h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Variables d'Environnement</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        REACT_APP_CINETPAY_API_KEY
                      </label>
                      <input
                        type="text"
                        placeholder="Votre clé API CinetPay"
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        REACT_APP_CINETPAY_SITE_ID
                      </label>
                      <input
                        type="text"
                        placeholder="Votre ID de site CinetPay"
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        REACT_APP_CINETPAY_ENVIRONMENT
                      </label>
                      <select className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm">
                        <option value="TEST">TEST (Développement)</option>
                        <option value="PROD">PROD (Production)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Configuration de la Base de Données</h3>
                  <p className="text-green-700 text-sm mb-4">
                    Assurez-vous que la table <code className="bg-green-100 px-2 py-1 rounded">mobile_money_payments</code> existe dans votre base de données Supabase.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <pre className="text-sm text-green-800 overflow-x-auto">
{`-- Créer la table pour les paiements mobile money
CREATE TABLE IF NOT EXISTS mobile_money_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  phone_number TEXT NOT NULL,
  operator TEXT NOT NULL CHECK (operator IN ('ORANGE', 'AIRTEL', 'MPESE')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')),
  reservation_id UUID REFERENCES reservations(id),
  client_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_url TEXT,
  error_message TEXT
);`}
                    </pre>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-4">Webhooks et Notifications</h3>
                  <p className="text-yellow-700 text-sm mb-4">
                    Configurez les URLs de retour et de notification dans votre compte CinetPay :
                  </p>
                  <ul className="text-yellow-700 text-sm space-y-2">
                    <li>• <strong>URL de retour :</strong> <code className="bg-yellow-100 px-2 py-1 rounded">https://votre-domaine.com/payment/success</code></li>
                    <li>• <strong>URL d'annulation :</strong> <code className="bg-yellow-100 px-2 py-1 rounded">https://votre-domaine.com/payment/cancel</code></li>
                    <li>• <strong>URL de notification :</strong> <code className="bg-yellow-100 px-2 py-1 rounded">https://votre-domaine.com/api/payment/webhook</code></li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4">Test et Développement</h3>
                  <p className="text-purple-700 text-sm mb-4">
                    En mode développement, le système simule les paiements. Pour tester en production :
                  </p>
                  <ol className="text-purple-700 text-sm space-y-2 list-decimal list-inside">
                    <li>Configurez vos variables d'environnement CinetPay</li>
                    <li>Créez la table de base de données</li>
                    <li>Testez avec de petits montants</li>
                    <li>Vérifiez les webhooks et notifications</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* En-tête */}
      <div className="bg-white shadow-soft border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBackToHome}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </button>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Mobile Money Demo</h1>
                  <p className="text-sm text-gray-600">Système de paiement mobile money</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Pied de page informatif */}
      <div className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Système de Paiement Mobile Money
            </h3>
            <p className="text-gray-600 mb-4">
              Cette démonstration montre comment intégrer les paiements mobile money dans votre application N'zoo Immo.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span>✅ Orange Money</span>
              <span>✅ Airtel Money</span>
              <span>✅ M-Pesa</span>
              <span>✅ Intégration CinetPay</span>
              <span>✅ Gestion complète des transactions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMoneyDemoPage;






