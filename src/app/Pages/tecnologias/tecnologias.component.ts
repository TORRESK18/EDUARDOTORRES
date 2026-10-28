import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit, Component, DestroyRef, ElementRef, NgZone, OnDestroy, PLATFORM_ID,
  QueryList, ViewChild, ViewChildren, computed, inject, signal
} from '@angular/core';
import { RouterLink } from '@angular/router';

type DomainId = 'software' | 'data' | 'cloud' | 'industry' | 'tools' | 'infrastructure';
type DomainFilter = 'all' | DomainId;

interface TechDomain {
  readonly id: DomainId;
  readonly index: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly technologies: readonly string[];
  readonly note: string;
  readonly shape: 'cut-right' | 'cut-left' | 'step' | 'slope' | 'plain' | 'double-cut';
  readonly tone: 'ink' | 'graphite' | 'steel' | 'silver' | 'charcoal' | 'warm';
}

@Component({
  selector: 'app-tecnologias',
  standalone: true,
  imports: [],
  templateUrl: './tecnologias.component.html',
  styleUrl: './tecnologias.component.css'
})
export class TecnologiasComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('catalogue', { read: ElementRef }) private catalogue?: ElementRef<HTMLElement>;
  @ViewChild('leftLane', { read: ElementRef }) private leftLane?: ElementRef<HTMLElement>;
  @ViewChild('rightLane', { read: ElementRef }) private rightLane?: ElementRef<HTMLElement>;
  @ViewChildren('pathLogo', { read: ElementRef }) private pathLogos?: QueryList<ElementRef<HTMLElement>>;
  private readonly zone = inject(NgZone);
  private frameId: number | null = null;
  private animationStart = 0;
  private readonly travelMs = 31000;


  readonly logoRows: readonly (readonly { name: string; src: string; wordmark?: boolean }[])[] = [
    [
      { name: 'Angular', src: 'angular/angular-original.svg' },
      { name: '.NET', wordmark: true, src: 'dotnetcore/dotnetcore-original.svg' },
      { name: 'C#', src: 'csharp/csharp-original.svg' },
      { name: 'TypeScript', src: 'typescript/typescript-original.svg' },
      { name: 'JavaScript', src: 'javascript/javascript-original.svg' },
      { name: 'HTML5', src: 'html5/html5-original.svg' },
      { name: 'CSS3', src: 'css3/css3-original.svg' },
      { name: 'PHP', wordmark: true, src: 'php/php-original.svg' },
      { name: 'Python', src: 'python/python-original.svg' }
    ],
    [
      { name: 'SQL Server', src: 'microsoftsqlserver/microsoftsqlserver-plain.svg' },
      { name: 'MySQL', src: 'mysql/mysql-original.svg' },
      { name: 'MariaDB', src: 'mariadb/mariadb-original.svg' },
      { name: 'Oracle', wordmark: true, src: 'oracle/oracle-original.svg' },
      { name: 'AWS', wordmark: true, src: 'amazonwebservices/amazonwebservices-plain-wordmark.svg' },
      { name: 'Git', src: 'git/git-original.svg' },
      { name: 'GitHub', src: 'github/github-original.svg' },
      { name: 'Visual Studio', src: 'visualstudio/visualstudio-plain.svg' },
      { name: 'VS Code', src: 'vscode/vscode-original.svg' },
      { name: 'Azure DevOps', src: 'azuredevops/azuredevops-original.svg' }
    ]
  ];
  readonly unavailableLogos = signal<ReadonlySet<string>>(new Set<string>());

  logoUnavailable(name: string): void {
    this.unavailableLogos.update(current => new Set([...current, name]));
  }

  readonly deviconBase = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/';

  readonly domains: readonly TechDomain[] = [
    {
      id: 'software', index: '01', eyebrow: 'DESARROLLO DE SOFTWARE', title: 'Aplicaciones que resuelven',
      description: 'Desarrollo frontend y backend de aplicaciones web, sistemas administrativos y plataformas empresariales.',
      technologies: ['Angular', '.NET', 'C#', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'REST APIs', 'JSON', 'PHP'],
      note: 'Aplicado en LPP, Auditorías, Motel Cristal, UTRANSPORT y otros sistemas.',
      shape: 'cut-right', tone: 'ink'
    },
    {
      id: 'data', index: '02', eyebrow: 'BASES DE DATOS Y ANALÍTICA', title: 'Datos con dirección',
      description: 'Persistencia, modelado, consultas e indicadores para obtener información útil de la operación.',
      technologies: ['SQL Server', 'MySQL', 'MariaDB', 'Oracle', 'SQL', 'Entity Framework Core', 'Power BI', 'Dashboards', 'Modelado de datos', 'Python'],
      note: 'Mediciones Cp/Cpk, dashboards industriales y Scorecards de Dirección General.',
      shape: 'step', tone: 'steel'
    },
    {
      id: 'cloud', index: '03', eyebrow: 'CLOUD Y SERVICIOS', title: 'Arquitectura y nube',
      description: 'Servicios e infraestructura cloud, con formación complementaria en arquitecturas y operaciones.',
      technologies: ['AWS', 'EC2', 'S3', 'IAM', 'VPC', 'Oracle Cloud Infrastructure', 'Data Engineering'],
      note: 'Experiencia y formación en servicios AWS, arquitectura cloud y datos.',
      shape: 'cut-left', tone: 'silver'
    },
    {
      id: 'industry', index: '04', eyebrow: 'AUTOMATIZACIÓN E INDUSTRIA 4.0', title: 'Software en operación',
      description: 'Integración de datos de proceso y soluciones para mejorar seguimiento, trazabilidad y captura en tiempo real.',
      technologies: ['MQTT', 'Automatización de procesos', 'Integración de datos', 'Comunicación entre dispositivos', 'Cp / Cpk', 'ESC/POS'],
      note: 'LPP y herramientas industriales; integración de impresión en punto de venta.',
      shape: 'slope', tone: 'graphite'
    },
    {
      id: 'tools', index: '05', eyebrow: 'FLUJO DE DESARROLLO', title: 'Del código a la entrega',
      description: 'Herramientas de desarrollo, control de versiones, colaboración, documentación y pruebas de APIs.',
      technologies: ['Git', 'GitHub', 'Azure DevOps', 'Visual Studio', 'Visual Studio Code', 'Swagger', 'Postman', 'Apache NetBeans'],
      note: 'Herramientas de trabajo utilizadas en proyectos profesionales y personales.',
      shape: 'double-cut', tone: 'charcoal'
    },
    {
      id: 'infrastructure', index: '06', eyebrow: 'SISTEMAS E INFRAESTRUCTURA', title: 'Tecnología de extremo a extremo',
      description: 'Administración de sistemas, soporte, respaldos y entornos para sostener las soluciones de software.',
      technologies: ['Windows Server', 'Linux', 'macOS', 'Windows', 'VirtualBox', 'PuTTY', 'Respaldos y recuperación'],
      note: 'Parte de la experiencia en soluciones IT e infraestructura de TMZ Computer.',
      shape: 'plain', tone: 'warm'
    }
  ];

  readonly filters: readonly { id: DomainFilter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'software', label: 'Desarrollo' },
    { id: 'data', label: 'Datos' },
    { id: 'cloud', label: 'Cloud' },
    { id: 'industry', label: 'Automatización' },
    { id: 'tools', label: 'Herramientas' },
    { id: 'infrastructure', label: 'Infraestructura' }
  ];

  readonly selected = signal<DomainFilter>('all');
  readonly visibleDomains = computed(() => {
    const selected = this.selected();
    return selected === 'all' ? this.domains : this.domains.filter(domain => domain.id === selected);
  });
  readonly technologyCount = new Set(this.domains.flatMap(domain => domain.technologies)).size;

  selectDomain(id: DomainFilter): void {
    this.selected.set(id);
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => this.showVisibleCards());
    }
  }

  explore(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.catalogue?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.startPathMotion();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });
    const watch = () => document.querySelectorAll<HTMLElement>('.technology-page [data-reveal]')
      .forEach(element => {
        if (!element.classList.contains('in-view')) observer.observe(element);
      });
    watch();
    this.watchCards = watch;
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private watchCards: (() => void) | null = null;
  private showVisibleCards(): void {
    this.watchCards?.();
    const catalogue = this.catalogue?.nativeElement;
    catalogue?.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
      const { top, bottom } = el.getBoundingClientRect();
      if (top < window.innerHeight && bottom > 0) el.classList.add('in-view');
    });
  }

  ngOnDestroy(): void {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
  }

  /**
   * Recorre dos tramos unidos en un vértice. En cada extremo las piezas
   * aparecen y desaparecen gradualmente; no existe reinicio del track.
   * Solo cambian las transformaciones de los logos, nunca del contenedor.
   */
  private startPathMotion(): void {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const left = this.leftLane?.nativeElement;
    const right = this.rightLane?.nativeElement;
    const elements = this.pathLogos?.map(ref => ref.nativeElement) ?? [];
    if (!left || !right || !elements.length) return;

    const leftElements = elements.filter(el => el.dataset['chevronSide'] === 'left');
    const rightElements = elements.filter(el => el.dataset['chevronSide'] === 'right');
    const layout = (container: HTMLElement, chips: HTMLElement[], isLeft: boolean, phase: number) => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;

      chips.forEach((chip, index) => {
        // Un único ciclo de fase uniforme; los elementos se distribuyen sobre toda la V.
        const ratio = (phase + index / chips.length) % 1;
        const progress = isLeft ? ratio : 1 - ratio;
        const firstLeg = progress <= 0.5;
        const local = firstLeg ? progress * 2 : (progress - 0.5) * 2;

        // Valores medidos como porcentaje del contenedor y reflejados en el lado derecho.
        const armX = 0.81;
        const tipX = 0.20;
        const xNorm = firstLeg
          ? armX + (tipX - armX) * local
          : tipX + (armX - tipX) * local;
        const yNorm = 0.065 + progress * 0.87;
        const x = (isLeft ? xNorm : 1 - xNorm) * width;
        const y = yNorm * height;

        // Transición suave de opacidad en la entrada y salida. El salto está oculto.
        const edgeFade = Math.min(1, progress / 0.085, (1 - progress) / 0.085);
        chip.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%)`;
        chip.style.opacity = `${Math.max(0, edgeFade).toFixed(3)}`;
      });
    };

    if (reduced) {
      layout(left, leftElements, true, 0.17);
      layout(right, rightElements, false, 0.17);
      return;
    }

    this.animationStart = performance.now();
    this.zone.runOutsideAngular(() => {
      const tick = (now: number) => {
        const phase = ((now - this.animationStart) % this.travelMs) / this.travelMs;
        layout(left, leftElements, true, phase);
        layout(right, rightElements, false, phase);
        this.frameId = requestAnimationFrame(tick);
      };
      this.frameId = requestAnimationFrame(tick);
    });
  }

}
