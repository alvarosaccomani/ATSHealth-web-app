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
   * Resuelve la visibilidad jerárquica desacoplando materiales compartidos:
   * 1. Detecta mallas autorizadas por token.
   * 2. Clona e independiza los materiales de las mallas autorizadas para evitar mutaciones de puntero compartidas.
   * 3. Mantiene visibles los ancestros del subárbol asignándoles un material mudo para no dibujar carteles/textos del grupo.
   * 4. Oculta todo subárbol o malla ajena.
   */
  public filterModelBySpecialty(
    root: THREE.Object3D,
    config: SpecialtyAnatomyConfig,
  ): FilterResult {
    const whitelistedMeshes = new Map<string, THREE.Mesh>();
    const interactiveMeshes: THREE.Mesh[] = [];
    const whitelistedSet = new Set<THREE.Mesh>();

    const normalizedTokens = (config.visibleMeshTokens || []).map((t) =>
      t.trim().toLowerCase().replace(/_/g, ' '),
    );

    // 1. Identificar mallas que coinciden con los tokens permitidos
    root.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const rawName = (mesh.name || '').toLowerCase();
        const normName = rawName.replace(/_/g, ' ');

        const isWhitelisted =
          normalizedTokens.length === 0 ||
          normalizedTokens.some(
            (token) =>
              rawName === token ||
              rawName.includes(token) ||
              normName.includes(token),
          );

        if (isWhitelisted) {
          whitelistedSet.add(mesh);
          whitelistedMeshes.set(mesh.name, mesh);
          interactiveMeshes.push(mesh);
        }
      }
    });

    // 2. Independizar (clonar) materiales de mallas whitelisted PRIMERO para desacoplar punteros compartidos con ancestros
    for (const mesh of whitelistedSet) {
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => m.clone());
        } else {
          mesh.material = mesh.material.clone();
        }
      }
    }

    // 3. Coleccionar ancestros necesarios para no romper la visibilidad del subárbol
    const ancestorNodes = new Set<THREE.Object3D>();
    for (const mesh of whitelistedSet) {
      let curr = mesh.parent;
      while (curr) {
        ancestorNodes.add(curr);
        curr = curr.parent;
      }
    }

    // 4. Aplicar visibilidad en todo el grafo asegurando que root y ancestros permanezcan visibles
    root.visible = true;
    root.traverse((child) => {
      if (child === root) {
        child.visible = true;
        return;
      }

      if (whitelistedSet.has(child as THREE.Mesh)) {
        child.visible = true;
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => (m.visible = true));
          } else {
            mesh.material.visible = true;
          }
        }
      } else if (ancestorNodes.has(child)) {
        // El contenedor intermedio debe ser visible para que sus hijos se dibujen
        child.visible = true;
        // Si el contenedor intermedio es una malla con geometría propia (ej: textos/billboard de grupo),
        // le asignamos un material mudo aislado para silenciar su dibujo sin afectar a los hijos
        if ((child as THREE.Mesh).isMesh) {
          const ancestorMesh = child as THREE.Mesh;
          ancestorMesh.material = new THREE.MeshBasicMaterial({
            visible: false,
          });
        }
      } else {
        child.visible = false;
      }
    });

    // 5. Actualizar matrices mundiales y computar BoundingBox de mallas visibles
    root.updateMatrixWorld(true);
    const boundingBox = new THREE.Box3();
    let hasVisibleMesh = false;

    for (const mesh of whitelistedSet) {
      boundingBox.expandByObject(mesh);
      hasVisibleMesh = true;
    }

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
      cameraPosition = new THREE.Vector3(
        target.x,
        target.y + maxDim * 0.2,
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
    const structuresInLayer = (structures || []).filter(
      (s) => s.layerId === layerId,
    );

    for (const structure of structuresInLayer) {
      const mesh = meshMap.get(structure.meshId);
      if (mesh) {
        mesh.visible = visible;
      }
    }
  }
}
