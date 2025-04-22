import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '../contexts/AuthContext';

// Environment variable for socket URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

// Event types
export enum SocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  NEW_ITEM = 'new_item',
  ITEM_DELETED = 'item_deleted',
  ITEM_UPDATED = 'item_updated'
}

// Item type for socket events
export interface SocketItem {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  [key: string]: any; // Allow for additional fields
}

// SocketService singleton
export class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  
  private constructor() {
    // Private constructor for singleton
  }
  
  /**
   * Get the SocketService instance
   */
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    
    return SocketService.instance;
  }
  
  /**
   * Initialize the socket connection
   */
  public connect(): void {
    if (this.socket) {
      // Already connected
      return;
    }
    
    // Get the auth token
    const token = getAuthToken();
    
    // Create the socket connection with auth token
    this.socket = io(SOCKET_URL, {
      auth: token ? { token } : undefined,
      // Path can be configured if needed
      path: '/socket.io',
      // Reconnection options
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    // Set up default listeners
    this.setupDefaultListeners();
  }
  
  /**
   * Disconnect the socket
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  /**
   * Set up default event listeners
   */
  private setupDefaultListeners(): void {
    if (!this.socket) {
      return;
    }
    
    // Connection events
    this.socket.on(SocketEvent.CONNECT, () => {
      console.log('Socket connected');
      this.triggerEvent(SocketEvent.CONNECT);
    });
    
    this.socket.on(SocketEvent.DISCONNECT, (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      this.triggerEvent(SocketEvent.DISCONNECT, reason);
    });
    
    this.socket.on(SocketEvent.ERROR, (error) => {
      console.error('Socket error:', error);
      this.triggerEvent(SocketEvent.ERROR, error);
    });
    
    // Custom application events
    this.socket.on(SocketEvent.NEW_ITEM, (item: SocketItem) => {
      console.log('New item received:', item);
      this.triggerEvent(SocketEvent.NEW_ITEM, item);
    });
    
    this.socket.on(SocketEvent.ITEM_DELETED, (itemId: number) => {
      console.log('Item deleted:', itemId);
      this.triggerEvent(SocketEvent.ITEM_DELETED, itemId);
    });
    
    this.socket.on(SocketEvent.ITEM_UPDATED, (item: SocketItem) => {
      console.log('Item updated:', item);
      this.triggerEvent(SocketEvent.ITEM_UPDATED, item);
    });
  }
  
  /**
   * Add an event listener
   */
  public on(event: SocketEvent, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)?.add(callback);
  }
  
  /**
   * Remove an event listener
   */
  public off(event: SocketEvent, callback: Function): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.delete(callback);
    }
  }
  
  /**
   * Trigger event for all registered listeners
   */
  private triggerEvent(event: SocketEvent, ...args: any[]): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)?.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in socket event handler for ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Check if the socket is connected
   */
  public isConnected(): boolean {
    return !!this.socket?.connected;
  }
  
  /**
   * Get the socket instance
   */
  public getSocket(): Socket | null {
    return this.socket;
  }
} 