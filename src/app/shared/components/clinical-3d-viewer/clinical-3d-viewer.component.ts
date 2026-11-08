import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  SelectedStructureEvent,
  SpecialtyAnatomyConfig,
  SpecialtyLayer,
  SpecialtyStructure,
} from '@interfaces/specialty-anatomy';
import { Clinical3dFilterService } from '@services/clinical-3d-filter.service';

@Component({
  selector: 'app-clinical-3d-viewer',
  imports: [],
  templateUrl: './clinical-3d-viewer.component.html',
  styleUrl: './clinical-3d-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Clinical3dViewerComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild('canvasContainer', { static: true })
  private readonly containerRef!: ElementRef<HTMLDivElement>;

  @Input({ required: true }) config!: SpecialtyAnatomyConfig;
  @Input() highlightedMeshIds: Record<string, string> = {};

  @Output() structureClicked = new EventEmitter<SelectedStructureEvent>();

  // UI state
  protected isLoading = true;
  protected loadError: string | null = null;
  protected hoveredStructure: SpecialtyStructure | null = null;
  protected tooltipPos = { x: 0, y: 0 };
  protected activeLayers: SpecialtyLayer[] = [];

  // Three.js core members
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private currentBoundingBox: THREE.Box3 | null = null;

  // Interaction members
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly meshMap = new Map<string, THREE.Mesh>();
  private readonly originalColors = new Map<string, number>();
  private readonly structureByMeshId = new Map<string, SpecialtyStructure>();
  private isPointerDown = false;
  private pointerDownPos = { x: 0, y: 0 };

  constructor(
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
    private readonly filterService: Clinical3dFilterService,
  ) {}

  public ngAfterViewInit(): void {
    this.initThree();
    this.initLayers();
    this.loadModel();
    this.setupResizeObserver();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange) {
      this.initLayers();
      this.loadModel();
    }

    if (
      changes['highlightedMeshIds'] &&
      !changes['highlightedMeshIds'].firstChange
    ) {
      this.applyHighlights();
    }
  }

  public ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * @description Restablece la cámara y encuadre dinámico de la especialidad.
   */
  public resetCamera(): void {
    if (!this.camera || !this.controls) {
      return;
    }

    if (this.currentBoundingBox) {
      this.applyDynamicFraming(this.currentBoundingBox);
    } else {
      const pos = this.config.camera?.position ?? { x: 0, y: 1.5, z: 3.5 };
      const target = this.config.camera?.target ?? { x: 0, y: 0, z: 0 };
      this.camera.position.set(pos.x, pos.y, pos.z);
      this.controls.target.set(target.x, target.y, target.z);
      this.controls.update();
    }
  }

  /**
   * @description Alterna la visibilidad de una capa anatómica específica.
   */
  public toggleLayer(layer: SpecialtyLayer): void {
    layer.defaultVisible = !layer.defaultVisible;

    this.filterService.setLayerVisibility(
      layer.id,
      layer.defaultVisible,
      this.config.structures,
      this.meshMap,
    );
  }

  private initThree(): void {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    const fov = this.config.camera?.fov ?? 45;
    this.camera = new THREE.PerspectiveCamera(fov, width / height, 0.05, 500);

    const pos = this.config.camera?.position ?? { x: 0, y: 1.5, z: 3.5 };
    this.camera.position.set(pos.x, pos.y, pos.z);

    // WebGL Renderer optimizado
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x0f172a, 1);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    container.appendChild(this.renderer.domElement);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 25;
    this.controls.minDistance = 0.1;

    const target = this.config.camera?.target ?? { x: 0, y: 0, z: 0 };
    this.controls.target.set(target.x, target.y, target.z);
    this.controls.update();

    // Luces clínicas para inspección anatómica
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 8, 7.5);
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.7);
    fillLight.position.set(-5, -4, -5);
    this.scene.add(fillLight);

    // Listeners de interacción
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointerleave', this.onPointerLeave);

    // Render loop fuera de Angular zone (60 FPS estables)
    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  private initLayers(): void {
    if (this.config.layers && this.config.layers.length > 0) {
      this.activeLayers = this.config.layers.map((layer) => ({ ...layer }));
    } else {
      this.activeLayers = [];
    }
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private loadModel(): void {
    this.isLoading = true;
    this.loadError = null;
    this.meshMap.clear();
    this.originalColors.clear();
    this.structureByMeshId.clear();

    if (this.config.structures) {
      for (const structure of this.config.structures) {
        this.structureByMeshId.set(structure.meshId, structure);
        const sanitizedKey = structure.meshId.replace(/[\s\.]/g, '_');
        this.structureByMeshId.set(sanitizedKey, structure);
      }
    }

    const loader = new GLTFLoader();
    loader.load(
      this.config.modelUrl,
      (gltf) => {
        const root = gltf.scene;

        // 1. Filtrado selectivo por especialidad (Mesh Whitelisting)
        const filterResult = this.filterService.filterModelBySpecialty(
          root,
          this.config,
        );

        // 2. Centrado automático basado estrictamente en el bounding box de las mallas visibles
        const center = new THREE.Vector3();
        filterResult.boundingBox.getCenter(center);
        root.position.sub(center);

        this.scene.add(root);
        root.visible = true;
        this.scene.updateMatrixWorld(true);

        // 3. Re-cálculo de bounding box tras el centrado en la escena
        const centeredBox = new THREE.Box3();
        for (const mesh of filterResult.whitelistedMeshes.values()) {
          centeredBox.expandByObject(mesh);
        }
        this.currentBoundingBox = centeredBox;

        // 4. Registrar mallas y asignar sombreado anatómico base con DoubleSide
        for (const [
          meshName,
          mesh,
        ] of filterResult.whitelistedMeshes.entries()) {
          const lowerName = meshName.toLowerCase();
          const isMuscle =
            /muscle|pubococc|iliococc|levator|obturator|coccyg|piriformis/i.test(
              lowerName,
            );
          const isBone = /bone|ilium|pubis|ischium|sacrum/i.test(lowerName);
          const isLigament = /fascia|ligament|arch|tendin/i.test(lowerName);

          if (mesh.material) {
            const mat = (
              Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
            ) as THREE.MeshStandardMaterial;

            mat.side = THREE.DoubleSide;

            // Asignar color base anatómico si viene sin textura o monocromático en el archivo
            const currentColor = mat.color ? mat.color.getHex() : 0xffffff;
            if (currentColor === 0xffffff || currentColor === 0x000000) {
              if (isMuscle) {
                mat.color.setHex(0xb85050); // Músculo clínico
                mat.roughness = 0.45;
              } else if (isBone) {
                mat.color.setHex(0xe3dccb); // Hueso marfil clínico
                mat.roughness = 0.55;
              } else if (isLigament) {
                mat.color.setHex(0xa0aec0); // Fascia / ligamento
                mat.roughness = 0.35;
              }
            }

            if (mat.color) {
              this.originalColors.set(meshName, mat.color.getHex());
            }
          }
          this.meshMap.set(meshName, mesh);
        }

        // 5. Aplicar Framing Dinámico para centrar la cámara sobre la región de interés
        this.applyDynamicFraming(centeredBox);
        this.applyHighlights();

        console.info(
          `[Clinical3D] Modelo cargado con éxito. Mallas visibles: ${filterResult.whitelistedMeshes.size}. Centroide:`,
          centeredBox.getCenter(new THREE.Vector3()),
        );

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      undefined,
      (error) => {
        console.warn(
          '[Clinical3dViewer] Error al cargar modelo GLTF, activando fallback procedimental:',
          error,
        );
        this.loadFallbackProceduralScene();
      },
    );
  }

  private applyDynamicFraming(box: THREE.Box3): void {
    const framing = this.filterService.calculateDynamicFraming(
      box,
      this.camera,
      this.config.camera?.target,
      this.config.camera?.position,
    );

    this.camera.position.copy(framing.cameraPosition);
    this.controls.target.copy(framing.target);

    if (this.config.camera?.fov) {
      this.camera.fov = this.config.camera.fov;
      this.camera.updateProjectionMatrix();
    }

    this.controls.update();
  }

  private loadFallbackProceduralScene(): void {
    const group = new THREE.Group();
    const count = Math.max(this.config.structures?.length || 0, 1);
    const radius = 1.2;

    (this.config.structures || []).forEach((structure, index) => {
      const angle = (index / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * (radius * 0.7);
      const y =
        structure.layerId === 'deep'
          ? -0.2
          : structure.layerId === 'intermediate'
            ? 0
            : 0.2;

      const geometry = new THREE.TorusGeometry(0.35, 0.12, 16, 32);
      const baseColor =
        structure.layerId === 'deep'
          ? 0xef4444
          : structure.layerId === 'intermediate'
            ? 0xf59e0b
            : 0x3b82f6;

      const material = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.35,
        metalness: 0.1,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = structure.meshId;
      mesh.position.set(x, y, z);
      mesh.rotation.x = Math.PI / 2;

      this.meshMap.set(structure.meshId, mesh);
      this.originalColors.set(structure.meshId, baseColor);
      group.add(mesh);
    });

    const box = new THREE.Box3().setFromObject(group);
    this.currentBoundingBox = box;
    this.applyDynamicFraming(box);

    this.scene.add(group);
    this.applyHighlights();
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private applyHighlights(): void {
    const normalizedHighlights = new Map<string, string>();
    for (const [key, color] of Object.entries(this.highlightedMeshIds || {})) {
      normalizedHighlights.set(key.toLowerCase(), color);
      normalizedHighlights.set(
        key.toLowerCase().replace(/[\s\.]/g, '_'),
        color,
      );
      normalizedHighlights.set(key.toLowerCase().replace(/_/g, ' '), color);
    }

    for (const [meshId, mesh] of this.meshMap.entries()) {
      const material = mesh.material;
      if (!material) {
        continue;
      }

      const mat = (
        Array.isArray(material) ? material[0] : material
      ) as THREE.MeshStandardMaterial;
      if (!mat.color) {
        continue;
      }

      const rawId = meshId.toLowerCase();
      const normId = rawId.replace(/[\s\.]/g, '_');
      const spaceId = rawId.replace(/_/g, ' ');

      const highlightHex =
        normalizedHighlights.get(rawId) ||
        normalizedHighlights.get(normId) ||
        normalizedHighlights.get(spaceId);

      if (highlightHex) {
        mat.color.set(highlightHex);
      } else {
        const original = this.originalColors.get(meshId);
        if (original !== undefined) {
          mat.color.setHex(original);
        }
      }
    }
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    this.isPointerDown = true;
    this.pointerDownPos = { x: event.clientX, y: event.clientY };
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    // Raycasting optimizado: colisiones estrictamente sobre mallas visibles filtradas
    const meshes = Array.from(this.meshMap.values()).filter((m) => m.visible);
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const intersectedMesh = intersects[0].object as THREE.Mesh;
      const structure = this.structureByMeshId.get(intersectedMesh.name);

      if (structure) {
        this.renderer.domElement.style.cursor = 'pointer';
        this.hoveredStructure = structure;
        this.tooltipPos = {
          x: event.clientX - rect.left + 16,
          y: event.clientY - rect.top + 16,
        };
        this.cdr.markForCheck();
        return;
      }
    }

    if (this.hoveredStructure) {
      this.renderer.domElement.style.cursor = 'default';
      this.hoveredStructure = null;
      this.cdr.markForCheck();
    }
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (!this.isPointerDown) {
      return;
    }
    this.isPointerDown = false;

    // Evitar disparo de click durante giros o paneos de cámara
    const deltaX = Math.abs(event.clientX - this.pointerDownPos.x);
    const deltaY = Math.abs(event.clientY - this.pointerDownPos.y);
    if (deltaX > 4 || deltaY > 4) {
      return;
    }

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = Array.from(this.meshMap.values()).filter((m) => m.visible);
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object as THREE.Mesh;
      const structure = this.structureByMeshId.get(clickedMesh.name);

      if (structure) {
        const originalColor =
          this.originalColors.get(structure.meshId) ?? 0xffffff;

        this.ngZone.run(() => {
          this.structureClicked.emit({
            meshId: structure.meshId,
            label: structure.label,
            originalColor,
            evalType: structure.evalType,
            layerId: structure.layerId,
          });
        });
      }
    }
  };

  private readonly onPointerLeave = (): void => {
    if (this.hoveredStructure) {
      this.renderer.domElement.style.cursor = 'default';
      this.hoveredStructure = null;
      this.cdr.markForCheck();
    }
  };

  private setupResizeObserver(): void {
    const container = this.containerRef.nativeElement;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && this.renderer && this.camera) {
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(width, height);
        }
      }
    });

    this.resizeObserver.observe(container);
  }

  private cleanup(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    const canvas = this.renderer?.domElement;
    if (canvas) {
      canvas.removeEventListener('pointerdown', this.onPointerDown);
      canvas.removeEventListener('pointermove', this.onPointerMove);
      canvas.removeEventListener('pointerup', this.onPointerUp);
      canvas.removeEventListener('pointerleave', this.onPointerLeave);
      canvas.remove();
    }

    if (this.controls) {
      this.controls.dispose();
    }

    if (this.scene) {
      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    this.meshMap.clear();
    this.originalColors.clear();
    this.structureByMeshId.clear();
    this.currentBoundingBox = null;
  }
}
