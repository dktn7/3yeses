#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const messagesDir = path.join(__dirname, '..', 'messages');
const translations = {
  'de-DE': {
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
        successDescription: 'Danke für deine Anfrage. Wir melden uns innerhalb von 24 Stunden.',
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
        sending: 'Senden...',
        sendButton: 'Nachricht senden'
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
    }
  },
  'es-ES': {
    ContactPage: {
      hero: {
        titlePrefix: 'Ponte',
        titleAccent: 'en contacto',
        description: '¿Tienes preguntas sobre 3YESES? Estamos aquí para ayudarte a conectar con oportunidades y talento.'
      },
      cards: {
        email: {
          title: 'Envíanos un correo',
          subtitle: 'Para consultas generales'
        },
        call: {
          title: 'Llámanos',
          subtitle: 'Lun-Vie 9am-6pm GMT'
        },
        visit: {
          title: 'Visítanos',
          subtitle: 'Nuestra ubicación de oficina'
        }
      },
      form: {
        successTitle: 'Mensaje enviado!',
        successDescription: 'Gracias por contactarnos. Te responderemos en 24 horas.',
        sendAnother: 'Enviar otro mensaje',
        title: 'Envíanos un mensaje',
        description: 'Rellena el formulario y responderemos lo antes posible.',
        fullName: 'Nombre completo',
        emailAddress: 'Dirección de correo',
        subject: 'Asunto',
        message: 'Mensaje',
        placeholders: {
          name: 'John Doe',
          email: 'john@ejemplo.com',
          subject: '¿Cómo podemos ayudarte?',
          message: 'Cuéntanos más sobre tu consulta...'
        },
        sending: 'Enviando...',
        sendButton: 'Enviar mensaje'
      }
    },
    SearchResultsPage: {
      title: 'Búsqueda de Talentos',
      resultsFor: 'Resultados para "{searchTerm}"',
      resultsCount: '{count, plural, one {# talento encontrado} other {# talentos encontrados}}',
      gridViewTitle: 'Vista de cuadrícula: tarjetas compactas',
      listViewTitle: 'Vista de lista: líneas ampliadas',
      searchPlaceholder: 'Busca talentos, habilidades o palabras clave...',
      toggleFilters: 'Alternar filtros avanzados',
      filters: 'Filtros',
      browsing: 'Navegando:',
      suggestions: {
        skill: 'Agregar como filtro de habilidad',
        category: 'Categoría',
        inCategory: 'en {name}'
      }
    }
  },
  'fr-FR': {
    ContactPage: {
      hero: {
        titlePrefix: 'Prenez',
        titleAccent: 'contact',
        description: 'Vous avez des questions sur 3YESES ? Nous sommes là pour vous aider à saisir des opportunités et à trouver des talents.'
      },
      cards: {
        email: {
          title: 'Écrivez-nous',
          subtitle: 'Pour les demandes générales'
        },
        call: {
          title: 'Appelez-nous',
          subtitle: 'Lun-Ven 9h-18h GMT'
        },
        visit: {
          title: 'Visitez-nous',
          subtitle: 'Notre emplacement bureau'
        }
      },
      form: {
        successTitle: 'Message envoyé !',
        successDescription: 'Merci de nous avoir contactés. Nous vous répondrons sous 24 heures.',
        sendAnother: 'Envoyer un autre message',
        title: 'Envoyez-nous un message',
        description: 'Remplissez le formulaire et nous répondrons dès que possible.',
        fullName: 'Nom complet',
        emailAddress: 'Adresse e-mail',
        subject: 'Objet',
        message: 'Message',
        placeholders: {
          name: 'Jean Dupont',
          email: 'jean@exemple.com',
          subject: 'Comment pouvons-nous vous aider ?',
          message: 'Dites-nous en plus sur votre demande...'
        },
        sending: 'Envoi...',
        sendButton: 'Envoyer le message'
      }
    },
    SearchResultsPage: {
      title: 'Recherche de talents',
      resultsFor: 'Résultats pour «{searchTerm}»',
      resultsCount: '{count, plural, one {# talent trouvé} other {# talents trouvés}}',
      gridViewTitle: 'Vue en grille : cartes compactes',
      listViewTitle: 'Vue en liste : lignes étendues',
      searchPlaceholder: 'Rechercher talents, compétences ou mots clés...',
      toggleFilters: 'Basculer les filtres avancés',
      filters: 'Filtres',
      browsing: 'Navigation :',
      suggestions: {
        skill: 'Ajouter comme filtre de compétence',
        category: 'Catégorie',
        inCategory: 'dans {name}'
      }
    }
  },
  'it-IT': {
    ContactPage: {
      hero: {
        titlePrefix: 'Mettiti',
        titleAccent: 'in contatto',
        description: 'Hai domande su 3YESES? Siamo qui per aiutarti a connetterti con opportunità e talenti.'
      },
      cards: {
        email: {
          title: 'Scrivici',
          subtitle: 'Per richieste generali'
        },
        call: {
          title: 'Chiamaci',
          subtitle: 'Lun-Ven 9-18 GMT'
        },
        visit: {
          title: 'Vieni a trovarci',
          subtitle: 'La sede del nostro ufficio'
        }
      },
      form: {
        successTitle: 'Messaggio inviato!',
        successDescription: 'Grazie per averci contattato. Ti risponderemo entro 24 ore.',
        sendAnother: 'Invia un altro messaggio',
        title: 'Inviaci un messaggio',
        description: 'Compila il modulo e ti risponderemo al più presto.',
        fullName: 'Nome completo',
        emailAddress: 'Indirizzo email',
        subject: 'Oggetto',
        message: 'Messaggio',
        placeholders: {
          name: 'Mario Rossi',
          email: 'mario@esempio.com',
          subject: 'Come possiamo aiutarti?',
          message: 'Raccontaci di più sulla tua richiesta...'
        },
        sending: 'Invio in corso...',
        sendButton: 'Invia messaggio'
      }
    },
    SearchResultsPage: {
      title: 'Ricerca Talent',
      resultsFor: 'Risultati per "{searchTerm}"',
      resultsCount: '{count, plural, one {# talento trovato} other {# talenti trovati}}',
      gridViewTitle: 'Vista a griglia: schede compatte',
      listViewTitle: 'Vista elenco: righe estese',
      searchPlaceholder: 'Cerca talenti, competenze o parole chiave...',
      toggleFilters: 'Attiva filtri avanzati',
      filters: 'Filtri',
      browsing: 'Navigando:',
      suggestions: {
        skill: 'Aggiungi come filtro competenze',
        category: 'Categoria',
        inCategory: 'in {name}'
      }
    }
  },
  'pt-PT': {
    ContactPage: {
      hero: {
        titlePrefix: 'Entre em',
        titleAccent: 'contacto',
        description: 'Tens perguntas sobre a 3YESES? Estamos aqui para ajudar-te a ligar a oportunidades e talentos.'
      },
      cards: {
        email: {
          title: 'Envia-nos um e-mail',
          subtitle: 'Para pedidos gerais'
        },
        call: {
          title: 'Liga-nos',
          subtitle: 'Seg-Sex 9h-18h GMT'
        },
        visit: {
          title: 'Visita-nos',
          subtitle: 'Localização do nosso escritório'
        }
      },
      form: {
        successTitle: 'Mensagem enviada!',
        successDescription: 'Obrigado por nos contatar. Respondemos em 24 horas.',
        sendAnother: 'Enviar outra mensagem',
        title: 'Envia-nos uma mensagem',
        description: 'Preenche o formulário e responderemos o mais breve possível.',
        fullName: 'Nome completo',
        emailAddress: 'Endereço de e-mail',
        subject: 'Assunto',
        message: 'Mensagem',
        placeholders: {
          name: 'João Silva',
          email: 'joao@exemplo.com',
          subject: 'Como podemos ajudar?',
          message: 'Conta-nos mais sobre o teu pedido...'
        },
        sending: 'A enviar...',
        sendButton: 'Enviar mensagem'
      }
    },
    SearchResultsPage: {
      title: 'Pesquisa de Talentos',
      resultsFor: 'Resultados para "{searchTerm}"',
      resultsCount: '{count, plural, one {# talento encontrado} other {# talentos encontrados}}',
      gridViewTitle: 'Vista de grelha: cartões compactos',
      listViewTitle: 'Vista de lista: linhas expandidas',
      searchPlaceholder: 'Procura talentos, habilidades ou palavras-chave...',
      toggleFilters: 'Alternar filtros avançados',
      filters: 'Filtros',
      browsing: 'A navegar:',
      suggestions: {
        skill: 'Adicionar como filtro de competência',
        category: 'Categoria',
        inCategory: 'em {name}'
      }
    }
  },
  'ru-RU': {
    ContactPage: {
      hero: {
        titlePrefix: 'Свяжитесь',
        titleAccent: 'с нами',
        description: 'Есть вопросы про 3YESES? Мы поможем вам связаться с возможностями и талантами.'
      },
      cards: {
        email: {
          title: 'Напишите нам',
          subtitle: 'Для общих запросов'
        },
        call: {
          title: 'Позвоните нам',
          subtitle: 'Пн-Пт 9:00-18:00 GMT'
        },
        visit: {
          title: 'Посетите нас',
          subtitle: 'Наш офис'
        }
      },
      form: {
        successTitle: 'Сообщение отправлено!',
        successDescription: 'Спасибо за обращение. Мы ответим в течение 24 часов.',
        sendAnother: 'Отправить еще сообщение',
        title: 'Отправьте нам сообщение',
        description: 'Заполните форму, и мы ответим как можно скорее.',
        fullName: 'Полное имя',
        emailAddress: 'Адрес электронной почты',
        subject: 'Тема',
        message: 'Сообщение',
        placeholders: {
          name: 'Иван Иванов',
          email: 'ivan@primer.ru',
          subject: 'Чем мы можем помочь?',
          message: 'Расскажите больше о вашем вопросе...'
        },
        sending: 'Отправка...',
        sendButton: 'Отправить сообщение'
      }
    },
    SearchResultsPage: {
      title: 'Поиск талантов',
      resultsFor: 'Результаты для «{searchTerm}»',
      resultsCount: '{count, plural, one {# талант найден} other {# талантов найдено}}',
      gridViewTitle: 'Сеточный вид: компактные карточки',
      listViewTitle: 'Списочный вид: расширенные строки',
      searchPlaceholder: 'Ищите таланты, навыки или ключевые слова...',
      toggleFilters: 'Переключить расширенные фильтры',
      filters: 'Фильтры',
      browsing: 'Просмотр:',
      suggestions: {
        skill: 'Добавить как фильтр навыка',
        category: 'Категория',
        inCategory: 'в {name}'
      }
    }
  },
  'ja-JP': {
    ContactPage: {
      hero: {
        titlePrefix: 'お問い合わせ',
        titleAccent: 'ください',
        description: '3YESESについてご質問がありますか？機会やタレントとつながるお手伝いをします。'
      },
      cards: {
        email: {
          title: 'メールを送る',
          subtitle: '一般的なお問い合わせはこちら'
        },
        call: {
          title: 'お電話ください',
          subtitle: '月〜金 9時〜18時 GMT'
        },
        visit: {
          title: 'お越しください',
          subtitle: 'オフィスの場所'
        }
      },
      form: {
        successTitle: 'メッセージ送信完了！',
        successDescription: 'お問い合わせありがとうございます。24時間以内に返信いたします。',
        sendAnother: '別のメッセージを送る',
        title: 'メッセージを送る',
        description: '以下のフォームに記入してください。できるだけ早く返信いたします。',
        fullName: '氏名',
        emailAddress: 'メールアドレス',
        subject: '件名',
        message: 'メッセージ',
        placeholders: {
          name: '山田 太郎',
          email: 'taro@example.com',
          subject: 'どのようにお手伝いできますか？',
          message: 'お問い合わせ内容を詳しくお書きください...'
        },
        sending: '送信中…',
        sendButton: 'メッセージを送信'
      }
    },
    SearchResultsPage: {
      title: 'タレント検索',
      resultsFor: '「{searchTerm}」の検索結果',
      resultsCount: '{count, plural, one {# 人のタレントが見つかりました} other {# 人のタレントが見つかりました}}',
      gridViewTitle: 'グリッド表示：コンパクトカード',
      listViewTitle: 'リスト表示：拡張行',
      searchPlaceholder: 'タレント、スキル、キーワードを検索...',
      toggleFilters: '詳細フィルターを切り替え',
      filters: 'フィルター',
      browsing: '閲覧中：',
      suggestions: {
        skill: 'スキルフィルターとして追加',
        category: 'カテゴリ',
        inCategory: '{name}内'
      }
    }
  },
  'zh-CN': {
    ContactPage: {
      hero: {
        titlePrefix: '联系我们',
        titleAccent: '联系',
        description: '对 3YESES 有疑问？我们随时为您提供帮助，连接机会与人才。'
      },
      cards: {
        email: {
          title: '给我们发邮件',
          subtitle: '用于一般咨询'
        },
        call: {
          title: '给我们打电话',
          subtitle: '周一至周五 9am-6pm GMT'
        },
        visit: {
          title: '来访我们',
          subtitle: '我们的办公地点'
        }
      },
      form: {
        successTitle: '消息已发送！',
        successDescription: '感谢您的联系。我们将在 24 小时内回复。',
        sendAnother: '发送另一条消息',
        title: '给我们留言',
        description: '填写以下表单，我们会尽快回复。',
        fullName: '全名',
        emailAddress: '电子邮件地址',
        subject: '主题',
        message: '消息',
        placeholders: {
          name: '张三',
          email: 'zhang@example.com',
          subject: '我们能为您做些什么？',
          message: '告诉我们您的问题详情...'
        },
        sending: '发送中...',
        sendButton: '发送消息'
      }
    },
    SearchResultsPage: {
      title: '人才搜索',
      resultsFor: '“{searchTerm}”的结果',
      resultsCount: '{count, plural, one {找到 # 位人才} other {找到 # 位人才}}',
      gridViewTitle: '网格视图：紧凑卡片',
      listViewTitle: '列表视图：扩展行',
      searchPlaceholder: '搜索人才、技能或关键字...',
      toggleFilters: '切换高级筛选',
      filters: '筛选',
      browsing: '浏览：',
      suggestions: {
        skill: '添加为技能筛选',
        category: '类别',
        inCategory: '在 {name}'
      }
    }
  },
  ar: {
    ContactPage: {
      hero: {
        titlePrefix: 'تواصل',
        titleAccent: 'معنا',
        description: 'هل لديك أسئلة حول 3YESES؟ نحن هنا لمساعدتك في التواصل مع الفرص والموهوبين.'
      },
      cards: {
        email: {
          title: 'راسلنا',
          subtitle: 'للأسئلة العامة'
        },
        call: {
          title: 'اتصل بنا',
          subtitle: 'الإثنين-الجمعة 9ص-6م بتوقيت غرينتش'
        },
        visit: {
          title: 'قم بزيارتنا',
          subtitle: 'موقع مكتبنا'
        }
      },
      form: {
        successTitle: 'تم إرسال الرسالة!',
        successDescription: 'شكرًا لتواصلك معنا. سنرد خلال 24 ساعة.',
        sendAnother: 'أرسل رسالة أخرى',
        title: 'أرسل لنا رسالة',
        description: 'املأ النموذج وسنرد عليك في أقرب وقت ممكن.',
        fullName: 'الاسم الكامل',
        emailAddress: 'عنوان البريد الإلكتروني',
        subject: 'الموضوع',
        message: 'الرسالة',
        placeholders: {
          name: 'أحمد علي',
          email: 'ahmed@example.com',
          subject: 'كيف يمكننا مساعدتك؟',
          message: 'أخبرنا المزيد عن استفسارك...'
        },
        sending: 'جاري الإرسال...',
        sendButton: 'إرسال الرسالة'
      }
    },
    SearchResultsPage: {
      title: 'بحث عن المواهب',
      resultsFor: 'النتائج لـ "{searchTerm}"',
      resultsCount: '{count, plural, one {# موهبة وجدت} other {# مواهب وجدت}}',
      gridViewTitle: 'عرض الشبكة: بطاقات مضغوطة',
      listViewTitle: 'عرض القائمة: أسطر موسعة',
      searchPlaceholder: 'ابحث عن مواهب أو مهارات أو كلمات مفتاحية...',
      toggleFilters: 'تبديل الفلاتر المتقدمة',
      filters: 'الفلاتر',
      browsing: 'تصفح:',
      suggestions: {
        skill: 'أضف كفلتر مهارة',
        category: 'فئة',
        inCategory: 'في {name}'
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
  console.log(`Patched ContactPage and SearchResultsPage translations for ${locale}`);
}
