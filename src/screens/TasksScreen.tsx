import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchTasks, fetchProjects, fetchAgents } from '../api';
import type { Task, Project, Agent } from '../types';

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
        fetchTasks({ limit: 100 }),
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
  const agentMap: Record<string, string> = {};
  for (const a of agents) agentMap[a.id] = a.name || a.id.slice(0, 8);

  const filtered = statusFilter === '全部'
    ? [...tasks].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 20)
    : tasks.filter(t => t.status === statusFilter).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6366f1" />;

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      {/* Status filter tabs */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUS_FILTERS.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[styles.filterText, statusFilter === s && styles.filterTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Task card list */}
      <FlatList
        data={filtered}
        keyExtractor={t => t.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>暂无任务</Text>
          </View>
        }
        renderItem={({ item }) => {
          const sc = STATUS_COLOR[item.status] || { bg: '#f3f4f6', text: '#6b7280' };
          const assignee = item.assigned_agent_id ? agentMap[item.assigned_agent_id] : null;
          const assigneeInitial = assignee ? assignee.charAt(0).toUpperCase() : '?';
          const projectName = item.project_id ? projectMap[item.project_id] : null;
          const updatedAt = new Date(item.updated_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('TaskDetail', { id: item.id })}
              activeOpacity={0.7}
            >
              {/* Top row: status badge + time */}
              <View style={styles.cardTop}>
                <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.statusText, { color: sc.text }]}>{item.status}</Text>
                </View>
                <Text style={styles.timeText}>{updatedAt}</Text>
              </View>

              {/* Title */}
              <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>

              {/* Bottom row: assignee + project */}
              <View style={styles.cardBottom}>
                {assignee ? (
                  <View style={styles.assigneeRow}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{assigneeInitial}</Text>
                    </View>
                    <Text style={styles.assigneeName}>{assignee}</Text>
                  </View>
                ) : (
                  <Text style={styles.unassigned}>未分配</Text>
                )}
                {projectName && (
                  <View style={styles.projectTag}>
                    <Text style={styles.projectText} numberOfLines={1}>📁 {projectName}</Text>
                  </View>
                )}
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
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f3f4f6' },
  filterChipActive: { backgroundColor: '#6366f1' },
  filterText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  timeText: { fontSize: 11, color: '#9ca3af' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#111827', lineHeight: 22, marginBottom: 10 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  assigneeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatarCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  assigneeName: { fontSize: 12, color: '#6b7280' },
  unassigned: { fontSize: 12, color: '#d1d5db' },
  projectTag: { backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, maxWidth: '55%' },
  projectText: { fontSize: 11, color: '#6b7280' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#9ca3af', fontSize: 14 },
});
