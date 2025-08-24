import { autoUpdateReservationStatuses, getReservationSummary } from './reservationAutoManagement';

// Interface pour la configuration du cron
interface CronConfig {
  enabled: boolean;
  intervalMinutes: number;
  lastRun?: Date;
  nextRun?: Date;
  totalRuns: number;
  lastResult?: any;
}

// Configuration par défaut
const DEFAULT_CRON_CONFIG: CronConfig = {
  enabled: false,
  intervalMinutes: 60, // Exécution toutes les heures par défaut
  totalRuns: 0
};

class AutoReservationCron {
  private config: CronConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor() {
    // Charger la configuration depuis le localStorage
    const savedConfig = localStorage.getItem('autoReservationCronConfig');
    this.config = savedConfig ? { ...DEFAULT_CRON_CONFIG, ...JSON.parse(savedConfig) } : DEFAULT_CRON_CONFIG;
  }

  /**
   * Démarre le cron job
   */
  public start(): void {
    if (this.config.enabled && !this.intervalId) {
      console.log('🚀 Démarrage du cron job de mise à jour automatique des réservations');
      
      // Exécuter immédiatement si c'est la première fois
      if (this.config.totalRuns === 0) {
        this.execute();
      }
      
      // Programmer les exécutions suivantes
      this.intervalId = setInterval(() => {
        this.execute();
      }, this.config.intervalMinutes * 60 * 1000);
      
      this.saveConfig();
    }
  }

  /**
   * Arrête le cron job
   */
  public stop(): void {
    if (this.intervalId) {
      console.log('⏹️ Arrêt du cron job de mise à jour automatique des réservations');
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.saveConfig();
    }
  }

  /**
   * Exécute la mise à jour automatique
   */
  private async execute(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Mise à jour automatique déjà en cours, ignorée');
      return;
    }

    this.isRunning = true;
    this.config.lastRun = new Date();
    this.config.totalRuns++;

    try {
      console.log(`🔄 Exécution automatique #${this.config.totalRuns} - ${this.config.lastRun.toISOString()}`);
      
      // Exécuter la mise à jour automatique
      const result = await autoUpdateReservationStatuses();
      this.config.lastResult = result;
      
      console.log(`✅ Mise à jour automatique terminée:`, {
        success: result.success,
        updated: result.updatedCount,
        cancelled: result.cancelledCount,
        completed: result.completedCount,
        errors: result.errors.length
      });

      // Envoyer une notification si des réservations ont été mises à jour
      if (result.updatedCount > 0) {
        this.sendNotification(result);
      }

    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution automatique:', error);
      this.config.lastResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    } finally {
      this.isRunning = false;
      this.config.nextRun = new Date(Date.now() + this.config.intervalMinutes * 60 * 1000);
      this.saveConfig();
    }
  }

  /**
   * Envoie une notification en cas de mise à jour
   */
  private sendNotification(result: any): void {
    // Vérifier si les notifications sont supportées
    if ('Notification' in window && Notification.permission === 'granted') {
      const message = `Mise à jour automatique: ${result.updatedCount} réservation(s) mise(s) à jour`;
      new Notification('N\'zoo Immo - Réservations', {
        body: message,
        icon: '/logo.jpg'
      });
    }

    // Afficher une notification dans la console
    console.log('📢 Notification:', {
      title: 'Mise à jour automatique des réservations',
      message: `${result.updatedCount} réservation(s) mise(s) à jour`,
      details: {
        annulées: result.cancelledCount,
        terminées: result.completedCount,
        erreurs: result.errors.length
      }
    });
  }

  /**
   * Met à jour la configuration
   */
  public updateConfig(newConfig: Partial<CronConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Redémarrer le cron si la configuration a changé
    if (this.config.enabled) {
      this.stop();
      this.start();
    } else {
      this.stop();
    }
    
    this.saveConfig();
  }

  /**
   * Obtient la configuration actuelle
   */
  public getConfig(): CronConfig {
    return { ...this.config };
  }

  /**
   * Sauvegarde la configuration dans le localStorage
   */
  private saveConfig(): void {
    localStorage.setItem('autoReservationCronConfig', JSON.stringify(this.config));
  }

  /**
   * Exécute manuellement la mise à jour
   */
  public async runManually(): Promise<any> {
    console.log('🔧 Exécution manuelle de la mise à jour automatique');
    return autoUpdateReservationStatuses();
  }

  /**
   * Obtient le statut actuel du cron
   */
  public getStatus(): {
    isRunning: boolean;
    isEnabled: boolean;
    nextRun?: Date;
    lastRun?: Date;
    totalRuns: number;
  } {
    return {
      isRunning: this.isRunning,
      isEnabled: this.config.enabled,
      nextRun: this.config.nextRun,
      lastRun: this.config.lastRun,
      totalRuns: this.config.totalRuns
    };
  }

  /**
   * Obtient un résumé des réservations
   */
  public async getReservationSummary(): Promise<any> {
    return getReservationSummary();
  }
}

// Instance singleton
const autoReservationCron = new AutoReservationCron();

// Fonctions d'export pour une utilisation facile
export const startAutoReservationCron = () => autoReservationCron.start();
export const stopAutoReservationCron = () => autoReservationCron.stop();
export const updateCronConfig = (config: Partial<CronConfig>) => autoReservationCron.updateConfig(config);
export const getCronConfig = () => autoReservationCron.getConfig();
export const getCronStatus = () => autoReservationCron.getStatus();
export const runManualUpdate = () => autoReservationCron.runManually();
export const getReservationSummary = () => autoReservationCron.getReservationSummary();

// Démarrer automatiquement le cron si activé
if (autoReservationCron.getConfig().enabled) {
  autoReservationCron.start();
}

export default autoReservationCron;
