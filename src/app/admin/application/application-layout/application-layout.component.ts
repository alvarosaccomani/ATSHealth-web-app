import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '@components/nav-bar/nav-bar.component';
import { FooterComponent } from '@components/footer/footer.component';
import { SidebarComponent } from '@components/sidebar/sidebar.component';
import { SidebarService } from '@services/sidebar.service';

@Component({
  selector: 'app-application-layout',
  standalone: true,
  imports: [SidebarComponent, NavBarComponent, FooterComponent, RouterOutlet],
  templateUrl: './application-layout.component.html',
  styleUrl: './application-layout.component.scss',
})
export class ApplicationLayoutComponent {
  readonly sidebarService = inject(SidebarService);
}
