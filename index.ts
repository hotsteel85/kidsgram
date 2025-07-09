import { registerRootComponent } from 'expo';
import firebase from '@react-native-firebase/app';

import App from './App';

// Firebase 앱이 초기화되지 않았을 때만 초기화
if (firebase.apps.length === 0) {
  // @react-native-firebase/app은 자동으로 google-services.json을 읽어 초기화됩니다
  console.log('Firebase will be auto-initialized');
} else {
  console.log('Firebase already initialized');
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
