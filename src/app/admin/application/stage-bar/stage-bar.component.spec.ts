import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StageBarComponent } from './stage-bar.component';

describe('StageBarComponent', () => {
  let component: StageBarComponent;
  let fixture: ComponentFixture<StageBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StageBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StageBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
