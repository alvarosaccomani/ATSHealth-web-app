/**
 * @description Credenciales de autenticación para login local.
 */
export interface LoginCredentials {
  usr_user: string;
  usr_password: string;
  gettoken?: boolean;
}

/**
 * @description Representa el perfil del usuario autenticado.
 */
export interface AuthUser {
  usr_uuid: string;
  usr_name: string;
  usr_surname: string;
  usr_email: string;
  usr_nick: string;
  usr_image?: string | null;
  usr_bio?: string | null;
  usr_socket?: string | null;
  usr_online?: boolean;
  usr_createdat?: Date | string;
  usr_updatedat?: Date | string;
}

/**
 * @description Respuesta de datos tras iniciar sesión con éxito.
 */
export interface AuthData {
  token?: string;
  user?: AuthUser;
}

/**
 * @description Estructura de la entidad Auth para el sistema.
 */
export interface AuthInterface {
  token: string | null;
  user: AuthUser | null;
}
