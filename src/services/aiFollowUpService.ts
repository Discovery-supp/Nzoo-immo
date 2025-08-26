import { supabase } from '../lib/supabase';
import { Reservation, Client } from '../types';

// Types pour les relances intelligentes
export interface FollowUpStrategy {
  id: string;
  name: string;
  description: string;
  triggerConditions: TriggerCondition[];
  aiPrompt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('email' | 'sms' | 'push')[];
  cooldownDays: number;
}

export interface TriggerCondition {
  type: 'reservation_status' | 'days_since_last' | 'total_spent' | 'activity_type' | 'payment_method' | 'location';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: string | number | boolean;
}

export interface ClientInsight {
  clientId: string;
  riskScore: number; // 0-100, plus élevé = plus de risque de perte
  engagementScore: number; // 0-100, plus élevé = plus engagé
  lifetimeValue: number;
  preferredChannels: string[];
  bestContactTimes: string[];
  interests: string[];
  lastActivity: Date;
  nextFollowUpDate: Date;
  recommendedStrategy: string;
}

export interface AIGeneratedFollowUp {
  id: string;
  clientId: string;
  strategyId: string;
  subject: string;
  message: string;
  channel: 'email' | 'sms' | 'push';
  scheduledDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  aiConfidence: number; // 0-100
  generatedAt: Date;
  status: 'pending' | 'sent' | 'cancelled' | 'failed';
}

// Stratégies de relance prédéfinies
export const FOLLOW_UP_STRATEGIES: FollowUpStrategy[] = [
  {
    id: 'welcome_new_client',
    name: 'Bienvenue Nouveau Client',
    description: 'Accueil personnalisé pour les nouveaux clients',
    triggerConditions: [
      { type: 'days_since_last', operator: 'less_than', value: 7 },
      { type: 'total_spent', operator: 'greater_than', value: 0 }
    ],
    aiPrompt: 'Génère un message de bienvenue chaleureux et personnalisé pour un nouveau client qui vient de faire sa première réservation. Inclus des informations utiles sur les services et encourage l\'engagement.',
    priority: 'high',
    channels: ['email'],
    cooldownDays: 30
  },
  {
    id: 'inactive_client_reminder',
    name: 'Rappel Client Inactif',
    description: 'Relance pour les clients inactifs depuis plus de 30 jours',
    triggerConditions: [
      { type: 'days_since_last', operator: 'greater_than', value: 30 },
      { type: 'total_spent', operator: 'greater_than', value: 50 }
    ],
    aiPrompt: 'Génère un message de relance amical pour un client qui n\'a pas réservé depuis plus de 30 jours. Rappelle les avantages de nos services et propose une offre spéciale pour le faire revenir.',
    priority: 'medium',
    channels: ['email', 'sms'],
    cooldownDays: 14
  },
  {
    id: 'high_value_client_retention',
    name: 'Rétention Client à Forte Valeur',
    description: 'Relance spéciale pour les clients à forte valeur',
    triggerConditions: [
      { type: 'total_spent', operator: 'greater_than', value: 500 },
      { type: 'days_since_last', operator: 'greater_than', value: 14 }
    ],
    aiPrompt: 'Génère un message VIP pour un client à forte valeur qui n\'a pas réservé récemment. Offre un service premium personnalisé et montre que nous apprécions leur fidélité.',
    priority: 'urgent',
    channels: ['email', 'sms'],
    cooldownDays: 7
  },
  {
    id: 'cancelled_reservation_followup',
    name: 'Suivi Réservation Annulée',
    description: 'Relance après annulation de réservation',
    triggerConditions: [
      { type: 'reservation_status', operator: 'equals', value: 'cancelled' }
    ],
    aiPrompt: 'Génère un message empathique pour un client qui a annulé sa réservation. Comprends les raisons possibles et propose des alternatives ou des solutions.',
    priority: 'high',
    channels: ['email'],
    cooldownDays: 3
  },
  {
    id: 'seasonal_promotion',
    name: 'Promotion Saisonnière',
    description: 'Offres spéciales selon la saison',
    triggerConditions: [
      { type: 'days_since_last', operator: 'greater_than', value: 7 }
    ],
    aiPrompt: 'Génère un message promotionnel saisonnier attractif. Adapte le contenu selon la période de l\'année et les besoins typiques des clients.',
    priority: 'medium',
    channels: ['email', 'push'],
    cooldownDays: 21
  }
];

