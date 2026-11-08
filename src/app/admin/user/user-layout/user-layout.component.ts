import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '@components/sidebar/sidebar.component';
import { NavBarComponent } from '@components/nav-bar/nav-bar.component';
import { FooterComponent } from '@components/footer/footer.component';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [SidebarComponent, NavBarComponent, RouterOutlet, FooterComponent],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss',
})
export class UserLayoutComponent {}
