import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { GameContentConfig, Question } from '../types';
import { DEFAULT_GAME_CONFIG } from '../data/defaultData';
import firebaseConfigJson from '../../firebase-applet-config.json';

const LOCAL_STORAGE_KEY = 'keo_co_tri_tue_content_v2';
const CHUNK_SIZE = 500000; // ~500KB per chunk to safely stay within Firestore 1MB document limit
const LARGE_MEDIA_THRESHOLD = 150000; // 150KB threshold for chunking

let firestoreDb: ReturnType<typeof getFirestore> | null = null;

try {
  const firebaseConfig = {
    apiKey: firebaseConfigJson.apiKey,
    authDomain: firebaseConfigJson.authDomain,
    projectId: firebaseConfigJson.projectId,
    storageBucket: firebaseConfigJson.storageBucket,
    messagingSenderId: firebaseConfigJson.messagingSenderId,
    appId: firebaseConfigJson.appId,
  };

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  if (firebaseConfigJson.firestoreDatabaseId) {
    firestoreDb = getFirestore(app, firebaseConfigJson.firestoreDatabaseId);
  } else {
    firestoreDb = getFirestore(app);
  }
} catch (error) {
  console.warn("Firebase initialization warning (local storage fallback active):", error);
}

// ==========================================
// 1. IndexedDB Helper for Client Media Cache
// (Bypasses localStorage 5MB quota limit)
// ==========================================
function openMediaDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open('KeoCoTriTue_MediaDB', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('media_store')) {
          db.createObjectStore('media_store');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn("Could not open IndexedDB:", request.error);
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

async function saveToIndexedDb(key: string, value: string): Promise<void> {
  try {
    const db = await openMediaDb();
    if (!db) return;
    const tx = db.transaction('media_store', 'readwrite');
    const store = tx.objectStore('media_store');
    store.put(value, key);
  } catch (e) {
    console.warn("Failed saving media to IndexedDB:", e);
  }
}

async function getFromIndexedDb(key: string): Promise<string | null> {
  try {
    const db = await openMediaDb();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction('media_store', 'readonly');
      const store = tx.objectStore('media_store');
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as string) || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// ==========================================
// 2. Firestore Media Chunking (Avoids 1MB Limit)
// ==========================================
async function saveLargeMediaToFirestore(assetKey: string, dataUrl: string): Promise<number> {
  if (!firestoreDb) return 0;

  const totalLength = dataUrl.length;
  const totalChunks = Math.ceil(totalLength / CHUNK_SIZE);

  const chunkPromises = [];
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, totalLength);
    const chunkData = dataUrl.substring(start, end);

    const chunkDocRef = doc(firestoreDb, 'game_media', `${assetKey}_chunk_${i}`);
    chunkPromises.push(
      setDoc(chunkDocRef, {
        assetKey,
        chunkIndex: i,
        totalChunks,
        data: chunkData,
        updatedAt: new Date().toISOString()
      }, { merge: true })
    );
  }

  await Promise.all(chunkPromises);
  return totalChunks;
}

async function loadLargeMediaFromFirestore(assetKey: string, totalChunks: number): Promise<string | null> {
  if (!firestoreDb || totalChunks <= 0) return null;

  try {
    const readPromises = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkDocRef = doc(firestoreDb, 'game_media', `${assetKey}_chunk_${i}`);
      readPromises.push(getDoc(chunkDocRef));
    }

    const snaps = await Promise.all(readPromises);
    const chunks: string[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const snap = snaps[i];
      if (!snap.exists()) {
        console.warn(`Missing media chunk ${i} for ${assetKey}`);
        return null;
      }
      chunks.push(snap.data()?.data || '');
    }

    return chunks.join('');
  } catch (e) {
    console.warn(`Failed loading chunks for ${assetKey}:`, e);
    return null;
  }
}

// ==========================================
// 3. Load & Save Game Configuration
// ==========================================

/**
 * Load game configuration from Firestore, falling back to localStorage / IndexedDB and default data
 */
