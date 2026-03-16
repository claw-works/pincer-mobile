import { useEffect, useRef, useCallback } from 'react';

type InboxMessage = {
  id: string;
  from_agent_id?: string;
  to_agent_id?: string;
  from?: string;
  to?: string;
  payload?: { text?: string };
  created_at?: string;
  timestamp?: string;
};

interface Options {
  baseUrl: string;
  apiKey: string;
  agentId: string;  // current user's agent ID
  onMessage: (msg: InboxMessage) => void;
}

export function useDMWebSocket({ baseUrl, apiKey, agentId, onMessage }: Options) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelay = useRef(2000);
  const stopped = useRef(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (stopped.current || !baseUrl || !apiKey) return;
    const wsBase = baseUrl.replace(/\/$/, '').replace('https://', 'wss://').replace('http://', 'ws://');
    const url = `${wsBase}/api/v1/inbox/ws?api_key=${encodeURIComponent(apiKey)}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectDelay.current = 2000;
      console.log('[InboxWS] Connected');
    };

    ws.onmessage = (e) => {
      try {
        const raw = JSON.parse(e.data);
        // Normalise: from/from_agent_id, to/to_agent_id
        const from = raw.from_agent_id || raw.from || raw.sender_agent_id;
        const to = raw.to_agent_id || raw.to;
        if (!from || from === agentId) return;  // skip own messages or unknown sender
        onMessageRef.current({
          id: raw.id || `inbox_${Date.now()}`,
          from_agent_id: from,
          to_agent_id: to || agentId,
          payload: raw.payload || { text: raw.content || '' },
          created_at: raw.created_at || raw.timestamp || new Date().toISOString(),
        });
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      if (stopped.current) return;
      reconnectTimer.current = setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 1.5, 30000);
        connect();
      }, reconnectDelay.current);
    };

    ws.onerror = () => ws.close();
  }, [baseUrl, apiKey, agentId]);

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
