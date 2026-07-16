'use client';

import { motion, useInView } from 'framer-motion';
import { Fragment, useRef, useState } from 'react';
import AnimatedIcon from '@/components/AnimatedIcon';
import { Building, Package, ChevronLeft, ChevronRight, BarChart3, Truck, Zap, DollarSign } from 'lucide-react';

const targetMarket = [
  'Regional fleets',
  'Strong dispatch teams',
  'Multiple yards or terminals',
  'Long-haul freight that is expensive to run',
  'Drivers who prefer consistent schedules',
];

const benefits = [
  {
    title: 'Faster Transit',
    description: 'Long-distance freight arrives sooner because the trailer keeps moving 24/7. Drivers are not stuck in multi-day rest cycles or overnight downtime. Freight that once took two to three days can often arrive in half the time.',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&h=600&fit=crop&q=80',
  },
  {
    title: 'Higher Asset Utilization',
    description: 'Carriers with 100+ trucks often struggle to raise tractor productivity without expanding their asset footprint. Relay-based operations turn a long haul into a continuous flow of short segments. This reduces idle time and keeps trucks in motion around the clock.',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&h=600&fit=crop&q=80',
  },
  {
    title: 'Stable Driver Schedules',
    description: 'Drivers stay within their region and return home safely and predictably. Large carriers see reduced turnover when long-haul pressure is removed. Regional routes fit day-to-day family life better than weeks away from home.',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop&q=80',
  },
  {
    title: 'Network Flexibility',
    description: 'Carriers can serve distant markets without opening new terminals or running every trip with their own long-haul capacity. External drop yards or shared networks can be included at any time. This allows rapid expansion into new lanes without major capital investment.',
    image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&h=600&fit=crop&q=80',
  },
];

const testimonials = [
  {
    quote: "A 350-truck long-haul carrier struggling with 92% driver turnover implemented relay operations. Drivers now return home almost every night, and turnover dropped to 51%. The carrier saves over $500K annually on recruiting and training costs alone.",
    name: "Regional Carrier",
    role: "Driver Retention Success",
    location: "Southwest Region",
    trucks: "350 trucks",
    icon: BarChart3,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    quote: "A mid-sized fleet increased asset utilization from 52% to 81% within three months of adopting relay-based operations. Their trucks now move 24/7 across coordinated segments, and driver turnover decreased significantly as schedules became more predictable.",
    name: "Mid-Size Fleet",
    role: "Asset Utilization Growth",
    location: "Texas Operations",
    trucks: "175 trucks",
    icon: Truck,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    quote: "An LA-to-Dallas lane was optimized into four relay segments, reducing transit time from 2.5 days to 18 hours. Customers responded enthusiastically to the faster service, allowing the carrier to charge premium rates for expedited delivery.",
    name: "Long-Haul Carrier",
    role: "Transit Time Reduction",
    location: "Western Corridor",
    trucks: "240 trucks",
    icon: Zap,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    quote: "A carrier reduced empty miles from 38% to under 12% through intelligent backhaul matching. The platform identified return loads that manual dispatching had missed, creating profitable round-trip operations and adding $3M in annual revenue.",
    name: "Regional Fleet",
    role: "Backhaul Optimization",
    location: "Midwest Network",
    trucks: "280 trucks",
    icon: DollarSign,
    gradient: "from-orange-500 to-red-500",
  },
];

