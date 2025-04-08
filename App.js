import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Button } from 'react-native';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) setIsAuthenticated(true);
    };
    checkAuth();
  }, []);

  const handleLogin = async () => {
    // Mock Google Auth
    const mockUser = { uid: 'mockUserId', displayName: 'Mock User', email: 'mock@example.com' };
    await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Please Log In</Text>
        <Button title="Login with Google" onPress={handleLogin} />
      </View>
    );
  }

  return (
    <>
       <StatusBar translucent={false} backgroundColor="#61dafb" />
      <AppNavigator onLogout={handleLogout} />
    </>
  );
}