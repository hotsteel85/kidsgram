import firestore from '@react-native-firebase/firestore';
import { Memory } from '../types';
import { FIREBASE_COLLECTIONS } from '../utils/constants';

// 메모리 저장
export const saveMemory = async (memory: Omit<Memory, 'id' | 'createdAt'>): Promise<string> => {
  try {
    // undefined 필드 제거
    const filteredMemory = Object.fromEntries(
      Object.entries({
        ...memory,
        createdAt: firestore.FieldValue.serverTimestamp(),
      }).filter(([_, v]) => v !== undefined)
    );
    const docRef = await firestore()
      .collection(FIREBASE_COLLECTIONS.MEMORIES)
      .add(filteredMemory);
    return docRef.id;
  } catch (error) {
    console.error('메모리 저장 오류:', error);
    throw new Error('메모리 저장에 실패했습니다.');
  }
};

// 메모리 업데이트
export const updateMemory = async (id: string, updates: Partial<Memory>): Promise<void> => {
  try {
    // undefined 필드 제거
    const filteredUpdates = Object.fromEntries(
      Object.entries({
        ...updates,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }).filter(([_, v]) => v !== undefined)
    );
    await firestore()
      .collection(FIREBASE_COLLECTIONS.MEMORIES)
      .doc(id)
      .update(filteredUpdates);
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
      createdAt: data.createdAt?.toDate() || new Date(),
      userId: data.userId,
    };
  } catch (error) {
    console.error('메모리 조회 오류:', error);
    throw new Error('메모리를 불러올 수 없습니다.');
  }
}; 