export default function WhoWeServe() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const benefitsRef = useRef(null);
  const benefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" });
  const testimonialsRef = useRef(null);
  const testimonialsInView = useInView(testimonialsRef, { once: true, margin: "-100px" });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <Fragment>
      {/* Who We Serve Section - First */}
      <section className="py-12 relative" ref={ref}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-balance">
                For Fleets <span className="gradient-text">Ready to Scale</span>
              </h1>
            </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex"
            >
              <div className="glass-effect rounded-2xl p-6 sm:p-8 flex flex-col w-full">
                <h3 className="text-2xl sm:text-3xl font-bold mb-6 gradient-text">
                  Fleets with 100+ Trucks
                </h3>

                <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-4 mt-6">
                  Rapid Relay focuses primarily on established fleets with 100 trucks or more. These fleets already have:
                </p>

                <ul className="space-y-2.5 mb-6">
                  {targetMarket.map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-base sm:text-lg text-gray-300">{item}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-auto pt-8 border-t border-gray-700">
                  <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                    <span className="text-emphasis">Relay as a Service</span> provides a scalable way to improve long-haul economics without building more infrastructure or relying on team drivers.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col gap-8"
            >
              <div className="glass-effect rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-300 flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center flex-shrink-0">
                    <AnimatedIcon icon={Building} size={40} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
                      For Carriers
                    </h3>
                    <p className="text-lg sm:text-xl md:text-lg text-gray-300 leading-relaxed">
                      Large carriers seeking to optimize long-haul operations, reduce driver turnover, and increase asset utilization without expanding infrastructure.
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-300 flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-purple to-primary flex items-center justify-center flex-shrink-0">
                    <AnimatedIcon icon={Package} size={40} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
                      For Brokerage & 3PL Partners
                    </h3>
                    <p className="text-lg sm:text-xl md:text-lg text-gray-300 leading-relaxed">
                      We also support brokerage and 3PL partners who need reliable relay-based coverage on long-distance lanes. All activity runs through the carrier of record.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Large Carriers Use Rapid Relay Section - Second */}
      <section id="benefits" className="py-16 relative" ref={benefitsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-balance">
              Why Large Fleets Use{' '}
              <span className="gradient-text">Rapid Relay</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 50 }}
                animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative rounded-2xl overflow-hidden group h-80"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${benefit.image})` }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40" />

                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-6">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-base sm:text-lg text-gray-200 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section - Carousel */}
      <section className="py-12 relative" ref={testimonialsRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-balance">
              <span className="gradient-text">Real-World</span> Results
            </h2>
          </motion.div>

          {/* Carousel Container */}
          <div className="relative overflow-hidden">
            <div className="flex items-center gap-4">
              {/* Previous Button */}
              <button
                onClick={prevTestimonial}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 hover:bg-primary/40 flex items-center justify-center transition-all duration-300 border border-primary/30"
                aria-label="Previous case study"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              {/* Carousel Track */}
              <div className="flex-1 overflow-hidden">
                <motion.div
                  key={currentTestimonial}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="glass-effect rounded-2xl p-8 relative border border-primary/20"
                >
                  <div className="flex flex-col gap-6">
                    {/* Header with Icon and Category */}
                    <div className="flex items-center gap-4 pb-4 border-b border-gray-700">
                      <motion.div
                        initial={{ scale: 0.8, rotate: -5 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex-shrink-0"
                      >
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${testimonials[currentTestimonial].gradient} flex items-center justify-center shadow-lg`}>
                          <AnimatedIcon icon={testimonials[currentTestimonial].icon} size={32} className="text-white" />
                        </div>
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                          {testimonials[currentTestimonial].role}
                        </h3>
                        <p className="text-sm text-accent-cyan font-semibold flex items-center gap-2 flex-wrap">
                          <span>{testimonials[currentTestimonial].name}</span>
                          <span className="text-gray-500">|</span>
                          <span>{testimonials[currentTestimonial].trucks}</span>
                          <span className="text-gray-500">|</span>
                          <span>{testimonials[currentTestimonial].location}</span>
                        </p>
                      </div>
                    </div>

                    {/* Case Study Content */}
                    <div className="relative z-10">
                      <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                        {testimonials[currentTestimonial].quote}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Next Button */}
              <button
                onClick={nextTestimonial}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 hover:bg-primary/40 flex items-center justify-center transition-all duration-300 border border-primary/30"
                aria-label="Next case study"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to case study ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass-effect rounded-2xl p-8 sm:p-12 text-center border-2 border-primary/30"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
              <span className="gradient-text">Join the Relay Revolution</span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed">
              See how Rapid Relay can transform your long-haul operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/#demo"
                className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
              >
                Request a Demo
              </a>
              <a
                href="/"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-lg transition-all duration-200 border border-white/20"
              >
                Back to Home
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Fragment>
  );
}
