#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const messagesDir = path.join(__dirname, '..', 'messages');
const translations = {
  'de-DE': {
    DashboardMessagesPage: {
      labels: {
        you: 'Du'
      },
      sample: {
        castingDirector: 'Casting Director',
        director: 'Regisseur',
        producer: 'Produzent',
        message1: 'Hi! Ich habe dein Portfolio gesehen und würde gerne ein kommendes Projekt besprechen...',
        message2: 'Danke für dein Interesse. Wann wärst du für einen Videoanruf verfügbar?',
        message3: 'Das Casting lief großartig! Wir melden uns bald mit den nächsten Schritten.',
        message4: 'Hi! Ich habe dein Portfolio gesehen und würde gerne ein kommendes Projekt besprechen.',
        message5: 'Danke, dass du dich gemeldet hast! Ich würde gerne mehr über das Projekt erfahren.',
        message6: 'Es ist ein Werbespot für eine große Marke. Bist du morgen für einen Anruf verfügbar?',
        time2h: 'Vor 2 Std.',
        time1d: 'Vor 1 Tag',
        time2d: 'Vor 2 Tagen'
      }
    },
    DashboardSubscriptionPage: {
      activeBanner: 'Du bist derzeit für Standard Access abonniert',
      validUntil: 'Gültig bis'
    },
    Home: {
      whyChooseSubtitle: '3YESES',
      support247: '24/7 Support'
    }
  },
  'es-ES': {
    DashboardMessagesPage: {
      labels: {
        you: 'Tú'
      },
      sample: {
        castingDirector: 'Director de casting',
        director: 'Director',
        producer: 'Productor',
        message1: '¡Hola! Revisé tu portafolio y me encantaría hablar sobre un proyecto próximo...',
        message2: 'Gracias por tu interés. ¿Cuándo estarías disponible para una videollamada?',
        message3: '¡La audición fue excelente! Nos pondremos en contacto pronto con los siguientes pasos.',
        message4: '¡Hola! Revisé tu portafolio y me encantaría hablar sobre un proyecto próximo.',
        message5: 'Gracias por comunicarte. Me encantaría saber más sobre el proyecto.',
        message6: 'Es un comercial para una marca importante. ¿Estás disponible para una llamada mañana?',
        time2h: 'Hace 2 h',
        time1d: 'Hace 1 día',
        time2d: 'Hace 2 días'
      }
    },
    DashboardSubscriptionPage: {
      activeBanner: 'Actualmente estás suscrito a Standard Access',
      validUntil: 'Válido hasta'
    },
    Home: {
      whyChooseSubtitle: '3YESES',
      support247: 'Soporte 24/7'
    }
  },
  'fr-FR': {
    DashboardMessagesPage: {
      labels: {
        you: 'Vous'
      },
      sample: {
        castingDirector: 'Directeur de casting',
        director: 'Réalisateur',
        producer: 'Producteur',
        message1: 'Bonjour ! J’ai consulté votre portfolio et j’aimerais discuter d’un projet à venir...',
        message2: 'Merci pour votre intérêt. Quand seriez-vous disponible pour un appel vidéo ?',
        message3: 'L’audition s’est très bien passée ! Nous vous contacterons bientôt pour les prochaines étapes.',
        message4: 'Bonjour ! J’ai consulté votre portfolio et j’aimerais discuter d’un projet à venir.',
        message5: 'Merci de nous avoir contactés ! J’aimerais en savoir plus sur le projet.',
        message6: 'C’est une publicité pour une grande marque. Êtes-vous disponible pour un appel demain ?',
        time2h: 'Il y a 2 h',
        time1d: 'Il y a 1 j',
        time2d: 'Il y a 2 j'
      }
    },
    DashboardSubscriptionPage: {
      activeBanner: 'Vous êtes actuellement abonné à Standard Access',
      validUntil: 'Valable jusqu’au'
    },
    Home: {
      whyChooseSubtitle: '3YESES',
      support247: 'Support 24h/24'
    }
  },
  'it-IT': {
    DashboardMessagesPage: {
      labels: {
        you: 'Tu'
      },
      sample: {
        castingDirector: 'Casting Director',
        director: 'Regista',
        producer: 'Produttore',
        message1: 'Ciao! Ho visto il tuo portfolio e mi piacerebbe parlare di un prossimo progetto...',
        message2: 'Grazie per il tuo interesse. Quando saresti disponibile per una videochiamata?',
        message3: 'L’audizione è andata benissimo! Ti contatteremo presto con i prossimi passi.',
        message4: 'Ciao! Ho visto il tuo portfolio e mi piacerebbe parlare di un prossimo progetto.',
        message5: 'Grazie per averci contattato! Mi piacerebbe saperne di più sul progetto.',
        message6: 'È uno spot per un grande marchio. Sei disponibile per una chiamata domani?',
        time2h: '2h fa',
        time1d: '1g fa',
        time2d: '2g fa'
      }
    },
    DashboardSubscriptionPage: {
      activeBanner: 'Sei attualmente abbonato a Standard Access',
      validUntil: 'Valido fino a'
    },
    Home: {
      whyChooseSubtitle: '3YESES',
      support247: 'Supporto 24/7'
    }
  },
  'pt-PT': {
    DashboardMessagesPage: {
      labels: {
        you: 'Você'
      },
      sample: {
        castingDirector: 'Diretor de casting',
        director: 'Diretor',
        producer: 'Produtor',
        message1: 'Olá! Analisei o seu portefólio e adoraria discutir um projeto que está por vir...',
        message2: 'Obrigado pelo seu interesse. Quando estará disponível para uma videochamada?',
        message3: 'A audição correu muito bem! Entraremos em contato em breve com os próximos passos.',
        message4: 'Olá! Analisei o seu portefólio e adoraria discutir um projeto que está por vir.',
        message5: 'Obrigado por entrar em contato! Adoraria saber mais sobre o projeto.',
        message6: 'É um comercial para uma marca importante. Está disponível para uma chamada amanhã?',
        time2h: 'Há 2h',
        time1d: 'Há 1 dia',
        time2d: 'Há 2 dias'
      }
    },
    DashboardSubscriptionPage: {
      activeBanner: 'Você está atualmente inscrito no Standard Access',
      validUntil: 'Válido até'
    },
    Home: {
      whyChooseSubtitle: '3YESES',
      support247: 'Suporte 24/7'
    }
  },
  'ru-RU': {
    DashboardMessagesPage: {
      labels: {
        you: 'Вы'
      },
      sample: {
        castingDirector: 'Кастинг-директор',
        director: 'Режиссер',
        producer: 'Продюсер',
        message1: 'Привет! Я посмотрел ваше портфолио и хотел бы обсудить предстоящий проект...',
        message2: 'Спасибо за интерес. Когда вы будете доступны для видеозвонка?',
        message3: 'Кастинг прошел отлично! Мы свяжемся с вами в ближайшее время с дальнейшими шагами.',
        message4: 'Привет! Я посмотрел ваше портфолио и хотел бы обсудить предстоящий проект.',
        message5: 'Спасибо, что связались! Я хотел бы узнать больше о проекте.',
        message6: 'Это реклама для крупного бренда. Вы доступны для звонка завтра?',
        time2h: '2 ч назад',
        time1d: '1 д назад',
        time2d: '2 д назад'
      }
    },
    DashboardSubscriptionPage: {
      activeBanner: 'Вы в настоящее время подписаны на Standard Access',
      validUntil: 'Действительно до'
    },
    Home: {
      whyChooseSubtitle: '3YESES',
      support247: 'Поддержка 24/7'
    }
  },
  'ja-JP': {
    DashboardMessagesPage: {
      labels: {
        you: 'あなた'
      },
      sample: {
        castingDirector: 'キャスティングディレクター',
        director: 'ディレクター',
        producer: 'プロデューサー',
        message1: 'こんにちは！あなたのポートフォリオを拝見し、今後のプロジェクトについて話したいと思いました...',
        message2: 'ご興味ありがとうございます。ビデオ通話はいつご都合がよろしいですか？',
        message3: 'オーディションはとても良く進みました！次のステップについてすぐに連絡します。',
        message4: 'こんにちは！あなたのポートフォリオを拝見し、今後のプロジェクトについて話したいと思いました。',
        message5: 'ご連絡ありがとうございます！プロジェクトについてもっと聞きたいです。',
        message6: 'これは大手ブランドのCMです。明日お電話できますか？',
        time2h: '2時間前',
        time1d: '1日前',
        time2d: '2日前'
      }
    },
    DashboardSubscriptionPage: {
      activeBanner: '現在、Standard Access にご加入中です',
      validUntil: '有効期限'
    },
    Home: {
      whyChooseSubtitle: '3YESES',
      support247: '24時間年中無休サポート'
    }
  },
  'zh-CN': {
    DashboardMessagesPage: {
      labels: {
        you: '你'
      },
      sample: {
        castingDirector: '选角导演',
        director: '导演',
        producer: '制片人',
        message1: '嗨！我看过你的作品集，很想讨论一个即将到来的项目...',
        message2: '感谢你的关注。你什么时候方便进行视频通话？',
        message3: '试镜进行得很顺利！我们会尽快与您联系，告知下一步。',
        message4: '嗨！我看过你的作品集，很想讨论一个即将到来的项目。',
        message5: '感谢你的联系！我想更多地了解这个项目。',
        message6: '这是一个知名品牌的广告。你明天有时间接听电话吗？',
        time2h: '2小时前',
        time1d: '1天前',
        time2d: '2天前'
      }
    },
    DashboardSubscriptionPage: {
      activeBanner: '您当前已订阅 Standard Access',
      validUntil: '有效期至'
    },
    Home: {
      whyChooseSubtitle: '3YESES',
      support247: '7x24 小时支持'
    }
  },
  'ar': {
    DashboardMessagesPage: {
      labels: {
        you: 'أنت'
      },
      sample: {
        castingDirector: 'مخرج الاختيار',
        director: 'مخرج',
        producer: 'منتج',
        message1: 'مرحبًا! راجعت محفظتك وأود مناقشة مشروع قادم...',
        message2: 'شكرًا لاهتمامك. متى ستكون متاحًا لمكالمة فيديو؟',
        message3: 'سارت التجربة بشكل رائع! سنتواصل معك قريبًا بشأن الخطوات التالية.',
        message4: 'مرحبًا! راجعت محفظتك وأود مناقشة مشروع قادم.',
        message5: 'شكرًا لتواصلك! أحب أن أسمع المزيد حول المشروع.',
        message6: 'إنها إعلان تجاري لعلامة تجارية كبيرة. هل أنت متاح لمكالمة غدًا؟',
        time2h: 'منذ ساعتين',
        time1d: 'منذ يوم واحد',
        time2d: 'منذ يومين'
      }
    },
    DashboardSubscriptionPage: {
      activeBanner: 'أنت مشترك حاليًا في Standard Access',
      validUntil: 'صالح حتى'
    },
    Home: {
      whyChooseSubtitle: '3YESES',
      support247: 'دعم 24/7'
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
  console.log(`Patched DashboardMessagesPage/DashboardSubscriptionPage/Home strings for ${locale}`);
}
