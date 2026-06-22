#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const messagesDir = path.join(__dirname, '..', 'messages');
const translations = {
  'de-DE': {
    support: {
      faqCountLabel: 'FAQs',
      portfolioTitle: 'Portfolio &',
      catCommunity: 'Community',
      catSupport: 'Support & Tickets',
      billingHelp: {
        ticketCategory: 'Abrechnung & Abonnements',
        faqCostQ: 'Wie viel kostet 3YESES?',
        faqCostA: 'Ein aktives Abonnement ist erforderlich, um die Plattform zu nutzen. Du abonnierst während der Anmeldung - wähle zwischen GBP10 für 6 Monate oder GBP20 für 12 Monate (bestes Angebot). Beide Pläne enthalten identische Funktionen: unbegrenzte Portfolio-Uploads, vollständige Profilanpassung, priorisierte Suchplatzierung, Analyse-Dashboard, Kommentare, Likes und Community-Funktionen. Es gibt keine versteckten Gebühren.',
        faqSubscribeQ: 'Wie abonniere ich?',
        faqSubscribeA: 'Das Abonnement erfolgt im Rahmen des Anmeldevorgangs. Nachdem du dein Konto erstellt und dein Alter bestätigt hast, wähle die Laufzeit deines Plans (6 oder 12 Monate) und schließe dann den sicheren Stripe-Checkout ab. Dein Konto wird sofort aktiviert - keine Wartezeit.',
        faqCancelQ: 'Kann ich mein Abonnement kündigen?',
        faqCancelA: 'Ja - kündige jederzeit im Dashboard -> Abonnement. Du behältst vollen Zugriff bis zum Ende deines aktuellen Abrechnungszeitraums. Dein Profil, Portfolio, Kommentare und Analysedaten bleiben erhalten - abonnieren Sie jederzeit erneut, um dort weiterzumachen, wo du aufgehört hast. Es fallen keine Kündigungsgebühren an.',
        faqExpireQ: 'Was passiert, wenn mein Abonnement abläuft?',
        faqExpireA: 'Wenn dein Abonnement endet, wird dein Plattformzugriff pausiert. Du kannst dich nicht einloggen, keine Inhalte hochladen oder mit der Community interagieren. Dein Profil, Portfolio-Elemente und alle Daten bleiben jedoch erhalten und werden vollständig wiederhergestellt, wenn du erneut abonnierst.',
        faqInvoiceQ: 'Wie erhalte ich eine Rechnung?',
        faqInvoiceA: 'Gehe zu Dashboard -> Abonnement, um deine Abrechnungshistorie anzuzeigen. Alle Rechnungen werden von Stripe erstellt und verwaltet. Du kannst PDF-Rechnungen für jede frühere Zahlung direkt von dieser Seite herunterladen.',
        faqSwitchPlanQ: 'Kann ich zwischen 6-Monats- und 12-Monats-Plänen wechseln?',
        faqSwitchPlanA: 'Wenn dein aktueller Abonnementzeitraum endet, kannst du bei der Verlängerung eine andere Laufzeit wählen. Die Änderung tritt zu Beginn deines nächsten Abrechnungszyklus in Kraft. Beide Pläne enthalten identische Funktionen.',
        guideSubscriptionTitle: 'Verstehe dein Abonnement',
        guideSubscriptionContent: 'Ein Abonnement ist erforderlich, um 3YESES zu nutzen. Du wählst deinen Plan während der Anmeldung: GBP10 für 6 Monate oder GBP20 für 12 Monate (bestes Angebot). Beide Pläne enthalten identische Funktionen - der einzige Unterschied ist die Abrechnungsdauer.',
        guideSecurityTitle: 'Zahlungssicherheit',
        guideSecurityContent: 'Alle Zahlungen werden sicher über Stripe verarbeitet. Wir speichern niemals deine Kartendaten auf unseren Servern. Stripe ist PCI DSS Level 1 zertifiziert - die höchste Sicherheitsstufe in der Zahlungsbranche.',
        guideRefundTitle: 'Rückerstattungsrichtlinie',
        guideRefundContent: 'Wenn du ein technisches Problem hast, das dich daran hindert, die Plattform zu nutzen, kontaktiere den Support innerhalb von 14 Tagen nach der Zahlung für eine Überprüfung. Rückerstattungen werden im Einzelfall geprüft.'
      }
    },
    Pages: {
      privacy: {
        contents: 'Inhalt',
        introP1: 'Diese Datenschutzrichtlinie erklärt, wie 3YESES ("Plattform", "wir", "uns", "unser") deine persönlichen Daten sammelt, nutzt, speichert und schützt, wenn du unseren abonnementbasierten Talent-Marktplatz unter 3yeses.online verwendest.',
        introP2: 'Wir verpflichten uns, deine Privatsphäre zu schützen und deine persönlichen Daten gemäß UK GDPR, dem Data Protection Act 2018 und, falls zutreffend, der EU GDPR zu verarbeiten.'
      },
      terms: {
        contents: 'Inhalt',
        sections: {
          overview: {
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
            p2: 'Beide Pläne beinhalten identische Funktionen: unbegrenzte Portfolio-Uploads, vollständige Profilanpassung, priorisierte Suche und vollständige Dashboard-Analysen.'
          },
          content: {
            ownership: 'Du behältst das volle Eigentum an allen Inhalten, die du auf die Plattform hochlädst. Durch das Hochladen gewährst du 3YESES eine nicht ausschließliche, weltweite, gebührenfreie Lizenz, um deine Inhalte auf der Plattform und in Marketingmaterialien anzuzeigen, zu verteilen und zu bewerben.',
            permitted: 'Du darfst Bilder (JPEG, PNG, WebP), Videos (MP4, MOV) und Audiodateien (MP3, WAV) hochladen. Einzeldateien dürfen 50 MB nicht überschreiten. Du darfst auch externe Videolinks einbetten (z. B. YouTube, Vimeo).'
          }
        }
      }
    }
  },
  'es-ES': {
    support: {
      faqCountLabel: 'FAQs',
      portfolioTitle: 'Portafolio &',
      catCommunity: 'Comunidad',
      catSupport: 'Soporte & Tickets',
      billingHelp: {
        ticketCategory: 'Facturación & Suscripciones',
        faqCostQ: '¿Cuánto cuesta 3YESES?',
        faqCostA: 'Se requiere una suscripción activa para usar la plataforma. Te suscribes durante el registro: elige entre GBP10 por 6 meses o GBP20 por 12 meses (mejor valor). Ambos planes incluyen funciones idénticas: cargas ilimitadas de portafolio, personalización completa del perfil, ranking prioritario en búsquedas, panel de análisis, comentarios, likes y funciones comunitarias. No hay cargos ocultos.',
        faqSubscribeQ: '¿Cómo me suscribo?',
        faqSubscribeA: 'La suscripción se realiza como parte del proceso de registro. Después de crear tu cuenta y confirmar tu edad, elige la duración del plan (6 o 12 meses) y completa el checkout seguro de Stripe. Tu cuenta se activa instantáneamente, sin periodo de espera.',
        faqCancelQ: '¿Puedo cancelar mi suscripción?',
        faqCancelA: 'Sí: cancela en cualquier momento desde el Dashboard -> Suscripción. Conservas el acceso completo hasta el final de tu periodo de facturación actual. Tu perfil, portafolio, comentarios y datos analíticos se conservan; vuelve a suscribirte en cualquier momento para continuar donde lo dejaste. No hay tarifas de cancelación.',
        faqExpireQ: '¿Qué pasa cuando expira mi suscripción?',
        faqExpireA: 'Cuando tu suscripción termina, el acceso a la plataforma se pausa. No puedes iniciar sesión, subir contenido o interactuar con la comunidad. Sin embargo, tu perfil, elementos del portafolio y todos los datos se conservan y se restaurarán completamente cuando te vuelvas a suscribir.',
        faqInvoiceQ: '¿Cómo obtengo una factura?',
        faqInvoiceA: 'Ve a Dashboard -> Suscripción para ver tu historial de facturación. Todas las facturas son generadas y gestionadas por Stripe. Puedes descargar facturas en PDF de cualquier pago anterior directamente desde esta página.',
        faqSwitchPlanQ: '¿Puedo cambiar entre planes de 6 y 12 meses?',
        faqSwitchPlanA: 'Cuando termine tu periodo de suscripción actual, puedes elegir una duración diferente al renovar. El cambio entra en vigor al comienzo de tu próximo ciclo de facturación. Ambos planes incluyen funciones idénticas.',
        guideSubscriptionTitle: 'Entendiendo tu suscripción',
        guideSubscriptionContent: 'La suscripción es obligatoria para usar 3YESES. Elige tu plan durante el registro: GBP10 por 6 meses o GBP20 por 12 meses (mejor valor). Ambos planes incluyen funciones idénticas; la única diferencia es la duración de la facturación.',
        guideSecurityTitle: 'Seguridad de pagos',
        guideSecurityContent: 'Todos los pagos se procesan de manera segura a través de Stripe. Nunca almacenamos los datos de tu tarjeta en nuestros servidores. Stripe está certificado PCI DSS Nivel 1, el nivel de seguridad más alto en el sector de pagos.',
        guideRefundTitle: 'Política de reembolsos',
        guideRefundContent: 'Si experimentas un problema técnico que te impida usar la plataforma, contacta al soporte dentro de los 14 días posteriores al pago para revisión. Las devoluciones se evalúan caso por caso.'
      }
    },
    Pages: {
      privacy: {
        contents: 'Contenido',
        introP1: 'Esta Política de Privacidad explica cómo 3YESES ("Plataforma", "nosotros", "nos", "nuestro") recopila, usa, almacena y protege tus datos personales cuando utilizas nuestro marketplace de talento por suscripción en 3yeses.online.',
        introP2: 'Nos comprometemos a proteger tu privacidad y a tratar tus datos personales conforme al RGPD del Reino Unido, la Ley de Protección de Datos de 2018 y, cuando corresponda, al RGPD de la UE.'
      },
      terms: {
        contents: 'Contenido',
        sections: {
          overview: {
            p2: '3YESES es una plataforma donde los profesionales creativos — actores, músicos, modelos, bailarines, artistas de voz, fotógrafos, videógrafos, DJs, presentadores, comediantes y otros intérpretes — crean perfiles, suben medios de portafolio (fotos, videos, audio) y son descubiertos. La plataforma incluye un directorio de talentos con búsqueda, un centro de medios, paneles analíticos y funciones comunitarias como comentarios, likes y compartición de contenido.'
          },
          eligibility: {
            p1: 'Debes tener al menos 13 años para crear una cuenta. Los usuarios de 13 a 17 años requieren el consentimiento de padres o tutores. Los menores de 13 años deben tener una cuenta gestionada por un padre o tutor que registre y administre la cuenta en su nombre.',
            p2: 'Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de toda la actividad de tu cuenta. Infórmanos de inmediato si sospechas un acceso no autorizado.',
            p3: 'Cada persona puede tener solo una cuenta. Las cuentas duplicadas pueden ser suspendidas sin previo aviso.',
            p4: 'Debes proporcionar información precisa y actualizada durante el registro y mantener tu perfil al día. Los perfiles fraudulentos o engañosos pueden ser eliminados.'
          },
          subscription: {
            p1: 'Se requiere una suscripción activa para usar la Plataforma. Te suscribes durante el proceso de registro. Sin una suscripción activa, no puedes acceder a la Plataforma.',
            plansIntro: 'Ofrecemos un plan — Standard Access — con dos opciones de duración:',
            p2: 'Ambos planes incluyen funciones idénticas: cargas ilimitadas de portafolio, personalización total del perfil, clasificación prioritaria en búsquedas y análisis completos del panel.'
          },
          content: {
            ownership: 'Mantienes la propiedad total de todo el contenido que subes a la Plataforma. Al subir contenido, otorgas a 3YESES una licencia no exclusiva, mundial y libre de regalías para mostrar, distribuir y promocionar tu contenido en la Plataforma y en materiales de marketing relacionados.',
            permitted: 'Puedes subir imágenes (JPEG, PNG, WebP), videos (MP4, MOV) y archivos de audio (MP3, WAV). Los archivos individuales no deben superar los 50 MB. También puedes incrustar enlaces de video externos (por ejemplo, YouTube, Vimeo).'
          }
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
  console.log(`Patched support and pages values for ${locale}`);
}
