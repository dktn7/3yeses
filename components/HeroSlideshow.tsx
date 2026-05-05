'use client'

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'

interface Slide {
  src: string
  alt: string
  category: string
  description: string
}

const slides: Slide[] = [
  {
    src: '/images/hero-slideshow/image 1.png',
    alt: 'Your talent. Your stage. Your opportunity. — 3YESES talent platform',
    category: 'Talent Platform',
    description: 'Your talent. Your stage. Your opportunity.',
  },
  {
    src: '/images/hero-slideshow/image 4.png',
    alt: 'Acting & Performance — showcase your talent to casting directors worldwide',
    category: 'Acting & Performance',
    description: 'Showcase your talent on the world stage',
  },
  {
    src: '/images/hero-slideshow/image 3.png',
    alt: 'Music & Audio — connect with producers, labels and collaborators',
    category: 'Music & Audio',
    description: 'Connect with opportunities worldwide',
  },
  {
    src: '/images/hero-slideshow/image 2.png',
    alt: 'Dancing & Choreography — be seen, be heard, be discovered',
    category: 'Dancing & Choreography',
    description: 'Be seen. Be heard. Be discovered.',
  },
]

const HeroSlideshow = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      skipSnaps: false,
      dragFree: false,
    },
    [Autoplay({ delay: 4500, stopOnInteraction: true })]
  )

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  return (
    <div className="group relative w-full h-full">
      {/* Main carousel container */}
      <div className="embla overflow-hidden rounded-3xl shadow-2xl" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="embla__slide flex-[0_0_100%] relative min-w-0"
            >
              <div className="relative w-full aspect-[4/4] md:aspect-[16/14]">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover rounded-3xl"
                  priority={index === 0}
                  quality={80}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Category label overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-10 rounded-b-3xl pointer-events-none"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)' }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white mb-0.5">
                    {slide.category}
                  </p>
                  <p className="text-xs text-white/75 leading-snug">
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => scrollTo(index)}
            className={`rounded-full transition-all duration-300 ${
              selectedIndex === index
                ? 'w-6 h-2 bg-light-surface shadow-lg'
                : 'w-2 h-2 bg-white/45 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}: ${slides[index].category}`}
          />
        ))}
      </div>

      {/* Navigation arrows — visible on hover */}
      <button
        type="button"
        onClick={scrollPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/55 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        aria-label="Previous slide"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        type="button"
        onClick={scrollNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/55 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

export default HeroSlideshow