import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Stage1AnamnesisComponent } from './stage-1-anamnesis.component';

describe('Stage1AnamnesisComponent', () => {
  let component: Stage1AnamnesisComponent;
  let fixture: ComponentFixture<Stage1AnamnesisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stage1AnamnesisComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Stage1AnamnesisComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
