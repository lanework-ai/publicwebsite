'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import AnimatedIcon from '@/components/AnimatedIcon';
import { AlertTriangle, Zap, MapPin, Truck, RotateCw, UserCheck, Award, Moon, TrendingDown, Clock, Sparkles } from 'lucide-react';

const mobileSegments = [
  { driver: 'Mike', from: 'LA', to: 'Phoenix', miles: '240', handoff: '45min', deadhead: '25mi', homeDistance: '18mi', backhaul: '235mi', backhaulNote: '' },
  { driver: 'Sarah', from: 'Phoenix', to: 'Tucson', miles: '290', handoff: '60min', deadhead: '35mi', homeDistance: '42mi', backhaul: '285mi', backhaulNote: '' },
  { driver: 'Carlos', from: 'Tucson', to: 'El Paso', miles: '320', handoff: '45min', deadhead: '40mi', homeDistance: '28mi', backhaul: '315mi', backhaulNote: '' },
  { driver: 'Jamie', from: 'El Paso', to: 'Dallas', miles: '590', handoff: '30min', deadhead: '30mi', homeDistance: '35mi', backhaul: '580mi', backhaulNote: '(next day after 10-hr rest)' },
];

export default function WhatWeDo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [showComparison, setShowComparison] = useState<'relay' | 'traditional'>('relay');
  const [smokingTruck, setSmokingTruck] = useState<string | null>(null);

  return (
    <section id="what-we-do" className="py-12 md:py-16 lg:py-20 relative" ref={ref}>
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 text-balance px-2">
            What <span className="gradient-text">We Do</span>
          </h2>
        </motion.div>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-effect rounded-2xl p-4 md:p-6 text-center border-2 border-primary/30"
          >
            <div className="h-10 md:h-14 flex items-center justify-center mb-2 md:mb-3">
              <AnimatedIcon icon={AlertTriangle} size={40} className="text-orange-400 md:w-12 md:h-12" />
            </div>
            <div className="h-14 md:h-16 flex items-center justify-center mb-2 md:mb-3">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white whitespace-nowrap">The Problem</h3>
            </div>
            <p className="text-base sm:text-lg md:text-base lg:text-xl text-gray-300 leading-relaxed">
              Traditional trucking wastes <span className="text-red-400 font-semibold">35% of miles empty</span>, costing <span className="text-red-400 font-semibold">$42B annually</span> while forcing drivers to spend weeks away from their homes and families.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-effect rounded-2xl p-4 md:p-6 text-center border-2 border-accent-cyan/50 bg-gradient-to-br from-accent-cyan/10 to-transparent"
          >
            <div className="h-10 md:h-14 flex items-center justify-center mb-2 md:mb-3">
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Subtle electric glow effect */}
                <motion.div
                  className="absolute inset-0 blur-md"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [0.95, 1.05, 0.95],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <AnimatedIcon icon={Zap} size={40} className="text-accent-cyan md:w-12 md:h-12" />
                </motion.div>
                {/* Main icon */}
                <motion.div
                  className="relative z-10"
                  animate={{
                    filter: [
                      'drop-shadow(0 0 2px rgba(64, 168, 196, 0.5))',
                      'drop-shadow(0 0 8px rgba(64, 168, 196, 0.8))',
                      'drop-shadow(0 0 2px rgba(64, 168, 196, 0.5))',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <AnimatedIcon icon={Zap} size={40} className="text-accent-cyan md:w-12 md:h-12" />
                </motion.div>
              </motion.div>
            </div>
            <div className="h-14 md:h-16 flex items-center justify-end flex-col mb-2 md:mb-3">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white relative inline-block pb-4 whitespace-nowrap">
                Our Solution
                <svg
                  className="absolute bottom-0 left-0 w-full h-4"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0,8 Q10,4 20,7 T40,8 Q50,5 60,7 T80,8 Q90,6 100,7 T120,8 Q130,5 140,7 T160,8 Q170,6 180,7 T200,8"
                    stroke="#22c55e"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                </svg>
              </h3>
            </div>
            <p className="text-base sm:text-lg md:text-base lg:text-xl text-gray-300 leading-relaxed">
              AI relay operations <span className="text-accent-cyan font-semibold">match backhauls</span>, eliminate deadhead, and keep <span className="text-accent-cyan font-semibold">trucks moving 24/7</span> with seamless regional driver handoffs across the network.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass-effect rounded-2xl p-4 md:p-6 text-center border-2 border-green-500/30"
          >
            <div className="h-10 md:h-14 flex items-center justify-center mb-2 md:mb-3">
              <AnimatedIcon icon={Sparkles} size={40} className="text-yellow-400 md:w-12 md:h-12" />
            </div>
            <div className="h-14 md:h-16 flex items-center justify-center mb-2 md:mb-3">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white whitespace-nowrap">The Result</h3>
            </div>
            <p className="text-base sm:text-lg md:text-base lg:text-xl text-gray-300 leading-relaxed">
              <span className="text-accent-cyan font-semibold">80%+ asset utilization</span>, drivers home daily, and <span className="text-accent-cyan font-semibold">up to 50% faster delivery</span> than traditional long-haul trucking operations.
            </p>
          </motion.div>
        </div>

        {/* Toggle between Relay and Traditional */}
        <motion.div
          id="relay-toggle"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="glass-effect rounded-full p-1.5 inline-flex gap-1">
            <button
              onClick={() => setShowComparison('relay')}
              className={`px-6 py-2.5 rounded-full text-lg font-semibold transition-all duration-300 ${
                showComparison === 'relay'
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Relay
            </button>
            <button
              onClick={() => setShowComparison('traditional')}
              className={`px-6 py-2.5 rounded-full text-lg font-semibold transition-all duration-300 ${
                showComparison === 'traditional'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Traditional
            </button>
          </div>
        </motion.div>

        {/* Relay Model Visualization */}
        {showComparison === 'relay' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="glass-effect rounded-3xl p-8 sm:p-12 relative overflow-hidden max-w-7xl mx-auto"
          >
            {/* Background */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(77, 101, 255, 0.4) 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }} />
            </div>

            {/* Route Info Header */}
            <div className="relative z-10 text-center mb-8">
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2">Los Angeles → Dallas</h3>
              <p className="text-base text-gray-400">1,440 miles | 3 relay handoffs | 240-590 mi per leg</p>
            </div>

            {/* Main Visualization - Desktop */}
            <div className="hidden lg:block relative z-10">
              {/* Outbound Journey */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-gradient-to-r from-transparent to-primary rounded-full" />
                  <h4 className="text-lg font-bold text-white">Outbound Journey</h4>
                  <div className="h-1 flex-1 bg-gradient-to-r from-primary to-transparent rounded-full" />
                </div>

                <div className="flex items-center gap-6">
                  {/* LA Origin */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center glow-effect border-4 border-blue-500/30">
                      <AnimatedIcon icon={MapPin} size={32} className="text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">Los Angeles</p>
                      <p className="text-base text-gray-400">Origin</p>
                    </div>
                  </div>

                  {/* Segment 1: LA to Phoenix */}
                  <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
                    <div className="w-full relative">
                      <div className="h-2 bg-gradient-to-r from-primary to-accent-cyan rounded-full relative opacity-60">
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                          onClick={() => setSmokingTruck(smokingTruck === 'outbound-1' ? null : 'outbound-1')}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary blur-xl opacity-60 animate-pulse"></div>
                            <AnimatedIcon icon={Truck} size={40} className="text-white relative z-10 drop-shadow-2xl" />
                            {smokingTruck === 'outbound-1' && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                <div className="smoke-particle"></div>
                                <div className="smoke-particle delay-1"></div>
                                <div className="smoke-particle delay-2"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="glass-effect px-4 py-2.5 rounded-lg border border-primary/30 text-center w-full max-w-[200px]">
                      <p className="text-base font-bold text-white mb-0.5">Mike</p>
                      <p className="text-sm text-gray-300 mb-0.5">240 mi | 3.5 hrs</p>
                      <p className="text-xs text-gray-400">Pickup: 6:00 AM</p>
                      <p className="text-xs text-gray-400">Delivery: 10:15 AM</p>
                    </div>
                  </div>

                  {/* Phoenix Relay */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center">
                      <AnimatedIcon icon={RotateCw} size={48} className="text-accent-cyan" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-white">Phoenix</p>
                      <p className="text-base text-accent-cyan">Relay 1</p>
                      <p className="text-sm text-gray-400">(45 mins)</p>
                    </div>
                  </div>

                  {/* Segment 2: Phoenix to Tucson */}
                  <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
                    <div className="w-full relative">
                      <div className="h-2 bg-gradient-to-r from-accent-cyan to-accent-purple rounded-full relative opacity-60">
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                          onClick={() => setSmokingTruck(smokingTruck === 'outbound-2' ? null : 'outbound-2')}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary blur-xl opacity-60 animate-pulse"></div>
                            <AnimatedIcon icon={Truck} size={40} className="text-white relative z-10 drop-shadow-2xl" />
                            {smokingTruck === 'outbound-2' && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                <div className="smoke-particle"></div>
                                <div className="smoke-particle delay-1"></div>
                                <div className="smoke-particle delay-2"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="glass-effect px-4 py-2.5 rounded-lg border border-accent-purple/30 text-center w-full max-w-[200px]">
                      <p className="text-base font-bold text-white mb-0.5">Sarah</p>
                      <p className="text-sm text-gray-300 mb-0.5">290 mi | 4.2 hrs</p>
                      <p className="text-xs text-gray-400">Pickup: 11:00 AM</p>
                      <p className="text-xs text-gray-400">Delivery: 4:12 PM</p>
                    </div>
                  </div>

                  {/* Tucson Relay */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center">
                      <AnimatedIcon icon={RotateCw} size={48} className="text-accent-purple" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-white">Tucson</p>
                      <p className="text-base text-accent-purple">Relay 2</p>
                      <p className="text-sm text-gray-400">(60 mins)</p>
                    </div>
                  </div>

                  {/* Segment 3: Tucson to El Paso */}
                  <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
                    <div className="w-full relative">
                      <div className="h-2 bg-gradient-to-r from-accent-purple to-primary rounded-full relative opacity-60">
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                          onClick={() => setSmokingTruck(smokingTruck === 'outbound-3' ? null : 'outbound-3')}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary blur-xl opacity-60 animate-pulse"></div>
                            <AnimatedIcon icon={Truck} size={40} className="text-white relative z-10 drop-shadow-2xl" />
                            {smokingTruck === 'outbound-3' && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                <div className="smoke-particle"></div>
                                <div className="smoke-particle delay-1"></div>
                                <div className="smoke-particle delay-2"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="glass-effect px-4 py-2.5 rounded-lg border border-primary/30 text-center w-full max-w-[200px]">
                      <p className="text-base font-bold text-white mb-0.5">Carlos</p>
                      <p className="text-sm text-gray-300 mb-0.5">320 mi | 4.7 hrs</p>
                      <p className="text-xs text-gray-400">Pickup: 5:12 PM</p>
                      <p className="text-xs text-gray-400">Delivery: 10:42 PM</p>
                    </div>
                  </div>

                  {/* El Paso Relay */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center">
                      <AnimatedIcon icon={RotateCw} size={48} className="text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-white">El Paso</p>
                      <p className="text-base text-primary">Relay 3</p>
                      <p className="text-sm text-gray-400">(45 mins)</p>
                    </div>
                  </div>

                  {/* Segment 4: El Paso to Dallas */}
                  <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
                    <div className="w-full relative">
                      <div className="h-2 bg-gradient-to-r from-primary to-accent-cyan rounded-full relative opacity-60">
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                          onClick={() => setSmokingTruck(smokingTruck === 'outbound-4' ? null : 'outbound-4')}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary blur-xl opacity-60 animate-pulse"></div>
                            <AnimatedIcon icon={Truck} size={40} className="text-white relative z-10 drop-shadow-2xl" />
                            {smokingTruck === 'outbound-4' && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                <div className="smoke-particle"></div>
                                <div className="smoke-particle delay-1"></div>
                                <div className="smoke-particle delay-2"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="glass-effect px-4 py-2.5 rounded-lg border border-accent-cyan/30 text-center w-full max-w-[200px]">
                      <p className="text-base font-bold text-white mb-0.5">Jamie</p>
                      <p className="text-sm text-gray-300 mb-0.5">590 mi | 8.6 hrs</p>
                      <p className="text-xs text-gray-400">Pickup: 11:27 PM</p>
                      <p className="text-xs text-gray-400">Delivery: 8:57 AM</p>
                    </div>
                  </div>

                  {/* Dallas Destination */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center glow-effect border-4 border-red-500/30">
                      <AnimatedIcon icon={MapPin} size={32} className="text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">Dallas</p>
                      <p className="text-base text-gray-400">Destination</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Return Journey with Backhauls */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-gradient-to-r from-transparent to-green-500 rounded-full" />
                  <h4 className="text-lg font-bold text-green-400">Return, with Matched Backhauls</h4>
                  <div className="h-1 flex-1 bg-gradient-to-r from-green-500 to-transparent rounded-full" />
                </div>

                <div className="flex items-start gap-6 flex-row-reverse">
                  {/* Dallas Start */}
                  <div className="w-20" />

                  {/* Return Segment 1 - Jamie's Return */}
                  <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
                    <div className="w-full relative">
                      <div className="h-2 bg-gradient-to-l from-primary/60 to-accent-cyan/60 rounded-full relative border border-green-500/30 opacity-60">
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                          style={{ transform: 'translate(-50%, -50%) scaleX(-1)' }}
                          onClick={() => setSmokingTruck(smokingTruck === 'return-1' ? null : 'return-1')}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary blur-xl opacity-60 animate-pulse"></div>
                            <AnimatedIcon icon={Truck} size={40} className="text-white relative z-10 drop-shadow-2xl" />
                            {smokingTruck === 'return-1' && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                <div className="smoke-particle"></div>
                                <div className="smoke-particle delay-1"></div>
                                <div className="smoke-particle delay-2"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="glass-effect px-4 py-2.5 rounded-lg border border-green-500/30 text-center bg-green-500/10 w-full max-w-[240px] self-start">
                      <p className="text-base font-bold text-green-400 mb-0.5">Jamie</p>
                      <p className="text-sm text-gray-300 mb-0.5">580 mi backhaul</p>
                      <p className="text-sm text-gray-300 mb-0.5">35mi from home</p>
                      <p className="text-sm text-gray-400">10-hr rest</p>
                      <p className="text-xs text-gray-400">Pickup: 7:00 PM</p>
                      <p className="text-xs text-gray-400">Delivery: 4:36 AM (next day)</p>
                      <p className="text-xs text-gray-400">Home by 5 AM</p>
                    </div>
                  </div>

                  {/* El Paso */}
                  <div className="w-16" />

                  {/* Return Segment 2 - Carlos's Return */}
                  <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
                    <div className="w-full relative">
                      <div className="h-2 bg-gradient-to-l from-accent-cyan/60 to-accent-purple/60 rounded-full relative border border-green-500/30 opacity-60">
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                          style={{ transform: 'translate(-50%, -50%) scaleX(-1)' }}
                          onClick={() => setSmokingTruck(smokingTruck === 'return-2' ? null : 'return-2')}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary blur-xl opacity-60 animate-pulse"></div>
                            <AnimatedIcon icon={Truck} size={40} className="text-white relative z-10 drop-shadow-2xl" />
                            {smokingTruck === 'return-2' && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                <div className="smoke-particle"></div>
                                <div className="smoke-particle delay-1"></div>
                                <div className="smoke-particle delay-2"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="glass-effect px-4 py-2.5 rounded-lg border border-green-500/30 text-center bg-green-500/10 w-full max-w-[240px] self-start">
                      <p className="text-base font-bold text-green-400 mb-0.5">Carlos</p>
                      <p className="text-sm text-gray-300 mb-0.5">315 mi backhaul</p>
                      <p className="text-sm text-gray-300 mb-0.5">28mi from home</p>
                      <p className="text-xs text-gray-400">Pickup: 11:42 PM</p>
                      <p className="text-xs text-gray-400">Delivery: 4:30 AM</p>
                      <p className="text-xs text-gray-400">Home by 5 AM</p>
                    </div>
                  </div>

                  {/* Tucson */}
                  <div className="w-16" />

                  {/* Return Segment 3 - Sarah's Return */}
                  <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
                    <div className="w-full relative">
                      <div className="h-2 bg-gradient-to-l from-accent-purple/60 to-accent-cyan/60 rounded-full relative border border-green-500/30 opacity-60">
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                          style={{ transform: 'translate(-50%, -50%) scaleX(-1)' }}
                          onClick={() => setSmokingTruck(smokingTruck === 'return-3' ? null : 'return-3')}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary blur-xl opacity-60 animate-pulse"></div>
                            <AnimatedIcon icon={Truck} size={40} className="text-white relative z-10 drop-shadow-2xl" />
                            {smokingTruck === 'return-3' && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                <div className="smoke-particle"></div>
                                <div className="smoke-particle delay-1"></div>
                                <div className="smoke-particle delay-2"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="glass-effect px-4 py-2.5 rounded-lg border border-green-500/30 text-center bg-green-500/10 w-full max-w-[240px] self-start">
                      <p className="text-base font-bold text-green-400 mb-0.5">Sarah</p>
                      <p className="text-sm text-gray-300 mb-0.5">285 mi backhaul</p>
                      <p className="text-sm text-gray-300 mb-0.5">42mi from home</p>
                      <p className="text-xs text-gray-400">Pickup: 5:12 PM</p>
                      <p className="text-xs text-gray-400">Delivery: 9:30 PM</p>
                      <p className="text-xs text-gray-400">Home by 10 PM</p>
                    </div>
                  </div>

                  {/* Phoenix */}
                  <div className="w-16" />

                  {/* Return Segment 4 - Mike's Return */}
                  <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
                    <div className="w-full relative">
                      <div className="h-2 bg-gradient-to-l from-accent-cyan/60 to-primary/60 rounded-full relative border border-green-500/30 opacity-60">
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                          style={{ transform: 'translate(-50%, -50%) scaleX(-1)' }}
                          onClick={() => setSmokingTruck(smokingTruck === 'return-4' ? null : 'return-4')}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary blur-xl opacity-60 animate-pulse"></div>
                            <AnimatedIcon icon={Truck} size={40} className="text-white relative z-10 drop-shadow-2xl" />
                            {smokingTruck === 'return-4' && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                <div className="smoke-particle"></div>
                                <div className="smoke-particle delay-1"></div>
                                <div className="smoke-particle delay-2"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="glass-effect px-4 py-2.5 rounded-lg border border-green-500/30 text-center bg-green-500/10 w-full max-w-[240px] self-start">
                      <p className="text-base font-bold text-green-400 mb-0.5">Mike</p>
                      <p className="text-sm text-gray-300 mb-0.5">235 mi backhaul</p>
                      <p className="text-sm text-gray-300 mb-0.5">18mi from home</p>
                      <p className="text-xs text-gray-400">Pickup: 12:00 PM</p>
                      <p className="text-xs text-gray-400">Delivery: 3:50 PM</p>
                      <p className="text-xs text-gray-400">Home by 4 PM</p>
                    </div>
                  </div>

                  {/* LA End */}
                  <div className="w-20" />
                </div>
              </div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden space-y-6 relative z-10">
              <div className="space-y-4">
                {mobileSegments.map((segment, idx) => (
                  <div key={idx} className="glass-effect p-4 rounded-xl border border-primary/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">
                          {segment.from} → {segment.to}
                        </p>
                        <p className="text-xs text-gray-400">{segment.driver} | {segment.miles}mi | {segment.handoff} handoff</p>
                        <p className="text-xs text-gray-500">Deadhead: {segment.deadhead} | {segment.homeDistance} from home</p>
                      </div>
                      <AnimatedIcon icon={Truck} size={24} className="text-primary" />
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400">
                        Backhaul: {segment.backhaul} {segment.backhaulNote}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="relative z-10 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div className="glass-effect rounded-lg p-5 border border-green-500/20 bg-green-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <AnimatedIcon icon={UserCheck} size={32} className="text-white" />
                  <span className="text-xl text-green-400 font-bold">Lower Driver Turnover</span>
                </div>
                <div className="text-gray-300 space-y-1">
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-green-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">$12,799 saved/driver annually</span>
                  </div>
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-green-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">48% vs 94% OTR turnover</span>
                  </div>
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-green-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">Drivers home within 24 hours</span>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-lg p-5 border border-green-500/20 bg-green-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <AnimatedIcon icon={Award} size={32} className="text-yellow-400" />
                  <span className="text-xl text-green-400 font-bold">80%+ Asset Utilization</span>
                </div>
                <div className="text-gray-300 space-y-1">
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-green-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">$3,250 saved vs 45% empty</span>
                  </div>
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-green-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">Matched backhauls</span>
                  </div>
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-green-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">30-60min handoffs</span>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-lg p-5 border border-green-500/20 bg-green-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <AnimatedIcon icon={Zap} size={32} className="text-yellow-400" />
                  <span className="text-xl text-green-400 font-bold">Up to 50% Faster Delivery</span>
                </div>
                <div className="text-gray-300 space-y-1">
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-green-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">$216 saved at $0.15/mi</span>
                  </div>
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-green-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">~18 hrs vs 2-3 days</span>
                  </div>
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-green-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">HOS compliant</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Traditional Model Visualization */}
        {showComparison === 'traditional' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="glass-effect rounded-3xl p-8 sm:p-12 relative overflow-hidden max-w-7xl mx-auto border-2 border-red-500/30"
          >
            {/* Background */}
            <div className="absolute inset-0 opacity-5">
              <div className="w-full h-full" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(239, 68, 68, 0.4) 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }} />
            </div>

            {/* Route Info Header */}
            <div className="relative z-10 text-center mb-8">
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2">Los Angeles → Dallas</h3>
              <p className="text-base text-white">1,440 miles  |  1 driver  |  ~22 hours with breaks</p>
            </div>

            {/* Main Visualization */}
            <div className="relative z-10">
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-gradient-to-r from-transparent to-red-500 rounded-full" />
                  <h4 className="text-lg font-bold text-white">Single Driver, Long-Haul Trip</h4>
                  <div className="h-1 flex-1 bg-gradient-to-r from-red-500 to-transparent rounded-full" />
                </div>

                <div className="hidden lg:flex items-center gap-6">
                  {/* LA Origin */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center relative border-4 border-blue-500/30">
                      <AnimatedIcon icon={MapPin} size={32} className="text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">Los Angeles</p>
                      <p className="text-base text-gray-400">Origin</p>
                    </div>
                  </div>

                  {/* Long Journey */}
                  <div className="flex-1 flex flex-col items-center gap-4">
                    <div className="w-full relative">
                      <div className="h-3 bg-gradient-to-r from-red-500/60 to-red-700/60 rounded-full relative border border-red-500/50">
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                          onClick={() => setSmokingTruck(smokingTruck === 'traditional-1' ? null : 'traditional-1')}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary blur-xl opacity-60 animate-pulse"></div>
                            <AnimatedIcon icon={Truck} size={40} className="text-white relative z-10 drop-shadow-2xl" />
                            {smokingTruck === 'traditional-1' && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                <div className="smoke-particle"></div>
                                <div className="smoke-particle delay-1"></div>
                                <div className="smoke-particle delay-2"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="glass-effect px-6 py-2.5 rounded-lg border border-red-500/30 text-center bg-red-500/10 max-w-md">
                      <p className="text-base font-bold text-white mb-0.5">Single Driver Journey</p>
                      <p className="text-sm text-gray-300 mb-0.5">1,440 miles over 2-3 days</p>
                      <p className="text-sm text-gray-400">Pickup: Monday 6:00 AM | Dropoff: Tuesday ~4:00 PM</p>
                      <p className="text-sm text-gray-400">Overnight stop required</p>
                    </div>
                  </div>

                  {/* Dallas Destination */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center border-4 border-red-500/30">
                      <AnimatedIcon icon={MapPin} size={32} className="text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-white">Dallas</p>
                      <p className="text-base text-gray-400">Destination</p>
                    </div>
                  </div>
                </div>

                {/* Mobile view */}
                <div className="lg:hidden glass-effect p-6 rounded-xl border border-red-500/30 bg-red-500/5">
                  <div className="flex items-center gap-4 mb-4">
                    <AnimatedIcon icon={Truck} size={40} className="text-primary" />
                    <div>
                      <p className="text-sm font-bold text-white">Single Driver: LA → Dallas</p>
                      <p className="text-xs text-gray-400">1,440 miles | 2-3 days</p>
                      <p className="text-xs text-gray-500">Pickup: Mon 6:00 AM | Dropoff: Tue ~4:00 PM</p>
                    </div>
                  </div>
                  <p className="text-xs text-red-300">Overnight stop required</p>
                </div>
              </div>

              {/* Return - Usually Empty */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-12 bg-gradient-to-r from-transparent to-red-500/60 rounded-full" />
                  <h4 className="text-lg font-bold text-red-400">Return, Wasted Hours and Miles</h4>
                  <div className="h-1 flex-1 bg-gradient-to-r from-red-500/60 to-transparent rounded-full" />
                </div>

                <div className="hidden lg:flex items-center gap-6 flex-row-reverse">
                  <div className="w-20" />

                  <div className="flex-1 flex flex-col items-center gap-4">
                    <div className="w-full relative">
                      <div className="h-3 bg-gradient-to-l from-red-500/30 to-red-700/30 rounded-full relative border border-red-500/30 border-dashed">
                        <div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60 cursor-pointer"
                          style={{ transform: 'translate(-50%, -50%) scaleX(-1)' }}
                          onClick={() => setSmokingTruck(smokingTruck === 'traditional-2' ? null : 'traditional-2')}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary blur-xl opacity-60 animate-pulse"></div>
                            <AnimatedIcon icon={Truck} size={40} className="text-white relative z-10 drop-shadow-2xl" />
                            {smokingTruck === 'traditional-2' && (
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                <div className="smoke-particle"></div>
                                <div className="smoke-particle delay-1"></div>
                                <div className="smoke-particle delay-2"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="glass-effect px-6 py-2.5 rounded-lg border border-red-500/30 text-center bg-red-500/10 max-w-md">
                      <p className="text-base font-bold text-red-400 mb-0.5">Return Trip</p>
                      <p className="text-sm text-gray-300 mb-0.5">1,440 miles back to LA | 2-3 days</p>
                      <p className="text-sm text-gray-400">Truck sitting idle with costs mounting</p>
                    </div>
                  </div>

                  <div className="w-20" />
                </div>

                {/* Mobile view */}
                <div className="lg:hidden glass-effect p-6 rounded-xl border border-red-500/30 bg-red-500/5">
                  <div className="flex items-center gap-4 mb-4">
                    <AnimatedIcon icon={Truck} size={40} className="text-primary opacity-60" />
                    <div>
                      <p className="text-sm font-bold text-white">Return: Dallas → LA</p>
                      <p className="text-xs text-gray-400">Often 35-55% capacity</p>
                      <p className="text-xs text-gray-500">Pickup: Wed ~10:00 AM | Dropoff: Thu ~8:00 PM</p>
                    </div>
                  </div>
                  <p className="text-xs text-red-300">Truck idle | Costs mounting</p>
                </div>
              </div>
            </div>

            {/* Challenges Cards */}
            <div className="relative z-10 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-effect rounded-lg p-5 border border-red-500/20 bg-red-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <AnimatedIcon icon={Moon} size={32} className="text-purple-400" />
                  <span className="text-xl text-red-400 font-bold">High Driver Turnover</span>
                </div>
                <div className="text-gray-300 space-y-1">
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-red-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">$12,799 cost/driver annually</span>
                  </div>
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-red-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">94% OTR turnover rate</span>
                  </div>
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-red-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">Multi-day trips away from home</span>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-lg p-5 border border-red-500/20 bg-red-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <AnimatedIcon icon={TrendingDown} size={32} className="text-red-400" />
                  <span className="text-xl text-red-400 font-bold">Poor Asset Utilization</span>
                </div>
                <div className="text-gray-300 space-y-1">
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-red-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">45% of miles running empty</span>
                  </div>
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-red-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">Limited backhaul opportunities</span>
                  </div>
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-red-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">Long return times to origin</span>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-lg p-5 border border-red-500/20 bg-red-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <AnimatedIcon icon={Clock} size={32} className="text-orange-400" />
                  <span className="text-xl text-red-400 font-bold">Slower Delivery Times</span>
                </div>
                <div className="text-gray-300 space-y-1">
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-red-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">Lower revenue per mile</span>
                  </div>
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-red-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">10-hr mandatory breaks</span>
                  </div>
                  <div className="flex items-center gap-2 leading-none">
                    <span className="text-red-400 text-4xl flex-shrink-0">▸</span>
                    <span className="text-lg">Higher operational costs</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
