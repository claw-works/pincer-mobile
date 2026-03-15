import { useState, useEffect } from 'react';
import { fetchAgents } from '../api';
import type { Agent } from '../types';

let _cache: Agent[] | null = null;
let _cacheTime = 0;
const CACHE_TTL = 60000; // 1 min

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>(_cache || []);

  useEffect(() => {
    if (_cache && Date.now() - _cacheTime < CACHE_TTL) {
      setAgents(_cache);
      return;
    }
    fetchAgents().then(a => {
      _cache = a;
      _cacheTime = Date.now();
      setAgents(a);
    }).catch(() => {});
  }, []);

  const getName = (id?: string) => {
    if (!id) return '';
    const a = agents.find(ag => ag.id === id);
    return a?.name || id.slice(0, 8);
  };

  return { agents, getName };
}
