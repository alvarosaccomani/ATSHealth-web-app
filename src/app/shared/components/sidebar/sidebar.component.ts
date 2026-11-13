import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '@services/sidebar.service';
import { CompanyContextService } from '@services/company-context.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
  disabled?: boolean;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  readonly sidebarService = inject(SidebarService);
  readonly companyContext = inject(CompanyContextService);

  readonly isCollapsed = this.sidebarService.isCollapsed;
  readonly isMobileOpen = this.sidebarService.isMobileOpen;

  readonly navigationItems: NavItem[] = [
    {
      label: 'Pacientes',
      icon: 'fa-users',
      route: '/admin/user/patients',
    },
    {
      label: 'Consulta Activa',
      icon: 'fa-notes-medical',
      route: '/admin/user/encounter',
    },
    {
      label: 'Equipo y Roles',
      icon: 'fa-users-gear',
      route: '/admin/user/company-users',
      adminOnly: true,
    },
    {
      label: 'Servicios & Prestaciones',
      icon: 'fa-briefcase-medical',
      route: '/admin/user/company-items',
      adminOnly: true,
    },
    {
      label: 'Agenda de Turnos',
      icon: 'fa-calendar-check',
      route: '/admin/application/appointments',
      badge: 'Pronto',
      disabled: true,
    },
    {
      label: 'Plantillas & Studio',
      icon: 'fa-file-waveform',
      route: '/admin/application/templates',
      adminOnly: true,
    },
    {
      label: 'Catálogo de Prestaciones',
      icon: 'fa-book-medical',
      route: '/admin/application/items',
      adminOnly: true,
    },
    {
      label: 'Estadísticas & Reportes',
      icon: 'fa-chart-pie',
      route: '/admin/application/reports',
      badge: 'Pronto',
      disabled: true,
    },
  ];

  toggleCollapse(): void {
    this.sidebarService.toggleCollapse();
  }

  closeMobile(): void {
    this.sidebarService.closeMobile();
  }
}
