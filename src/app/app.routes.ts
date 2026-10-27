import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Inicio | Eduardo Torres',
    loadComponent: () => import('./Pages/inicio/inicio').then(m => m.INICIO)
  },
  { path: 'INICIO', redirectTo: '', pathMatch: 'full' },
  {
    path: 'experiencia',
    title: 'Trayectoria | Eduardo Torres',
    loadComponent: () => import('./Pages/experiencia/experiencia.component').then(m => m.ExperienciaComponent)
  },
  {
    path: 'tecnologias',
    title: 'Tecnologías | Eduardo Torres',
    loadComponent: () => import('./Pages/tecnologias/tecnologias.component').then(m => m.TecnologiasComponent)
  },
  {
    path: 'certificaciones',
    title: 'Certificaciones y Formación | Eduardo Torres',
    loadComponent: () => import('./Pages/certificaciones/certificaciones.component').then(m => m.CertificacionesComponent)
  },
  { path: '**', redirectTo: '' }
];
