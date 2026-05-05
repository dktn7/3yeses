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
    <div className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-light-surface dark:bg-dark-surface border border-gray-200/60 dark:border-white/10 shadow-lg backdrop-blur-sm p-8 md:p-12">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t('whyChooseTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red">{t('whyChooseSubtitle')}</span>?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('whyChooseDescription')}
            </p>
          </div>

          <div className="space-y-5 mb-14">
            {features.map((feature, index) => (
                <div
                key={index}
                className="group rounded-[1.5rem] border border-gray-200/70 dark:border-white/10 bg-light-surface dark:bg-dark-surface p-6 md:p-7 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-5 md:gap-6">
                  <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-blue/12 to-primary-red/12 dark:from-accent-red/18 dark:to-primary-red/24 rounded-2xl text-primary-blue dark:text-accent-red shrink-0">
                    {feature.icon}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {t(feature.titleKey)}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-5 leading-relaxed max-w-2xl">
                      {t(feature.descriptionKey)}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {(t.raw(feature.benefitsKey) as string[]).map((benefit, benefitIndex) => (
                        <span key={benefitIndex} className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-light-surface dark:bg-dark-surface px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-primary-blue/8 to-primary-red/8 dark:from-accent-red/12 dark:to-primary-red/16 rounded-[1.75rem] p-8 md:p-12 text-center border border-primary-blue/15 dark:border-red-400/20">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t('readyToConnectTitle')}
              </h3>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                {t('readyToConnectDescription')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-primary-blue/20 dark:shadow-accent-red/20 hover:opacity-90">
                  {t('joinNow')}
                </button>
                <button className="border border-primary-blue/30 dark:border-accent-red/30 text-gray-800 dark:text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 hover:bg-primary-blue/10 dark:hover:bg-accent-red/10 bg-white/60 dark:bg-white/[0.04]">
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
    </div>
  );
}