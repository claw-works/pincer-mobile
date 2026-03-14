import React, { useEffect, useState } from 'react';
import { FlatList, TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchRooms } from '../api';

export default function RoomsScreen({ navigation }: any) {
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms()
      .then(r => { setRooms(r); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator style={{ flex:1 }} size="large" />;

  return (
    <FlatList
      data={rooms}
      keyExtractor={r => r.id}
      contentContainerStyle={{ padding: 12 }}
      ListEmptyComponent={<Text style={styles.empty}>暂无频道</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate('Room', { id: item.id, name: item.name })}>
          <Text style={styles.icon}>💬</Text>
          <Text style={styles.name}>{item.name || item.id}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderRadius:8, padding:14, marginBottom:8, elevation:1 },
  icon: { fontSize:20, marginRight:12 },
  name: { fontSize:15, fontWeight:'600', color:'#1f2937' },
  empty: { textAlign:'center', color:'#9ca3af', marginTop:40 },
});
