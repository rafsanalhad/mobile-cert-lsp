import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { initDatabase } from './src/database/database';
import { AuthProvider } from './src/utils/AuthContext';

import LoginScreen from './src/screens/LoginScreen';
import BerandaScreen from './src/screens/BerandaScreen';
import TambahTugasScreen from './src/screens/TambahTugasScreen';
import DaftarTugasScreen from './src/screens/DaftarTugasScreen';
import PengaturanScreen from './src/screens/PengaturanScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch((e) => {
        console.error('DB init error:', e);
        setDbError(e.message);
      });
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        <StatusBar style="light" />
        {dbError ? (
          <Text style={{ color: '#EF4444', textAlign: 'center', paddingHorizontal: 32 }}>
            Error: {dbError}
          </Text>
        ) : (
          <>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={{ color: '#64748B', fontSize: 14 }}>Memuat database...</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Beranda" component={BerandaScreen} />
          <Stack.Screen name="TambahTugas" component={TambahTugasScreen} />
          <Stack.Screen name="DaftarTugas" component={DaftarTugasScreen} />
          <Stack.Screen name="Pengaturan" component={PengaturanScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
