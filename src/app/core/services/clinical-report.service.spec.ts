import { TestBed } from '@angular/core/testing';
import { ClinicalReportService } from './clinical-report.service';

describe('ClinicalReportService', () => {
  let service: ClinicalReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClinicalReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
