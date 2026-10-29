import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '@components/nav-bar/nav-bar.component';
import { FooterComponent } from '@components/footer/footer.component';

@Component({
  selector: 'app-application-layout',
  standalone: true,
  imports: [NavBarComponent, FooterComponent, RouterOutlet],
  templateUrl: './application-layout.component.html',
  styleUrl: './application-layout.component.scss',
})
export class ApplicationLayoutComponent {}
