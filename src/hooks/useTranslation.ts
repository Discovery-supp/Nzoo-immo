import { useMemo } from 'react';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  fr: {
    // AI Follow-up Manager
    title: 'Relances Intelligentes IA',
    overview: 'Vue d\'ensemble',
    clients: 'Analyse Clients',
    followups: 'Relances',
    strategies: 'Stratégies',
    settings: 'Paramètres',
    totalClients: 'Total Clients',
    highRiskClients: 'Clients à Risque',
    lowEngagementClients: 'Faible Engagement',
    pendingFollowUps: 'Relances en Attente',
    sentToday: 'Envoyées Aujourd\'hui',
    generateFollowUps: 'Générer Relances',
    analyzeClients: 'Analyser Clients',
    autoMode: 'Mode Automatique',
    stopAutoMode: 'Arrêter Mode Auto',
    startAutoMode: 'Démarrer Mode Auto',
    clientAnalysis: 'Analyse Client',
    riskScore: 'Score de Risque',
    engagementScore: 'Score d\'Engagement',
    lifetimeValue: 'Valeur Vie',
    lastActivity: 'Dernière Activité',
    nextFollowUp: 'Prochaine Relance',
    recommendedStrategy: 'Stratégie Recommandée',
    generateFollowUp: 'Générer Relance',
    sendFollowUp: 'Envoyer Relance',
    viewDetails: 'Voir Détails',
    subject: 'Sujet',
    message: 'Message',
    channel: 'Canal',
    priority: 'Priorité',
    status: 'Statut',
    confidence: 'Confiance IA',
    scheduledDate: 'Date Programmée',
    strategy: 'Stratégie',
    triggerConditions: 'Conditions de Déclenchement',
    aiPrompt: 'Prompt IA',
    cooldownDays: 'Jours de Refroidissement',
    noClients: 'Aucun client trouvé',
    noFollowUps: 'Aucune relance générée',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Avertissement',
    info: 'Information'
  },
  en: {
    // AI Follow-up Manager
    title: 'AI Smart Follow-ups',
    overview: 'Overview',
    clients: 'Client Analysis',
    followups: 'Follow-ups',
    strategies: 'Strategies',
    settings: 'Settings',
    totalClients: 'Total Clients',
    highRiskClients: 'High Risk Clients',
    lowEngagementClients: 'Low Engagement',
    pendingFollowUps: 'Pending Follow-ups',
    sentToday: 'Sent Today',
    generateFollowUps: 'Generate Follow-ups',
    analyzeClients: 'Analyze Clients',
    autoMode: 'Auto Mode',
    stopAutoMode: 'Stop Auto Mode',
    startAutoMode: 'Start Auto Mode',
    clientAnalysis: 'Client Analysis',
    riskScore: 'Risk Score',
    engagementScore: 'Engagement Score',
    lifetimeValue: 'Lifetime Value',
    lastActivity: 'Last Activity',
    nextFollowUp: 'Next Follow-up',
    recommendedStrategy: 'Recommended Strategy',
    generateFollowUp: 'Generate Follow-up',
    sendFollowUp: 'Send Follow-up',
    viewDetails: 'View Details',
    subject: 'Subject',
    message: 'Message',
    channel: 'Channel',
    priority: 'Priority',
    status: 'Status',
    confidence: 'AI Confidence',
    scheduledDate: 'Scheduled Date',
    strategy: 'Strategy',
    triggerConditions: 'Trigger Conditions',
    aiPrompt: 'AI Prompt',
    cooldownDays: 'Cooldown Days',
    noClients: 'No clients found',
    noFollowUps: 'No follow-ups generated',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information'
  }
};

export const useTranslation = (language: 'fr' | 'en' = 'fr') => {
  const t = useMemo(() => {
    return (key: string): string => {
      return translations[language]?.[key] || key;
    };
  }, [language]);

  return { t, language };
};
