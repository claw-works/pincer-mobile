import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { fetchRoomMessages, postRoomMessage } from '../api';
import { STORAGE_KEY_HUMAN_AGENT_ID } from '../api/client';
import { useAgents } from '../hooks/useAgents';
import type { RoomMessage } from '../types';

const CACHE_KEY = (roomId: string) => `pincerRoomMsgs_${roomId}`;
const MAX_CACHE = 50;

async function loadCache(roomId: string): Promise<RoomMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY(roomId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function saveCache(roomId: string, msgs: RoomMessage[]) {
  try {
    const toSave = msgs.slice(-MAX_CACHE);
    await AsyncStorage.setItem(CACHE_KEY(roomId), JSON.stringify(toSave));
  } catch { /* ignore */ }
}

export default function RoomScreen({ route }: any) {
  const { id: roomId } = route.params;
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [text, setText] = useState('');
  const [agentId, setAgentId] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');   // '' = no menu
  const [mentionSuggestions, setMentionSuggestions] = useState<{ id: string; name: string }[]>([]);
  const lastTs = useRef('');
  const flatRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const { agents, getName } = useAgents();

  const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
  const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(STORAGE_KEY_HUMAN_AGENT_ID).then(id => { if (id) setAgentId(id); });
    }, [])
  );

  const loadInitial = useCallback(async () => {
    // 1. Show cached messages immediately (no blank screen)
    const cached = await loadCache(roomId);
    if (cached.length) {
      setMessages(cached);
      lastTs.current = cached[cached.length - 1].created_at;
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 50);
    }

    // 2. Fetch from server — if we have cache, fetch only since last message
    try {
      const params = lastTs.current
        ? { since: lastTs.current, limit: 50 }
        : { limit: 50 };
      const msgs = await fetchRoomMessages(roomId, params);

      setMessages(prev => {
        let merged: RoomMessage[];
        if (prev.length === 0) {
          // No cache — server returned full list (oldest first when using since, but reverse for initial)
          merged = [...msgs].reverse();
        } else {
          // Merge new messages with cached
          const ids = new Set(prev.map(m => m.id));
          const fresh = msgs.filter(m => !ids.has(m.id));
          merged = [...prev, ...fresh];
        }
        saveCache(roomId, merged);
        if (merged.length) {
          lastTs.current = merged[merged.length - 1].created_at;
          // Cache last msg for MessagesScreen
          AsyncStorage.setItem('pincerLastRoom_' + roomId, JSON.stringify({ text: merged[merged.length - 1].content || '', time: merged[merged.length - 1].created_at })).catch(() => {});
        }
        return merged;
      });
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (e) { console.error(e); }
  }, [roomId]);

  useEffect(() => {
    loadInitial();
    const interval = setInterval(async () => {
      if (!lastTs.current) return;
      try {
        const newMsgs = await fetchRoomMessages(roomId, { since: lastTs.current, limit: 50 });
        if (!newMsgs.length) return;
        setMessages(prev => {
          const ids = new Set(prev.map(m => m.id));
          const fresh = newMsgs.filter(m => !ids.has(m.id));
          return fresh.length ? [...prev, ...fresh] : prev;
        });
        lastTs.current = newMsgs[newMsgs.length - 1].created_at;
      } catch (e) { /* silent */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [roomId, loadInitial]);

  // Parse @ mentions as user types
  const handleTextChange = (val: string) => {
    setText(val);
    // Find the last @ in the text
    const atIdx = val.lastIndexOf('@');
    if (atIdx >= 0) {
      const query = val.slice(atIdx + 1);
      // Only show if no space after @
      if (!query.includes(' ') && !query.includes('\n')) {
        setMentionQuery(query);
        const q = query.toLowerCase();
        // Add @all option + agents filtered by query
        const allOption = { id: '__all__', name: 'all' };
        const filtered = agents
          .filter(a => a.name?.toLowerCase().includes(q) || 'all'.includes(q))
          .map(a => ({ id: a.id, name: a.name || a.id.slice(0, 8) }));
        const suggestions = q === '' || 'all'.startsWith(q)
          ? [allOption, ...filtered]
          : filtered;
        setMentionSuggestions(suggestions.slice(0, 6));
        return;
      }
    }
    setMentionQuery('');
    setMentionSuggestions([]);
  };

  const insertMention = (agent: { id: string; name: string }) => {
    const atIdx = text.lastIndexOf('@');
    const before = text.slice(0, atIdx);
    const mention = agent.id === '__all__' ? '@all' : `@${agent.name}`;
    const newText = before + mention + ' ';
    setText(newText);
    setMentionSuggestions([]);
    setMentionQuery('');
    inputRef.current?.focus();
  };

  const send = async () => {
    const t = text.trim();
    if (!t || !agentId) return;
    try {
      const msg = await postRoomMessage(roomId, agentId, t);
      setMessages(prev => [...prev, msg]);
      lastTs.current = msg.created_at;
      setText('');
      setMentionSuggestions([]);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) { console.error(e); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={m => m.id}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatRef.current?.scrollToEnd({ animated: false })}
          contentContainerStyle={{ padding: 12, paddingBottom: 8 }}
          renderItem={({ item }) => {
            const isMine = item.sender_agent_id === agentId;
            const senderName = getName(item.sender_agent_id);
            return (
              <View style={[styles.bubbleWrap, isMine ? styles.mineWrap : styles.theirsWrap]}>
                {!isMine && <Text style={styles.sender}>{senderName}</Text>}
                <View style={[styles.bubble, isMine ? styles.mineBubble : styles.theirsBubble]}>
                  <Text style={[styles.msgText, isMine && { color: '#fff' }]}>{item.content}</Text>
                  <Text style={[styles.time, isMine && { color: 'rgba(255,255,255,0.7)' }]}>
                    {new Date(item.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {!agentId ? (
          <View style={styles.noIdentityBar}>
            <Text style={styles.noIdentityText}>请在「我的」页面绑定人类身份后才能发送消息</Text>
          </View>
        ) : (
          <View>
            {/* @ mention autocomplete */}
            {mentionSuggestions.length > 0 && (
              <View style={styles.mentionPanel}>
                {mentionSuggestions.map(agent => (
                  <TouchableOpacity
                    key={agent.id}
                    style={styles.mentionItem}
                    onPress={() => insertMention(agent)}
                  >
                    {agent.id === '__all__' ? (
                      <View style={[styles.mentionAvatarCircle, { backgroundColor: '#6366f1' }]}>
                        <Text style={{ fontSize: 14 }}>📢</Text>
                      </View>
                    ) : (
                      <View style={[styles.mentionAvatarCircle, { backgroundColor: avatarColor(agent.name) }]}>
                        <Text style={styles.mentionAvatarInitial}>{agent.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <Text style={styles.mentionName}>
                      {agent.id === '__all__' ? 'all（全体）' : agent.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={[styles.inputRow, { paddingBottom: Platform.OS === 'android' ? 12 : 8 }]}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={text}
                onChangeText={handleTextChange}
                placeholder="发送消息... @ 联系人"
                placeholderTextColor="#9ca3af"
                multiline
                maxLength={500}
                blurOnSubmit={false}
                returnKeyType="default"
              />
              <TouchableOpacity
                style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
                onPress={send}
                disabled={!text.trim()}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bubbleWrap: { marginBottom: 8 },
  mineWrap: { alignItems: 'flex-end' },
  theirsWrap: { alignItems: 'flex-start' },
  sender: { fontSize: 11, color: '#6b7280', marginBottom: 2, fontWeight: '600' },
  bubble: { maxWidth: '80%', borderRadius: 16, padding: 10 },
  mineBubble: { backgroundColor: '#6366f1', borderBottomRightRadius: 4 },
  theirsBubble: { backgroundColor: '#e5e7eb', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 14, color: '#1f2937', lineHeight: 20 },
  time: { fontSize: 10, color: '#9ca3af', marginTop: 4, alignSelf: 'flex-end' },
  mentionPanel: {
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#e5e7eb',
    maxHeight: 200,
  },
  mentionItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f3f4f6',
  },
  mentionAvatarCircle: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
  },
  mentionAvatarInitial: { color: '#fff', fontSize: 14, fontWeight: '700' },
  mentionName: { fontSize: 14, color: '#1f2937', fontWeight: '500' },
  inputRow: {
    flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb',
    backgroundColor: '#fff', alignItems: 'flex-end',
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, marginRight: 8,
    maxHeight: 120, backgroundColor: '#f9fafb',
  },
  sendBtn: { backgroundColor: '#6366f1', width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  noIdentityBar: { backgroundColor: '#fef3c7', padding: 12, borderTopWidth: 1, borderTopColor: '#fde68a', alignItems: 'center' },
  noIdentityText: { fontSize: 13, color: '#92400e', textAlign: 'center' },
});
