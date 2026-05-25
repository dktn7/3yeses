'use client'

import type { CSSProperties } from 'react'

type MarketingWaveVariant = 'hero' | 'subtle' | 'focus'
type MarketingWaveIntensity = 'low' | 'medium' | 'high'

type MarketingWaveBackgroundProps = {
  variant?: MarketingWaveVariant
  intensity?: MarketingWaveIntensity
  allowOverlay?: boolean
  className?: string
}

const INTENSITY_MAP: Record<MarketingWaveIntensity, string> = {
  low: '0.72',
  medium: '0.9',
  high: '1',
}

export default function MarketingWaveBackground({
  variant = 'hero',
  intensity = 'medium',
  allowOverlay = true,
  className = '',
}: MarketingWaveBackgroundProps) {
  const style = {
    '--marketing-wave-intensity': INTENSITY_MAP[intensity],
  } as CSSProperties

  const baseClassName = `marketing-wave-bg marketing-wave-bg--${variant}${className ? ` ${className}` : ''}`

  return (
    <div className={baseClassName} style={style} aria-hidden="true">
      <div className="marketing-wave-layer marketing-wave-canvas" />
      <div className="marketing-wave-layer marketing-wave-edge-wash" />
      <div className="marketing-wave-layer marketing-wave-glow-top" />
      <div className="marketing-wave-layer marketing-wave-wave-high" />
      <div className="marketing-wave-layer marketing-wave-wave-mid" />
      <div className="marketing-wave-layer marketing-wave-wave-low" />
      <div className="marketing-wave-layer marketing-wave-veil" />
      {allowOverlay ? <div className="marketing-wave-layer marketing-wave-glass-wash" /> : null}
    </div>
  )
}
