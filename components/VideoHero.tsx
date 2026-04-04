'use client'

import React, { useRef, useEffect, useState } from 'react'

type Props = {
  /** Path to the video file, e.g. "/videos/Welcome.mp4" */
  url?: string
  /** Optional CSS class applied to the outermost wrapper */
  className?: string
  /** If true the video loops continuously; otherwise plays once and stops */
  loop?: boolean
}

/**
 * Full-bleed background video for the homepage hero.
 * – Autoplays muted (unless `prefers-reduced-motion: reduce`)
 * – Covers the entire parent container (use inside a `relative` wrapper)
 * – Falls back to a static poster colour when motion is reduced
 */
export default function VideoHero({ url = '/videos/Welcome.mp4', className = '', loop = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Autoplay once the element mounts (only when motion is allowed)
  useEffect(() => {
    if (!reducedMotion && videoRef.current) {
      videoRef.current.play().catch(() => {/* browser blocked autoplay – fine */})
    }
  }, [reducedMotion])

  if (reducedMotion) {
    // Render a solid branded fill instead of a moving video
    return (
      <div
        className={`absolute inset-0 bg-[var(--landing-bg)] ${className}`}
        aria-hidden="true"
      />
    )
  }

  return (
    <video
      ref={videoRef}
      src={url}
      muted
      playsInline
      loop={loop}
      preload="metadata"
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full object-cover ${className}`}
    />
  )
}
