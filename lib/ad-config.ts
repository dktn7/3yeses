export interface AdUnit {
  id: string;
  imageUrl: string;
  linkUrl: string;
  altText: string;
  headline: string;
  body: string;
  host: string;
  cta: string;
}

export const adUnits: AdUnit[] = [
  {
    id: 'ad-1',
    imageUrl: '/ads/ad-photo-1.jpg',
    linkUrl: 'https://spotlight.io',
    altText: 'Spotlight Acting Academy',
    headline: 'Land your next role',
    body: 'Professional acting workshops for every level. Enrol now.',
    host: 'spotlight.io',
    cta: 'Learn more',
  },
  {
    id: 'ad-2',
    imageUrl: '/ads/ad-photo-2.jpg',
    linkUrl: 'https://starlightstudios.co.uk',
    altText: 'Starlight Studios',
    headline: 'Your showreel, perfected',
    body: 'Book a professional studio session from £149.',
    host: 'starlightstudios.co.uk',
    cta: 'Book now',
  },
  {
    id: 'ad-3',
    imageUrl: '/ads/ad-photo-3.jpg',
    linkUrl: 'https://creativelensphoto.com',
    altText: 'Creative Lens Photography',
    headline: 'Headshots that open doors',
    body: 'Award-winning headshot photographers in London & Manchester.',
    host: 'creativelensphoto.com',
    cta: 'See packages',
  },
  {
    id: 'ad-4',
    imageUrl: '/ads/ad-photo-4.jpg',
    linkUrl: 'https://soundhive.studio',
    altText: 'SoundHive Recording Studio',
    headline: 'Record your debut track',
    body: 'State-of-the-art recording studios. Half-day from £95.',
    host: 'soundhive.studio',
    cta: 'Book a session',
  },
  {
    id: 'ad-5',
    imageUrl: '/ads/ad-photo-5.jpg',
    linkUrl: 'https://danceacademy.co',
    altText: 'Move & Groove Dance Academy',
    headline: 'Elevate your dance career',
    body: 'Audition masterclasses led by West End choreographers.',
    host: 'danceacademy.co',
    cta: 'Join a class',
  },
  {
    id: 'ad-6',
    imageUrl: '/ads/ad-photo-6.jpg',
    linkUrl: 'https://modelmanagement.com',
    altText: 'Model Management Agency',
    headline: 'Get scouted today',
    body: 'Submit your portfolio to 200+ top modelling agencies.',
    host: 'modelmanagement.com',
    cta: 'Apply free',
  },
  {
    id: 'ad-7',
    imageUrl: '/ads/ad-photo-7.jpg',
    linkUrl: 'https://voiceovercentral.com',
    altText: 'VoiceOver Central',
    headline: 'Break into voice acting',
    body: 'Demo production & coaching from industry pros.',
    host: 'voiceovercentral.com',
    cta: 'Start today',
  },
  {
    id: 'ad-8',
    imageUrl: '/ads/ad-photo-8.jpg',
    linkUrl: 'https://fashionforward.agency',
    altText: 'Fashion Forward Agency',
    headline: 'Walk for top brands',
    body: 'Open runway casting calls every month. No experience needed.',
    host: 'fashionforward.agency',
    cta: 'Apply now',
  },
];
