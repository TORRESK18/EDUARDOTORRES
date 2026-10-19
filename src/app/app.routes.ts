import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Inicio | Eduardo Torres',
    loadComponent: () =>
      import('./Pages/inicio/inicio')
        .then(m => m.INICIO)
  },
  {
    path: 'INICIO',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'proyectos',
    title: 'Proyectos | Eduardo Torres',
    loadComponent: () =>
      import('./Pages/proyectos/proyectos.component')
        .then(m => m.ProyectosComponent)
  },
  {
    path: 'proyectos/:slug',
    title: 'Detalle del proyecto | Eduardo Torres',
    loadComponent: () =>
      import('./Pages/proyectos-detalle/proyectos-detalle.component')
        .then(m => m.ProyectosDetalleComponent)
  },
  {
    path: 'experiencia',
    title: 'Experiencia | Eduardo Torres',
    loadComponent: () =>
      import('./Pages/experiencia/experiencia.component')
        .then(m => m.ExperienciaComponent)
  },
  {
    path: 'tecnologias',
    title: 'Tecnologías | Eduardo Torres',
    loadComponent: () =>
      import('./Pages/tecnologias/tecnologias.component')
        .then(m => m.TecnologiasComponent)
  },
  {
    path: 'certificaciones',
    title: 'Certificaciones | Eduardo Torres',
    loadComponent: () =>
      import('./Pages/certificaciones/certificaciones.component')
        .then(m => m.CertificacionesComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];