import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
}

interface NavSection {
  id: string;
  label: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class INICIO implements AfterViewInit, OnDestroy {

  /* =====================================================
     ELEMENTOS QUE DEBEN QUEDAR ANCLADOS AL VIEWPORT
  ===================================================== */

  @ViewChild('fixedNav', { static: true })
  fixedNav!: ElementRef<HTMLElement>;

  @ViewChild('fixedMenuOverlay', { static: true })
  fixedMenuOverlay!: ElementRef<HTMLElement>;

  @ViewChild('fixedAssistantDock', { static: true })
  fixedAssistantDock!: ElementRef<HTMLElement>;

  @ViewChild('fixedAssistantPanel', { static: true })
  fixedAssistantPanel!: ElementRef<HTMLElement>;


  /* =====================================================
     ESTADO
  ===================================================== */

  menuOpen = false;
  chatOpen = false;
  userMessage = '';
  messages: ChatMessage[] = [];
  activeSection = 'inicio';

  readonly navSections: NavSection[] = [
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'experiencia', label: 'Experiencia' }
  ];

  private observer?: IntersectionObserver;
  private mouseRaf: number | null = null;
  private pendingMouseX = 0.5;
  private pendingMouseY = 0.5;

  /*
    Guardamos los nodos que movemos al body.
    Angular conserva sus bindings y eventos aunque cambiemos
    físicamente su posición en el DOM.
  */
  private viewportNodes: HTMLElement[] = [];

  constructor(private ngZone: NgZone) {}


  /* =====================================================
     INICIALIZACIÓN
  ===================================================== */

  ngAfterViewInit(): void {

    /*
      SOLUCIÓN DEL PROBLEMA:
      El nav, overlay, asistente y chat dejan de vivir dentro de
      <app-inicio>/<app-root> y pasan directamente al <body> real.

      Así position: fixed queda referenciado al VIEWPORT y no puede
      ser afectado por transform, filter, perspective, contain u
      overflow de un contenedor Angular.
    */
    this.mountViewportElements();

    this.initSectionObserver();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();

    if (this.mouseRaf !== null) {
      cancelAnimationFrame(this.mouseRaf);
    }

    /*
      Si se destruye este componente, retiramos del body los nodos
      que Angular había creado para él.
    */
    this.viewportNodes.forEach(node => {
      if (node.parentNode === document.body) {
        document.body.removeChild(node);
      }
    });

    this.viewportNodes = [];
  }


  /* =====================================================
     ANCLAJE REAL AL BODY / VIEWPORT
  ===================================================== */

  private mountViewportElements(): void {

    const elements: HTMLElement[] = [
      this.fixedMenuOverlay.nativeElement,
      this.fixedNav.nativeElement,
      this.fixedAssistantPanel.nativeElement,
      this.fixedAssistantDock.nativeElement
    ];

    elements.forEach(element => {

      if (element.parentNode !== document.body) {
        document.body.appendChild(element);
      }

    });

    this.viewportNodes = elements;
  }


  /* =====================================================
     MENU
  ===================================================== */

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  scrollToSection(sectionId: string): void {

    const target = document.getElementById(sectionId);

    if (!target) {
      return;
    }

    this.activeSection = sectionId;
    this.closeMenu();

    const navOffset = 105;

    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      navOffset;

    window.scrollTo({
      top,
      behavior: 'smooth'
    });
  }


  /* =====================================================
     SECCIÓN ACTIVA
  ===================================================== */

  private initSectionObserver(): void {

    const ids = [
      'inicio',
      ...this.navSections.map(section => section.id)
    ];

    const sections = ids
      .map(id => document.getElementById(id))
      .filter(
        (section): section is HTMLElement =>
          section !== null
      );

    if (!sections.length) {
      return;
    }

    this.observer = new IntersectionObserver(
      entries => {

        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio -
              a.intersectionRatio
          );

        if (!visible.length) {
          return;
        }

        const id = visible[0].target.id;

        this.ngZone.run(() => {
          this.activeSection = id;
        });

      },
      {
        root: null,
        rootMargin: '-18% 0px -62% 0px',
        threshold: [0.01, 0.1, 0.25, 0.5]
      }
    );

