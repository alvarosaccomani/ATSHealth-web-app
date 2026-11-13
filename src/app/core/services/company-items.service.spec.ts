import { TestBed } from '@angular/core/testing';
import { CompanyItemsService } from './company-items.service';

describe('CompanyItemsService', () => {
  let service: CompanyItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
