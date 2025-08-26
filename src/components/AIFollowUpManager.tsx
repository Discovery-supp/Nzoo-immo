import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Users, 
  Mail, 
  MessageSquare, 
  Bell, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  Send,
  Eye,
  BarChart3,
  Settings,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { 
  aiFollowUpService, 
  FOLLOW_UP_STRATEGIES,
  ClientInsight,
  AIGeneratedFollowUp,
  FollowUpStrategy
} from '../services/aiFollowUpService';
import { showNotification } from '../utils/notificationUtils';

interface AIFollowUpManagerProps {
  language?: 'fr' | 'en';
}

const AIFollowUpManager: React.FC<AIFollowUpManagerProps> = ({ language = 'fr' }) => {
  const { isAdmin, user } = useAuth();
  const { t } = useTranslation(language);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'followups' | 'strategies' | 'settings'>('overview');
  const [clientInsights, setClientInsights] = useState<ClientInsight[]>([]);
  const [followUps, setFollowUps] = useState<AIGeneratedFollowUp[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [autoMode, setAutoMode] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0,
    highRiskClients: 0,
    lowEngagementClients: 0,
    pendingFollowUps: 0,
    sentToday: 0
  });





  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadClientInsights();
      loadFollowUps();
    }
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Simuler le chargement des statistiques
      const mockStats = {
        totalClients: 45,
        highRiskClients: 12,
        lowEngagementClients: 8,
        pendingFollowUps: 23,
        sentToday: 5
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      showNotification('error', t('error'));
    } finally {
      setLoading(false);
    }
  };

  const loadClientInsights = async () => {
    try {
      setLoading(true);
      // Simuler le chargement des insights clients
      const mockInsights: ClientInsight[] = [
        {
          clientId: 'client1@example.com',
          riskScore: 75,
          engagementScore: 30,
          lifetimeValue: 1200,
          preferredChannels: ['email', 'sms'],
          bestContactTimes: ['09:00', '14:00'],
          interests: ['coworking', 'bureau_prive'],
          lastActivity: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          recommendedStrategy: 'high_value_client_retention'
        },
        {
          clientId: 'client2@example.com',
          riskScore: 45,
          engagementScore: 65,
          lifetimeValue: 350,
          preferredChannels: ['email'],
          bestContactTimes: ['10:00', '15:00'],
          interests: ['salle_reunion'],
          lastActivity: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          recommendedStrategy: 'seasonal_promotion'
        }
      ];
      setClientInsights(mockInsights);
    } catch (error) {
      console.error('Erreur lors du chargement des insights clients:', error);
      showNotification('error', t('error'));
    } finally {
      setLoading(false);
    }
  };

  const loadFollowUps = async () => {
    try {
      setLoading(true);
      // Simuler le chargement des relances
      const mockFollowUps: AIGeneratedFollowUp[] = [
        {
          id: 'followup1',
          clientId: 'client1@example.com',
          strategyId: 'high_value_client_retention',
          subject: 'Offre exclusive pour nos clients VIP ! ⭐',
          message: 'Cher client VIP, En tant que client fidèle de N\'zoo Immo...',
          channel: 'email',
          scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          priority: 'urgent',
          aiConfidence: 85,
          generatedAt: new Date(),
          status: 'pending'
        },
        {
          id: 'followup2',
          clientId: 'client2@example.com',
          strategyId: 'seasonal_promotion',
          subject: 'Nouvelle offre spéciale N\'zoo Immo ! 🎉',
          message: 'Bonjour ! Découvrez nos nouvelles offres...',
          channel: 'email',
          scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          priority: 'medium',
          aiConfidence: 78,
          generatedAt: new Date(),
          status: 'pending'
        }
      ];
      setFollowUps(mockFollowUps);
    } catch (error) {
      console.error('Erreur lors du chargement des relances:', error);
      showNotification('error', t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFollowUps = async () => {
    try {
      setLoading(true);
      const newFollowUps = await aiFollowUpService.generateAutomaticFollowUps();
      setFollowUps(prev => [...prev, ...newFollowUps]);
      showNotification('success', `${newFollowUps.length} relances générées avec succès`);
      loadStats();
    } catch (error) {
      console.error('Erreur lors de la génération des relances:', error);
      showNotification('error', 'Erreur lors de la génération des relances');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFollowUp = async (followUpId: string) => {
    try {
      setLoading(true);
      const success = await aiFollowUpService.sendFollowUp(followUpId);
      if (success) {
        setFollowUps(prev => prev.map(f => 
          f.id === followUpId ? { ...f, status: 'sent' as const } : f
        ));
        showNotification('success', 'Relance envoyée avec succès');
      } else {
        showNotification('error', 'Erreur lors de l\'envoi de la relance');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la relance:', error);
      showNotification('error', 'Erreur lors de l\'envoi de la relance');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoMode = () => {
    setAutoMode(!autoMode);
    showNotification(
      autoMode ? 'info' : 'success',
      autoMode ? 'Mode automatique arrêté' : 'Mode automatique démarré'
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'push': return <Bell className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Accès réservé aux administrateurs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">{t('title')}</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleToggleAutoMode}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              autoMode 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {autoMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{autoMode ? t('stopAutoMode') : t('startAutoMode')}</span>
          </button>
          <button
            onClick={handleGenerateFollowUps}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('generateFollowUps')}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        {[
          { id: 'overview', icon: BarChart3, label: t('overview') },
          { id: 'clients', icon: Users, label: t('clients') },
          { id: 'followups', icon: Send, label: t('followups') },
          { id: 'strategies', icon: Target, label: t('strategies') },
          { id: 'settings', icon: Settings, label: t('settings') }
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('totalClients')}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('highRiskClients')}</p>
                    <p className="text-2xl font-bold text-red-600">{stats.highRiskClients}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('lowEngagementClients')}</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.lowEngagementClients}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('pendingFollowUps')}</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pendingFollowUps}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t('sentToday')}</p>
                    <p className="text-2xl font-bold text-green-600">{stats.sentToday}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">{t('clientAnalysis')}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('riskScore')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('engagementScore')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('lifetimeValue')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('lastActivity')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('nextFollowUp')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientInsights.map((insight) => (
                      <tr key={insight.clientId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{insight.clientId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            insight.riskScore > 70 ? 'bg-red-100 text-red-800' :
                            insight.riskScore > 50 ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {insight.riskScore}/100
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            insight.engagementScore > 70 ? 'bg-green-100 text-green-800' :
                            insight.engagementScore > 40 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {insight.engagementScore}/100
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${insight.lifetimeValue}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {insight.lastActivity.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {insight.nextFollowUpDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedClient(insight.clientId)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {t('generateFollowUp')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'followups' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">{t('followups')}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('subject')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('channel')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('priority')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('status')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('scheduledDate')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {followUps.map((followUp) => (
                      <tr key={followUp.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{followUp.clientId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{followUp.subject}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getChannelIcon(followUp.channel)}
                            <span className="text-sm text-gray-900 capitalize">{followUp.channel}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(followUp.priority)}`}>
                            {followUp.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(followUp.status)}`}>
                            {followUp.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {followUp.scheduledDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {followUp.status === 'pending' && (
                              <button
                                onClick={() => handleSendFollowUp(followUp.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                {t('sendFollowUp')}
                              </button>
                            )}
                            <button className="text-blue-600 hover:text-blue-900">
                              {t('viewDetails')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'strategies' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {FOLLOW_UP_STRATEGIES.map((strategy) => (
                <div key={strategy.id} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{strategy.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(strategy.priority)}`}>
                      {strategy.priority}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">{t('triggerConditions')}</h4>
                      <div className="space-y-1">
                        {strategy.triggerConditions.map((condition, index) => (
                          <div key={index} className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                            {condition.type} {condition.operator} {condition.value}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">{t('aiPrompt')}</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                        {strategy.aiPrompt}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{t('cooldownDays')}: {strategy.cooldownDays} jours</span>
                      <div className="flex space-x-2">
                        {strategy.channels.map((channel) => (
                          <div key={channel} className="flex items-center space-x-1">
                            {getChannelIcon(channel)}
                            <span className="capitalize">{channel}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Paramètres IA</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration des seuils</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seuil de risque élevé
                      </label>
                      <input
                        type="number"
                        defaultValue={70}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seuil d'engagement faible
                      </label>
                      <input
                        type="number"
                        defaultValue={40}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jours d'inactivité critique
                      </label>
                      <input
                        type="number"
                        defaultValue={30}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Fréquence des relances</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Intervalle de vérification (minutes)
                      </label>
                      <input
                        type="number"
                        defaultValue={60}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Limite quotidienne de relances
                      </label>
                      <input
                        type="number"
                        defaultValue={50}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                    Sauvegarder les paramètres
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AIFollowUpManager;
