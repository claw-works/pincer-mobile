import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { clearConfig } from '../api/client';

// Placeholder screens
const TasksScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>📋 Tasks</Text>
    <Text style={styles.placeholderSub}>Coming soon</Text>
  </View>
);

const RoomsScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>💬 Room</Text>
    <Text style={styles.placeholderSub}>Coming soon</Text>
  </View>
);

const ReportsScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>📊 Reports</Text>
    <Text style={styles.placeholderSub}>Coming soon</Text>
  </View>
);

type Tab = 'tasks' | 'room' | 'reports';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'tasks', label: '任务', icon: '📋' },
  { key: 'room', label: '频道', icon: '💬' },
  { key: 'reports', label: '日报', icon: '📊' },
];

interface MainScreenProps {
  onLogout: () => void;
}

export default function MainScreen({ onLogout }: MainScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('tasks');

  const handleLogout = async () => {
    await clearConfig();
    onLogout();
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'tasks': return <TasksScreen />;
      case 'room': return <RoomsScreen />;
      case 'reports': return <ReportsScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🐾 Pincer</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutBtn}>退出</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Bottom tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  logoutBtn: { fontSize: 14, color: '#6366f1' },
  content: { flex: 1 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 48, marginBottom: 8 },
  placeholderSub: { fontSize: 14, color: '#aaa' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 10 },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: 11, color: '#aaa', marginTop: 2 },
  tabLabelActive: { color: '#6366f1', fontWeight: '600' },
});
