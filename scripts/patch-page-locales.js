#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const messagesDir = path.join(__dirname, '..', 'messages');
const translations = {
  'de-DE': {
    PricingPage: {
      hero: {
        eyebrow: 'Dein Auftritt beginnt hier',
        titlePrefix: 'Bereit für dein',
        titleAccent: 'drei Ja?',
        description: 'Präsentiere deine Arbeit. Fotos, Videos und Reels – alles an einem Ort, von den richtigen Menschen gesehen.'
      },
      plans: {
        sixMonths: {
          label: '6 Monate',
          price: '£10',
          period: '6 Monate',
          subtext: 'Weniger als ein Kaffee im Monat',
          description: 'Probier es aus. Keine langfristige Bindung.'
        },
        twelveMonths: {
          label: '12 Monate',
          price: '£20',
          period: 'Jahr',
          subtext: 'Gleicher Preis. Doppelter Spielraum.',
          description: 'Geh aufs Ganze. Ein ganzes Jahr, um durchzustarten.',
          badge: 'Bestes Angebot'
        }
      },
      features: {
        profile: 'Ein Profil, das auffällt',
        uploads: 'Lade alles hoch – keine Limits, niemals',
        search: 'Spring in jeder Suche nach vorn'
      },
      trust: {
        noLockIn: 'Keine Bindung – kündige jederzeit',
        secureCheckout: 'Checkout gesichert durch Stripe',
        liveImmediately: 'Live, sobald du bezahlst'
      },
      activeSubscription: {
        banner: '✓ Du hast bereits ein aktives Standard Access Abonnement.',
        manage: 'Abonnement verwalten →'
      },
      planName: 'Standard Access',
      aria: {
        price: 'Preis: {price} {period}',
        subscribePlan: 'Abonniere Standard Access – {plan}',
        percentOff: '{percent}% Rabatt',
        waitingForYou: 'Was auf dich wartet'
      },
      saveAmount: 'Spare {amount}',
      buttons: {
        redirecting: 'Weiterleitung zu Stripe…',
        alreadySubscribed: 'Bereits abonniert',
        subscribe: 'Mit Stripe abonnieren'
      },
      unlock: {
        stage: 'Deine Bühne',
        showEverything: 'Alles anzeigen',
        cutQueue: 'Schneide die Schlange',
        description: 'Kein Schnickschnack. Keine falschen Features. Nur Tools, damit man dich sieht.'
      },
      footer: {
        secureNote: 'Gesichert über Stripe. Kündige jederzeit in deinem Dashboard.',
        accountPrompt: 'Hast du bereits ein Konto?',
        login: 'Einloggen'
      },
      errors: {
        checkoutFailed: 'Checkout-Session konnte nicht erstellt werden',
        missingCheckoutUrl: 'Keine Checkout-URL erhalten',
        generic: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.'
      }
    },
    ContactPage: {
      hero: {
        titlePrefix: 'Nimm',
        titleAccent: 'Kontakt auf',
        description: 'Hast du Fragen zu 3YESES? Wir helfen dir, dich mit Chancen und Talenten zu verbinden.'
      },
      cards: {
        email: {
          title: 'Schreib uns',
          subtitle: 'Für allgemeine Anfragen'
        },
        call: {
          title: 'Ruf uns an',
          subtitle: 'Mo-Fr 9-18 Uhr GMT'
        },
        visit: {
          title: 'Besuche uns',
          subtitle: 'Unser Bürostandort'
        }
      },
      form: {
        successTitle: 'Nachricht gesendet!',
        successDescription: 'Danke für deine Nachricht. Wir melden uns innerhalb von 24 Stunden.',
        sendAnother: 'Weitere Nachricht senden',
        title: 'Schick uns eine Nachricht',
        description: 'Fülle das Formular aus und wir antworten so schnell wie möglich.',
        fullName: 'Vollständiger Name',
        emailAddress: 'E-Mail-Adresse',
        subject: 'Betreff',
        message: 'Nachricht',
        placeholders: {
          name: 'Max Mustermann',
          email: 'max@beispiel.de',
          subject: 'Wie können wir dir helfen?',
          message: 'Erzähle uns mehr über deine Anfrage...'
        },
        sending: 'Senden…',
        sendButton: 'Nachricht senden'
      }
    },
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
        introP2: 'Wir verpflichten uns, deine Privatsphäre zu schützen und deine persönlichen Daten gemäß UK GDPR, dem Data Protection Act 2018 und, wo anwendbar, der EU GDPR zu verarbeiten.'
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
    SearchResultsPage: {
      title: 'Talent-Suche',
      resultsFor: 'Ergebnisse für „{searchTerm}“',
      resultsCount: '{count, plural, one {# Talent gefunden} other {# Talente gefunden}}',
      gridViewTitle: 'Rasteransicht: kompakte Karten',
      listViewTitle: 'Listenansicht: erweiterte Zeilen',
      searchPlaceholder: 'Suche Talente, Fähigkeiten oder Stichworte...',
      toggleFilters: 'Erweiterte Filter umschalten',
      filters: 'Filter',
      browsing: 'Durchsuche:',
      suggestions: {
        skill: 'Als Fähigkeitsfilter hinzufügen',
        category: 'Kategorie',
        inCategory: 'in {name}'
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
    },
    Hub: {
      title: 'Talent-Hub',
      subtitle: 'Entdecke kuratierte Medien talentierter Kreativer',
      search: {
        placeholder: 'Suche nach Titel, Talent oder Beschreibung...',
        clear: 'Suche löschen'
      },
      categories: {
        title: 'Kategorien',
        all: 'Alle',
        acting: 'Schauspiel',
        music: 'Musik',
        modeling: 'Modeling',
        directing: 'Regie',
        writing: 'Schreiben',
        photography: 'Fotografie'
      },
      type: {
        title: 'Typ:',
        all: 'Alle',
        videos: 'Videos',
        audio: 'Audio',
        images: 'Bilder'
      },
      filters: {
        button: 'Filter',
        popularityTier: 'Beliebtheitsstufe',
        viral: 'Viral',
        popular: 'Beliebt',
        rising: 'Aufsteigend',
        fresh: 'Neu',
        uploadDate: 'Upload-Datum',
        allTime: 'Alle Zeiten',
        today: 'Heute',
        pastWeek: 'Letzte Woche',
        pastMonth: 'Letzter Monat',
        pastYear: 'Letztes Jahr',
        sortBy: 'Sortieren nach',
        trending: 'Meist angesehen',
        newest: 'Neueste',
        mostLiked: 'Meist geliked',
        alphabetical: 'A–Z',
        reverseAlphabetical: 'Z–A',
        oldest: 'Älteste zuerst',
        mostViews: 'Meiste Aufrufe',
        leastViews: 'Wenigste Aufrufe',
        mostLikes: 'Meiste Likes',
        leastLikes: 'Wenigste Likes',
        zToA: 'Z–A',
        clearAll: 'Alle Filter löschen',
        activeFilters: 'Aktive Filter',
        search: 'Suche',
        category: 'Kategorie',
        type: 'Typ',
        sort: 'Sortieren',
        showing: 'Anzeigen',
        results: 'Ergebnis',
        resultsPlural: 'Ergebnisse'
      },
      sections: {
        featuredCreators: 'Empfohlene Kreative',
        discoverTopTalent: 'Entdecke Top-Talente auf der Plattform',
        trendingNow: 'Aktuell im Trend',
        hotContent: 'Heiße Inhalte gerade jetzt',
        mostViewed: 'Am häufigsten angesehene Inhalte',
        featuredVideos: 'Empfohlene Videos',
        video: 'Video',
        videos: 'Videos',
        viewAllVideos: 'Alle Videos ansehen →',
        featuredAudio: 'Empfohlene Audioinhalte',
        exploreAll: 'Alles erkunden',
        exploreMoreDescription: 'Es gibt {count} weitere Elemente in unserem vollständigen Katalog zu entdecken.',
        audioTrack: 'Audio-Track',
        audioTracks: 'Audio-Tracks',
        viewAllAudio: 'Alle Audioinhalte ansehen →',
        featuredImages: 'Empfohlene Bilder',
        image: 'Bild',
        images: 'Bilder',
        viewAllImages: 'Alle Bilder ansehen →',
        latestUploads: 'Neueste Uploads',
        freshContent: 'Frisch hinzugefügte Inhalte',
        mostPopular: 'Beliebteste',
        lovedByCommunity: 'Geliebt von der Community'
      },
      badges: {
        sponsored: 'Gesponsert',
        trending: 'Im Trend',
        hot: 'Heiß',
        new: 'Neu',
        popular: 'Beliebt'
      },
      pagination: {
        previous: 'Zurück',
        next: 'Weiter'
      },
      empty: {
        title: 'Keine Inhalte gefunden',
        description: 'Ändere deine Filter, um mehr Ergebnisse zu sehen'
      }
    },
    HubMediaPage: {
      searchPlaceholder: 'Medien durchsuchen...',
      viewFullProfile: 'Vollständiges Profil ansehen',
      filterMedia: 'Medien filtern',
      filters: {
        all: 'Alle',
        video: 'Video',
        audio: 'Audio',
        image: 'Bild'
      },
      portfolioTitle: 'Portfolio von {name}',
      views: '{count} Aufrufe'
    },
    TalentPage: {
      selectCategory: 'Kategorie wählen',
      searchCategories: 'Kategorien durchsuchen...',
      rolePlaceholder: 'Deine Rolle / dein Titel',
      bioPlaceholder: 'Erzähle uns von dir, deiner Erfahrung und was dich einzigartig macht...',
      skillsPlaceholder: 'Fähigkeiten hinzufügen oder suchen...',
      selectGender: 'Geschlecht wählen',
      selectEthnicity: 'Ethnie wählen',
      selectEyeColor: 'Augenfarbe wählen',
      selectHairColor: 'Haarfarbe wählen',
      selectBodyType: 'Körpertyp wählen',
      selectLanguages: 'Sprachen wählen'
    },
    Comments: {
      addCommentPlaceholder: 'Kommentar hinzufügen...',
      writeReplyPlaceholder: 'Antwort schreiben...',
      cancel: 'Abbrechen',
      posting: 'Wird gepostet...',
      reply: 'Antworten',
      post: 'Veröffentlichen',
      delete: 'Löschen',
      confirmDelete: 'Möchtest du diesen Kommentar wirklich löschen?',
      hideReplies: 'Antworten ausblenden',
      viewReplies: 'Zeige {count, plural, one {# Antwort} other {# Antworten}}',
      errors: {
        postFailed: 'Kommentar konnte nicht gepostet werden',
        postRetry: 'Kommentar konnte nicht gepostet werden. Bitte versuche es erneut.'
      }
    },
    support: {
      helpCentre: 'Help Center',
      heroTitle: 'Wie können wir',
      heroAccent: 'dir helfen?',
      heroDesc: 'Durchsuche unsere Hilfeartikel, prüfe die FAQ oder sende ein Support-Ticket, und unser Team meldet sich bei dir.',
      searchPlaceholder: 'Hilfeartikel, FAQs und Antworten durchsuchen…',
      clearSearch: 'Suche löschen',
      topicsFound: '{topics} Thema(e) · {faqs} FAQ(s) gefunden',
      matchingFAQs: 'Passende FAQs',
      viewAllMatching: 'Alle {count} passenden FAQs anzeigen',
      learnMore: 'Mehr erfahren',
      submitTicket: 'Support-Ticket einreichen',
      submitTicketDesc: 'Kannst du nicht finden, was du brauchst? Unser Team meldet sich innerhalb von 48 Stunden.',
      faqHeading: 'Häufig gestellte Fragen',
      faqCountLabel: 'FAQs',
      allCategories: 'Alle Kategorien',
      needHelp: 'Brauchst du Hilfe?',
      needHelpDesc: 'Finde nicht, was du brauchst? Reiche ein Ticket ein und unser Team antwortet innerhalb von 48 Stunden.',
      faqTitle: 'Häufig gestellte Fragen',
      secureEncrypted: 'Sicher & verschlüsselt',
      replyTime: 'Typische Antwortzeit innerhalb von 48 Stunden',
      trackedDashboard: 'Über dein Dashboard nachverfolgt',
      backToHelp: 'Zurück zum Help Center',
      ticketLabel: 'Support-Ticket',
      submitATicket: 'Ein Ticket einreichen',
      ticketAccent: 'Ticket',
      ticketFormDesc: 'Wähle eine Kategorie, beschreibe dein Problem und unser Support-Team meldet sich innerhalb von 48 Stunden. Du musst angemeldet sein, um ein Ticket einzureichen.',
      newSupportTicket: 'Neues Support-Ticket',
      trustSecure: 'Sicher & verschlüsselt',
      trustSecureDesc: 'Alle Daten werden während der Übertragung verschlüsselt',
      trustTracked: 'Nachverfolgte Tickets',
      trustTrackedDesc: 'Status in deinem Dashboard anzeigen',
      trustReply: 'Antwortzeit 48 Stunden',
      trustReplyDesc: 'Unser Team antwortet innerhalb von 48 Stunden',
      stillNeedHelp: 'Brauchst du weiterhin Hilfe?',
      submitTicketLink: 'Support-Ticket einreichen →',
      relatedTopics: 'Verwandte Themen',
      quickGuide: 'Kurzleitfaden',
      topicAccount: 'Konto & Profil',
      topicBilling: 'Abrechnung & Abonnements',
      topicCategories: 'Kategorien & Entdeckung',
      topicPortfolio: 'Portfolio & Medien',
      topicNotifications: 'Benachrichtigungen & Warnungen',
      topicSecurity: 'Sicherheit & Datenschutz',
      accountLabel: 'Konto & Profil',
      accountTitle: 'Konto &',
      accountAccent: 'Profil',
      accountDesc: 'Registrierung, Profilbearbeitung, physische Merkmale, Berufserfahrung, Social Links, Sichtbarkeitseinstellungen und Kontoverwaltung.',
      billingLabel: 'Abrechnung & Abonnements',
      billingTitle: 'Abrechnung &',
      billingAccent: 'Abonnements',
      billingDesc: 'Preise, Zahlungsmethoden, Rechnungen, Kündigung und alles, was mit deinem Abonnement zu tun hat.',
      categoriesLabel: 'Kategorien & Entdeckung',
      categoriesTitle: 'Kategorien &',
      categoriesAccent: 'Entdeckung',
      categoriesDesc: 'Suchfilter, Talentverzeichnis, Medien-Hub, Raster- und Listenansichten und Tipps, um entdeckt zu werden.',
      portfolioLabel: 'Portfolio & Medien',
      portfolioTitle: 'Portfolio &',
      portfolioAccent: 'Medien',
      portfolioDesc: 'Upload-Assistent, Galerieansicht, Medien-Overlay, Dateitypen, Größenbeschränkungen und Tipps für ein auffälliges Portfolio.',
      notificationsLabel: 'Benachrichtigungen & Warnungen',
      notificationsTitle: 'Benachrichtigungen &',
      notificationsAccent: 'Warnungen',
      notificationsDesc: 'Kommentarbenachrichtigungen, Like-Benachrichtigungen, Profilansichten, Follower-Aktivität und Verwaltung deiner Einstellungen.',
      securityLabel: 'Sicherheit & Datenschutz',
      securityTitle: 'Sicherheit &',
      securityAccent: 'Datenschutz',
      securityDesc: 'Sichtbarkeitseinstellungen, Cookie-Zustimmung, Inhaltsmeldungen, GDPR-Rechte und wie du dein Konto sicher hältst.',
      formCategory: 'Kategorie',
      formCategoryAria: 'Ticket-Kategorie',
      formSubject: 'Betreff',
      formSubjectPlaceholder: 'Kurze Zusammenfassung Ihres Problems',
      formDescription: 'Beschreibung',
      formDescPlaceholder: 'Beschreibe dein Problem ausführlich. Schließe relevante Schritte oder Screenshots ein.',
      formSubmit: 'Ticket senden',
      formSubmitting: 'Wird gesendet…',
      formSuccess: 'Ticket gesendet',
      formSuccessMsg: 'Deine Ticket-ID ist {ticketId}. Wir melden uns innerhalb von 48 Stunden.',
      formSubmitAnother: 'Noch ein Ticket senden',
      formError: 'Ticket konnte nicht gesendet werden. Bitte stelle sicher, dass du angemeldet bist.'
    }
    // No further translations.
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
  console.log(`Patched page translations for ${locale}`);
}
