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

  // 메모리 저장 (새로 생성)
  const saveMemoryData = useCallback(async (
    date: Date,
    photoUri?: string,
    audioUri?: string,
    note?: string
  ): Promise<string> => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    const dateString = formatDate(date);
    let photoUrl: string | undefined;
    let audioUrl: string | undefined;

    try {
      // 사진 업로드
      if (photoUri) {
        photoUrl = await uploadPhoto(photoUri, user.uid, dateString);
      }

      // 오디오 업로드
      if (audioUri) {
        audioUrl = await uploadAudio(audioUri, user.uid, dateString);
      }

      // Firestore에 저장
      const memoryData = {
        date: dateString,
        photoUrl,
        audioUrl,
        note: note?.trim(),
        userId: user.uid,
      };

      const memoryId = await saveMemory(memoryData);
      
      // 로컬 상태 업데이트
      const newMemory: Memory = {
        id: memoryId,
        ...memoryData,
        createdAt: new Date(),
      };
      
      setMemories(prev => [newMemory, ...prev]);
      
      return memoryId;
    } catch (error) {
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
  }, [user]);

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