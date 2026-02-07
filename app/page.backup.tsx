'use client';

export const dynamic = 'force-dynamic';

import React from "react";
import LandingClient from '@/components/LandingClient';
import { useTranslations } from 'next-intl';

// Landing Page Component
export default function LandingPage() {
  const t = useTranslations('Home');
  
  return <LandingClient t={t} />;
}