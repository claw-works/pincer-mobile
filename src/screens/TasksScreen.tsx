import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, TouchableOpacity, Text, View, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { fetchTasks } from '../api';
import type { Task } from '../types';

const STATUS_ORDER = ['review','running','assigned','pending','done','failed','rejected'];
const STATUS_COLOR: Record<string,string> = {
  review:'#f59e0b', running:'#3b82f6', assigned:'#8b5cf6',
  pending:'#6b7280', done:'#10b981', failed:'#ef4444', rejected:'#ef4444',
};

export default function TasksScreen({ navigation }: any) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchTasks({ limit: 100 });
      setTasks([...data].sort((a,b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)));
    } catch(e) { console.error(e); }
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;

  return (
    <FlatList
      data={tasks}
      keyExtractor={t => t.id}
      contentContainerStyle={{ padding: 12 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('TaskDetail', { id: item.id })}>
          <View style={styles.rowTop}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] || '#6b7280' }]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
          {item.task_type && item.task_type !== 'task' && (
            <Text style={styles.meta}>[{item.task_type}]</Text>
          )}
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex:1, justifyContent:'center', alignItems:'center' },
  row: { backgroundColor:'#fff', borderRadius:8, padding:12, marginBottom:8, elevation:1, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:4 },
  rowTop: { flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between' },
  title: { flex:1, fontSize:14, fontWeight:'600', color:'#1f2937', marginRight:8 },
  badge: { borderRadius:4, paddingHorizontal:6, paddingVertical:2 },
  badgeText: { color:'#fff', fontSize:11, fontWeight:'700' },
  meta: { color:'#6b7280', fontSize:12, marginTop:4 },
});
