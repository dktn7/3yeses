#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '..', 'messages');
const translations = {
  ar: ['JPG وPNG وWebP وGIF', 'استخدم MP4 لدعم واسع للمتصفحات.', 'استخدم MP3 لدعم واسع للمتصفحات.'],
  'de-DE': ['JPG, PNG, WebP und GIF', 'Verwenden Sie MP4 für breite Browserunterstützung.', 'Verwenden Sie MP3 für breite Browserunterstützung.'],
  'es-ES': ['JPG, PNG, WebP y GIF', 'Usa MP4 para una amplia compatibilidad con navegadores.', 'Usa MP3 para una amplia compatibilidad con navegadores.'],
  'fr-FR': ['JPG, PNG, WebP et GIF', 'Utilisez MP4 pour une large compatibilité des navigateurs.', 'Utilisez MP3 pour une large compatibilité des navigateurs.'],
  'it-IT': ['JPG, PNG, WebP e GIF', 'Usa MP4 per un\'ampia compatibilità con i browser.', 'Usa MP3 per un\'ampia compatibilità con i browser.'],
  'ja-JP': ['JPG、PNG、WebP、GIF', '幅広いブラウザに対応するにはMP4を使用してください。', '幅広いブラウザに対応するにはMP3を使用してください。'],
  'pt-PT': ['JPG, PNG, WebP e GIF', 'Utilize MP4 para uma ampla compatibilidade com os navegadores.', 'Utilize MP3 para uma ampla compatibilidade com os navegadores.'],
  'ru-RU': ['JPG, PNG, WebP и GIF', 'Используйте MP4 для широкой поддержки браузерами.', 'Используйте MP3 для широкой поддержки браузерами.'],
  'zh-CN': ['JPG、PNG、WebP 和 GIF', '使用 MP4 以获得广泛的浏览器支持。', '使用 MP3 以获得广泛的浏览器支持。']
};

for (const [locale, [formats, video, audio]] of Object.entries(translations)) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const messages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  messages.dashboard.gallery.imageSupportedFormats = formats;
  messages.dashboard.gallery.videoFormat = video;
  messages.dashboard.gallery.audioFormat = audio;
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2) + '\n', 'utf8');
}

console.log(`Patched media-format translations for ${Object.keys(translations).length} locales`);
