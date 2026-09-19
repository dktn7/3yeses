export interface SurfaceContrast {
  foreground: '#000000' | '#ffffff';
  muted: '#000000' | '#ffffff';
  border: string;
}

function expandHexColor(value: string) {
  const normalized = value.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(normalized)) {
    return normalized.split('').map((character) => character + character).join('');
  }
  return /^[0-9a-f]{6}$/i.test(normalized) ? normalized : null;
}

export function relativeLuminance(value: string) {
  const expanded = expandHexColor(value);
  if (!expanded) return null;

  const [r, g, b] = [0, 2, 4]
    .map((start) => parseInt(expanded.slice(start, start + 2), 16) / 255)
    .map((channel) => (
      channel <= 0.04045
        ? channel / 12.92
        : Math.pow((channel + 0.055) / 1.055, 2.4)
    ));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(first: string, second: string) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  if (firstLuminance === null || secondLuminance === null) return null;

  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

export function getSurfaceContrast(value: string): SurfaceContrast {
  const blackContrast = contrastRatio(value, '#000000');
  const whiteContrast = contrastRatio(value, '#ffffff');

  if (blackContrast === null || whiteContrast === null || blackContrast >= whiteContrast) {
    return {
      foreground: '#000000',
      muted: '#000000',
      border: 'rgba(0, 0, 0, 0.22)',
    };
  }

  return {
    foreground: '#ffffff',
    muted: '#ffffff',
    border: 'rgba(255, 255, 255, 0.28)',
  };
}
