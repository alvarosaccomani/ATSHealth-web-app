import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * @description Interceptor funcional que inyecta automáticamente la cabecera Authorization Bearer
 * EXCLUSIVAMENTE en peticiones dirigidas a la API propia (environment.apiUrl).
 * Se omite deliberadamente en peticiones hacia Cloudflare R2 / S3 (ej. URLs prefirmadas)
 * para evitar conflictos con la firma criptográfica de AWS Signature v4.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  const isApiUrl = req.url.startsWith(environment.apiUrl);

  if (token && isApiUrl && !req.headers.has('Authorization')) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedReq);
  }

  return next(req);
};
