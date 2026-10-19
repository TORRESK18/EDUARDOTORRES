import { Injectable } from '@angular/core';

export interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
}

export type QuickTopic = 'perfil' | 'experiencia' | 'proyectos' | 'tecnologias';

interface QuickAnswer {
  question: string;
  answer: string;
}

@Injectable({ providedIn: 'root' })
export class AssistantService {
  private readonly quickAnswers: Record<QuickTopic, QuickAnswer> = {
    perfil: {
      question: '¿Quién es Eduardo?',
      answer: 'Eduardo Torres es desarrollador de software enfocado en crear soluciones empresariales, automatización de procesos e integración de plataformas.'
    },
    experiencia: {
      question: '¿Qué experiencia tiene?',
      answer: 'Cuenta con experiencia desarrollando soluciones de software para entornos empresariales y de manufactura, incluyendo aplicaciones web, automatización y sistemas de gestión.'
    },
    proyectos: {
      question: '¿Qué proyectos ha desarrollado?',
      answer: 'Ha trabajado en sistemas de auditorías, puntos de venta, plataformas administrativas y soluciones orientadas a automatizar procesos empresariales.'
    },
    tecnologias: {
      question: '¿Qué tecnologías utiliza?',
      answer: 'Trabaja principalmente con Angular, TypeScript, .NET, C#, SQL Server, AWS, Power BI y herramientas de automatización e integración.'
    }
  };

  getQuickAnswer(topic: QuickTopic): QuickAnswer {
    return this.quickAnswers[topic];
  }

  getBotResponse(message: string): string {
    const text = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (['angular', 'tecnologia', 'stack', '.net', 'dotnet', 'sql', 'aws']
      .some(term => text.includes(term))) {
      return 'Eduardo trabaja con Angular, TypeScript, .NET, C#, SQL Server, AWS, Power BI y otras tecnologías orientadas al desarrollo empresarial.';
    }
    if (['experiencia', 'trabajo', 'trayectoria'].some(term => text.includes(term))) {
      return 'Su experiencia incluye desarrollo de software empresarial, automatización de procesos y soluciones para entornos de manufactura.';
    }
    if (['proyecto', 'sistema', 'aplicacion'].some(term => text.includes(term))) {
      return 'Entre sus proyectos se encuentran sistemas de auditorías, puntos de venta, plataformas administrativas y soluciones de automatización.';
    }
    if (['eduardo', 'quien', 'perfil', 'sobre ti'].some(term => text.includes(term))) {
      return 'Eduardo Torres es desarrollador de software especializado en crear soluciones empresariales mediante software y automatización.';
    }
    if (['contacto', 'correo', 'email'].some(term => text.includes(term))) {
      return 'Puedes encontrar sus medios de contacto en la sección principal del portafolio.';
    }
    return 'Por ahora puedo responder preguntas sobre el perfil, experiencia, tecnologías y proyectos de Eduardo.';
  }
}
