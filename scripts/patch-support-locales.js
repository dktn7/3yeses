#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const messagesDir = path.join(__dirname, '..', 'messages');
const translations = {
  'de-DE': {
    support: {
      faqCountLabel: 'Häufige Fragen',
      portfolioTitle: 'Portfolio',
      notificationsTitle: 'Benachrichtigungen &',
      formDescription: 'Beschreibung',
      catCommunity: 'Gemeinschaft',
      catSupport: 'Unterstützung & Tickets',
      billingHelp: {
        ticketCategory: 'Abrechnung & Abonnements',
        faqCostQ: 'Wie viel kostet 3YESES?',
        faqCostA: 'Ein aktives Abonnement ist erforderlich, um die Plattform zu nutzen. Du abonnierst während der Anmeldung - wähle zwischen GBP10 für 6 Monate oder GBP20 für 12 Monate (bestes Angebot). Beide Pläne enthalten identische Funktionen: unbegrenzte Portfolio-Uploads, vollständige Profilanpassung, priorisierte Suchplatzierung, Analyse-Dashboard, Kommentare, Likes und Community-Funktionen. Es gibt keine versteckten Gebühren.',
        faqSubscribeQ: 'Wie abonniere ich?',
        faqSubscribeA: 'Das Abonnement erfolgt im Rahmen des Anmeldevorgangs. Nachdem du dein Konto erstellt und dein Alter bestätigt hast, wähle die Laufzeit deines Plans (6 oder 12 Monate) und schließe dann den sicheren Stripe-Checkout ab. Dein Konto wird sofort aktiviert - keine Wartezeit.',
        faqCancelQ: 'Kann ich mein Abonnement kündigen?',
        faqCancelA: 'Ja - kündige jederzeit im Dashboard → Abonnement. Du behältst vollen Zugriff bis zum Ende deines aktuellen Abrechnungszeitraums. Dein Profil, Portfolio, Kommentare und Analysedaten bleiben erhalten. Du kannst jederzeit erneut abonnieren, um dort weiterzumachen, wo du aufgehört hast. Es fallen keine Kündigungsgebühren an.',
        faqExpireQ: 'Was passiert, wenn mein Abonnement abläuft?',
        faqExpireA: 'Wenn dein Abonnement endet, wird dein Plattformzugriff pausiert. Du kannst dich nicht einloggen, keine Inhalte hochladen oder mit der Community interagieren. Dein Profil, Portfolio-Elemente und alle Daten bleiben jedoch erhalten und werden vollständig wiederhergestellt, wenn du erneut abonnierst.',
        faqInvoiceQ: 'Wie erhalte ich eine Rechnung?',
        faqInvoiceA: 'Gehe zu Dashboard → Abonnement, um deine Abrechnungshistorie anzuzeigen. Alle Rechnungen werden von Stripe erstellt und verwaltet. Du kannst PDF-Rechnungen für jede frühere Zahlung direkt von dieser Seite herunterladen.',
        faqSwitchPlanQ: 'Kann ich zwischen 6-Monats- und 12-Monats-Plänen wechseln?',
        faqSwitchPlanA: 'Wenn dein aktueller Abonnementzeitraum endet, kannst du bei der Verlängerung eine andere Laufzeit wählen. Die Änderung tritt zu Beginn deines nächsten Abrechnungszyklus in Kraft. Beide Pläne enthalten identische Funktionen.',
        guideSubscriptionTitle: 'Verstehe dein Abonnement',
        guideSubscriptionContent: 'Ein Abonnement ist erforderlich, um 3YESES zu nutzen. Du wählst deinen Plan während der Anmeldung: GBP10 für 6 Monate oder GBP20 für 12 Monate (bestes Angebot). Beide Pläne enthalten identische Funktionen - der einzige Unterschied ist die Abrechnungsdauer.',
        guideSecurityTitle: 'Zahlungssicherheit',
        guideSecurityContent: 'Alle Zahlungen werden sicher über Stripe verarbeitet. Wir speichern niemals deine Kartendaten auf unseren Servern. Stripe ist PCI DSS Level 1 zertifiziert - die höchste Sicherheitsstufe in der Zahlungsbranche.',
        guideRefundTitle: 'Rückerstattungsrichtlinie',
        guideRefundContent: 'Wenn du ein technisches Problem hast, das dich daran hindert, die Plattform zu nutzen, kontaktiere den Support innerhalb von 14 Tagen nach der Zahlung für eine Überprüfung. Rückerstattungen werden im Einzelfall geprüft.'
      }
    }
  },
  'es-ES': {
    support: {
      faqCountLabel: 'Preguntas frecuentes',
      portfolioTitle: 'Portafolio',
      notificationsTitle: 'Notificaciones &',
      formDescription: 'Descripción',
      catCommunity: 'Comunidad',
      catSupport: 'Soporte & Tickets',
      billingHelp: {
        ticketCategory: 'Facturación & Suscripciones',
        faqCostQ: '¿Cuánto cuesta 3YESES?',
        faqCostA: 'Se requiere una suscripción activa para usar la plataforma. Te suscribes durante el registro: elige entre GBP10 por 6 meses o GBP20 por 12 meses (mejor valor). Ambos planes incluyen funciones idénticas: cargas ilimitadas de portafolio, personalización completa del perfil, clasificación prioritaria en búsquedas, panel de análisis, comentarios, likes y funciones comunitarias. No hay tarifas ocultas.',
        faqSubscribeQ: '¿Cómo me suscribo?',
        faqSubscribeA: 'La suscripción se realiza como parte del proceso de registro. Después de crear tu cuenta y confirmar tu edad, elige la duración del plan (6 o 12 meses) y completa el pago seguro con Stripe. Tu cuenta se activa al instante, sin periodo de espera.',
        faqCancelQ: '¿Puedo cancelar mi suscripción?',
        faqCancelA: 'Sí: cancela en cualquier momento desde Dashboard → Suscripción. Conservas el acceso completo hasta el final de tu periodo de facturación actual. Tu perfil, portafolio, comentarios y datos analíticos se conservan. Vuelve a suscribirte en cualquier momento para continuar donde lo dejaste. No hay cargos por cancelación.',
        faqExpireQ: '¿Qué sucede cuando expira mi suscripción?',
        faqExpireA: 'Cuando tu suscripción finaliza, el acceso a la plataforma se pausa. No puedes iniciar sesión, subir contenido o interactuar con la comunidad. Sin embargo, tu perfil, elementos del portafolio y todos los datos se conservan y se restaurarán por completo cuando vuelvas a suscribirte.',
        faqInvoiceQ: '¿Cómo obtengo una factura?',
        faqInvoiceA: 'Ve a Dashboard → Suscripción para ver tu historial de facturación. Todas las facturas son generadas y gestionadas por Stripe. Puedes descargar facturas PDF de cualquier pago anterior directamente desde esta página.',
        faqSwitchPlanQ: '¿Puedo cambiar entre planes de 6 y 12 meses?',
        faqSwitchPlanA: 'Cuando finalice tu periodo de suscripción actual, puedes elegir una duración diferente al renovar. El cambio entra en vigor al comienzo de tu próximo ciclo de facturación. Ambos planes incluyen funciones idénticas.',
        guideSubscriptionTitle: 'Entendiendo tu suscripción',
        guideSubscriptionContent: 'La suscripción es obligatoria para usar 3YESES. Elige tu plan durante el registro: GBP10 por 6 meses o GBP20 por 12 meses (mejor valor). Ambos planes incluyen funciones idénticas; la única diferencia es la duración de la facturación.',
        guideSecurityTitle: 'Seguridad de pagos',
        guideSecurityContent: 'Todos los pagos se procesan de forma segura a través de Stripe. Nunca almacenamos los datos de tu tarjeta en nuestros servidores. Stripe está certificado PCI DSS Nivel 1, el nivel más alto de seguridad en la industria de pagos.',
        guideRefundTitle: 'Política de reembolsos',
        guideRefundContent: 'Si experimentas un problema técnico que te impide usar la plataforma, contacta con soporte dentro de los 14 días posteriores al pago para revisión. Los reembolsos se evalúan caso por caso.'
      }
    }
  },
  'fr-FR': {
    support: {
      faqCountLabel: 'FAQ',
      portfolioTitle: 'Portfolio',
      notificationsTitle: 'Notifications &',
      formDescription: 'Description',
      catCommunity: 'Communauté',
      catSupport: 'Assistance & Tickets',
      billingHelp: {
        ticketCategory: 'Facturation & Abonnements',
        faqCostQ: 'Combien coûte 3YESES ?',
        faqCostA: 'Un abonnement actif est requis pour utiliser la plateforme. Vous vous abonnez lors de l’inscription : choisissez entre 10 GBP pour 6 mois ou 20 GBP pour 12 mois (meilleure valeur). Les deux plans incluent les mêmes fonctionnalités : téléchargements illimités de portfolio, personnalisation complète du profil, classement prioritaire dans les recherches, tableau de bord analytique, commentaires, likes et fonctionnalités communautaires. Il n’y a pas de frais cachés.',
        faqSubscribeQ: 'Comment m’abonner ?',
        faqSubscribeA: 'L’abonnement a lieu lors du processus d’inscription. Après avoir créé votre compte et confirmé votre âge, choisissez la durée du plan (6 ou 12 mois), puis complétez le paiement sécurisé Stripe. Votre compte est activé instantanément, sans période d’attente.',
        faqCancelQ: 'Puis-je annuler mon abonnement ?',
        faqCancelA: 'Oui : annulez à tout moment depuis Dashboard → Abonnement. Vous conservez l’accès complet jusqu’à la fin de votre période de facturation actuelle. Votre profil, portfolio, commentaires et données analytiques sont conservés. Vous pouvez vous réabonner à tout moment pour reprendre là où vous vous étiez arrêté. Il n’y a pas de frais d’annulation.',
        faqExpireQ: 'Que se passe-t-il lorsque mon abonnement expire ?',
        faqExpireA: 'Lorsque votre abonnement se termine, l’accès à la plateforme est mis en pause. Vous ne pouvez pas vous connecter, télécharger du contenu ou interagir avec la communauté. Cependant, votre profil, vos éléments de portfolio et toutes les données sont conservés et seront entièrement restaurés lorsque vous vous réabonnerez.',
        faqInvoiceQ: 'Comment obtenir une facture ?',
        faqInvoiceA: 'Allez dans Dashboard → Abonnement pour voir votre historique de facturation. Toutes les factures sont générées et gérées par Stripe. Vous pouvez télécharger des factures PDF pour tout paiement antérieur directement depuis cette page.',
        faqSwitchPlanQ: 'Puis-je passer d’un plan de 6 mois à un plan de 12 mois ?',
        faqSwitchPlanA: 'Lorsque votre période d’abonnement actuelle se termine, vous pouvez choisir une durée différente lors du renouvellement. Le changement prend effet au début de votre prochain cycle de facturation. Les deux plans incluent les mêmes fonctionnalités.',
        guideSubscriptionTitle: 'Comprendre votre abonnement',
        guideSubscriptionContent: 'Un abonnement est obligatoire pour utiliser 3YESES. Choisissez votre plan lors de l’inscription : 10 GBP pour 6 mois ou 20 GBP pour 12 mois (meilleure valeur). Les deux plans incluent les mêmes fonctionnalités - la seule différence est la durée de facturation.',
        guideSecurityTitle: 'Sécurité des paiements',
        guideSecurityContent: 'Tous les paiements sont traités en toute sécurité via Stripe. Nous ne stockons jamais les informations de votre carte sur nos serveurs. Stripe est certifié PCI DSS niveau 1, le niveau de sécurité le plus élevé dans l’industrie des paiements.',
        guideRefundTitle: 'Politique de remboursement',
        guideRefundContent: 'Si vous rencontrez un problème technique qui vous empêche d’utiliser la plateforme, contactez le support dans les 14 jours suivant le paiement pour examen. Les remboursements sont évalués au cas par cas.'
      }
    }
  },
  'it-IT': {
    support: {
      faqCountLabel: 'Domande frequenti',
      portfolioTitle: 'Portfolio',
      notificationsTitle: 'Notifiche &',
      formDescription: 'Descrizione',
      catCommunity: 'Comunità',
      catSupport: 'Supporto & Ticket',
      billingHelp: {
        ticketCategory: 'Fatturazione & Abbonamenti',
        faqCostQ: 'Quanto costa 3YESES?',
        faqCostA: 'È necessario un abbonamento attivo per utilizzare la piattaforma. Ti abboni durante la registrazione: scegli tra GBP10 per 6 mesi o GBP20 per 12 mesi (miglior valore). Entrambi i piani includono le stesse funzionalità: caricamenti illimitati del portfolio, personalizzazione completa del profilo, posizionamento prioritario nei risultati di ricerca, dashboard analitico, commenti, like e funzioni comunitarie. Non ci sono costi nascosti.',
        faqSubscribeQ: 'Come mi abbono?',
        faqSubscribeA: 'L’abbonamento avviene come parte del processo di registrazione. Dopo aver creato il tuo account e confermato la tua età, scegli la durata del piano (6 o 12 mesi) e completa quindi il checkout sicuro Stripe. Il tuo account viene attivato immediatamente, senza periodo di attesa.',
        faqCancelQ: 'Posso annullare il mio abbonamento?',
        faqCancelA: 'Sì: annulla in qualsiasi momento da Dashboard → Abbonamento. Mantieni l’accesso completo fino alla fine del tuo periodo di fatturazione corrente. Il tuo profilo, portfolio, commenti e dati analitici vengono conservati. Puoi riabbonarti in qualsiasi momento per riprendere da dove avevi interrotto. Non ci sono penali di cancellazione.',
        faqExpireQ: 'Cosa succede quando il mio abbonamento scade?',
        faqExpireA: 'Quando il tuo abbonamento termina, l’accesso alla piattaforma viene sospeso. Non puoi effettuare il login, caricare contenuti o interagire con la community. Tuttavia, il tuo profilo, gli elementi del portfolio e tutti i dati vengono mantenuti e verranno ripristinati completamente quando ti riabbonnerai.',
        faqInvoiceQ: 'Come ottengo una fattura?',
        faqInvoiceA: 'Vai su Dashboard → Abbonamento per vedere la tua cronologia di fatturazione. Tutte le fatture sono generate e gestite da Stripe. Puoi scaricare fatture PDF per qualsiasi pagamento passato direttamente da questa pagina.',
        faqSwitchPlanQ: 'Posso passare da un piano da 6 mesi a uno da 12 mesi?',
        faqSwitchPlanA: 'Quando termina il tuo periodo di abbonamento attuale, puoi scegliere una durata diversa al rinnovo. Il cambiamento entra in vigore all’inizio del tuo prossimo ciclo di fatturazione. Entrambi i piani includono le stesse funzionalità.',
        guideSubscriptionTitle: 'Comprendi il tuo abbonamento',
        guideSubscriptionContent: 'L’abbonamento è obbligatorio per usare 3YESES. Scegli il tuo piano durante la registrazione: GBP10 per 6 mesi o GBP20 per 12 mesi (miglior valore). Entrambi i piani includono le stesse funzionalità; l’unica differenza è la durata della fatturazione.',
        guideSecurityTitle: 'Sicurezza dei pagamenti',
        guideSecurityContent: 'Tutti i pagamenti vengono elaborati in modo sicuro tramite Stripe. Non memorizziamo mai i dati della tua carta sui nostri server. Stripe è certificato PCI DSS livello 1, il livello di sicurezza più alto nel settore dei pagamenti.',
        guideRefundTitle: 'Politica di rimborso',
        guideRefundContent: 'Se riscontri un problema tecnico che ti impedisce di utilizzare la piattaforma, contatta l’assistenza entro 14 giorni dal pagamento per una revisione. I rimborsi vengono valutati caso per caso.'
      }
    }
  },
  'pt-PT': {
    support: {
      faqCountLabel: 'Perguntas frequentes',
      portfolioTitle: 'Portefólio',
      notificationsTitle: 'Notificações &',
      formDescription: 'Descrição',
      catCommunity: 'Comunidade',
      catSupport: 'Suporte & Tickets',
      billingHelp: {
        ticketCategory: 'Faturação & Subscrições',
        faqCostQ: 'Quanto custa a 3YESES?',
        faqCostA: 'É necessária uma subscrição ativa para usar a plataforma. Subscreves durante o registo: escolhe entre GBP10 por 6 meses ou GBP20 por 12 meses (melhor valor). Ambos os planos incluem funcionalidades idênticas: uploads ilimitados de portefólio, personalização completa do perfil, classificação prioritária nas pesquisas, painel analítico, comentários, likes e funcionalidades comunitárias. Não há taxas ocultas.',
        faqSubscribeQ: 'Como me subscrevo?',
        faqSubscribeA: 'A subscrição ocorre como parte do processo de registo. Depois de criares a tua conta e confirmares a tua idade, escolhe a duração do plano (6 ou 12 meses) e completa o checkout seguro do Stripe. A tua conta é ativada instantaneamente, sem período de espera.',
        faqCancelQ: 'Posso cancelar a minha subscrição?',
        faqCancelA: 'Sim: cancela a qualquer momento a partir do Dashboard → Subscrição. Manténs acesso total até ao final do teu período de faturação atual. O teu perfil, portefólio, comentários e dados analíticos são preservados. Podes subscrever novamente a qualquer momento para retomar de onde paraste. Não há taxas de cancelamento.',
        faqExpireQ: 'O que acontece quando a minha subscrição expira?',
        faqExpireA: 'Quando a tua subscrição termina, o acesso à plataforma é pausado. Não podes iniciar sessão, carregar conteúdo ou interagir com a comunidade. No entanto, o teu perfil, itens do portefólio e todos os dados são preservados e serão totalmente restaurados quando te reinscreveres.',
        faqInvoiceQ: 'Como consigo uma fatura?',
        faqInvoiceA: 'Vá ao Dashboard → Subscrição para ver o seu histórico de faturação. Todas as faturas são geradas e geridas pela Stripe. Pode fazer o download de faturas em PDF para qualquer pagamento anterior diretamente nesta página.',
        faqSwitchPlanQ: 'Posso mudar entre planos de 6 e 12 meses?',
        faqSwitchPlanA: 'Quando o seu período de subscrição atual terminar, pode escolher uma duração diferente ao renovar. A alteração entra em vigor no início do seu próximo ciclo de faturação. Ambos os planos incluem funcionalidades idênticas.',
        guideSubscriptionTitle: 'Compreender a sua subscrição',
        guideSubscriptionContent: 'A subscrição é obrigatória para usar a 3YESES. Escolha o seu plano durante o registo: GBP10 por 6 meses ou GBP20 por 12 meses (melhor valor). Ambos os planos incluem funcionalidades idênticas - a única diferença é a duração da faturação.',
        guideSecurityTitle: 'Segurança de pagamentos',
        guideSecurityContent: 'Todos os pagamentos são processados de forma segura através da Stripe. Nunca armazenamos os dados do seu cartão nos nossos servidores. A Stripe é certificada PCI DSS Nível 1, o nível de segurança mais alto na indústria de pagamentos.',
        guideRefundTitle: 'Política de reembolso',
        guideRefundContent: 'Se experimentar um problema técnico que o impeça de usar a plataforma, contacte o suporte dentro de 14 dias após o pagamento para revisão. Os reembolsos são avaliados caso a caso.'
      }
    }
  },
  'ru-RU': {
    support: {
      faqCountLabel: 'Частые вопросы',
      portfolioTitle: 'Портфолио',
      notificationsTitle: 'Уведомления &',
      formDescription: 'Описание',
      catCommunity: 'Сообщество',
      catSupport: 'Поддержка & Тикеты',
      billingHelp: {
        ticketCategory: 'Оплата & Подписки',
        faqCostQ: 'Сколько стоит 3YESES?',
        faqCostA: 'Для использования платформы требуется активная подписка. Вы подписываетесь во время регистрации: выбираете между GBP10 за 6 месяцев или GBP20 за 12 месяцев (лучшая стоимость). Оба плана включают одинаковые функции: неограниченные загрузки портфолио, полную настройку профиля, приоритетное ранжирование в поиске, аналитическую панель, комментарии, лайки и функции сообщества. Нет скрытых платежей.',
        faqSubscribeQ: 'Как подписаться?',
        faqSubscribeA: 'Подписка происходит в рамках процесса регистрации. После создания аккаунта и подтверждения возраста выберите длительность плана (6 или 12 месяцев), затем завершите безопасную оплату Stripe. Ваша учетная запись активируется мгновенно без периода ожидания.',
        faqCancelQ: 'Могу ли я отменить подписку?',
        faqCancelA: 'Да — отменяйте в любое время через Dashboard → Подписка. Вы сохраняете полный доступ до конца текущего расчетного периода. Ваш профиль, портфолио, комментарии и аналитические данные сохраняются. Подписывайтесь снова в любой момент, чтобы продолжить с того места, где вы остановились. Комиссий за отмену нет.',
        faqExpireQ: 'Что происходит, когда моя подписка истекает?',
        faqExpireA: 'Когда ваша подписка заканчивается, доступ к платформе приостанавливается. Вы не можете войти, загружать контент или взаимодействовать с сообществом. Однако ваш профиль, элементы портфолио и все данные сохраняются и будут полностью восстановлены, когда вы снова подпишетесь.',
        faqInvoiceQ: 'Как получить счет?',
        faqInvoiceA: 'Перейдите в Dashboard → Подписка, чтобы просмотреть историю платежей. Все счета генерируются и управляются Stripe. Вы можете скачать PDF-счета за любой прошлый платеж прямо с этой страницы.',
        faqSwitchPlanQ: 'Могу ли я перейти с 6-месячного плана на 12-месячный?',
        faqSwitchPlanA: 'Когда ваш текущий период подписки закончится, вы можете выбрать другую длительность при продлении. Изменение вступит в силу с начала следующего расчетного цикла. Оба плана включают одинаковые функции.',
        guideSubscriptionTitle: 'Понимание вашей подписки',
        guideSubscriptionContent: 'Подписка обязательна для использования 3YESES. Выберите свой план при регистрации: GBP10 за 6 месяцев или GBP20 за 12 месяцев (лучшая стоимость). Оба плана включают одинаковые функции — единственная разница в длительности оплаты.',
        guideSecurityTitle: 'Безопасность платежей',
        guideSecurityContent: 'Все платежи обрабатываются безопасно через Stripe. Мы никогда не сохраняем данные вашей карты на наших серверах. Stripe сертифицирован по PCI DSS уровня 1 — наивысший уровень безопасности в платежной индустрии.',
        guideRefundTitle: 'Политика возврата средств',
        guideRefundContent: 'Если вы столкнулись с технической проблемой, которая мешает вам использовать платформу, обратитесь в службу поддержки в течение 14 дней после платежа для проверки. Возвраты рассматриваются индивидуально.'
      }
    }
  },
  'ja-JP': {
    support: {
      faqCountLabel: 'よくある質問',
      portfolioTitle: 'ポートフォリオ',
      notificationsTitle: '通知 &',
      formDescription: '説明',
      catCommunity: 'コミュニティ',
      catSupport: 'サポート & チケット',
      billingHelp: {
        ticketCategory: '請求 & サブスクリプション',
        faqCostQ: '3YESES の費用はいくらですか？',
        faqCostA: 'プラットフォームの利用には有効なサブスクリプションが必要です。登録時にサブスクライブします：6ヶ月でGBP10、または12ヶ月でGBP20（最優良価値）を選択します。両プランは同じ機能を含みます：無制限のポートフォリオアップロード、プロフィールの完全カスタマイズ、検索での優先表示、分析ダッシュボード、コメント、いいね、コミュニティ機能。隠れた料金はありません。',
        faqSubscribeQ: 'どうやってサブスクライブしますか？',
        faqSubscribeA: 'サブスクライブは登録プロセスの一部です。アカウントを作成し年齢確認を行ったら、プランの期間（6か月または12か月）を選択し、安全な Stripe チェックアウトを完了します。アカウントはすぐに有効化され、待機期間はありません。',
        faqCancelQ: 'サブスクリプションをキャンセルできますか？',
        faqCancelA: 'はい。Dashboard → Subscriptions からいつでもキャンセルできます。現在の請求期間の終了まで完全にアクセスできます。プロフィール、ポートフォリオ、コメント、分析データは保持されます。いつでも再度サブスクライブして、途中から再開できます。キャンセル手数料はありません。',
        faqExpireQ: 'サブスクリプションが期限切れになるとどうなりますか？',
        faqExpireA: 'サブスクリプションが終了すると、プラットフォームへのアクセスは一時停止されます。ログイン、コンテンツのアップロード、コミュニティとのやり取りはできません。ただし、プロフィール、ポートフォリオアイテム、すべてのデータは保持され、再度サブスクライブすると完全に復元されます。',
        faqInvoiceQ: '請求書はどうやって取得しますか？',
        faqInvoiceA: 'Dashboard → Subscriptions に移動して請求履歴を表示します。すべての請求書は Stripe によって生成・管理されます。過去の支払いについて PDF 請求書をこのページから直接ダウンロードできます。',
        faqSwitchPlanQ: '6か月プランと12か月プランを切り替えられますか？',
        faqSwitchPlanA: '現在のサブスクリプション期間が終了したら、更新時に別の期間を選択できます。変更は次の請求サイクルの開始時に有効になります。両プランは同じ機能を含みます。',
        guideSubscriptionTitle: 'サブスクリプションについて',
        guideSubscriptionContent: '3YESES の利用にはサブスクリプションが必須です。登録時にプランを選択します：6か月でGBP10、または12か月でGBP20（最優良価値）。両プランは同じ機能を含み、違いは請求期間の長さのみです。',
        guideSecurityTitle: '支払いの安全性',
        guideSecurityContent: 'すべての支払いは Stripe を通じて安全に処理されます。カード情報をサーバーに保存することはありません。Stripe は PCI DSS レベル 1 認定を受けており、支払い業界で最も高いセキュリティレベルです。',
        guideRefundTitle: '返金ポリシー',
        guideRefundContent: 'プラットフォームの利用を妨げる技術的な問題が発生した場合は、支払い後14日以内にサポートに連絡して審査を受けてください。返金はケースバイケースで判断されます。'
      }
    }
  },
  'zh-CN': {
    support: {
      faqCountLabel: '常见问题',
      portfolioTitle: '作品集',
      notificationsTitle: '通知 &',
      formDescription: '描述',
      catCommunity: '社区',
      catSupport: '支持 & 工单',
      billingHelp: {
        ticketCategory: '账单 & 订阅',
        faqCostQ: '3YESES 的费用是多少？',
        faqCostA: '使用平台需要有效订阅。您在注册时订阅：选择 6 个月 GBP10 或 12 个月 GBP20（超值）。两个计划均包含相同功能：无限作品集上传、完整个人资料自定义、搜索优先排名、分析仪表盘、评论、点赞和社区功能。没有隐藏费用。',
        faqSubscribeQ: '我如何订阅？',
        faqSubscribeA: '订阅在注册过程中完成。创建帐户并确认年龄后，选择计划时长（6 或 12 个月），然后完成安全的 Stripe 结账。您的帐户会立即激活，无需等待。',
        faqCancelQ: '我可以取消订阅吗？',
        faqCancelA: '可以 — 通过 Dashboard → Subscription 随时取消。您将保留当前计费周期结束前的全部访问权限。您的个人资料、作品集、评论和分析数据将被保留。您可以随时重新订阅，以便从中断处继续。无取消费用。',
        faqExpireQ: '我的订阅到期后会怎样？',
        faqExpireA: '当您的订阅结束时，平台访问将暂停。您无法登录、上传内容或与社区互动。但是，您的个人资料、作品集项和所有数据都会保留，并将在您重新订阅时恢复。',
        faqInvoiceQ: '我如何获取发票？',
        faqInvoiceA: '转到 Dashboard → Subscription 查看账单历史。所有发票由 Stripe 生成和管理。您可以直接从此页面下载过去任何付款的 PDF 发票。',
        faqSwitchPlanQ: '我可以在 6 个月和 12 个月计划之间切换吗？',
        faqSwitchPlanA: '当您当前的订阅周期结束时，可以在续订时选择不同的时长。更改将于下一个计费周期开始时生效。两个计划均包含相同功能。',
        guideSubscriptionTitle: '了解您的订阅',
        guideSubscriptionContent: '使用 3YESES 必须订阅。您在注册时选择计划：6 个月 GBP10 或 12 个月 GBP20（超值）。两个计划均包含相同功能，唯一不同的是计费时长。',
        guideSecurityTitle: '支付安全',
        guideSecurityContent: '所有支付均通过 Stripe 安全处理。我们绝不会在服务器上存储您的卡片信息。Stripe 获得了 PCI DSS 1 级认证——支付行业中的最高安全级别。',
        guideRefundTitle: '退款政策',
        guideRefundContent: '如果您遇到技术问题，导致无法使用平台，请在付款后 14 天内联系支持进行审核。退款将逐案评估。'
      }
    }
  },
  'ar': {
    support: {
      faqCountLabel: 'الأسئلة الشائعة',
      portfolioTitle: 'المعرض',
      notificationsTitle: 'الإشعارات &',
      formDescription: 'الوصف',
      catCommunity: 'المجتمع',
      catSupport: 'الدعم & التذاكر',
      billingHelp: {
        ticketCategory: 'الفواتير & الاشتراكات',
        faqCostQ: 'ما تكلفة 3YESES؟',
        faqCostA: 'يجب أن يكون لديك اشتراك نشط لاستخدام المنصة. تشترك أثناء التسجيل - اختر بين 10 جنيهًا إسترلينيًا لمدة 6 أشهر أو 20 جنيهًا إسترلينيًا لمدة 12 شهرًا (أفضل قيمة). كلا الخطة تتضمن نفس الميزات: تحميل معرض غير محدود، تخصيص كامل للملف الشخصي، ترتيب بحث أولوي، لوحة تحليلات، تعليقات، إعجابات، وميزات المجتمع. لا توجد رسوم مخفية.',
        faqSubscribeQ: 'كيف أشترك؟',
        faqSubscribeA: 'يتم الاشتراك كجزء من عملية التسجيل. بعد إنشاء حسابك وتأكيد عمرك، اختر مدة الخطة (6 أو 12 شهرًا)، ثم أكمل الدفع الآمن عبر Stripe. يتم تفعيل حسابك فورًا - لا توجد فترة انتظار.',
        faqCancelQ: 'هل يمكنني إلغاء اشتراكي؟',
        faqCancelA: 'نعم - يمكنك الإلغاء في أي وقت من لوحة التحكم → الاشتراك. ستحافظ على الوصول الكامل حتى نهاية دورة الفوترة الحالية. يتم الاحتفاظ بملفك الشخصي، والمعرض، والتعليقات، وبيانات التحليلات. يمكنك الاشتراك مرة أخرى في أي وقت للمتابعة من حيث توقفت. لا توجد رسوم إلغاء.',
        faqExpireQ: 'ماذا يحدث عندما ينتهي اشتراكي؟',
        faqExpireA: 'عند انتهاء اشتراكك، يتم إيقاف الوصول إلى المنصة مؤقتًا. لا يمكنك تسجيل الدخول أو تحميل المحتوى أو التفاعل مع المجتمع. ومع ذلك، يتم الاحتفاظ بملفك الشخصي وعناصر المعرض وجميع البيانات وسيتم استعادتها تمامًا عند إعادة الاشتراك.',
        faqInvoiceQ: 'كيف أحصل على فاتورة؟',
        faqInvoiceA: 'انتقل إلى لوحة التحكم → الاشتراك لعرض سجل الفواتير. يتم إنشاء وإدارة جميع الفواتير بواسطة Stripe. يمكنك تنزيل فاتورة PDF لأي دفعة سابقة مباشرة من هذه الصفحة.',
        faqSwitchPlanQ: 'هل يمكنني التبديل بين خطط 6 أشهر و12 شهرًا؟',
        faqSwitchPlanA: 'عند انتهاء فترة اشتراكك الحالية، يمكنك اختيار مدة مختلفة عند التجديد. يدخل التغيير حيز التنفيذ في بداية دورة الفوترة التالية. كلا الخطة تتضمن نفس الميزات.',
        guideSubscriptionTitle: 'فهم اشتراكك',
        guideSubscriptionContent: 'الاشتراك مطلوب لاستخدام 3YESES. تختار خطتك أثناء التسجيل: 10 جنيهًا إسترلينيًا مقابل 6 أشهر أو 20 جنيهًا إسترلينيًا مقابل 12 شهرًا (أفضل قيمة). كلا الخطة تتضمن نفس الميزات - الاختلاف الوحيد هو مدة الفوترة.',
        guideSecurityTitle: 'أمان الدفع',
        guideSecurityContent: 'تتم معالجة جميع المدفوعات بأمان من خلال Stripe. لا نخزن بيانات بطاقتك على خوادمنا أبدًا. Stripe معتمدة وفقًا للمعيار PCI DSS المستوى 1 - أعلى مستوى أمان في صناعة المدفوعات.',
        guideRefundTitle: 'سياسة الاسترداد',
        guideRefundContent: 'إذا واجهت مشكلة فنية تمنعك من استخدام المنصة، فاتصل بالدعم خلال 14 يومًا من الدفع لإجراء مراجعة. يتم تقييم الاستردادات حالة بحالة.'
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
  console.log(`Patched support values for ${locale}`);
}
