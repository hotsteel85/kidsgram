import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Memory: { date?: string; memoryId?: string };
  Gallery: undefined;
  Calendar: undefined;
  MemoryDetail: { memoryId: string };
};

export type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;
export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type MemoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Memory'>;
export type GalleryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Gallery'>;
export type CalendarScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Calendar'>;
export type MemoryDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MemoryDetail'>;

export type MemoryScreenRouteProp = RouteProp<RootStackParamList, 'Memory'>;
export type MemoryDetailScreenRouteProp = RouteProp<RootStackParamList, 'MemoryDetail'>; 