import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Stage3TreatmentPlanComponent } from './stage-3-treatment-plan.component';

describe('Stage3TreatmentPlanComponent', () => {
  let component: Stage3TreatmentPlanComponent;
  let fixture: ComponentFixture<Stage3TreatmentPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stage3TreatmentPlanComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Stage3TreatmentPlanComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
