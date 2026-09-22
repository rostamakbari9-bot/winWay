import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { getFirebaseStorage } from './config';

export interface UploadProgressCallback {
  (progressPercent: number): void;
}

/**
 * Uploads a chart image to Firebase Storage under:
 * users/{userId}/trades/{tradeId}/chart/{filename}
 * or
 * users/{userId}/missedTrades/{missedTradeId}/chart/{filename}
 */
export async function uploadTradeChartImage(
  userId: string,
  tradeId: string,
  file: File,
  isMissedTrade = false,
  onProgress?: UploadProgressCallback
): Promise<{ downloadUrl: string; storagePath: string }> {
  const storage = getFirebaseStorage();
  
  // Clean filename and add timestamp to avoid caching issues
  const extension = file.name.split('.').pop() || 'png';
  const cleanFileName = `chart_${Date.now()}.${extension}`;
  const folder = isMissedTrade ? 'missedTrades' : 'trades';
  const storagePath = `users/${userId}/${folder}/${tradeId}/chart/${cleanFileName}`;
  
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type || 'image/png',
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0 && onProgress) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Storage upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ downloadUrl, storagePath });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Deletes a previously uploaded chart from Firebase Storage
 */
export async function deleteTradeChartImage(storagePath: string): Promise<void> {
  if (!storagePath) return;
  try {
    const storage = getFirebaseStorage();
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn('Could not delete storage object (may not exist):', err);
  }
}
