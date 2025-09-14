'use client';

import { useState } from 'react';
import { Send, User, Mail, MessageSquare } from 'lucide-react';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would send this data to your backend
        console.log('Form submitted:', formData);
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <main className="p-6 md:p-10 flex items-center justify-center">
                <div className="w-full max-w-2xl">
                    {submitted ? (
                        <div className="bg-white dark:bg-gray-800 p-12 rounded-xl shadow-lg text-center animate-fade-in">
                            <h1 className="text-3xl font-bold text-primary-blue dark:text-accent-red mb-4">Thank You!</h1>
                            <p className="text-gray-600 dark:text-gray-300">Your message has been sent. We&apos;ll get back to you shortly.</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-xl shadow-lg">
                            <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">Contact Us</h1>
                            <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Have a question? We&apos;d love to hear from you.</p>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-blue"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-blue"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-3 top-4 -translate-y-1/2 text-gray-400" size={20} />
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={5}
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-blue"
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-primary-blue text-white py-3 rounded-lg hover:bg-primary-blueHover dark:bg-accent-red dark:hover:bg-accent-red/80 transition-colors"
                                >
                                    <Send size={20} />
                                    Send Message
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
