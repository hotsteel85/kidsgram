import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { GoogleSignIn } from '../components/Auth/GoogleSignIn';
import { Loading } from '../components/UI/Loading';
import { ErrorMessage } from '../components/UI/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../styles/colors';

export const AuthScreen: React.FC = () => {
  const { login, loading, error } = useAuth();

  if (loading) {
    return <Loading message="인증 상태 확인 중..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={login}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.splitContainer}>
        <View style={styles.topSection}>
          <Text style={styles.title}>Kidsgram</Text>
          <Text style={styles.subtitle}>
            아이의 소중한 순간들을 기록하세요
          </Text>
        </View>
        <View style={styles.middleSection}>
          <GoogleSignIn 
            onPress={login}
            loading={loading}
            disabled={loading}
          />
        </View>
        <View style={styles.bottomSection}>
          <Text style={styles.footerText}>
            로그인하여 개인화된 경험을 시작하세요
          </Text>
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
  splitContainer: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  footerText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
}); 