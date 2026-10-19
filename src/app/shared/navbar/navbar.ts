
import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  readonly menuOpen = signal(false);

  readonly links = [
    { label: 'Inicio', path: '/', exact: true },
    { label: 'Proyectos', path: '/proyectos', exact: false },
    { label: 'Experiencia', path: '/experiencia', exact: false },
    { label: 'Tecnologías', path: '/tecnologias', exact: false },
    { label: 'Certificaciones', path: '/certificaciones', exact: false }
  ];

  constructor(router: Router) {
    router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.menuOpen.set(false));
  }

  toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
