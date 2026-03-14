import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY_HUMAN_AGENT_ID, STORAGE_KEY_API_KEY, clearConfig, getConfig } from '../api/client';
import { registerHuman } from '../api';

const STORAGE_KEY_HUMAN_NAME = 'pincerHumanName';

interface Props {
  onLogout: () => void;
}

export default function ProfileScreen({ onLogout }: Props) {
  const [humanId, setHumanId] = useState<string | null>(null);
  const [humanName, setHumanName] = useState<string>('');
  const [nameInput, setNameInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_HUMAN_AGENT_ID),
      AsyncStorage.getItem(STORAGE_KEY_HUMAN_NAME),
    ]).then(([id, name]) => {
      setHumanId(id);
      setHumanName(name || '');
      const cfg = getConfig();
      setApiKey(cfg?.apiKey || '');
      setBaseUrl(cfg?.baseUrl || '');
      setLoading(false);
    });
  }, []);

  const handleRegister = async () => {
    if (!nameInput.trim()) return;
    setRegistering(true);
    try {
      const agent = await registerHuman(nameInput.trim());
      await AsyncStorage.setItem(STORAGE_KEY_HUMAN_AGENT_ID, agent.id);
      await AsyncStorage.setItem(STORAGE_KEY_HUMAN_NAME, agent.name || nameInput.trim());
      setHumanId(agent.id);
      setHumanName(agent.name || nameInput.trim());
      setNameInput('');
      Alert.alert('✅ 绑定成功', `已绑定人类身份：${agent.name || agent.id.slice(0, 8)}`);
    } catch (e: any) {
      Alert.alert('绑定失败', e?.message ?? '未知错误');
    }
    setRegistering(false);
  };

  const handleUnlink = async () => {
    Alert.alert('解绑人类身份', '确认解除绑定？', [
      { text: '取消' },
      {
        text: '确认',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem(STORAGE_KEY_HUMAN_AGENT_ID);
          await AsyncStorage.removeItem(STORAGE_KEY_HUMAN_NAME);
          setHumanId(null);
          setHumanName('');
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('退出登录', '确认退出？所有配置将清除。', [
      { text: '取消' },
      { text: '退出', style: 'destructive', onPress: async () => { await clearConfig(); onLogout(); } },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6366f1" />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
        {/* Connection info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 连接信息</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>服务器</Text>
            <Text style={styles.value} numberOfLines={1}>{baseUrl || '未配置'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>API Key</Text>
            <Text style={styles.value} numberOfLines={1}>
              {apiKey ? `${apiKey.slice(0, 8)}••••••••` : '未配置'}
            </Text>
          </View>
        </View>

        {/* Human identity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 人类身份</Text>
          {humanId ? (
            <View>
              <View style={styles.identityCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(humanName || humanId).charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.identityName}>{humanName || humanId.slice(0, 8)}</Text>
                  <Text style={styles.identityId} numberOfLines={1}>{humanId}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ 已认证</Text>
                </View>
              </View>
              <Text style={styles.hint}>已绑定人类身份，可以审批/拒绝任务</Text>
              <TouchableOpacity style={styles.unlinkBtn} onPress={handleUnlink}>
                <Text style={styles.unlinkText}>解绑人类身份</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.hint}>绑定人类身份后可以在手机上 Approve / Reject 任务</Text>
              <Text style={styles.label}>你的名字</Text>
              <TextInput
                style={styles.input}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Cloudbeer"
                autoCapitalize="words"
              />
              <TouchableOpacity
                style={[styles.registerBtn, (registering || !nameInput.trim()) && { opacity: 0.5 }]}
                onPress={handleRegister}
                disabled={registering || !nameInput.trim()}
              >
                {registering ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerBtnText}>绑定人类身份</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1f2937', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#6b7280', width: 80 },
  value: { flex: 1, fontSize: 13, color: '#374151' },
  hint: { fontSize: 13, color: '#9ca3af', marginBottom: 12, lineHeight: 18 },
  identityCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  identityName: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  identityId: { fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' },
  verifiedBadge: { backgroundColor: '#dcfce7', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  verifiedText: { color: '#16a34a', fontSize: 11, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    backgroundColor: '#fafafa', marginBottom: 12, marginTop: 4,
  },
  registerBtn: {
    backgroundColor: '#6366f1', borderRadius: 8, padding: 13, alignItems: 'center',
  },
  registerBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  unlinkBtn: { marginTop: 8, padding: 8 },
  unlinkText: { color: '#ef4444', fontSize: 13, textAlign: 'center' },
  logoutBtn: {
    borderWidth: 1, borderColor: '#fca5a5', borderRadius: 10, padding: 14,
    alignItems: 'center', marginTop: 8,
  },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
});
