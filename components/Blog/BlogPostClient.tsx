'use client';

import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import PortableTextRenderer from '@/components/Blog/PortableTextRenderer';
import Image from 'next/image';

interface BlogPostClientProps {
  post: any;
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <Navigation />

      <article className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-accent-cyan hover:text-accent-cyan/80 mb-8 transition-colors text-lg sm:text-xl font-semibold"
          >
            <span className="text-2xl sm:text-3xl">←</span> Back to Blog
          </Link>

          {/* Featured Image */}
          {post.mainImage && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8 rounded-2xl overflow-hidden relative h-96"
            >
              <Image
                src={post.mainImage.asset.url}
                alt={post.mainImage.alt || post.title}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
                priority
              />
            </motion.div>
          )}

          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6">
              {post.categories && post.categories.map((category: string) => (
                <span key={category} className="inline-block px-3 py-1 rounded-full bg-accent-cyan/20 text-accent-cyan font-semibold text-sm mb-4 mr-2">
                  {category}
                </span>
              ))}
              <div className="flex items-center gap-3 text-base text-gray-400 mb-4">
                <span>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }).replace(/\//g, '.')}
                </span>
                <span>|</span>
                <span>{post.readTime?.replace(' read', '')}</span>
                <span>|</span>
                <a
                  href="#author-section"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById('author-section');
                    if (element) {
                      const yOffset = -100;
                      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  className="text-accent-cyan hover:text-accent-cyan/80 underline transition-colors cursor-pointer"
                >
                  {post.author.name}
                </a>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-white leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-gray-300 leading-relaxed italic border-l-4 border-primary pl-6 mb-8">
                {post.excerpt}
              </p>
            )}
          </motion.div>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-12"
          >
            <PortableTextRenderer value={post.body} />
          </motion.div>

          {/* Keywords Section */}
          {post.keywords && post.keywords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-12 pt-8 border-t border-white/10"
            >
              <p className="text-gray-400 mb-4 text-base font-semibold">Key Topics Covered</p>
              <div className="flex flex-wrap gap-3">
                {post.keywords.map((keyword: string, index: number) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="inline-block px-4 py-2 bg-accent-cyan/20 text-accent-cyan font-semibold text-sm rounded-full border border-accent-cyan/40 hover:bg-accent-cyan/30 hover:border-accent-cyan/60 transition-all duration-300"
                  >
                    {keyword}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Author Section */}
          {post.author && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-16 pt-8 border-t border-white/10"
              id="author-section"
            >
              <div className="max-w-2xl">
                <p className="text-gray-400 mb-4 text-lg font-semibold">Written by</p>
                <p className="text-white font-semibold text-2xl mb-2">{post.author.name}</p>
                {post.author.bio && (
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {post.author.bio}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Social Share Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 pt-8 border-t border-white/10"
          >
            <p className="text-gray-400 mb-4 text-lg font-semibold">Share this article</p>
            <div className="flex gap-3">
              <a
                onClick={(e) => {
                  e.preventDefault();
                  const url = typeof window !== 'undefined' ? window.location.href : '';
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                }}
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300 hover:scale-110 cursor-pointer"
                aria-label="Share on Facebook"
                title="Share on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  const url = typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : '';
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
                }}
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300 hover:scale-110 cursor-pointer"
                aria-label="Share on LinkedIn"
                title="Share on LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                </svg>
              </a>
              <a
                onClick={(e) => {
                  e.preventDefault();
                  const url = typeof window !== 'undefined' ? window.location.href : '';
                  const subject = encodeURIComponent(`Check out this article: ${post.title}`);
                  const body = encodeURIComponent(`I thought you'd find this interesting:\n\n${post.title}\n\n${url}`);
                  window.location.href = `mailto:?subject=${subject}&body=${body}`;
                }}
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300 hover:scale-110 cursor-pointer"
                aria-label="Share via Email"
                title="Share via Email"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </article>

      {/* Related Articles Section */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <section className="pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-white">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {post.relatedPosts.map((relatedPost: any) => (
                <Link href={`/blog/${relatedPost.slug.current}`} key={relatedPost._id}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="glass-effect rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 group cursor-pointer h-full"
                  >
                    <div className="relative w-full h-40 overflow-hidden bg-gradient-to-br from-primary/20 to-accent-purple/20">
                      {relatedPost.mainImage && (
                        <Image
                          src={relatedPost.mainImage.asset.url}
                          alt={relatedPost.mainImage.alt || relatedPost.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 300px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {relatedPost.categories && relatedPost.categories[0] && (
                          <span className="text-xs px-3 py-1 rounded-full bg-accent-cyan/20 text-accent-cyan font-semibold">
                            {relatedPost.categories[0]}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(relatedPost.publishedAt).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }).replace(/\//g, '.')}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 text-white line-clamp-2 group-hover:text-accent-cyan transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-accent-cyan font-semibold text-sm">
                        <span>Read More</span>
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          style={{ fontSize: '28px', lineHeight: '1', display: 'block' }}
                        >
                          →
                        </motion.span>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="mb-8 py-8 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-effect rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-primary/20 to-accent-purple/20 border-2 border-primary/50 text-center"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-3 gradient-text">
              Maximize Your Revenue Per Truck
            </h2>
            <p className="text-xl sm:text-2xl text-gray-300 mb-4 mt-3">
              See how Rapid Relay can optimize your long-haul lanes with AI-powered relay operations
            </p>
            <Link
              href="/#demo"
              className="inline-block px-10 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg
                       transition-all duration-300 transform hover:scale-105 glow-effect text-lg"
            >
              Request a Demo
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
