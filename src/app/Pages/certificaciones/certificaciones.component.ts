import {
  AfterViewInit,
  Component,
  Directive,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
  NgZone,
  ViewChild
} from '@angular/core';

@Directive({ selector: '[appCertReveal]', standalone: true })
export class CertRevealDirective implements AfterViewInit, OnDestroy {
  private readonly element = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const target = this.element.nativeElement;
    if (typeof window === 'undefined' || !(window as Window & typeof globalThis).IntersectionObserver) {
      target.classList.add('is-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          target.classList.add('is-visible');
          this.observer?.disconnect();
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -10% 0px' }
    );

    this.observer.observe(target); 
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

type FormationYear = 2026 | 2025 | 2024 | 2023;
type YearFilter = FormationYear | 'all';

interface Formation {
  readonly id: string;
  readonly year: FormationYear;
  readonly institution: string;
  readonly title: string;
  readonly track: string;
  readonly providerAccent: string;
}

interface FormationGroup {
  readonly year: FormationYear;
  readonly entries: readonly Formation[];
}

interface ProviderLogo {
  readonly name: string;
  readonly shortName: string;
  readonly logo: string | null;
  readonly tone: string;
  readonly hoverFilter: string;
}

@Component({
  selector: 'app-certificaciones',
  standalone: true,
  imports: [CertRevealDirective],
  templateUrl: './certificaciones.component.html',
  styleUrl: './certificaciones.component.css'
})
export class CertificacionesComponent implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);
  @ViewChild('brandTrack') private brandTrack?: ElementRef<HTMLElement>;
  @ViewChild('brandSequence') private brandSequence?: ElementRef<HTMLElement>;
  @ViewChild('metrics') private metrics?: ElementRef<HTMLElement>;
  @ViewChild('featuredRail') private featuredRail?: ElementRef<HTMLElement>;

