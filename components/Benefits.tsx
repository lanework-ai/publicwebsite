'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import AnimatedIcon from '@/components/AnimatedIcon';
import { Rocket, TrendingUp, Users, Globe } from 'lucide-react';

const benefits = [
  {
    title: 'Faster Transit',
    description: 'Long-distance freight arrives sooner because the trailer keeps moving. Drivers are not stuck in multi-day rest cycles or overnight downtime. Freight that once took two to three days can often arrive in half the time.',
    icon: Rocket,
    gradient: 'from-primary to-accent-cyan',
  },
  {
    title: 'Higher Asset Utilization',
    description: 'Carriers with 100+ trucks often struggle to raise tractor productivity without expanding their asset footprint. Relay-based operations turn a long haul into a continuous flow of short segments, which reduces idle time and keeps trucks in motion.',
    icon: TrendingUp,
    gradient: 'from-accent-cyan to-accent-purple',
  },
  {
    title: 'Stable Driver Schedules',
    description: 'Drivers stay within their region and return home safely and predictably. Large carriers see reduced turnover when long-haul pressure is removed and when work fits day-to-day family life.',
    icon: Users,
    gradient: 'from-accent-purple to-primary',
  },
  {
    title: 'Network Flexibility',
    description: 'Carriers can serve distant markets without opening new terminals or running every trip with their own long-haul capacity. External drop yards or shared networks can be included at any time.',
    icon: Globe,
    gradient: 'from-primary to-primary-dark',
  },
];

export default function Benefits() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="benefits" className="py-12 md:py-16 lg:py-20 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 text-balance px-2">
            Why Large Carriers Use{' '}
            <span className="gradient-text">Rapid Relay</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-effect rounded-2xl p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center flex-shrink-0`}>
                  <AnimatedIcon icon={benefit.icon} size={36} className="text-white sm:w-10 sm:h-10" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-base sm:text-lg md:text-base lg:text-lg text-gray-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
