import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowUpRight, BookOpen } from 'lucide-react';

// Assign a gradient per class level for visual variety
const GRADIENTS = [
  'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 60%)',
  'linear-gradient(135deg, rgba(42,110,84,0.1) 0%, transparent 60%)',
  'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 60%)',
  'linear-gradient(135deg, rgba(236,72,153,0.07) 0%, transparent 60%)',
  'linear-gradient(135deg, rgba(59,130,246,0.07) 0%, transparent 60%)',
  'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, transparent 60%)',
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/classes')
      .then(res => setClasses(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="page-header"
      >
        <p className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Curriculum</span>
        </p>
        <h1 className="page-title">Choose Your Class</h1>
        <p className="page-subtitle">Select a class to explore its subjects and chapters.</p>
      </motion.div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">Summoning classes…</span>
        </div>
      ) : classes.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} className="empty-state-icon" />
          <h3>No classes yet</h3>
          <p>The admin hasn't added any classes to the garden.</p>
        </div>
      ) : (
        <motion.div
          className="classes-grid"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {classes.map((cls, index) => (
            <motion.div key={cls._id} variants={item}>
              <Link
                to={`/classes/${cls._id}/subjects`}
                className="class-card"
                style={{ background: GRADIENTS[index % GRADIENTS.length] }}
              >
                <span className="class-card-number">{cls.level}</span>
                <div className="class-card-content">
                  <p className="class-card-label">Class {cls.level}</p>
                  <h2 className="class-card-name">{cls.name}</h2>
                </div>
                <ArrowUpRight size={20} className="class-card-arrow" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
