"use client"
import LandingPage from './LandingPage'

export default function HomePage({ params }: { params: { locale: string } }) {
  return (
    <LandingPage locale={params.locale} />
  )
}