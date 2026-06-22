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
          description: 'Geh aufs Ganze. Ein Jahr, um durchzustarten.',
          badge: 'Bestes Angebot'
        }
      },
      features: {
        profile: 'Ein Profil, das auffällt',
        uploads: 'Lade alles hoch – keine Limits, niemals',
        search: 'Spring in jeder Suche nach vorn'
      },
      trust: {
        noLockIn: 'Keine Bindung – jederzeit kündbar',
        secureCheckout: 'Sicherer Stripe-Checkout',
        liveImmediately: 'Live, sobald du bezahlst'
      },
      activeSubscription: {
        banner: '✓ Du hast bereits ein aktives Standard Access Abonnement.',
        manage: 'Abonnement verwalten →'
      },
      planName: 'Standard Access',
      aria: {
        price: 'Preis: {price} {period}',
        subscribePlan: 'Standard Access abonnieren – {plan}',
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
        description: 'Kein Schnickschnack. Keine leeren Versprechen. Nur Tools, damit du gesehen wirst.'
      },
      footer: {
        secureNote: 'Gesichert via Stripe. Kündige jederzeit in deinem Dashboard.',
        accountPrompt: 'Hast du bereits ein Konto?',
        login: 'Einloggen'
      },
      errors: {
        checkoutFailed: 'Checkout-Session konnte nicht erstellt werden',
        missingCheckoutUrl: 'Keine Checkout-URL erhalten',
        generic: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.'
      }
    }
  },
  'es-ES': {
    PricingPage: {
      hero: {
        eyebrow: 'Tu momento empieza aquí',
        titlePrefix: '¿Listo para tu',
        titleAccent: 'tres síes?',
        description: 'Muestra tu trabajo. Tus fotos, videos y reels: todo en un lugar, visto por las personas adecuadas.'
      },
      plans: {
        sixMonths: {
          label: '6 meses',
          price: '£10',
          period: '6 meses',
          subtext: 'Menos que un café al mes',
          description: 'Pruébalo. Sin compromisos a largo plazo.'
        },
        twelveMonths: {
          label: '12 meses',
          price: '£20',
          period: 'año',
          subtext: 'Mismo precio. Doble recorrido.',
          description: 'Ve con todo. Un año entero para lograr tu gran oportunidad.',
          badge: 'Mejor valor'
        }
      },
      features: {
        profile: 'Un perfil diseñado para llamar la atención',
        uploads: 'Sube todo: sin límites, nunca',
        search: 'Anticípate en cada búsqueda'
      },
      trust: {
        noLockIn: 'Sin compromiso: cancela cuando quieras',
        secureCheckout: 'Checkout seguro con Stripe',
        liveImmediately: 'En vivo en cuanto pagues'
      },
      activeSubscription: {
        banner: '✓ Ya tienes una suscripción activa de Standard Access.',
        manage: 'Gestionar suscripción →'
      },
      planName: 'Standard Access',
      aria: {
        price: 'Precio: {price} {period}',
        subscribePlan: 'Suscribirse a Standard Access - {plan}',
        percentOff: '{percent}% de descuento',
        waitingForYou: 'Lo que te espera'
      },
      saveAmount: 'Ahorra {amount}',
      buttons: {
        redirecting: 'Redirigiendo a Stripe…',
        alreadySubscribed: 'Ya suscrito',
        subscribe: 'Suscribirse con Stripe'
      },
      unlock: {
        stage: 'Tu escenario',
        showEverything: 'Mostrar todo',
        cutQueue: 'Saltar la cola',
        description: 'Sin florituras. Sin funciones falsas. Solo herramientas para que te vean.'
      },
      footer: {
        secureNote: 'Seguro con Stripe. Cancela en cualquier momento desde tu panel.',
        accountPrompt: '¿Ya tienes una cuenta?',
        login: 'Iniciar sesión'
      },
      errors: {
        checkoutFailed: 'No se pudo crear la sesión de pago',
        missingCheckoutUrl: 'No se recibió URL de pago',
        generic: 'Algo salió mal. Por favor inténtalo de nuevo.'
      }
    }
  },
  'fr-FR': {
    PricingPage: {
      hero: {
        eyebrow: 'Votre moment commence ici',
        titlePrefix: 'Prêt pour votre',
        titleAccent: 'trois oui ?',
        description: 'Mettez votre travail en avant. Vos photos, vidéos et reels — tout au même endroit, vu par les bonnes personnes.'
      },
      plans: {
        sixMonths: {
          label: '6 mois',
          price: '£10',
          period: '6 mois',
          subtext: 'Moins qu’un café par mois',
          description: 'Tentez le coup. Pas d’engagement long terme.'
        },
        twelveMonths: {
          label: '12 mois',
          price: '£20',
          period: 'an',
          subtext: 'Même prix. Deux fois plus de temps.',
          description: 'Donnez tout. Une année entière pour percer.',
          badge: 'Meilleur rapport qualité-prix'
        }
      },
      features: {
        profile: 'Un profil conçu pour attirer l’attention',
        uploads: 'Téléchargez tout — sans limites, jamais',
        search: 'Passez devant dans chaque recherche'
      },
      trust: {
        noLockIn: 'Sans engagement — résiliez quand vous voulez',
        secureCheckout: 'Paiement sécurisé par Stripe',
        liveImmediately: 'En ligne dès votre paiement'
      },
      activeSubscription: {
        banner: '✓ Vous avez déjà un abonnement Standard Access actif.',
        manage: 'Gérer votre abonnement →'
      },
      planName: 'Standard Access',
      aria: {
        price: 'Prix : {price} {period}',
        subscribePlan: 'S’abonner à Standard Access — {plan}',
        percentOff: '{percent}% de réduction',
        waitingForYou: 'Ce qui vous attend'
      },
      saveAmount: 'Économisez {amount}',
      buttons: {
        redirecting: 'Redirection vers Stripe…',
        alreadySubscribed: 'Déjà abonné',
        subscribe: 'S’abonner avec Stripe'
      },
      unlock: {
        stage: 'Votre scène',
        showEverything: 'Tout afficher',
        cutQueue: 'Couper la file',
        description: 'Pas de fioritures. Pas de fausses fonctionnalités. Juste les outils pour être vu.'
      },
      footer: {
        secureNote: 'Sécurisé via Stripe. Annulez à tout moment depuis votre tableau de bord.',
        accountPrompt: 'Vous avez déjà un compte ?',
        login: 'Se connecter'
      },
      errors: {
        checkoutFailed: 'Échec de la création de la session de paiement',
        missingCheckoutUrl: 'Aucune URL de paiement reçue',
        generic: 'Quelque chose s’est mal passé. Veuillez réessayer.'
      }
    }
  },
  'it-IT': {
    PricingPage: {
      hero: {
        eyebrow: 'Il tuo palcoscenico inizia qui',
        titlePrefix: 'Pronto per il tuo',
        titleAccent: 'tre sì?',
        description: 'Metti in mostra il tuo lavoro. Le tue foto, i video e i reel — tutto in un unico posto, visto dalle persone giuste.'
      },
      plans: {
        sixMonths: {
          label: '6 mesi',
          price: '£10',
          period: '6 mesi',
          subtext: 'Meno di un caffè al mese',
          description: 'Provalo. Nessun impegno a lungo termine.'
        },
        twelveMonths: {
          label: '12 mesi',
          price: '£20',
          period: 'anno',
          subtext: 'Stesso prezzo. Doppio spazio.',
          description: 'Scommetti tutto. Un anno intero per sfondare.',
          badge: 'Miglior valore'
        }
      },
      features: {
        profile: 'Un profilo creato per farsi notare',
        uploads: 'Carica tutto - senza limiti, mai',
        search: 'Taglia la coda in ogni ricerca'
      },
      trust: {
        noLockIn: 'Nessun vincolo - annulla quando vuoi',
        secureCheckout: 'Checkout sicuro con Stripe',
        liveImmediately: 'Attivo non appena paghi'
      },
      activeSubscription: {
        banner: '✓ Hai già un abbonamento Standard Access attivo.',
        manage: 'Gestisci il tuo abbonamento →'
      },
      planName: 'Standard Access',
      aria: {
        price: 'Prezzo: {price} {period}',
        subscribePlan: 'Abbonati a Standard Access - {plan}',
        percentOff: '{percent}% di sconto',
        waitingForYou: 'Ciò che ti aspetta'
      },
      saveAmount: 'Risparmia {amount}',
      buttons: {
        redirecting: 'Reindirizzamento a Stripe…',
        alreadySubscribed: 'Già abbonato',
        subscribe: 'Abbonati con Stripe'
      },
      unlock: {
        stage: 'Il tuo palco',
        showEverything: 'Mostra tutto',
        cutQueue: 'Taglia la fila',
        description: 'Niente fronzoli. Nessuna funzione finta. Solo strumenti per farti vedere.'
      },
      footer: {
        secureNote: 'Protetto da Stripe. Disdici in qualsiasi momento dal tuo dashboard.',
        accountPrompt: 'Hai già un account?',
        login: 'Accedi'
      },
      errors: {
        checkoutFailed: 'Impossibile creare la sessione di checkout',
        missingCheckoutUrl: 'Nessuna URL di checkout ricevuta',
        generic: 'Qualcosa è andato storto. Riprova.'
      }
    }
  },
  'pt-PT': {
    PricingPage: {
      hero: {
        eyebrow: 'O teu palco começa aqui',
        titlePrefix: 'Pronto para o teu',
        titleAccent: 'três sim?',
        description: 'Mostra o teu trabalho. As tuas fotos, vídeos e reels – tudo num só lugar, visto pelas pessoas certas.'
      },
      plans: {
        sixMonths: {
          label: '6 meses',
          price: '£10',
          period: '6 meses',
          subtext: 'Menos do que um café por mês',
          description: 'Experimenta. Sem compromisso a longo prazo.'
        },
        twelveMonths: {
          label: '12 meses',
          price: '£20',
          period: 'ano',
          subtext: 'Mesmo preço. O dobro do tempo.',
          description: 'Arrisca tudo. Um ano inteiro para alcançar o teu momento.',
          badge: 'Melhor valor'
        }
      },
      features: {
        profile: 'Um perfil criado para chamar atenção',
        uploads: 'Carrega tudo - sem limites, nunca',
        search: 'Passa à frente em todas as pesquisas'
      },
      trust: {
        noLockIn: 'Sem compromisso - cancela quando quiseres',
        secureCheckout: 'Checkout seguro com Stripe',
        liveImmediately: 'Ao vivo assim que pagares'
      },
      activeSubscription: {
        banner: '✓ Já tens uma subscrição Standard Access ativa.',
        manage: 'Gerir subscrição →'
      },
      planName: 'Standard Access',
      aria: {
        price: 'Preço: {price} {period}',
        subscribePlan: 'Subscrever Standard Access - {plan}',
        percentOff: '{percent}% de desconto',
        waitingForYou: 'O que te espera'
      },
      saveAmount: 'Poupa {amount}',
      buttons: {
        redirecting: 'A redirecionar para o Stripe…',
        alreadySubscribed: 'Já subscrito',
        subscribe: 'Subscrever com Stripe'
      },
      unlock: {
        stage: 'O teu palco',
        showEverything: 'Mostrar tudo',
        cutQueue: 'Cortar a fila',
        description: 'Sem floreados. Sem funcionalidades falsas. Apenas ferramentas para te fazerem ver.'
      },
      footer: {
        secureNote: 'Seguro via Stripe. Cancela a qualquer momento no teu dashboard.',
        accountPrompt: 'Já tens uma conta?',
        login: 'Iniciar sessão'
      },
      errors: {
        checkoutFailed: 'Falha ao criar sessão de checkout',
        missingCheckoutUrl: 'Nenhuma URL de checkout recebida',
        generic: 'Algo correu mal. Por favor, tenta novamente.'
      }
    }
  },
  'ru-RU': {
    PricingPage: {
      hero: {
        eyebrow: 'Твой момент начинается здесь',
        titlePrefix: 'Готов к своему',
        titleAccent: 'трем да?',
        description: 'Покажи свою работу. Твои фото, видео и reels — всё в одном месте, увидят нужные люди.'
      },
      plans: {
        sixMonths: {
          label: '6 месяцев',
          price: '£10',
          period: '6 месяцев',
          subtext: 'Меньше, чем кофе в месяц',
          description: 'Попробуй. Без долгосрочных обязательств.'
        },
        twelveMonths: {
          label: '12 месяцев',
          price: '£20',
          period: 'год',
          subtext: 'Та же цена. Вдвое больше времени.',
          description: 'Иди до конца. Целый год, чтобы прорваться.',
          badge: 'Лучшее предложение'
        }
      },
      features: {
        profile: 'Профиль, созданный для привлечения внимания',
        uploads: 'Загружай всё — без лимитов, никогда',
        search: 'Вырвись вперёд в каждом поиске'
      },
      trust: {
        noLockIn: 'Без привязки — отмени когда угодно',
        secureCheckout: 'Платёж защищён Stripe',
        liveImmediately: 'Станет активным сразу после оплаты'
      },
      activeSubscription: {
        banner: '✓ У вас уже есть активная подписка Standard Access.',
        manage: 'Управлять подпиской →'
      },
      planName: 'Standard Access',
      aria: {
        price: 'Цена: {price} {period}',
        subscribePlan: 'Подписаться на Standard Access — {plan}',
        percentOff: '{percent}% скидка',
        waitingForYou: 'Что тебя ожидает'
      },
      saveAmount: 'Сэкономьте {amount}',
      buttons: {
        redirecting: 'Перенаправляем на Stripe…',
        alreadySubscribed: 'Уже подписаны',
        subscribe: 'Подписаться через Stripe'
      },
      unlock: {
        stage: 'Твоя сцена',
        showEverything: 'Показать всё',
        cutQueue: 'Пропустить очередь',
        description: 'Никакой ерунды. Никаких ложных функций. Только инструменты, чтобы тебя увидели.'
      },
      footer: {
        secureNote: 'Защищено Stripe. Отмените в любое время в своей панели.',
        accountPrompt: 'Уже есть аккаунт?',
        login: 'Войти'
      },
      errors: {
        checkoutFailed: 'Не удалось создать сессию оплаты',
        missingCheckoutUrl: 'Не получена URL оплаты',
        generic: 'Что-то пошло не так. Пожалуйста, попробуйте еще раз.'
      }
    }
  },
  'ja-JP': {
    PricingPage: {
      hero: {
        eyebrow: 'あなたのスポットライトはここから始まる',
        titlePrefix: 'あなたの',
        titleAccent: '三つのイエス？',
        description: 'あなたの作品を見せましょう。写真、動画、リールをひとまとめにして、適切な人々に届けます。'
      },
      plans: {
        sixMonths: {
          label: '6ヶ月',
          price: '£10',
          period: '6ヶ月',
          subtext: '月々のコーヒーより安い',
          description: 'まずは試してみましょう。長期契約は不要です。'
        },
        twelveMonths: {
          label: '12ヶ月',
          price: '£20',
          period: '年',
          subtext: '同じ価格。2倍の期間。',
          description: '本気で取り組もう。1年をかけてチャンスをつかむ。',
          badge: 'ベストバリュー'
        }
      },
      features: {
        profile: '目を引くプロフィール',
        uploads: 'すべてアップロード — 限界なし、ずっと',
        search: 'すべての検索で優先される'
      },
      trust: {
        noLockIn: '契約不要 — いつでも解約可能',
        secureCheckout: 'Stripeによる安全な決済',
        liveImmediately: '支払い後すぐに公開'
      },
      activeSubscription: {
        banner: '✓ 既にStandard Accessの有効なサブスクリプションがあります。',
        manage: 'サブスクリプションを管理 →'
      },
      planName: 'Standard Access',
      aria: {
        price: '料金: {price} {period}',
        subscribePlan: 'Standard Accessに登録 — {plan}',
        percentOff: '{percent}%オフ',
        waitingForYou: 'あなたを待っているもの'
      },
      saveAmount: '{amount}を節約',
      buttons: {
        redirecting: 'Stripeにリダイレクトしています…',
        alreadySubscribed: 'すでに登録済み',
        subscribe: 'Stripeで登録'
      },
      unlock: {
        stage: 'あなたのステージ',
        showEverything: 'すべて表示',
        cutQueue: '待ち行列をスキップ',
        description: '余計なものはなし。偽の機能はなし。あなたを見せるためのツールだけ。'
      },
      footer: {
        secureNote: 'Stripe経由で保護されています。ダッシュボードからいつでもキャンセルできます。',
        accountPrompt: 'すでにアカウントをお持ちですか？',
        login: 'ログイン'
      },
      errors: {
        checkoutFailed: 'チェックアウトセッションの作成に失敗しました',
        missingCheckoutUrl: 'チェックアウトURLが受信されませんでした',
        generic: '問題が発生しました。もう一度お試しください。'
      }
    }
  },
  'zh-CN': {
    PricingPage: {
      hero: {
        eyebrow: '你的聚光灯从这里开始',
        titlePrefix: '准备好你的',
        titleAccent: '三个是吗？',
        description: '展示你的作品。你的照片、视频和 reels——全部集中在一个地方，让重要的人看到。'
      },
      plans: {
        sixMonths: {
          label: '6 个月',
          price: '£10',
          period: '6 个月',
          subtext: '每月不到一杯咖啡的价格',
          description: '先试试看。无需长期承诺。'
        },
        twelveMonths: {
          label: '12 个月',
          price: '£20',
          period: '年',
          subtext: '价格相同。时长翻倍。',
          description: '全力以赴。一整年时间让你脱颖而出。',
          badge: '最佳价值'
        }
      },
      features: {
        profile: '打造引人注目的个人主页',
        uploads: '上传所有内容——永不限制',
        search: '在每次搜索中抢先一步'
      },
      trust: {
        noLockIn: '无绑定——随时取消',
        secureCheckout: 'Stripe 安全结账',
        liveImmediately: '付款后立即上线'
      },
      activeSubscription: {
        banner: '✓ 你已拥有一个有效的 Standard Access 订阅。',
        manage: '管理你的订阅 →'
      },
      planName: 'Standard Access',
      aria: {
        price: '价格：{price} {period}',
        subscribePlan: '订阅 Standard Access - {plan}',
        percentOff: '{percent}% 折扣',
        waitingForYou: '等你来体验'
      },
      saveAmount: '省下 {amount}',
      buttons: {
        redirecting: '正在重定向到 Stripe…',
        alreadySubscribed: '已订阅',
        subscribe: '通过 Stripe 订阅'
      },
      unlock: {
        stage: '你的舞台',
        showEverything: '显示全部',
        cutQueue: '优先排队',
        description: '没有花哨。没有虚假功能。只有让你被看见的工具。'
      },
      footer: {
        secureNote: '通过 Stripe 保护。你可以随时在仪表板中取消。',
        accountPrompt: '已经有账户了吗？',
        login: '登录'
      },
      errors: {
        checkoutFailed: '创建结账会话失败',
        missingCheckoutUrl: '未收到结账链接',
        generic: '出现错误。请重试。'
      }
    }
  },
  ar: {
    PricingPage: {
      hero: {
        eyebrow: 'يبدأ ظهورك هنا',
        titlePrefix: 'هل أنت مستعد لـ',
        titleAccent: 'ثلاثة نعم؟',
        description: 'اعرض عملك. صورك، مقاطع الفيديو، وريلز - كلها في مكان واحد، يراها الأشخاص المناسبون.'
      },
      plans: {
        sixMonths: {
          label: '6 أشهر',
          price: '£10',
          period: '6 أشهر',
          subtext: 'أقل من سعر فنجان قهوة شهريًا',
          description: 'جربها. لا يوجد التزام طويل الأجل.'
        },
        twelveMonths: {
          label: '12 شهرًا',
          price: '£20',
          period: 'سنة',
          subtext: 'نفس السعر. ضعف الفترة.',
          description: 'اذهب بكل ما لديك. عام كامل لتحقق انطلاقتك.',
          badge: 'أفضل قيمة'
        }
      },
      features: {
        profile: 'ملف شخصي يجذب الأنظار',
        uploads: 'ارفع كل شيء - بدون حدود، أبدًا',
        search: 'تخطَّ الصف في كل بحث'
      },
      trust: {
        noLockIn: 'بدون التزام - ألغِ في أي وقت',
        secureCheckout: 'دفع آمن عبر Stripe',
        liveImmediately: 'يبث مباشرة بعد الدفع'
      },
      activeSubscription: {
        banner: '✓ لديك بالفعل اشتراك Standard Access نشط.',
        manage: 'إدارة الاشتراك →'
      },
      planName: 'Standard Access',
      aria: {
        price: 'السعر: {price} {period}',
        subscribePlan: 'اشترك في Standard Access - {plan}',
        percentOff: '{percent}% خصم',
        waitingForYou: 'ما ينتظرك'
      },
      saveAmount: 'وفر {amount}',
      buttons: {
        redirecting: 'جارٍ إعادة التوجيه إلى Stripe…',
        alreadySubscribed: 'مشترك بالفعل',
        subscribe: 'اشترك عبر Stripe'
      },
      unlock: {
        stage: 'منبرك',
        showEverything: 'عرض الكل',
        cutQueue: 'قص الطابور',
        description: 'لا زخرفة. لا ميزات زائفة. فقط أدوات لتلفت الأنظار.'
      },
      footer: {
        secureNote: 'مؤمن عبر Stripe. يمكنك إلغاء الاشتراك في أي وقت من لوحة القيادة.',
        accountPrompt: 'هل لديك حساب بالفعل؟',
        login: 'تسجيل الدخول'
      },
      errors: {
        checkoutFailed: 'فشل إنشاء جلسة الدفع',
        missingCheckoutUrl: 'لم يتم استلام رابط الدفع',
        generic: 'حدث خطأ. يرجى المحاولة مرة أخرى.'
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
  console.log(`Patched PricingPage translations for ${locale}`);
}
