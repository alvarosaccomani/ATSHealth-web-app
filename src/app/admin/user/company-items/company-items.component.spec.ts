import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyItemsComponent } from './company-items.component';

describe('CompanyItemsComponent', () => {
  let component: CompanyItemsComponent;
  let fixture: ComponentFixture<CompanyItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyItemsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyItemsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
