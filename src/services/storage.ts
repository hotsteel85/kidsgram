import storage from '@react-native-firebase/storage';
import { FIREBASE_STORAGE_PATHS } from '../utils/constants';

// 파일 업로드
export const uploadFile = async (
  file: any, // Blob | Uint8Array | ArrayBuffer 등
  path: string,
  contentType?: string
): Promise<string> => {
  try {
    const refInstance = storage().ref(path);
    let taskSnapshot;
    if (contentType) {
      taskSnapshot = await refInstance.put(file, { contentType });
    } else {
      taskSnapshot = await refInstance.put(file);
    }
    const downloadURL = await refInstance.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    throw new Error('파일 업로드에 실패했습니다.');
  }
};

// 사진 업로드
export const uploadPhoto = async (
  uri: string,
  userId: string,
  date: string
): Promise<string> => {
  try {
    console.log('uploadPhoto - uri:', uri);
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    console.log('uploadPhoto - arrayBuffer byteLength:', arrayBuffer.byteLength);
    const fileName = `photos/${userId}/${date}_${Date.now()}.jpg`;
    const downloadURL = await uploadFile(arrayBuffer, fileName, 'image/jpeg');
    return downloadURL;
  } catch (error) {
    console.error('사진 업로드 오류:', error);
    throw new Error('사진 업로드에 실패했습니다.');
  }
};

// 오디오 업로드
export const uploadAudio = async (
  uri: string,
  userId: string,
  date: string
): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `audio/${userId}/${date}_${Date.now()}.m4a`;
    const downloadURL = await uploadFile(blob, fileName, 'audio/m4a');
    return downloadURL;
  } catch (error) {
    console.error('오디오 업로드 오류:', error);
    throw new Error('오디오 업로드에 실패했습니다.');
  }
};

// 파일 삭제
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const refInstance = storage().ref(path);
    await refInstance.delete();
  } catch (error) {
    console.error('파일 삭제 오류:', error);
    throw new Error('파일 삭제에 실패했습니다.');
  }
};

// URL에서 파일 경로 추출
export const getFilePathFromURL = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const storageIndex = pathSegments.findIndex(segment => segment === 'o');
    if (storageIndex !== -1 && storageIndex + 1 < pathSegments.length) {
      return decodeURIComponent(pathSegments[storageIndex + 1]);
    }
    throw new Error('유효하지 않은 Storage URL입니다.');
  } catch (error) {
    console.error('파일 경로 추출 오류:', error);
    throw new Error('파일 경로를 추출할 수 없습니다.');
  }
}; 