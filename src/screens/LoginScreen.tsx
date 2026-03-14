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
} from 'react-native';
import { saveConfig, loadConfig } from '../api/client';
import { verifyApiKey } from '../api';

interface LoginScreenProps {
  onLoggedIn: () => void;
}

export default function LoginScreen({ onLoggedIn }: LoginScreenProps) {
  const [baseUrl, setBaseUrl] = useState('https://qxsdaynfunea.ap-northeast-1.clawcloudrun.com');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.logo}>🐾 Pincer</Text>
        <Text style={styles.subtitle}>任务协作平台</Text>

        <Text style={styles.label}>服务器地址</Text>
        <TextInput
          style={styles.input}
          value={baseUrl}
          onChangeText={setBaseUrl}
          placeholder="https://your-pincer-instance.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />

        <Text style={styles.label}>API Key</Text>
        <TextInput
          style={styles.input}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>登录</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222',
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
