'use client';

import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const lastMouseMoveRef = React.useRef(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseMoveRef.current > 50) {
        lastMouseMoveRef.current = now;
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="pt-24 sm:pt-28 lg:pt-32 relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Interactive mouse follower glow */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(77, 101, 255, 0.15), transparent 80%)`,
        }}
      />

      {/* Animated background grid */}
      <div
        className="absolute inset-0 grid-background opacity-50"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl animate-pulse-slow"
           style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 leading-tight text-balance">
            <span className="block text-white">Relay as a Service for</span>
            <span className="block gradient-text mt-2 pb-1">Modern Trucking</span>
          </h1>
        </motion.div>

        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Transform long-haul lanes into coordinated regional relay trips.
          <span className="block mt-2">Faster transit. Higher asset utilization. Stable driver schedules.</span>
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <a
            href="#demo"
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg
                     transition-all duration-300 transform hover:scale-105 glow-effect text-base md:text-lg"
          >
            Request a Demo
          </a>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 glass-effect text-white font-semibold rounded-lg
                     hover:bg-white/10 transition-all duration-300 text-base md:text-lg"
          >
            See How It Works
          </a>
        </motion.div>
      </div>
    </section>
  );
}
