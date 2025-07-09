import * as FileSystem from 'expo-file-system';
import { cache } from '../utils/cache';

interface ImageCacheOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export const imageOptimization = {
  // 이미지 URL을 캐시 키로 변환
  getCacheKey: (url: string, options: ImageCacheOptions = {}): string => {
    const { width, height, quality } = options;
    return `${url}_${width || 'original'}_${height || 'original'}_${quality || 80}`;
  },

  // 이미지 다운로드 및 캐싱
  downloadAndCache: async (
    url: string, 
    options: ImageCacheOptions = {}
  ): Promise<string> => {
    const cacheKey = imageOptimization.getCacheKey(url, options);
    
    // 캐시에서 확인
    const cachedPath = cache.get<string>(cacheKey);
    if (cachedPath && await FileSystem.getInfoAsync(cachedPath).then(info => info.exists)) {
      return cachedPath;
    }

    // 다운로드
    const filename = `${cacheKey}.jpg`;
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;
    
    try {
      const downloadResult = await FileSystem.downloadAsync(url, fileUri);
      
      if (downloadResult.status === 200) {
        cache.set(cacheKey, fileUri, 24 * 60 * 60 * 1000); // 24시간 캐시
        return fileUri;
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Image download error:', error);
      return url; // 실패 시 원본 URL 반환
    }
  },

  // 캐시 정리
  clearCache: async (): Promise<void> => {
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (cacheDir) {
        const files = await FileSystem.readDirectoryAsync(cacheDir);
        for (const file of files) {
          if (file.endsWith('.jpg')) {
            await FileSystem.deleteAsync(`${cacheDir}${file}`);
          }
        }
      }
      cache.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },
}; 