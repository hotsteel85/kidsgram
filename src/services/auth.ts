import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { User } from '../types';

// Google 로그인 (네이티브)
export const signInWithGoogle = async (): Promise<any> => {
  try {
    await GoogleSignin.hasPlayServices();
    const signInResponse: any = await GoogleSignin.signIn();
    const idToken = signInResponse.idToken;
    if (!idToken) {
      throw new Error('Google 로그인에 실패했습니다: idToken이 없습니다.');
    }
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);
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
