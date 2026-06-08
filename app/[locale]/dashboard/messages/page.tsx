'use client';

import { useState } from 'react';
import { Send, Search } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function MessagesPage() {
  const t = useTranslations('DashboardMessagesPage');
  const [selectedMessage, setSelectedMessage] = useState(0);
  
  const messages = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: t('sample.castingDirector'),
      lastMessage: t('sample.message1'),
      time: t('sample.time2h'),
      unread: true,
      avatar: 'SC'
    },
    {
      id: 2,
      name: 'Mike Rodriguez',
      role: t('sample.director'),
      lastMessage: t('sample.message2'),
      time: t('sample.time1d'),
      unread: false,
      avatar: 'MR'
    },
    {
      id: 3,
      name: 'Emma Thompson',
      role: t('sample.producer'),
      lastMessage: t('sample.message3'),
      time: t('sample.time2d'),
      unread: false,
      avatar: 'ET'
    }
  ];

  const currentConversation = [
    {
      sender: 'Sarah Chen',
      message: t('sample.message4'),
      time: '2:30 PM',
      isMe: false
    },
    {
      sender: t('labels.you'),
      message: t('sample.message5'),
      time: '2:35 PM',
      isMe: true
    },
    {
      sender: 'Sarah Chen',
      message: t('sample.message6'),
      time: '2:40 PM',
      isMe: false
    }
  ];

  return (
    <div className="min-h-screen bg-light-surface dark:bg-dark-surface">
      {/* Header */}
      <header className="bg-light-surface dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-blue dark:bg-accent-red flex items-center justify-center">
              <span className="text-white font-bold text-sm">3Y</span>
            </div>
            <span className="text-xl font-bold text-primary-blue dark:text-accent-red">3YESES</span>
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Messages List */}
        <div className="w-1/3 bg-light-surface dark:bg-dark-surface border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('title')}</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={message.id}
              onClick={() => setSelectedMessage(index)}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                selectedMessage === index ? 'bg-blue-50 dark:bg-red-900/20' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary-blue dark:bg-accent-red rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{message.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {message.name}
                    </p>
                    <p className="text-xs text-gray-500">{message.time}</p>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{message.role}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {message.lastMessage}
                  </p>
                  {message.unread && (
                    <div className="w-2 h-2 bg-primary-blue dark:bg-accent-red rounded-full mt-1"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 bg-light-surface dark:bg-dark-surface border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-blue dark:bg-accent-red rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{messages[selectedMessage].avatar}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {messages[selectedMessage].name}
              </h2>
              <p className="text-sm text-gray-500">{messages[selectedMessage].role}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentConversation.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.isMe
                    ? 'bg-primary-blue text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs mt-1 ${msg.isMe ? 'text-red-100' : 'text-gray-500'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-light-surface dark:bg-dark-surface border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder={t('messagePlaceholder')}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <button aria-label={t('send')} className="p-2 bg-primary-blue dark:bg-accent-red text-white rounded-lg hover:bg-primary-blueHover dark:hover:bg-accent-red/80 transition-colors">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
