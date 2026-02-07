const fs = require('fs');
const path = require('path');

const hubTranslations = {
  'en-gb': require('../messages/en-gb.json').Hub,
  'fr-FR': {
    "title": "Centre Média",
    "subtitle": "Découvrez des vidéos, images et audio de créateurs talentueux",
    "search": { "placeholder": "Rechercher par titre, talent ou description...", "clear": "Effacer la recherche" },
    "categories": { "title": "Catégories", "all": "Tout", "acting": "Comédie", "music": "Musique", "modeling": "Mannequinat", "directing": "Réalisation", "writing": "Écriture", "photography": "Photographie" },
    "type": { "title": "Type:", "all": "Tout", "videos": "Vidéos", "audio": "Audio", "images": "Images" },
    "filters": { "button": "Filtres", "popularityTier": "Niveau de popularité", "viral": "Viral", "popular": "Populaire", "rising": "En hausse", "fresh": "Récent", "uploadDate": "Date de téléchargement", "allTime": "Tout le temps", "today": "Aujourd'hui", "pastWeek": "Semaine dernière", "pastMonth": "Mois dernier", "pastYear": "Année dernière", "sortBy": "Trier par", "trending": "Tendance", "newest": "Plus récent", "mostLiked": "Populaire", "alphabetical": "A-Z", "oldest": "Oldest First", "mostViews": "Most Views", "leastViews": "Least Views", "mostLikes": "Most Likes", "leastLikes": "Least Likes", "zToA": "Z-A", "clearAll": "Effacer tous les filtres", "activeFilters": "Filtres actifs", "search": "Recherche", "category": "Catégorie", "type": "Type", "sort": "Tri", "showing": "Affichage de", "results": "résultat", "resultsPlural": "résultats" },
    "sections": { "featuredCreators": "Créateurs en vedette", "discoverTopTalent": "Découvrez les meilleurs talents de la plateforme", "trendingNow": "Tendances actuelles", "hotContent": "Contenu populaire en ce moment", "mostViewed": "Contenu le plus vu en ce moment", "featuredVideos": "Vidéos en vedette", "video": "vidéo", "videos": "vidéos", "viewAllVideos": "Voir toutes les vidéos →", "featuredAudio": "Audio en vedette", "audioTrack": "piste audio", "audioTracks": "pistes audio", "viewAllAudio": "Voir tout l'audio →", "featuredImages": "Images en vedette", "image": "image", "images": "images", "viewAllImages": "Voir toutes les images →", "latestUploads": "Derniers ajouts", "freshContent": "Contenu récent", "mostPopular": "Les plus populaires", "lovedByCommunity": "Aimé par la communauté" },
    "badges": { "sponsored": "Sponsorisé", "trending": "Tendance", "hot": "Populaire", "new": "Nouveau", "popular": "Populaire" },
    "pagination": { "previous": "Précédent", "next": "Suivant" },
    "empty": { "title": "Aucun contenu trouvé", "description": "Essayez d'ajuster vos filtres pour voir plus de résultats" }
  },
  'de-DE': {
    "title": "Medien-Hub",
    "subtitle": "Entdecken Sie Videos, Bilder und Audio von talentierten Kreativen",
    "search": { "placeholder": "Nach Titel, Talent oder Beschreibung suchen...", "clear": "Suche löschen" },
    "categories": { "title": "Kategorien", "all": "Alle", "acting": "Schauspiel", "music": "Musik", "modeling": "Modeling", "directing": "Regie", "writing": "Schreiben", "photography": "Fotografie" },
    "type": { "title": "Typ:", "all": "Alle", "videos": "Videos", "audio": "Audio", "images": "Bilder" },
    "filters": { "button": "Filter", "popularityTier": "Beliebtheitsstufe", "viral": "Viral", "popular": "Beliebt", "rising": "Aufsteigend", "fresh": "Neu", "uploadDate": "Upload-Datum", "allTime": "Alle Zeiten", "today": "Heute", "pastWeek": "Letzte Woche", "pastMonth": "Letzter Monat", "pastYear": "Letztes Jahr", "sortBy": "Sortieren nach", "trending": "Trending", "newest": "Neueste", "mostLiked": "Beliebt", "alphabetical": "A-Z", "oldest": "Oldest First", "mostViews": "Most Views", "leastViews": "Least Views", "mostLikes": "Most Likes", "leastLikes": "Least Likes", "zToA": "Z-A", "clearAll": "Alle Filter löschen", "activeFilters": "Aktive Filter", "search": "Suche", "category": "Kategorie", "type": "Typ", "sort": "Sortierung", "showing": "Zeige", "results": "Ergebnis", "resultsPlural": "Ergebnisse" },
    "sections": { "featuredCreators": "Empfohlene Kreative", "discoverTopTalent": "Entdecken Sie Top-Talente auf der Plattform", "trendingNow": "Jetzt im Trend", "hotContent": "Beliebter Inhalt im Moment", "mostViewed": "Meistgesehener Inhalt im Moment", "featuredVideos": "Empfohlene Videos", "video": "Video", "videos": "Videos", "viewAllVideos": "Alle Videos ansehen →", "featuredAudio": "Empfohlenes Audio", "audioTrack": "Audio-Track", "audioTracks": "Audio-Tracks", "viewAllAudio": "Alle Audios ansehen →", "featuredImages": "Empfohlene Bilder", "image": "Bild", "images": "Bilder", "viewAllImages": "Alle Bilder ansehen →", "latestUploads": "Neueste Uploads", "freshContent": "Frischer Inhalt", "mostPopular": "Beliebteste", "lovedByCommunity": "Von der Community geliebt" },
    "badges": { "sponsored": "Gesponsert", "trending": "Trending", "hot": "Beliebt", "new": "Neu", "popular": "Beliebt" },
    "pagination": { "previous": "Zurück", "next": "Weiter" },
    "empty": { "title": "Kein Inhalt gefunden", "description": "Versuchen Sie, Ihre Filter anzupassen, um mehr Ergebnisse zu sehen" }
  },
  'es-ES': {
    "title": "Centro de Medios",
    "subtitle": "Descubre videos, imágenes y audio de creadores talentosos",
    "search": { "placeholder": "Buscar por título, talento o descripción...", "clear": "Limpiar búsqueda" },
    "categories": { "title": "Categorías", "all": "Todos", "acting": "Actuación", "music": "Música", "modeling": "Modelaje", "directing": "Dirección", "writing": "Escritura", "photography": "Fotografía" },
    "type": { "title": "Tipo:", "all": "Todos", "videos": "Videos", "audio": "Audio", "images": "Imágenes" },
    "filters": { "button": "Filtros", "popularityTier": "Nivel de popularidad", "viral": "Viral", "popular": "Popular", "rising": "En auge", "fresh": "Reciente", "uploadDate": "Fecha de subida", "allTime": "Siempre", "today": "Hoy", "pastWeek": "Última semana", "pastMonth": "Último mes", "pastYear": "Último año", "sortBy": "Ordenar por", "trending": "Tendencia", "newest": "Más reciente", "mostLiked": "Popular", "alphabetical": "A-Z", "oldest": "Oldest First", "mostViews": "Most Views", "leastViews": "Least Views", "mostLikes": "Most Likes", "leastLikes": "Least Likes", "zToA": "Z-A", "clearAll": "Borrar todos los filtros", "activeFilters": "Filtros activos", "search": "Búsqueda", "category": "Categoría", "type": "Tipo", "sort": "Orden", "showing": "Mostrando", "results": "resultado", "resultsPlural": "resultados" },
    "sections": { "featuredCreators": "Creadores destacados", "discoverTopTalent": "Descubre los mejores talentos de la plataforma", "trendingNow": "Tendencias actuales", "hotContent": "Contenido popular ahora", "mostViewed": "Contenido más visto ahora", "featuredVideos": "Videos destacados", "video": "video", "videos": "videos", "viewAllVideos": "Ver todos los videos →", "featuredAudio": "Audio destacado", "audioTrack": "pista de audio", "audioTracks": "pistas de audio", "viewAllAudio": "Ver todo el audio →", "featuredImages": "Imágenes destacadas", "image": "imagen", "images": "imágenes", "viewAllImages": "Ver todas las imágenes →", "latestUploads": "Últimas subidas", "freshContent": "Contenido fresco", "mostPopular": "Más populares", "lovedByCommunity": "Amado por la comunidad" },
    "badges": { "sponsored": "Patrocinado", "trending": "Tendencia", "hot": "Popular", "new": "Nuevo", "popular": "Popular" },
    "pagination": { "previous": "Anterior", "next": "Siguiente" },
    "empty": { "title": "No se encontró contenido", "description": "Intenta ajustar tus filtros para ver más resultados" }
  },
  'it-IT': {
    "title": "Hub Multimediale",
    "subtitle": "Scopri video, immagini e audio da creatori di talento",
    "search": { "placeholder": "Cerca per titolo, talento o descrizione...", "clear": "Cancella ricerca" },
    "categories": { "title": "Categorie", "all": "Tutti", "acting": "Recitazione", "music": "Musica", "modeling": "Modelle", "directing": "Regia", "writing": "Scrittura", "photography": "Fotografia" },
    "type": { "title": "Tipo:", "all": "Tutti", "videos": "Video", "audio": "Audio", "images": "Immagini" },
    "filters": { "button": "Filtri", "popularityTier": "Livello di popolarità", "viral": "Virale", "popular": "Popolare", "rising": "In crescita", "fresh": "Recente", "uploadDate": "Data di caricamento", "allTime": "Sempre", "today": "Oggi", "pastWeek": "Ultima settimana", "pastMonth": "Ultimo mese", "pastYear": "Ultimo anno", "sortBy": "Ordina per", "trending": "Tendenza", "newest": "Più recente", "mostLiked": "Popolare", "alphabetical": "A-Z", "oldest": "Oldest First", "mostViews": "Most Views", "leastViews": "Least Views", "mostLikes": "Most Likes", "leastLikes": "Least Likes", "zToA": "Z-A", "clearAll": "Cancella tutti i filtri", "activeFilters": "Filtri attivi", "search": "Ricerca", "category": "Categoria", "type": "Tipo", "sort": "Ordinamento", "showing": "Mostra", "results": "risultato", "resultsPlural": "risultati" },
    "sections": { "featuredCreators": "Creatori in evidenza", "discoverTopTalent": "Scopri i migliori talenti sulla piattaforma", "trendingNow": "Tendenze attuali", "hotContent": "Contenuto popolare ora", "mostViewed": "Contenuto più visto ora", "featuredVideos": "Video in evidenza", "video": "video", "videos": "video", "viewAllVideos": "Vedi tutti i video →", "featuredAudio": "Audio in evidenza", "audioTrack": "traccia audio", "audioTracks": "tracce audio", "viewAllAudio": "Vedi tutto l'audio →", "featuredImages": "Immagini in evidenza", "image": "immagine", "images": "immagini", "viewAllImages": "Vedi tutte le immagini →", "latestUploads": "Ultimi caricamenti", "freshContent": "Contenuti freschi", "mostPopular": "Più popolari", "lovedByCommunity": "Amato dalla comunità" },
    "badges": { "sponsored": "Sponsorizzato", "trending": "Tendenza", "hot": "Popolare", "new": "Nuovo", "popular": "Popolare" },
    "pagination": { "previous": "Precedente", "next": "Successivo" },
    "empty": { "title": "Nessun contenuto trovato", "description": "Prova a regolare i filtri per vedere più risultati" }
  },
  'pt-PT': {
    "title": "Centro de Mídia",
    "subtitle": "Descubra vídeos, imagens e áudio de criadores talentosos",
    "search": { "placeholder": "Pesquisar por título, talento ou descrição...", "clear": "Limpar pesquisa" },
    "categories": { "title": "Categorias", "all": "Todos", "acting": "Atuação", "music": "Música", "modeling": "Modelagem", "directing": "Direção", "writing": "Escrita", "photography": "Fotografia" },
    "type": { "title": "Tipo:", "all": "Todos", "videos": "Vídeos", "audio": "Áudio", "images": "Imagens" },
    "filters": { "button": "Filtros", "popularityTier": "Nível de popularidade", "viral": "Viral", "popular": "Popular", "rising": "Em ascensão", "fresh": "Recente", "uploadDate": "Data de upload", "allTime": "Sempre", "today": "Hoje", "pastWeek": "Última semana", "pastMonth": "Último mês", "pastYear": "Último ano", "sortBy": "Ordenar por", "trending": "Tendência", "newest": "Mais recente", "mostLiked": "Popular", "alphabetical": "A-Z", "oldest": "Oldest First", "mostViews": "Most Views", "leastViews": "Least Views", "mostLikes": "Most Likes", "leastLikes": "Least Likes", "zToA": "Z-A", "clearAll": "Limpar todos os filtros", "activeFilters": "Filtros ativos", "search": "Pesquisa", "category": "Categoria", "type": "Tipo", "sort": "Ordem", "showing": "Mostrando", "results": "resultado", "resultsPlural": "resultados" },
    "sections": { "featuredCreators": "Criadores em destaque", "discoverTopTalent": "Descubra os melhores talentos da plataforma", "trendingNow": "Tendências atuais", "hotContent": "Conteúdo popular agora", "mostViewed": "Conteúdo mais visto agora", "featuredVideos": "Vídeos em destaque", "video": "vídeo", "videos": "vídeos", "viewAllVideos": "Ver todos os vídeos →", "featuredAudio": "Áudio em destaque", "audioTrack": "faixa de áudio", "audioTracks": "faixas de áudio", "viewAllAudio": "Ver todo o áudio →", "featuredImages": "Imagens em destaque", "image": "imagem", "images": "imagens", "viewAllImages": "Ver todas as imagens →", "latestUploads": "Últimos envios", "freshContent": "Conteúdo fresco", "mostPopular": "Mais populares", "lovedByCommunity": "Amado pela comunidade" },
    "badges": { "sponsored": "Patrocinado", "trending": "Tendência", "hot": "Popular", "new": "Novo", "popular": "Popular" },
    "pagination": { "previous": "Anterior", "next": "Próximo" },
    "empty": { "title": "Nenhum conteúdo encontrado", "description": "Tente ajustar seus filtros para ver mais resultados" }
  },
  'ru-RU': {
    "title": "Медиа-центр",
    "subtitle": "Откройте для себя видео, изображения и аудио от талантливых создателей",
    "search": { "placeholder": "Поиск по названию, таланту или описанию...", "clear": "Очистить поиск" },
    "categories": { "title": "Категории", "all": "Все", "acting": "Актёрское мастерство", "music": "Музыка", "modeling": "Моделирование", "directing": "Режиссура", "writing": "Письмо", "photography": "Фотография" },
    "type": { "title": "Тип:", "all": "Все", "videos": "Видео", "audio": "Аудио", "images": "Изображения" },
    "filters": { "button": "Фильтры", "popularityTier": "Уровень популярности", "viral": "Вирусный", "popular": "Популярный", "rising": "Растущий", "fresh": "Свежий", "uploadDate": "Дата загрузки", "allTime": "Все время", "today": "Сегодня", "pastWeek": "Прошлая неделя", "pastMonth": "Прошлый месяц", "pastYear": "Прошлый год", "sortBy": "Сортировать по", "trending": "Тренды", "newest": "Новейшие", "mostLiked": "Популярные", "alphabetical": "А-Я", "oldest": "Oldest First", "mostViews": "Most Views", "leastViews": "Least Views", "mostLikes": "Most Likes", "leastLikes": "Least Likes", "zToA": "Z-A", "clearAll": "Очистить все фильтры", "activeFilters": "Активные фильтры", "search": "Поиск", "category": "Категория", "type": "Тип", "sort": "Сортировка", "showing": "Показано", "results": "результат", "resultsPlural": "результатов" },
    "sections": { "featuredCreators": "Избранные создатели", "discoverTopTalent": "Откройте для себя лучшие таланты на платформе", "trendingNow": "Сейчас в тренде", "hotContent": "Популярный контент сейчас", "mostViewed": "Самый просматриваемый контент сейчас", "featuredVideos": "Избранные видео", "video": "видео", "videos": "видео", "viewAllVideos": "Посмотреть все видео →", "featuredAudio": "Избранное аудио", "audioTrack": "аудиодорожка", "audioTracks": "аудиодорожки", "viewAllAudio": "Посмотреть все аудио →", "featuredImages": "Избранные изображения", "image": "изображение", "images": "изображения", "viewAllImages": "Посмотреть все изображения →", "latestUploads": "Последние загрузки", "freshContent": "Свежий контент", "mostPopular": "Самые популярные", "lovedByCommunity": "Любимый сообществом" },
    "badges": { "sponsored": "Спонсируется", "trending": "Тренд", "hot": "Популярный", "new": "Новый", "popular": "Популярный" },
    "pagination": { "previous": "Предыдущий", "next": "Следующий" },
    "empty": { "title": "Контент не найден", "description": "Попробуйте изменить фильтры, чтобы увидеть больше результатов" }
  },
  'ja-JP': {
    "title": "メディアハブ",
    "subtitle": "才能あるクリエイターの動画、画像、音声を発見する",
    "search": { "placeholder": "タイトル、タレント、説明で検索...", "clear": "検索をクリア" },
    "categories": { "title": "カテゴリー", "all": "すべて", "acting": "演技", "music": "音楽", "modeling": "モデリング", "directing": "演出", "writing": "執筆", "photography": "写真撮影" },
    "type": { "title": "タイプ:", "all": "すべて", "videos": "動画", "audio": "音声", "images": "画像" },
    "filters": { "button": "フィルター", "popularityTier": "人気度", "viral": "バイラル", "popular": "人気", "rising": "上昇中", "fresh": "新着", "uploadDate": "アップロード日", "allTime": "全期間", "today": "今日", "pastWeek": "過去1週間", "pastMonth": "過去1ヶ月", "pastYear": "過去1年", "sortBy": "並べ替え", "trending": "トレンド", "newest": "最新", "mostLiked": "人気", "alphabetical": "A-Z", "oldest": "Oldest First", "mostViews": "Most Views", "leastViews": "Least Views", "mostLikes": "Most Likes", "leastLikes": "Least Likes", "zToA": "Z-A", "clearAll": "すべてのフィルターをクリア", "activeFilters": "アクティブなフィルター", "search": "検索", "category": "カテゴリー", "type": "タイプ", "sort": "並べ替え", "showing": "表示中", "results": "件", "resultsPlural": "件" },
    "sections": { "featuredCreators": "注目のクリエイター", "discoverTopTalent": "プラットフォームのトップタレントを発見する", "trendingNow": "今のトレンド", "hotContent": "今人気のコンテンツ", "mostViewed": "今最も視聴されているコンテンツ", "featuredVideos": "注目の動画", "video": "動画", "videos": "動画", "viewAllVideos": "すべての動画を見る →", "featuredAudio": "注目の音声", "audioTrack": "音声トラック", "audioTracks": "音声トラック", "viewAllAudio": "すべての音声を見る →", "featuredImages": "注目の画像", "image": "画像", "images": "画像", "viewAllImages": "すべての画像を見る →", "latestUploads": "最新のアップロード", "freshContent": "新着コンテンツ", "mostPopular": "最も人気", "lovedByCommunity": "コミュニティに愛されています" },
    "badges": { "sponsored": "スポンサー", "trending": "トレンド", "hot": "人気", "new": "新着", "popular": "人気" },
    "pagination": { "previous": "前へ", "next": "次へ" },
    "empty": { "title": "コンテンツが見つかりません", "description": "フィルターを調整して、より多くの結果を表示してください" }
  },
  'zh-CN': {
    "title": "媒体中心",
    "subtitle": "发现有才华的创作者的视频、图片和音频",
    "search": { "placeholder": "按标题、人才或描述搜索...", "clear": "清除搜索" },
    "categories": { "title": "类别", "all": "全部", "acting": "表演", "music": "音乐", "modeling": "模特", "directing": "导演", "writing": "写作", "photography": "摄影" },
    "type": { "title": "类型:", "all": "全部", "videos": "视频", "audio": "音频", "images": "图片" },
    "filters": { "button": "筛选", "popularityTier": "热度等级", "viral": "病毒式", "popular": "热门", "rising": "上升中", "fresh": "新鲜", "uploadDate": "上传日期", "allTime": "全部时间", "today": "今天", "pastWeek": "过去一周", "pastMonth": "过去一个月", "pastYear": "过去一年", "sortBy": "排序方式", "trending": "趋势", "newest": "最新", "mostLiked": "最受欢迎", "alphabetical": "A-Z", "oldest": "Oldest First", "mostViews": "Most Views", "leastViews": "Least Views", "mostLikes": "Most Likes", "leastLikes": "Least Likes", "zToA": "Z-A", "clearAll": "清除所有筛选", "activeFilters": "活动筛选", "search": "搜索", "category": "类别", "type": "类型", "sort": "排序", "showing": "显示", "results": "结果", "resultsPlural": "结果" },
    "sections": { "featuredCreators": "精选创作者", "discoverTopTalent": "发现平台上的顶级人才", "trendingNow": "现在趋势", "hotContent": "现在热门内容", "mostViewed": "现在最受关注的内容", "featuredVideos": "精选视频", "video": "视频", "videos": "视频", "viewAllVideos": "查看所有视频 →", "featuredAudio": "精选音频", "audioTrack": "音频轨道", "audioTracks": "音频轨道", "viewAllAudio": "查看所有音频 →", "featuredImages": "精选图片", "image": "图片", "images": "图片", "viewAllImages": "查看所有图片 →", "latestUploads": "最新上传", "freshContent": "新鲜内容", "mostPopular": "最受欢迎", "lovedByCommunity": "受到社区喜爱" },
    "badges": { "sponsored": "赞助", "trending": "趋势", "hot": "热门", "new": "新", "popular": "热门" },
    "pagination": { "previous": "上一页", "next": "下一页" },
    "empty": { "title": "未找到内容", "description": "尝试调整筛选器以查看更多结果" }
  },
  'ar': {
    "title": "مركز الوسائط",
    "subtitle": "اكتشف مقاطع الفيديو والصور والصوت من منشئي المحتوى الموهوبين",
    "search": { "placeholder": "ابحث بالعنوان أو الموهبة أو الوصف...", "clear": "مسح البحث" },
    "categories": { "title": "الفئات", "all": "الكل", "acting": "التمثيل", "music": "الموسيقى", "modeling": "النمذجة", "directing": "الإخراج", "writing": "الكتابة", "photography": "التصوير الفوتوغرافي" },
    "type": { "title": "النوع:", "all": "الكل", "videos": "فيديوهات", "audio": "صوتي", "images": "صور" },
    "filters": { "button": "عوامل التصفية", "popularityTier": "مستوى الشعبية", "viral": "فيروسي", "popular": "شائع", "rising": "في ارتفاع", "fresh": "جديد", "uploadDate": "تاريخ التحميل", "allTime": "كل الوقت", "today": "اليوم", "pastWeek": "الأسبوع الماضي", "pastMonth": "الشهر الماضي", "pastYear": "العام الماضي", "sortBy": "الترتيب حسب", "trending": "الرائج", "newest": "الأحدث", "mostLiked": "الأكثر إعجابًا", "alphabetical": "أ-ي", "oldest": "Oldest First", "mostViews": "Most Views", "leastViews": "Least Views", "mostLikes": "Most Likes", "leastLikes": "Least Likes", "zToA": "Z-A", "clearAll": "مسح جميع عوامل التصفية", "activeFilters": "عوامل التصفية النشطة", "search": "بحث", "category": "الفئة", "type": "النوع", "sort": "الترتيب", "showing": "عرض", "results": "نتيجة", "resultsPlural": "نتائج" },
    "sections": { "featuredCreators": "منشئو المحتوى المميزون", "discoverTopTalent": "اكتشف أفضل المواهب على المنصة", "trendingNow": "الرائج الآن", "hotContent": "محتوى ساخن الآن", "mostViewed": "الأكثر مشاهدة الآن", "featuredVideos": "فيديوهات مميزة", "video": "فيديو", "videos": "فيديوهات", "viewAllVideos": "عرض جميع الفيديوهات ←", "featuredAudio": "صوتيات مميزة", "audioTrack": "مقطع صوتي", "audioTracks": "مقاطع صوتية", "viewAllAudio": "عرض جميع الصوتيات ←", "featuredImages": "صور مميزة", "image": "صورة", "images": "صور", "viewAllImages": "عرض جميع الصور ←", "latestUploads": "أحدث التحميلات", "freshContent": "محتوى جديد", "mostPopular": "الأكثر شعبية", "lovedByCommunity": "محبوب من المجتمع" },
    "badges": { "sponsored": "برعاية", "trending": "رائج", "hot": "ساخن", "new": "جديد", "popular": "شائع" },
    "pagination": { "previous": "السابق", "next": "التالي" },
    "empty": { "title": "لم يتم العثور على محتوى", "description": "حاول ضبط عوامل التصفية لرؤية المزيد من النتائج" }
  }
};

const locales = ['fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-PT', 'ru-RU', 'ja-JP', 'zh-CN', 'ar'];

locales.forEach(locale => {
  const filePath = path.join(__dirname, '../messages', `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Always update Hub translations to ensure new keys are added
  data.Hub = hubTranslations[locale];
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✅ Updated Hub translations in ${locale}.json`);
});

console.log('\n✨ Hub translations updated in all language files!');
