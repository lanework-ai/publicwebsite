'use client'

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useHoneypot } from '@/lib/hooks/useHoneypot';
import { useApiRequest } from '@/lib/hooks/useApiRequest';

interface NewsletterData {
    email: string;
    _honeypot: string;
}

export default function NewsLetterComponent() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [email, setEmail] = useState('');
    const { honeypotField, isBot, reset: resetHoneypot } = useHoneypot();
    const [validationError, setValidationError] = useState('');

    const { isLoading, isSuccess, error: apiError, execute, reset: resetApi } = useApiRequest<NewsletterData>({
        onSuccess: () => {
            // Reset form after 4 seconds
            setTimeout(() => {
                setEmail('');
                resetHoneypot();
                setValidationError('');
                resetApi();
            }, 4000);
        },
    });

    const validateEmail = (email: string): boolean => {
        if (!email.trim()) {
            setValidationError('Email is required');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setValidationError('Please enter a valid email address');
            return false;
        }
        setValidationError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check honeypot
        if (isBot) {
            return;
        }

        // Validate email
        if (!validateEmail(email)) {
            return;
        }

        // Execute API request
        await execute('/api/newsletter', {
            email: email.trim(),
            _honeypot: honeypotField.value,
        });
    };

    return (
        <section className="py-16 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="glass-effect rounded-2xl p-8 sm:p-12 text-center border-2 border-primary/30"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
                        <span className="gradient-text">Stay Updated</span>
                    </h2>
                    <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed">
                        Get the latest insights on relay operations and freight innovation
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                        {/* Honeypot field - hidden from users but visible to bots */}
                        <input
                            {...honeypotField.props}
                            value={honeypotField.value}
                            onChange={honeypotField.onChange}
                        />

                        <div className="flex-1">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setValidationError('');
                                }}
                                onBlur={() => email && validateEmail(email)}
                                placeholder="Enter your email"
                                disabled={isLoading || isSuccess}
                                className={`w-full px-4 py-3 rounded-lg bg-white/5 border text-white placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                            validationError || apiError
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-white/10 focus:border-primary'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                            />
                            {(validationError || apiError) && (
                                <p className="text-red-400 text-sm mt-2 text-left">{validationError || apiError}</p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || isSuccess || !email}
                            className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg
                               transition-all duration-300 transform hover:scale-105 glow-effect disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isSuccess ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                    Subscribed!
                                </span>
                            ) : isLoading ? (
                                'Subscribing...'
                            ) : (
                                'Subscribe'
                            )}
                        </button>
                    </form>
                    {isSuccess && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-green-400 text-sm mt-4 font-medium"
                        >
                            Thank you for subscribing! Check your inbox for confirmation.
                        </motion.p>
                    )}
                    {!isSuccess && (
                        <p className="text-sm text-gray-500 mt-4">
                            We respect your privacy. Unsubscribe at any time.
                        </p>
                    )}
                </motion.div>
            </div>
        </section>
    )
}