  readonly animatedCourses = signal(0);
  readonly animatedProviders = signal(0);
  readonly animatedLastYear = signal(2023);
  readonly metricPeriodStart = 2023;
  private metricObserver?: IntersectionObserver;
  private metricAnimation: number | null = null;
  private metricStarted = false;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;
    this.configureMarquee();
    this.configureFeatured();
    document.addEventListener('visibilitychange', this.onPageVisibility);
    const target = this.metrics?.nativeElement;
    if (!target) return;
    if (!('IntersectionObserver' in window)) { this.startMetrics(); return; }
    this.metricObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        this.startMetrics();
        this.metricObserver?.disconnect();
      }
    }, { threshold: 0.35 });
    this.metricObserver.observe(target);
  }

  ngOnDestroy(): void {
    this.metricObserver?.disconnect();
    this.resizeObserver?.disconnect();
    this.featuredObserver?.disconnect();
    this.stopFeaturedTimer();
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', this.onPageVisibility);
    if (this.metricAnimation !== null) cancelAnimationFrame(this.metricAnimation);
  }

  private readonly onPageVisibility = (): void => {
    if (document.hidden) this.stopFeaturedTimer();
    else this.startFeaturedTimer();
  };

  private startMetrics(): void {
    if (this.metricStarted) return;
    this.metricStarted = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.animatedCourses.set(this.totalEntries);
      this.animatedProviders.set(this.totalProviders);
      this.animatedLastYear.set(2026);
      return;
    }
    const start = performance.now();
    const duration = 1350;
    this.zone.runOutsideAngular(() => {
      const frame = (now: number): void => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        this.animatedCourses.set(Math.round(4 + (this.totalEntries - 4) * eased));
        this.animatedProviders.set(Math.round(1 + (this.totalProviders - 1) * eased));
        this.animatedLastYear.set(Math.round(2023 + 3 * eased));
        if (progress < 1) this.metricAnimation = requestAnimationFrame(frame);
        else this.metricAnimation = null;
      };
      this.metricAnimation = requestAnimationFrame(frame);
    });
  }

  private configureMarquee(): void {
    const sequence = this.brandSequence?.nativeElement;
    const track = this.brandTrack?.nativeElement;
    if (!sequence || !track) return;
    const update = (): void => {
      const width = sequence.getBoundingClientRect().width;
      if (width > 0) track.style.setProperty('--sequence-width', `${width}px`);
    };
    update();
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(update);
      this.resizeObserver.observe(sequence);
    }
  }

  scrollToTraining(): void {
    if (typeof document === 'undefined') return;
    document.getElementById('formacion-academica')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  readonly years: readonly FormationYear[] = [2026, 2025, 2024, 2023];
  readonly activeYear = signal<YearFilter>('all');

  // SVGs de marcas: se muestran en monocromo y recuperan su color al pasar el cursor.
  // Para EBC y Edutin se emplea un logotipo tipográfico sin simular un emblema oficial.
  readonly providerLogos: readonly ProviderLogo[] = [
    { name: 'AWS Academy', shortName: 'AWS Academy', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/amazonaws.svg', tone: '#ff9900', hoverFilter: 'invert(67%) sepia(99%) saturate(2423%) hue-rotate(359deg) brightness(102%) contrast(106%)' },
    { name: 'Cisco', shortName: 'Cisco', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/cisco.svg', tone: '#049fd9', hoverFilter: 'invert(47%) sepia(97%) saturate(1724%) hue-rotate(155deg) brightness(99%) contrast(97%)' },
    { name: 'Oracle', shortName: 'ORACLE', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/oracle.svg', tone: '#f80000', hoverFilter: 'invert(22%) sepia(98%) saturate(7475%) hue-rotate(0deg) brightness(101%) contrast(113%)' },
    { name: 'Udemy', shortName: 'udemy', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/udemy.svg', tone: '#a435f0', hoverFilter: 'invert(30%) sepia(83%) saturate(4884%) hue-rotate(261deg) brightness(99%) contrast(91%)' },
    { name: 'EBC', shortName: 'EBC', logo: null, tone: '#f5f5f5', hoverFilter: 'brightness(0) invert(1)' },
    { name: 'DataCamp', shortName: 'DataCamp', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/datacamp.svg', tone: '#03ef62', hoverFilter: 'invert(75%) sepia(92%) saturate(1688%) hue-rotate(79deg) brightness(101%) contrast(104%)' },
    { name: 'Edutin Academy', shortName: 'EDUTIN ACADEMY', logo: null, tone: '#f5f5f5', hoverFilter: 'brightness(0) invert(1)' }
  ];

  readonly unavailableLogos = signal<readonly string[]>([]);

  markLogoUnavailable(providerName: string): void {
    this.unavailableLogos.update(names =>
      names.includes(providerName) ? names : [...names, providerName]
    );
  }

  showLogo(provider: ProviderLogo): boolean {
    return provider.logo !== null && !this.unavailableLogos().includes(provider.name);
  }


  readonly formations: readonly Formation[] = [
    { id: '2026-ebc-analisis', year: 2026, institution: 'EBC', title: 'Análisis de bases de datos', track: 'Datos', providerAccent: 'accent-dark' },
    { id: '2026-aws-operations', year: 2026, institution: 'AWS Academy', title: 'Cloud Operations', track: 'Cloud', providerAccent: 'accent-aws' },
    { id: '2026-aws-architecting', year: 2026, institution: 'AWS Academy', title: 'Cloud Architecting', track: 'Arquitectura cloud', providerAccent: 'accent-aws' },
    { id: '2026-aws-data', year: 2026, institution: 'AWS Academy', title: 'Data Engineering', track: 'Ingeniería de datos', providerAccent: 'accent-aws' },
    { id: '2026-aws-foundations', year: 2026, institution: 'AWS Academy', title: 'Cloud Foundations', track: 'Fundamentos cloud', providerAccent: 'accent-aws' },

    { id: '2025-ebc-backend', year: 2025, institution: 'EBC', title: 'Desarrollo Backend', track: 'Desarrollo', providerAccent: 'accent-dark' },
    { id: '2025-udemy-angular', year: 2025, institution: 'Udemy', title: 'Angular Advanced', track: 'Frontend', providerAccent: 'accent-mid' },
    { id: '2025-cisco-js', year: 2025, institution: 'Cisco', title: 'JavaScript Essentials 1 & 2', track: 'Programación', providerAccent: 'accent-mid' },
    { id: '2025-cisco-python-1', year: 2025, institution: 'Cisco', title: 'Python Essentials 1', track: 'Programación', providerAccent: 'accent-mid' },
    { id: '2025-cisco-python-2', year: 2025, institution: 'Cisco', title: 'Python Essentials 2', track: 'Programación', providerAccent: 'accent-mid' },
    { id: '2025-oracle-oci', year: 2025, institution: 'Oracle', title: 'Oracle Cloud Infrastructure (OCI)', track: 'Cloud', providerAccent: 'accent-light' },

    { id: '2024-cisco-cyber', year: 2024, institution: 'Cisco', title: 'Fundamentals of Cybersecurity', track: 'Ciberseguridad', providerAccent: 'accent-mid' },
    { id: '2024-datacamp-sql', year: 2024, institution: 'DataCamp', title: 'SQL for Data Science', track: 'Datos', providerAccent: 'accent-light' },
    { id: '2024-edutin-maintenance', year: 2024, institution: 'Edutin Academy', title: 'Mantenimiento y Reparación de computadoras', track: 'Soporte e IT', providerAccent: 'accent-light' },
    { id: '2024-edutin-bigdata', year: 2024, institution: 'Edutin Academy', title: 'Big Data', track: 'Datos', providerAccent: 'accent-light' },

    { id: '2023-cisco-enterprise', year: 2023, institution: 'Cisco', title: 'Redes Empresariales, Seguridad y Automatización v7.02', track: 'Redes', providerAccent: 'accent-mid' },
    { id: '2023-cisco-ccna', year: 2023, institution: 'Cisco', title: 'Redes CCNAv7', track: 'Redes', providerAccent: 'accent-mid' },
    { id: '2023-cisco-switching', year: 2023, institution: 'Cisco', title: 'Fundamentos de Conmutación, Enrutamiento y Redes Inalámbricas', track: 'Redes', providerAccent: 'accent-mid' }
  ];

  readonly featuredFormations = this.formations.filter(item => [
    '2026-aws-architecting',
    '2026-aws-data',
    '2025-cisco-python-1',
    '2025-cisco-python-2',
    '2025-oracle-oci',
    '2024-cisco-cyber',
    '2023-cisco-ccna'
  ].includes(item.id));

  readonly featuredIndex = signal(0);
  private featuredTimer: ReturnType<typeof setInterval> | null = null;
  private featuredObserver?: IntersectionObserver;
  private featuredVisible = false;
  private featuredPaused = false;

  selectFeatured(index: number): void {
    const count = this.featuredFormations.length;
    if (!count || index < 0 || index >= count) return;
    this.featuredIndex.set(index);
    const rail = this.featuredRail?.nativeElement;
    const target = rail?.querySelectorAll<HTMLElement>('.featured-card')[index];
    if (rail && target) {
      rail.scrollTo({ left: target.offsetLeft - rail.offsetLeft, behavior: 'smooth' });
    }
    this.resetFeaturedTimer();
  }

  pauseFeatured(): void {
    this.featuredPaused = true;
    this.stopFeaturedTimer();
  }

  resumeFeatured(): void {
    this.featuredPaused = false;
    this.startFeaturedTimer();
  }

  private startFeaturedTimer(): void {
    if (!this.featuredVisible || this.featuredPaused || this.featuredTimer ||
        (typeof document !== 'undefined' && document.hidden) ||
        (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    this.featuredTimer = setInterval(() => {
      this.selectFeatured((this.featuredIndex() + 1) % this.featuredFormations.length);
    }, 4500);
  }

  private stopFeaturedTimer(): void {
    if (this.featuredTimer !== null) {
      clearInterval(this.featuredTimer);
      this.featuredTimer = null;
    }
  }

  private resetFeaturedTimer(): void {
    this.stopFeaturedTimer();
    this.startFeaturedTimer();
  }

  private configureFeatured(): void {
    const rail = this.featuredRail?.nativeElement;
    if (!rail) return;
    if (!('IntersectionObserver' in window)) {
      this.featuredVisible = true;
      this.startFeaturedTimer();
      return;
    }
    this.featuredObserver = new IntersectionObserver(entries => {
      this.featuredVisible = entries.some(entry => entry.isIntersecting);
      if (this.featuredVisible) this.startFeaturedTimer();
      else this.stopFeaturedTimer();
    }, { threshold: 0.25 });
    this.featuredObserver.observe(rail);
  }

  onFeaturedScroll(): void {
    const rail = this.featuredRail?.nativeElement;
    if (!rail) return;
    const cards = Array.from(rail.querySelectorAll<HTMLElement>('.featured-card'));
    if (!cards.length) return;
    const left = rail.scrollLeft;
    let closest = 0;
    let distance = Infinity;
    cards.forEach((card, index) => {
      const diff = Math.abs(card.offsetLeft - rail.offsetLeft - left);
      if (diff < distance) { closest = index; distance = diff; }
    });
    if (this.featuredIndex() !== closest) this.featuredIndex.set(closest);
  }

  readonly totalEntries = this.formations.length;
  readonly totalProviders = new Set(this.formations.map(item => item.institution)).size;
  readonly groups = computed<readonly FormationGroup[]>(() => {
    const filter = this.activeYear();
    return this.years
      .filter(year => filter === 'all' || filter === year)
      .map(year => ({ year, entries: this.formations.filter(item => item.year === year) }));
  });

  setYear(year: YearFilter): void {
    this.activeYear.set(year);
  }
}