    sections.forEach(section => {
      this.observer?.observe(section);
    });
  }


  /* =====================================================
     CHAT
  ===================================================== */

  toggleChat(): void {
    this.chatOpen = !this.chatOpen;
  }

  closeChat(): void {
    this.chatOpen = false;
  }


  /* =====================================================
     PREGUNTAS RÁPIDAS
  ===================================================== */

  askQuickQuestion(type: string): void {

    let question = '';
    let answer = '';

    switch (type) {

      case 'perfil':

        question = '¿Quién es Eduardo?';

        answer =
          'Eduardo Torres es desarrollador de software enfocado en crear soluciones empresariales, automatización de procesos e integración de plataformas.';

        break;


      case 'tecnologias':

        question = '¿Qué tecnologías utiliza?';

        answer =
          'Trabaja principalmente con Angular, TypeScript, .NET, C#, SQL Server, AWS, Power BI y herramientas de automatización e integración.';

        break;


      case 'experiencia':

        question = '¿Qué experiencia tiene?';

        answer =
          'Cuenta con experiencia desarrollando soluciones de software para entornos empresariales y de manufactura, incluyendo aplicaciones web, automatización y sistemas de gestión.';

        break;


      case 'proyectos':

        question = '¿Qué proyectos ha desarrollado?';

        answer =
          'Ha trabajado en sistemas de auditorías, puntos de venta, plataformas administrativas y soluciones orientadas a automatizar procesos empresariales.';

        break;

    }

    if (!question || !answer) {
      return;
    }

    this.messages.push({
      type: 'user',
      text: question
    });

    window.setTimeout(() => {

      this.messages.push({
        type: 'bot',
        text: answer
      });

    }, 250);
  }


  /* =====================================================
     MENSAJE MANUAL
  ===================================================== */

  sendMessage(): void {

    const message =
      this.userMessage.trim();

    if (!message) {
      return;
    }

    this.messages.push({
      type: 'user',
      text: message
    });

    this.userMessage = '';

    window.setTimeout(() => {

      this.messages.push({
        type: 'bot',
        text: this.getBotResponse(message)
      });

    }, 300);
  }


  /* =====================================================
     RESPUESTAS LOCALES
  ===================================================== */

  private getBotResponse(message: string): string {

    const text = message
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (
      text.includes('angular') ||
      text.includes('tecnologia') ||
      text.includes('stack') ||
      text.includes('.net') ||
      text.includes('dotnet') ||
      text.includes('sql') ||
      text.includes('aws')
    ) {
      return 'Eduardo trabaja con Angular, TypeScript, .NET, C#, SQL Server, AWS, Power BI y otras tecnologías orientadas al desarrollo empresarial.';
    }

    if (
      text.includes('experiencia') ||
      text.includes('trabajo') ||
      text.includes('trayectoria')
    ) {
      return 'Su experiencia incluye desarrollo de software empresarial, automatización de procesos y soluciones para entornos de manufactura.';
    }

    if (
      text.includes('proyecto') ||
      text.includes('sistema') ||
      text.includes('aplicacion')
    ) {
      return 'Entre sus proyectos se encuentran sistemas de auditorías, puntos de venta, plataformas administrativas y soluciones de automatización.';
    }

    if (
      text.includes('eduardo') ||
      text.includes('quien') ||
      text.includes('perfil') ||
      text.includes('sobre ti')
    ) {
      return 'Eduardo Torres es desarrollador de software especializado en crear soluciones empresariales mediante software y automatización.';
    }

    if (
      text.includes('contacto') ||
      text.includes('correo') ||
      text.includes('email')
    ) {
      return 'Puedes encontrar sus medios de contacto en la sección principal del portafolio.';
    }

    return 'Por ahora puedo responder preguntas sobre el perfil, experiencia, tecnologías y proyectos de Eduardo.';
  }


  /* =====================================================
     MOVIMIENTO DEL ASISTENTE
     SOLO OJOS + MICRO MOVIMIENTO INTERNO
     EL BOTÓN FIJO NO SE MUEVE DE SU ESQUINA
  ===================================================== */

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {

    this.pendingMouseX =
      event.clientX /
      window.innerWidth;

    this.pendingMouseY =
      event.clientY /
      window.innerHeight;

    if (this.mouseRaf !== null) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {

      this.mouseRaf =
        requestAnimationFrame(() => {

          document.documentElement
            .style
            .setProperty(
              '--mouse-x',
              this.pendingMouseX.toFixed(4)
            );

          document.documentElement
            .style
            .setProperty(
              '--mouse-y',
              this.pendingMouseY.toFixed(4)
            );

          this.mouseRaf = null;

        });

    });
  }
}
