import { AfterViewInit, Component, OnDestroy, inject, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements AfterViewInit, OnDestroy {
  readonly menuOpen = signal(false);
  readonly links = [
    { label: 'Inicio', path: '#inicio', exact: true },
    { label: 'Trayectoria', path: '#experiencia', exact: false },
    { label: 'Tecnologías', path: '#tecnologias', exact: false },
    { label: 'Certificaciones', path: '#certificaciones', exact: false }
  ];
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private navigation?: Subscription;
  private animationFrame: number | null = null;

  constructor() {
    this.navigation = this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMenu();
        this.scheduleThemeUpdate();
      });
  }

  ngAfterViewInit(): void {
    if (!this.browser) return;
    window.addEventListener('scroll', this.scheduleThemeUpdate, { passive: true });
    window.addEventListener('resize', this.scheduleThemeUpdate);
    this.scheduleThemeUpdate();
  }

  toggleMenu(): void { this.menuOpen.update(value => !value); }
  closeMenu(): void { this.menuOpen.set(false); }

  private readonly scheduleThemeUpdate = (): void => {
    if (!this.browser || this.animationFrame !== null) return;
    this.animationFrame = requestAnimationFrame(() => {
      this.animationFrame = null;
      const navbar = this.document.querySelector<HTMLElement>('.portfolio-navbar');
      if (!navbar) return;
      const centerY = navbar.getBoundingClientRect().height / 2;
      const sections = this.document.querySelectorAll<HTMLElement>('.career-section, [data-surface="light"]');
      const light = Array.from(sections).some(section => {
        const rect = section.getBoundingClientRect();
        return rect.top <= centerY && rect.bottom > centerY;
      });
      navbar.classList.toggle('is-surface-light', light);
    });
  };

  ngOnDestroy(): void {
    this.navigation?.unsubscribe();
    if (!this.browser) return;
    window.removeEventListener('scroll', this.scheduleThemeUpdate);
    window.removeEventListener('resize', this.scheduleThemeUpdate);
    if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
  }
}
