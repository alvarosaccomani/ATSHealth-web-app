import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Stage2PhysicalExamComponent } from './stage-2-physical-exam.component';

describe('Stage2PhysicalExamComponent', () => {
  let component: Stage2PhysicalExamComponent;
  let fixture: ComponentFixture<Stage2PhysicalExamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stage2PhysicalExamComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(Stage2PhysicalExamComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
