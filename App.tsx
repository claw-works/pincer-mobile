import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { loadConfig } from './src/api/client';
import LoginScreen from './src/screens/LoginScreen';
import MainScreen from './src/screens/MainScreen';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    loadConfig().then((cfg) => {
      setLoggedIn(!!cfg);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!loggedIn) {
    return <LoginScreen onLoggedIn={() => setLoggedIn(true)} />;
  }

  return <MainScreen onLogout={() => setLoggedIn(false)} />;
}
