// ReportsScreen: 只显示 Job 列表，点击进入 ReportListScreen
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchReportJobs } from '../api';
import type { ReportJob } from '../types';

export default function ReportsScreen({ navigation }: any) {
  const [jobs, setJobs] = useState<ReportJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportJobs()
      .then(j => { setJobs(j); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <FlatList
      data={jobs}
      keyExtractor={j => j.id}
      contentContainerStyle={{ padding: 12 }}
      ListEmptyComponent={<Text style={styles.empty}>暂无报告任务</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('ReportList', { jobId: item.id, jobName: item.name })}>
          <View style={styles.iconWrap}>
            <Ionicons name="document-text-outline" size={24} color="#6366f1" />
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>点击查看报告列表</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  meta: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 60, fontSize: 15 },
});
