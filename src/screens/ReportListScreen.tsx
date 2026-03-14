// ReportListScreen: 某个 Job 下的报告列表
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchReports } from '../api';
import type { Report } from '../types';

export default function ReportListScreen({ route, navigation }: any) {
  const { jobId } = route.params;
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const r = await fetchReports(jobId);
      setReports(r);
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, [jobId]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <FlatList
      data={reports}
      keyExtractor={r => r.id}
      contentContainerStyle={{ padding: 12 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      ListEmptyComponent={<Text style={styles.empty}>暂无报告</Text>}
      renderItem={({ item }) => {
        const date = new Date(item.created_at);
        const preview = item.content?.replace(/#+\s/g, '').replace(/\n/g, ' ').slice(0, 80) || '点击查看详情';
        return (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('ReportDetail', { id: item.id })}>
            <View style={styles.header}>
              <View style={styles.dateWrap}>
                <Text style={styles.dateDay}>{date.getDate()}</Text>
                <Text style={styles.dateMon}>{date.toLocaleDateString('zh-CN', { month: 'short' })}</Text>
              </View>
              <View style={styles.content}>
                <Text style={styles.dateStr}>
                  {date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                </Text>
                <Text style={styles.preview} numberOfLines={2}>{preview}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  header: { flexDirection: 'row', alignItems: 'center' },
  dateWrap: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  dateDay: { fontSize: 18, fontWeight: '700', color: '#6366f1', lineHeight: 20 },
  dateMon: { fontSize: 11, color: '#6366f1' },
  content: { flex: 1, marginRight: 8 },
  dateStr: { fontSize: 12, color: '#6b7280', marginBottom: 3 },
  preview: { fontSize: 13, color: '#374151', lineHeight: 18 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 60, fontSize: 15 },
});
