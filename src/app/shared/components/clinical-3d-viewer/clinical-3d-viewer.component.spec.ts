import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Clinical3dViewerComponent } from './clinical-3d-viewer.component';

describe('Clinical3dViewerComponent', () => {
  let component: Clinical3dViewerComponent;
  let fixture: ComponentFixture<Clinical3dViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clinical3dViewerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Clinical3dViewerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