export async function loadGameConfig(): Promise<GameContentConfig> {
  // 1. Try Firestore first
  if (firestoreDb) {
    try {
      const configDocRef = doc(firestoreDb, 'game_config', 'main_settings_v2');
      const docSnap = await getDoc(configDocRef);
      if (docSnap.exists()) {
        const rawData = docSnap.data();
        const data = rawData as Partial<GameContentConfig> & {
          hasLargeGreetingAudio?: boolean;
          greetingAudioChunks?: number;
          hasLargeAzeroImage?: boolean;
          azeroImageChunks?: number;
        };

        // Reconstruct large greeting audio if chunked
        let restoredGreetingAudio = data.greetingAudioUrl || '';
        if (data.hasLargeGreetingAudio && (data.greetingAudioChunks || 0) > 0) {
          // Check IndexedDB first for instant retrieval
          const localAudio = await getFromIndexedDb('greeting_audio');
          if (localAudio) {
            restoredGreetingAudio = localAudio;
          } else {
            const onlineAudio = await loadLargeMediaFromFirestore('greeting_audio', data.greetingAudioChunks!);
            if (onlineAudio) {
              restoredGreetingAudio = onlineAudio;
              saveToIndexedDb('greeting_audio', onlineAudio);
            }
          }
        }

        // Reconstruct large custom image if chunked
        let restoredAzeroImage = data.azeroImageUrl || '';
        if (data.hasLargeAzeroImage && (data.azeroImageChunks || 0) > 0) {
          const localImg = await getFromIndexedDb('azero_image');
          if (localImg) {
            restoredAzeroImage = localImg;
          } else {
            const onlineImg = await loadLargeMediaFromFirestore('azero_image', data.azeroImageChunks!);
            if (onlineImg) {
              restoredAzeroImage = onlineImg;
              saveToIndexedDb('azero_image', onlineImg);
            }
          }
        }

        // Reconstruct questions and any chunked question audios
        let restoredQuestions = data.questions || [];
        if (restoredQuestions.length > 0) {
          restoredQuestions = await Promise.all(
            restoredQuestions.map(async (q: Question) => {
              if (q.audioUrl && q.audioUrl.startsWith('[chunked:')) {
                const match = q.audioUrl.match(/\[chunked:([^:]+):(\d+)\]/);
                if (match) {
                  const assetKey = match[1];
                  const chunksCount = parseInt(match[2], 10);
                  const cached = await getFromIndexedDb(assetKey);
                  if (cached) return { ...q, audioUrl: cached };
                  const loaded = await loadLargeMediaFromFirestore(assetKey, chunksCount);
                  if (loaded) {
                    saveToIndexedDb(assetKey, loaded);
                    return { ...q, audioUrl: loaded };
                  }
                }
              }
              return q;
            })
          );
        }

        // Verify questions belong to current Tô Hiệu question set
        const hasValidNewQuestions =
          restoredQuestions.length === 16 &&
          restoredQuestions[0]?.question?.includes("chất Tô Hiệu");

        const merged: GameContentConfig = {
          ...DEFAULT_GAME_CONFIG,
          ...data,
          greetingAudioUrl: restoredGreetingAudio,
          azeroImageUrl: restoredAzeroImage,
          questions: hasValidNewQuestions ? restoredQuestions : DEFAULT_GAME_CONFIG.questions,
          tieBreakerQuestion: data.tieBreakerQuestion || DEFAULT_GAME_CONFIG.tieBreakerQuestion,
        };

        // Cache safe metadata to localStorage
        try {
          const safeConfig = {
            ...merged,
            greetingAudioUrl: restoredGreetingAudio.length > LARGE_MEDIA_THRESHOLD ? '' : restoredGreetingAudio,
            azeroImageUrl: restoredAzeroImage.length > LARGE_MEDIA_THRESHOLD ? '' : restoredAzeroImage,
          };
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(safeConfig));
        } catch (e) {
          console.warn("Could not cache to localStorage (quota or disabled):", e);
        }

        return merged;
      }
    } catch (e) {
      console.warn("Error fetching from Firestore, checking local storage:", e);
    }
  }

  // 2. Try localStorage cache & IndexedDB
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      const localAudio = await getFromIndexedDb('greeting_audio');
      const localImg = await getFromIndexedDb('azero_image');

      if (localAudio) parsed.greetingAudioUrl = localAudio;
      if (localImg) parsed.azeroImageUrl = localImg;

      const hasValidNewQuestions =
        parsed.questions &&
        parsed.questions.length === 16 &&
        parsed.questions[0]?.question?.includes("chất Tô Hiệu");

      return {
        ...DEFAULT_GAME_CONFIG,
        ...parsed,
        questions: hasValidNewQuestions ? parsed.questions : DEFAULT_GAME_CONFIG.questions,
      };
    }
  } catch (e) {
    console.warn("Error reading localStorage:", e);
  }

  // 3. Fallback to default configuration
  return DEFAULT_GAME_CONFIG;
}

