'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import AnimatedIcon from '@/components/AnimatedIcon';
import { Map, RefreshCw, Radio, BarChart3 } from 'lucide-react';

const demoSteps = [
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

export default function PlatformDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeDemo, setActiveDemo] = useState(0);

  return (
    <section className="py-16 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-balance">
            Platform <span className="gradient-text">Walkthrough</span>
          </h2>
        </motion.div>

        {/* 4-step platform cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {demoSteps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onMouseEnter={() => setActiveDemo(index)}
              className={`glass-effect rounded-2xl p-6 cursor-pointer transition-all duration-300 group ${
                activeDemo === index
                  ? 'bg-white/10 border-2 border-primary'
                  : 'border-2 border-transparent hover:bg-white/5'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-xl shrink-0 transition-all duration-300 flex items-center justify-center shadow-lg ${
                  activeDemo === index
                    ? `bg-gradient-to-br ${step.gradient}`
                    : `bg-gradient-to-br ${step.gradientInactive} ${step.hoverGradient}`
                }`}>
                  <AnimatedIcon icon={step.icon} size={48} className="text-white" />
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
                    <h3 className={`text-xl font-bold transition-all duration-300 ${
                      activeDemo === index ? 'text-white' : 'text-white'
                    }`}>
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-gray-300 mb-3 text-base sm:text-lg leading-relaxed">
                    {step.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {step.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-sm px-2 py-1 rounded-full bg-accent-cyan/30 text-accent-cyan border border-accent-cyan/50"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
