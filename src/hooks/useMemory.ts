import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Memory } from '../types';
import { 
  getUserMemories, 
  getMemoryByDate as getMemoryByDateFromService, 
  getMemoryById as getMemoryByIdFromService,
  saveMemory, 
  updateMemory, 
  deleteMemory 
} from '../services/firestore';
import { uploadPhoto, uploadAudio, deleteFile, getFilePathFromURL } from '../services/storage';
import { formatDate } from '../utils/dateUtils';

export const useMemory = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 메모리 목록 로드
  const loadMemories = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      const userMemories = await getUserMemories(user.uid);
      setMemories(userMemories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '메모리를 불러올 수 없습니다.';
      console.error('메모리 로드 오류:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 특정 날짜의 메모리 조회
  const getMemoryByDate = useCallback(async (date: string): Promise<Memory | null> => {
    if (!user) return null;
    try {
      return await getMemoryByDateFromService(user.uid, date);
    } catch (err) {
      console.error('날짜별 메모리 조회 오류:', err);
      return null;
    }
  }, [user]);

  // 특정 메모리 조회
  const getMemoryById = useCallback(async (id: string): Promise<Memory | null> => {
    try {
      return await getMemoryByIdFromService(id);
    } catch (err) {
      console.error('메모리 조회 오류:', err);
      return null;
    }
  }, []);

  // 메모리 저장 (새로 생성 - 기존 기록 삭제 후)
  const saveMemoryData = useCallback(async (
    date: Date,
    photoUri?: string,
    audioUri?: string,
    note?: string,
    emotion?: string
  ): Promise<string> => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    const dateString = formatDate(date);
    console.log('saveMemoryData 시작:', { dateString, date, userId: user.uid });
    
    // 같은 날짜의 기존 기록 확인 및 삭제
    const existingMemory = await getMemoryByDate(dateString);
    console.log('기존 기록 확인 결과:', existingMemory ? `ID: ${existingMemory.id}` : '없음');
    
    if (existingMemory) {
      console.log('기존 기록 삭제 시작');
      // 기존 파일들 삭제
      if (existingMemory.photoUrl) {
        try {
          await deleteFile(getFilePathFromURL(existingMemory.photoUrl));
          console.log('기존 사진 삭제 완료');
        } catch (error) {
          console.error('기존 사진 삭제 오류:', error);
        }
      }

      if (existingMemory.audioUrl) {
        try {
          await deleteFile(getFilePathFromURL(existingMemory.audioUrl));
          console.log('기존 오디오 삭제 완료');
        } catch (error) {
          console.error('기존 오디오 삭제 오류:', error);
        }
      }

      // Firestore에서 삭제
      await deleteMemory(existingMemory.id!);
      console.log('Firestore에서 기존 기록 삭제 완료');
      
      // 로컬 상태에서 제거
      setMemories(prev => prev.filter(memory => memory.id !== existingMemory.id));
    }
    
    // 새로운 기록 생성
    let photoUrl: string | undefined;
    let audioUrl: string | undefined;

    try {
      console.log('새 기록 생성 시작');
      
      // 사진 업로드
      if (photoUri) {
        console.log('사진 업로드 시작');
        photoUrl = await uploadPhoto(photoUri, user.uid, dateString);
        console.log('사진 업로드 완료:', photoUrl);
      }

      // 오디오 업로드
      if (audioUri) {
        console.log('오디오 업로드 시작');
        audioUrl = await uploadAudio(audioUri, user.uid, dateString);
        console.log('오디오 업로드 완료:', audioUrl);
      }

      // Firestore에 저장
      const memoryData = {
        date: dateString,
        photoUrl,
        audioUrl,
        note: note?.trim(),
        emotion: emotion?.trim(),
        userId: user.uid,
      };
      
      console.log('Firestore 저장 데이터:', memoryData);
      const memoryId = await saveMemory(memoryData);
      console.log('Firestore 저장 완료, ID:', memoryId);
      
      // 로컬 상태 업데이트
      const newMemory: Memory = {
        id: memoryId,
        ...memoryData,
        createdAt: new Date(),
      };
      
      setMemories(prev => [newMemory, ...prev]);
      console.log('로컬 상태 업데이트 완료');
      
      return memoryId;
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      // 업로드된 파일들 정리
      if (photoUrl) {
        try {
          await deleteFile(getFilePathFromURL(photoUrl));
        } catch (cleanupError) {
          console.error('사진 정리 오류:', cleanupError);
        }
      }
      
      if (audioUrl) {
        try {
          await deleteFile(getFilePathFromURL(audioUrl));
        } catch (cleanupError) {
          console.error('오디오 정리 오류:', cleanupError);
        }
      }
      
      throw error;
    }
  }, [user, getMemoryByDate]);

  // 메모리 업데이트 (기존 수정)
  const updateMemoryData = useCallback(async (
    memoryId: string,
    updates: Partial<Memory>
  ): Promise<void> => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      // 기존 메모리 정보 가져오기
      const existingMemory = await getMemoryById(memoryId);
      if (!existingMemory) {
        throw new Error('메모리를 찾을 수 없습니다.');
      }

      let photoUrl = updates.photoUrl;
      let audioUrl = updates.audioUrl;

      // 새로운 파일이 업로드된 경우
      if (updates.photoUrl && updates.photoUrl !== existingMemory.photoUrl) {
        // 기존 사진 삭제
        if (existingMemory.photoUrl) {
          try {
            await deleteFile(getFilePathFromURL(existingMemory.photoUrl));
          } catch (error) {
            console.error('기존 사진 삭제 오류:', error);
          }
        }
        // 새 사진 업로드
        photoUrl = await uploadPhoto(updates.photoUrl, user.uid, updates.date || existingMemory.date);
      }

      if (updates.audioUrl && updates.audioUrl !== existingMemory.audioUrl) {
        // 기존 오디오 삭제
        if (existingMemory.audioUrl) {
          try {
            await deleteFile(getFilePathFromURL(existingMemory.audioUrl));
          } catch (error) {
            console.error('기존 오디오 삭제 오류:', error);
          }
        }
        // 새 오디오 업로드
        audioUrl = await uploadAudio(updates.audioUrl, user.uid, updates.date || existingMemory.date);
      }

      // Firestore 업데이트
      const updateData = {
        ...updates,
        photoUrl,
        audioUrl,
      };

      await updateMemory(memoryId, updateData);
      
      // 로컬 상태 업데이트
      setMemories(prev => 
        prev.map(memory => 
          memory.id === memoryId 
            ? { ...memory, ...updateData }
            : memory
        )
      );
    } catch (error) {
      throw error;
    }
  }, [user]);

  // 메모리 삭제
  const deleteMemoryData = useCallback(async (memoryId: string): Promise<void> => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      const memory = memories.find(m => m.id === memoryId);
      if (!memory) {
        throw new Error('메모리를 찾을 수 없습니다.');
      }

      // 파일들 삭제
      if (memory.photoUrl) {
        try {
          await deleteFile(getFilePathFromURL(memory.photoUrl));
        } catch (error) {
          console.error('사진 삭제 오류:', error);
        }
      }

      if (memory.audioUrl) {
        try {
          await deleteFile(getFilePathFromURL(memory.audioUrl));
        } catch (error) {
          console.error('오디오 삭제 오류:', error);
        }
      }

      // Firestore에서 삭제
      await deleteMemory(memoryId);
      
      // 로컬 상태 업데이트
      setMemories(prev => prev.filter(memory => memory.id !== memoryId));
    } catch (error) {
      throw error;
    }
  }, [user, memories]);

  // 초기 로드
  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  return {
    memories,
    loading,
    error,
    loadMemories,
    getMemoryByDate,
    getMemoryById,
    saveMemoryData,
    updateMemoryData,
    deleteMemoryData,
  };
}; 