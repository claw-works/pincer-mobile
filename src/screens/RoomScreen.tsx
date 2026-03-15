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

export default function RoomScreen({ route }: any) {
  const { id: roomId } = route.params;
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [text, setText] = useState('');
  const [agentId, setAgentId] = useState('');
  const lastTs = useRef('');
  const flatRef = useRef<FlatList>(null);
  const { getName } = useAgents();

  // Reload agentId when screen comes into focus (e.g. after binding identity)
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(STORAGE_KEY_HUMAN_AGENT_ID).then(id => { if (id) setAgentId(id); });
    }, [])
  );

  const loadInitial = useCallback(async () => {
    try {
      const msgs = await fetchRoomMessages(roomId, { limit: 50 });
      const sorted = [...msgs].reverse();
      setMessages(sorted);
      if (sorted.length) {
        lastTs.current = sorted[sorted.length - 1].created_at;
        // Cache last message for MessagesScreen
        const last = sorted[sorted.length - 1];
        AsyncStorage.setItem(
          'pincerLastRoom_' + roomId,
          JSON.stringify({ text: last.content || '', time: last.created_at })
        ).catch(() => {});
      }
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

  const send = async () => {
    const t = text.trim();
    if (!t || !agentId) return;
    try {
      const msg = await postRoomMessage(roomId, agentId, t);
      setMessages(prev => [...prev, msg]);
      lastTs.current = msg.created_at;
      setText('');
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
          <View style={[styles.inputRow, { paddingBottom: Platform.OS === 'android' ? 12 : 8 }]}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="发送消息..."
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