// Service principal d'IA pour les relances
export class AIFollowUpService {
  private static instance: AIFollowUpService;
  
  public static getInstance(): AIFollowUpService {
    if (!AIFollowUpService.instance) {
      AIFollowUpService.instance = new AIFollowUpService();
    }
    return AIFollowUpService.instance;
  }

  // Analyser un client et générer des insights
  async analyzeClient(clientId: string): Promise<ClientInsight> {
    try {
      // Récupérer les données du client
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('email', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!reservations || reservations.length === 0) {
        throw new Error('Aucune réservation trouvée pour ce client');
      }

      // Calculer les métriques
      const totalSpent = reservations.reduce((sum, r) => sum + (r.amount || 0), 0);
      const lastActivity = new Date(reservations[0].created_at);
      const daysSinceLast = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculer le score de risque (0-100)
      const riskScore = this.calculateRiskScore(reservations, daysSinceLast, totalSpent);
      
      // Calculer le score d'engagement (0-100)
      const engagementScore = this.calculateEngagementScore(reservations, daysSinceLast);
      
      // Déterminer les canaux préférés
      const preferredChannels = this.determinePreferredChannels(reservations);
      
      // Déterminer les meilleurs moments de contact
      const bestContactTimes = this.determineBestContactTimes(reservations);
      
      // Identifier les intérêts
      const interests = this.identifyInterests(reservations);
      
      // Recommander la prochaine date de relance
      const nextFollowUpDate = this.calculateNextFollowUpDate(riskScore, engagementScore, daysSinceLast);
      
      // Recommander une stratégie
      const recommendedStrategy = this.recommendStrategy(riskScore, engagementScore, daysSinceLast, totalSpent);

      return {
        clientId,
        riskScore,
        engagementScore,
        lifetimeValue: totalSpent,
        preferredChannels,
        bestContactTimes,
        interests,
        lastActivity,
        nextFollowUpDate,
        recommendedStrategy
      };

    } catch (error) {
      console.error('Erreur lors de l\'analyse du client:', error);
      throw error;
    }
  }

