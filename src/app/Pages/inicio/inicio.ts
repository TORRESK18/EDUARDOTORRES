import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  ViewChild,
  inject
} from '@angular/core';
import { RouterLink } from '@angular/router';

interface Brand {
  readonly name: string;
  readonly logo: string | null;
  readonly text?: string;
  readonly isWordmark?: boolean;
  readonly color?: string;
  readonly colorFilter?: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class INICIO implements AfterViewInit {
  @ViewChild('technologiesLane') private technologiesLane?: ElementRef<HTMLElement>;
  @ViewChild('institutionsLane') private institutionsLane?: ElementRef<HTMLElement>;

  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private animationFrame: number | null = null;
  private motionDisabled = false;

  readonly technologies: readonly Brand[] = [
    { name: 'Angular', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg' },
    { name: 'TypeScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
    { name: 'C#', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg' },
    { name: '.NET', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg' },
    { name: 'JavaScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
    { name: 'HTML5', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
    { name: 'CSS3', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
    { name: 'PHP', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg' },
    { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
    { name: 'SQL Server', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-plain.svg' },
    { name: 'MySQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
    { name: 'MariaDB', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mariadb/mariadb-original.svg' },
    { name: 'Oracle', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg' },
    { name: 'Git', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
    { name: 'GitHub', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', colorFilter: 'brightness(0) invert(.95)' },
    { name: 'Azure DevOps', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azuredevops/azuredevops-original.svg' },
    { name: 'Visual Studio', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visualstudio/visualstudio-plain.svg' },
    { name: 'VS Code', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg' },
    { name: 'AWS', logo: null, text: 'aws', color: '#ffb545' },
    { name: 'Power BI', logo: null, text: 'Power BI', color: '#f6d35a' }
  ];

  readonly institutions: readonly Brand[] = [
    { name: 'AWS Academy', color: '#ff9900', colorFilter: 'invert(69%) sepia(73%) saturate(3372%) hue-rotate(359deg) brightness(104%) contrast(102%)', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/amazonaws.svg', text: 'AWS Academy' },
    { name: 'Cisco', color: '#30aee2', colorFilter: 'invert(56%) sepia(87%) saturate(1023%) hue-rotate(155deg) brightness(102%) contrast(100%)', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/cisco.svg' },
    { name: 'Oracle', color: '#f24b46', colorFilter: 'invert(31%) sepia(91%) saturate(1818%) hue-rotate(333deg) brightness(108%) contrast(94%)', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/oracle.svg', isWordmark: true },
    { name: 'Udemy', color: '#af6df4', colorFilter: 'invert(51%) sepia(68%) saturate(2809%) hue-rotate(236deg) brightness(99%) contrast(93%)', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/udemy.svg' },
    { name: 'EBC', logo: null, text: 'EBC', color: '#f1f2f4' },
    { name: 'DataCamp', color: '#62e88c', colorFilter: 'invert(70%) sepia(80%) saturate(430%) hue-rotate(76deg) brightness(102%) contrast(93%)', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/datacamp.svg' },
    { name: 'Edutin Academy', logo: null, text: 'EDUTIN', color: '#f1f2f4' }
  ];

  readonly institutionsLoop: readonly Brand[] = [...this.institutions, ...this.institutions];

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.motionDisabled = media.matches;

    const refreshMotion = (): void => {
      this.motionDisabled = media.matches;
      if (this.motionDisabled && this.animationFrame !== null) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      } else if (!this.motionDisabled && this.animationFrame === null) {
        this.startAnimation();
      }
      if (this.motionDisabled) this.updateLanes(0);
    };
    media.addEventListener('change', refreshMotion);
    this.destroyRef.onDestroy(() => {
      media.removeEventListener('change', refreshMotion);
      if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
    });

    if (this.motionDisabled) this.updateLanes(0);
    else this.startAnimation();
  }

  onLogoError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.style.display = 'none';
    const fallback = image.nextElementSibling as HTMLElement | null;
    if (fallback) fallback.hidden = false;
  }

  private startAnimation(): void {
    let previous = performance.now();
    let elapsed = 0;
    this.zone.runOutsideAngular(() => {
      const frame = (now: number): void => {
        const delta = Math.max(0, Math.min((now - previous) / 1000, 0.05));
        previous = now;
        if (!document.hidden) {
          elapsed += delta;
          this.updateLanes(elapsed);
        }
        this.animationFrame = requestAnimationFrame(frame);
      };
      this.animationFrame = requestAnimationFrame(frame);
    });
  }

  private updateLanes(seconds: number): void {
    this.positionLane(this.technologiesLane?.nativeElement, seconds, 2, false);
    this.positionLane(this.institutionsLane?.nativeElement, seconds, 2, true);
  }

  private positionLane(
    lane: HTMLElement | undefined,
    seconds: number,
    minimumGap: number,
    mirrored: boolean
  ): void {
    if (!lane) return;
    const elements = lane.querySelectorAll<HTMLElement>('.orbit-brand');
    if (!elements.length || !lane.clientWidth || !lane.clientHeight) return;

    const width = lane.clientWidth;
    const height = lane.clientHeight;
    const cardWidth = elements[0].offsetWidth;
    const cardHeight = elements[0].offsetHeight;
    const outerX = width * (mirrored ? .20 : .80);
    const vertexX = width * (mirrored ? .82 : .18);
    const topY = Math.max(cardHeight / 2 + 5, height * .075);
    const midY = height / 2;
    const bottomY = height - topY;
    const segmentLength = Math.hypot(vertexX - outerX, midY - topY);
    const pathLength = segmentLength * 2;

    // Solo muestran las tarjetas que caben con separación física real.
    // Las restantes circulan fuera de vista y entran al inicio gradualmente.
    const cardClearance = Math.max(cardWidth, cardHeight) * .70 + minimumGap;
    const visibleSlots = Math.max(4, Math.floor(pathLength / cardClearance));
    const spacing = 1 / visibleSlots;
    const timePerCard = 3.4;
    const cycleSize = elements.length * spacing;
    const travelled = (seconds / timePerCard) * spacing;

    elements.forEach((element, index) => {
      const position = ((index * spacing + travelled) % cycleSize + cycleSize) % cycleSize;
      if (position > 1) {
        element.style.opacity = '0';
        element.style.pointerEvents = 'none';
        element.style.transform = 'translate3d(-500px,-500px,0)';
        return;
      }

      const firstHalf = position <= .5;
      const sectionProgress = firstHalf ? position * 2 : (position - .5) * 2;
      const x = firstHalf
        ? outerX + (vertexX - outerX) * sectionProgress
        : vertexX + (outerX - vertexX) * sectionProgress;
      const y = firstHalf
        ? topY + (midY - topY) * sectionProgress
        : midY + (bottomY - midY) * sectionProgress;
      const fade = Math.min(1, position / .075, (1 - position) / .075);

      element.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      element.style.opacity = String(Math.max(0, fade));
      element.style.pointerEvents = 'auto';
      element.style.zIndex = String(Math.round(100 - Math.abs(.5 - position) * 80));
    });
  }
}
