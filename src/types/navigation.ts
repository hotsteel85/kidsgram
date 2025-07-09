import { StackScreenProps } from '@react-navigation/stack';
import { NavigatorScreenParams, CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Memory } from './';

export type TabParamList = {
  Memory: { memory?: Partial<Memory> } | undefined;
  Gallery: undefined;
  Calendar: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  Auth: undefined;
  MemoryDetail: { memory: Memory };
};

export type AuthScreenProps = StackScreenProps<RootStackParamList, 'Auth'>;

export type MemoryDetailScreenProps = StackScreenProps<RootStackParamList, 'MemoryDetail'>;

export type MemoryScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Memory'>,
  StackScreenProps<RootStackParamList>
>;

export type GalleryScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Gallery'>,
  StackScreenProps<RootStackParamList>
>;

export type CalendarScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Calendar'>,
  StackScreenProps<RootStackParamList>
>;

export type SettingsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Settings'>,
  StackScreenProps<RootStackParamList>
>; 