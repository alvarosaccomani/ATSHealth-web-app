import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CompanyItemsComponent } from './company-items.component';

describe('CompanyItemsComponent', () => {
  let component: CompanyItemsComponent;
  let fixture: ComponentFixture<CompanyItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyItemsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyItemsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
