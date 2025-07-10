import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';

import { AuthScreen } from './src/screens/AuthScreen';
import { MemoryScreen } from './src/screens/MemoryScreen';
import { GalleryScreen } from './src/screens/GalleryScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { MemoryDetailScreen } from './src/screens/MemoryDetailScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { useAuth } from './src/hooks/useAuth';
import { Loading } from './src/components/UI/Loading';
import { colors } from './src/styles/colors';
import { RootStackParamList, TabParamList } from './src/types/navigation';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { View, Text } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === 'Memory') {
          iconName = focused ? 'add-circle' : 'add-circle-outline';
        } else if (route.name === 'Gallery') {
          iconName = focused ? 'images' : 'images-outline';
        } else if (route.name === 'Calendar') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        } else {
          iconName = 'alert-circle';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
    })}
  >
    <Tab.Screen name="Memory" component={MemoryScreen} options={{ title: '기록' }} />
    <Tab.Screen name="Gallery" component={GalleryScreen} options={{ title: '갤러리' }} />
    <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: '달력' }} />
    <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: '설정' }} />
  </Tab.Navigator>
);

export default function App() {
  const { user, loading } = useAuth();
  const [fontsLoaded] = Font.useFonts({
    SUIT: require('./assets/fonts/SUIT-Variable.ttf'),
  });

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '939218251186-s8nj3k3h9kh3qijs9ji56k7u265ikigj.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  if (fontsLoaded) {
    (Text as any).defaultProps = (Text as any).defaultProps || {};
    (Text as any).defaultProps.style = { fontFamily: 'SUIT' };
  }

  if (loading) {
    return <Loading message="앱을 시작하는 중..." />;
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor={colors.background} />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {user ? (
            <>
              <Stack.Screen name="Tabs" component={TabNavigator} />
              <Stack.Screen name="MemoryDetail" component={MemoryDetailScreen} />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
