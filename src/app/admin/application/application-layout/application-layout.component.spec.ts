import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ApplicationLayoutComponent } from './application-layout.component';

describe('ApplicationLayoutComponent', () => {
  let component: ApplicationLayoutComponent;
  let fixture: ComponentFixture<ApplicationLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationLayoutComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
