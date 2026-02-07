"use client"
"use client"

import VideoPlayer from './VideoPlayer'
import React from 'react'

type Props = {
  url?: string
  className?: string
}

export default function VideoHero({ url = '/welcome.mp4', className = '' }: Props) {
  // Simple responsive hero wrapper. Uses an aspect-ratio container and max width.
  return (
    <div className={`w-full max-w-4xl mx-auto mb-8 ${className}`}>
      <div className="rounded-2xl overflow-hidden shadow-2xl bg-black">
        <VideoPlayer url={url} className="w-full h-full" />
      </div>
    </div>
  )
}
