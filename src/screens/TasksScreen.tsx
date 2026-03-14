import React, { useEffect, useState, useCallback } from 'react';
import {
  SectionList, TouchableOpacity, Text, View, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { fetchTasks, fetchProjects } from '../api';
import type { Task } from '../types';

const STATUS_COLOR: Record<string, string> = {
  review: '#f59e0b', running: '#3b82f6', assigned: '#8b5cf6',
  pending: '#6b7280', done: '#10b981', failed: '#ef4444', rejected: '#ef4444',
};
const STATUS_ORDER = ['review', 'running', 'assigned', 'pending', 'done', 'failed', 'rejected'];
const TYPE_LABEL: Record<string, string> = {
  epic: '🏗 Epic', story: '📖 Story', task: '',
};

type SectionData = { title: string; key: string; data: Task[] };

export default function TasksScreen({ navigation }: any) {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    try {
      const [tasks, projects] = await Promise.all([
        fetchTasks({ limit: 200 }),
        fetchProjects(),
      ]);
      const projectMap: Record<string, string> = {};
      for (const p of projects) projectMap[p.id] = p.name;

      const groups: Record<string, Task[]> = { __none__: [] };
      for (const t of tasks) {
        const pid = t.project_id || '__none__';
        if (!groups[pid]) groups[pid] = [];
        groups[pid].push(t);
      }
      const sort = (arr: Task[]) =>
        [...arr].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));

      const result: SectionData[] = [];
      for (const [pid, ptasks] of Object.entries(groups)) {
        if (pid === '__none__') continue;
        result.push({ title: projectMap[pid] || pid.slice(0, 8), key: pid, data: sort(ptasks) });
      }
      if (groups['__none__']?.length)
        result.push({ title: '未分类', key: '__none__', data: sort(groups['__none__']) });
      setSections(result);
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (key: string) => setCollapsed(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#6366f1" />;

  return (
    <SectionList
      sections={sections.map(s => ({ ...s, data: collapsed.has(s.key) ? [] : s.data }))}
      keyExtractor={t => t.id}
      contentContainerStyle={{ padding: 12 }}
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
      renderSectionHeader={({ section }) => {
        const sec = section as SectionData;
        const total = sections.find(s => s.key === sec.key)?.data.length ?? 0;
        return (
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggle(sec.key)}>
            <Text style={styles.sectionTitle}>
              {collapsed.has(sec.key) ? '▶' : '▼'} 📁 {sec.title}
            </Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{total}</Text>
            </View>
          </TouchableOpacity>
        );
      }}
      renderItem={({ item }) => {
        const indent = item.task_type === 'task' ? 24 : item.task_type === 'story' ? 12 : 0;
        return (
          <TouchableOpacity
            style={[styles.row, { marginLeft: indent }]}
            onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
          >
            <View style={styles.rowTop}>
              <View style={{ flex: 1, marginRight: 8 }}>
                {item.task_type && item.task_type !== 'task' && (
                  <Text style={styles.typeLabel}>{TYPE_LABEL[item.task_type]}</Text>
                )}
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] || '#6b7280' }]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f3f4f6', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 4, marginTop: 8,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#374151', flex: 1 },
  countBadge: { backgroundColor: '#6366f1', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  countText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  row: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 6, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  typeLabel: { fontSize: 11, color: '#6366f1', fontWeight: '600', marginBottom: 2 },
  title: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, flexShrink: 0 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
