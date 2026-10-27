import { AfterViewInit, Component, ElementRef, HostListener, NgZone, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { AssistantService, ChatMessage, QuickTopic } from '../../core/services/assistant';

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './assistant.html',
  styleUrl: './assistant.css'
})
export class Assistant implements AfterViewInit, OnDestroy {
  private readonly service = inject(AssistantService);
  private readonly zone = inject(NgZone);
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  private routeSubscription?: Subscription;
  private themeFrame: number | null = null;

  @ViewChild('assistantDock', { static: true })
  private dock!: ElementRef<HTMLButtonElement>;

  readonly chatOpen = signal(false);
  readonly messages = signal<ChatMessage[]>([]);
  userMessage = '';

  private mouseFrame: number | null = null;
  private replyTimers: number[] = [];
  private mouseX = 0.5;
  private mouseY = 0.5;

  ngAfterViewInit(): void {
    if (!this.browser) return;
    window.addEventListener('scroll', this.scheduleThemeUpdate, { passive: true });
    window.addEventListener('resize', this.scheduleThemeUpdate);
    this.routeSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.scheduleThemeUpdate());
    this.scheduleThemeUpdate();
  }

  private readonly scheduleThemeUpdate = (): void => {
    if (!this.browser || this.themeFrame !== null) return;
    this.themeFrame = requestAnimationFrame(() => {
      this.themeFrame = null;
      const dock = this.dock.nativeElement.getBoundingClientRect();
      const testY = dock.top + dock.height / 2;
      const sections = this.document.querySelectorAll<HTMLElement>('.career-section, [data-surface="light"]');
      const light = Array.from(sections).some(section => {
        const rect = section.getBoundingClientRect();
        return rect.top <= testY && rect.bottom > testY;
      });
      this.host.nativeElement.classList.toggle('is-surface-light', light);
    });
  };

  toggleChat(): void {
    this.chatOpen.update(open => !open);
  }

  closeChat(): void {
    this.chatOpen.set(false);
  }

  askQuickQuestion(topic: QuickTopic): void {
    const { question, answer } = this.service.getQuickAnswer(topic);
    this.addConversation(question, answer, 250);
  }

  sendMessage(): void {
    const question = this.userMessage.trim();
    if (!question) return;
    this.userMessage = '';
    this.addConversation(question, this.service.getBotResponse(question), 300);
  }

  private addConversation(question: string, answer: string, delay: number): void {
    this.messages.update(current => [...current, { type: 'user', text: question }]);

    const timer = window.setTimeout(() => {
      this.messages.update(current => [...current, { type: 'bot', text: answer }]);
      this.replyTimers = this.replyTimers.filter(id => id !== timer);
    }, delay);
    this.replyTimers.push(timer);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mouseX = Math.max(0, Math.min(1, event.clientX / window.innerWidth));
    this.mouseY = Math.max(0, Math.min(1, event.clientY / window.innerHeight));
    if (this.mouseFrame !== null) return;

    this.zone.runOutsideAngular(() => {
      this.mouseFrame = requestAnimationFrame(() => {
        const element = this.dock.nativeElement;
        element.style.setProperty('--eye-x', `${((this.mouseX - 0.5) * 18).toFixed(2)}px`);
        element.style.setProperty('--eye-y', `${((this.mouseY - 0.5) * 12).toFixed(2)}px`);
        element.style.setProperty('--body-x', `${((0.5 - this.mouseY) * 1.2).toFixed(2)}deg`);
        element.style.setProperty('--body-y', `${((this.mouseX - 0.5) * 1.2).toFixed(2)}deg`);
        this.mouseFrame = null;
      });
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    if (this.browser) {
      window.removeEventListener('scroll', this.scheduleThemeUpdate);
      window.removeEventListener('resize', this.scheduleThemeUpdate);
      if (this.themeFrame !== null) cancelAnimationFrame(this.themeFrame);
    }
    if (this.mouseFrame !== null) cancelAnimationFrame(this.mouseFrame);
    this.replyTimers.forEach(id => clearTimeout(id));
    this.replyTimers = [];
  }
}
