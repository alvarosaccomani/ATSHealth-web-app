import { Component, signal } from '@angular/core';
import { BiologicalSex, PatientStickyBarComponent } from '../patient-sticky-bar/patient-sticky-bar.component';
import { StageBarComponent } from '../stage-bar/stage-bar.component';
import { Stage1AnamnesisComponent } from '../stages/stage-1-anamnesis/stage-1-anamnesis.component';
import { Stage2PhysicalExamComponent } from '../stages/stage-2-physical-exam/stage-2-physical-exam.component';
import { Stage3TreatmentPlanComponent } from '../stages/stage-3-treatment-plan/stage-3-treatment-plan.component';
import { Stage4EvolutionComponent } from '../stages/stage-4-evolution/stage-4-evolution.component';

@Component({
  selector: 'app-encounter',
  standalone: true,
  imports: [
    PatientStickyBarComponent,
    StageBarComponent,
    Stage1AnamnesisComponent,
    Stage2PhysicalExamComponent,
    Stage3TreatmentPlanComponent,
    Stage4EvolutionComponent,
  ],
  templateUrl: './encounter.component.html',
  styleUrl: './encounter.component.scss',
})
export class EncounterComponent {
  readonly activeStage = signal<number>(1);
  readonly activeSex = signal<BiologicalSex>('femenino');
}
