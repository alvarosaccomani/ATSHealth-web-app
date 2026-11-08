import { Injectable } from '@angular/core';
import * as THREE from 'three';
import {
  SpecialtyAnatomyConfig,
  SpecialtyStructure,
} from '@interfaces/specialty-anatomy';

export interface FilterResult {
  whitelistedMeshes: Map<string, THREE.Mesh>;
  interactiveMeshes: THREE.Mesh[];
  boundingBox: THREE.Box3;
}

export interface DynamicFramingResult {
  center: THREE.Vector3;
  cameraPosition: THREE.Vector3;
  target: THREE.Vector3;
  optimalDistance: number;
  boundingBox: THREE.Box3;
}

@Injectable({
  providedIn: 'root',
})
export class Clinical3dFilterService {
  /**
   * @description Filtra un modelo 3D (GLTF Object3D) según la lista de tokens de la especialidad.
   * Oculta las mallas no autorizadas y optimiza el árbol para raycasting e interacción.
   */
  public filterModelBySpecialty(
    root: THREE.Object3D,
    config: SpecialtyAnatomyConfig,
  ): FilterResult {
    const whitelistedMeshes = new Map<string, THREE.Mesh>();
    const interactiveMeshes: THREE.Mesh[] = [];
    const boundingBox = new THREE.Box3();
    let hasVisibleMesh = false;

    const normalizedTokens = (config.visibleMeshTokens || []).map((t) =>
      t.trim().toLowerCase(),
    );

    root.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const meshName = (mesh.name || '').toLowerCase();

        const isWhitelisted =
          normalizedTokens.length === 0 ||
          normalizedTokens.some(
            (token) => meshName === token || meshName.includes(token),
          );

        if (isWhitelisted) {
          mesh.visible = true;
          whitelistedMeshes.set(mesh.name, mesh);
          interactiveMeshes.push(mesh);
          boundingBox.expandByObject(mesh);
          hasVisibleMesh = true;
        } else {
          mesh.visible = false;
        }
      }
    });

    // Si no hubo mallas visibles encontradas por token, fallback a bounding box del root
    if (!hasVisibleMesh) {
      boundingBox.setFromObject(root);
    }

    return {
      whitelistedMeshes,
      interactiveMeshes,
      boundingBox,
    };
  }

  /**
   * @description Calcula el encuadre óptimo (Framing Dinámico) enfocado únicamente
   * en las mallas anatómicas visibles de la especialidad.
   */
  public calculateDynamicFraming(
    boundingBox: THREE.Box3,
    camera: THREE.PerspectiveCamera,
    configuredTarget?: { x: number; y: number; z: number },
    configuredPosition?: { x: number; y: number; z: number },
  ): DynamicFramingResult {
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();

    boundingBox.getCenter(center);
    boundingBox.getSize(size);

    const target = configuredTarget
      ? new THREE.Vector3(
          configuredTarget.x,
          configuredTarget.y,
          configuredTarget.z,
        )
      : center.clone();

    const maxDim = Math.max(size.x, size.y, size.z, 0.1);
    const fovInRad = (camera.fov * Math.PI) / 180;
    const optimalDistance = Math.abs(maxDim / 2 / Math.tan(fovInRad / 2)) * 1.5;

    let cameraPosition: THREE.Vector3;
    if (configuredPosition) {
      cameraPosition = new THREE.Vector3(
        configuredPosition.x,
        configuredPosition.y,
        configuredPosition.z,
      );
    } else {
      // Posición relativa al centro hacia el eje Z con ligera elevación Y
      cameraPosition = new THREE.Vector3(
        target.x,
        target.y + maxDim * 0.35,
        target.z + optimalDistance,
      );
    }

    return {
      center,
      cameraPosition,
      target,
      optimalDistance,
      boundingBox,
    };
  }

  /**
   * @description Alterna la visibilidad de las estructuras asignadas a una capa específica.
   */
  public setLayerVisibility(
    layerId: string,
    visible: boolean,
    structures: SpecialtyStructure[],
    meshMap: Map<string, THREE.Mesh>,
  ): void {
    const structuresInLayer = structures.filter((s) => s.layerId === layerId);

    for (const structure of structuresInLayer) {
      const mesh = meshMap.get(structure.meshId);
      if (mesh) {
        mesh.visible = visible;
      }
    }
  }
}
