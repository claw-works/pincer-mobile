import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { saveConfig, loadConfig } from '../api/client';
import { verifyApiKey } from '../api';

interface LoginScreenProps {
  onLoggedIn: () => void;
}

export default function LoginScreen({ onLoggedIn }: LoginScreenProps) {
  const [baseUrl, setBaseUrl] = useState('https://pincer.apig.run');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleLogin = async () => {
    const url = baseUrl.trim().replace(/\/$/, '');
    const key = apiKey.trim();
    if (!url || !key) {
      Alert.alert('错误', '请填写服务器地址和 API Key');
      return;
    }
    setLoading(true);
    try {
      const ok = await verifyApiKey(url, key);
      if (!ok) {
        Alert.alert('验证失败', 'API Key 无效，请检查后重试');
        return;
      }
      await saveConfig({ baseUrl: url, apiKey: key });
      onLoggedIn();
    } catch (e: any) {
      Alert.alert('连接失败', e?.message ?? '未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        {/* Logo */}
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Pincer</Text>
        <Text style={styles.subtitle}>任务协作平台</Text>

        <Text style={styles.label}>服务器地址</Text>
        <TextInput
          style={styles.input}
          value={baseUrl}
          onChangeText={setBaseUrl}
          placeholder="https://pincer.apig.run"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />

        <Text style={styles.label}>API Key</Text>
        <View style={styles.keyRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={!showKey}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowKey(v => !v)}>
            <Text style={{ fontSize: 18 }}>{showKey ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>连接</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 8,
    borderRadius: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1f2937',
    backgroundColor: '#fafafa',
    marginBottom: 0,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeBtn: {
    padding: 10,
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
