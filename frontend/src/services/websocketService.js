import { Client } from '@stomp/stompjs';

/**
 * Subscribes to real-time seat status updates for a specific show using native browser WebSocket.
 *
 * @param {string|number} showId The show identifier to subscribe to
 * @param {Function} onSeatEvent Callback when a seat status event arrives (LOCKED, UNLOCKED, BOOKED, RELEASED)
 * @param {Function} [onStatusChange] Optional callback for connection state (CONNECTED, DISCONNECTED, ERROR)
 * @returns {{ disconnect: () => void }} Object to disconnect and clean up subscription
 */
export function connectShowSeatSocket(showId, onSeatEvent, onStatusChange) {
  // Use native WebSocket endpoint supported by Spring Boot
  const brokerURL = 'ws://127.0.0.1:8080/ws-booking';

  const client = new Client({
    brokerURL: brokerURL,
    reconnectDelay: 4000,
    heartbeatIncoming: 5000,
    heartbeatOutgoing: 5000,
    onConnect: () => {
      if (onStatusChange) onStatusChange('CONNECTED');
      console.log(`[WebSocket] Connected via STOMP to show ${showId}`);

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
      console.error('[WebSocket] STOMP Broker error:', frame.headers?.['message']);
      if (onStatusChange) onStatusChange('ERROR');
    },
    onWebSocketClose: () => {
      if (onStatusChange) onStatusChange('DISCONNECTED');
    },
    onWebSocketError: (error) => {
      console.warn('[WebSocket] Connection warning:', error);
      if (onStatusChange) onStatusChange('ERROR');
    }
  });

  try {
    client.activate();
  } catch (err) {
    console.error('[WebSocket] Activation failed:', err);
    if (onStatusChange) onStatusChange('ERROR');
  }

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
