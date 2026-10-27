import { Component } from '@angular/core';
import { Navbar } from './shared/navbar/navbar';
import { Assistant } from './shared/assistant/assistant';
import { FooterComponent } from './shared/footer/footer.component';
import { INICIO } from './Pages/inicio/inicio';
import { ExperienciaComponent } from './Pages/experiencia/experiencia.component';
import { TecnologiasComponent } from './Pages/tecnologias/tecnologias.component';
import { CertificacionesComponent } from './Pages/certificaciones/certificaciones.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Navbar, Assistant, FooterComponent, INICIO, ExperienciaComponent, TecnologiasComponent, CertificacionesComponent],
  templateUrl: './app.html', 
  styleUrl: './app.css'
})
export class App {}
