# Kidsgram

**Kidsgram**은 아이가 하루를 사진, 음성, 메모, 그리고 감정 이모지로 기록할 수 있는 감성 일기장 앱입니다.  
부모와 아이가 함께 하루의 감정을 남기고, 갤러리에서 추억을 한눈에 볼 수 있습니다.

---

## 주요 기능

- **기록하기**
  - 날짜별로 사진, 음성 녹음, 메모, 감정(이모지+감성 문구) 기록
  - 감정은 드롭다운에서 선택(예: "행복이 가득해", "눈물이 맺혀요" 등)
- **갤러리**
  - 사진 기록을 한눈에 볼 수 있는 그리드 뷰
  - 각 사진에 날짜와 감정 이모지 오버레이 표시
- **상세 보기**
  - 기록의 사진, 음성, 메모, 감정 이모지 모두 확인 가능
- **감정 통계**
  - 하루하루의 감정 변화를 한눈에

---

## 기술 스택

- **React Native** (Expo)
- **TypeScript**
- **Firebase Firestore** (데이터 저장)
- **Firebase Storage** (사진/음성 파일 저장)
- **React Navigation**
- **EmotionSelector**: 감성적 감정 드롭다운 컴포넌트

---

## 폴더 구조

```
src/
  components/
    Memory/
      AudioRecorder.tsx
      EmotionSelector.tsx
      PhotoUpload.tsx
    ...
  screens/
    MemoryScreen.tsx
    GalleryScreen.tsx
    MemoryDetailScreen.tsx
    ...
  services/
    firestore.ts
    storage.ts
  hooks/
    useMemory.ts
  types/
    index.ts
  ...
```

---

## 커스텀 감정 드롭다운

- 감정 선택 시, 드롭다운에는 감성 문구(예: "행복이 가득해")가 보이고
- 선택 후에는 2글자 요약(예: "행복")만 노출되어 UI가 깔끔합니다.

---


---

## 기여 및 문의

- Pull Request, Issue 환영합니다!
- 문의: [hotsteel85@gmail.com] 