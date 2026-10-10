#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const messagesDir = path.join(__dirname, '..', 'messages');
const translations = {
  'de-DE': {
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
            p2: '3YESES ist eine Plattform, auf der kreative Fachkräfte — Schauspieler, Musiker, Models, Tänzer, Sprecher, Fotografen, Videofilmer, DJs, Moderatoren, Komiker und andere Performer — Profile erstellen, Portfolio-Medien hochladen (Fotos, Videos, Audio) und entdeckt werden. Die Plattform umfasst ein durchsuchbares Talentverzeichnis, ein Medienzentrum, Analyse-Dashboards und Community-Funktionen wie Kommentare, Likes und das Teilen von Inhalten.'
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
    Pages: {
      privacy: {
        contents: 'Contenido',
        introP1: 'Esta Política de Privacidad explica cómo 3YESES ("Plataforma", "nosotros", "nos", "nuestro") recopila, usa, almacena y protege tus datos personales cuando utilizas nuestro marketplace de talento por suscripción en 3yeses.online.',
        introP2: 'Nos comprometemos a proteger tu privacidad y a procesar tus datos personales de conformidad con el RGPD del Reino Unido, la Ley de Protección de Datos de 2018 y, cuando corresponda, el RGPD de la UE.'
      },
      terms: {
        contents: 'Contenido',
        sections: {
          overview: {
            p2: '3YESES es una plataforma donde profesionales creativos — actores, músicos, modelos, bailarines, artistas de voz, fotógrafos, videógrafos, DJs, presentadores, comediantes y otros artistas — crean perfiles, suben medios de portafolio (fotos, videos, audio) y son descubiertos. La plataforma incluye un directorio de talentos con búsqueda, un centro de medios, paneles de análisis y funciones comunitarias como comentarios, likes y compartición de contenido.'
          },
          eligibility: {
            p1: 'Debes tener al menos 13 años para crear una cuenta. Los usuarios de 13 a 17 años requieren el consentimiento de los padres o tutores. Los menores de 13 años deben tener una cuenta gestionada por un padre o tutor que registre y administre la cuenta en su nombre.',
            p2: 'Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de toda la actividad de tu cuenta. Infórmanos de inmediato si sospechas un acceso no autorizado.',
            p3: 'Cada persona puede tener solo una cuenta. Las cuentas duplicadas pueden ser suspendidas sin previo aviso.',
            p4: 'Debes proporcionar información precisa y actualizada durante el registro y mantener tu perfil al día. Los perfiles fraudulentos o engañosos pueden ser eliminados.'
          },
          subscription: {
            p1: 'Se requiere una suscripción activa para usar la Plataforma. Te suscribes durante el proceso de registro. Sin una suscripción activa, no puedes acceder a la Plataforma.',
            plansIntro: 'Ofrecemos un plan — Standard Access — con dos opciones de duración:',
            p2: 'Ambos planes incluyen funciones idénticas: cargas ilimitadas de portafolio, personalización completa del perfil, clasificación prioritaria en búsquedas y análisis completos del panel.'
          },
          content: {
            ownership: 'Mantienes la propiedad total de todo el contenido que subes a la Plataforma. Al subir contenido, otorgas a 3YESES una licencia no exclusiva, mundial y libre de regalías para mostrar, distribuir y promocionar tu contenido en la Plataforma y en materiales de marketing relacionados.',
            permitted: 'Puedes subir imágenes (JPEG, PNG, WebP), videos (MP4, MOV) y archivos de audio (MP3, WAV). Los archivos individuales no deben superar los 50 MB. También puedes incrustar enlaces de video externos (por ejemplo, YouTube, Vimeo).'
          }
        }
      }
    }
  },
  'fr-FR': {
    Pages: {
      privacy: {
        contents: 'Contenu',
        introP1: 'Cette politique de confidentialité explique comment 3YESES ("Plateforme", "nous", "notre") collecte, utilise, stocke et protège vos données personnelles lorsque vous utilisez notre marché de talents par abonnement sur 3yeses.online.',
        introP2: 'Nous nous engageons à protéger votre vie privée et à traiter vos données personnelles en conformité avec le RGPD britannique, la loi sur la protection des données de 2018 et, le cas échéant, le RGPD de l’UE.'
      },
      terms: {
        contents: 'Contenu',
        sections: {
          overview: {
            p2: '3YESES est une plateforme où des professionnels créatifs — acteurs, musiciens, mannequins, danseurs, artistes voix, photographes, vidéastes, DJs, présentateurs, comédiens et autres interprètes — créent des profils, téléchargent des médias de portfolio (photos, vidéos, audio) et sont découverts. La Plateforme comprend un annuaire de talents consultable, un hub média, des tableaux de bord d’analyse et des fonctionnalités communautaires telles que les commentaires, les likes et le partage de contenu.'
          },
          eligibility: {
            p1: 'Vous devez avoir au moins 13 ans pour créer un compte. Les utilisateurs de 13 à 17 ans nécessitent le consentement d’un parent ou tuteur. Les utilisateurs de moins de 13 ans doivent avoir un compte géré par un parent ou tuteur qui enregistre et gère le compte en leur nom.',
            p2: 'Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toute activité sur votre compte. Informez-nous immédiatement si vous suspectez un accès non autorisé.',
            p3: 'Chaque personne ne peut avoir qu’un seul compte. Les comptes en double peuvent être suspendus sans préavis.',
            p4: 'Vous devez fournir des informations exactes et à jour lors de l’inscription et maintenir votre profil à jour. Les profils frauduleux ou trompeurs peuvent être supprimés.'
          },
          subscription: {
            p1: 'Un abonnement actif est requis pour utiliser la Plateforme. Vous vous abonnez lors du processus d’inscription. Sans abonnement actif, vous ne pouvez pas accéder à la Plateforme.',
            plansIntro: 'Nous proposons un plan — Standard Access — avec deux options de durée :',
            p2: 'Les deux plans incluent des fonctionnalités identiques : téléchargements illimités de portefeuille, personnalisation complète du profil, classement prioritaire dans la recherche et analyse complète du tableau de bord.'
          },
          content: {
            ownership: 'Vous conservez la pleine propriété de tout le contenu que vous téléchargez sur la Plateforme. En téléchargeant du contenu, vous accordez à 3YESES une licence mondiale non exclusive et gratuite pour afficher, distribuer et promouvoir votre contenu sur la Plateforme et dans les supports marketing connexes.',
            permitted: 'Vous pouvez télécharger des images (JPEG, PNG, WebP), des vidéos (MP4, MOV) et des fichiers audio (MP3, WAV). Les fichiers individuels ne doivent pas dépasser 50 Mo. Vous pouvez également intégrer des liens vidéo externes (par ex. YouTube, Vimeo).'
          }
        }
      }
    }
  },
  'it-IT': {
    Pages: {
      privacy: {
        contents: 'Contenuto',
        introP1: 'Questa Informativa sulla privacy spiega come 3YESES ("Piattaforma", "noi", "ci", "nostro") raccoglie, utilizza, conserva e protegge i tuoi dati personali quando usi il nostro marketplace di talenti basato su abbonamento su 3yeses.online.',
        introP2: 'Ci impegniamo a proteggere la tua privacy e a trattare i tuoi dati personali in conformità con l’UK GDPR, il Data Protection Act 2018 e, quando applicabile, l’EU GDPR.'
      },
      terms: {
        contents: 'Contenuto',
        sections: {
          overview: {
            p2: '3YESES è una piattaforma in cui professionisti creativi — attori, musicisti, modelli, ballerini, artisti vocali, fotografi, videomaker, DJ, presentatori, comici e altri performer — creano profili, caricano media di portfolio (foto, video, audio) e vengono scoperti. La piattaforma include una directory di talenti ricercabile, un hub multimediale, dashboard analitici e funzionalità community come commenti, like e condivisione di contenuti.'
          },
          eligibility: {
            p1: 'Devi avere almeno 13 anni per creare un account. Gli utenti di età compresa tra 13 e 17 anni richiedono il consenso di un genitore o tutore. Gli utenti sotto i 13 anni devono avere un account gestito da un genitore o tutore che registra e gestisce l’account per loro conto.',
            p2: 'Sei responsabile di mantenere la riservatezza delle tue credenziali di accesso e di tutta l’attività sul tuo account. Informaci immediatamente se sospetti un accesso non autorizzato.',
            p3: 'Ogni persona può avere solo un account. Gli account duplicati possono essere sospesi senza preavviso.',
            p4: 'Devi fornire informazioni accurate e aggiornate durante la registrazione e mantenere il tuo profilo aggiornato. I profili fraudolenti o fuorvianti possono essere rimossi.'
          },
          subscription: {
            p1: 'Per utilizzare la piattaforma è necessario un abbonamento attivo. Ti abboni durante il processo di registrazione. Senza un abbonamento attivo non puoi accedere alla piattaforma.',
            plansIntro: 'Offriamo un piano — Standard Access — con due opzioni di durata:',
            p2: 'Entrambi i piani includono funzionalità identiche: caricamenti illimitati del portfolio, personalizzazione completa del profilo, posizionamento prioritario nella ricerca e analisi complete del dashboard.'
          },
          content: {
            ownership: 'Mantieni la piena proprietà di tutti i contenuti che carichi sulla piattaforma. Caricando contenuti, concedi a 3YESES una licenza mondiale, non esclusiva e royalty-free per visualizzare, distribuire e promuovere i tuoi contenuti sulla Piattaforma e nei materiali di marketing correlati.',
            permitted: 'Puoi caricare immagini (JPEG, PNG, WebP), video (MP4, MOV) e file audio (MP3, WAV). I singoli file non devono superare i 50 MB. Puoi anche incorporare link video esterni (es. YouTube, Vimeo).'
          }
        }
      }
    }
  },
  'pt-PT': {
    Pages: {
      privacy: {
        contents: 'Conteúdo',
        introP1: 'Esta Política de Privacidade explica como a 3YESES ("Plataforma", "nós", "nos", "nosso") recolhe, utiliza, armazena e protege os seus dados pessoais quando utiliza o nosso mercado de talentos por subscrição em 3yeses.online.',
        introP2: 'Comprometemo-nos a proteger a sua privacidade e a tratar os seus dados pessoais em conformidade com o RGPD do Reino Unido, o Data Protection Act de 2018 e, quando aplicável, o RGPD da UE.'
      },
      terms: {
        contents: 'Conteúdo',
        sections: {
          overview: {
            p2: 'A 3YESES é uma plataforma onde profissionais criativos — atores, músicos, modelos, bailarinos, artistas de voz, fotógrafos, videógrafos, DJs, apresentadores, comediantes e outros performers — criam perfis, carregam media de portfólio (fotos, vídeos, áudio) e são descobertos. A plataforma inclui um diretório de talentos pesquisável, um hub de media, painéis analíticos e funcionalidades comunitárias como comentários, likes e partilha de conteúdo.'
          },
          eligibility: {
            p1: 'Deve ter pelo menos 13 anos para criar uma conta. Utilizadores com idades entre 13 e 17 anos requerem consentimento dos pais ou tutor. Utilizadores com menos de 13 anos devem ter uma conta gerida por um pai ou tutor que regista e gere a conta em seu nome.',
            p2: 'É responsável por manter a confidencialidade das suas credenciais de login e por toda a atividade na sua conta. Informe-nos imediatamente se suspeitar de acesso não autorizado.',
            p3: 'Cada pessoa pode manter apenas uma conta. Contas duplicadas podem ser suspensas sem aviso.',
            p4: 'Deve fornecer informações precisas e atualizadas durante o registo e manter as informações do seu perfil atualizadas. Perfis fraudulentos ou enganosos podem ser removidos.'
          },
          subscription: {
            p1: 'É necessária uma subscrição ativa para usar a Plataforma. Subscreve durante o processo de registo. Sem uma subscrição ativa, não pode aceder à Plataforma.',
            plansIntro: 'Oferecemos um plano — Standard Access — com duas opções de duração:',
            p2: 'Ambos os planos incluem funcionalidades idênticas: uploads ilimitados de portfólio, personalização completa do perfil, classificação prioritária na pesquisa e análise completa do painel.'
          },
          content: {
            ownership: 'Mantém a propriedade total de todo o conteúdo que carrega para a Plataforma. Ao carregar conteúdo, concede à 3YESES uma licença mundial, não exclusiva e livre de royalties para exibir, distribuir e promover o seu conteúdo na Plataforma e em materiais de marketing relacionados.',
            permitted: 'Pode carregar imagens (JPEG, PNG, WebP), vídeos (MP4, MOV) e ficheiros de áudio (MP3, WAV). Os ficheiros individuais não devem exceder 50 MB. Também pode incorporar links de vídeo externos (por exemplo, YouTube, Vimeo).'
          }
        }
      }
    }
  },
  'ru-RU': {
    Pages: {
      privacy: {
        contents: 'Содержание',
        introP1: 'Эта Политика конфиденциальности объясняет, как 3YESES ("Платформа", "мы", "нас", "наш") собирает, использует, хранит и защищает ваши персональные данные, когда вы используете наш рынок талантов на основе подписки на 3yeses.online.',
        introP2: 'Мы обязуемся защищать вашу конфиденциальность и обрабатывать ваши персональные данные в соответствии с британским GDPR, Законом о защите данных 2018 года и, при применимости, GDPR ЕС.'
      },
      terms: {
        contents: 'Содержание',
        sections: {
          overview: {
            p2: '3YESES — это платформа, где креативные профессионалы — актеры, музыканты, модели, танцоры, голосовые артисты, фотографы, видеографы, диджеи, ведущие, комики и другие исполнители — создают профили, загружают медиа для портфолио (фото, видео, аудио) и становятся заметными. Платформа включает в себя каталог талантов с поиском, медиа-хаб, аналитические панели и социальные функции, такие как комментарии, лайки и обмен контентом.'
          },
          eligibility: {
            p1: 'Вам должно быть не менее 13 лет, чтобы создать аккаунт. Пользователи в возрасте от 13 до 17 лет требуют согласия родителей или опекуна. Пользователи младше 13 лет должны иметь аккаунт, управляемый родителем или опекуном, который регистрирует и ведет аккаунт от их имени.',
            p2: 'Вы несете ответственность за хранение конфиденциальности ваших учетных данных и за всю активность в вашем аккаунте. Немедленно сообщите нам, если заподозрите неавторизованный доступ.',
            p3: 'Каждое лицо может иметь только один аккаунт. Дублирующие аккаунты могут быть приостановлены без уведомления.',
            p4: 'Вы должны предоставлять точную, актуальную информацию во время регистрации и поддерживать информацию вашего профиля в актуальном состоянии. Мошеннические или вводящие в заблуждение профили могут быть удалены.'
          },
          subscription: {
            p1: 'Для использования Платформы требуется активная подписка. Вы подписываетесь во время процесса регистрации. Без активной подписки вы не можете получить доступ к Платформе.',
            plansIntro: 'Мы предлагаем один план — Standard Access — с двумя вариантами длительности:',
            p2: 'Оба плана включают одинаковые функции: неограниченные загрузки портфолио, полная настройка профиля, приоритетное ранжирование в поиске и полный аналитический дашборд.'
          },
          content: {
            ownership: 'Вы сохраняете полное право собственности на весь контент, который загружаете на Платформу. Загружая контент, вы предоставляете 3YESES неисключительную, всемирную, роялти-фри лицензию на отображение, распространение и продвижение вашего контента на Платформе и в маркетинговых материалах, связанных с Платформой.',
            permitted: 'Вы можете загружать изображения (JPEG, PNG, WebP), видео (MP4, MOV) и аудиофайлы (MP3, WAV). Размер отдельных файлов не должен превышать 50 МБ. Вы также можете встраивать внешние ссылки на видео (например, YouTube, Vimeo).'
          }
        }
      }
    }
  },
  'ja-JP': {
    Pages: {
      privacy: {
        contents: '目次',
        introP1: 'このプライバシーポリシーは、3YESES（「プラットフォーム」、「当社」、「私たち」、「当社の」）が、サブスクリプションベースのタレントマーケットプレイス 3yeses.online を利用する際に、どのようにあなたの個人データを収集、使用、保存、保護するかを説明します。',
        introP2: '私たちは、お客様のプライバシーを保護し、UK GDPR、2018年データ保護法、および該当する場合はEU GDPRに準拠して個人データを取り扱うことを約束します。'
      },
      terms: {
        contents: '目次',
        sections: {
          overview: {
            p2: '3YESESは、俳優、ミュージシャン、モデル、ダンサー、声優、写真家、ビデオグラファー、DJ、プレゼンター、コメディアンなどのクリエイティブなプロフェッショナルがプロフィールを作成し、ポートフォリオのメディア（写真、ビデオ、オーディオ）をアップロードし、発見されるプラットフォームです。プラットフォームには、検索可能なタレントディレクトリ、メディアハブ、分析ダッシュボード、およびコメント、いいね、コンテンツ共有などのコミュニティ機能が含まれています。'
          },
          eligibility: {
            p1: 'アカウントを作成するには13歳以上である必要があります。13〜17歳のユーザーは、親または保護者の同意が必要です。13歳未満のユーザーは、親または保護者が代わりにアカウントを登録し管理する必要があります。',
            p2: 'ログイン資格情報の機密性を維持し、アカウントでのすべてのアクティビティについて責任を負う必要があります。不正アクセスの疑いがある場合は、ただちにお知らせください。',
            p3: '各個人は1つのアカウントのみ保持できます。重複アカウントは予告なく停止される場合があります。',
            p4: '登録時に正確で最新の情報を提供し、プロフィール情報を最新の状態に保つ必要があります。不正なまたは誤解を招くプロフィールは削除される場合があります。'
          },
          subscription: {
            p1: 'プラットフォームを使用するには有効なサブスクリプションが必要です。登録プロセス中にサブスクライブします。有効なサブスクリプションがないと、プラットフォームにアクセスできません。',
            plansIntro: '当社は1つのプラン — Standard Access — を、2つの期間オプションで提供しています：',
            p2: '両方のプランには同じ機能が含まれます：無制限のポートフォリオアップロード、プロフィールの完全なカスタマイズ、検索の優先ランキング、完全なダッシュボード分析。'
          },
          content: {
            ownership: 'プラットフォームにアップロードするすべてのコンテンツの完全な所有権はあなたに帰属します。コンテンツをアップロードすることで、3YESESに対してプラットフォームおよび関連マーケティング資料であなたのコンテンツを表示、配布、プロモーションする非独占的、全世界的、ロイヤリティフリーのライセンスを付与します。',
            permitted: '画像（JPEG、PNG、WebP）、動画（MP4、MOV）、オーディオファイル（MP3、WAV）をアップロードできます。個別のファイルは50MBを超えてはなりません。外部の動画リンク（例：YouTube、Vimeo）を埋め込むこともできます。'
          }
        }
      }
    }
  },
  'zh-CN': {
    Pages: {
      privacy: {
        contents: '目录',
        introP1: '本隐私政策说明 3YESES（“平台”、“我们”、“我们”、“我们的”）在您使用我们的订阅制人才市场 3yeses.online 时，如何收集、使用、存储和保护您的个人数据。',
        introP2: '我们致力于保护您的隐私，并按照英国 GDPR、《2018 年数据保护法》以及适用时的欧盟 GDPR 处理您的个人数据。'
      },
      terms: {
        contents: '目录',
        sections: {
          overview: {
            p2: '3YESES 是一个平台，创意专业人士——演员、音乐人、模特、舞者、配音演员、摄影师、摄像师、DJ、主持人、喜剧演员和其他表演者——可以创建个人资料、上传作品集媒体（照片、视频、音频）并被发现。该平台包括可搜索的人才目录、媒体中心、分析仪表板和评论、点赞、内容分享等社区功能。'
          },
          eligibility: {
            p1: '您必须年满 13 岁才能创建账户。13 至 17 岁的用户需要父母或监护人同意。13 岁以下的用户必须由父母或监护人管理账户，由父母或监护人代表其注册和管理。',
            p2: '您有责任保持登录凭据的机密性，并对账户下的所有活动负责。如果您怀疑未经授权的访问，请立即通知我们。',
            p3: '每个人只能拥有一个账户。重复账户可能会在不通知的情况下被暂停。',
            p4: '您必须在注册过程中提供准确、最新的信息，并保持您的个人资料信息最新。欺诈或误导性个人资料可能会被删除。'
          },
          subscription: {
            p1: '使用平台需要有效订阅。您在注册时订阅。没有有效订阅，您无法访问平台。',
            plansIntro: '我们提供一个计划 — Standard Access — 具有两个时长选项：',
            p2: '两个计划包含相同功能：无限作品集上传、完整个人资料自定义、搜索优先排名和完整仪表板分析。'
          },
          content: {
            ownership: '您对上传到平台的所有内容保留完整所有权。上传内容即授予 3YESES 一项非独占、全球、免版税的许可，以便在平台和与平台相关的营销材料中展示、分发和推广您的内容。',
            permitted: '您可以上传图像（JPEG、PNG、WebP）、视频（MP4、MOV）和音频文件（MP3、WAV）。单个文件不得超过 50 MB。您还可以嵌入外部视频链接（例如 YouTube、Vimeo）。'
          }
        }
      }
    }
  },
  'ar': {
    Pages: {
      privacy: {
        contents: 'المحتوى',
        introP1: 'توضح سياسة الخصوصية هذه كيف تقوم 3YESES ("المنصة"، "نحن"، "لنا"، "خاصتنا") بجمع بياناتك الشخصية واستخدامها وتخزينها وحمايتها عندما تستخدم سوق المواهب القائم على الاشتراك لدينا على 3yeses.online.',
        introP2: 'نلتزم بحماية خصوصيتك ومعالجة بياناتك الشخصية وفقًا للائحة العامة لحماية البيانات في المملكة المتحدة وقانون حماية البيانات لعام 2018، وعند الاقتضاء، اللائحة العامة لحماية البيانات في الاتحاد الأوروبي.'
      },
      terms: {
        contents: 'المحتوى',
        sections: {
          overview: {
            p2: '3YESES هي منصة حيث يقوم محترفون مبدعون — ممثلون، موسيقيون، عارضون، راقصون، فنانو صوت، مصورون، مصورو فيديو، دي جي، مذيعون، كوميديون وغيرهم من المؤدين — بإنشاء ملفات شخصية وتحميل وسائط الملف الشخصي (صور، فيديو، صوت) ويتم اكتشافهم. تتضمن المنصة دليل مواهب قابلًا للبحث، ومركز وسائط، ولوحات تحليلات، وميزات مجتمعية مثل التعليقات والإعجابات ومشاركة المحتوى.'
          },
          eligibility: {
            p1: 'يجب أن يكون عمرك 13 عامًا على الأقل لإنشاء حساب. المستخدمون الذين تتراوح أعمارهم بين 13 و17 عامًا يتطلبون موافقة أحد الوالدين أو الوصي. يجب أن يكون لدى المستخدمين دون 13 عامًا حساب يتم إدارته بواسطة أحد الوالدين أو الوصي الذي يقوم بتسجيل الحساب وإدارته نيابة عنهم.',
            p2: 'أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك وعن كل النشاط تحت حسابك. أخبرنا على الفور إذا اشتبهت في وجود وصول غير مصرح به.',
            p3: 'يمكن لكل فرد الاحتفاظ بحساب واحد فقط. قد يتم تعليق الحسابات المكررة دون إشعار.',
            p4: 'يجب عليك تقديم معلومات دقيقة وحديثة أثناء التسجيل والحفاظ على تحديث معلومات ملفك الشخصي. قد يتم إزالة الملفات الشخصية الاحتيالية أو المضللة.'
          },
          subscription: {
            p1: 'يُطلب اشتراك نشط لاستخدام المنصة. تقوم بالاشتراك أثناء عملية التسجيل. دون اشتراك نشط، لا يمكنك الوصول إلى المنصة.',
            plansIntro: 'نقدم خطة واحدة — Standard Access — مع خيارين لمدة الاشتراك:',
            p2: 'تتضمن كلا الخطة ميزات متطابقة: تحميلات ملف شخصي غير محدودة، تخصيص كامل للملف الشخصي، ترتيب بحث أولوية، لوحة تحليلات كاملة.'
          },
          content: {
            ownership: 'تحتفظ بملكية كاملة لجميع المحتويات التي تقوم بتحميلها إلى المنصة. من خلال تحميل المحتوى، تمنح 3YESES ترخيصًا غير حصري وعالميًا وخاليًا من حقوق الملكية لعرض وتوزيع والترويج لمحتواك على المنصة وفي مواد التسويق ذات الصلة.',
            permitted: 'يمكنك تحميل الصور (JPEG وPNG وWebP) ومقاطع الفيديو (MP4 وMOV) وملفات الصوت (MP3 وWAV). يجب ألا يتجاوز حجم الملفات الفردية 50 ميجابايت. يمكنك أيضًا تضمين روابط فيديو خارجية (مثل YouTube وVimeo).'
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
  console.log(`Patched Pages values for ${locale}`);
}
