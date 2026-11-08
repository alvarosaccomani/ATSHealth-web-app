import { TestBed } from '@angular/core/testing';
import { Clinical3dFilterService } from './clinical-3d-filter.service';

describe('Clinical3dFilterService', () => {
  let service: Clinical3dFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Clinical3dFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
