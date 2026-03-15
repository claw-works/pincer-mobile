import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import TasksScreen from '../screens/TasksScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import RoomsScreen from '../screens/RoomsScreen';
import RoomScreen from '../screens/RoomScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ReportListScreen from '../screens/ReportListScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DMListScreen from '../screens/DMListScreen';
import DMChatScreen from '../screens/DMChatScreen';

const Tab = createBottomTabNavigator();
const TasksStack = createNativeStackNavigator();
const RoomsStack = createNativeStackNavigator();
const ReportsStack = createNativeStackNavigator();
const DMStack = createNativeStackNavigator();

interface AppNavigatorProps {
  onLogout: () => void;
}

// Shared header title with Pincer logo
const HeaderTitle = ({ title }: { title: string }) => (
  <View style={headerStyles.container}>
    <Image source={require('../../assets/icon.png')} style={headerStyles.logo} />
    <Text style={headerStyles.title}>{title}</Text>
  </View>
);
const headerStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 24, height: 24, borderRadius: 5 },
  title: { fontSize: 17, fontWeight: '700', color: '#1f2937' },
});

function TasksNav() {
  return (
    <TasksStack.Navigator>
      <TasksStack.Screen name="TasksList" component={TasksScreen}
        options={{ headerTitle: () => <HeaderTitle title="任务" /> }} />
      <TasksStack.Screen name="TaskDetail" component={TaskDetailScreen}
        options={{ headerTitle: () => <HeaderTitle title="任务详情" /> }} />
    </TasksStack.Navigator>
  );
}
function RoomsNav() {
  return (
    <RoomsStack.Navigator>
      <RoomsStack.Screen name="RoomsList" component={RoomsScreen}
        options={{ headerTitle: () => <HeaderTitle title="频道" /> }} />
      <RoomsStack.Screen name="Room" component={RoomScreen}
        options={({ route }: any) => ({
          headerTitle: () => <HeaderTitle title={(route.params as any)?.name || '频道'} />,
        })} />
    </RoomsStack.Navigator>
  );
}
function ReportsNav() {
  return (
    <ReportsStack.Navigator>
      <ReportsStack.Screen name="ReportJobs" component={ReportsScreen}
        options={{ headerTitle: () => <HeaderTitle title="报告" /> }} />
      <ReportsStack.Screen name="ReportList" component={ReportListScreen}
        options={({ route }: any) => ({
          headerTitle: () => <HeaderTitle title={(route.params as any)?.jobName || '报告列表'} />,
        })} />
      <ReportsStack.Screen name="ReportDetail" component={ReportDetailScreen}
        options={{ headerTitle: () => <HeaderTitle title="报告详情" /> }} />
    </ReportsStack.Navigator>
  );
}
function DMNav() {
  return (
    <DMStack.Navigator>
      <DMStack.Screen name="DMList" component={DMListScreen}
        options={{ headerTitle: () => <HeaderTitle title="伙伴" /> }} />
      <DMStack.Screen name="DMChat" component={DMChatScreen}
        options={({ route }: any) => ({
          headerTitle: () => <HeaderTitle title={(route.params as any)?.name || '私信'} />,
        })} />
    </DMStack.Navigator>
  );
}

export default function AppNavigator({ onLogout }: AppNavigatorProps) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';
            if (route.name === 'Tasks') iconName = 'checkmark-circle-outline';
            else if (route.name === 'Rooms') iconName = 'chatbubble-outline';
            else if (route.name === 'DM') iconName = 'people-outline';
            else if (route.name === 'Reports') iconName = 'bar-chart-outline';
            else if (route.name === 'Profile') iconName = 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Tasks" component={TasksNav} options={{ tabBarLabel: '任务' }} />
        <Tab.Screen name="Rooms" component={RoomsNav} options={{ tabBarLabel: '频道' }} />
        <Tab.Screen name="DM" component={DMNav} options={{ tabBarLabel: '伙伴' }} />
        <Tab.Screen name="Reports" component={ReportsNav} options={{ tabBarLabel: '报告' }} />
        <Tab.Screen
          name="Profile"
          options={{ tabBarLabel: '我的', headerShown: true, headerTitle: () => <HeaderTitle title="设置" /> }}
        >
          {() => <ProfileScreen onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
