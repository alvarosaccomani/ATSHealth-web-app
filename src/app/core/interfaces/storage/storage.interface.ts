export type StorageBucketType = 'public' | 'private';

export interface PresignedUploadRequest {
  usr_uuid?: string;
  filename: string;
  contentType: string;
  bucketType?: StorageBucketType;
  folder?: string;
  expiresInSeconds?: number;
}

export interface PresignedUploadData {
  uploadUrl: string;
  key: string;
  bucket: string;
  bucketType: StorageBucketType;
  publicUrl: string | null;
  expiresIn: number;
}

export interface PresignedUploadResponse {
  success: boolean;
  message: string;
  data: PresignedUploadData;
}

export interface PresignedDownloadResponse {
  success: boolean;
  message: string;
  data: {
    downloadUrl: string;
    expiresIn: number;
  };
}

export interface StorageDeleteRequest {
  key: string;
  bucketType?: StorageBucketType;
}

export interface StorageDeleteResponse {
  success: boolean;
  message: string;
}

export interface UploadProgress {
  progress: number;
  completed: boolean;
  key?: string;
  publicUrl?: string | null;
}
