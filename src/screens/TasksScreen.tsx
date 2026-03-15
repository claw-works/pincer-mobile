import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchTasks, fetchProjects, fetchAgents } from '../api';
import type { Task, Project, Agent } from '../types';

// Priority order: review first (needs human action), then active, then historical
const STATUS_FILTERS = ['全部', 'review', 'running', 'assigned', 'pending', 'done', 'rejected'] as const;
const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  review:   { bg: '#fef3c7', text: '#d97706' },
  running:  { bg: '#dbeafe', text: '#2563eb' },
  assigned: { bg: '#ede9fe', text: '#7c3aed' },
  pending:  { bg: '#f3f4f6', text: '#6b7280' },
  done:     { bg: '#dcfce7', text: '#16a34a' },
  failed:   { bg: '#fee2e2', text: '#dc2626' },
  rejected: { bg: '#fee2e2', text: '#dc2626' },
};
const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
const avatarColor = (name: string) => AVATAR_COLORS[(name || '?').charCodeAt(0) % AVATAR_COLORS.length];

export default function TasksScreen({ navigation }: any) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('全部');

  const load = useCallback(async () => {
    try {
      const [tasksData, projectsData, agentsData] = await Promise.all([
        fetchTasks({ limit: 200 }),
        fetchProjects(),
        fetchAgents(),
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
      setAgents(agentsData);
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const projectMap: Record<string, string> = {};
  for (const p of projects) projectMap[p.id] = p.name;
  const agentMap: Record<string, Agent> = {};
  for (const a of agents) agentMap[a.id] = a;

  const sorted = [...tasks].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  const filtered = statusFilter === '全部' ? sorted.slice(0, 20) : sorted.filter(t => t.status === statusFilter);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6366f1" />;

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      {/* Status filter tabs */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUS_FILTERS.map(s => {
            const sc = STATUS_COLOR[s as string];
            const isActive = statusFilter === s;
            return (
              <TouchableOpacity
                key={s}
                style={[
                  styles.filterChip,
                  isActive && (sc ? { backgroundColor: sc.bg, borderColor: sc.text, borderWidth: 1.5 } : styles.filterChipAll),
                ]}
                onPress={() => setStatusFilter(s)}
              >
                <Text style={[
                  styles.filterText,
                  isActive && (sc ? { color: sc.text, fontWeight: '700' } : styles.filterTextAll),
                ]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Task card list */}
      <FlatList
        data={filtered}
        keyExtractor={t => t.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={
          <View style={styles.empty}><Text style={styles.emptyText}>暂无任务</Text></View>
        }
        renderItem={({ item }) => {
          const sc = STATUS_COLOR[item.status] || { bg: '#f3f4f6', text: '#6b7280' };
          const assignee = item.assigned_agent_id ? agentMap[item.assigned_agent_id] : null;
          const assigneeName = assignee?.name || (item.assigned_agent_id ? item.assigned_agent_id.slice(0, 8) : null);
          const assigneeInitial = assigneeName ? assigneeName.charAt(0).toUpperCase() : '?';
          const projectName = item.project_id ? projectMap[item.project_id] : null;
          const updatedAt = new Date(item.updated_at).toLocaleString('zh-CN', {
            month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
          });

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
              activeOpacity={0.7}
            >
              <View style={styles.cardInner}>
                {/* Large avatar on left */}
                <View style={[styles.bigAvatar, { backgroundColor: avatarColor(assigneeName || '?') }]}>
                  <Text style={styles.bigAvatarText}>{assigneeInitial}</Text>
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                  <View style={styles.cardTop}>
                    <Text style={styles.assigneeName} numberOfLines={1}>
                      {assigneeName || '未分配'}
                    </Text>
                    <Text style={styles.timeText}>{updatedAt}</Text>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.cardBottom}>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.statusText, { color: sc.text }]}>{item.status}</Text>
                    </View>
                    {projectName && (
                      <View style={styles.projectTag}>
                        <Text style={styles.projectText} numberOfLines={1}>📁 {projectName}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterBar: { backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
  filterScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f3f4f6', borderWidth: 1.5, borderColor: 'transparent' },
  filterChipAll: { backgroundColor: '#6366f1' },
  filterText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  filterTextAll: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardInner: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  bigAvatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  bigAvatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  assigneeName: { fontSize: 13, fontWeight: '700', color: '#374151', flex: 1, marginRight: 8 },
  timeText: { fontSize: 11, color: '#9ca3af', flexShrink: 0 },
  cardTitle: { fontSize: 14, color: '#111827', lineHeight: 21, marginBottom: 8 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  projectTag: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, maxWidth: '60%' },
  projectText: { fontSize: 11, color: '#6b7280' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#9ca3af', fontSize: 14 },
});
