// Système de logging centralisé pour N'zoo Immo

import { DEVELOPMENT } from '../constants';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  source?: string;
}

class Logger {
  private isDevelopment = DEVELOPMENT.DEBUG;
  private logLevel: LogLevel = DEVELOPMENT.LOG_LEVEL as LogLevel;

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment) return false;
    
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>, source?: string): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const sourcePrefix = source ? `[${source}]` : '';
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    
    return `${prefix}${sourcePrefix} ${message}${contextStr}`;
  }

  debug(message: string, context?: Record<string, any>, source?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, context, source));
    }
  }

  info(message: string, context?: Record<string, any>, source?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, context, source));
    }
  }

  warn(message: string, context?: Record<string, any>, source?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context, source));
    }
  }

  error(message: string, context?: Record<string, any>, source?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, context, source));
    }
  }

  // Méthodes spécialisées pour différents domaines
  auth(message: string, context?: Record<string, any>): void {
    this.info(message, context, 'AUTH');
  }

  reservation(message: string, context?: Record<string, any>): void {
    this.info(message, context, 'RESERVATION');
  }

  email(message: string, context?: Record<string, any>): void {
    this.info(message, context, 'EMAIL');
  }

  invoice(message: string, context?: Record<string, any>): void {
    this.info(message, context, 'INVOICE');
  }

  database(message: string, context?: Record<string, any>): void {
    this.info(message, context, 'DATABASE');
  }

  payment(message: string, context?: Record<string, any>): void {
    this.info(message, context, 'PAYMENT');
  }

  // Méthode pour les erreurs critiques (toujours loggées)
  critical(message: string, context?: Record<string, any>, source?: string): void {
    console.error(this.formatMessage(LogLevel.ERROR, `🚨 CRITICAL: ${message}`, context, source));
  }
}

// Instance singleton
export const logger = new Logger();

// Fonctions utilitaires pour faciliter la migration
export const logDebug = (message: string, context?: Record<string, any>, source?: string) => {
  logger.debug(message, context, source);
};

export const logInfo = (message: string, context?: Record<string, any>, source?: string) => {
  logger.info(message, context, source);
};

export const logWarn = (message: string, context?: Record<string, any>, source?: string) => {
  logger.warn(message, context, source);
};

export const logError = (message: string, context?: Record<string, any>, source?: string) => {
  logger.error(message, context, source);
};

export const logCritical = (message: string, context?: Record<string, any>, source?: string) => {
  logger.critical(message, context, source);
};
