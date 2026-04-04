'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Users, TrendingUp, Award, Target, Heart, Zap } from 'lucide-react';
import Image from 'next/image';

interface StatCardProps {
  icon: React.ElementType;
  number: string;
  label: string;
  description: string;
}

function StatCard({ icon: Icon, number, label, description }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
      <Icon className="h-12 w-12 text-primary-blue dark:text-accent-red mx-auto mb-4" />
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{number}</div>
      <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
    </div>
  );
}

interface TimelineItemProps {
  year: string;
  title: string;
  description: string;
}

function TimelineItem({ year, title, description }: TimelineItemProps) {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <div className="w-4 h-4 bg-primary-blue dark:bg-accent-red rounded-full mt-2"></div>
      </div>
      <div className="flex-1 pb-8">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg font-bold text-primary-blue dark:text-accent-red">{year}</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const t = useTranslations('About');
  const [stats, setStats] = useState({
    talents: '0',
    clients: '0',
    bookings: '0',
    categories: '0'
  });

  useEffect(() => {
    // Simulate fetching live stats
    const fetchStats = async () => {
      // In a real implementation, this would fetch from your API
      setStats({
        talents: '2,500+',
        clients: '1,200+',
        bookings: '8,900+',
        categories: '25+'
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-blue/10 to-accent-red/10 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-6">
          {/* Breadcrumb Navigation */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a href="/" className="hover:text-blue-600 dark:hover:text-red-500 transition-colors">
                  Home
                </a>
              </li>
              <li className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">About Us</span>
              </li>
            </ol>
          </nav>

          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t('hero.title.part1')}{' '}
              <span className="text-primary-blue dark:text-accent-red">{t('hero.title.talent')}</span>{' '}
              {t('hero.title.part2')}{' '}
              <span className="text-accent-red dark:text-primary-blue">
                {t('hero.title.opportunity')}
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              {t('hero.description')}
            </p>
            <div className="flex justify-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Users className="h-5 w-5" />
                <span>{t('hero.trusted')}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Award className="h-5 w-5" />
                <span>{t('hero.leading')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {t('stats.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard
              icon={Users}
              number={stats.talents}
              label={t('stats.talents.label')}
              description={t('stats.talents.description')}
            />
            <StatCard
              icon={Users}
              number={stats.clients}
              label={t('stats.clients.label')}
              description={t('stats.clients.description')}
            />
            <StatCard
              icon={TrendingUp}
              number={stats.bookings}
              label={t('stats.bookings.label')}
              description={t('stats.bookings.description')}
            />
            <StatCard
              icon={Target}
              number={stats.categories}
              label={t('stats.categories.label')}
              description={t('stats.categories.description')}
            />
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              {t('story.title')}
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300">
              <p className="text-lg leading-relaxed mb-6">{t('story.p1')}</p>
              <p className="text-lg leading-relaxed mb-6">{t('story.p2')}</p>
              <p className="text-lg leading-relaxed">{t('story.p3')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {t('journey.title')}
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary-blue dark:bg-accent-red"></div>
              <TimelineItem
                year="2023"
                title={t('journey.2023.title')}
                description={t('journey.2023.description')}
              />
              <TimelineItem
                year="2024"
                title={t('journey.2024.title1')}
                description={t('journey.2024.description1')}
              />
              <TimelineItem
                year="2024"
                title={t('journey.2024.title2')}
                description={t('journey.2024.description2')}
              />
              <TimelineItem
                year="2025"
                title={t('journey.2025.title')}
                description={t('journey.2025.description')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center mb-6">
                <Target className="h-8 w-8 text-primary-blue dark:text-accent-red mr-3" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('mission.title')}
                </h3>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('mission.description')}
              </p>
            </div>
            <div>
              <div className="flex items-center mb-6">
                <Zap className="h-8 w-8 text-primary-blue dark:text-accent-red mr-3" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('vision.title')}
                </h3>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('vision.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {t('values.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-blue/10 dark:bg-accent-red/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-10 w-10 text-primary-blue dark:text-accent-red" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('values.inclusivity.title')}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {t('values.inclusivity.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-blue/10 dark:bg-accent-red/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Target className="h-10 w-10 text-primary-blue dark:text-accent-red" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('values.excellence.title')}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {t('values.excellence.description')}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-blue/10 dark:bg-accent-red/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-primary-blue dark:text-accent-red" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t('values.community.title')}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {t('values.community.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-blue to-accent-red">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">{t('cta.title')}</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">{t('cta.description')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/signup"
              className="bg-white text-primary-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {t('cta.joinAsTalent')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}