import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { BiologicalSex, PatientStickyBarComponent } from '../patient-sticky-bar/patient-sticky-bar.component';
import { StageBarComponent } from '../stage-bar/stage-bar.component';
import { Stage1AnamnesisComponent } from '../stages/stage-1-anamnesis/stage-1-anamnesis.component';

@Component({
  selector: 'app-application-layout',
  imports: [
    NavBarComponent,
    PatientStickyBarComponent,
    StageBarComponent,
    Stage1AnamnesisComponent,
    RouterOutlet,
  ],
  templateUrl: './application-layout.component.html',
  styleUrl: './application-layout.component.scss',
})
export class ApplicationLayoutComponent {
  readonly activeStage = signal<number>(1);
  readonly activeSex = signal<BiologicalSex>('femenino');
}
