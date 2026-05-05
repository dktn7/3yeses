import type { ComponentType, SVGProps } from 'react';
import { createElement } from 'react';
import * as Ph from 'phosphor-react';

const P: any = Ph;
type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const DefaultIcon: IconType = (props) =>
  createElement(
    'svg',
    { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', ...props },
    createElement('circle', { cx: 12, cy: 12, r: 10, stroke: 'currentColor', strokeWidth: 1.5, fill: 'none' }),
    createElement('path', { d: 'M8 12c0-2 2-3 4-3s4 1 4 3', stroke: 'currentColor', strokeWidth: 1.5, fill: 'none' }),
  );

const ICON_BY_DB_NAME: Record<string, IconType> = {
  Mic: P.Microphone,
  Music: P.MusicNotes || P.MusicNote,
  Clapperboard: P.FilmSlate || P.FilmScript,
  Drama: P.MaskHappy || P.MaskSad || P.FilmSlate,
  Camera: P.Camera,
  Users: P.Users,
  Heart: P.Heart,
  Trophy: P.Trophy,
  Flame: P.Fire,
  Sparkles: P.Sparkle,
  Aperture: P.Aperture || P.CameraRotate || P.Camera,
  Palette: P.Palette,
  Film: P.FilmScript || P.FilmSlate || P.Film,
  Zap: P.Lightning,
  CheckCircle: P.CheckCircle,
  // Common lucide / legacy aliases mapped to Phosphor equivalents
  Microphone: P.Microphone,
  Globe: P.Globe,
  PenTool: P.PenNib || P.PencilSimple,
  MapPin: P.MapPin,
  Check: P.Check,
  Star: P.Star,
  Calendar: P.Calendar,
  Settings: P.Gear,
  BookOpen: P.BookOpen,
  Monitor: P.MonitorPlay || P.Monitor,
  UserCheck: P.UserCircleGear || P.UserCircle,
  MusicNotes: P.MusicNotes,
  FilmSlate: P.FilmSlate,
};

const CATEGORY_KEYWORDS: Array<{ keywords: string[]; icon: IconType }> = [
  { keywords: ['acting', 'performance', 'actor', 'actress', 'theatre', 'theater', 'film/tv'], icon: P.FilmSlate },
  { keywords: ['voice', 'dubbing', 'vo', 'voiceover', 'voice-over'], icon: P.Microphone },
  { keywords: ['music', 'audio', 'musician', 'singer', 'vocal', 'composer'], icon: P.MusicNotes },
  { keywords: ['dance', 'choreography', 'dancer'], icon: P.PersonSimpleRun },
  { keywords: ['model', 'modeling', 'modelling', 'fashion', 'runway', 'editorial', 'clothes', 'clothing', 'wardrobe'], icon: P.TShirt },
  { keywords: ['video', 'film', 'cinema', 'production', 'cinematography'], icon: P.VideoCamera },
  { keywords: ['comedy', 'stand-up', 'standup', 'improv', 'sketch'], icon: P.MaskHappy },
  { keywords: ['sports', 'fitness', 'athlete', 'trainer', 'personal trainer'], icon: P.Barbell },
  { keywords: ['aerial', 'parachute', 'skydiving', 'parachuting', 'aerials'], icon: P.Parachute },
  { keywords: ['stunt', 'stunts', 'wirework', 'fight', 'combat', 'driving'], icon: P.Bicycle },
  { keywords: ['beauty', 'makeup', 'stylist', 'hair', 'cosmetologist'], icon: P.Brush },
  { keywords: ['host', 'presenter', 'mc', 'presenting'], icon: P.Megaphone },
  { keywords: ['art', 'artist', 'creative', 'illustration', 'design'], icon: P.Palette },
  { keywords: ['projection', 'projectionist', 'projector', 'screen'], icon: P.ProjectorScreen },
  { keywords: ['motion graphics', 'motion-graphics', 'motiongraphics', 'vfx', 'post-production', 'post production', 'editor'], icon: P.Cpu },
];

const SUBCATEGORY_KEYWORDS: Array<{ keywords: string[]; icon: IconType }> = [
  { keywords: ['general', 'general talent', 'general - general'], icon: P.Users },
  { keywords: ['film/tv acting', 'theatre', 'stage'], icon: P.FilmSlate },
  { keywords: ['extras', 'background', 'background artist'], icon: P.Users },
  { keywords: ['voice acting', 'character voices', 'voice-over'], icon: P.Microphone },
  { keywords: ['commercial vo', 'narration', 'audiobook'], icon: P.Headphones },
  { keywords: ['dubbing', 'adr'], icon: P.Translate },
  { keywords: ['dj', 'djs'], icon: P.WaveSquare },
  { keywords: ['music production', 'producers', 'engineer'], icon: P.PianoKeys },
  { keywords: ['composers', 'arrangers', 'vocalists', 'singers', 'session musicians', 'musicians'], icon: P.MusicNotes },
  { keywords: ['stand-up', 'standup', 'improv', 'sketch'], icon: P.MaskHappy },
  { keywords: ['comedy writing', 'sketch writing'], icon: P.BookOpen },
  { keywords: ['ballet', 'contemporary', 'hip-hop', 'street', 'dance'], icon: P.PersonSimpleRun },
  { keywords: ['choreographer'], icon: P.ChalkboardTeacher },
  { keywords: ['fight', 'combat', 'stunt fighting'], icon: P.Shield },
  { keywords: ['stunt', 'stunts', 'stunt performer', 'stuntman', 'stuntwoman'], icon: P.Bicycle },
  { keywords: ['high-fall', 'aerial', 'wirework', 'parachute', 'skydiving'], icon: P.Parachute },
  { keywords: ['driving', 'vehicle', 'precision driving'], icon: P.Car },
  { keywords: ['camera', 'cinematography', 'cinematographer'], icon: P.Camera },
  { keywords: ['vfx', 'motion graphics', 'motion-graphics', 'motiongraphics', 'post-production', 'post production', 'editor'], icon: P.Cpu },
  { keywords: ['directors', 'producers'], icon: P.Megaphone },
  { keywords: ['commercials', 'catalogue', 'catalogue modelling'], icon: P.Star },
  { keywords: ['fashion', 'runway', 'runway model'], icon: P.CoatHanger },
  { keywords: ['clothes', 'clothing', 'wardrobe', 'styling'], icon: P.TShirt },
  { keywords: ['editorial', 'editorial modelling', 'portfolio', 'portrait', 'editorial portfolio'], icon: P.Camera },
  { keywords: ['catalogue', 'catalogue modelling', 'catalogue modelling'], icon: P.Star },
  { keywords: ['fit model', 'fit modelling', 'fit modelling'], icon: P.CoatHanger },
  { keywords: ['projection', 'projector', 'projectionist', 'screen'], icon: P.ProjectorScreen },
  { keywords: ['plus size', 'plus-size'], icon: P.Heart },
  { keywords: ['sports models', 'athletes', 'personal trainers'], icon: P.Barbell },
  { keywords: ['portrait', 'editorial'], icon: P.Camera },
];

function normalize(input: string | null | undefined): string {
  return (input || '').toLowerCase().trim();
}

function findIconFromKeywords(name: string, table: Array<{ keywords: string[]; icon: IconType }>): IconType | null {
  if (!name) return null;
  for (const entry of table) {
    if (entry.keywords.some((kw) => name.includes(kw))) {
      return entry.icon;
    }
  }
  return null;
}

export function getCategoryIconByName(categoryName?: string | null, categoryIconName?: string | null): IconType {
  const categoryText = normalize(categoryName);
  const dbIcon = categoryIconName ? ICON_BY_DB_NAME[categoryIconName] : undefined;

  // If the category is sports/fitness, prefer the Barbell icon and avoid
  // falling back to energetic/lightning icons even if stored in DB.
  const isSports = /sport|fitness|athlete|trainer/.test(categoryText);
  if (isSports) return P.Barbell;

  if (dbIcon) return dbIcon;

  return findIconFromKeywords(categoryText, CATEGORY_KEYWORDS) || P.Users || DefaultIcon;
}

export function getSubcategoryIconByName(
  subcategoryName?: string | null,
  parentCategoryName?: string | null,
  parentCategoryIconName?: string | null,
): IconType {
  const subText = normalize(subcategoryName);
  const subMatch = findIconFromKeywords(subText, SUBCATEGORY_KEYWORDS);
  if (subMatch) return subMatch;

  return getCategoryIconByName(parentCategoryName, parentCategoryIconName);
}

// Return the canonical list of available icon keys (DB names / aliases)
export function getAvailableCategoryIconNames(): string[] {
  return Object.keys(ICON_BY_DB_NAME);
}
