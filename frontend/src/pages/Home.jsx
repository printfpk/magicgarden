import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight, BookOpen, Star, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { scrollY } = useScroll();
  const yImage = useTransform(scrollY, [0, 500], [0, 100]);
  const opacityImage = useTransform(scrollY, [0, 300], [1, 0.4]);

  return (
    <>
      <main className="hero">
        <div className="hero-content">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Sparkles size={14} className="badge-icon" />
            <span>Curated Wisdom for Classes I — X</span>
          </motion.div>
          
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            Magic Study <br/>
            <span className="italic-serif">Garden</span>
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Step into a beautifully curated sanctuary of knowledge. Master your subjects with enchanted summaries, expert questions, and multimedia wisdom.
          </motion.p>
          
          <motion.div 
            className="hero-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
          >
            <Link to="/classes" className="btn-primary">
              Begin Journey <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
        
        <div className="hero-image-wrapper">
          <motion.div 
            className="hero-image-container"
            style={{ y: yImage, opacity: opacityImage }}
            initial={{ filter: "blur(20px)", scale: 1.1, opacity: 0 }}
            animate={{ filter: "blur(0px)", scale: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src="/hero-image.png" alt="Magical glowing book in a forest" className="hero-img" />
            <div className="image-vignette"></div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section className="features-section" id="about">
        <div className="section-header">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            The Arcane Advantage
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            Discover the secrets that make our garden the most prestigious place to master your curriculum.
          </motion.p>
        </div>

        <div className="features-grid">
          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <BookOpen className="feature-icon" />
            <h3>Curated Wisdom</h3>
            <p>Masterfully crafted chapter summaries and notes that distill complex concepts into pure knowledge.</p>
          </motion.div>
          
          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Star className="feature-icon" />
            <h3>Interactive Lore</h3>
            <p>Engage with our curated Question and Answer vaults to test your understanding of every subject.</p>
          </motion.div>

          <motion.div 
            className="feature-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Shield className="feature-icon" />
            <h3>Visual Enchantments</h3>
            <p>Supplement your reading with high-quality PDF downloads and integrated video lessons.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h2>M. Garden</h2>
            <p>Illuminating minds, one chapter at a time.</p>
          </div>
          <div className="footer-links">
            <Link to="/classes">Classes</Link>
            <a href="#about">About</a>
            <Link to="/admin">Admin Portal</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Magic Study Garden. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Scroll indicator */}
      <motion.div 
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <div className="scroll-line"></div>
      </motion.div>
    </>
  );
}
