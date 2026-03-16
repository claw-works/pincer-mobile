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
import { useLang } from '../i18n/LangContext';

const Tab = createBottomTabNavigator();
const TasksStack = createNativeStackNavigator();
const MessagesStack = createNativeStackNavigator();
const ReportsStack = createNativeStackNavigator();

interface AppNavigatorProps {
  onLogout: () => void;
}

function HeaderTitle({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <View style={hStyles.container}>
      <Image source={require('../../assets/icon.png')} style={hStyles.logo} />
      <Text style={[hStyles.title, { color: colors.text }]}>{title}</Text>
    </View>
  );
}
const hStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 24, height: 24, borderRadius: 5 },
  title: { fontSize: 17, fontWeight: '700' },  // color comes from theme
});

function TasksNav() {
  const { t } = useLang();
  return (
    <TasksStack.Navigator>
      <TasksStack.Screen name="TasksList" component={TasksScreen}
        options={{ headerTitle: () => <HeaderTitle title={t.tasks} /> }} />
      <TasksStack.Screen name="TaskDetail" component={TaskDetailScreen}
        options={{ headerTitle: () => <HeaderTitle title={t.taskDetail} /> }} />
    </TasksStack.Navigator>
  );
}

function MessagesNav() {
  const { t } = useLang();
  return (
    <MessagesStack.Navigator>
      <MessagesStack.Screen name="MessagesList" component={MessagesScreen}
        options={{ headerTitle: () => <HeaderTitle title={t.messages} /> }} />
      <MessagesStack.Screen name="Room" component={RoomScreen}
        options={({ route }: any) => ({
          headerTitle: () => <HeaderTitle title={(route.params as any)?.name || t.room} />,
        })} />
      <MessagesStack.Screen name="DMChat" component={DMChatScreen}
        options={({ route }: any) => ({
          headerTitle: () => <HeaderTitle title={(route.params as any)?.name || t.dm} />,
        })} />
    </MessagesStack.Navigator>
  );
}

function ReportsNav() {
  const { t } = useLang();
  return (
    <ReportsStack.Navigator>
      <ReportsStack.Screen name="ReportJobs" component={ReportsScreen}
        options={{ headerTitle: () => <HeaderTitle title={t.reports} /> }} />
      <ReportsStack.Screen name="ReportList" component={ReportListScreen}
        options={({ route }: any) => ({
          headerTitle: () => <HeaderTitle title={(route.params as any)?.jobName || t.reportList} />,
        })} />
      <ReportsStack.Screen name="ReportDetail" component={ReportDetailScreen}
        options={{ headerTitle: () => <HeaderTitle title={t.reportDetail} /> }} />
    </ReportsStack.Navigator>
  );
}

export default function AppNavigator({ onLogout }: AppNavigatorProps) {
  const { colors, theme } = useTheme();
  const { t } = useLang();

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
        <Tab.Screen name="Tasks" component={TasksNav} options={{ tabBarLabel: t.tasks }} />
        <Tab.Screen name="Messages" component={MessagesNav} options={{ tabBarLabel: t.messages }} />
        <Tab.Screen name="Reports" component={ReportsNav} options={{ tabBarLabel: t.reports }} />
        <Tab.Screen
          name="Profile"
          options={{ tabBarLabel: t.profile, headerShown: true, headerTitle: () => <HeaderTitle title={t.settings} /> }}
        >
          {() => <ProfileScreen onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
