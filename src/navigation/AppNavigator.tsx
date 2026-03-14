import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TasksScreen from '../screens/TasksScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import RoomsScreen from '../screens/RoomsScreen';
import RoomScreen from '../screens/RoomScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';

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
      <ReportsStack.Screen name="ReportsList" component={ReportsScreen} options={{ title: '日报' }} />
      <ReportsStack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: '报告详情' }} />
    </ReportsStack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Tasks" component={TasksNav} options={{ tabBarLabel: '任务 📋' }} />
        <Tab.Screen name="Rooms" component={RoomsNav} options={{ tabBarLabel: '频道 💬' }} />
        <Tab.Screen name="Reports" component={ReportsNav} options={{ tabBarLabel: '日报 📊' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
