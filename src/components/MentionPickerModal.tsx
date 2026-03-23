import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal, View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, SafeAreaView, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const STORAGE_KEY_RECENT_MENTIONS = 'pincerRecentMentions';

export interface MentionAgent {
  id: string;
  name: string;
  type?: string;
}

interface Props {
  visible: boolean;
  agents: MentionAgent[];
  onConfirm: (selected: MentionAgent[]) => void;
  onClose: () => void;
}

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export async function recordMention(agentIds: string[]) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_RECENT_MENTIONS);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    // Move mentioned agents to front, dedup
    const updated = [
      ...agentIds,
      ...existing.filter(id => !agentIds.includes(id)),
    ].slice(0, 50);
    await AsyncStorage.setItem(STORAGE_KEY_RECENT_MENTIONS, JSON.stringify(updated));
  } catch { /* ignore */ }
}

export default function MentionPickerModal({ visible, agents, onConfirm, onClose }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [recentOrder, setRecentOrder] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setSelected(new Set());
      setQuery('');
      AsyncStorage.getItem(STORAGE_KEY_RECENT_MENTIONS)
        .then(raw => setRecentOrder(raw ? JSON.parse(raw) : []))
        .catch(() => {});
    }
  }, [visible]);

  const sortedAgents = useCallback(() => {
    const allOption: MentionAgent = { id: '__all__', name: 'all', type: 'special' };
    const filtered = agents.filter(a =>
      !query || a.name?.toLowerCase().includes(query.toLowerCase())
    );
    // Sort: recent mentions first, then by name
    const sorted = [...filtered].sort((a, b) => {
      const ai = recentOrder.indexOf(a.id);
      const bi = recentOrder.indexOf(b.id);
      if (ai === -1 && bi === -1) return (a.name || '').localeCompare(b.name || '');
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    if (!query || 'all'.includes(query.toLowerCase())) {
      return [allOption, ...sorted];
    }
    return sorted;
  }, [agents, query, recentOrder]);

  const toggle = (agent: MentionAgent) => {
    if (agent.id === '__all__') {
      // Select all or deselect all
      const allIds = new Set(agents.map(a => a.id));
      if (allIds.size === selected.size && agents.every(a => selected.has(a.id))) {
        setSelected(new Set());
      } else {
        setSelected(allIds);
      }
      return;
    }
    const next = new Set(selected);
    if (next.has(agent.id)) next.delete(agent.id);
    else next.add(agent.id);
    setSelected(next);
  };

  const handleConfirm = async () => {
    const chosenIds = Array.from(selected);
    const chosenAgents = agents.filter(a => selected.has(a.id));
    await recordMention(chosenIds);
    onConfirm(chosenAgents);
  };

  const list = sortedAgents();
  const allSelected = agents.length > 0 && agents.every(a => selected.has(a.id));

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.title}>选择成员</Text>
          <TouchableOpacity
            onPress={handleConfirm}
            style={[styles.headerBtn, selected.size === 0 && styles.disabledBtn]}
            disabled={selected.size === 0}
          >
            <Text style={[styles.confirmText, selected.size === 0 && styles.disabledText]}>
              确认{selected.size > 0 ? `（${selected.size}）` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={16} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="搜索成员..."
            placeholderTextColor="#9ca3af"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={16} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* List */}
        <FlatList
          data={list}
          keyExtractor={a => a.id}
          renderItem={({ item }) => {
            const isAll = item.id === '__all__';
            const isSelected = isAll ? allSelected : selected.has(item.id);
            const initial = item.name.charAt(0).toUpperCase();
            const isHuman = item.type === 'human';
            return (
              <TouchableOpacity style={styles.row} onPress={() => toggle(item)}>
                {isAll ? (
                  <View style={[styles.avatar, { backgroundColor: '#6366f1' }]}>
                    <Text style={{ fontSize: 18 }}>📢</Text>
                  </View>
                ) : (
                  <View style={[styles.avatar, { backgroundColor: isHuman ? '#10b981' : avatarColor(item.name) }]}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                )}
                <View style={styles.info}>
                  <Text style={styles.name}>{isAll ? 'all（全体）' : item.name}</Text>
                  {!isAll && (
                    <Text style={styles.sub}>{isHuman ? '👤 人类' : '🤖 AI'}</Text>
                  )}
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb',
  },
  headerBtn: { minWidth: 60 },
  title: { fontSize: 17, fontWeight: '700', color: '#1f2937' },
  cancelText: { fontSize: 16, color: '#6b7280' },
  confirmText: { fontSize: 16, fontWeight: '700', color: '#6366f1', textAlign: 'right' },
  disabledBtn: { opacity: 0.4 },
  disabledText: { color: '#9ca3af' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    margin: 12, paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1f2937' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  sub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  checkbox: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#d1d5db',
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxSelected: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#f3f4f6', marginLeft: 72 },
});
