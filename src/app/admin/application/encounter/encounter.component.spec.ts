import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EncounterComponent } from './encounter.component';

describe('EncounterComponent', () => {
  let component: EncounterComponent;
  let fixture: ComponentFixture<EncounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncounterComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(EncounterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start at stage 1', () => {
    expect(component.activeStage()).toBe(1);
  });
});
