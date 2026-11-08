/**
 * @description Structure mapping definition for 3D meshes in an anatomical model.
 */
export interface AnatomyStructure {
  meshId: string;
  label: string;
  layer: string;
  evalType?: string;
}

/**
 * @description Layer definition for anatomical visibility grouping.
 */
export interface AnatomyLayer {
  id: string;
  label: string;
  visible: boolean;
}

/**
 * @description Coordinates for initial 3D camera positioning.
 */
export interface AnatomyCameraPosition {
  x: number;
  y: number;
  z: number;
}

/**
 * @description Agnostic configuration contract for anatomical 3D models.
 */
export interface AnatomyConfig {
  specialtyCode: string;
  modelUrl: string;
  cameraPosition?: AnatomyCameraPosition;
  structures: AnatomyStructure[];
  layers?: AnatomyLayer[];
}

/**
 * @description Event payload emitted when a 3D anatomical structure is clicked.
 */
export interface SelectedStructureEvent {
  meshId: string;
  label: string;
  originalColor: number;
}

/**
 * @description Individual anatomical structure clinical highlight/evaluation.
 */
export interface Clinical3dFindingHighlight {
  meshId: string;
  score?: number;
  evaPain?: number;
  condition?: string;
  color: string;
  notes?: string;
}

/**
 * @description Persistence format for clinical findings in encounters (encd_FormData JSONB).
 */
export interface Clinical3dFindings {
  specialtyCode: string;
  modelVersion: string;
  highlights: Clinical3dFindingHighlight[];
}

/**
 * @description Primary domain model interface for clinical 3D models.
 */
export interface ClinicalModelInterface {
  id?: string;
  specialtyCode: string;
  modelVersion: string;
  config: AnatomyConfig;
  findings?: Clinical3dFindings;
}
