import React, { useEffect, useState } from 'react';
import {
  SectionList, TouchableOpacity, Text, View, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { fetchRooms, fetchProjects } from '../api';
import { displayRoomName } from '../utils/roomName';
import type { Project } from '../types';

type RoomItem = { id: string; name: string; isProject?: boolean };
type Section = { title: string; key: string; data: RoomItem[] };

export default function RoomsScreen({ navigation }: any) {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [roomsData, projectsData] = await Promise.all([
        fetchRooms(),
        fetchProjects().catch(() => [] as Project[]),
      ]);
      const rooms: RoomItem[] = (Array.isArray(roomsData) ? roomsData : (roomsData as any).rooms || []);
      const projects: Project[] = Array.isArray(projectsData) ? projectsData : [];

      // 项目群: default room (议事厅) + project rooms
      const projectRooms: RoomItem[] = projects
        .filter(p => p.room_id)
        .map(p => ({ id: p.room_id!, name: p.name, isProject: true }));

      // Default rooms that aren't project rooms
      const projectRoomIds = new Set(projectRooms.map(r => r.id))
      const defaultRooms: RoomItem[] = rooms.filter(r => !projectRoomIds.has(r.id))

      const result: Section[] = [
        { title: '项目群', key: 'groups', data: [...defaultRooms, ...projectRooms] },
      ]

      setSections(result)
    } catch (e) { console.error(e) }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6366f1" />

  return (
    <SectionList
      sections={sections}
      keyExtractor={r => r.id}
      contentContainerStyle={{ padding: 12 }}
      stickySectionHeadersEnabled={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} />}
      ListEmptyComponent={<Text style={styles.empty}>暂无频道</Text>}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('Room', {
            id: item.id,
            name: item.isProject ? item.name : displayRoomName(item.name, item.id),
          })}
        >
          <Text style={styles.icon}>{item.isProject ? '📁' : '💬'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {item.isProject ? item.name : displayRoomName(item.name, item.id)}
            </Text>
            <Text style={styles.sub}>点击进入{item.isProject ? '项目群' : '频道'}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      )}
    />
  )
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 4, paddingTop: 8, paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 10, padding: 14, marginBottom: 8,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  icon: { fontSize: 22, marginRight: 12 },
  name: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  sub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  chevron: { fontSize: 18, color: '#d1d5db' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
})
