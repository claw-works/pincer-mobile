import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { loadConfig } from './src/api/client';
import LoginScreen from './src/screens/LoginScreen';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    loadConfig().then(cfg => {
      setLoggedIn(!!cfg);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  }

  return <AppNavigator />;
}
