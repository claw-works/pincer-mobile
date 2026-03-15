import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchRooms } from '../api';

export default function RoomsScreen({ navigation }: any) {
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms().then((r: any) => {
      const list = Array.isArray(r) ? r : (r.rooms || []);
      setRooms(list);
      // Auto-navigate if only one room
      if (list.length === 1) {
        navigation.replace('Room', { id: list[0].id, name: list[0].name || '频道' });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6366f1" />;

  return (
    <FlatList
      data={rooms}
      keyExtractor={r => r.id}
      contentContainerStyle={{ padding: 12 }}
      ListEmptyComponent={<Text style={styles.empty}>暂无频道</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('Room', { id: item.id, name: item.name || item.id })}>
          <Text style={styles.icon}>💬</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name || item.id}</Text>
            <Text style={styles.sub}>点击进入频道</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  icon: { fontSize: 22, marginRight: 12 },
  name: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  sub: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  chevron: { fontSize: 18, color: '#d1d5db' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40 },
});
