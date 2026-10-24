import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { PatientStickyBarComponent } from '../patient-sticky-bar/patient-sticky-bar.component';

@Component({
  selector: 'app-application-layout',
  imports: [NavBarComponent, PatientStickyBarComponent, RouterOutlet],
  templateUrl: './application-layout.component.html',
  styleUrl: './application-layout.component.scss',
})
export class ApplicationLayoutComponent {}
