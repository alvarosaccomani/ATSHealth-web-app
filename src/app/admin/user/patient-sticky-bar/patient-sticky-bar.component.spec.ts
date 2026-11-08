import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientStickyBarComponent } from './patient-sticky-bar.component';

describe('PatientStickyBarComponent', () => {
  let component: PatientStickyBarComponent;
  let fixture: ComponentFixture<PatientStickyBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientStickyBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientStickyBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
