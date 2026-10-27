import {
  AfterViewInit, Component, Directive, ElementRef, Input, OnDestroy,
  PLATFORM_ID, Renderer2, NgZone, computed, inject, signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

type RevealStyle = 'up' | 'left' | 'right' | 'scale';

@Directive({ selector: '[appReveal]', standalone: true })
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {
  @Input('appReveal') direction: RevealStyle = 'up';
  @Input() revealDelay = 0;
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly platform = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platform) || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const node = this.element.nativeElement;
    this.renderer.setStyle(node, '--reveal-delay', `${Math.max(0, Math.min(this.revealDelay, 350))}ms`);
    this.renderer.addClass(node, 'reveal-pending');
    this.renderer.addClass(node, `reveal-${this.direction}`);
    this.observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      this.renderer.addClass(node, 'is-visible');
      this.observer?.unobserve(node);
    }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });
    this.observer.observe(node);
  }

  ngOnDestroy(): void { this.observer?.disconnect(); }
}

interface ProjectImage {
  readonly src: string;
  readonly alt: string;
  readonly label: string;
}
interface ExperienceProject {
  readonly id: string;
  readonly title: string;
  readonly companyId: 'magna' | 'tmz';
  readonly company: string;
  readonly category: string;
  readonly description: string;
  readonly technologies: readonly string[];
  readonly images: readonly ProjectImage[];
  readonly featured?: boolean;
}
interface CareerJob {
  readonly id: 'magna' | 'tmz';
  readonly number: string;
  readonly company: string;
  readonly sector: string;
  readonly role: string;
  readonly period: string;
  readonly summary: string;
  readonly highlights: readonly { title: string; text: string }[];
}

/* Las imágenes conservan EXACTAMENTE sus nombres originales, sin cambiar mayúsculas.
   Colócalas en public/assets/ (Angular reciente) o en el assets configurado
   en angular.json. Las URLs públicas serán /assets/NOMBRE.jpg. */
const A = 'assets/';
const image = (filename: string, label: string): ProjectImage => ({
  src: `${A}${filename}.jpg`, alt: label, label
});

const CORE = ['.NET', 'Angular', 'C#', 'TypeScript', 'HTML', 'CSS', 'REST APIs', 'JSON'] as const;
const TOOLING = ['Git', 'Visual Studio', 'Visual Studio Code', 'Swagger', 'SQL Server', 'Entity Framework Core'] as const;
const POS_STACK = [...CORE, 'ESC/POS', 'GitHub', ...TOOLING] as const;
const POS_IMAGES: readonly ProjectImage[] = [
  image('APPVENTAMAIN', 'Pantalla principal del punto de venta'),
  image('APPVENTAVENTAS', 'Módulo de ventas'),
  image('APPVENTAINVENT', 'Módulo de inventario')
];

