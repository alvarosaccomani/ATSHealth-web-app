import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { PatientStickyBarComponent } from '../patient-sticky-bar/patient-sticky-bar.component';
import { StageBarComponent } from '../stage-bar/stage-bar.component';

@Component({
  selector: 'app-application-layout',
  imports: [NavBarComponent, PatientStickyBarComponent, StageBarComponent, RouterOutlet],
  templateUrl: './application-layout.component.html',
  styleUrl: './application-layout.component.scss',
})
export class ApplicationLayoutComponent {
  readonly activeStage = signal<number>(1);
}
