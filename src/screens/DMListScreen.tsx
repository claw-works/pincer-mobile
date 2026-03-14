import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAgents, fetchDMs } from '../api';
import { STORAGE_KEY_HUMAN_AGENT_ID } from '../api/client';
import type { Agent } from '../types';

const STORAGE_KEY_LAST_DM = 'pincerLastDm_';

interface PartnerItem extends Agent {
  lastMessage?: string;
  lastTime?: string;
}

export default function DMListScreen({ navigation }: any) {
  const [myId, setMyId] = useState<string | null>(null);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (selfId: string) => {
    try {
      const agents = await fetchAgents();
      const others = agents.filter(a => a.id !== selfId);

      // For each agent, load cached last message from AsyncStorage
      const withLast = await Promise.all(
        others.map(async (a) => {
          const cached = await AsyncStorage.getItem(STORAGE_KEY_LAST_DM + a.id);
          if (cached) {
            const { text, time } = JSON.parse(cached);
            return { ...a, lastMessage: text, lastTime: time };
          }
          return { ...a };
        })
      );
      setPartners(withLast);
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_HUMAN_AGENT_ID).then(id => {
      setMyId(id);
      if (id) load(id);
      else { setLoading(false); }
    });
  }, []);

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6366f1" />;

  if (!myId) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>👤</Text>
        <Text style={styles.emptyText}>请先在「我的」页面绑定人类身份{'\n'}才能发送私信</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={partners}
      keyExtractor={a => a.id}
      contentContainerStyle={{ paddingVertical: 4 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(myId); }} />
      }
      ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#9ca3af', marginTop: 60 }}>暂无伙伴</Text>}
      renderItem={({ item }) => {
        const initial = (item.name || item.id).charAt(0).toUpperCase();
        const isAgent = item.type !== 'human';
        return (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('DMChat', { partnerId: item.id, name: item.name || item.id.slice(0, 8), myId })}
          >
            <View style={[styles.avatar, isAgent ? styles.agentAvatar : styles.humanAvatar]}>
              <Text style={styles.avatarText}>{initial}</Text>
              {isAgent && <View style={styles.agentDot} />}
            </View>
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name || item.id.slice(0, 8)}</Text>
                {item.lastTime && <Text style={styles.time}>{formatTime(item.lastTime)}</Text>}
              </View>
              <Text style={styles.lastMsg} numberOfLines={1}>
                {item.lastMessage || (isAgent ? '🤖 AI 助手' : '👤 人类')}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f3f4f6',
  },
  avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 12, position: 'relative' },
  agentAvatar: { backgroundColor: '#6366f1' },
  humanAvatar: { backgroundColor: '#10b981' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  agentDot: { position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#fff' },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  time: { fontSize: 12, color: '#9ca3af' },
  lastMsg: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 15, color: '#9ca3af', textAlign: 'center', lineHeight: 24 },
});
