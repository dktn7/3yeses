# Hero Slideshow — AI Image Generation Prompts

These prompts are ready to paste into **DALL-E 3** (via ChatGPT or the API), **Midjourney**, or **Adobe Firefly**.  
Target dimensions: **1200 × 1200 px** (square) or **1200 × 1067 px** (16:14 ratio).  
Save files as `slide-01-actor.jpg`, `slide-02-music.jpg`, `slide-03-model.jpg`, `slide-04-dance.jpg` and drop them into `/public/images/hero-slideshow/`. Then remove `unoptimized` from the `<Image>` component in `HeroSlideshow.tsx`.

---

## Slide 01 — Acting & Performance

### DALL-E 3 / Adobe Firefly
```
Cinematic portrait photograph of a professional stage actor in their mid-30s, confident expression, dramatic theatrical lighting with deep shadows and a single warm spotlight. Dark moody background. They are dressed in a smart casual outfit suggesting a rehearsal setting — not a costume. The subject's gaze is directly into camera with intensity. Shot on 50mm lens. Clean bokeh background. Genuine, unposed feeling. No text. No props except natural gesture. No celebrity likeness. Photorealistic.
```

### Midjourney
```
/imagine cinematic portrait of a confident professional actor, dramatic theatrical spotlight lighting, dark stage background, 50mm lens, moody editorial photography, photorealistic, diverse subject mid 30s, direct gaze, smart casual --ar 1:1 --style raw --v 6
```

---

## Slide 02 — Music & Audio

### DALL-E 3 / Adobe Firefly
```
Cinematic close-up portrait photograph of a professional musician, mid-20s, in an intimate live-performance moment. Atmospheric stage lighting with coloured background lights — deep blues and purples. They are holding or playing a contemporary instrument (guitar, keyboard, microphone). Genuine emotion, eyes slightly closed or looking away as if lost in the music. Shallow depth of field. No text overlays. Photorealistic. No celebrity likeness.
```

### Midjourney
```
/imagine cinematic portrait of a professional musician mid 20s performing live, atmospheric stage lighting purple and blue tones, emotional candid moment, shallow depth of field, editorial photography, photorealistic, diverse subject --ar 1:1 --style raw --v 6
```

---

## Slide 03 — Modeling

### DALL-E 3 / Adobe Firefly
```
High-end editorial fashion photograph of a professional model. Clean studio setup with a dark neutral background — charcoal or deep grey. The subject is in their late 20s, wearing stylish contemporary clothing. The mood is confident and poised yet natural. Dramatic split lighting from the side, creating strong contrast and definition. Shot on 85mm lens with beautiful bokeh. No text. No props. Photorealistic. No celebrity likeness.
```

### Midjourney
```
/imagine high-end editorial fashion portrait, professional model late 20s, dark charcoal studio background, dramatic split side lighting, 85mm lens bokeh, confident and poised, editorial photography, photorealistic, diverse subject --ar 1:1 --style raw --v 6
```

---

## Slide 04 — Dancing & Choreography

### DALL-E 3 / Adobe Firefly
```
Cinematic action photograph of a professional contemporary dancer mid-movement, captured in a dramatic pose. The body is fully extended in an arabesque or leap. The background is dark and minimal — a simple dark grey studio. Spotlights from above create strong highlights and deep shadows on the dancer's figure. The movement should feel powerful and graceful. Shot at 1/500s to freeze motion sharply. No text. Photorealistic. No celebrity likeness. Diverse subject in their mid-20s.
```

### Midjourney
```
/imagine cinematic action portrait of a professional contemporary dancer in dramatic arabesque mid-movement, dark studio with overhead spotlights, powerful and graceful, frozen motion, editorial dance photography, photorealistic, diverse subject mid 20s --ar 1:1 --style raw --v 6
```

---

## Style notes (consistent across all 4)

- **Diversity**: make sure the four images show different ethnicities and genders to represent the breadth of the platform's global user base.
- **Lighting**: keep all images dark-background with spot/dramatic studio lighting so they look cohesive as a slideshow set.
- **No text, watermarks, or frames** in the generated images — these are added by the UI.
- **Post-processing**: slight desaturation (−10 to −20%) and a very subtle vignette will help images blend with the platform's dark aesthetic.

## Integration steps (after generation)

1. Place files in `/public/images/hero-slideshow/`:
   ```
   slide-01-actor.jpg
   slide-02-music.jpg
   slide-03-model.jpg
   slide-04-dance.jpg
   ```
2. In `components/HeroSlideshow.tsx`, update the `src` in each slide object and **remove** the `unoptimized` prop (it was only needed for SVGs).
3. Restart the dev server — Next.js Image optimization will handle WebP conversion automatically.
