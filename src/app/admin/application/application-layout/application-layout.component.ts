import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-application-layout',
  imports: [NavBarComponent, RouterOutlet],
  templateUrl: './application-layout.component.html',
  styleUrl: './application-layout.component.scss',
})
export class ApplicationLayoutComponent {}
