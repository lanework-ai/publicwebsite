'use client'

import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Link from 'next/link'

interface BlogPost {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  publishedAt: string
  readTime: string
  mainImage: {
    asset: {
      url: string
    }
    alt?: string
  }
  author: string
  categories: string[]
}

interface BlogFiltersProps {
  posts: BlogPost[]
}

const POSTS_PER_PAGE = 9

export default function BlogFilters({ posts }: BlogFiltersProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [currentPage, setCurrentPage] = useState(1)

  // Get unique categories from posts
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(posts.flatMap(post => post.categories || [])))]
  }, [posts])

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === 'All' ||
        (post.categories && post.categories.includes(selectedCategory))

      return matchesSearch && matchesCategory
    })
  }, [posts, searchQuery, selectedCategory])

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  )

  // Reset to first page and category when searching
  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setSelectedCategory('All') // Always search across all categories
    setCurrentPage(1)
  }

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
  }

  return (
    <div className="w-full">
      {/* Search and Filter Bar */}
      <div ref={ref} className="sm:sticky top-20 bg-[#0a0a0f]/95 backdrop-blur-xl z-40 border-b border-white/10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row gap-4 items-center"
        >
          {/* Search */}
          <div className="w-full lg:flex-1">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full lg:flex-[3] flex flex-wrap gap-2 justify-center lg:justify-end">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
                  selectedCategory === category
                    ? 'bg-primary text-white glow-effect'
                    : 'glass-effect text-gray-300 hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Blog Posts Grid */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage + selectedCategory + searchQuery}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {paginatedPosts.map((post, index) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-effect rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 group cursor-pointer h-full flex flex-col"
              >
                <Link href={`/blog/${post.slug.current}`} className="flex flex-col h-full">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={post.mainImage.asset.url}
                      alt={post.mainImage.alt || post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {post.categories && post.categories.map((category) => (
                        <span
                          key={category}
                          className="inline-block px-3 py-1 text-xs font-bold bg-accent-cyan/90 backdrop-blur-md text-white rounded-lg shadow-lg"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="mx-3 opacity-30">|</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-accent-cyan transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 mb-6 line-clamp-3 leading-relaxed flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                      <span className="text-sm font-medium text-gray-300">{post.author}</span>
                      <div className="flex items-center gap-2 text-accent-cyan font-bold text-sm group-hover:gap-3 transition-all">
                        <span>Read More</span>
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          style={{ fontSize: '20px', lineHeight: '1' }}
                        >
                          →
                        </motion.span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* No Results Message */}
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-2xl text-gray-400">No articles found matching your criteria</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
              }}
              className="mt-6 px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-all transform hover:scale-105 glow-effect"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-4 mt-12"
        >
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-6 py-3 glass-effect rounded-lg text-gray-400 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-12 h-12 rounded-lg font-semibold transition-all ${
                  currentPage === page
                    ? 'bg-primary text-white glow-effect'
                    : 'glass-effect text-gray-400 hover:bg-white/10'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-6 py-3 glass-effect rounded-lg text-gray-400 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </motion.div>
      )}
    </div>
  )
}
