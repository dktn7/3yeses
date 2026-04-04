"use client"
import { use } from 'react'
import LandingPage from './LandingPage'

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  return (
    <LandingPage locale={locale} />
  )
}