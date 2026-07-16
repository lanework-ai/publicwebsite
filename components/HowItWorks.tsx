'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import AnimatedIcon from '@/components/AnimatedIcon';
import { Brain, MapPin, Route, Settings, Map, RefreshCw, Radio, BarChart3 } from 'lucide-react';

const steps = [
  {
    title: 'Planning Engine',
    description: 'Rapid Relay analyzes long-haul lanes and intelligently breaks them into optimized segments, each designed around predictable driver shifts, realistic time windows, and minimal dwell.',
    icon: Brain,
    gradient: 'from-blue-500 to-cyan-500',
    hoverGradient: 'group-hover:from-blue-600 group-hover:to-cyan-600',
  },
  {
    title: 'Relay Point Selection',
    description: 'The platform identifies optimal handoff locations along every route including terminals, drop yards, shared facilities, customer sites, or neutral third-party locations for maximum safety and efficiency.',
    icon: MapPin,
    gradient: 'from-green-500 to-emerald-500',
    hoverGradient: 'group-hover:from-green-600 group-hover:to-emerald-600',
  },
  {
    title: 'Multi-Leg Route Builder',
    description: 'Complete relay plans generate instantly with segment mileage, transit times, driver shift alignment, handoff timing, utilization impact, and cost estimates that adjust dynamically for delays and constraints.',
    icon: Route,
    gradient: 'from-purple-500 to-pink-500',
    hoverGradient: 'group-hover:from-purple-600 group-hover:to-pink-600',
  },
  {
    title: 'Carrier Control',
    description: 'Carriers maintain full control over driver assignments, facility selection, asset deployment, and relay plan modifications while Rapid Relay provides intelligent recommendations and operational support throughout.',
    icon: Settings,
    gradient: 'from-orange-500 to-red-500',
    hoverGradient: 'group-hover:from-orange-600 group-hover:to-red-600',
  },
];

