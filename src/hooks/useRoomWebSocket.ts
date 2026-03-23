import { useEffect, useRef, useCallback } from 'react';

type RoomMessage = {
  id: string;
  room_id: string;
  sender_agent_id: string;
  content: string;
  created_at: string;
};

export type ReplyingEvent = {
  agent_id: string;
  agent_name?: string;
};

interface Options {
  baseUrl: string;
  apiKey: string;
  roomId: string;
  onMessage: (msg: RoomMessage) => void;
  onAgentReplying?: (payload: ReplyingEvent) => void;
  onAgentReplyingDone?: (payload: ReplyingEvent) => void;
}

export function useRoomWebSocket({ baseUrl, apiKey, roomId, onMessage, onAgentReplying, onAgentReplyingDone }: Options) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelay = useRef(2000);
  const stopped = useRef(false);
  const onMessageRef = useRef(onMessage);
  const onReplyingRef = useRef(onAgentReplying);
  const onReplyingDoneRef = useRef(onAgentReplyingDone);
  onMessageRef.current = onMessage;
  onReplyingRef.current = onAgentReplying;
  onReplyingDoneRef.current = onAgentReplyingDone;

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
        const envelope = JSON.parse(e.data);
        const data = envelope.data || envelope.payload || {};
        if (envelope.type === 'agent_replying') {
          onReplyingRef.current?.(data as ReplyingEvent);
          return;
        }
        if (envelope.type === 'agent_replying_done') {
          onReplyingDoneRef.current?.(data as ReplyingEvent);
          return;
        }
        if (envelope.type !== 'room.message') return;
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
