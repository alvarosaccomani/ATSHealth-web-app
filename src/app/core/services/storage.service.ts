import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  PresignedUploadRequest,
  PresignedUploadResponse,
  PresignedUploadData,
  PresignedDownloadResponse,
  StorageBucketType,
  StorageDeleteResponse,
} from '@interfaces/storage';

/**
 * @description Servicio para gestión de almacenamiento directo hacia Cloudflare R2 (Object Storage).
 * Maneja URLs prefirmadas directas (PUT/GET), compresión cliente a WebP (0.85),
 * subida directa con progreso y caché en memoria para previsualizaciones.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /** Caché en memoria para URLs prefirmadas de descarga/lectura */
  private readonly downloadUrlCache = new Map<string, { url: string; expiresAt: number }>();

  /**
   * Solicita a la API una URL prefirmada para subida directa (HTTP PUT) a Cloudflare R2.
   */
  public getPresignedUploadUrl(request: PresignedUploadRequest): Observable<PresignedUploadResponse> {
    const url = `${this.baseUrl}storage/presigned-upload`;
    return this.http.post<PresignedUploadResponse>(url, request);
  }

  /**
   * Solicita a la API una URL temporal prefirmada para descargar o previsualizar un archivo privado.
   * Utiliza caché en memoria para evitar peticiones redundantes si la URL sigue vigente.
   */
  public getPresignedDownloadUrl(key: string, expiresInSeconds: number = 300): Observable<PresignedDownloadResponse> {
    const cached = this.downloadUrlCache.get(key);
    const now = Date.now();

    // Reutilizar URL en caché si restan más de 30 segundos de vigencia
    if (cached && cached.expiresAt - now > 30000) {
      return of({
        success: true,
        message: 'URL obtenida desde caché en memoria',
        data: {
          downloadUrl: cached.url,
          expiresIn: Math.round((cached.expiresAt - now) / 1000),
        },
      });
    }

    const url = `${this.baseUrl}storage/presigned-download`;
    return this.http.post<PresignedDownloadResponse>(url, { key, expiresInSeconds }).pipe(
      tap((response) => {
        if (response.success && response.data?.downloadUrl) {
          const ttlMs = (response.data.expiresIn || expiresInSeconds) * 1000;
          this.downloadUrlCache.set(key, {
            url: response.data.downloadUrl,
            expiresAt: Date.now() + ttlMs,
          });
        }
      })
    );
  }

  /**
   * Elimina un archivo en Cloudflare R2 mediante la API e invalida la caché local.
   */
  public deleteFile(key: string, bucketType: StorageBucketType = 'private'): Observable<StorageDeleteResponse> {
    this.downloadUrlCache.delete(key);
    const url = `${this.baseUrl}storage/delete`;
    return this.http.post<StorageDeleteResponse>(url, { key, bucketType });
  }

  /**
   * Sube un binario (Blob o File) directamente a Cloudflare R2 mediante HTTP PUT
   * reportando progreso porcentual reactivo (0 a 100%).
   */
  public uploadToR2WithProgress(uploadUrl: string, file: Blob | File, contentType: string): Observable<number> {
    const headers = new HttpHeaders({
      'Content-Type': contentType,
    });

    const req = new HttpRequest('PUT', uploadUrl, file, {
      headers,
      reportProgress: true,
    });

    return this.http.request(req).pipe(
      map((event: HttpEvent<unknown>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          return Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          return 100;
        }
        return 0;
      })
    );
  }

  /**
   * Sube un binario directamente a Cloudflare R2 mediante HTTP PUT sin notificación intermedia de progreso.
   */
  public uploadDirect(uploadUrl: string, file: Blob | File, contentType: string): Observable<void> {
    const headers = new HttpHeaders({
      'Content-Type': contentType,
    });
    return this.http.put<void>(uploadUrl, file, { headers });
  }

  /**
   * Convierte imágenes a formato WebP al 85% de calidad mediante HTML5 Canvas.
   * Si el archivo es un documento (PDF, DOCX, XLSX, etc.), preserva su formato y contenido intacto.
   */
  public async convertImageToWebp(
    file: File | Blob,
    filename: string,
    quality: number = 0.85
  ): Promise<{ blob: Blob; contentType: string; filename: string }> {
    const type = file.type.toLowerCase();
    const isImage = type.startsWith('image/') && !type.includes('svg');

    // Los documentos (PDF, Word, Excel, etc.) se preservan en su formato nativo
    if (!isImage) {
      return {
        blob: file,
        contentType: file.type || 'application/octet-stream',
        filename,
      };
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('No se pudo inicializar el contexto 2D de Canvas.'));
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Fallo la compresión a WebP mediante Canvas.'));
            }
            const cleanName = filename.replace(/\.[^/.]+$/, '');
            const webpFilename = `${cleanName}.webp`;

            resolve({
              blob,
              contentType: 'image/webp',
              filename: webpFilename,
            });
          },
          'image/webp',
          quality
        );
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      };

      img.src = objectUrl;
    });
  }

  /**
   * Convierte directamente un elemento HTMLCanvasElement (ej. firma, recorte o captura WebRTC)
   * a un Blob binario nativo en formato WebP con calidad 0.85.
   */
  public canvasToWebpBlob(canvas: HTMLCanvasElement, quality: number = 0.85): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('No fue posible exportar el Canvas a WebP.'));
          }
        },
        'image/webp',
        quality
      );
    });
  }

  /**
   * Convierte una cadena DataURL / Base64 a un objeto binario Blob.
   */
  public dataUrlToBlob(dataUrl: string): { blob: Blob; contentType: string } {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const contentType = mimeMatch ? mimeMatch[1] : 'image/webp';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return {
      blob: new Blob([u8arr], { type: contentType }),
      contentType,
    };
  }

  /**
   * Flujo integral de subida:
   * 1. Procesa imagen a WebP (0.85) o mantiene documento original.
   * 2. Solicita la URL prefirmada a la API.
   * 3. Sube el binario directamente a Cloudflare R2 vía HTTP PUT.
   * 4. Retorna la clave del objeto y metadatos resultantes.
   */
  public uploadFile(
    file: File | Blob,
    originalFilename: string,
    options?: {
      usr_uuid?: string;
      bucketType?: StorageBucketType;
      folder?: string;
      quality?: number;
    }
  ): Observable<PresignedUploadData> {
    const bucketType = options?.bucketType || 'private';
    const folder = options?.folder || 'attachments';
    const quality = options?.quality ?? 0.85;

    return from(this.convertImageToWebp(file, originalFilename, quality)).pipe(
      switchMap(({ blob, contentType, filename }) =>
        this.getPresignedUploadUrl({
          usr_uuid: options?.usr_uuid,
          filename,
          contentType,
          bucketType,
          folder,
        }).pipe(
          switchMap((response) => {
            const presignedData = response.data;
            return this.uploadDirect(presignedData.uploadUrl, blob, contentType).pipe(
              map(() => presignedData)
            );
          })
        )
      )
    );
  }
}