const platformFeatures = [
  {
    title: 'Route Planning',
    description: 'AI-powered route segmentation that breaks down long-haul lanes into efficient regional segments.',
    features: ['Lane analysis', 'Real-time optimization', 'Multi-stop routing'],
    icon: Map,
    gradient: 'from-blue-500 to-cyan-500',
    gradientInactive: 'from-blue-500/20 to-cyan-500/20',
    hoverGradient: 'group-hover:from-blue-500/30 group-hover:to-cyan-500/30',
  },
  {
    title: 'Relay Coordination',
    description: 'Visual timeline with drag-and-drop scheduling for handoff locations and driver assignments.',
    features: ['Visual timeline', 'Driver matching', 'Facility management'],
    icon: RefreshCw,
    gradient: 'from-green-500 to-emerald-500',
    gradientInactive: 'from-green-500/20 to-emerald-500/20',
    hoverGradient: 'group-hover:from-green-500/30 group-hover:to-emerald-500/30',
  },
  {
    title: 'Live Tracking',
    description: 'Real-time freight monitoring across all relay segments with instant delay alerts.',
    features: ['GPS tracking', 'ETA predictions', 'Automated alerts'],
    icon: Radio,
    gradient: 'from-purple-500 to-pink-500',
    gradientInactive: 'from-purple-500/20 to-pink-500/20',
    hoverGradient: 'group-hover:from-purple-500/30 group-hover:to-pink-500/30',
  },
  {
    title: 'Analytics Dashboard',
    description: 'Performance metrics, cost analysis, and utilization reports for data-driven decisions.',
    features: ['Cost analysis', 'Performance KPIs', 'Custom reports'],
    icon: BarChart3,
    gradient: 'from-orange-500 to-amber-500',
    gradientInactive: 'from-orange-500/20 to-amber-500/20',
    hoverGradient: 'group-hover:from-orange-500/30 group-hover:to-amber-500/30',
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement | null>(null);
  const platformRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const isPlatformInView = useInView(platformRef, { once: true, margin: "-100px" });
  const [activeDemo, setActiveDemo] = useState(0);

  return (
    <section id="how-it-works" className="pt-20 md:pt-28 lg:pt-32 pb-12 md:pb-16 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Part 1: How Rapid Relay Works */}
        <div ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-balance px-2">
              How <span className="gradient-text">Rapid Relay Works</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto px-2">
              A complete relay operations platform built for scale
            </p>
          </motion.div>

          {/* 4-step process cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-effect rounded-2xl p-6 md:p-8 hover:bg-white/10 transition-all duration-300 group relative pt-12 md:pt-14"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="relative group/badge">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent-cyan rounded-full blur-sm opacity-50 group-hover/badge:opacity-75 transition-opacity" />
                    <div className="relative text-xs md:text-sm font-bold px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent-cyan text-white shadow-lg border border-white/20">
                      Step {index + 1}
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className={`mb-4 md:mb-5 rounded-2xl bg-gradient-to-br ${step.gradient} ${step.hoverGradient} inline-flex items-center justify-center transition-all duration-300 shadow-lg w-16 h-16 md:w-20 md:h-20`}>
                    <AnimatedIcon icon={step.icon} size={48} className="text-white" />
                  </div>

                  <h3 className="text-base md:text-lg font-bold mb-2 md:mb-3 text-white transition-all duration-300">
                    {step.title}
                  </h3>

                  <p className="text-gray-300 text-sm sm:text-base lg:text-base leading-relaxed text-balance px-2">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Visual connector */}
          <div className="flex flex-col items-center my-16 relative">
            <motion.button
              onClick={() => {
                platformRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative cursor-pointer hover:scale-110 transition-transform duration-300"
              aria-label="Scroll to Platform Features"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.3
                }}
                className="relative"
              >
                {/* Subtle outer glow ring */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.15, 0.1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-full bg-gradient-to-b from-primary to-accent-cyan blur-xl"
                  style={{ width: '80px', height: '80px', left: '-20px', top: '-20px' }}
                />

                {/* Futuristic chevron arrow */}
                <div className="relative w-10 h-10">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="relative z-10">
                    {/* Top chevron */}
                    <motion.path
                      d="M8 12 L20 24 L32 12"
                      stroke="url(#gradient1)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                    />
                    {/* Bottom chevron */}
                    <motion.path
                      d="M8 20 L20 32 L32 20"
                      stroke="url(#gradient2)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 1 }}
                    />

                    {/* Gradient definitions */}
                    <defs>
                      <linearGradient id="gradient1" x1="8" y1="12" x2="32" y2="12">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                      <linearGradient id="gradient2" x1="8" y1="20" x2="32" y2="20">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#0891b2" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Part 2: Platform Features */}
        <div ref={platformRef}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isPlatformInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-16"
          >
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-balance px-2">
              Platform <span className="gradient-text">Features</span>
            </h3>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto px-2">
              Powerful tools to manage relay operations from planning to execution
            </p>
          </motion.div>

          {/* 4-feature platform cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-6xl mx-auto">
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isPlatformInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onMouseEnter={() => setActiveDemo(index)}
                className={`glass-effect rounded-2xl p-4 md:p-6 cursor-pointer transition-all duration-300 group ${
                  activeDemo === index
                    ? 'bg-white/10 border-2 border-primary'
                    : 'border-2 border-transparent hover:bg-white/5'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Icon */}
                  <div className={`p-2.5 md:p-3 rounded-xl shrink-0 transition-all duration-300 flex items-center justify-center shadow-lg ${
                    activeDemo === index
                      ? `bg-gradient-to-br ${feature.gradient}`
                      : `bg-gradient-to-br ${feature.gradientInactive} ${feature.hoverGradient}`
                  }`}>
                    <AnimatedIcon icon={feature.icon} size={40} className="text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        activeDemo === index
                          ? 'bg-primary text-white'
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {index + 1}
                      </span>
                      <h4 className={`text-lg md:text-xl font-bold transition-all duration-300 ${
                        activeDemo === index ? 'text-white' : 'text-white'
                      }`}>
                        {feature.title}
                      </h4>
                    </div>

                    <p className="text-gray-300 mb-3 text-sm sm:text-base md:text-base lg:text-lg leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {feature.features.map((feat) => (
                        <span
                          key={feat}
                          className="text-xs sm:text-sm px-2 py-1 rounded-full bg-accent-cyan/30 text-accent-cyan border border-accent-cyan/50"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
