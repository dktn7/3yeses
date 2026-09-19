import { describe, expect, it } from 'vitest';

import { contrastRatio, getSurfaceContrast } from '@/lib/color-contrast';

describe('profile surface contrast', () => {
  it.each(['#000000', '#ffffff', '#777777', '#767676', '#808080', '#2563eb'])(
    'chooses text that meets WCAG AA on %s',
    (background) => {
      const { foreground, muted } = getSurfaceContrast(background);

      expect(contrastRatio(background, foreground)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(background, muted)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('falls back to a readable dark foreground for invalid colours', () => {
    expect(getSurfaceContrast('not-a-colour').foreground).toBe('#000000');
  });
});
