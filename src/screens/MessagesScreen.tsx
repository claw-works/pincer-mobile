/**
 * MessagesScreen: WeChat-style unified messages list
 * - Room pinned at top (群聊)
 * - Below: DM partners list
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, SectionList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { fetchAgents, fetchRooms } from '../api';
import { STORAGE_KEY_HUMAN_AGENT_ID } from '../api/client';
import type { Agent } from '../types';

const STORAGE_KEY_LAST_DM = 'pincerLastDm_';
const STORAGE_KEY_LAST_ROOM = 'pincerLastRoom_';

interface PartnerItem extends Agent {
  lastMessage?: string;
  lastTime?: string;
}

interface RoomItem {
  id: string;
  name: string;
  lastMessage?: string;
  lastTime?: string;
}

export default function MessagesScreen({ navigation }: any) {
  const [myId, setMyId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const selfId = await AsyncStorage.getItem(STORAGE_KEY_HUMAN_AGENT_ID);
    setMyId(selfId);

    try {
      // Load rooms
      const roomData: any = await fetchRooms();
      const roomList: RoomItem[] = (Array.isArray(roomData) ? roomData : roomData.rooms || []).map((r: any) => ({
        id: r.id, name: r.name || r.id,
      }));
      // Load cached last messages for rooms
      const roomsWithCache = await Promise.all(
        roomList.map(async r => {
          const cached = await AsyncStorage.getItem(STORAGE_KEY_LAST_ROOM + r.id);
          if (cached) {
            const { text, time } = JSON.parse(cached);
            return { ...r, lastMessage: text, lastTime: time };
          }
          return r;
        })
      );
      setRooms(roomsWithCache);

      // Load partners (only if bound)
      if (selfId) {
        const agents = await fetchAgents();
        const others = agents.filter(a => a.id !== selfId);
        const withCache = await Promise.all(
          others.map(async a => {
            const cached = await AsyncStorage.getItem(STORAGE_KEY_LAST_DM + a.id);
            if (cached) {
              const { text, time } = JSON.parse(cached);
              return { ...a, lastMessage: text, lastTime: time };
            }
            return { ...a };
          })
        );
        withCache.sort((a, b) => {
          if (a.lastTime && b.lastTime) return new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime();
          if (a.lastTime) return -1;
          if (b.lastTime) return 1;
          return 0;
        });
        setPartners(withCache);
      }
    } catch (e) { console.error(e); }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  };

  const sections = [
    { title: '', key: 'rooms', data: rooms as any[] },
    ...(myId && partners.length ? [{ title: '伙伴', key: 'partners', data: partners as any[] }] : []),
    ...(!myId ? [{ title: '', key: 'bind', data: [{ id: '__bind__' }] }] : []),
  ];

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6366f1" />;

  return (
    <SectionList
      sections={sections}
      keyExtractor={item => item.id}
      stickySectionHeadersEnabled={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      renderSectionHeader={({ section }: any) =>
        section.title ? (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        ) : null
      }
      renderItem={({ item, section }: any) => {
        // Bind identity prompt
        if (item.id === '__bind__') {
          return (
            <TouchableOpacity style={styles.bindRow} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.bindText}>绑定人类身份后可与伙伴私聊 →</Text>
            </TouchableOpacity>
          );
        }

        // Room item
        if (section.key === 'rooms') {
          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate('Room', { id: item.id, name: item.name })}
            >
              <View style={styles.roomAvatar}>
                <Text style={styles.roomAvatarText}>💬</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.lastTime && <Text style={styles.time}>{formatTime(item.lastTime)}</Text>}
                </View>
                <Text style={styles.lastMsg} numberOfLines={1}>
                  {item.lastMessage || '群聊频道'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }

        // Partner (DM) item
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
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  sectionHeader: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, backgroundColor: '#f3f4f6' },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f3f4f6',
  },
  roomAvatar: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  roomAvatarText: { fontSize: 22 },
  avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 12, position: 'relative' },
  agentAvatar: { backgroundColor: '#8b5cf6' },
  humanAvatar: { backgroundColor: '#10b981' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  agentDot: { position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#fff' },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  time: { fontSize: 12, color: '#9ca3af' },
  lastMsg: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  chevron: { fontSize: 18, color: '#d1d5db', marginLeft: 4 },
  bindRow: { backgroundColor: '#eff6ff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f3f4f6' },
  bindText: { fontSize: 13, color: '#3b82f6', textAlign: 'center' },
});
