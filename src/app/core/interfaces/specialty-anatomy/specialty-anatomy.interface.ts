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
  defaultColor?: string; // Override cromático específico de esta estructura
}

/**
 * @description Definición de capa anatómica para filtrado y coloreado por planos/sistemas.
 */
export interface SpecialtyLayer {
  id: string;
  label: string;
  defaultVisible: boolean;
  baseColor?: string; // Color base heredado por todas las estructuras de este plano
}

/**
 * @description Paleta clínica opcional por tipos anatómicos mayores.
 */
export interface SpecialtyPaletteConfig {
  bone?: string;
  muscle?: string;
  ligament?: string;
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
  palette?: SpecialtyPaletteConfig;
}

/**
 * @description Evento emitido al seleccionar una estructura anatómica en el visor 3D.
 */
export interface SelectedStructureEvent {
  meshId: string;
  label: string;
  originalColor: number;
  evalType?: 'OXFORD' | 'EVA' | 'PERFECT' | 'RANGE_OF_MOTION';
  layerId?: string;
}