@Component({
  selector: 'app-experiencia',
  standalone: true,
  imports: [RouterLink, RevealOnScrollDirective],
  templateUrl: './experiencia.component.html',
  styleUrl: './experiencia.component.css'
})
export class ExperienciaComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly renderer = inject(Renderer2);
  private readonly zone = inject(NgZone);
  private navbar?: HTMLElement;
  private lightSection?: HTMLElement;
  private scrollFrame: number | null = null;
  private orbitFrame: number | null = null;
  private orbitPhase = 0;
  private orbitLast = 0;
  private galleryTimer: ReturnType<typeof setInterval> | null = null;
  private metricsObserver?: IntersectionObserver;
  private metricsFrame: number | null = null;
  readonly metricProgress = signal(0);
  private reelPaused = false;
  private reducedMotion = false;

  readonly jobs: readonly CareerJob[] = [
    {
      id: 'magna', number: '01', company: 'Magna Cosma San Luis',
      sector: 'INDUSTRIA AUTOMOTRIZ · INDUSTRY 4.0',
      role: 'Ingeniero Desarrollador de Software', period: 'MAR 2024 — ACTUALIDAD',
      summary: 'Desarrollo e integración de plataformas industriales, trazabilidad, digitalización de procesos y visualización de información para distintas áreas de manufactura.',
      highlights: [
        { title: 'Plataformas empresariales', text: 'Software para manufactura, calidad, mejora continua y gestión; roles y permisos según niveles operativos y directivos.' },
        { title: 'Datos en tiempo real', text: 'Captura y visualización de mediciones, gráficas Cp/Cpk y dashboards operativos en LPP.' },
        { title: 'Indicadores para la gestión', text: 'Auditorías, hallazgos, Scorecards de Dirección General, soporte y acompañamiento a usuarios.' }
      ]
    },
    {
      id: 'tmz', number: '02', company: 'TMZ Computer',
      sector: 'SOFTWARE A LA MEDIDA · SOLUCIONES IT',
      role: 'Desarrollador de Software y Soluciones IT', period: 'NOV 2022 — ACTUALIDAD',
      summary: 'Emprendimiento independiente enfocado en desarrollo, pruebas, mantenimiento e integración de aplicaciones web y APIs REST, además de proyectos a la medida, seguridad de información, respaldos e infraestructura IT.',
      highlights: [
        { title: 'Gestión administrativa', text: 'Colaboración en el desarrollo de Motel Cristal y soluciones de operación comercial.' },
        { title: 'Proyectos a la medida', text: 'Desarrollo de UTRANSPORT y NEXTORK18; diagnóstico de incidencias, mantenimiento y mejora de aplicaciones.' },
        { title: 'Punto de venta para papelería', text: 'Solución POS para papelería, con gestión de ventas, inventario e impresión ESC/POS.' }
      ]
    }
  ];

  readonly projects: readonly ExperienceProject[] = [
    {
      id: 'lpp', title: 'Plataforma LPP', companyId: 'magna', company: 'Magna Cosma San Luis',
      category: 'LIBERACIÓN DE PRIMERA PIEZA · 5 DEPARTAMENTOS', featured: true,
      description: 'Plataforma para cinco departamentos con mediciones en tiempo real, registro de hallazgos, gráficas y análisis de capacidad del proceso Cp y Cpk, adjuntos vinculados a la liberación de primera pieza y dashboards para el seguimiento operativo.',
      technologies: [...CORE, 'MQTT', 'Azure DevOps', 'Git', 'Power BI', 'Visual Studio', 'Visual Studio Code', 'Swagger', 'SQL Server', 'Entity Framework Core'],
      images: [
        image('LPP5DEP', 'Vista de los cinco departamentos de LPP'),
        image('LPPCL', 'Pantalla CL de la plataforma LPP'),
        image('LPPCPCPK', 'Mediciones e indicadores Cp y Cpk'),
        image('LPPCPCPKANALISIS', 'Análisis de capacidad Cp y Cpk'),
        image('LPPES', 'Pantalla ES de LPP'),
        image('LPPMOD', 'Módulos de la plataforma LPP'),
        image('LPPRESULTGILLOB', 'Resultados globales de LPP')
      ]
    },
    {
      id: 'auditorias', title: 'Sistema de Auditorías y Hallazgos', companyId: 'magna', company: 'Magna Cosma San Luis',
      category: 'AUDITORÍAS · CALIDAD · TRAZABILIDAD',
      description: 'Plataforma para planificación de auditorías, registro de hallazgos, responsables, seguimiento, indicadores y consulta de dashboards.',
      technologies: [...CORE, 'Azure DevOps', ...TOOLING],
      images: [image('AUDITMAIN', 'Pantalla principal de auditorías'), image('AUDITDASH', 'Dashboard de auditorías'), image('AUDITLOGIN', 'Inicio de sesión de auditorías')]
    },
    {
      id: 'scorecards', title: 'Scorecards de Dirección General', companyId: 'magna', company: 'Magna Cosma San Luis',
      category: 'INDICADORES · ANALÍTICA · DIRECCIÓN',
      description: 'Scorecards para visualizar y dar seguimiento a indicadores de gestión y desempeño, apoyando el análisis de información para Dirección General.',
      technologies: [...CORE, 'Python', 'Azure DevOps', ...TOOLING],
      images: [] // Aún no se proporcionó captura específica de Scorecards.
    },
    {
      id: 'motel', title: 'Motel Cristal', companyId: 'tmz', company: 'TMZ Computer',
      category: 'ADMINISTRACIÓN · HOSPITALIDAD',
      description: 'Proyecto desarrollado en colaboración: sistema administrativo para habitaciones, reservas, inventario, pedidos y gestión de usuarios.',
      technologies: [...CORE, 'GitHub', ...TOOLING],
      images: [
        image('MTLCRISTALMAIN', 'Pantalla principal de Motel Cristal'),
        image('MTLCRISTALMENU', 'Menú del sistema Motel Cristal'),
        image('MTLCRISTALINVENTARIO', 'Inventario de Motel Cristal'),
        image('MTLCRISTALLOGIN', 'Inicio de sesión de Motel Cristal')
      ]
    },
    {
      id: 'utransport', title: 'UTRANSPORT', companyId: 'tmz', company: 'TMZ Computer',
      category: 'PROYECTO WEB · PHP / MYSQL',
      description: 'Proyecto web desarrollado con PHP, JavaScript y MySQL. Los detalles funcionales adicionales pueden incorporarse posteriormente.',
      technologies: ['PHP', 'HTML', 'CSS', 'JavaScript', 'MySQL', 'XAMPP', 'GitHub', 'Visual Studio Code'],
      images: [image('UTRANSPORT', 'Captura del proyecto UTRANSPORT')]
    },
    {
      id: 'nextork', title: 'NEXTORK18', companyId: 'tmz', company: 'TMZ Computer',
      category: 'PROYECTO WEB · ANGULAR / .NET',
      description: 'Proyecto desarrollado con Angular, .NET y MariaDB. Los detalles funcionales adicionales pueden incorporarse posteriormente.',
      technologies: [...CORE, 'GitHub', 'Git', 'Visual Studio', 'Visual Studio Code', 'Swagger', 'MariaDB', 'Entity Framework Core', 'Postman'],
      images: [image('nextoris', 'Captura del proyecto NEXTORK18')]
    },
    {
      id: 'pos-papeleria', title: 'Punto de Venta · Papelería', companyId: 'tmz', company: 'TMZ Computer',
      category: 'PUNTO DE VENTA · PAPELERÍA',
      description: 'Sistema POS para la gestión comercial de una papelería, con módulos de ventas e inventario.',
      technologies: POS_STACK, images: POS_IMAGES
    },
  ];

  readonly activeIndex = signal(0);
  readonly currentProject = computed(() => this.projects[this.activeIndex()] ?? null);
  readonly selectedGalleryIndex = signal<Readonly<Record<string, number>>>({});
  readonly failedImages = signal<ReadonlySet<string>>(new Set<string>());
  readonly lpp = this.projects[0];
  readonly metrics = [
    { label: 'Proyectos personales y de cliente', value: 9, suffix: '+' },
    { label: 'Años desarrollando software', value: 3, suffix: '+' },
    { label: 'Tecnologías utilizadas en proyectos', value: new Set(this.projects.flatMap(p => p.technologies)).size, suffix: '+' },
    { label: 'Cursos y certificaciones reportados', value: 17, suffix: '+' }
  ] as const;
  exploreExperience(event: MouseEvent): void {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) return;
    const target = document.getElementById('trayectoria');
    if (!target) return;
    target.scrollIntoView({ behavior: this.reducedMotion ? 'auto' : 'smooth', block: 'start' });
    if (window.location.hash !== '#trayectoria') {
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#trayectoria`);
    }
  }

  counterValue(metric: { value: number }): number {
    const p = this.metricProgress();
    return p === 0 ? 0 : Math.min(metric.value, Math.round(metric.value * (0.72 + 0.28 * p)));
  }

  projectsFor(companyId: CareerJob['id']): readonly ExperienceProject[] {
    return this.projects.filter(project => project.companyId === companyId);
  }

  stackPreview(technologies: readonly string[]): string {
    return technologies.slice(0, 5).join(' · ');
  }

  goToProject(index: number): void {
    if (!this.projects.length) return;
    this.activeIndex.set((index + this.projects.length) % this.projects.length);
    this.orbitPhase = this.activeIndex();
  }
  nextProject(): void { this.goToProject(this.activeIndex() + 1); }
  previousProject(): void { this.goToProject(this.activeIndex() - 1); }
  pauseReel(): void { this.reelPaused = true; }
  resumeReel(): void { this.reelPaused = false; this.orbitLast = 0; }

  currentImageIndex(project: ExperienceProject): number {
    return Math.min(this.selectedGalleryIndex()[project.id] ?? 0, Math.max(0, project.images.length - 1));
  }
  currentImage(project: ExperienceProject): ProjectImage | null {
    return project.images[this.currentImageIndex(project)] ?? null;
  }
  chooseImage(project: ExperienceProject, index: number): void {
    if (index < 0 || index >= project.images.length) return;
    this.selectedGalleryIndex.update(current => ({ ...current, [project.id]: index }));
  }
  changeImage(project: ExperienceProject, step: number): void {
    if (!project.images.length) return;
    const next = (this.currentImageIndex(project) + step + project.images.length) % project.images.length;
    this.chooseImage(project, next);
  }
  imageFailed(src: string): boolean { return this.failedImages().has(src); }
  markImageFailed(src: string): void {
    this.failedImages.update(current => new Set([...current, src]));
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.lightSection = document.querySelector<HTMLElement>('#trayectoria') ?? undefined;
    this.navbar = document.querySelector<HTMLElement>('.portfolio-navbar') ?? undefined;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.updateNavbar();
    window.addEventListener('scroll', this.scheduleNavbar, { passive: true });
    window.addEventListener('resize', this.scheduleNavbar);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.startOrbit();
    this.startGalleryAuto();
    this.watchMetrics();
  }

  private startOrbit(): void {
    if (this.reducedMotion || !isPlatformBrowser(this.platformId)) return;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.orbit-item[data-orbit-index]'));
    const total = this.projects.length;
    if (!nodes.length || total < 2) return;
    this.zone.runOutsideAngular(() => {
      const tick = (timestamp: number) => {
        const dt = this.orbitLast ? Math.min(60, timestamp - this.orbitLast) : 0;
        this.orbitLast = timestamp;
        if (!this.reelPaused && !document.hidden) this.orbitPhase = (this.orbitPhase + dt / 3700) % total;
        const width = window.innerWidth;
        const step = width < 520 ? 95 : width < 900 ? 104 : 122;
        nodes.forEach(node => {
          const index = Number(node.dataset['orbitIndex']);
          let delta = ((index - this.orbitPhase) % total + total) % total;
          if (delta > total / 2) delta -= total;
          const distance = Math.abs(delta);
          const y = delta * step;
          const x = Math.pow(distance, 1.55) * (width < 700 ? 22 : 29);
          const opacity = Math.max(0, Math.min(1, (3.3 - distance) / 1.25));
          const scale = Math.max(.66, 1 - distance * .075);
          const rotation = delta * -3.2;
          node.style.transform = `translate3d(${x.toFixed(2)}px,calc(-50% + ${y.toFixed(2)}px),0) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
          node.style.opacity = opacity.toFixed(3);
          node.style.visibility = opacity <= .005 ? 'hidden' : 'visible';
          node.style.zIndex = String(8 - Math.round(distance));
        });
        const current = Math.round(this.orbitPhase) % total;
        if (current !== this.activeIndex()) this.zone.run(() => this.activeIndex.set(current));
        this.orbitFrame = requestAnimationFrame(tick);
      };
      this.orbitFrame = requestAnimationFrame(tick);
    });
  }

  private startGalleryAuto(): void {
    if (this.reducedMotion || this.galleryTimer !== null) return;
    this.galleryTimer = setInterval(() => {
      if (document.hidden) return;
      this.selectedGalleryIndex.update(current => {
        const next = { ...current };
        for (const project of this.projects) {
          if (project.images.length > 1) next[project.id] = ((current[project.id] ?? 0) + 1) % project.images.length;
        }
        return next;
      });
    }, 4700);
  }

  private watchMetrics(): void {
    const section = document.querySelector<HTMLElement>('.metrics-section');
    if (!section) return;
    if (this.reducedMotion || !('IntersectionObserver' in window)) {
      this.zone.run(() => this.metricProgress.set(1));
      return;
    }
    this.metricProgress.set(0);
    this.metricsObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      this.metricsObserver?.disconnect();
      this.metricsObserver = undefined;
      this.renderer.addClass(section, 'is-counting');
      const start = performance.now();
      const duration = 1250;
      const update = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        this.zone.run(() => this.metricProgress.set(eased));
        if (progress < 1) {
          this.metricsFrame = requestAnimationFrame(update);
        } else {
          this.metricsFrame = null;
        }
      };
      this.metricsFrame = requestAnimationFrame(update);
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
    this.metricsObserver.observe(section);
  }

  private readonly onVisibilityChange = (): void => { this.orbitLast = 0; };
  private readonly scheduleNavbar = (): void => {
    if (this.scrollFrame !== null) return;
    this.scrollFrame = requestAnimationFrame(() => { 
      this.scrollFrame = null; 
      this.updateNavbar();  
    });  
  };   
  private updateNavbar(): void {         
    if (!this.lightSection || !this.navbar) return; 
    const light = this.lightSection.getBoundingClientRect();
    const nav = this.navbar.getBoundingClientRect();
    const midpoint = nav.top + nav.height / 2;
    if (light.top <= midpoint && light.bottom > midpoint) this.renderer.addClass(this.navbar, 'is-on-light');
    else this.renderer.removeClass(this.navbar, 'is-on-light');
  }

  ngOnDestroy(): void {
    if (this.orbitFrame !== null) cancelAnimationFrame(this.orbitFrame);
    if (this.galleryTimer !== null) clearInterval(this.galleryTimer);
    this.metricsObserver?.disconnect();
    if (this.metricsFrame !== null) cancelAnimationFrame(this.metricsFrame);
    if (!isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('scroll', this.scheduleNavbar);
    window.removeEventListener('resize', this.scheduleNavbar);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    if (this.scrollFrame !== null) cancelAnimationFrame(this.scrollFrame);
    if (this.navbar) this.renderer.removeClass(this.navbar, 'is-on-light');
  }
 
  
}
