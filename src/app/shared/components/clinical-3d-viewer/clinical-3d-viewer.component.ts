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
  AnatomyConfig,
  AnatomyLayer,
  AnatomyStructure,
  SelectedStructureEvent,
} from '@interfaces/clinical-model';

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

  @Input({ required: true }) config!: AnatomyConfig;
  @Input() highlightedMeshIds: Record<string, string> = {};

  @Output() structureClicked = new EventEmitter<SelectedStructureEvent>();

  // UI state
  protected isLoading = true;
  protected loadError: string | null = null;
  protected hoveredStructure: AnatomyStructure | null = null;
  protected tooltipPos = { x: 0, y: 0 };
  protected activeLayers: AnatomyLayer[] = [];

  // Three.js core members
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // Interaction members
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly meshMap = new Map<string, THREE.Mesh>();
  private readonly originalColors = new Map<string, number>();
  private readonly structureByMeshId = new Map<string, AnatomyStructure>();
  private isPointerDown = false;
  private pointerDownPos = { x: 0, y: 0 };

  constructor(
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef,
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

    if (changes['highlightedMeshIds'] && !changes['highlightedMeshIds'].firstChange) {
      this.applyHighlights();
    }
  }

  public ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * @description Reset camera to initial position defined by configuration.
   */
  public resetCamera(): void {
    if (!this.camera || !this.controls) {
      return;
    }

    const pos = this.config.cameraPosition ?? { x: 0, y: 1.5, z: 3.5 };
    this.camera.position.set(pos.x, pos.y, pos.z);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  /**
   * @description Toggle visibility for an anatomical layer.
   */
  public toggleLayer(layer: AnatomyLayer): void {
    layer.visible = !layer.visible;

    for (const structure of this.config.structures) {
      if (structure.layer === layer.id) {
        const mesh = this.meshMap.get(structure.meshId);
        if (mesh) {
          mesh.visible = layer.visible;
        }
      }
    }
  }

  private initThree(): void {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const pos = this.config.cameraPosition ?? { x: 0, y: 1.5, z: 3.5 };
    this.camera.position.set(pos.x, pos.y, pos.z);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    container.appendChild(this.renderer.domElement);

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 15;
    this.controls.minDistance = 0.5;
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    // Illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    directionalLight1.position.set(5, 10, 7.5);
    this.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-5, -5, -5);
    this.scene.add(directionalLight2);

    // Event listeners
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointerleave', this.onPointerLeave);

    // Start 60fps render loop outside Angular zone
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

    for (const structure of this.config.structures) {
      this.structureByMeshId.set(structure.meshId, structure);
    }

    const loader = new GLTFLoader();
    loader.load(
      this.config.modelUrl,
      (gltf) => {
        const root = gltf.scene;

        // Center and normalize model
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        root.position.sub(center);

        // Catalog meshes and cache baseline materials
        root.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            const mesh = node;
            const meshName = mesh.name;

            // Clone material to allow independent structure coloring
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material = mesh.material.map((m) => m.clone());
              } else {
                mesh.material = mesh.material.clone();
                const mat = mesh.material as THREE.MeshStandardMaterial;
                if (mat.color) {
                  this.originalColors.set(meshName, mat.color.getHex());
                }
              }
            }

            this.meshMap.set(meshName, mesh);
          }
        });

        this.scene.add(root);
        this.applyHighlights();

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      undefined,
      (error) => {
        this.isLoading = false;
        this.loadError =
          error instanceof Error
            ? error.message
            : 'Error al cargar el modelo 3D.';
        this.cdr.markForCheck();
      },
    );
  }

  private applyHighlights(): void {
    for (const [meshId, mesh] of this.meshMap.entries()) {
      const material = mesh.material;
      if (!material || Array.isArray(material)) {
        continue;
      }

      const standardMat = material as THREE.MeshStandardMaterial;
      if (!standardMat.color) {
        continue;
      }

      const highlightHex = this.highlightedMeshIds[meshId];
      if (highlightHex) {
        standardMat.color.set(highlightHex);
      } else {
        const original = this.originalColors.get(meshId);
        if (original !== undefined) {
          standardMat.color.setHex(original);
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

    // Avoid triggering click during camera rotation / drag
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

    // Traverse and dispose all scene geometries and materials
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
  }
}
