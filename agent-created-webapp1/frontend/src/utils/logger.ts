/**
 * Logger utility for structured logging
 * Uses types from types.ts
 */
import { AppError, User, Item } from './types';
import { createError } from './helpers';

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  error?: AppError;
  userId?: string;
  sessionId?: string;
}

// Logger configuration
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxEntries: number;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableRemote: false,
  maxEntries: 1000
};

// Logger class
class Logger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create log entry
  private createEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any,
    error?: AppError,
    userId?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error,
      userId,
      sessionId: this.sessionId
    };
  }

  // Add entry to log
  private addEntry(entry: LogEntry): void {
    this.entries.push(entry);
    
    // Keep only the last maxEntries
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }
  }

  // Format log entry for console
  private formatForConsole(entry: LogEntry): string {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    const levelName = levelNames[entry.level];
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    let formatted = `[${timestamp}] ${levelName}: ${entry.message}`;
    
    if (entry.context) {
      formatted += ` (${entry.context})`;
    }
    
    if (entry.userId) {
      formatted += ` [User: ${entry.userId}]`;
    }
    
    return formatted;
  }

  // Log methods
  debug(message: string, context?: string, data?: any, userId?: string): void {
    if (this.config.level <= LogLevel.DEBUG) {
      const entry = this.createEntry(LogLevel.DEBUG, message, context, data, undefined, userId);
      this.addEntry(entry);
      
      if (this.config.enableConsole) {
        console.debug(this.formatForConsole(entry), data);
      }
    }
  }

  info(message: string, context?: string, data?: any, userId?: string): void {
    if (this.config.level <= LogLevel.INFO) {
      const entry = this.createEntry(LogLevel.INFO, message, context, data, undefined, userId);
      this.addEntry(entry);
      
      if (this.config.enableConsole) {
        console.info(this.formatForConsole(entry), data);
      }
    }
  }

  warn(message: string, context?: string, data?: any, userId?: string): void {
    if (this.config.level <= LogLevel.WARN) {
      const entry = this.createEntry(LogLevel.WARN, message, context, data, undefined, userId);
      this.addEntry(entry);
      
      if (this.config.enableConsole) {
        console.warn(this.formatForConsole(entry), data);
      }
    }
  }

  error(message: string, error?: AppError, context?: string, data?: any, userId?: string): void {
    if (this.config.level <= LogLevel.ERROR) {
      const entry = this.createEntry(LogLevel.ERROR, message, context, data, error, userId);
      this.addEntry(entry);
      
      if (this.config.enableConsole) {
        console.error(this.formatForConsole(entry), error, data);
      }
    }
  }

  fatal(message: string, error?: AppError, context?: string, data?: any, userId?: string): void {
    if (this.config.level <= LogLevel.FATAL) {
      const entry = this.createEntry(LogLevel.FATAL, message, context, data, error, userId);
      this.addEntry(entry);
      
      if (this.config.enableConsole) {
        console.error(this.formatForConsole(entry), error, data);
      }
    }
  }

  // User-specific logging
  logUserAction(user: User, action: string, data?: any): void {
    this.info(`User action: ${action}`, 'user_action', data, user.id);
  }

  logUserError(user: User, error: AppError, context?: string): void {
    this.error(`User error: ${error.message}`, error, context, undefined, user.id);
  }

  logItemOperation(user: User, operation: string, item: Item): void {
    this.info(`Item ${operation}`, 'item_operation', { itemId: item.id, title: item.title }, user.id);
  }

  // API logging
  logApiRequest(method: string, url: string, userId?: string): void {
    this.debug(`API Request: ${method} ${url}`, 'api_request', undefined, userId);
  }

  logApiResponse(method: string, url: string, status: number, userId?: string): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
    const message = `API Response: ${method} ${url} - ${status}`;
    
    if (level === LogLevel.ERROR) {
      this.error(message, undefined, 'api_response', undefined, userId);
    } else {
      this.debug(message, 'api_response', undefined, userId);
    }
  }

  logApiError(method: string, url: string, error: AppError, userId?: string): void {
    this.error(`API Error: ${method} ${url}`, error, 'api_error', undefined, userId);
  }

  // Performance logging
  logPerformance(operation: string, duration: number, userId?: string): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG;
    const message = `Performance: ${operation} took ${duration}ms`;
    
    if (level === LogLevel.WARN) {
      this.warn(message, 'performance', { duration }, userId);
    } else {
      this.debug(message, 'performance', { duration }, userId);
    }
  }

  // Get log entries
  getEntries(level?: LogLevel, limit?: number): LogEntry[] {
    let filtered = this.entries;
    
    if (level !== undefined) {
      filtered = filtered.filter(entry => entry.level >= level);
    }
    
    if (limit) {
      filtered = filtered.slice(-limit);
    }
    
    return filtered;
  }

  // Clear logs
  clear(): void {
    this.entries = [];
  }

  // Export logs
  export(): LogEntry[] {
    return [...this.entries];
  }

  // Update configuration
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Create default logger instance
export const logger = new Logger();

// Export logger class and utilities
export {
  Logger,
  LogLevel,
  DEFAULT_CONFIG
};
