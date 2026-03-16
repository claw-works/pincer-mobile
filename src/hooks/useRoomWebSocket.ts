import { useEffect, useRef, useCallback } from 'react';

type RoomMessage = {
  id: string;
  room_id: string;
  sender_agent_id: string;
  content: string;
  created_at: string;
};

interface Options {
  baseUrl: string;
  apiKey: string;
  roomId: string;
  onMessage: (msg: RoomMessage) => void;
}

export function useRoomWebSocket({ baseUrl, apiKey, roomId, onMessage }: Options) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelay = useRef(2000);
  const stopped = useRef(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (stopped.current) return;
    const wsUrl = baseUrl
      .replace(/\/$/, '')
      .replace('https://', 'wss://')
      .replace('http://', 'ws://');
    const url = `${wsUrl}/api/v1/rooms/${roomId}/ws?api_key=${encodeURIComponent(apiKey)}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectDelay.current = 2000;
      console.log('[RoomWS] Connected to room', roomId);
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type !== 'room.message') return;
        const data = msg.data || msg.payload || {};
        if (!data.id) return;
        onMessageRef.current(data as RoomMessage);
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      if (stopped.current) return;
      console.log('[RoomWS] Disconnected, reconnecting in', reconnectDelay.current, 'ms');
      reconnectTimer.current = setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 1.5, 30000);
        connect();
      }, reconnectDelay.current);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [baseUrl, apiKey, roomId]);

  useEffect(() => {
    stopped.current = false;
    connect();
    return () => {
      stopped.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);
}
