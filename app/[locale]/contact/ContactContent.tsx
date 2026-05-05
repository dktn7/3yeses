'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Send, User, Mail, MessageSquare, Phone, MapPin, Clock } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const pathname = usePathname();
    const t = useTranslations('Navigation');
    const tFooter = useTranslations('Footer');

    // Get current locale from pathname, validating against allowed locales
    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    const validLocales = ['en-gb', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-PT', 'ru-RU', 'ja-JP', 'zh-CN', 'ar'];
    const firstSegment = pathSegments[0] || 'en-gb';
    const locale = validLocales.includes(firstSegment) ? firstSegment : 'en-gb';

    const breadcrumbItems = [
        { label: t('home'), href: `/${locale}` },
        { label: t('contact') }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen brand-true-red">
            <div className="py-8 px-4 md:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <Breadcrumbs items={breadcrumbItems} />
                    
                    {/* Hero Section */}
                    <div className="text-center mt-8 mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                            Get in <span className="text-primary-blue dark:text-accent-red">Touch</span>
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Have questions about 3YESES? We&apos;re here to help you connect with opportunities and talent.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        {/* Contact Information Cards */}
                        <div className="bg-white/80 dark:bg-[rgba(15,23,42,0.88)] backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-transparent dark:border-red-400/20">
                            <div className="flex items-center justify-center w-12 h-12 bg-primary-blue/10 dark:bg-accent-red/10 rounded-lg mb-4">
                                <Mail className="h-6 w-6 text-primary-blue dark:text-accent-red" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Us</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">For general inquiries</p>
                            <a href={`mailto:${tFooter('email')}`} className="text-primary-blue dark:text-accent-red hover:underline font-medium">
                                {tFooter('email')}
                            </a>
                        </div>

                        <div className="bg-white/80 dark:bg-[rgba(15,23,42,0.88)] backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-transparent dark:border-red-400/20">
                            <div className="flex items-center justify-center w-12 h-12 bg-primary-blue/10 dark:bg-accent-red/10 rounded-lg mb-4">
                                <Phone className="h-6 w-6 text-primary-blue dark:text-accent-red" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Call Us</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">Mon-Fri 9am-6pm GMT</p>
                            <a href={`tel:${tFooter('phone')}`} className="text-primary-blue dark:text-accent-red hover:underline font-medium">
                                {tFooter('phone')}
                            </a>
                        </div>

                        <div className="bg-white/80 dark:bg-[rgba(15,23,42,0.88)] backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-transparent dark:border-red-400/20">
                            <div className="flex items-center justify-center w-12 h-12 bg-primary-blue/10 dark:bg-accent-red/10 rounded-lg mb-4">
                                <MapPin className="h-6 w-6 text-primary-blue dark:text-accent-red" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Visit Us</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">Our Office Location</p>
                            <p className="text-primary-blue dark:text-accent-red font-medium">
                                {tFooter('location')}
                            </p>
                        </div>
                    </div>

                    {/* Main Contact Form Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Contact Form */}
                        <div className="bg-white/80 dark:bg-[rgba(15,23,42,0.88)] backdrop-blur-sm rounded-xl shadow-lg p-8 lg:p-10 border border-transparent dark:border-red-400/20">
                            {submitted ? (
                                <div className="text-center py-12 animate-fade-in">
                                    <div className="flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                                        Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSubmitted(false);
                                            setFormData({ name: '', email: '', subject: '', message: '' });
                                        }}
                                        className="text-primary-blue dark:text-accent-red hover:underline font-medium"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Send us a Message</h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                                        Fill out the form below and we&apos;ll respond as soon as possible.
                                    </p>
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red focus:border-transparent transition-all"
                                                    placeholder="John Doe"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red focus:border-transparent transition-all"
                                                    placeholder="john@example.com"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Subject <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red focus:border-transparent transition-all"
                                                placeholder="How can we help you?"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Message <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <MessageSquare className="absolute left-3 top-4 text-gray-400" size={20} />
                                                <textarea
                                                    id="message"
                                                    name="message"
                                                    rows={6}
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red focus:border-transparent transition-all resize-none"
                                                    placeholder="Tell us more about your inquiry..."
                                                    required
                                                ></textarea>
                                            </div>
                                        </div>
                                        
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-blue to-accent-red text-white py-3 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={20} />
                                                    Send Message
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-6">
                            {/* FAQ Section */}
                            <div className="bg-white/80 dark:bg-[rgba(15,23,42,0.88)] backdrop-blur-sm rounded-xl shadow-lg p-8 border border-transparent dark:border-red-400/20">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What is 3YESES?</h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                                            3YESES is a premier platform connecting creative talent with opportunities in the entertainment industry.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">How do I sign up?</h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                                            Click the &quot;Sign Up&quot; button in the top right corner and follow the simple 3-step process.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Is it free to join?</h4>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                                            Yes! Basic profiles are completely free. We also offer premium features for enhanced visibility.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Business Hours */}
                            <div className="bg-gradient-to-br from-primary-blue to-accent-red rounded-xl shadow-lg p-8 text-white">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="h-6 w-6" />
                                    <h3 className="text-xl font-bold">Business Hours</h3>
                                </div>
                                <div className="space-y-2 text-white/90">
                                    <div className="flex justify-between">
                                        <span>Monday - Friday</span>
                                        <span className="font-semibold">9:00 AM - 6:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Saturday</span>
                                        <span className="font-semibold">10:00 AM - 4:00 PM</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sunday</span>
                                        <span className="font-semibold">Closed</span>
                                    </div>
                                    <p className="text-sm mt-4 pt-4 border-t border-white/20">
                                        All times are in Greenwich Mean Time (GMT)
                                    </p>
                                </div>
                            </div>

                            {/* Support Notice */}
                            <div className="bg-blue-50 dark:bg-[rgba(15,23,42,0.94)] border border-blue-200 dark:border-red-400/30 rounded-xl p-6">
                                <p className="text-sm text-blue-900 dark:text-slate-50">
                                    <strong>Need urgent help?</strong> If you&apos;re experiencing technical issues, please include your account email and a detailed description of the problem.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
