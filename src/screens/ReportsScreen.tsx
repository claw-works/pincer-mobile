import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchReportJobs, fetchReports } from '../api';
import type { ReportJob, Report } from '../types';

export default function ReportsScreen({ navigation }: any) {
  const [jobs, setJobs] = useState<ReportJob[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    fetchReportJobs()
      .then(j => { setJobs(j); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const selectJob = async (jobId: string) => {
    setSelectedJob(jobId);
    setLoadingReports(true);
    try {
      const r = await fetchReports(jobId);
      setReports(r);
    } catch (e) { console.error(e); }
    setLoadingReports(false);
  };

  if (loading) return <ActivityIndicator style={{ flex:1 }} size="large" />;

  return (
    <View style={{ flex:1, backgroundColor:'#f9fafb' }}>
      <View style={styles.jobsSection}>
        <Text style={styles.sectionTitle}>报告任务</Text>
        {jobs.length === 0
          ? <Text style={styles.empty}>暂无报告任务</Text>
          : (
            <FlatList
              horizontal
              data={jobs}
              keyExtractor={j => j.id}
              contentContainerStyle={{ padding:12, gap:8 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.jobChip, selectedJob === item.id && styles.jobChipActive]}
                  onPress={() => selectJob(item.id)}>
                  <Text style={[styles.jobText, selectedJob === item.id && { color:'#fff' }]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )
        }
      </View>

      {loadingReports
        ? <ActivityIndicator style={{ marginTop:40 }} />
        : (
          <FlatList
            data={reports}
            keyExtractor={r => r.id}
            contentContainerStyle={{ padding:12 }}
            ListEmptyComponent={
              <Text style={styles.empty}>{selectedJob ? '暂无报告' : '请选择一个报告任务'}</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.reportRow}
                onPress={() => navigation.navigate('ReportDetail', { id: item.id })}>
                <Text style={styles.reportDate}>
                  {new Date(item.created_at).toLocaleDateString('zh-CN', { year:'numeric', month:'2-digit', day:'2-digit' })}
                </Text>
                <Text style={styles.reportPreview} numberOfLines={2}>
                  {item.content?.slice(0, 100) || '点击查看详情'}
                </Text>
              </TouchableOpacity>
            )}
          />
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  jobsSection: { backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:'#e5e7eb' },
  sectionTitle: { fontSize:13, fontWeight:'700', color:'#374151', paddingHorizontal:12, paddingTop:12 },
  jobChip: { borderWidth:1, borderColor:'#d1d5db', borderRadius:16, paddingHorizontal:12, paddingVertical:6 },
  jobChipActive: { backgroundColor:'#3b82f6', borderColor:'#3b82f6' },
  jobText: { fontSize:13, color:'#374151' },
  reportRow: { backgroundColor:'#fff', borderRadius:8, padding:12, marginBottom:8, elevation:1 },
  reportDate: { fontSize:12, color:'#6b7280', marginBottom:4 },
  reportPreview: { fontSize:13, color:'#374151' },
  empty: { textAlign:'center', color:'#9ca3af', marginTop:40, padding:12 },
});
