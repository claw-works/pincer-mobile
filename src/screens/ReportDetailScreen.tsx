import React, { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { api } from '../api/client';
import type { Report } from '../types';

export default function ReportDetailScreen({ route }: any) {
  const { id } = route.params;
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    api.get<Report>(`/reports/${id}`).then(setReport).catch(console.error);
  }, [id]);

  if (!report) return <ActivityIndicator style={{ flex:1 }} size="large" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Markdown>{report.content || '_暂无内容_'}</Markdown>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#fff' },
});