/**
 * Save game configuration to Firestore and local storage, safely chunking any large media assets
 */
export async function saveGameConfigOnline(
  config: GameContentConfig
): Promise<{ success: boolean; syncedOnline: boolean; message: string }> {
  // 1. Always save media blobs to local IndexedDB (handles large files without 5MB quota crashes)
  if (config.greetingAudioUrl && config.greetingAudioUrl.length > LARGE_MEDIA_THRESHOLD) {
    await saveToIndexedDb('greeting_audio', config.greetingAudioUrl);
  }
  if (config.azeroImageUrl && config.azeroImageUrl.length > LARGE_MEDIA_THRESHOLD) {
    await saveToIndexedDb('azero_image', config.azeroImageUrl);
  }

  // 2. Save safe metadata to localStorage
  try {
    const safeLocalConfig = {
      ...config,
      greetingAudioUrl:
        config.greetingAudioUrl && config.greetingAudioUrl.length > LARGE_MEDIA_THRESHOLD
          ? ''
          : config.greetingAudioUrl,
      azeroImageUrl:
        config.azeroImageUrl && config.azeroImageUrl.length > LARGE_MEDIA_THRESHOLD
          ? ''
          : config.azeroImageUrl,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(safeLocalConfig));
  } catch (e) {
    console.warn("LocalStorage setItem failed (exceeded quota), IndexedDB has the data:", e);
  }

  // 3. Sync to Firestore with chunking for large media
  if (firestoreDb) {
    try {
      let hasLargeGreetingAudio = false;
      let greetingAudioChunks = 0;
      let sanitizedGreetingAudioUrl = config.greetingAudioUrl || '';

      // If greeting audio is large (>150KB or Base64 data URL), chunk it into separate documents
      if (config.greetingAudioUrl && config.greetingAudioUrl.length > LARGE_MEDIA_THRESHOLD) {
        hasLargeGreetingAudio = true;
        greetingAudioChunks = await saveLargeMediaToFirestore('greeting_audio', config.greetingAudioUrl);
        // Clear direct audio string on the main document so its size is tiny (~10KB)
        sanitizedGreetingAudioUrl = '';
      }

      let hasLargeAzeroImage = false;
      let azeroImageChunks = 0;
      let sanitizedAzeroImageUrl = config.azeroImageUrl || '';

      // If image is large (>150KB), chunk it as well
      if (config.azeroImageUrl && config.azeroImageUrl.length > LARGE_MEDIA_THRESHOLD) {
        hasLargeAzeroImage = true;
        azeroImageChunks = await saveLargeMediaToFirestore('azero_image', config.azeroImageUrl);
        sanitizedAzeroImageUrl = '';
      }

      // Check each question for large audio recordings
      const sanitizedQuestions = await Promise.all(
        config.questions.map(async (q) => {
          if (q.audioUrl && q.audioUrl.length > LARGE_MEDIA_THRESHOLD) {
            const assetKey = `q_audio_${q.id}`;
            await saveToIndexedDb(assetKey, q.audioUrl);
            const chunksCount = await saveLargeMediaToFirestore(assetKey, q.audioUrl);
            return {
              ...q,
              audioUrl: `[chunked:${assetKey}:${chunksCount}]`
            };
          }
          return q;
        })
      );

      // Write slim main document (well under 1MB Firestore limit)
      const configDocRef = doc(firestoreDb, 'game_config', 'main_settings_v2');
      await setDoc(
        configDocRef,
        {
          ...config,
          questions: sanitizedQuestions,
          greetingAudioUrl: sanitizedGreetingAudioUrl,
          hasLargeGreetingAudio,
          greetingAudioChunks,
          azeroImageUrl: sanitizedAzeroImageUrl,
          hasLargeAzeroImage,
          azeroImageChunks,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return {
        success: true,
        syncedOnline: true,
        message: "Đã lưu và đồng bộ thành công lên máy chủ đám mây!",
      };
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.error("Firestore sync error:", errorMsg);
      return {
        success: true,
        syncedOnline: false,
        message: "Đã lưu vào bộ nhớ cục bộ thiết bị. (Đồng bộ đám mây sẽ cập nhật khi có kết nối)",
      };
    }
  }

  return {
    success: true,
    syncedOnline: false,
    message: "Đã lưu vào bộ nhớ cục bộ thiết bị.",
  };
}
