#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const messagesDir = path.join(__dirname, '..', 'messages');
const translations = {
  'de-DE': {
    Pages: {
      pricing: {
        title: 'Preisklassen',
        subtitle: 'Wähle den Plan, der am besten zu dir passt'
      },
      privacy: {
        title: 'Datenschutzrichtlinie',
        lastUpdated: 'Zuletzt aktualisiert: {date}',
        badge: 'Rechtliches',
        heroTitle: 'Datenschutz ',
        heroAccent: 'Richtlinie',
        contents: 'Inhalt',
        introP1: 'Diese Datenschutzrichtlinie erklärt, wie 3YESES ("Plattform", "wir", "uns", "unser") deine persönlichen Daten sammelt, nutzt, speichert und schützt, wenn du unseren abonnementbasierten Talent-Marktplatz unter 3yeses.online verwendest.',
        introP2: 'Wir verpflichten uns, deine Privatsphäre zu schützen und deine persönlichen Daten gemäß UK GDPR, dem Data Protection Act 2018 und, falls zutreffend, der EU GDPR zu verarbeiten.'
      },
      terms: {
        title: 'Nutzungsbedingungen',
        lastUpdated: 'Zuletzt aktualisiert: {date}',
        badge: 'Rechtliches',
        heroTitle: 'Bedingungen & ',
        heroAccent: 'Konditionen',
        contents: 'Inhalt',
        sections: {
          overview: {
            p1: 'Diese Nutzungsbedingungen ("Bedingungen") regeln deine Nutzung der Plattform 3YESES ("Plattform", "wir", "uns", "unser"). Durch das Erstellen eines Kontos oder die Nutzung eines Teils der Plattform erklärst du dich mit diesen Bedingungen einverstanden.',
            p2: '3YESES ist eine Plattform, auf der kreative Fachkräfte – Schauspieler, Musiker, Models, Tänzer, Sprecher, Fotografen, Videofilmer, DJs, Moderatoren, Komiker und andere Performer – Profile erstellen, Portfolio-Medien hochladen (Fotos, Videos, Audio) und entdeckt werden. Die Plattform umfasst ein durchsuchbares Talentverzeichnis, ein Medienzentrum, Analyse-Dashboards und Community-Funktionen wie Kommentare, Likes und das Teilen von Inhalten.'
          },
          eligibility: {
            p1: 'Du musst mindestens 13 Jahre alt sein, um ein Konto zu erstellen. Nutzer im Alter von 13–17 Jahren benötigen die Zustimmung eines Elternteils oder Erziehungsberechtigten. Nutzer unter 13 Jahren müssen ein von einem Elternteil verwaltetes Konto haben, bei dem der Elternteil oder Erziehungsberechtigte das Konto in ihrem Namen registriert und verwaltet.',
            p2: 'Du bist verantwortlich für die Vertraulichkeit deiner Login-Daten und für alle Aktivitäten in deinem Konto. Informiere uns sofort, wenn du einen unbefugten Zugriff vermutest.',
            p3: 'Jede Person darf nur ein Konto führen. Duplikate können ohne Vorankündigung gesperrt werden.',
            p4: 'Du musst während der Registrierung genaue, aktuelle Informationen angeben und deine Profilinformationen auf dem neuesten Stand halten. Betrügerische oder irreführende Profile können entfernt werden.'
          },
          subscription: {
            p1: 'Ein aktives Abonnement ist erforderlich, um die Plattform zu nutzen. Du abonnierst während des Anmeldeprozesses. Ohne ein aktives Abonnement kannst du nicht auf die Plattform zugreifen.',
            plansIntro: 'Wir bieten einen Plan an – Standard Access – mit zwei Laufzeitoptionen:',
            plans: [
              '6 Monate – £10, berechnet als wiederkehrendes Abonnement über Stripe.',
              '12 Monate – £20, berechnet als wiederkehrendes Abonnement über Stripe.'
            ],
            p2: 'Beide Pläne beinhalten identische Funktionen: unbegrenzte Portfolio-Uploads, vollständige Profilanpassung, priorisierte Suche und vollständige Dashboard-Analysen.'
          },
          content: {
            ownership: 'Du behältst das volle Eigentum an allen Inhalten, die du auf die Plattform hochlädst. Durch das Hochladen gewährst du 3YESES eine nicht ausschließliche, weltweite, gebührenfreie Lizenz, um deine Inhalte auf der Plattform und in Marketingmaterialien anzuzeigen, zu verteilen und zu bewerben.',
            permitted: 'Du darfst Bilder (JPEG, PNG, WebP), Videos (MP4, MOV) und Audiodateien (MP3, WAV) hochladen. Einzeldateien dürfen 50 MB nicht überschreiten. Du darfst auch externe Videolinks einbetten (z. B. YouTube, Vimeo).',
            prohibited: [
              'Ist sexuell explizit, pornografisch oder zeigt Nacktheit mit sexuellem Zweck.',
              'Enthält Gewalt, Blut oder Inhalte, die Schaden an Personen darstellen.',
              'Fördert Hassrede, Diskriminierung oder Belästigung aufgrund von Rasse, ethnischer Zugehörigkeit, Religion, Geschlecht, sexueller Orientierung, Behinderung oder anderen geschützten Merkmalen.',
              'Verletzt die geistigen Eigentumsrechte anderer (Urheberrecht, Marke usw.).',
              'Enthält Malware, ausführbare Dateien oder jegliche Form schädlichen Codes.',
              'Ist Spam, irreführend oder betrügerisch.',
              'Stellt Minderjährige in unangemessenen Kontexten dar.'
            ]
          }
        }
      },
      about: {
        title: 'Über 3YESES',
        subtitle: 'Verbindung von Talent und Gelegenheit'
      }
    },
    SuccessStories: {
      breadcrumb: 'Erfolgsgeschichten',
      title: 'Erfolgsgeschichten',
      subtitle: 'Entdecke inspirierende Reisen talentierter Kreativer, die durch 3YESES Arbeit und Sichtbarkeit gefunden haben.',
      stories: {
        '0': {
          title: 'Emma Thompson — Musikerin',
          body: 'Als aufstrebende Gitarristin hatte Emma Schwierigkeiten, im überfüllten Markt aufzufallen. Mit den erweiterten Suchfunktionen unserer Plattform verband sie sich mit Produzenten, die ihren einzigartigen Sound liebten. Das führte zu Kooperationen an zwei Hit-Singles und einer ausverkauften Tour.'
        },
        '1': {
          title: 'Liam Garcia — Schauspieler',
          body: 'Liam, ein vielseitiger Schauspieler mit einer Leidenschaft für Independent-Filme, fand seinen großen Durchbruch über unsere Plattform. Regisseure entdeckten sein Talent über gezielte Profile, was zu Rollen in drei von Kritikern gefeierten Filmen und einer Nominierung als bester Nebendarsteller führte.'
        },
        '2': {
          title: 'Sophia Patel — Tänzerin',
          body: 'Sophias zeitgenössischer Tanzstil fiel Choreografen auf unserer Plattform auf. Seitdem trat sie in Broadway-Produktionen und internationalen Festivals auf und choreografierte sogar eine Welt-Tournee für eine große Popkünstlerin.'
        }
      }
    },
    DashboardMessagesPage: {
      title: 'Nachrichten',
      searchPlaceholder: 'Konversationen durchsuchen...',
      messagePlaceholder: 'Gib deine Nachricht ein...',
      send: 'Nachricht senden'
    },
    DashboardSubscriptionPage: {
      title: 'Abonnement',
      subtitle: 'Verwalte deinen Standard Access Plan und deine Zahlungseinstellungen',
      cancelSubscription: 'Abonnement kündigen',
      forTalents: 'Für Talente',
      processing: 'Wird verarbeitet...',
      currentPlan: 'Aktueller Plan',
      subscribe: 'Mit Stripe abonnieren',
      securePayment: 'Sichere Zahlungsabwicklung über Stripe',
      questions: 'Fragen? Kontaktiere uns unter',
      confirmCancel: 'Bist du sicher, dass du dein Abonnement kündigen möchtest?',
      cancelSuccess: 'Abonnement erfolgreich gekündigt',
      errors: {
        missingCheckoutUrl: 'Keine Checkout-URL erhalten',
        createSubscription: 'Fehler beim Erstellen des Abonnements. Bitte versuche es erneut.',
        cancelSubscription: 'Fehler beim Kündigen des Abonnements. Bitte versuche es erneut.'
      }
    },
    AuthRequiredModal: {
      title: 'Anmeldung erforderlich',
      subtitle: 'Dein Konto schaltet Talent-Likes und Favoriten frei.',
      message: 'Du benötigst ein Konto, um {action} auszuführen. Melde dich an oder erstelle ein Konto.',
      buttons: {
        notNow: 'Nicht jetzt',
        signIn: 'Anmelden',
        createAccount: 'Konto erstellen'
      }
    },
    SaveButton: {
      save: 'Talent speichern',
      remove: 'Aus gespeicherten entfernen',
      authModal: {
        title: 'Melde dich an, um zu speichern',
        message: 'Du benötigst ein Konto, um Profile von {talentName} zu speichern und zu merken. Melde dich an oder erstelle ein Konto.',
        action: 'Profile speichern'
      }
    },
    Home: {
      tagline: 'Verbindung von Talent und Gelegenheit in der Unterhaltungsbranche.',
      welcome: {
        title: 'Willkommen bei 3YESES',
        description: 'Finde das perfekte Talent für dein nächstes Projekt oder entdecke spannende Chancen in der Unterhaltungsbranche.'
      },
      forTalent: {
        title: 'Für Talente',
        description: 'Zeige deine Fähigkeiten und finde deine nächste große Chance.',
        browse: 'Kategorien durchsuchen'
      },
      expertTalent: 'Experten-Talent',
      expertTalentDescription: 'Zugang zu verifizierten Profis mit nachweislicher Erfahrung',
      qualityAssured: 'Qualität gesichert',
      qualityAssuredDescription: 'Alle Talente werden zur Sicherheit geprüft und verifiziert',
      qualityAssuredDesc: 'Top-Talent für deine Projekte',
      careerGrowth: 'Karrierewachstum',
      careerGrowthDescription: 'Baue dauerhafte Verbindungen auf und fördere deine Karriere',
      careerGrowthDesc: 'Chancen, deine Karriere voranzutreiben',
      verifiedTalent: 'Verifiziertes Talent',
      verifiedTalentDesc: 'Alle Profile werden manuell verifiziert',
      searchPlaceholder: 'Suche nach Talent, Fähigkeiten oder Kategorien...',
      searchButton: 'Suchen',
      allCategories: 'Alle Kategorien',
      location: 'Standort',
      filters: 'Filter',
      clearAll: 'Alle löschen',
      applyFilters: 'Filter anwenden',
      watchEyebrow: 'Sieh dir an, worum es bei 3YESES geht',
      videoSectionSeeThe: 'Sieh die',
      videoSectionExperience: '3YESES-Erfahrung',
      videoSectionDescription: 'Entdecke, wie Talente gecastet werden und wie Casting-Regisseure jedes Mal die perfekte Besetzung finden.',
      allCategory: 'Alle {name}'
    },
    Footer: {
      aboutUs: 'Über uns',
      companyInfo: 'Präsentiere deine Arbeit einem Live-Publikum — abonniere, um auffindbar zu sein und durch Ansichten, Likes, Kommentare und Shares zu wachsen.',
      forTalent: 'Für Talente',
      joinAsTalent: 'Als Talent beitreten',
      talentDashboard: 'Talent-Dashboard',
      browseCategories: 'Kategorien durchsuchen',
      pricingPlans: 'Preisklassen',
      howItWorks: 'So funktioniert es',
      successStories: 'Erfolgsgeschichten',
      contactUs: 'Kontaktiere uns',
      email: 'contact@3yeses.co.uk',
      phone: '+44 121 123 4567',
      location: 'Birmingham, UK',
      language: 'Sprache',
      copyright: '© 2026 3YESES. Alle Rechte vorbehalten.',
      privacyPolicy: 'Datenschutzrichtlinie',
      termsOfService: 'Nutzungsbedingungen'
    },
    Meta: {
      title: '3YESES',
      description: '3YESES ist ein abonnementbasierter Talent-Marktplatz, der Performer mit Projekten und Branchenchancen verbindet.'
    },
    WhyHow: {
      title: 'Warum & wie',
      subtitle: 'Erfahre, wie 3YESES Talente sichtbar macht und Chancen schafft.'
    }
  },
  'es-ES': {
    Pages: {
      pricing: {
        title: 'Planes de precios',
        subtitle: 'Elige el plan que mejor funcione para ti'
      },
      privacy: {
        title: 'Política de privacidad',
        lastUpdated: 'Última actualización: {date}',
        badge: 'Legal',
        heroTitle: 'Política de',
        heroAccent: 'Privacidad',
        contents: 'Contenido',
        introP1: 'Esta Política de Privacidad explica cómo 3YESES ("Plataforma", "nosotros", "nos", "nuestro") recopila, usa, almacena y protege tus datos personales cuando utilizas nuestro mercado de talento por suscripción en 3yeses.online.',
        introP2: 'Nos comprometemos a proteger tu privacidad y a tratar tus datos personales de conformidad con el RGPD del Reino Unido, la Ley de Protección de Datos de 2018 y, cuando corresponda, el RGPD de la UE.'
      },
      terms: {
        title: 'Términos de servicio',
        lastUpdated: 'Última actualización: {date}',
        badge: 'Legal',
        heroTitle: 'Términos & ',
        heroAccent: 'Condiciones',
        contents: 'Contenido',
        sections: {
          overview: {
            p1: 'Estos Términos y Condiciones ("Términos") rigen el uso de la plataforma 3YESES ("Plataforma", "nosotros", "nos", "nuestro"). Al crear una cuenta o usar cualquier parte de la Plataforma, aceptas estar sujeto a estos Términos.',
            p2: '3YESES es una plataforma donde profesionales creativos — actores, músicos, modelos, bailarines, artistas de voz, fotógrafos, videógrafos, DJs, presentadores, comediantes y otros intérpretes — crean perfiles, suben medios de portafolio (fotos, videos, audio) y se hacen notar. La Plataforma incluye un directorio de talentos con búsqueda, un centro de medios, paneles de análisis y funciones comunitarias como comentarios, likes y compartición de contenido.'
          },
          eligibility: {
            p1: 'Debes tener al menos 13 años para crear una cuenta. Los usuarios de 13 a 17 años requieren el consentimiento de padres o tutores. Los menores de 13 años deben tener una cuenta gestionada por un padre o tutor que registre y administre la cuenta en su nombre.',
            p2: 'Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de toda la actividad de tu cuenta. Infórmanos de inmediato si sospechas un acceso no autorizado.',
            p3: 'Cada persona puede tener sólo una cuenta. Las cuentas duplicadas pueden ser suspendidas sin previo aviso.',
            p4: 'Debes proporcionar información precisa y actualizada durante el registro y mantener tu perfil al día. Los perfiles fraudulentos o engañosos pueden ser eliminados.'
          },
          subscription: {
            p1: 'Se requiere una suscripción activa para usar la Plataforma. Te suscribes durante el proceso de registro. Sin una suscripción activa, no puedes acceder a la Plataforma.',
            plansIntro: 'Ofrecemos un plan — Standard Access — con dos opciones de duración:',
            plans: [
              '6 meses — £10, facturado como suscripción recurrente a través de Stripe.',
              '12 meses — £20, facturado como suscripción recurrente a través de Stripe.'
            ],
            p2: 'Ambos planes incluyen funciones idénticas: cargas ilimitadas de portafolio, personalización completa del perfil, ranking prioritario en búsquedas y análisis completos del panel.'
          },
          content: {
            ownership: 'Mantienes la propiedad total de todo el contenido que subes a la Plataforma. Al subir contenido, otorgas a 3YESES una licencia no exclusiva, mundial y libre de regalías para mostrar, distribuir y promocionar tu contenido en la Plataforma y en materiales de marketing relacionados.',
            permitted: 'Puedes subir imágenes (JPEG, PNG, WebP), videos (MP4, MOV) y archivos de audio (MP3, WAV). Los archivos individuales no deben exceder los 50 MB. También puedes incrustar enlaces de video externos (por ejemplo, YouTube, Vimeo).',
            prohibited: [
              'Es sexualmente explícito, pornográfico o muestra desnudez con fines sexuales.',
              'Contiene violencia, sangre o contenido que representa daño a personas.',
              'Promueve discurso de odio, discriminación o acoso por raza, etnia, religión, género, orientación sexual, discapacidad u otra característica protegida.',
              'Infringe los derechos de propiedad intelectual de otros (derechos de autor, marca registrada, etc.).',
              'Contiene malware, archivos ejecutables o cualquier forma de código malicioso.',
              'Es spam, engañoso o fraudulento.',
              'Representa a menores en contextos inapropiados.'
            ]
          }
        }
      },
      about: {
        title: 'Acerca de 3YESES',
        subtitle: 'Conectando talento con oportunidades'
      }
    },
    SuccessStories: {
      breadcrumb: 'Historias de éxito',
      title: 'Historias de éxito',
      subtitle: 'Descubre los viajes inspiradores de creativos talentosos que encontraron trabajo y visibilidad a través de 3YESES.',
      stories: {
        '0': {
          title: 'Emma Thompson — Músico',
          body: 'Como guitarrista emergente, Emma luchó por hacerse notar en un mercado saturado. Usando las funciones avanzadas de búsqueda de nuestra plataforma, conectó con productores que amaban su sonido único. Esto llevó a colaboraciones en dos sencillos exitosos y una gira con entradas agotadas.'
        },
        '1': {
          title: 'Liam Garcia — Actor',
          body: 'Liam, un actor versátil con pasión por el cine independiente, encontró su gran oportunidad a través de nuestra plataforma. Los directores descubrieron su talento mediante perfiles dirigidos, lo que resultó en papeles en tres películas aclamadas por la crítica y una nominación como mejor actor de reparto.'
        },
        '2': {
          title: 'Sophia Patel — Bailarina',
          body: 'El estilo de danza contemporánea de Sophia llamó la atención de coreógrafos en nuestra plataforma. Desde entonces, se ha presentado en producciones de Broadway, festivales internacionales e incluso ha coreografiado la gira mundial de una conocida artista pop.'
        }
      }
    },
    DashboardMessagesPage: {
      title: 'Mensajes',
      searchPlaceholder: 'Buscar conversaciones...',
      messagePlaceholder: 'Escribe tu mensaje...',
      send: 'Enviar mensaje'
    },
    DashboardSubscriptionPage: {
      title: 'Suscripción',
      subtitle: 'Administra tu Plan Standard Access y tu configuración de pagos',
      cancelSubscription: 'Cancelar suscripción',
      forTalents: 'Para talentos',
      processing: 'Procesando...',
      currentPlan: 'Plan actual',
      subscribe: 'Suscribirse con Stripe',
      securePayment: 'Pago seguro procesado por Stripe',
      questions: '¿Preguntas? Contáctanos en',
      confirmCancel: '¿Estás seguro de que quieres cancelar tu suscripción?',
      cancelSuccess: 'Suscripción cancelada con éxito',
      errors: {
        missingCheckoutUrl: 'No se recibió URL de pago',
        createSubscription: 'Error al crear la suscripción. Por favor, inténtalo de nuevo.',
        cancelSubscription: 'Error al cancelar la suscripción. Por favor, inténtalo de nuevo.'
      }
    },
    AuthRequiredModal: {
      title: 'Inicio de sesión requerido',
      subtitle: 'Tu cuenta desbloquea likes y favoritos de talento.',
      message: 'Necesitas una cuenta para realizar {action}. Continúa para iniciar sesión o crear una cuenta.',
      buttons: {
        notNow: 'Ahora no',
        signIn: 'Iniciar sesión',
        createAccount: 'Crear una cuenta'
      }
    },
    SaveButton: {
      save: 'Guardar talento',
      remove: 'Eliminar de guardados',
      authModal: {
        title: 'Inicia sesión para guardar',
        message: 'Necesitas una cuenta para guardar y marcar perfiles de {talentName}. Continúa para iniciar sesión o crear una cuenta.',
        action: 'guardar perfiles'
      }
    },
    Home: {
      tagline: 'Conectando talento con oportunidades en la industria del entretenimiento.',
      welcome: {
        title: 'Bienvenido a 3YESES',
        description: 'Encuentra el talento perfecto para tu próximo proyecto o descubre oportunidades emocionantes en la industria del entretenimiento.'
      },
      forTalent: {
        title: 'Para talentos',
        description: 'Muestra tus habilidades y encuentra tu próxima gran oportunidad.',
        browse: 'Explorar categorías'
      },
      expertTalent: 'Talento experto',
      expertTalentDescription: 'Acceso a profesionales verificados con trayectoria comprobada',
      qualityAssured: 'Calidad asegurada',
      qualityAssuredDescription: 'Todos los talentos se verifican y validan para tu tranquilidad',
      qualityAssuredDesc: 'Talento de primer nivel para tus proyectos',
      careerGrowth: 'Crecimiento profesional',
      careerGrowthDescription: 'Construye conexiones duraderas y avanza en tu carrera',
      careerGrowthDesc: 'Oportunidades para impulsar tu carrera',
      verifiedTalent: 'Talento verificado',
      verifiedTalentDesc: 'Todos los perfiles son verificados manualmente',
      searchPlaceholder: 'Busca talento, habilidades o categorías...',
      searchButton: 'Buscar',
      allCategories: 'Todas las categorías',
      location: 'Ubicación',
      filters: 'Filtros',
      clearAll: 'Borrar todo',
      applyFilters: 'Aplicar filtros',
      watchEyebrow: 'Mira de qué se trata 3YESES',
      videoSectionSeeThe: 'Ve la',
      videoSectionExperience: 'experiencia 3YESES',
      videoSectionDescription: 'Descubre cómo se seleccionan talentos y cómo los directores encuentran la elección perfecta cada vez.',
      allCategory: 'Todas las {name}'
    },
    Footer: {
      aboutUs: 'Sobre nosotros',
      companyInfo: 'Muestra tu trabajo a una audiencia en vivo — suscríbete para ser visible y crecer mediante vistas, likes, comentarios y compartidos.',
      forTalent: 'Para talento',
      joinAsTalent: 'Únete como talento',
      talentDashboard: 'Panel de talentos',
      browseCategories: 'Explorar categorías',
      pricingPlans: 'Planes de precios',
      howItWorks: 'Cómo funciona',
      successStories: 'Historias de éxito',
      contactUs: 'Contáctanos',
      email: 'contact@3yeses.co.uk',
      phone: '+44 121 123 4567',
      location: 'Birmingham, Reino Unido',
      language: 'Idioma',
      copyright: '© 2026 3YESES. Todos los derechos reservados.',
      privacyPolicy: 'Política de privacidad',
      termsOfService: 'Términos de servicio'
    },
    Meta: {
      title: '3YESES',
      description: '3YESES es un mercado de talento basado en suscripción que conecta a artistas con proyectos y oportunidades de la industria.'
    },
    WhyHow: {
      title: 'Por qué y cómo',
      subtitle: 'Descubre cómo 3YESES hace visibles a los talentos y crea oportunidades.'
    }
  }
};
function deepMerge(target, patch) {
  if (Array.isArray(target) || Array.isArray(patch)) return patch;
  if (typeof target !== 'object' || target === null) return patch;
  const merged = { ...target };
  for (const key of Object.keys(patch)) {
    merged[key] = deepMerge(target[key], patch[key]);
  }
  return merged;
}
for (const [locale, patch] of Object.entries(translations)) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping ${locale}: file not found`);
    continue;
  }
  const current = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const updated = deepMerge(current, patch);
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n', 'utf8');
  console.log(`Patched page content translations for ${locale}`);
}
