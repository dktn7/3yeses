#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const messagesDir = path.join(__dirname, '..', 'messages');
const translations = {
  'de-DE': {
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
      securePayment: 'Sichere Zahlung über Stripe',
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
    }
  },
  'es-ES': {
    DashboardMessagesPage: {
      title: 'Notificaciones',
      searchPlaceholder: 'Buscar conversaciones...',
      messagePlaceholder: 'Escribe tu mensaje...',
      send: 'Enviar mensaje'
    },
    DashboardSubscriptionPage: {
      title: 'Suscripción',
      subtitle: 'Administra tu Plan Standard Access y tus ajustes de pago',
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
      description: '3YESES es un marketplace de talento basado en suscripción que conecta artistas con proyectos y oportunidades de la industria.'
    },
    WhyHow: {
      title: 'Por qué y cómo',
      subtitle: 'Descubre cómo 3YESES hace visibles a los talentos y crea oportunidades.'
    },
    SuccessStories: {
      breadcrumb: 'Historias de éxito',
      title: 'Historias de éxito',
      subtitle: 'Descubre los viajes inspiradores de creativos talentosos que encontraron trabajo y visibilidad a través de 3YESES.',
      stories: {
        '0': {
          title: 'Emma Thompson — Música',
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
    }
  },
  'fr-FR': {
    DashboardMessagesPage: {
      title: 'Messages',
      searchPlaceholder: 'Rechercher des conversations...',
      messagePlaceholder: 'Tapez votre message...',
      send: 'Envoyer le message'
    },
    DashboardSubscriptionPage: {
      title: 'Abonnement',
      subtitle: 'Gérez votre plan Standard Access et vos paramètres de paiement',
      cancelSubscription: 'Annuler l’abonnement',
      forTalents: 'Pour les talents',
      processing: 'Traitement...',
      currentPlan: 'Plan actuel',
      subscribe: 'S’abonner avec Stripe',
      securePayment: 'Paiement sécurisé par Stripe',
      questions: 'Des questions ? Contactez-nous à',
      confirmCancel: 'Êtes-vous sûr de vouloir annuler votre abonnement ?',
      cancelSuccess: 'Abonnement annulé avec succès',
      errors: {
        missingCheckoutUrl: 'Aucune URL de paiement reçue',
        createSubscription: 'Échec de la création de l’abonnement. Veuillez réessayer.',
        cancelSubscription: 'Échec de l’annulation de l’abonnement. Veuillez réessayer.'
      }
    },
    AuthRequiredModal: {
      title: 'Connexion requise',
      subtitle: 'Votre compte débloque les likes et favoris de talents.',
      message: 'Vous avez besoin d’un compte pour effectuer {action}. Continuez pour vous connecter ou créer un compte.',
      buttons: {
        notNow: 'Pas maintenant',
        signIn: 'Se connecter',
        createAccount: 'Créer un compte'
      }
    },
    SaveButton: {
      save: 'Enregistrer le talent',
      remove: 'Retirer des enregistrés',
      authModal: {
        title: 'Connectez-vous pour enregistrer',
        message: 'Vous avez besoin d’un compte pour enregistrer et ajouter aux favoris les profils de {talentName}. Continuez pour vous connecter ou créer un compte.',
        action: 'enregistrer des profils'
      }
    },
    Home: {
      tagline: 'Connecter le talent aux opportunités dans l’industrie du divertissement.',
      welcome: {
        title: 'Bienvenue sur 3YESES',
        description: 'Trouvez le talent idéal pour votre prochain projet ou découvrez des opportunités passionnantes dans l’industrie du divertissement.'
      },
      forTalent: {
        title: 'Pour les talents',
        description: 'Mettez vos compétences en valeur et trouvez votre prochaine grande opportunité.',
        browse: 'Parcourir les catégories'
      },
      expertTalent: 'Talent expert',
      expertTalentDescription: 'Accès à des professionnels vérifiés et expérimentés',
      qualityAssured: 'Qualité assurée',
      qualityAssuredDescription: 'Tous les talents sont vérifiés manuellement pour votre tranquillité d’esprit',
      qualityAssuredDesc: 'Des talents de premier plan pour vos projets',
      careerGrowth: 'Développement de carrière',
      careerGrowthDescription: 'Créez des liens durables et progressez dans votre carrière',
      careerGrowthDesc: 'Des opportunités pour faire évoluer votre carrière',
      verifiedTalent: 'Talent vérifié',
      verifiedTalentDesc: 'Tous les profils sont vérifiés manuellement',
      searchPlaceholder: 'Recherchez un talent, des compétences ou des catégories...',
      searchButton: 'Rechercher',
      allCategories: 'Toutes les catégories',
      location: 'Emplacement',
      filters: 'Filtres',
      clearAll: 'Tout effacer',
      applyFilters: 'Appliquer des filtres',
      watchEyebrow: 'Découvrez ce qu’est 3YESES',
      videoSectionSeeThe: 'Découvrez',
      videoSectionExperience: 'l’expérience 3YESES',
      videoSectionDescription: 'Découvrez comment les talents sont castés et comment les réalisateurs trouvent le bon choix à chaque fois.',
      allCategory: 'Tous les {name}'
    },
    Footer: {
      aboutUs: 'À propos de nous',
      companyInfo: 'Présentez votre travail à un public en direct — abonnez-vous pour être visible et grandir grâce aux vues, likes, commentaires et partages.',
      forTalent: 'Pour les talents',
      joinAsTalent: 'Rejoindre en tant que talent',
      talentDashboard: 'Tableau de bord des talents',
      browseCategories: 'Parcourir les catégories',
      pricingPlans: 'Plans tarifaires',
      howItWorks: 'Comment ça marche',
      successStories: 'Histoires de réussite',
      contactUs: 'Contactez-nous',
      email: 'contact@3yeses.co.uk',
      phone: '+44 121 123 4567',
      location: 'Birmingham, Royaume-Uni',
      language: 'Langue',
      copyright: '© 2026 3YESES. Tous droits réservés.',
      privacyPolicy: 'Politique de confidentialité',
      termsOfService: 'Conditions d’utilisation'
    },
    Meta: {
      title: '3YESES',
      description: '3YESES est un marché de talents par abonnement qui connecte des artistes avec des projets et des opportunités dans l’industrie.'
    },
    WhyHow: {
      title: 'Pourquoi & comment',
      subtitle: 'Découvrez comment 3YESES rend les talents visibles et crée des opportunités.'
    },
    SuccessStories: {
      breadcrumb: 'Histoires de réussite',
      title: 'Histoires de réussite',
      subtitle: 'Découvrez les parcours inspirants de créatifs talentueux qui ont trouvé du travail et de la visibilité grâce à 3YESES.',
      stories: {
        '0': {
          title: 'Emma Thompson — Musicienne',
          body: 'En tant que guitariste montante, Emma avait du mal à se faire remarquer dans un marché saturé. En utilisant les fonctions de recherche avancées de notre plateforme, elle s’est connectée avec des producteurs qui adoraient son son unique. Cela a conduit à des collaborations sur deux singles à succès et une tournée complète.'
        },
        '1': {
          title: 'Liam Garcia — Acteur',
          body: 'Liam, un acteur polyvalent passionné par le cinéma indépendant, a trouvé sa grande opportunité grâce à notre plateforme. Les réalisateurs ont découvert son talent via des profils ciblés, ce qui lui a valu des rôles dans trois films acclamés par la critique et une nomination au meilleur acteur dans un second rôle.'
        },
        '2': {
          title: 'Sophia Patel — Danseuse',
          body: 'Le style de danse contemporaine de Sophia a attiré l’attention des chorégraphes sur notre plateforme. Depuis, elle a joué dans des productions de Broadway, des festivals internationaux et a même chorégraphié une tournée mondiale pour une artiste pop majeure.'
        }
      }
    }
  },
  'it-IT': {
    DashboardMessagesPage: {
      title: 'Messaggi',
      searchPlaceholder: 'Cerca conversazioni...',
      messagePlaceholder: 'Scrivi il tuo messaggio...',
      send: 'Invia messaggio'
    },
    DashboardSubscriptionPage: {
      title: 'Abbonamento',
      subtitle: 'Gestisci il tuo piano Standard Access e le impostazioni di pagamento',
      cancelSubscription: 'Annulla abbonamento',
      forTalents: 'Per i talenti',
      processing: 'Elaborazione in corso...',
      currentPlan: 'Piano attuale',
      subscribe: 'Abbonati con Stripe',
      securePayment: 'Pagamento sicuro gestito da Stripe',
      questions: 'Domande? Contattaci a',
      confirmCancel: 'Sei sicuro di voler annullare il tuo abbonamento?',
      cancelSuccess: 'Abbonamento annullato con successo',
      errors: {
        missingCheckoutUrl: 'Nessuna URL di checkout ricevuta',
        createSubscription: 'Impossibile creare l’abbonamento. Riprova.',
        cancelSubscription: 'Impossibile annullare l’abbonamento. Riprova.'
      }
    },
    AuthRequiredModal: {
      title: 'Accesso richiesto',
      subtitle: 'Il tuo account sblocca like e preferiti dei talenti.',
      message: 'Hai bisogno di un account per eseguire {action}. Continua per accedere o creare un account.',
      buttons: {
        notNow: 'Non ora',
        signIn: 'Accedi',
        createAccount: 'Crea un account'
      }
    },
    SaveButton: {
      save: 'Salva talento',
      remove: 'Rimuovi dai salvati',
      authModal: {
        title: 'Accedi per salvare',
        message: 'Hai bisogno di un account per salvare e aggiungere ai preferiti i profili di {talentName}. Continua per accedere o creare un account.',
        action: 'salvare profili'
      }
    },
    Home: {
      tagline: 'Connettere talento e opportunità nell’industria dell’intrattenimento.',
      welcome: {
        title: 'Benvenuto su 3YESES',
        description: 'Trova il talento perfetto per il tuo prossimo progetto o scopri opportunità emozionanti nell’industria dell’intrattenimento.'
      },
      forTalent: {
        title: 'Per i talenti',
        description: 'Mostra le tue capacità e trova la tua prossima grande opportunità.',
        browse: 'Esplora le categorie'
      },
      expertTalent: 'Talento esperto',
      expertTalentDescription: 'Accesso a professionisti verificati con esperienza comprovata',
      qualityAssured: 'Qualità garantita',
      qualityAssuredDescription: 'Tutti i talenti sono verificati manualmente per la tua tranquillità',
      qualityAssuredDesc: 'Talenti di alto livello per i tuoi progetti',
      careerGrowth: 'Crescita professionale',
      careerGrowthDescription: 'Costruisci connessioni durature e fai avanzare la tua carriera',
      careerGrowthDesc: 'Opportunità per far crescere la tua carriera',
      verifiedTalent: 'Talento verificato',
      verifiedTalentDesc: 'Tutti i profili sono verificati manualmente',
      searchPlaceholder: 'Cerca talento, competenze o categorie...',
      searchButton: 'Cerca',
      allCategories: 'Tutte le categorie',
      location: 'Posizione',
      filters: 'Filtri',
      clearAll: 'Cancella tutto',
      applyFilters: 'Applica filtri',
      watchEyebrow: 'Guarda di cosa tratta 3YESES',
      videoSectionSeeThe: 'Guarda',
      videoSectionExperience: 'l’esperienza 3YESES',
      videoSectionDescription: 'Scopri come i talenti vengono scelti e come i registi trovano la scelta perfetta ogni volta.',
      allCategory: 'Tutte le {name}'
    },
    Footer: {
      aboutUs: 'Chi siamo',
      companyInfo: 'Metti in mostra il tuo lavoro a un pubblico live — iscriviti per essere visibile e crescere grazie a visualizzazioni, like, commenti e condivisioni.',
      forTalent: 'Per i talenti',
      joinAsTalent: 'Unisciti come talento',
      talentDashboard: 'Dashboard talento',
      browseCategories: 'Esplora categorie',
      pricingPlans: 'Piani tariffari',
      howItWorks: 'Come funziona',
      successStories: 'Storie di successo',
      contactUs: 'Contattaci',
      email: 'contact@3yeses.co.uk',
      phone: '+44 121 123 4567',
      location: 'Birmingham, Regno Unito',
      language: 'Lingua',
      copyright: '© 2026 3YESES. Tutti i diritti riservati.',
      privacyPolicy: 'Informativa sulla privacy',
      termsOfService: 'Termini di servizio'
    },
    Meta: {
      title: '3YESES',
      description: '3YESES è un marketplace di talenti in abbonamento che connette performer con progetti e opportunità nel settore.'
    },
    WhyHow: {
      title: 'Perché e come',
      subtitle: 'Scopri come 3YESES rende i talenti visibili e crea opportunità.'
    },
    SuccessStories: {
      breadcrumb: 'Storie di successo',
      title: 'Storie di successo',
      subtitle: 'Scopri i viaggi ispiratori di creativi talentuosi che hanno trovato lavoro e visibilità tramite 3YESES.',
      stories: {
        '0': {
          title: 'Emma Thompson — Musicista',
          body: 'Come chitarrista emergente, Emma ha faticato a farsi notare in un mercato saturo. Usando le funzioni di ricerca avanzate della nostra piattaforma, si è collegata con produttori che amavano il suo suono unico. Questo ha portato a collaborazioni su due singoli di successo e a un tour con biglietti esauriti.'
        },
        '1': {
          title: 'Liam Garcia — Attore',
          body: 'Liam, un attore versatile con una passione per i film indipendenti, ha trovato la sua grande occasione tramite la nostra piattaforma. I registi hanno scoperto il suo talento tramite profili mirati, portandolo a ruoli in tre film acclamati dalla critica e a una nomination come miglior attore non protagonista.'
        },
        '2': {
          title: 'Sophia Patel — Ballerina',
          body: 'Lo stile di danza contemporanea di Sophia ha attirato l’attenzione dei coreografi sulla nostra piattaforma. Da allora si è esibita in produzioni di Broadway, festival internazionali e ha persino coreografato un tour mondiale per una grande artista pop.'
        }
      }
    }
  },
  'pt-PT': {
    DashboardMessagesPage: {
      title: 'Mensagens',
      searchPlaceholder: 'Procurar conversas...',
      messagePlaceholder: 'Escreva a sua mensagem...',
      send: 'Enviar mensagem'
    },
    DashboardSubscriptionPage: {
      title: 'Assinatura',
      subtitle: 'Gerir o seu plano Standard Access e definições de pagamento',
      cancelSubscription: 'Cancelar assinatura',
      forTalents: 'Para talentos',
      processing: 'A processar...',
      currentPlan: 'Plano atual',
      subscribe: 'Subscrever com Stripe',
      securePayment: 'Pagamento seguro processado pela Stripe',
      questions: 'Perguntas? Contacte-nos em',
      confirmCancel: 'Tem a certeza de que deseja cancelar a sua assinatura?',
      cancelSuccess: 'Assinatura cancelada com sucesso',
      errors: {
        missingCheckoutUrl: 'Nenhuma URL de pagamento recebida',
        createSubscription: 'Falha ao criar assinatura. Por favor, tente novamente.',
        cancelSubscription: 'Falha ao cancelar assinatura. Por favor, tente novamente.'
      }
    },
    AuthRequiredModal: {
      title: 'Início de sessão necessário',
      subtitle: 'A sua conta desbloqueia likes e favoritos de talento.',
      message: 'Precisa de uma conta para efetuar {action}. Continue para iniciar sessão ou criar uma conta.',
      buttons: {
        notNow: 'Agora não',
        signIn: 'Iniciar sessão',
        createAccount: 'Criar conta'
      }
    },
    SaveButton: {
      save: 'Guardar talento',
      remove: 'Remover de guardados',
      authModal: {
        title: 'Inicie sessão para guardar',
        message: 'Precisa de uma conta para guardar e marcar perfis de {talentName}. Continue para iniciar sessão ou criar uma conta.',
        action: 'guardar perfis'
      }
    },
    Home: {
      tagline: 'A ligar talento a oportunidades na indústria do entretenimento.',
      welcome: {
        title: 'Bem-vindo ao 3YESES',
        description: 'Encontre o talento perfeito para o seu próximo projeto ou descubra oportunidades emocionantes na indústria do entretenimento.'
      },
      forTalent: {
        title: 'Para talentos',
        description: 'Mostre as suas competências e encontre a sua próxima grande oportunidade.',
        browse: 'Explorar categorias'
      },
      expertTalent: 'Talento especializado',
      expertTalentDescription: 'Acesso a profissionais verificados com experiência comprovada',
      qualityAssured: 'Qualidade garantida',
      qualityAssuredDescription: 'Todos os talentos são verificados manualmente para a sua tranquilidade',
      qualityAssuredDesc: 'Talento de topo para os seus projetos',
      careerGrowth: 'Crescimento de carreira',
      careerGrowthDescription: 'Construa ligações duradouras e avance na sua carreira',
      careerGrowthDesc: 'Oportunidades para impulsionar a sua carreira',
      verifiedTalent: 'Talento verificado',
      verifiedTalentDesc: 'Todos os perfis são verificados manualmente',
      searchPlaceholder: 'Procure talento, competências ou categorias...',
      searchButton: 'Procurar',
      allCategories: 'Todas as categorias',
      location: 'Localização',
      filters: 'Filtros',
      clearAll: 'Limpar tudo',
      applyFilters: 'Aplicar filtros',
      watchEyebrow: 'Veja do que trata o 3YESES',
      videoSectionSeeThe: 'Veja a',
      videoSectionExperience: 'experiência 3YESES',
      videoSectionDescription: 'Descubra como os talentos são escolhidos e como os diretores encontram a escolha perfeita em cada ocasião.',
      allCategory: 'Todas as {name}'
    },
    Footer: {
      aboutUs: 'Sobre nós',
      companyInfo: 'Mostre o seu trabalho a uma audiência ao vivo — subscreva para ser visível e crescer através de visualizações, likes, comentários e partilhas.',
      forTalent: 'Para talentos',
      joinAsTalent: 'Junte-se como talento',
      talentDashboard: 'Painel de talentos',
      browseCategories: 'Explorar categorias',
      pricingPlans: 'Planos de preços',
      howItWorks: 'Como funciona',
      successStories: 'Histórias de sucesso',
      contactUs: 'Contacte-nos',
      email: 'contact@3yeses.co.uk',
      phone: '+44 121 123 4567',
      location: 'Birmingham, Reino Unido',
      language: 'Idioma',
      copyright: '© 2026 3YESES. Todos os direitos reservados.',
      privacyPolicy: 'Política de privacidade',
      termsOfService: 'Termos de serviço'
    },
    Meta: {
      title: '3YESES',
      description: '3YESES é um mercado de talentos por assinatura que conecta artistas a projetos e oportunidades no setor.'
    },
    WhyHow: {
      title: 'Porquê e como',
      subtitle: 'Descubra como o 3YESES torna os talentos visíveis e cria oportunidades.'
    },
    SuccessStories: {
      breadcrumb: 'Histórias de sucesso',
      title: 'Histórias de sucesso',
      subtitle: 'Descubra as jornadas inspiradoras de criativos talentosos que encontraram trabalho e visibilidade através do 3YESES.',
      stories: {
        '0': {
          title: 'Emma Thompson — Músico',
          body: 'Como guitarrista em ascensão, Emma lutou para ser notada em um mercado lotado. Usando os recursos avançados de pesquisa da nossa plataforma, ela se conectou com produtores que amavam seu som único. Isso levou a colaborações em dois singles de sucesso e uma turnê esgotada.'
        },
        '1': {
          title: 'Liam Garcia — Actor',
          body: 'Liam, um ator versátil apaixonado por filmes independentes, encontrou seu grande momento através da nossa plataforma. Diretores descobriram seu talento por meio de perfis direcionados, resultando em papéis em três filmes aclamados pela crítica e em uma indicação ao prêmio de melhor ator coadjuvante.'
        },
        '2': {
          title: 'Sophia Patel — Bailarina',
          body: 'O estilo de dança contemporânea de Sophia chamou a atenção de coreógrafos em nossa plataforma. Desde então, ela se apresentou em produções da Broadway, festivais internacionais e até coreografou uma turnê mundial para uma grande artista pop.'
        }
      }
    }
  },
  'ru-RU': {
    DashboardMessagesPage: {
      title: 'Сообщения',
      searchPlaceholder: 'Поиск по перепискам...',
      messagePlaceholder: 'Введите сообщение...',
      send: 'Отправить сообщение'
    },
    DashboardSubscriptionPage: {
      title: 'Подписка',
      subtitle: 'Управляйте своим планом Standard Access и платежными настройками',
      cancelSubscription: 'Отменить подписку',
      forTalents: 'Для талантов',
      processing: 'Обработка...',
      currentPlan: 'Текущий план',
      subscribe: 'Подписаться через Stripe',
      securePayment: 'Безопасная оплата Stripe',
      questions: 'Вопросы? Свяжитесь с нами по адресу',
      confirmCancel: 'Вы уверены, что хотите отменить подписку?',
      cancelSuccess: 'Подписка успешно отменена',
      errors: {
        missingCheckoutUrl: 'Не получена ссылка оплаты',
        createSubscription: 'Не удалось создать подписку. Пожалуйста, попробуйте снова.',
        cancelSubscription: 'Не удалось отменить подписку. Пожалуйста, попробуйте снова.'
      }
    },
    AuthRequiredModal: {
      title: 'Требуется вход',
      subtitle: 'Ваша учетная запись открывает лайки и избранное талантов.',
      message: 'Вам нужна учетная запись, чтобы выполнить {action}. Продолжите, чтобы войти или создать аккаунт.',
      buttons: {
        notNow: 'Не сейчас',
        signIn: 'Войти',
        createAccount: 'Создать аккаунт'
      }
    },
    SaveButton: {
      save: 'Сохранить талант',
      remove: 'Удалить из сохраненных',
      authModal: {
        title: 'Войдите, чтобы сохранить',
        message: 'Вам нужна учетная запись, чтобы сохранять и отмечать профили {talentName}. Продолжите, чтобы войти или создать учетную запись.',
        action: 'сохранять профили'
      }
    },
    Home: {
      tagline: 'Соединяя таланты с возможностями в индустрии развлечений.',
      welcome: {
        title: 'Добро пожаловать в 3YESES',
        description: 'Найдите идеальный талант для вашего следующего проекта или откройте захватывающие возможности в индустрии развлечений.'
      },
      forTalent: {
        title: 'Для талантов',
        description: 'Покажите свои навыки и найдите вашу следующую большую возможность.',
        browse: 'Просмотреть категории'
      },
      expertTalent: 'Профессиональные таланты',
      expertTalentDescription: 'Доступ к проверенным профессионалам с доказанным опытом',
      qualityAssured: 'Гарантированное качество',
      qualityAssuredDescription: 'Все таланты проверяются вручную для вашего спокойствия',
      qualityAssuredDesc: 'Топ-таланты для ваших проектов',
      careerGrowth: 'Рост карьеры',
      careerGrowthDescription: 'Стройте прочные связи и развивайте карьеру',
      careerGrowthDesc: 'Возможности для продвижения карьеры',
      verifiedTalent: 'Проверенный талант',
      verifiedTalentDesc: 'Все профили проверяются вручную',
      searchPlaceholder: 'Ищите таланты, навыки или категории...',
      searchButton: 'Поиск',
      allCategories: 'Все категории',
      location: 'Местоположение',
      filters: 'Фильтры',
      clearAll: 'Очистить всё',
      applyFilters: 'Применить фильтры',
      watchEyebrow: 'Посмотрите, что такое 3YESES',
      videoSectionSeeThe: 'Посмотрите',
      videoSectionExperience: 'опыт 3YESES',
      videoSectionDescription: 'Узнайте, как таланты находят кастинги и как режиссеры выбирают идеальных кандидатов каждый раз.',
      allCategory: 'Все {name}'
    },
    Footer: {
      aboutUs: 'О нас',
      companyInfo: 'Демонстрируйте свою работу живой аудитории — подпишитесь, чтобы быть заметным и расти через просмотры, лайки, комментарии и репосты.',
      forTalent: 'Для талантов',
      joinAsTalent: 'Присоединяйтесь как талант',
      talentDashboard: 'Панель талантов',
      browseCategories: 'Просмотреть категории',
      pricingPlans: 'Планы ценообразования',
      howItWorks: 'Как это работает',
      successStories: 'Истории успеха',
      contactUs: 'Свяжитесь с нами',
      email: 'contact@3yeses.co.uk',
      phone: '+44 121 123 4567',
      location: 'Бирмингем, Великобритания',
      language: 'Язык',
      copyright: '© 2026 3YESES. Все права защищены.',
      privacyPolicy: 'Политика конфиденциальности',
      termsOfService: 'Условия обслуживания'
    },
    Meta: {
      title: '3YESES',
      description: '3YESES — это рынок талантов по подписке, который соединяет исполнителей с проектами и возможностями в индустрии.'
    },
    WhyHow: {
      title: 'Почему и как',
      subtitle: 'Узнайте, как 3YESES делает таланты видимыми и создает возможности.'
    },
    SuccessStories: {
      breadcrumb: 'Истории успеха',
      title: 'Истории успеха',
      subtitle: 'Откройте вдохновляющие истории талантливых креативщиков, которые нашли работу и внимание благодаря 3YESES.',
      stories: {
        '0': {
          title: 'Эмма Томпсон — музыкант',
          body: 'Как начинающая гитаристка, Эмма не могла пробиться на переполненном рынке. Используя расширенный поиск на нашей платформе, она связалась с продюсерами, которым понравился ее уникальный звук. Это привело к сотрудничеству над двумя хитами и аншлаговому туру.'
        },
        '1': {
          title: 'Лиам Гарсия — актер',
          body: 'Лиам, многосторонний актер, увлеченный инди-фильмами, нашел свой большой прорыв через нашу платформу. Режиссеры обнаружили его талант через целевые профили, что привело к ролям в трех отмеченных критиками фильмах и номинации на лучшую мужскую роль второго плана.'
        },
        '2': {
          title: 'София Пател — танцовщица',
          body: 'Современный стиль танца Софии привлек внимание хореографов на нашей платформе. С тех пор она выступала на бродвейских постановках, международных фестивалях и даже поставила хореографию для мирового турне известной поп-исполнительницы.'
        }
      }
    }
  },
  'ja-JP': {
    DashboardMessagesPage: {
      title: 'メッセージ',
      searchPlaceholder: '会話を検索...',
      messagePlaceholder: 'メッセージを入力...',
      send: 'メッセージを送信'
    },
    DashboardSubscriptionPage: {
      title: 'サブスクリプション',
      subtitle: 'Standard Access プランと支払い設定を管理する',
      cancelSubscription: 'サブスクリプションをキャンセル',
      forTalents: 'タレント向け',
      processing: '処理中...',
      currentPlan: '現在のプラン',
      subscribe: 'Stripe で申し込む',
      securePayment: 'Stripe による安全な支払い',
      questions: 'ご質問は？お問い合わせ先',
      confirmCancel: '本当にサブスクリプションをキャンセルしますか？',
      cancelSuccess: 'サブスクリプションのキャンセルに成功しました',
      errors: {
        missingCheckoutUrl: 'チェックアウトURLが受信されませんでした',
        createSubscription: 'サブスクリプションの作成に失敗しました。再試行してください。',
        cancelSubscription: 'サブスクリプションのキャンセルに失敗しました。再試行してください。'
      }
    },
    AuthRequiredModal: {
      title: 'サインインが必要です',
      subtitle: 'あなたのアカウントはタレントのいいねとお気に入りを解除します。',
      message: '{action} を実行するにはアカウントが必要です。サインインするかアカウントを作成してください。',
      buttons: {
        notNow: '今はしない',
        signIn: 'サインイン',
        createAccount: 'アカウントを作成'
      }
    },
    SaveButton: {
      save: 'タレントを保存',
      remove: '保存から削除',
      authModal: {
        title: '保存するにはサインインしてください',
        message: '{talentName} のプロフィールを保存およびブックマークするにはアカウントが必要です。サインインするかアカウントを作成してください。',
        action: 'プロフィールを保存'
      }
    },
    Home: {
      tagline: 'エンターテインメント業界で才能と機会をつなぐ。',
      welcome: {
        title: '3YESESへようこそ',
        description: '次のプロジェクトにぴったりのタレントを見つけるか、エンタメ業界の刺激的な機会を発見しましょう。'
      },
      forTalent: {
        title: 'タレント向け',
        description: 'あなたのスキルを披露し、次の大きなチャンスを見つけましょう。',
        browse: 'カテゴリを探す'
      },
      expertTalent: 'エキスパートタレント',
      expertTalentDescription: '実績あるプロフェッショナルへのアクセス',
      qualityAssured: '品質保証',
      qualityAssuredDescription: 'すべてのタレントは安心のために審査・認証されています',
      qualityAssuredDesc: 'あなたのプロジェクトのためのトップタレント',
      careerGrowth: 'キャリア成長',
      careerGrowthDescription: '長期的なつながりを築き、キャリアを前進させる',
      careerGrowthDesc: 'キャリアを伸ばすチャンス',
      verifiedTalent: '認証タレント',
      verifiedTalentDesc: 'すべてのプロフィールは手動で確認されています',
      searchPlaceholder: 'タレント、スキル、カテゴリを検索...',
      searchButton: '検索',
      allCategories: 'すべてのカテゴリ',
      location: '場所',
      filters: 'フィルター',
      clearAll: 'すべてクリア',
      applyFilters: 'フィルターを適用',
      watchEyebrow: '3YESESの内容を見てみよう',
      videoSectionSeeThe: '見る',
      videoSectionExperience: '3YESES体験',
      videoSectionDescription: 'タレントがどのようにキャスティングされ、キャスティングディレクターが毎回完璧な人材を見つけるのかをご紹介します。',
      allCategory: 'すべての{name}'
    },
    Footer: {
      aboutUs: '私たちについて',
      companyInfo: 'ライブオーディエンスにあなたの仕事を披露しましょう — 見つけられるように登録し、閲覧、いいね、コメント、共有で成長しましょう。',
      forTalent: 'タレント向け',
      joinAsTalent: 'タレントとして参加',
      talentDashboard: 'タレントダッシュボード',
      browseCategories: 'カテゴリを探す',
      pricingPlans: '料金プラン',
      howItWorks: '使い方',
      successStories: '成功事例',
      contactUs: 'お問い合わせ',
      email: 'contact@3yeses.co.uk',
      phone: '+44 121 123 4567',
      location: 'バーミンガム、英国',
      language: '言語',
      copyright: '© 2026 3YESES. 無断転載禁止。',
      privacyPolicy: 'プライバシーポリシー',
      termsOfService: '利用規約'
    },
    Meta: {
      title: '3YESES',
      description: '3YESESは、サブスクリプションベースのタレントマーケットプレイスで、パフォーマーをプロジェクトや業界の機会と結びつけます。'
    },
    WhyHow: {
      title: 'なぜ & どうやって',
      subtitle: '3YESESがタレントをどのように可視化し、機会を生み出すかをご覧ください。'
    },
    SuccessStories: {
      breadcrumb: '成功事例',
      title: '成功事例',
      subtitle: '3YESESを通じて仕事と可視性を得た才能あるクリエイターの感動的な旅を発見してください。',
      stories: {
        '0': {
          title: 'エマ・トンプソン — ミュージシャン',
          body: '注目のギタリストとして、市場が飽和する中でエマは目立つのに苦労していました。当社プラットフォームの高度な検索機能を活用して、彼女のユニークなサウンドを気に入ったプロデューサーとつながりました。これにより2つのヒットシングルでのコラボレーションと完売ツアーにつながりました。'
        },
        '1': {
          title: 'リアム・ガルシア — 俳優',
          body: 'インディペンデント映画に情熱を持つ多才な俳優リアムは、当社プラットフォームを通じて大きなチャンスをつかみました。監督はターゲットを絞ったプロフィールから彼の才能を見いだし、批評家に称賛された3本の映画での役と助演男優賞へのノミネートにつながりました。'
        },
        '2': {
          title: 'ソフィア・パテル — ダンサー',
          body: 'ソフィアのコンテンポラリーダンススタイルは当社プラットフォームの振付師の目に留まりました。それ以来、ブロードウェイ公演や国際フェスティバルに出演し、主要なポップアーティストのワールドツアーの振付も手がけました。'
        }
      }
    }
  },
  'zh-CN': {
    DashboardMessagesPage: {
      title: '消息',
      searchPlaceholder: '搜索会话...',
      messagePlaceholder: '输入您的消息...',
      send: '发送消息'
    },
    DashboardSubscriptionPage: {
      title: '订阅',
      subtitle: '管理您的 Standard Access 计划和支付设置',
      cancelSubscription: '取消订阅',
      forTalents: '面向人才',
      processing: '处理中...',
      currentPlan: '当前计划',
      subscribe: '使用 Stripe 订阅',
      securePayment: 'Stripe 安全支付',
      questions: '有问题？联系我们：',
      confirmCancel: '您确定要取消订阅吗？',
      cancelSuccess: '订阅已成功取消',
      errors: {
        missingCheckoutUrl: '未收到结账链接',
        createSubscription: '创建订阅失败。请重试。',
        cancelSubscription: '取消订阅失败。请重试。'
      }
    },
    AuthRequiredModal: {
      title: '需要登录',
      subtitle: '您的账户可解锁人才点赞和收藏。',
      message: '您需要一个账户来执行 {action}。继续登录或创建一个账户。',
      buttons: {
        notNow: '先不要',
        signIn: '登录',
        createAccount: '创建账户'
      }
    },
    SaveButton: {
      save: '保存人才',
      remove: '从已保存中移除',
      authModal: {
        title: '登录后可保存',
        message: '您需要一个账户才能保存并收藏 {talentName} 的个人资料。继续登录或创建一个账户。',
        action: '保存个人资料'
      }
    },
    Home: {
      tagline: '在娱乐行业连接人才与机会。',
      welcome: {
        title: '欢迎来到 3YESES',
        description: '为您的下一个项目找到完美的人才，或发现娱乐行业令人兴奋的机会。'
      },
      forTalent: {
        title: '面向人才',
        description: '展示你的技能，找到你的下一个重大机会。',
        browse: '浏览分类'
      },
      expertTalent: '专业人才',
      expertTalentDescription: '访问经过验证且经验丰富的专业人士',
      qualityAssured: '品质保障',
      qualityAssuredDescription: '所有人才均经过人工审核验证，保障您的安心',
      qualityAssuredDesc: '为您的项目提供顶级人才',
      careerGrowth: '职业成长',
      careerGrowthDescription: '建立长期联系，推动职业发展',
      careerGrowthDesc: '推动职业发展的机会',
      verifiedTalent: '认证人才',
      verifiedTalentDesc: '所有个人资料均经过人工验证',
      searchPlaceholder: '搜索人才、技能或分类...',
      searchButton: '搜索',
      allCategories: '全部分类',
      location: '地点',
      filters: '筛选',
      clearAll: '全部清除',
      applyFilters: '应用筛选',
      watchEyebrow: '观看 3YESES 的内容',
      videoSectionSeeThe: '查看',
      videoSectionExperience: '3YESES 体验',
      videoSectionDescription: '了解人才如何被选中，以及选角导演如何每次都找到完美人选。',
      allCategory: '全部 {name}'
    },
    Footer: {
      aboutUs: '关于我们',
      companyInfo: '向实时观众展示你的作品 —— 订阅后即可被发现，并通过浏览、点赞、评论和分享成长。',
      forTalent: '面向人才',
      joinAsTalent: '以人才身份加入',
      talentDashboard: '人才仪表盘',
      browseCategories: '浏览分类',
      pricingPlans: '定价方案',
      howItWorks: '如何运作',
      successStories: '成功故事',
      contactUs: '联系我们',
      email: 'contact@3yeses.co.uk',
      phone: '+44 121 123 4567',
      location: '英国伯明翰',
      language: '语言',
      copyright: '© 2026 3YESES。保留所有权利。',
      privacyPolicy: '隐私政策',
      termsOfService: '服务条款'
    },
    Meta: {
      title: '3YESES',
      description: '3YESES 是一个基于订阅的才艺市场，将表演者与项目和行业机会连接起来。'
    },
    WhyHow: {
      title: '为什么与如何',
      subtitle: '了解 3YESES 如何让人才更具可见性并创造机会。'
    },
    SuccessStories: {
      breadcrumb: '成功故事',
      title: '成功故事',
      subtitle: '探索通过 3YESES 找到工作和可见性的才华创作者的励志旅程。',
      stories: {
        '0': {
          title: 'Emma Thompson — 音乐人',
          body: '作为一名崭露头角的吉他手，Emma 在竞争激烈的市场中很难被注意到。使用我们平台的高级搜索功能，她与喜欢她独特声音的制作人建立了联系。这导致了两首热门单曲的合作和一场销售一空的巡演。'
        },
        '1': {
          title: 'Liam Garcia — 演员',
          body: 'Liam 是一位热爱独立电影的多才演员，通过我们的平台找到了他的重大机会。导演通过目标明确的个人资料发现了他的才华，结果他出演了三部备受好评的电影，并获得了最佳男配角提名。'
        },
        '2': {
          title: 'Sophia Patel — 舞者',
          body: 'Sophia 的现代舞风格吸引了我们平台上的编舞师。从那时起，她曾在百老汇制作和国际节日上演出，甚至为一位知名流行歌手的世界巡演编舞。'
        }
      }
    }
  },
  'ar': {
    DashboardMessagesPage: {
      title: 'الرسائل',
      searchPlaceholder: 'ابحث في المحادثات...',
      messagePlaceholder: 'اكتب رسالتك...',
      send: 'إرسال رسالة'
    },
    DashboardSubscriptionPage: {
      title: 'الاشتراك',
      subtitle: 'قم بإدارة خطة Standard Access الخاصة بك وإعدادات الدفع',
      cancelSubscription: 'إلغاء الاشتراك',
      forTalents: 'للموهوبين',
      processing: 'جاري المعالجة...',
      currentPlan: 'الخطة الحالية',
      subscribe: 'اشترك عبر Stripe',
      securePayment: 'الدفع الآمن عبر Stripe',
      questions: 'أسئلة؟ اتصل بنا على',
      confirmCancel: 'هل أنت متأكد أنك تريد إلغاء اشتراكك؟',
      cancelSuccess: 'تم إلغاء الاشتراك بنجاح',
      errors: {
        missingCheckoutUrl: 'لم يتم استلام رابط الدفع',
        createSubscription: 'فشل إنشاء الاشتراك. يرجى المحاولة مرة أخرى.',
        cancelSubscription: 'فشل إلغاء الاشتراك. يرجى المحاولة مرة أخرى.'
      }
    },
    AuthRequiredModal: {
      title: 'تسجيل الدخول مطلوب',
      subtitle: 'يفتح حسابك إعجابات وحفظات المواهب.',
      message: 'تحتاج إلى حساب لتنفيذ {action}. تابع لتسجيل الدخول أو إنشاء حساب.',
      buttons: {
        notNow: 'ليس الآن',
        signIn: 'تسجيل الدخول',
        createAccount: 'إنشاء حساب'
      }
    },
    SaveButton: {
      save: 'حفظ الموهبة',
      remove: 'إزالة من المحفوظات',
      authModal: {
        title: 'سجل الدخول للحفظ',
        message: 'تحتاج إلى حساب لحفظ وحفظ ملفات {talentName}. تابع لتسجيل الدخول أو إنشاء حساب.',
        action: 'حفظ الملفات'
      }
    },
    Home: {
      tagline: 'ربط المواهب بالفرص في صناعة الترفيه.',
      welcome: {
        title: 'مرحباً بك في 3YESES',
        description: 'اعثر على الموهبة المثالية لمشروعك القادم أو اكتشف فرصًا مثيرة في صناعة الترفيه.'
      },
      forTalent: {
        title: 'للمواهب',
        description: 'اعرض مهاراتك واعثر على فرصتك الكبيرة التالية.',
        browse: 'تصفح الفئات'
      },
      expertTalent: 'المواهب الخبراء',
      expertTalentDescription: 'الوصول إلى محترفين معتمدين وسجل مثبت',
      qualityAssured: 'جودة مضمونة',
      qualityAssuredDescription: 'جميع المواهب يتم التحقق منها يدوياً لراحتك',
      qualityAssuredDesc: 'مواهب رفيعة المستوى لمشاريعك',
      careerGrowth: 'نمو المهنة',
      careerGrowthDescription: 'ابنِ علاقات دائمة وطوّر مسيرتك المهنية',
      careerGrowthDesc: 'فرص لتطوير مسيرتك المهنية',
      verifiedTalent: 'موهبة معتمدة',
      verifiedTalentDesc: 'جميع الملفات الشخصية يتم التحقق منها يدوياً',
      searchPlaceholder: 'ابحث عن موهبة أو مهارات أو فئات...',
      searchButton: 'بحث',
      allCategories: 'جميع الفئات',
      location: 'الموقع',
      filters: 'فلاتر',
      clearAll: 'محو الكل',
      applyFilters: 'تطبيق الفلاتر',
      watchEyebrow: 'شاهد ما يدور حول 3YESES',
      videoSectionSeeThe: 'شاهد',
      videoSectionExperience: 'تجربة 3YESES',
      videoSectionDescription: 'اكتشف كيف يتم اختيار المواهب وكيف يجد مخرجو الاختيار الشخص المناسب في كل مرة.',
      allCategory: 'جميع {name}'
    },
    Footer: {
      aboutUs: 'معلومات عنا',
      companyInfo: 'اعرض عملك على جمهور مباشر — اشترك لتكون قابلاً للاكتشاف وتنمو عبر المشاهدات والإعجابات والتعليقات والمشاركات.',
      forTalent: 'للمواهب',
      joinAsTalent: 'انضم كمواهب',
      talentDashboard: 'لوحة مواهب',
      browseCategories: 'تصفح الفئات',
      pricingPlans: 'خطط التسعير',
      howItWorks: 'كيف تعمل',
      successStories: 'قصص النجاح',
      contactUs: 'اتصل بنا',
      email: 'contact@3yeses.co.uk',
      phone: '+44 121 123 4567',
      location: 'برمنغهام، المملكة المتحدة',
      language: 'اللغة',
      copyright: '© 2026 3YESES. جميع الحقوق محفوظة.',
      privacyPolicy: 'سياسة الخصوصية',
      termsOfService: 'شروط الخدمة'
    },
    Meta: {
      title: '3YESES',
      description: '3YESES هو سوق مواهب يعتمد على الاشتراك يربط المؤدين بالمشاريع والفرص الصناعية.'
    },
    WhyHow: {
      title: 'لماذا وكيف',
      subtitle: 'اكتشف كيف تجعل 3YESES المواهب أكثر وضوحًا وتخلق فرصًا.'
    },
    SuccessStories: {
      breadcrumb: 'قصص النجاح',
      title: 'قصص النجاح',
      subtitle: 'اكتشف الرحلات الملهمة للمبدعين الموهوبين الذين وجدوا عملًا ومحبة من خلال 3YESES.',
      stories: {
        '0': {
          title: 'Emma Thompson — موسيقية',
          body: 'كعازفة جيتار صاعدة، واجهت إيما صعوبة في جذب الانتباه في سوق مزدحم. باستخدام ميزات البحث المتقدم في منصتنا، تواصلت مع منتجين أحبوا صوتها الفريد. أدى ذلك إلى تعاونات في أغنيتين ناجحتين وجولة مكتملة العدد.'
        },
        '1': {
          title: 'Liam Garcia — ممثل',
          body: 'ليون، ممثل متعدد المواهب شغوف بالأفلام المستقلة، وجد انطلاقته الكبيرة عبر منصتنا. اكتشف المخرجون موهبته من خلال ملفات تعريف موجهة، مما أدى إلى أدوار في ثلاثة أفلام حظيت بإشادة النقاد وترشيح لأفضل ممثل مساعد.'
        },
        '2': {
          title: 'Sophia Patel — راقصة',
          body: 'لفت أسلوب صوفيا في الرقص المعاصر انتباه المصممين على منصتنا. منذ ذلك الحين، شاركت في عروض برودواي ومهرجانات دولية، وحتى قامت بتصميم رقصات لجولة عالمية لفنانة بوب كبيرة.'
        }
      }
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
  console.log(`Patched UI common translations for ${locale}`);
}
