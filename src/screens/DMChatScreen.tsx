import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchDMs, sendDM } from '../api';

const STORAGE_KEY_LAST_DM = 'pincerLastDm_';

type DMsg = {
  id: string;
  from_agent_id: string;
  to_agent_id: string;
  payload: { text: string };
  created_at: string;
};

export default function DMChatScreen({ route }: any) {
  const { partnerId, name, myId } = route.params as {
    partnerId: string;
    name: string;
    myId: string;
  };

  const [messages, setMessages] = useState<DMsg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    try {
      const msgs = await fetchDMs(myId, partnerId, { limit: 50 });
      // Filter: only messages between myId and partnerId
      const filtered = msgs.filter(m =>
        (m.from_agent_id === myId && m.to_agent_id === partnerId) ||
        (m.from_agent_id === partnerId && m.to_agent_id === myId)
      );
      const sorted = [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      setMessages(sorted);
      // Cache last message for DMListScreen
      if (sorted.length) {
        const last = sorted[sorted.length - 1];
        await AsyncStorage.setItem(
          STORAGE_KEY_LAST_DM + partnerId,
          JSON.stringify({ text: last.payload?.text || '', time: last.created_at })
        );
      }
    } catch (e) { console.error(e); }
  }, [myId, partnerId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const handleSend = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    // Optimistic update: show message immediately
    const optimisticMsg: DMsg = {
      id: `opt_${Date.now()}`,
      from_agent_id: myId,
      to_agent_id: partnerId,
      payload: { text: t },
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setText('');
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 50);
    try {
      const sent = await sendDM(myId, partnerId, t);
      // Replace optimistic with real message if server returns it
      if (sent && (sent as any).id) {
        setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? { ...optimisticMsg, id: (sent as any).id } : m));
      }
      // Cache last message
      await AsyncStorage.setItem(
        STORAGE_KEY_LAST_DM + partnerId,
        JSON.stringify({ text: t, time: new Date().toISOString() })
      );
    } catch (e) {
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      console.error(e);
    }
    setSending(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={m => m.id}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatRef.current?.scrollToEnd({ animated: false })}
          contentContainerStyle={{ padding: 12, paddingBottom: 4 }}
          ListEmptyComponent={
            <Text style={styles.empty}>暂无消息，发送第一条吧 👋</Text>
          }
          renderItem={({ item }) => {
            const isMine = item.from_agent_id === myId;
            const msgText = item.payload?.text || '';
            return (
              <View style={[styles.bubbleWrap, isMine ? styles.mineWrap : styles.theirsWrap]}>
                {!isMine && (
                  <View style={styles.theirAvatar}>
                    <Text style={styles.theirAvatarText}>{name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View style={[styles.bubble, isMine ? styles.mineBubble : styles.theirsBubble]}>
                  <Text style={[styles.msgText, isMine && { color: '#fff' }]}>{msgText}</Text>
                  <Text style={[styles.time, isMine && { color: 'rgba(255,255,255,0.7)' }]}>
                    {new Date(item.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={`发消息给 ${name}...`}
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={500}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 60, fontSize: 14 },
  bubbleWrap: { marginBottom: 8, flexDirection: 'row', alignItems: 'flex-end' },
  mineWrap: { justifyContent: 'flex-end' },
  theirsWrap: { justifyContent: 'flex-start' },
  theirAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  theirAvatarText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  bubble: { maxWidth: '75%', borderRadius: 16, padding: 10 },
  mineBubble: { backgroundColor: '#6366f1', borderBottomRightRadius: 4 },
  theirsBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb' },
  msgText: { fontSize: 14, color: '#1f2937', lineHeight: 20 },
  time: { fontSize: 10, color: '#9ca3af', marginTop: 4, alignSelf: 'flex-end' },
  inputRow: {
    flexDirection: 'row', padding: 8, paddingBottom: Platform.OS === 'android' ? 12 : 8,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e5e7eb',
    backgroundColor: '#fff', alignItems: 'flex-end',
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    marginRight: 8, maxHeight: 120, backgroundColor: '#f9fafb',
  },
  sendBtn: { backgroundColor: '#6366f1', width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { color: '#fff', fontSize: 16, marginLeft: 2 },
});
