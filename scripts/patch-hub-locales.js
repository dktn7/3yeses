#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const messagesDir = path.join(__dirname, '..', 'messages');
const translations = {
  'de-DE': {
    Hub: {
      categories: {
        modeling: 'Modeln'
      },
      type: {
        title: 'Typ:',
        videos: 'Videoinhalte',
        audio: 'Audiodateien',
        images: 'Bilder'
      },
      filters: {
        viral: 'Viraltrends',
        popular: 'Beliebt',
        alphabetical: 'A bis Z',
        reverseAlphabetical: 'Z bis A',
        oldest: 'Älteste zuerst',
        mostViews: 'Meiste Aufrufe',
        leastViews: 'Wenigste Aufrufe',
        mostLikes: 'Meiste Likes',
        leastLikes: 'Wenigste Likes',
        zToA: 'Z bis A',
        type: 'Typ'
      },
      sections: {
        video: 'Video',
        videos: 'Videos',
        image: 'Bild',
        images: 'Bilder',
        exploreAll: 'Alle Inhalte entdecken',
        exploreMoreDescription: 'Im gesamten Katalog gibt es noch {count} weitere Elemente zu entdecken.'
      },
      badges: {
        trending: 'Trend',
        popular: 'Beliebt'
      }
    }
  },
  'es-ES': {
    Hub: {
      type: {
        title: 'Tipo:',
        videos: 'Vídeos',
        audio: 'Audio',
        images: 'Imágenes'
      },
      filters: {
        viral: 'Contenidos virales',
        popular: 'Más populares',
        alphabetical: 'De la A a la Z',
        reverseAlphabetical: 'De la Z a la A',
        oldest: 'Más antiguos',
        mostViews: 'Más vistas',
        leastViews: 'Menos vistas',
        mostLikes: 'Más me gusta',
        leastLikes: 'Menos me gusta',
        zToA: 'Z a A',
        type: 'Tipo'
      },
      sections: {
        video: 'vídeo',
        videos: 'vídeos',
        image: 'imagen',
        images: 'imágenes',
        exploreAll: 'Explorar todo el contenido',
        exploreMoreDescription: 'Hay {count} artículos más para descubrir en nuestro catálogo completo.'
      },
      badges: {
        trending: 'Tendencia',
        popular: 'Popular'
      }
    }
  },
  'fr-FR': {
    Hub: {
      type: {
        title: 'Type :',
        videos: 'Vidéos',
        audio: 'Piste audio',
        images: 'Photos'
      },
      filters: {
        viral: 'Contenu viral',
        popular: 'Populaire',
        alphabetical: 'A à Z',
        reverseAlphabetical: 'Z à A',
        oldest: 'Les plus anciens',
        mostViews: 'Le plus de vues',
        leastViews: 'Le moins de vues',
        mostLikes: 'Le plus de likes',
        leastLikes: 'Le moins de likes',
        zToA: 'Z à A',
        type: 'Type de contenu'
      },
      sections: {
        video: 'Vidéo',
        videos: 'Vidéos',
        image: 'Image',
        images: 'Images',
        exploreAll: 'Explorer tout le contenu',
        exploreMoreDescription: 'Il y a {count} éléments supplémentaires à découvrir dans notre catalogue complet.'
      },
      badges: {
        trending: 'Tendance',
        popular: 'Populaire'
      }
    }
  },
  'it-IT': {
    Hub: {
      type: {
        title: 'Tipo:',
        videos: 'Video',
        audio: 'Traccia audio',
        images: 'Immagini'
      },
      filters: {
        viral: 'Virale',
        popular: 'Più popolari',
        alphabetical: 'Da A a Z',
        reverseAlphabetical: 'Da Z ad A',
        oldest: 'Più vecchi',
        mostViews: 'Più visualizzati',
        leastViews: 'Meno visualizzati',
        mostLikes: 'Più like',
        leastLikes: 'Meno like',
        zToA: 'Z ad A',
        type: 'Tipo'
      },
      sections: {
        video: 'Video',
        videos: 'video',
        image: 'immagine',
        images: 'immagini',
        exploreAll: 'Esplora tutti i contenuti',
        exploreMoreDescription: 'Ci sono altri {count} elementi da scoprire nel nostro catalogo completo.'
      },
      badges: {
        trending: 'In voga',
        popular: 'Popolare'
      }
    }
  },
  'pt-PT': {
    Hub: {
      type: {
        title: 'Tipo:',
        videos: 'Vídeos',
        audio: 'Áudio',
        images: 'Imagens'
      },
      filters: {
        viral: 'Conteúdos virais',
        popular: 'Mais populares',
        alphabetical: 'A a Z',
        reverseAlphabetical: 'Z a A',
        oldest: 'Mais antigos',
        mostViews: 'Mais visualizados',
        leastViews: 'Menos visualizados',
        mostLikes: 'Mais likes',
        leastLikes: 'Menos likes',
        zToA: 'Z a A',
        type: 'Tipo'
      },
      sections: {
        video: 'vídeo',
        videos: 'vídeos',
        image: 'imagem',
        images: 'imagens',
        exploreAll: 'Explorar todo o conteúdo',
        exploreMoreDescription: 'Há mais {count} itens para descobrir no nosso catálogo completo.'
      },
      badges: {
        trending: 'Tendência',
        popular: 'Mais popular'
      }
    }
  },
  'ru-RU': {
    Hub: {
      type: {
        title: 'Тип:',
        videos: 'Видео',
        audio: 'Аудио',
        images: 'Изображения'
      },
      filters: {
        viral: 'Вирусный контент',
        popular: 'Популярные',
        alphabetical: 'A–Z',
        reverseAlphabetical: 'Z–A',
        oldest: 'Сначала старые',
        mostViews: 'Больше всего просмотров',
        leastViews: 'Меньше всего просмотров',
        mostLikes: 'Больше всего лайков',
        leastLikes: 'Меньше всего лайков',
        zToA: 'Z–A',
        type: 'Тип'
      },
      sections: {
        video: 'видео',
        videos: 'видео',
        image: 'изображение',
        images: 'изображения',
        exploreAll: 'Просмотреть весь контент',
        exploreMoreDescription: 'В нашем полном каталоге есть еще {count} элементов для изучения.'
      },
      badges: {
        trending: 'Тренд',
        popular: 'Популярно'
      }
    }
  },
  'ja-JP': {
    Hub: {
      type: {
        title: '種類:',
        videos: '動画',
        audio: 'オーディオ',
        images: '画像'
      },
      filters: {
        viral: 'バイラルコンテンツ',
        popular: '人気',
        alphabetical: 'A→Z',
        reverseAlphabetical: 'Z→A',
        oldest: '古い順',
        mostViews: '再生数順',
        leastViews: '再生数の少ない順',
        mostLikes: 'いいね数順',
        leastLikes: 'いいね数の少ない順',
        zToA: 'Z→A',
        type: '種類'
      },
      sections: {
        video: '動画',
        videos: '動画',
        image: '画像',
        images: '画像',
        exploreAll: 'すべてのコンテンツを表示',
        exploreMoreDescription: '完全なカタログには、さらに {count} 件のアイテムがあります。'
      },
      badges: {
        trending: 'トレンド',
        popular: '人気'
      }
    }
  },
  'zh-CN': {
    Hub: {
      type: {
        title: '类型：',
        videos: '视频',
        audio: '音频',
        images: '图片'
      },
      filters: {
        viral: '病毒式内容',
        popular: '热门',
        alphabetical: 'A→Z',
        reverseAlphabetical: 'Z→A',
        oldest: '最旧优先',
        mostViews: '最多浏览',
        leastViews: '最少浏览',
        mostLikes: '最多点赞',
        leastLikes: '最少点赞',
        zToA: 'Z→A',
        type: '类型'
      },
      sections: {
        video: '视频',
        videos: '视频',
        image: '图片',
        images: '图片',
        exploreAll: '查看全部内容',
        exploreMoreDescription: '完整目录中还有 {count} 个项目可供发现。'
      },
      badges: {
        trending: '热门',
        popular: '受欢迎'
      }
    }
  },
  'ar': {
    Hub: {
      type: {
        title: 'النوع:',
        videos: 'مقاطع فيديو',
        audio: 'صوت',
        images: 'صور'
      },
      filters: {
        viral: 'محتوى فيروسي',
        popular: 'شائع',
        alphabetical: 'A → Z',
        reverseAlphabetical: 'Z → A',
        oldest: 'الأقدم أولاً',
        mostViews: 'الأكثر مشاهدة',
        leastViews: 'الأقل مشاهدة',
        mostLikes: 'الأكثر إعجابًا',
        leastLikes: 'الأقل إعجابًا',
        zToA: 'Z → A',
        type: 'النوع'
      },
      sections: {
        video: 'فيديو',
        videos: 'فيديوهات',
        image: 'صورة',
        images: 'صور',
        exploreAll: 'استعرض كل المحتوى',
        exploreMoreDescription: 'هناك {count} عنصرًا إضافيًا لاكتشافه في كتالوجنا الكامل.'
      },
      badges: {
        trending: 'رائج',
        popular: 'شائع'
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
  console.log(`Patched Hub translation fallbacks for ${locale}`);
}
