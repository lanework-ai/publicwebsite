'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import AnimatedIcon from '@/components/AnimatedIcon';
import { Monitor, Smartphone, Satellite, DollarSign, Link, ChevronDown, Truck } from 'lucide-react';

const integrationCategories = [
  {
    title: 'Transportation Management Systems',
    description: 'Integrations allow Rapid Relay to ingest lane structures, historical execution data, and planning inputs while returning optimized relay recommendations back into existing planning environments.',
    icon: Monitor,
    examples: ['McLeod', 'Trimble', 'MercuryGate', 'Rose Rocket'],
    color: 'from-blue-500/20 to-blue-600/20',
    borderColor: 'border-blue-500/30',
  },
  {
    title: 'ELD and Telematics Providers',
    description: 'These connections support visibility into driver availability, HOS constraints, dwell patterns, and real-world execution signals that improve relay feasibility and accuracy.',
    icon: Smartphone,
    examples: ['Motive', 'Samsara', 'Omnitracs', 'Geotab'],
    color: 'from-green-500/20 to-green-600/20',
    borderColor: 'border-green-500/30',
  },
  {
    title: 'Visibility and Data Platforms',
    description: 'Visibility data helps validate timing assumptions, identify congestion and delay patterns, and improve relay node reliability over time through real-time tracking and performance insights across the entire network.',
    icon: Satellite,
    examples: ['project44', 'FourKites', 'MacroPoint', 'Transporeon'],
    color: 'from-purple-500/20 to-purple-600/20',
    borderColor: 'border-purple-500/30',
  },
  {
    title: 'Trailer Pool Management',
    description: 'Seamless trailer pool access integration adding flexibility for users to access trailers on demand, wherever and whenever they need them. This means fewer empty miles, reduced wait times, and greater profitability through optimized asset utilization.',
    icon: Truck,
    examples: ['REPOWR'],
    color: 'from-cyan-500/20 to-cyan-600/20',
    borderColor: 'border-cyan-500/30',
    logo: 'https://cdn.prod.website-files.com/66a920b6d1b9e7a61092bb4a/66db049751d5238e34625853_REPOWRWhite.svg',
  },
  {
    title: 'Spot Market Providers',
    description: 'Spot market integrations allow carriers to evaluate backhaul and gap-filling opportunities directly within the relay planning context while helping monetize uncovered legs and maintaining control over pricing and eligibility.',
    icon: DollarSign,
    examples: ['DAT', 'Truckstop', 'C.H. Robinson', 'Schneider'],
    color: 'from-orange-500/20 to-orange-600/20',
    borderColor: 'border-orange-500/30',
  },
];

export default function Integrations() {
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
    <section id="integrations" className="py-12 md:py-16 lg:py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 text-balance px-2">
            <span className="gradient-text">System Integrations</span>
          </h2>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-2">
            Two-way integrations with your existing technology stack.
            <span className="block mt-2">No data silos. No manual entry. Just seamless connectivity.</span>
          </p>
        </motion.div>

        {/* Integration Cards Grid */}
        <div className="flex flex-col gap-3 md:gap-4 mb-12 md:mb-16 max-w-[480px] mx-auto">
          {integrationCategories.map((category, index) => {
            const isExpanded = expandedCards.includes(index);

            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                layout
                className={`glass-effect rounded-xl p-3 md:p-4 lg:p-5 border ${category.borderColor} bg-gradient-to-br ${category.color} hover:bg-white/10 transition-all duration-300 cursor-pointer`}
                onClick={() => toggleCard(index)}
              >
                <div className="grid grid-cols-[auto_1fr_auto] gap-2 md:gap-3 lg:gap-4 items-start">
                  <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center flex-shrink-0 mt-0.5 md:mt-1">
                    <AnimatedIcon icon={category.icon} size={28} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight transition-all duration-300 whitespace-break-spaces ${isExpanded ? 'mb-2 md:mb-3' : 'mb-0'}`}>
                      {category.title}
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
                          <p className="text-xs sm:text-sm text-gray-300 mb-3 md:mb-4 leading-relaxed">
                            {category.description}
                          </p>
                          <div className="flex gap-1.5 md:gap-2 items-center flex-wrap">
                            {category.logo ? (
                              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-white/10 border border-white/20">
                                <img
                                  src={category.logo}
                                  alt={`${category.examples[0] ?? category.title} logo`}
                                  className="h-5 md:h-6 w-auto"
                                />
                              </div>
                            ) : (
                              category.examples.map((example) => (
                                <span
                                  key={example}
                                  className="text-xs sm:text-sm px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-white/10 text-gray-300 border border-white/20 whitespace-nowrap"
                                >
                                  {example}
                                </span>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 mt-1 md:mt-1.5"
                  >
                    <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-white" />
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
