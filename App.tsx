import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MemoryScreen } from './src/screens/MemoryScreen';
import { GalleryScreen } from './src/screens/GalleryScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { MemoryDetailScreen } from './src/screens/MemoryDetailScreen';
import { useAuth } from './src/hooks/useAuth';
import { Loading } from './src/components/UI/Loading';
import { colors } from './src/styles/colors';
import { RootStackParamList } from './src/types/navigation';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const Stack = createStackNavigator<RootStackParamList>();

// 로그인 함수는 별도 서비스 파일로 분리 예정

export default function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '939218251186-s8nj3k3h9kh3qijs9ji56k7u265ikigj.apps.googleusercontent.com', // Google Cloud Console에서 발급받은 웹 클라이언트 ID
      offlineAccess: true,
    });
  }, []);

  if (loading) {
    return <Loading message="앱을 시작하는 중..." />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {user ? (
          // 로그인된 사용자
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Memory" component={MemoryScreen} />
            <Stack.Screen name="Gallery" component={GalleryScreen} />
            <Stack.Screen name="Calendar" component={CalendarScreen} />
            <Stack.Screen name="MemoryDetail" component={MemoryDetailScreen} />
          </>
        ) : (
          // 로그인되지 않은 사용자
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
