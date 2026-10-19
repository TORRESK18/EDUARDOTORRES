import { AfterViewInit, Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-inicio',
  standalone: true,
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class INICIO implements AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    // Permite visitar directamente /#proyectos o /#experiencia.
    this.route.fragment
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(fragment => {
        if (!fragment || typeof document === 'undefined') return;
        document.getElementById(fragment)?.scrollIntoView({ behavior: 'smooth' });
      });
  }
}
