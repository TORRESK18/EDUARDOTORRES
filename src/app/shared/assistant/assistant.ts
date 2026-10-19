import { Component, ElementRef, HostListener, NgZone, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AssistantService, ChatMessage, QuickTopic } from '../../core/services/assistant';

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './assistant.html',
  styleUrl: './assistant.css'
})
export class Assistant implements OnDestroy {
  private readonly service = inject(AssistantService);
  private readonly zone = inject(NgZone);

  @ViewChild('assistantDock', { static: true })
  private dock!: ElementRef<HTMLButtonElement>;

  readonly chatOpen = signal(false);
  readonly messages = signal<ChatMessage[]>([]);
  userMessage = '';

  private mouseFrame: number | null = null;
  private replyTimers: number[] = [];
  private mouseX = 0.5;
  private mouseY = 0.5;

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
    if (this.mouseFrame !== null) cancelAnimationFrame(this.mouseFrame);
    this.replyTimers.forEach(id => clearTimeout(id));
    this.replyTimers = [];
  }
}