  // Générer une relance personnalisée avec IA
  async generateFollowUp(clientId: string, strategyId: string): Promise<AIGeneratedFollowUp> {
    try {
      // Analyser le client
      const insight = await this.analyzeClient(clientId);
      
      // Trouver la stratégie
      const strategy = FOLLOW_UP_STRATEGIES.find(s => s.id === strategyId);
      if (!strategy) {
        throw new Error(`Stratégie ${strategyId} non trouvée`);
      }

      // Générer le contenu avec IA (simulation pour l'instant)
      const generatedContent = await this.generateAIContent(strategy.aiPrompt, insight);
      
      // Créer la relance
      const followUp: AIGeneratedFollowUp = {
        id: `followup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        clientId,
        strategyId,
        subject: generatedContent.subject,
        message: generatedContent.message,
        channel: strategy.channels[0] as 'email' | 'sms' | 'push',
        scheduledDate: insight.nextFollowUpDate,
        priority: strategy.priority,
        aiConfidence: generatedContent.confidence,
        generatedAt: new Date(),
        status: 'pending'
      };

      // Sauvegarder dans la base de données
      await this.saveFollowUp(followUp);

      return followUp;

    } catch (error) {
      console.error('Erreur lors de la génération de relance:', error);
      throw error;
    }
  }

  // Analyser tous les clients et générer des relances automatiques
  async generateAutomaticFollowUps(): Promise<AIGeneratedFollowUp[]> {
    try {
      // Récupérer tous les clients uniques
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('email, created_at, amount, status')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Grouper par client
      const clientGroups = this.groupReservationsByClient(reservations);
      const followUps: AIGeneratedFollowUp[] = [];

      // Analyser chaque client
      for (const [clientId, clientReservations] of clientGroups) {
        try {
          const insight = await this.analyzeClient(clientId);
          
          // Vérifier si une relance est nécessaire
          if (this.shouldSendFollowUp(insight)) {
            const strategy = this.recommendStrategy(
              insight.riskScore,
              insight.engagementScore,
              Math.floor((Date.now() - insight.lastActivity.getTime()) / (1000 * 60 * 60 * 24)),
              insight.lifetimeValue
            );

            const followUp = await this.generateFollowUp(clientId, strategy);
            followUps.push(followUp);
          }
        } catch (error) {
          console.error(`Erreur lors de l'analyse du client ${clientId}:`, error);
          continue;
        }
      }

      return followUps;

    } catch (error) {
      console.error('Erreur lors de la génération automatique des relances:', error);
      throw error;
    }
  }

  // Envoyer une relance
  async sendFollowUp(followUpId: string): Promise<boolean> {
    try {
      // Récupérer la relance
      const { data: followUp, error } = await supabase
        .from('ai_follow_ups')
        .select('*')
        .eq('id', followUpId)
        .single();

      if (error || !followUp) {
        throw new Error('Relance non trouvée');
      }

      // Envoyer selon le canal
      let sent = false;
      switch (followUp.channel) {
        case 'email':
          sent = await this.sendEmailFollowUp(followUp);
          break;
        case 'sms':
          sent = await this.sendSMSFollowUp(followUp);
          break;
        case 'push':
          sent = await this.sendPushFollowUp(followUp);
          break;
      }

      // Mettre à jour le statut
      await supabase
        .from('ai_follow_ups')
        .update({ 
          status: sent ? 'sent' : 'failed',
          sent_at: sent ? new Date().toISOString() : null
        })
        .eq('id', followUpId);

      return sent;

    } catch (error) {
      console.error('Erreur lors de l\'envoi de la relance:', error);
      return false;
    }
  }

  // Méthodes privées utilitaires
  private calculateRiskScore(reservations: any[], daysSinceLast: number, totalSpent: number): number {
    let score = 0;
    
    // Facteur temps depuis la dernière activité
    if (daysSinceLast > 90) score += 40;
    else if (daysSinceLast > 60) score += 30;
    else if (daysSinceLast > 30) score += 20;
    else if (daysSinceLast > 14) score += 10;

    // Facteur valeur du client
    if (totalSpent > 1000) score += 30;
    else if (totalSpent > 500) score += 20;
    else if (totalSpent > 100) score += 10;

    // Facteur annulations
    const cancellations = reservations.filter(r => r.status === 'cancelled').length;
    score += cancellations * 5;

    return Math.min(score, 100);
  }

  private calculateEngagementScore(reservations: any[], daysSinceLast: number): number {
    let score = 100;
    
    // Réduire le score selon le temps d'inactivité
    if (daysSinceLast > 90) score -= 60;
    else if (daysSinceLast > 60) score -= 40;
    else if (daysSinceLast > 30) score -= 20;
    else if (daysSinceLast > 14) score -= 10;

    // Augmenter le score selon la fréquence
    const frequency = reservations.length / Math.max(daysSinceLast / 30, 1);
    score += Math.min(frequency * 10, 30);

    return Math.max(Math.min(score, 100), 0);
  }

  private determinePreferredChannels(reservations: any[]): string[] {
    const channels = ['email']; // Par défaut
    
    // Analyser les méthodes de paiement pour déterminer les préférences
    const paymentMethods = reservations.map(r => r.payment_method);
    if (paymentMethods.includes('orange_money') || paymentMethods.includes('airtel_money')) {
      channels.push('sms');
    }
    
    return channels;
  }

  private determineBestContactTimes(reservations: any[]): string[] {
    // Analyser les heures de réservation pour déterminer les meilleurs moments
    const hours = reservations.map(r => new Date(r.created_at).getHours());
    const morningHours = hours.filter(h => h >= 9 && h <= 12).length;
    const afternoonHours = hours.filter(h => h >= 14 && h <= 17).length;
    
    if (morningHours > afternoonHours) {
      return ['09:00', '10:00', '11:00'];
    } else {
      return ['14:00', '15:00', '16:00'];
    }
  }

  private identifyInterests(reservations: any[]): string[] {
    const interests: string[] = [];
    
    // Analyser les types d'espaces réservés
    const spaceTypes = [...new Set(reservations.map(r => r.space_type))];
    interests.push(...spaceTypes);
    
    // Analyser les activités
    const activities = [...new Set(reservations.map(r => r.activity).filter(Boolean))];
    interests.push(...activities);
    
    return interests;
  }

  private calculateNextFollowUpDate(riskScore: number, engagementScore: number, daysSinceLast: number): Date {
    let daysToAdd = 7; // Par défaut
    
    if (riskScore > 70) daysToAdd = 1; // Très urgent
    else if (riskScore > 50) daysToAdd = 3; // Urgent
    else if (engagementScore < 30) daysToAdd = 5; // Faible engagement
    else if (daysSinceLast > 60) daysToAdd = 2; // Inactif depuis longtemps
    
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    return nextDate;
  }

  private recommendStrategy(riskScore: number, engagementScore: number, daysSinceLast: number, totalSpent: number): string {
    if (totalSpent > 500 && daysSinceLast > 14) {
      return 'high_value_client_retention';
    } else if (daysSinceLast > 30) {
      return 'inactive_client_reminder';
    } else if (daysSinceLast < 7) {
      return 'welcome_new_client';
    } else {
      return 'seasonal_promotion';
    }
  }

  private shouldSendFollowUp(insight: ClientInsight): boolean {
    const daysSinceLast = Math.floor((Date.now() - insight.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    // Vérifier si une relance est nécessaire selon les critères
    return (
      (insight.riskScore > 50) ||
      (insight.engagementScore < 40) ||
      (daysSinceLast > 30) ||
      (insight.lifetimeValue > 500 && daysSinceLast > 14)
    );
  }

  private groupReservationsByClient(reservations: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>();
    
    for (const reservation of reservations) {
      const email = reservation.email;
      if (!groups.has(email)) {
        groups.set(email, []);
      }
      groups.get(email)!.push(reservation);
    }
    
    return groups;
  }

  private async generateAIContent(prompt: string, insight: ClientInsight): Promise<{ subject: string; message: string; confidence: number }> {
    // Simulation de génération IA (à remplacer par une vraie API IA)
    const context = `
      Client: ${insight.clientId}
      Valeur vie: $${insight.lifetimeValue}
      Score de risque: ${insight.riskScore}/100
      Score d'engagement: ${insight.engagementScore}/100
      Intérêts: ${insight.interests.join(', ')}
      Dernière activité: ${insight.lastActivity.toLocaleDateString()}
    `;

    // Générer un contenu basé sur le prompt et le contexte
    const subject = this.generateSubject(prompt, context);
    const message = this.generateMessage(prompt, context);
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%

    return { subject, message, confidence };
  }

  private generateSubject(prompt: string, context: string): string {
    // Logique simple de génération de sujet
    if (prompt.includes('bienvenue')) {
      return 'Bienvenue chez N\'zoo Immo ! 🏢';
    } else if (prompt.includes('inactif')) {
      return 'On vous manque chez N\'zoo Immo ! 💼';
    } else if (prompt.includes('VIP')) {
      return 'Offre exclusive pour nos clients VIP ! ⭐';
    } else if (prompt.includes('annulé')) {
      return 'Comment pouvons-nous vous aider ? 🤝';
    } else {
      return 'Nouvelle offre spéciale N\'zoo Immo ! 🎉';
    }
  }

  private generateMessage(prompt: string, context: string): string {
    // Logique simple de génération de message
    let message = '';
    
    if (prompt.includes('bienvenue')) {
      message = `
        Bonjour !
        
        Nous sommes ravis de vous accueillir chez N'zoo Immo ! 🎉
        
        Votre première réservation a été confirmée et nous nous réjouissons de vous recevoir dans nos espaces de travail modernes et confortables.
        
        N'hésitez pas à nous contacter si vous avez des questions ou besoin d'assistance.
        
        À bientôt !
        L'équipe N'zoo Immo
      `;
    } else if (prompt.includes('inactif')) {
      message = `
        Bonjour !
        
        Nous avons remarqué que vous n'avez pas réservé d'espace depuis quelque temps. 
        Nous espérons que tout va bien !
        
        Pour vous faire revenir, nous vous proposons une offre spéciale de -20% sur votre prochaine réservation.
        
        Nos espaces vous attendent ! 🏢
        
        L'équipe N'zoo Immo
      `;
    } else if (prompt.includes('VIP')) {
      message = `
        Cher client VIP,
        
        En tant que client fidèle de N'zoo Immo, nous vous proposons un service premium personnalisé.
        
        Bénéficiez de nos meilleurs espaces avec un accès prioritaire et des services exclusifs.
        
        Contactez-nous pour découvrir nos offres VIP ! ⭐
        
        L'équipe N'zoo Immo
      `;
    } else {
      message = `
        Bonjour !
        
        Découvrez nos nouvelles offres et promotions chez N'zoo Immo !
        
        Des espaces modernes, des prix compétitifs et un service de qualité vous attendent.
        
        Réservez dès maintenant et bénéficiez de nos tarifs préférentiels !
        
        L'équipe N'zoo Immo
      `;
    }
    
    return message.trim();
  }

  private async saveFollowUp(followUp: AIGeneratedFollowUp): Promise<void> {
    const { error } = await supabase
      .from('ai_follow_ups')
      .insert([followUp]);

    if (error) throw error;
  }

  private async sendEmailFollowUp(followUp: AIGeneratedFollowUp): Promise<boolean> {
    // Intégration avec le service d'email existant
    try {
      // Utiliser le service d'email existant
      const { sendConfirmationEmail } = await import('./emailService');
      
      const result = await sendConfirmationEmail({
        to: followUp.clientId,
        subject: followUp.subject,
        reservationData: {
          fullName: 'Client',
          email: followUp.clientId,
          phone: '',
          company: '',
          activity: '',
          spaceType: '',
          startDate: '',
          endDate: '',
          amount: 0,
          transactionId: followUp.id,
          status: 'followup'
        }
      });

      return result.emailSent;
    } catch (error) {
      console.error('Erreur envoi email relance:', error);
      return false;
    }
  }

  private async sendSMSFollowUp(followUp: AIGeneratedFollowUp): Promise<boolean> {
    // Simulation d'envoi SMS (à implémenter avec un vrai service SMS)
    console.log(`📱 SMS relance envoyé à ${followUp.clientId}: ${followUp.message.substring(0, 100)}...`);
    return true;
  }

  private async sendPushFollowUp(followUp: AIGeneratedFollowUp): Promise<boolean> {
    // Intégration avec le service de notifications push existant
    try {
      const { sendNotification } = await import('./pushNotificationService');
      
      await sendNotification({
        title: followUp.subject,
        body: followUp.message.substring(0, 200),
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: `followup_${followUp.id}`,
        data: {
          type: 'followup',
          followUpId: followUp.id,
          clientId: followUp.clientId
        }
      });

      return true;
    } catch (error) {
      console.error('Erreur envoi push relance:', error);
      return false;
    }
  }
}

// Export de l'instance singleton
export const aiFollowUpService = AIFollowUpService.getInstance();
