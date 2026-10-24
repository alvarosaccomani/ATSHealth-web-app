import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Stage4EvolutionComponent } from './stage-4-evolution.component';

describe('Stage4EvolutionComponent', () => {
  let component: Stage4EvolutionComponent;
  let fixture: ComponentFixture<Stage4EvolutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stage4EvolutionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Stage4EvolutionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
