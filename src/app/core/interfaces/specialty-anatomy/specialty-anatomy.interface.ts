/**
 * @description Configuración de cámara para el encuadre anatómico de la especialidad.
 */
export interface SpecialtyCameraConfig {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov?: number;
}

/**
 * @description Mapeo de estructura anatómica para interacción clínica y evaluación.
 */
export interface SpecialtyStructure {
  meshId: string;
  label: string;
  layerId: string;
  evalType?: 'OXFORD' | 'EVA' | 'PERFECT' | 'RANGE_OF_MOTION';
}

/**
 * @description Definición de capa anatómica para filtrado por planos/sistemas.
 */
export interface SpecialtyLayer {
  id: string;
  label: string;
  defaultVisible: boolean;
}

/**
 * @description Contrato principal de configuración de anatomía 3D por especialidad médica.
 */
export interface SpecialtyAnatomyConfig {
  specialtyCode: string;
  modelUrl: string;
  camera: SpecialtyCameraConfig;
  visibleMeshTokens: string[];
  structures: SpecialtyStructure[];
  layers?: SpecialtyLayer[];
}
