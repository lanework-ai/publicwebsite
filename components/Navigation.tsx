'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/who-we-serve', label: 'Who We Serve' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/research', label: 'Research' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const lastScrollTimeRef = useRef(0);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTimeRef.current > 150) {
        lastScrollTimeRef.current = now;
        setScrolled(window.scrollY > 50);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-[60] transition-all duration-300"
      style={{
        background: scrolled
          ? 'linear-gradient(135deg, rgba(10, 10, 15, 0.98) 0%, rgba(35, 87, 132, 0.15) 50%, rgba(10, 10, 15, 0.98) 100%)'
          : 'linear-gradient(135deg, rgba(10, 10, 15, 1) 0%, rgba(35, 87, 132, 0.08) 50%, rgba(10, 10, 15, 1) 100%)',
        backdropFilter: scrolled ? 'blur(12px)' : 'blur(4px)',
        borderBottom: '1px solid rgba(64, 168, 196, 0.1)',
        boxShadow: scrolled ? '0 4px 20px rgba(35, 87, 132, 0.15)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center group h-full overflow-hidden max-h-20 -ml-6 sm:-ml-10 z-20" aria-label="Rapid Relay Home">
            <img
              src="/rapid-relay-logo.png"
              alt="Rapid Relay - Modern Trucking Solutions"
              width="780"
              height="200"
              className="h-40 md:h-52 w-auto transition-all duration-300 brightness-125 contrast-125 group-hover:brightness-110 group-hover:contrast-100"
            />
          </a>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-6 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative inline-block px-2 py-2 text-white text-sm xl:text-base font-bold uppercase tracking-wide group whitespace-nowrap"
                >
                  <span className={`relative z-10 transition-colors duration-300 ${active ? 'text-accent-cyan' : 'group-hover:text-accent-cyan'}`}>
                    {link.label}
                  </span>
                  {/* Animated underline - always visible when active */}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-accent-cyan transition-all duration-300 ease-out ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  {/* Glow effect */}
                  <span className={`absolute inset-0 bg-gradient-to-r from-primary/0 via-accent-cyan/20 to-primary/0 blur-lg transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                </a>
              );
            })}
          </div>

          {/* CTA Button - Right aligned */}
          <div className="hidden lg:flex items-center">
            <a
              href="/#demo"
              className="group relative inline-flex items-center gap-2 px-6 py-3 font-bold text-sm uppercase tracking-wide rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 shadow-lg border-2"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(35, 87, 132, 0.3) 50%, rgba(10, 10, 15, 0.95) 100%)',
                borderColor: '#40a8c4',
                boxShadow: '0 4px 20px rgba(64, 168, 196, 0.4), inset 0 1px 0 rgba(64, 168, 196, 0.2)',
              }}
            >
              <span className="relative z-10" style={{ color: '#40a8c4' }}>Calculate Savings</span>
              <svg className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="#40a8c4" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {/* Hover glow effect */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: 'linear-gradient(135deg, rgba(64, 168, 196, 0.1) 0%, rgba(64, 168, 196, 0.2) 50%, rgba(64, 168, 196, 0.1) 100%)',
                boxShadow: 'inset 0 0 20px rgba(64, 168, 196, 0.3)',
              }} />
              {/* Animated shine effect */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-[#40a8c4]/30 to-transparent skew-x-12" />
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors ml-auto z-20"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-white transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-full h-0.5 bg-white transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-full h-0.5 bg-white transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden pb-6 border-t border-white/10"
            id="mobile-menu"
          >
            <div className="flex flex-col gap-1 pt-4">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`font-medium text-base transition-colors py-3 px-2 rounded ${
                      active
                        ? 'text-accent-cyan bg-white/10 border-l-2 border-accent-cyan'
                        : 'text-white/90 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
              <a
                href="/#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="group relative px-6 py-3 bg-gradient-to-r from-primary via-[#2a6f9e] to-accent-cyan text-white font-bold rounded-lg
                         transition-all duration-300 text-center mt-3 overflow-hidden
                         shadow-[0_4px_14px_0_rgba(6,182,212,0.25)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.4)]
                         border border-accent-cyan/20 hover:border-accent-cyan/40
                         transform hover:scale-[1.02]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Calculate Savings
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                {/* Animated shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
