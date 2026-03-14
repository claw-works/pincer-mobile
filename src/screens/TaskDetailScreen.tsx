import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { fetchTask, approveTask, rejectTask } from '../api';
import type { Task } from '../types';

export default function TaskDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    fetchTask(id).then(t => { setTask(t); setLoading(false); });
  }, [id]);

  const handleApprove = async () => {
    setActing(true);
    try {
      await approveTask(id);
      Alert.alert('✅ 已 Approve');
      navigation.goBack();
    } catch (e: any) { Alert.alert('错误', e.message); }
    setActing(false);
  };

  const handleReject = () => {
    Alert.prompt('Reject 原因', '请说明拒绝原因', async (note) => {
      if (!note) return;
      setActing(true);
      try {
        await rejectTask(id, note);
        Alert.alert('❌ 已 Reject');
        navigation.goBack();
      } catch (e: any) { Alert.alert('错误', e.message); }
      setActing(false);
    });
  };

  if (loading || !task) return <ActivityIndicator style={{ flex:1 }} size="large" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{task.title}</Text>

      <View style={styles.statusRow}>
        <Text style={styles.label}>状态</Text>
        <View style={[styles.badge, { backgroundColor: task.status === 'review' ? '#f59e0b' : task.status === 'done' ? '#10b981' : '#6b7280' }]}>
          <Text style={styles.badgeText}>{task.status}</Text>
        </View>
      </View>

      {!!task.description && (
        <>
          <Text style={styles.label}>描述</Text>
          <Text style={styles.body}>{task.description}</Text>
        </>
      )}
      {!!task.user_story && (
        <>
          <Text style={styles.label}>User Story</Text>
          <Text style={styles.body}>{task.user_story}</Text>
        </>
      )}
      {Array.isArray(task.acceptance_criteria) && task.acceptance_criteria.length > 0 && (
        <>
          <Text style={styles.label}>验收标准</Text>
          {task.acceptance_criteria.map((c, i) => (
            <Text key={i} style={styles.criterion}>• {c}</Text>
          ))}
        </>
      )}

      <Text style={styles.meta}>创建于 {new Date(task.created_at).toLocaleString('zh-CN')}</Text>

      {task.status === 'review' && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={handleApprove} disabled={acting}>
            <Text style={styles.btnText}>✅ Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.rejectBtn]} onPress={handleReject} disabled={acting}>
            <Text style={styles.btnText}>❌ Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#f9fafb' },
  title: { fontSize:18, fontWeight:'700', color:'#1f2937', marginBottom:12 },
  statusRow: { flexDirection:'row', alignItems:'center', marginBottom:16 },
  label: { fontSize:13, fontWeight:'700', color:'#374151', marginBottom:4, marginTop:12 },
  badge: { borderRadius:4, paddingHorizontal:8, paddingVertical:3, marginLeft:8 },
  badgeText: { color:'#fff', fontSize:12, fontWeight:'700' },
  body: { fontSize:14, color:'#4b5563', lineHeight:22 },
  criterion: { fontSize:14, color:'#4b5563', lineHeight:24, marginLeft:8 },
  meta: { fontSize:12, color:'#9ca3af', marginTop:16 },
  actions: { flexDirection:'row', gap:12, marginTop:24 },
  btn: { flex:1, borderRadius:8, padding:14, alignItems:'center' },
  approveBtn: { backgroundColor:'#10b981' },
  rejectBtn: { backgroundColor:'#ef4444' },
  btnText: { color:'#fff', fontWeight:'700', fontSize:15 },
});
