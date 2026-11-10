import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicalReportModalComponent } from './clinical-report-modal.component';

describe('ClinicalReportModalComponent', () => {
  let component: ClinicalReportModalComponent;
  let fixture: ComponentFixture<ClinicalReportModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicalReportModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicalReportModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
