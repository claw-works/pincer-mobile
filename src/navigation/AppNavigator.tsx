import React from 'react';
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

const Tab = createBottomTabNavigator();
const TasksStack = createNativeStackNavigator();
const RoomsStack = createNativeStackNavigator();
const ReportsStack = createNativeStackNavigator();

interface AppNavigatorProps {
  onLogout: () => void;
}

function TasksNav() {
  return (
    <TasksStack.Navigator>
      <TasksStack.Screen name="TasksList" component={TasksScreen} options={{ title: '任务' }} />
      <TasksStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: '任务详情' }} />
    </TasksStack.Navigator>
  );
}
function RoomsNav() {
  return (
    <RoomsStack.Navigator>
      <RoomsStack.Screen name="RoomsList" component={RoomsScreen} options={{ title: '频道' }} />
      <RoomsStack.Screen name="Room" component={RoomScreen}
        options={({ route }: any) => ({ title: (route.params as any)?.name || '频道' })} />
    </RoomsStack.Navigator>
  );
}
function ReportsNav() {
  return (
    <ReportsStack.Navigator>
      <ReportsStack.Screen name="ReportJobs" component={ReportsScreen} options={{ title: '日报任务' }} />
      <ReportsStack.Screen name="ReportList" component={ReportListScreen}
        options={({ route }: any) => ({ title: (route.params as any)?.jobName || '报告列表' })} />
      <ReportsStack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: '报告详情' }} />
    </ReportsStack.Navigator>
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
            else if (route.name === 'Reports') iconName = 'bar-chart-outline';
            else if (route.name === 'Profile') iconName = 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Tasks" component={TasksNav} options={{ tabBarLabel: '任务' }} />
        <Tab.Screen name="Rooms" component={RoomsNav} options={{ tabBarLabel: '频道' }} />
        <Tab.Screen name="Reports" component={ReportsNav} options={{ tabBarLabel: '日报' }} />
        <Tab.Screen
          name="Profile"
          options={{ tabBarLabel: '我的', headerShown: true, title: '设置' }}
        >
          {() => <ProfileScreen onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const Tab = createBottomTabNavigator();
const TasksStack = createNativeStackNavigator();
const RoomsStack = createNativeStackNavigator();
const ReportsStack = createNativeStackNavigator();

function TasksNav() {
  return (
    <TasksStack.Navigator>
      <TasksStack.Screen name="TasksList" component={TasksScreen} options={{ title: '任务' }} />
      <TasksStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: '任务详情' }} />
    </TasksStack.Navigator>
  );
}
function RoomsNav() {
  return (
    <RoomsStack.Navigator>
      <RoomsStack.Screen name="RoomsList" component={RoomsScreen} options={{ title: '频道' }} />
      <RoomsStack.Screen name="Room" component={RoomScreen}
        options={({ route }: any) => ({ title: (route.params as any)?.name || '频道' })} />
    </RoomsStack.Navigator>
  );
}
function ReportsNav() {
  return (
    <ReportsStack.Navigator>
      <ReportsStack.Screen name="ReportJobs" component={ReportsScreen} options={{ title: '日报任务' }} />
      <ReportsStack.Screen name="ReportList" component={ReportListScreen}
        options={({ route }: any) => ({ title: (route.params as any)?.jobName || '报告列表' })} />
      <ReportsStack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: '报告详情' }} />
    </ReportsStack.Navigator>
  );
}

export default function AppNavigator() {
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
            else if (route.name === 'Reports') iconName = 'bar-chart-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Tasks" component={TasksNav} options={{ tabBarLabel: '任务' }} />
        <Tab.Screen name="Rooms" component={RoomsNav} options={{ tabBarLabel: '频道' }} />
        <Tab.Screen name="Reports" component={ReportsNav} options={{ tabBarLabel: '日报' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
