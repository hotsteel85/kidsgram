import React, { useCallback, useMemo } from 'react';
import { FlatList, FlatListProps, RefreshControl } from 'react-native';
import { colors } from '../styles/colors';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function OptimizedFlatList<T>({
  data,
  renderItem,
  keyExtractor,
  onRefresh,
  refreshing = false,
  ...props
}: OptimizedFlatListProps<T>) {
  const memoizedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => renderItem(item, index),
    [renderItem]
  );

  const memoizedKeyExtractor = useCallback(
    (item: T, index: number) => keyExtractor(item, index),
    [keyExtractor]
  );

  const refreshControl = useMemo(
    () =>
      onRefresh ? (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      ) : undefined,
    [onRefresh, refreshing]
  );

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={memoizedKeyExtractor}
      refreshControl={refreshControl}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
      getItemLayout={undefined}
      {...props}
    />
  );
} 