import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { colors, shadows } from '../styles/colors';
import { HomeScreenNavigationProp } from '../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
      Alert.alert('오류', '로그아웃에 실패했습니다.');
    }
  };

  const handleNavigate = (screen: 'Memory' | 'Gallery' | 'Calendar') => {
    try {
      if (screen === 'Memory') {
        navigation.navigate('Memory', {});
      } else if (screen === 'Gallery') {
        navigation.navigate('Gallery', undefined);
      } else if (screen === 'Calendar') {
        navigation.navigate('Calendar', undefined);
      }
    } catch (error) {
      console.error(`네비게이션 오류 (${screen}):`, error);
      Alert.alert('오류', `${screen} 화면으로 이동할 수 없습니다.`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>안녕하세요!</Text>
          <Text style={styles.userName}>
            {user?.displayName || user?.email || '사용자'}님
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>오늘의 기록</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={() => handleNavigate('Memory')}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={32} color={colors.white} />
            <Text style={styles.buttonText}>새 기록 작성</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={() => handleNavigate('Gallery')}
            activeOpacity={0.8}
          >
            <Ionicons name="images" size={32} color={colors.primary} />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>갤러리 보기</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]} 
            onPress={() => handleNavigate('Calendar')}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={32} color={colors.primary} />
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>달력 보기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.white,
    ...shadows.small,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 32,
  },
  actionButtons: {
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    ...shadows.medium,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 16,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
  },
}); 