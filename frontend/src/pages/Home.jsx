import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, BookOpen, Star, Video, ArrowUpRight, Layers, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── Animated number counter ── */
function CountUp({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let frame;
    const start = performance.now();
    const duration = 1600;
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * to));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, to]);

  return <span ref={ref}>{val}{suffix}</span>;
}

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.5 } }
};

export default function Home() {
  const containerRef = useRef(null);
  const heroRef      = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  /* Archway mask reveal */
  const maskScale   = useTransform(heroProgress, [0, 0.55], [1, 4.2]);
  const maskRadius  = useTransform(heroProgress, [0, 0.45], ['60% 60% 0 0 / 80% 80% 0 0', '0% 0% 0 0 / 0% 0% 0 0']);
  const imgY        = useTransform(heroProgress, [0, 1], ['0%', '28%']);

  /* Title parallax */
  const textX1      = useTransform(heroProgress, [0, 0.45], ['0%', '-22%']);
  const textX2      = useTransform(heroProgress, [0, 0.45], ['0%', '22%']);
  const textOpacity = useTransform(heroProgress, [0, 0.3],  [1, 0]);

  /* Marquee scroll-driven */
  const marqueeX    = useTransform(scrollYProgress, [0, 1], ['0%', '-38%']);

  return (
    <motion.div
      ref={containerRef}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="aww-home"
    >
      {/* ─── 1. HERO ─────────────────────────────── */}
      <section className="aww-hero" ref={heroRef}>
        <div className="aww-hero-text">
          <motion.div
            className="aww-eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15 }}
          >
            <span className="aww-eyebrow-dot"></span>
            Classes I – X &nbsp;·&nbsp; All Subjects
          </motion.div>

          <div className="aww-title-wrap">
            <motion.h1
              className="aww-title-line"
              style={{ x: textX1, opacity: textOpacity }}
              initial={{ opacity: 0, x: '-6%' }}
              animate={{ opacity: 1, x: '0%' }}
              transition={{ duration: 1.3, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              MAGIC
            </motion.h1>
            <motion.h1
              className="aww-title-line aww-title-indent"
              style={{ x: textX2, opacity: textOpacity }}
              initial={{ opacity: 0, x: '6%' }}
              animate={{ opacity: 1, x: '0%' }}
              transition={{ duration: 1.3, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              STUDY
            </motion.h1>
            <motion.h1
              className="aww-title-line italic-serif text-gold"
              style={{ opacity: textOpacity }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.3, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              Garden
            </motion.h1>
          </div>
        </div>

        {/* Archway image mask */}
        <motion.div
          className="aww-hero-mask"
          style={{ scale: maskScale, borderRadius: maskRadius }}
        >
          <motion.img
            src="/hero-image.png"
            alt="Ethereal magical garden"
            className="aww-hero-img"
            style={{ y: imgY }}
            initial={{ scale: 1.18, opacity: 0 }}
            animate={{ scale: 1,    opacity: 1 }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="aww-hero-grad"></div>
        </motion.div>

        {/* Bottom strip */}
        <motion.div
          className="aww-hero-bottom"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <p className="aww-hero-desc">
            An ethereal sanctuary of highly curated academic wisdom — designed for mastery.
          </p>
          <Link to="/classes" className="aww-btn-pill" data-cursor="hover">
            Begin Journey <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* ─── 2. MARQUEE ──────────────────────────── */}
      <div className="aww-marquee-outer">
        <motion.div className="aww-marquee-track" style={{ x: marqueeX }}>
          {Array(7).fill(null).map((_, i) => (
            <span key={i} className="aww-marquee-item">
              ✦ Curated Wisdom &nbsp; ✦ Magical Lore &nbsp; ✦ Enchanted Academia &nbsp; ✦ Classes I–X &nbsp; ✦ Expert Notes &nbsp;
            </span>
          ))}
        </motion.div>
      </div>

      {/* ─── 3. STATS ROW ────────────────────────── */}
      <section className="aww-stats">
        {[
          { icon: Layers,   value: 10,  suffix: '+', label: 'Classes'     },
          { icon: BookOpen, value: 50,  suffix: '+', label: 'Subjects'    },
          { icon: Star,     value: 500, suffix: '+', label: 'Chapters'    },
          { icon: Clock,    value: 100, suffix: '%', label: 'Free Access' },
        ].map(({ icon: Icon, value, suffix, label }, i) => (
          <motion.div
            key={i}
            className="aww-stat-item"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Icon size={20} className="aww-stat-icon" />
            <div className="aww-stat-number"><CountUp to={value} suffix={suffix} /></div>
            <div className="aww-stat-label">{label}</div>
          </motion.div>
        ))}
      </section>

      {/* ─── 4. BENTO GRID ───────────────────────── */}
      <section className="aww-bento-section" id="about">
        <div className="aww-bento-header">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            The Arcane<br /><em>Advantage</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            Elevate your understanding through our meticulously crafted scholastic enchantments — built for every kind of learner.
          </motion.p>
        </div>

        <div className="aww-bento-grid">
          {/* BIG CARD */}
          <motion.div
            className="aww-bento-item aww-bento-main"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            data-cursor="view"
          >
            <div className="aww-bento-shimmer"></div>
            <div className="aww-bento-blob"></div>
            <div className="aww-bento-body">
              <span className="aww-bento-tag">Core Feature</span>
              <BookOpen size={38} className="aww-bento-icon" />
              <h3>Curated Wisdom</h3>
              <p>Expert-crafted summaries and notes that turn complexity into clarity. Every chapter, every concept — mastered effortlessly.</p>
              <Link to="/classes" className="aww-bento-link">
                Explore chapters <ArrowUpRight size={14} />
              </Link>
            </div>
          </motion.div>

          {/* TALL CARD */}
          <motion.div
            className="aww-bento-item aww-bento-tall"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="aww-bento-shimmer"></div>
            <div className="aww-bento-body">
              <span className="aww-bento-tag">Q&amp;A Vault</span>
              <Star size={32} className="aww-bento-icon" />
              <h3>Interactive Lore</h3>
              <p>Curated question banks designed to test, challenge, and reinforce your understanding of every subject.</p>
            </div>
          </motion.div>

          {/* WIDE BOTTOM */}
          <motion.div
            className="aww-bento-item aww-bento-wide"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="aww-bento-shimmer"></div>
            <div className="aww-bento-body">
              <span className="aww-bento-tag">Media Library</span>
              <Video size={28} className="aww-bento-icon" />
              <h3>Visual Enchantments</h3>
              <p>PDF downloads &amp; video lessons for every chapter.</p>
            </div>
          </motion.div>

          {/* ACCENT CARD */}
          <motion.div
            className="aww-bento-item aww-bento-accent"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="aww-bento-body aww-bento-body--center">
              <span className="aww-bento-big-num">100%</span>
              <p>Free for all students</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 5. CTA ──────────────────────────────── */}
      <section className="aww-cta">
        <motion.div
          className="aww-cta-inner"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="aww-cta-glow"></div>
          <div className="aww-cta-content">
            <span className="aww-cta-eyebrow">Ready to Begin?</span>
            <h2>Step into the Garden</h2>
            <p>Join students discovering a better way to learn. Browse all classes — completely free.</p>
            <Link to="/classes" className="aww-cta-btn" data-cursor="hover">
              Browse All Classes <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── 6. FOOTER ───────────────────────────── */}
      <footer className="aww-footer">
        <div className="aww-footer-top">
          <h2>Magic Study<br /><em>Garden</em></h2>
          <div className="aww-footer-nav">
            <Link to="/classes">Classes</Link>
            <a href="#about">About</a>
            <Link to="/admin">Admin</Link>
          </div>
        </div>
        <div className="aww-footer-bottom">
          <p>Illuminating minds, one chapter at a time.</p>
          <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </motion.div>
  );
}
