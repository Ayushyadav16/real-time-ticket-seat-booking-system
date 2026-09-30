import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Subscribes to real-time seat status updates for a specific show.
 *
 * @param {string|number} showId The show identifier to subscribe to
 * @param {Function} onSeatEvent Callback when a seat status event arrives (LOCKED, UNLOCKED, BOOKED, RELEASED)
 * @param {Function} [onStatusChange] Optional callback for connection state (CONNECTED, DISCONNECTED, ERROR)
 * @returns {{ disconnect: () => void }} Object to disconnect and clean up subscription
 */
export function connectShowSeatSocket(showId, onSeatEvent, onStatusChange) {
  const socketUrl = 'http://127.0.0.1:8080/ws-booking';

  const client = new Client({
    webSocketFactory: () => new SockJS(socketUrl),
    reconnectDelay: 4000,
    heartbeatIncoming: 5000,
    heartbeatOutgoing: 5000,
    debug: (str) => {
      // debug logs suppressed in production, available for tracing
      // console.log('[STOMP]', str);
    },
    onConnect: () => {
      if (onStatusChange) onStatusChange('CONNECTED');
      console.log(`[WebSocket] Connected. Subscribing to show ${showId} seats.`);

      client.subscribe(`/topic/shows/${showId}/seats`, (message) => {
        try {
          const event = JSON.parse(message.body);
          if (onSeatEvent) {
            onSeatEvent(event);
          }
        } catch (err) {
          console.error('[WebSocket] Failed to parse message body:', err);
        }
      });
    },
    onDisconnect: () => {
      if (onStatusChange) onStatusChange('DISCONNECTED');
    },
    onStompError: (frame) => {
      console.error('[WebSocket] STOMP Broker error:', frame.headers['message']);
      if (onStatusChange) onStatusChange('ERROR');
    },
    onWebSocketClose: () => {
      if (onStatusChange) onStatusChange('DISCONNECTED');
    },
  });

  client.activate();

  return {
    disconnect: () => {
      try {
        client.deactivate();
      } catch (err) {
        console.warn('[WebSocket] Error during deactivate:', err);
      }
    },
  };
}
