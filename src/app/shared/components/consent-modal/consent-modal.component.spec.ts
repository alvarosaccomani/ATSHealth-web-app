import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsentModalComponent } from './consent-modal.component';

describe('ConsentModalComponent', () => {
  let component: ConsentModalComponent;
  let fixture: ComponentFixture<ConsentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsentModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
