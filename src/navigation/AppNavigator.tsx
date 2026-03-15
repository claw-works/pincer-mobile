import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import TasksScreen from '../screens/TasksScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import MessagesScreen from '../screens/MessagesScreen';
import RoomScreen from '../screens/RoomScreen';
import DMChatScreen from '../screens/DMChatScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ReportListScreen from '../screens/ReportListScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useTheme } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator();
const TasksStack = createNativeStackNavigator();
const MessagesStack = createNativeStackNavigator();
const ReportsStack = createNativeStackNavigator();

interface AppNavigatorProps {
  onLogout: () => void;
}

const HeaderTitle = ({ title }: { title: string }) => (
  <View style={hStyles.container}>
    <Image source={require('../../assets/icon.png')} style={hStyles.logo} />
    <Text style={hStyles.title}>{title}</Text>
  </View>
);
const hStyles = StyleSheet.create({
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

function MessagesNav() {
  return (
    <MessagesStack.Navigator>
      <MessagesStack.Screen name="MessagesList" component={MessagesScreen}
        options={{ headerTitle: () => <HeaderTitle title="消息" /> }} />
      <MessagesStack.Screen name="Room" component={RoomScreen}
        options={({ route }: any) => ({
          headerTitle: () => <HeaderTitle title={(route.params as any)?.name || '频道'} />,
        })} />
      <MessagesStack.Screen name="DMChat" component={DMChatScreen}
        options={({ route }: any) => ({
          headerTitle: () => <HeaderTitle title={(route.params as any)?.name || '私信'} />,
        })} />
    </MessagesStack.Navigator>
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

export default function AppNavigator({ onLogout }: AppNavigatorProps) {
  const { colors, theme } = useTheme();

  const navTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.bg,
      card: colors.headerBg,
      text: colors.text,
      border: colors.border,
      primary: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: { backgroundColor: colors.tabBarBg, borderTopColor: colors.border },
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';
            if (route.name === 'Tasks') iconName = 'checkmark-circle-outline';
            else if (route.name === 'Messages') iconName = 'chatbubbles-outline';
            else if (route.name === 'Reports') iconName = 'bar-chart-outline';
            else if (route.name === 'Profile') iconName = 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Tasks" component={TasksNav} options={{ tabBarLabel: '任务' }} />
        <Tab.Screen name="Messages" component={MessagesNav} options={{ tabBarLabel: '消息' }} />
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
