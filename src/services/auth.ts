import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { User } from '../types';

// Google 로그인 (네이티브)
export const signInWithGoogle = async (): Promise<any> => {
  try {
    console.log('Google 로그인 시작...');
    
    await GoogleSignin.hasPlayServices();
    console.log('Play Services 확인 완료');
    
    const signInResponse: any = await GoogleSignin.signIn();
    console.log('Google Sign-In 응답:', signInResponse);
    
    const idToken = signInResponse.data?.idToken || signInResponse.idToken;
    console.log('ID Token 존재 여부:', !!idToken);
    
    if (!idToken) {
      console.error('ID Token이 없습니다. 전체 응답:', signInResponse);
      throw new Error('Google 로그인에 실패했습니다: idToken이 없습니다.');
    }
    
    console.log('Firebase 인증 시작...');
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);
    console.log('Firebase 인증 완료:', userCredential.user);
    
    return userCredential.user;
  } catch (error) {
    console.error('Google 네이티브 로그인 오류:', error);
    throw error;
  }
};

// 로그아웃
export const signOutUser = async (): Promise<void> => {
  try {
    await auth().signOut();
  } catch (error) {
    console.error('로그아웃 오류:', error);
    throw error;
  }
};

// 인증 상태 변경 리스너
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return auth().onAuthStateChanged((firebaseUser: any) => {
    const user = firebaseUser
      ? {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || undefined,
        }
      : null;
    callback(user);
  });
};
