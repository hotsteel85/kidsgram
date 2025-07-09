import firestore from '@react-native-firebase/firestore';
import { Memory } from '../types';
import { FIREBASE_COLLECTIONS } from '../utils/constants';

// 메모리 저장
export const saveMemory = async (memory: Omit<Memory, 'id' | 'createdAt'>): Promise<string> => {
  try {
    console.log('saveMemory 호출됨, 원본 데이터:', memory);
    
    // 빈 문자열과 undefined를 구분하여 처리
    const memoryData: any = {
      date: memory.date,
      userId: memory.userId,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };
    
    // note는 빈 문자열도 허용
    if (memory.note !== undefined) {
      memoryData.note = memory.note;
    }
    
    // emotion은 빈 문자열도 허용
    if (memory.emotion !== undefined) {
      memoryData.emotion = memory.emotion;
    }
    
    // photoUrl과 audioUrl은 undefined가 아닐 때만 포함
    if (memory.photoUrl !== undefined) {
      memoryData.photoUrl = memory.photoUrl;
    }
    
    if (memory.audioUrl !== undefined) {
      memoryData.audioUrl = memory.audioUrl;
    }
    
    console.log('저장할 데이터:', memoryData);
    
    const docRef = await firestore()
      .collection(FIREBASE_COLLECTIONS.MEMORIES)
      .add(memoryData);
    
    console.log('Firestore 저장 완료, 문서 ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('메모리 저장 오류:', error);
    throw new Error('메모리 저장에 실패했습니다.');
  }
};

// 메모리 업데이트
export const updateMemory = async (id: string, updates: Partial<Memory>): Promise<void> => {
  try {
    console.log('updateMemory 호출됨, 업데이트 데이터:', updates);
    
    // 빈 문자열과 undefined를 구분하여 처리
    const updateData: any = {
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };
    
    // 각 필드를 개별적으로 처리
    if (updates.date !== undefined) {
      updateData.date = updates.date;
    }
    
    if (updates.note !== undefined) {
      updateData.note = updates.note;
    }
    
    if (updates.emotion !== undefined) {
      updateData.emotion = updates.emotion;
    }
    
    if (updates.photoUrl !== undefined) {
      updateData.photoUrl = updates.photoUrl;
    }
    
    if (updates.audioUrl !== undefined) {
      updateData.audioUrl = updates.audioUrl;
    }
    
    console.log('업데이트할 데이터:', updateData);
    
    await firestore()
      .collection(FIREBASE_COLLECTIONS.MEMORIES)
      .doc(id)
      .update(updateData);
      
    console.log('Firestore 업데이트 완료');
  } catch (error) {
    console.error('메모리 업데이트 오류:', error);
    throw new Error('메모리 업데이트에 실패했습니다.');
  }
};

// 메모리 삭제
export const deleteMemory = async (id: string): Promise<void> => {
  try {
    await firestore()
      .collection(FIREBASE_COLLECTIONS.MEMORIES)
      .doc(id)
      .delete();
  } catch (error) {
    console.error('메모리 삭제 오류:', error);
    throw new Error('메모리 삭제에 실패했습니다.');
  }
};

// 사용자의 모든 메모리 조회
export const getUserMemories = async (userId: string): Promise<Memory[]> => {
  try {
    const querySnapshot = await firestore()
      .collection(FIREBASE_COLLECTIONS.MEMORIES)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const memories: Memory[] = [];
    
    querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      memories.push({
        id: doc.id,
        date: data.date,
        photoUrl: data.photoUrl || undefined,
        audioUrl: data.audioUrl || undefined,
        note: data.note || undefined,
        emotion: data.emotion || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        userId: data.userId,
      });
    });
    
    return memories;
  } catch (error) {
    console.error('메모리 조회 오류:', error);
    throw new Error('메모리를 불러올 수 없습니다.');
  }
};

// 특정 날짜의 메모리 조회
export const getMemoryByDate = async (userId: string, date: string): Promise<Memory | null> => {
  try {
    const querySnapshot = await firestore()
      .collection(FIREBASE_COLLECTIONS.MEMORIES)
      .where('userId', '==', userId)
      .where('date', '==', date)
      .get();
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      date: data.date,
      photoUrl: data.photoUrl || undefined,
      audioUrl: data.audioUrl || undefined,
      note: data.note || undefined,
      emotion: data.emotion || undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      userId: data.userId,
    };
  } catch (error) {
    console.error('날짜별 메모리 조회 오류:', error);
    throw new Error('메모리를 불러올 수 없습니다.');
  }
};

// 특정 메모리 조회
export const getMemoryById = async (id: string): Promise<Memory | null> => {
  try {
    const docSnap = await firestore()
      .collection(FIREBASE_COLLECTIONS.MEMORIES)
      .doc(id)
      .get();
    
    if (!docSnap.exists) {
      return null;
    }
    
    const data = docSnap.data();
    if (!data) {
      return null;
    }
    
    return {
      id: docSnap.id,
      date: data.date,
      photoUrl: data.photoUrl || undefined,
      audioUrl: data.audioUrl || undefined,
      note: data.note || undefined,
      emotion: data.emotion || undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      userId: data.userId,
    };
  } catch (error) {
    console.error('메모리 조회 오류:', error);
    throw new Error('메모리를 불러올 수 없습니다.');
  }
}; 