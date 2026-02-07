'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  Mail, 
  FileText, 
  Phone,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: HelpCircle,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600 dark:text-blue-400',
      questions: [
        { q: 'How do I create an account?', a: 'Click on Sign Up in the top right corner and follow the registration steps.' },
        { q: 'How do I complete my profile?', a: 'Go to Dashboard > Edit Profile and fill in all required fields including bio, location, skills, and portfolio items.' },
        { q: 'What are the different account types?', a: 'We offer Talent accounts for professionals showcasing their work.' },
      ]
    },
    {
      title: 'Profile & Portfolio',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600 dark:text-purple-400',
      questions: [
        { q: 'How do I add videos to my portfolio?', a: 'Go to Dashboard > Portfolio and click "Upload Video" to add your work samples.' },
        { q: 'Can I customize my profile visibility?', a: 'Yes, go to Settings > Privacy to control who can see your profile and contact information.' },
        { q: 'How do I get more profile views?', a: 'Complete your profile 100%, add high-quality portfolio items, and engage with the community.' },
      ]
    },
    {
      title: 'Analytics & Performance',
      icon: MessageSquare,
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-600 dark:text-green-400',
      questions: [
        { q: 'How do I view my analytics?', a: 'Visit Dashboard > Analytics to see detailed statistics about profile views, engagement, and performance.' },
        { q: 'What do the trend indicators mean?', a: 'Trend indicators show percentage changes compared to the previous 30-day period.' },
        { q: 'How often are analytics updated?', a: 'Analytics are updated in real-time and trends are calculated daily.' },
      ]
    },
    {
      title: 'Account & Settings',
      icon: Mail,
      color: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-500/10',
      iconColor: 'text-pink-600 dark:text-pink-400',
      questions: [
        { q: 'How do I change my password?', a: 'Go to Settings > Account and click "Change Password".' },
        { q: 'How do I delete my account?', a: 'Go to Settings > Account and scroll to "Delete Account". This action cannot be undone.' },
        { q: 'Can I change my email address?', a: 'Yes, go to Settings > Account to update your email. You\'ll need to verify the new email.' },
      ]
    },
  ];

  const contactOptions = [
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: 'Start Chat',
      color: 'blue',
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@3yeses.com',
      action: 'Send Email',
      color: 'purple',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: '+1 (555) 123-4567',
      action: 'Call Now',
      color: 'green',
    },
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      searchQuery === '' || 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            How can we help you?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Search our knowledge base or get in touch with our support team
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactOptions.map((option) => (
            <div
              key={option.title}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 bg-${option.color}-500/10 rounded-xl mb-4`}>
                <option.icon className={`w-6 h-6 text-${option.color}-600 dark:text-${option.color}-400`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {option.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {option.description}
              </p>
              <button className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium">
                {option.action}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>

          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No results found for "{searchQuery}"
              </p>
            </div>
          ) : (
            filteredFAQs.map((category) => (
              <div
                key={category.title}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${category.color} p-6`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-xl p-2">
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {category.title}
                    </h3>
                  </div>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {category.questions.map((item, idx) => (
                    <details
                      key={idx}
                      className="group"
                    >
                      <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                          {item.q}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="px-6 pb-6 text-gray-600 dark:text-gray-400">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Additional Resources */}
        <div className="mt-12 bg-gradient-to-r from-primary-blue via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still need help?
          </h2>
          <p className="text-blue-100 text-lg mb-6">
            Our support team is here to assist you with any questions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-all">
              Contact Support
            </button>
            <button className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-all flex items-center justify-center gap-2">
              View Documentation
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
