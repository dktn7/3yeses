"use client"

import React from 'react'
import { createPortal } from 'react-dom'

interface Props {
  children: React.ReactNode
  className?: string
  portal?: boolean
  anchorRef?: React.RefObject<HTMLElement | null>
  matchWidth?: boolean
  maxHeight?: string
  role?: string
}

export default function DropdownPanel({
  children,
  className = '',
  portal = false,
  anchorRef,
  matchWidth = false,
  maxHeight = '60vh',
  role = 'listbox',
}: Props) {
  const [mounted, setMounted] = React.useState(false)
  const [pos, setPos] = React.useState<{ left: number; top: number; width?: number } | null>(null)

  const rafRef = React.useRef<number | null>(null)
  const needsUpdateRef = React.useRef(false)
  const lastPosRef = React.useRef<{ left: number; top: number; width?: number } | null>(null)
  const panelRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Synchronously compute initial position before first paint so the portal
  // never renders without absolute coordinates (prevents layout flash / "pop").
  React.useLayoutEffect(() => {
    if (!portal || typeof window === 'undefined') return
    const anchor = anchorRef?.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const initial = { left: rect.left + window.scrollX, top: rect.bottom + window.scrollY, width: rect.width }
    lastPosRef.current = initial
    setPos(initial)
  }, [portal, anchorRef])

  // Compute bounding rect and update state only when changed. Use RAF to batch updates.
  const computePos = React.useCallback(() => {
    const anchor = anchorRef?.current
    if (!anchor) return null
    const rect = anchor.getBoundingClientRect()
    return { left: rect.left + window.scrollX, top: rect.bottom + window.scrollY, width: rect.width }
  }, [anchorRef])

  const applyIfChanged = React.useCallback((newPos: { left: number; top: number; width?: number } | null) => {
    const last = lastPosRef.current
    const changed =
      !last ||
      !newPos ||
      last.left !== newPos.left ||
      last.top !== newPos.top ||
      (matchWidth && last.width !== newPos.width)

    if (changed) {
      lastPosRef.current = newPos
      setPos(newPos)
    }
  }, [matchWidth])

  const tick = React.useCallback(() => {
    rafRef.current = null
    needsUpdateRef.current = false

    if (!portal) return

    const newPos = computePos()
    applyIfChanged(newPos)
  }, [portal, computePos, applyIfChanged])

  const scheduleUpdate = React.useCallback(() => {
    if (needsUpdateRef.current) return
    needsUpdateRef.current = true
    if (rafRef.current == null) {
      rafRef.current = window.requestAnimationFrame(() => {
        tick()
      })
    }
  }, [tick])

  React.useEffect(() => {
    if (!portal || typeof window === 'undefined') return

    // Initial position
    scheduleUpdate()

    const onScroll = () => scheduleUpdate()
    const onResize = () => scheduleUpdate()

    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)

    const anchor = anchorRef?.current
    let anchorRO: ResizeObserver | null = null
    if (anchor && typeof ResizeObserver !== 'undefined') {
      anchorRO = new ResizeObserver(() => scheduleUpdate())
      anchorRO.observe(anchor)
    }

    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
      if (anchorRO) anchorRO.disconnect()
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      needsUpdateRef.current = false
    }
  }, [portal, anchorRef, scheduleUpdate])

  const style: React.CSSProperties = {
    maxHeight,
    ...(pos && portal
      ? {
          position: 'absolute',
          left: Math.round(pos.left) + 'px',
          top: Math.round(pos.top) + 'px',
          minWidth: matchWidth && pos.width ? Math.round(pos.width) + 'px' : undefined,
        }
      : {}),
  }

  const base = (
    <div
      ref={panelRef}
      role={role}
      className={`dropdown-panel marketing-dropdown-panel marketing-surface ring-1 ring-[var(--marketing-border)] rounded-[1.5rem] shadow-[0_18px_48px_rgba(15,23,42,0.14)] dark:shadow-[0_18px_56px_rgba(0,0,0,0.58)] z-[70] overflow-y-auto ${className}`}
      style={style}
    >
      {children}
    </div>
  )

  // Don't render portal until position is known — prevents the element from
  // briefly appearing in flow (at body top-left) before the RAF fires.
  if (portal && mounted && typeof document !== 'undefined') {
    if (!pos) return null
    return createPortal(base, document.body)
  }

  return base
}
