import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY_HUMAN_AGENT_ID, STORAGE_KEY_API_KEY, clearConfig, getConfig } from '../api/client';
import { registerHuman, fetchAgents } from '../api';
import { useTheme } from '../theme/ThemeContext';
import type { Agent } from '../types';
import { useLang } from '../i18n/LangContext';

const STORAGE_KEY_HUMAN_NAME = 'pincerHumanName';

interface Props {
  onLogout: () => void;
}

export default function ProfileScreen({ onLogout }: Props) {
  const { theme, colors, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLang();
  const [humanId, setHumanId] = useState<string | null>(null);
  const [humanName, setHumanName] = useState<string>('');
  const [nameInput, setNameInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [humanAgents, setHumanAgents] = useState<Agent[]>([]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_HUMAN_AGENT_ID),
      AsyncStorage.getItem(STORAGE_KEY_HUMAN_NAME),
      fetchAgents().catch(() => [] as Agent[]),
    ]).then(([id, name, agents]) => {
      setHumanId(id);
      setHumanName(name || '');
      // Show only human-type agents, filter out self if already bound
      const humans = (agents as Agent[]).filter(a => a.type === 'human' && a.id !== id);
      setHumanAgents(humans);
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
      Alert.alert(lang === 'zh' ? '✅ 绑定成功' : '✅ Identity bound', `${lang === 'zh' ? '已绑定人类身份：' : 'Bound: '}${agent.name || agent.id.slice(0, 8)}`);
    } catch (e: any) {
      Alert.alert(lang === 'zh' ? '绑定失败' : 'Binding failed', e?.message ?? (lang === 'zh' ? '未知错误' : 'Unknown error'));
    }
    setRegistering(false);
  };

  const handleUnlink = async () => {
    Alert.alert(lang === 'zh' ? '解绑人类身份' : 'Unlink Identity', lang === 'zh' ? '确认解除绑定？' : 'Confirm unlink?', [
      { text: lang === 'zh' ? '取消' : 'Cancel' },
      {
        text: lang === 'zh' ? '确认' : 'Confirm',
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
    Alert.alert(lang === 'zh' ? '退出登录' : 'Log Out', lang === 'zh' ? '确认退出？所有配置将清除。' : 'Confirm logout? All config cleared.', [
      { text: lang === 'zh' ? '取消' : 'Cancel' },
      { text: lang === 'zh' ? '退出' : 'Log Out', style: 'destructive', onPress: async () => { await clearConfig(); onLogout(); } },
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
          <Text style={styles.sectionTitle}>{lang === 'zh' ? '🌐 连接信息' : '🌐 Connection'}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{lang === 'zh' ? '服务器' : 'Server'}</Text>
            <Text style={styles.value} numberOfLines={1}>{baseUrl || (lang === 'zh' ? '未配置' : 'Not set')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>API Key</Text>
            <Text style={styles.value} numberOfLines={1}>
              {apiKey ? `${apiKey.slice(0, 8)}••••••••` : (lang === 'zh' ? '未配置' : 'Not set')}
            </Text>
          </View>
        </View>

        {/* Human identity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{lang === 'zh' ? '👤 人类身份' : '👤 Identity'}</Text>
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
              <Text style={styles.hint}>{lang === 'zh' ? '已绑定人类身份，可以审批/拒绝任务' : 'Identity bound — you can approve/reject tasks'}</Text>
              <TouchableOpacity style={styles.unlinkBtn} onPress={handleUnlink}>
                <Text style={styles.unlinkText}>{lang === 'zh' ? '解绑人类身份' : 'Unlink Identity'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.hint}>{lang === 'zh' ? '绑定人类身份后可以在手机上 Approve / Reject 任务' : 'Bind your identity to Approve / Reject tasks on mobile'}</Text>

              {/* Existing human agents to select from (a195f5ad) */}
              {humanAgents.length > 0 && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={[styles.label, { marginBottom: 8 }]}>{lang === 'zh' ? '选择已注册身份' : 'Select existing identity'}</Text>
                  {humanAgents.map(agent => (
                    <TouchableOpacity
                      key={agent.id}
                      style={styles.agentSelectRow}
                      onPress={async () => {
                        await AsyncStorage.setItem(STORAGE_KEY_HUMAN_AGENT_ID, agent.id);
                        await AsyncStorage.setItem('pincerHumanName', agent.name || agent.id.slice(0, 8));
                        setHumanId(agent.id);
                        setHumanName(agent.name || agent.id.slice(0, 8));
                      }}
                    >
                      <View style={styles.agentSelectAvatar}>
                        <Text style={styles.agentSelectAvatarText}>{(agent.name || agent.id).charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.agentSelectName}>{agent.name || agent.id.slice(0, 8)}</Text>
                        <Text style={styles.agentSelectId} numberOfLines={1}>{agent.id.slice(0, 20)}…</Text>
                      </View>
                      {agent.status === 'online' && <View style={styles.onlineDot} />}
                    </TouchableOpacity>
                  ))}
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>{lang === 'zh' ? '或创建新身份' : 'or create new identity'}</Text>
                    <View style={styles.dividerLine} />
                  </View>
                </View>
              )}

              <Text style={styles.label}>{lang === 'zh' ? '你的名字' : 'Your Name'}</Text>
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
                  <Text style={styles.registerBtnText}>{lang === 'zh' ? '绑定人类身份' : 'Bind Identity'}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout */}
        {/* Theme + Language toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{lang === 'zh' ? '🎨 外观 / Appearance' : '🎨 Appearance / 外观'}</Text>
          <View style={styles.themeRow}>
            <View>
              <Text style={styles.themeLabel}>{theme === 'dark' ? '🖥️ 极客暗黑模式' : '☀️ 明亮模式'}</Text>
              <Text style={[styles.hint, { marginBottom: 0 }]}>{theme === 'dark' ? (lang === 'zh' ? '黑绿配色，程序员最爱' : 'Black & green, dev style') : (lang === 'zh' ? '清爽白色，日常使用' : 'Clean white, daily use')}</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#e5e7eb', true: '#00ff87' }}
              thumbColor={theme === 'dark' ? '#0d1117' : '#ffffff'}
            />
          </View>
          <View style={[styles.themeRow, { marginTop: 12 }]}>
            <Text style={styles.themeLabel}>🌐 语言 / Language</Text>
            <View style={styles.langSegment}>
              {(['zh', 'en'] as const).map(l => (
                <TouchableOpacity
                  key={l}
                  style={[styles.langBtn, lang === l && styles.langBtnActive]}
                  onPress={() => { if (lang !== l) toggleLang(); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.langBtnText, lang === l && styles.langBtnTextActive]}>
                    {l === 'zh' ? '中文' : 'EN'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>{lang === 'zh' ? '退出登录' : 'Log Out'}</Text>
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
  agentSelectRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 6, backgroundColor: '#fafafa' },
  agentSelectAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
  agentSelectAvatarText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  agentSelectName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  agentSelectId: { fontSize: 10, color: '#9ca3af', fontFamily: 'monospace' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { fontSize: 11, color: '#9ca3af' },
  registerBtn: {
    backgroundColor: '#6366f1', borderRadius: 8, padding: 13, alignItems: 'center',
  },
  registerBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  unlinkBtn: { marginTop: 8, padding: 8 },
  unlinkText: { color: '#ef4444', fontSize: 13, textAlign: 'center' },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  themeLabel: { fontSize: 15, fontWeight: '600', color: '#1f2937', marginBottom: 2 },
  langSegment: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  langBtn: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#f9fafb' },
  langBtnActive: { backgroundColor: '#6366f1' },
  langBtnText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  langBtnTextActive: { color: '#fff' },
  logoutBtn: {
    borderWidth: 1, borderColor: '#fca5a5', borderRadius: 10, padding: 14,
    alignItems: 'center', marginTop: 8,
  },
  logoutText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
});
