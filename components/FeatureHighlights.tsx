"use client"

import { useTranslations } from 'next-intl';
import {
  Users,
  Star,
  Clock,
  CheckCircle,
  Smartphone,
  TrendingUp,
  Search
} from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  benefitsKey: string;
}

export default function FeatureHighlights() {
  const t = useTranslations('Home');

  const features: Feature[] = [
    {
      icon: <Users className="w-8 h-8" />,
      titleKey: "features.creativeDirectory.title",
      descriptionKey: "features.creativeDirectory.description",
      benefitsKey: "features.creativeDirectory.benefits"
    },
    {
      icon: <Search className="w-8 h-8" />,
      titleKey: "features.advancedSearch.title",
      descriptionKey: "features.advancedSearch.description",
      benefitsKey: "features.advancedSearch.benefits"
    },
    {
      icon: <Star className="w-8 h-8" />,
      titleKey: "features.talentProfiles.title",
      descriptionKey: "features.talentProfiles.description",
      benefitsKey: "features.talentProfiles.benefits"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      titleKey: "features.mobileOptimized.title",
      descriptionKey: "features.mobileOptimized.description",
      benefitsKey: "features.mobileOptimized.benefits"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      titleKey: "features.growingCommunity.title",
      descriptionKey: "features.growingCommunity.description",
      benefitsKey: "features.growingCommunity.benefits"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      titleKey: "features.alwaysAvailable.title",
      descriptionKey: "features.alwaysAvailable.description",
      benefitsKey: "features.alwaysAvailable.benefits"
    }
  ];
  return (
    <div className="py-24 bg-gradient-to-br from-primary-blue/3 via-transparent to-primary-red/3 dark:from-primary-blue/5 dark:via-transparent dark:to-primary-red/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {t('whyChooseTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red">{t('whyChooseSubtitle')}</span>?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('whyChooseDescription')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-2"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-blue/20 to-primary-red/20 dark:from-primary-blue/30 dark:to-primary-red/30 rounded-2xl mb-6 text-primary-blue dark:text-accent-red group-hover:from-primary-blue/30 group-hover:to-primary-red/30 dark:group-hover:from-primary-blue/40 dark:group-hover:to-primary-red/40 transition-all duration-300">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-blue dark:group-hover:text-accent-red transition-colors">
                {t(feature.titleKey)}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {t(feature.descriptionKey)}
              </p>

              {/* Benefits List */}
              <ul className="space-y-2">
                {(t.raw(feature.benefitsKey) as string[]).map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="bg-gradient-to-r from-primary-blue/10 to-primary-red/10 dark:from-primary-blue/20 dark:to-primary-red/20 rounded-3xl p-8 md:p-12 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {t('readyToConnectTitle')}
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {t('readyToConnectDescription')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red hover:from-primary-blueHover hover:to-primary-blue dark:hover:from-primary-red dark:hover:to-accent-red text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105">
                {t('joinNow')}
              </button>
              <button className="border-2 border-primary-blue/50 dark:border-accent-red/50 hover:border-primary-blue dark:hover:border-accent-red text-gray-800 dark:text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 hover:bg-primary-blue/10 dark:hover:bg-accent-red/10">
                {t('learnMore')}
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Smartphone className="w-5 h-5 text-primary-blue dark:text-accent-red mr-2" />
                <span className="font-medium">{t('mobileOptimized')}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Clock className="w-5 h-5 text-green-500 mr-2" />
                <span className="font-medium">{t('support247')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}