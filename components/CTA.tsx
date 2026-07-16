'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useHoneypot } from '@/lib/hooks/useHoneypot';
import { useApiRequest } from '@/lib/hooks/useApiRequest';
import AnimatedIcon from '@/components/AnimatedIcon';
import { Clock, Truck, Users } from 'lucide-react';

const fleetSizeOptions = [
  { value: '100-250', label: '100-250 trucks' },
  { value: '250-500', label: '250-500 trucks' },
  { value: '500-1000', label: '500-1,000 trucks' },
  { value: '1000+', label: '1,000+ trucks' },
];

// Current calendar quarter label, e.g. "Q2 2026". Recomputed on each render so
// the urgency banner rolls over automatically at the start of each new quarter.
function currentQuarterLabel(date = new Date()): string {
  return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
}

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  fleetSize: string;
  message: string;
  _honeypot: string;
  formLoadedAt: number;
}

export default function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    fleetSize: '',
    message: '',
  });
  const { honeypotField, isBot, reset: resetHoneypot } = useHoneypot();
  const [formLoadedAt] = useState(() => Date.now());
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    company: '',
    fleetSize: '',
  });
  const { isLoading, isSuccess, error: apiError, execute, reset: resetApi } = useApiRequest<ContactFormData>({
    onSuccess: () => {
      // Reset form after 4 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          company: '',
          fleetSize: '',
          message: '',
        });
        resetHoneypot();
        setErrors({
          name: '',
          email: '',
          company: '',
          fleetSize: '',
        });
        resetApi();
      }, 4000);
    },
    onError: () => {
      // Clear error after 3 seconds
      setTimeout(() => {
        resetApi();
      }, 3000);
    },
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation for dropdown
  const handleDropdownKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsDropdownOpen(!isDropdownOpen);
        setSelectedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isDropdownOpen) {
          setIsDropdownOpen(true);
          setSelectedIndex(0);
        } else {
          setSelectedIndex(prev =>
            prev < fleetSizeOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isDropdownOpen) {
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        dropdownButtonRef.current?.focus();
        break;
      default:
        break;
    }
  };

  // Handle option selection with keyboard
  const handleOptionKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, value: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFormData({ ...formData, fleetSize: value });
      setIsDropdownOpen(false);
      if (errors.fleetSize) validateField('fleetSize', value);
      dropdownButtonRef.current?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsDropdownOpen(false);
      dropdownButtonRef.current?.focus();
    }
  };

  // Validation functions
  const validateName = (name: string): string => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(name)) return 'Name can only contain letters, spaces, hyphens and apostrophes';
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validateCompany = (company: string): string => {
    if (!company.trim()) return 'Company name is required';
    if (company.trim().length < 2) return 'Company name must be at least 2 characters';
    return '';
  };

  const validateFleetSize = (fleetSize: string): string => {
    if (!fleetSize) return 'Please select a fleet size';
    return '';
  };

  const validateField = (field: string, value: string) => {
    let error = '';
    switch (field) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'company':
        error = validateCompany(value);
        break;
      case 'fleetSize':
        error = validateFleetSize(value);
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBot) {
      return;
    }

    // Validate all fields
    const nameValid = validateField('name', formData.name);
    const emailValid = validateField('email', formData.email);
    const companyValid = validateField('company', formData.company);
    const fleetSizeValid = validateField('fleetSize', formData.fleetSize);

    // If any validation fails, stop submission
    if (!nameValid || !emailValid || !companyValid || !fleetSizeValid) {
      return;
    }

    // Execute API request
    await execute('/api/contact', {
      name: formData.name,
      email: formData.email,
      company: formData.company,
      fleetSize: formData.fleetSize,
      message: formData.message,
      _honeypot: honeypotField.value,
      formLoadedAt,
    });
  };

  return (
    <section id="demo" className="py-12 md:py-16 lg:py-20 relative overflow-hidden" ref={ref}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/20 to-accent-purple/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-balance px-2">
            <span className="gradient-text">Let's Talk</span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mt-4 md:mt-6 px-2">
            See your exact ROI with a relay model
          </p>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mt-3 px-2">
            No commitment. No sales pressure. Just data.
          </p>

          {/* Urgency Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mt-6"
          >
            <div className="relative px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary/20 via-accent-cyan/15 to-primary/20 border border-accent-cyan/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
              <div className="relative flex items-center gap-2">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-semibold text-white" suppressHydrationWarning>
                  Limited {currentQuarterLabel()} Spots Available
                </span>
                <span className="text-sm text-gray-500">|</span>
                <span className="text-sm text-gray-300">
                  Dedicated onboarding & white-glove support
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-stretch">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="glass-effect rounded-2xl p-4 sm:p-6 space-y-3 h-full flex flex-col">
              {/* Honeypot field - hidden from users but visible to bots */}
              <input
                {...honeypotField.props}
                value={honeypotField.value}
                onChange={honeypotField.onChange}
              />

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className={`w-full px-4 py-2.5 rounded-lg bg-white/5 border text-white text-base placeholder-gray-500
                           focus:outline-none focus:ring-2 transition-all
                           ${errors.name
                             ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                             : 'border-white/10 focus:border-primary focus:ring-primary/50'
                           }`}
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) validateField('name', e.target.value);
                  }}
                  onBlur={() => validateField('name', formData.name)}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className={`w-full px-4 py-2.5 rounded-lg bg-white/5 border text-white text-base placeholder-gray-500
                           focus:outline-none focus:ring-2 transition-all
                           ${errors.email
                             ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                             : 'border-white/10 focus:border-primary focus:ring-primary/50'
                           }`}
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) validateField('email', e.target.value);
                  }}
                  onBlur={() => validateField('email', formData.email)}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="company"
                  required
                  className={`w-full px-4 py-2.5 rounded-lg bg-white/5 border text-white text-base placeholder-gray-500
                           focus:outline-none focus:ring-2 transition-all
                           ${errors.company
                             ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                             : 'border-white/10 focus:border-primary focus:ring-primary/50'
                           }`}
                  placeholder="Your Company"
                  value={formData.company}
                  onChange={(e) => {
                    setFormData({ ...formData, company: e.target.value });
                    if (errors.company) validateField('company', e.target.value);
                  }}
                  onBlur={() => validateField('company', formData.company)}
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-400">{errors.company}</p>
                )}
              </div>

              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Fleet Size *
                </label>
                <div className="relative">
                  <button
                    ref={dropdownButtonRef}
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    onKeyDown={handleDropdownKeyDown}
                    className={`w-full px-4 py-2.5 rounded-lg bg-white/5 border text-white
                             focus:outline-none focus:ring-2 transition-all
                             cursor-pointer pr-10 text-left
                             ${errors.fleetSize
                               ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
                               : 'border-white/10 focus:border-primary focus:ring-primary/50'
                             }`}
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                    aria-label="Fleet size"
                  >
                    {formData.fleetSize
                      ? fleetSizeOptions.find(opt => opt.value === formData.fleetSize)?.label
                      : <span className="text-gray-500">Select fleet size</span>
                    }
                  </button>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {isDropdownOpen && (
                    <div
                      className="absolute z-[100] w-full mt-2 rounded-lg bg-[#1a1a2e] backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl"
                      role="listbox"
                    >
                      {fleetSizeOptions.map((option, index) => (
                        <div
                          key={option.value}
                          onClick={() => {
                            setFormData({ ...formData, fleetSize: option.value });
                            setIsDropdownOpen(false);
                            if (errors.fleetSize) validateField('fleetSize', option.value);
                          }}
                          onKeyDown={(e) => handleOptionKeyDown(e, option.value)}
                          role="option"
                          aria-selected={selectedIndex === index}
                          tabIndex={selectedIndex === index ? 0 : -1}
                          className={`px-4 py-2.5 text-white cursor-pointer transition-colors ${
                            selectedIndex === index
                              ? 'bg-primary/30 border-l-2 border-primary'
                              : 'hover:bg-primary/20'
                          }`}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.fleetSize && (
                  <p className="mt-1 text-sm text-red-400">{errors.fleetSize}</p>
                )}
                <input type="hidden" name="fleetSize" value={formData.fleetSize} required />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                  Tell us about your operation
                </label>
                <textarea
                  id="message"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-base placeholder-gray-500
                           focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  placeholder="What are your biggest challenges with long-haul operations?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <div className="mt-auto pt-2 flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading || isSuccess || !!apiError}
                  className={`group relative px-8 py-3.5 text-white font-bold rounded-lg
                           transition-all duration-300 text-base uppercase tracking-wide overflow-hidden
                           shadow-lg
                           ${isSuccess
                             ? 'bg-emerald-600 w-full'
                             : apiError
                             ? 'bg-red-500 w-full'
                             : isLoading
                             ? 'bg-primary/70 cursor-not-allowed'
                             : 'bg-gradient-to-r from-primary to-accent-cyan hover:from-accent-cyan hover:to-primary transform hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]'
                           }`}
              >
                {isSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Thank you! We'll be in touch soon.
                  </span>
                ) : apiError ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {apiError}
                  </span>
                ) : isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
                {/* Animated shine effect */}
                {!isSuccess && !apiError && !isLoading && (
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                )}
              </button>
              </div>

              {!isSuccess && !apiError && (
                <p className="text-sm text-gray-400 text-center">
                  We typically respond within 24 hours
                </p>
              )}
            </form>
          </motion.div>

          {/* Impact Metrics - Comparison */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col h-full justify-center space-y-3"
          >
            {/* Delivery Speed */}
            <div className="glass-effect rounded-xl p-4 border border-white/10 hover:border-accent-cyan/30 transition-all duration-300">
              <div className="flex justify-center mb-3">
                <h4 className="text-lg md:text-xl font-bold text-white relative inline-block pb-2">
                  Delivery Speed
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-cyan/0 via-accent-cyan to-accent-cyan/0 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></span>
                </h4>
              </div>
              <div className="relative mb-2">
                <div className="grid grid-cols-2 gap-8 mb-2">
                  <div className="text-3xl md:text-4xl font-black text-red-400 text-center">2-3 days</div>
                  <div className="text-3xl md:text-4xl font-black gradient-text text-center">1 day</div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <p className="text-sm md:text-base text-gray-500 whitespace-nowrap text-center">Mandatory rest stops</p>
                  <p className="text-sm md:text-base text-gray-400 whitespace-nowrap text-center">Continuous movement</p>
                </div>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 -translate-x-1/2"></div>
              </div>
              <div className="bg-gradient-to-r from-accent-cyan/10 to-primary/10 rounded-lg px-3 py-1.5 border border-accent-cyan/20 flex items-center justify-center gap-2 mt-3">
                <AnimatedIcon icon={Clock} size={16} className="text-accent-cyan flex-shrink-0" />
                <p className="text-sm font-semibold text-white">
                  Up to 50% faster delivery with relay handoffs
                </p>
              </div>
            </div>

            {/* Asset Utilization */}
            <div className="glass-effect rounded-xl p-4 border border-white/10 hover:border-accent-cyan/30 transition-all duration-300">
              <div className="flex justify-center mb-3">
                <h4 className="text-lg md:text-xl font-bold text-white relative inline-block pb-2">
                  Asset Utilization
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-cyan/0 via-accent-cyan to-accent-cyan/0 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></span>
                </h4>
              </div>
              <div className="relative mb-2">
                <div className="grid grid-cols-2 gap-8 mb-2">
                  <div className="text-3xl md:text-4xl font-black text-red-400 text-center">60%</div>
                  <div className="text-3xl md:text-4xl font-black gradient-text text-center">80%+</div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <p className="text-sm md:text-base text-gray-500 whitespace-nowrap text-center">Idle 20+ hours daily</p>
                  <p className="text-sm md:text-base text-gray-400 whitespace-nowrap text-center">Moving 24/7</p>
                </div>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 -translate-x-1/2"></div>
              </div>
              <div className="bg-gradient-to-r from-accent-cyan/10 to-primary/10 rounded-lg px-3 py-1.5 border border-accent-cyan/20 flex items-center justify-center gap-2 mt-3">
                <AnimatedIcon icon={Truck} size={16} className="text-accent-cyan flex-shrink-0" />
                <p className="text-sm font-semibold text-white">
                  20-30% increase in revenue per truck
                </p>
              </div>
            </div>

            {/* Driver Retention */}
            <div className="glass-effect rounded-xl p-4 border border-white/10 hover:border-accent-cyan/30 transition-all duration-300">
              <div className="flex justify-center mb-3">
                <h4 className="text-lg md:text-xl font-bold text-white relative inline-block pb-2">
                  Driver Retention
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-cyan/0 via-accent-cyan to-accent-cyan/0 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></span>
                </h4>
              </div>
              <div className="relative mb-2">
                <div className="grid grid-cols-2 gap-8 mb-2">
                  <div className="text-3xl md:text-4xl font-black text-red-400 text-center">Out 5 days</div>
                  <div className="text-3xl md:text-4xl font-black gradient-text text-center">Home daily</div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <p className="text-sm md:text-base text-gray-500 whitespace-nowrap text-center">Away from family</p>
                  <p className="text-sm md:text-base text-gray-400 whitespace-nowrap text-center">Home every night</p>
                </div>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 -translate-x-1/2"></div>
              </div>
              <div className="bg-gradient-to-r from-accent-cyan/10 to-primary/10 rounded-lg px-3 py-1.5 border border-accent-cyan/20 flex items-center justify-center gap-2 mt-3">
                <AnimatedIcon icon={Users} size={16} className="text-accent-cyan flex-shrink-0" />
                <p className="text-sm font-semibold text-white">
                  Reduce turnover by up to 50%
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
