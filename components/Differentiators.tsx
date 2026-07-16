'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import AnimatedIcon from '@/components/AnimatedIcon';
import { Laptop, Layers, Gauge, Waypoints, ChevronDown } from 'lucide-react';

const differentiators = [
  {
    title: 'Pure Software',
    description: 'We do not compete with carriers. We do not move freight. We do not operate assets. We provide planning, optimization, and decision support.',
    icon: Laptop,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Built for Scale',
    description: 'Every feature is designed for fleets with large volumes and complex networks. Relay plans account for operational constraints, appointment windows, shift structures, dwell patterns, and safety requirements.',
    icon: Layers,
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Fast Deployment',
    description: 'The platform integrates with existing TMS and telematics systems. Carriers can pilot relay operations on a single lane before expanding network-wide.',
    icon: Gauge,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Future Ready',
    description: 'If the industry continues moving toward more shared yards, collaborative drop networks, or regionalized freight models, Rapid Relay already supports those scenarios. Carriers choose what to use and what to ignore.',
    icon: Waypoints,
    gradient: 'from-orange-500 to-amber-500',
  },
];

export default function Differentiators() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [expandedCards, setExpandedCards] = useState<number[]>([]);

  const toggleCard = (index: number) => {
    setExpandedCards(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-purple/5 to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-balance">
            What Makes <span className="gradient-text">Us Different</span>
          </h2>
        </motion.div>

        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
          {differentiators.map((item, index) => {
            const isExpanded = expandedCards.includes(index);

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                layout
                className="glass-effect rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                onClick={() => toggleCard(index)}
              >
                <div className="grid grid-cols-[auto_1fr_auto] gap-6 items-start">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0`}>
                    <AnimatedIcon icon={item.icon} size={40} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-2xl font-bold text-white leading-tight transition-all duration-300 ${isExpanded ? 'mb-4' : 'mb-0'}`}>
                      {item.title}
                    </h3>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                            {item.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
