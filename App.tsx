import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { loadConfig } from './src/api/client';
import LoginScreen from './src/screens/LoginScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function AppContent() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    loadConfig().then(cfg => {
      setLoggedIn(!!cfg);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.headerBg} />
      {loggedIn
        ? <AppNavigator onLogout={() => setLoggedIn(false)} />
        : <LoginScreen onLoggedIn={() => setLoggedIn(true)} />
      }
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
