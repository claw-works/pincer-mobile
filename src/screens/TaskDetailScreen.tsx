import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Modal, TextInput, Platform,
} from 'react-native';
import { fetchTask, approveTask, rejectTask } from '../api';
import type { Task } from '../types';
import { useLang } from '../i18n/LangContext';

const STATUS_COLOR: Record<string, string> = {
  review: '#f59e0b', running: '#3b82f6', assigned: '#8b5cf6',
  pending: '#6b7280', done: '#10b981', failed: '#ef4444', rejected: '#ef4444',
};

export default function TaskDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { t } = useLang();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  // Reject modal state (Alert.prompt is iOS-only)
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  useEffect(() => {
    fetchTask(id).then(t => { setTask(t); setLoading(false); });
  }, [id]);

  const handleApprove = async () => {
    setActing(true);
    try {
      await approveTask(id);
      navigation.goBack();  // silent success — task list will refresh
    } catch (e: any) { Alert.alert(t.errorTitle, e.message); }
    setActing(false);
  };

  const openReject = () => {
    setRejectNote('');
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    if (!rejectNote.trim()) { Alert.alert(t.rejectEmpty); return; }
    setRejectModalVisible(false);
    setActing(true);
    try {
      await rejectTask(id, rejectNote.trim());
      navigation.goBack();
    } catch (e: any) { Alert.alert(t.errorTitle, e.message); }
    setActing(false);
  };

  if (loading || !task) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6366f1" />;

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>{task.title}</Text>

        <View style={styles.statusRow}>
          <Text style={styles.label}>{t.taskStatus}</Text>
          <View style={[styles.badge, { backgroundColor: STATUS_COLOR[task.status] || '#6b7280' }]}>
            <Text style={styles.badgeText}>{task.status}</Text>
          </View>
        </View>

        {!!task.description && (
          <>
            <Text style={styles.label}>{t.taskDesc}</Text>
            <Text style={styles.body}>{task.description}</Text>
          </>
        )}
        {!!task.user_story && (
          <>
            <Text style={styles.label}>User Story</Text>
            <Text style={styles.body}>{task.user_story}</Text>
          </>
        )}
        {!!task.result && (
          <>
            <Text style={styles.label}>{t.taskResult}</Text>
            <View style={styles.resultBox}>
              <Text style={styles.body}>{task.result}</Text>
            </View>
          </>
        )}
        {!!task.review_note && (
          <>
            <Text style={[styles.label, { color: '#ef4444' }]}>{t.taskReviewNote}</Text>
            <Text style={[styles.body, { color: '#ef4444' }]}>{task.review_note}</Text>
          </>
        )}
        {Array.isArray(task.acceptance_criteria) && task.acceptance_criteria.length > 0 && (
          <>
            <Text style={styles.label}>{t.taskAcceptance}</Text>
            {task.acceptance_criteria.map((c, i) => (
              <Text key={i} style={styles.criterion}>• {c}</Text>
            ))}
          </>
        )}

        <Text style={styles.meta}>
          {task.assigned_agent_id?.slice(0, 8) || t.unassigned} · {new Date(task.updated_at).toLocaleString('zh-CN')}
        </Text>

        {task.status === 'review' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btnHalf, styles.rejectHalf, acting && { opacity: 0.5 }]}
              onPress={openReject}
              disabled={acting}
            >
              <Text style={styles.btnOutlineText}>❌ {t.taskReject}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnHalf, styles.approveBtn, acting && { opacity: 0.5 }]}
              onPress={handleApprove}
              disabled={acting}
            >
              <Text style={styles.btnText}>✅ {t.taskApprove}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Reject reason modal (cross-platform, no Alert.prompt) */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.rejectTitle}</Text>
            <TextInput
              style={styles.modalInput}
              value={rejectNote}
              onChangeText={setRejectNote}
              placeholder={t.rejectPlaceholder}
              multiline
              autoFocus
              maxLength={200}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, { flex: 1, backgroundColor: '#e5e7eb' }]}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={[styles.btnText, { color: '#374151' }]}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.rejectBtn, { flex: 1 }]}
                onPress={confirmReject}
              >
                <Text style={styles.btnText}>{t.rejectConfirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  title: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 12, lineHeight: 26 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 4, marginTop: 12 },
  badge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  body: { fontSize: 14, color: '#4b5563', lineHeight: 22 },
  resultBox: { backgroundColor: '#f0fdf4', borderRadius: 8, padding: 12, borderLeftWidth: 3, borderLeftColor: '#10b981' },
  criterion: { fontSize: 14, color: '#4b5563', lineHeight: 24, marginLeft: 8 },
  meta: { fontSize: 12, color: '#9ca3af', marginTop: 16 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24 },
  btn: { flex: 1, borderRadius: 10, padding: 14, alignItems: 'center' },
  btnHalf: { flex: 1, borderRadius: 10, padding: 16, alignItems: 'center' },
  approveBtn: { backgroundColor: '#10b981' },
  rejectHalf: { borderWidth: 1.5, borderColor: '#ef4444', backgroundColor: '#fff' },
  rejectBtn: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnOutline: { borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#ef4444' },
  btnOutlineText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 16, backgroundColor: '#fafafa' },
  modalActions: { flexDirection: 'row', gap: 12 },
});
