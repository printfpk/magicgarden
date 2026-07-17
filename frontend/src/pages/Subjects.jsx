import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  FlaskConical, BookOpen, Calculator, Globe, Music, Palette,
  Microscope, Leaf, Landmark, Code, ArrowUpRight, Library
} from 'lucide-react';

// Cycle through icons and accent colors
const SUBJECT_ICONS = [
  { icon: BookOpen, color: '#D4AF37' },
  { icon: FlaskConical, color: '#3d9e7a' },
  { icon: Calculator, color: '#818cf8' },
  { icon: Globe, color: '#38bdf8' },
  { icon: Microscope, color: '#f472b6' },
  { icon: Leaf, color: '#4ade80' },
  { icon: Landmark, color: '#fb923c' },
  { icon: Music, color: '#c084fc' },
  { icon: Palette, color: '#f87171' },
  { icon: Code, color: '#34d399' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

export default function Subjects() {
  const { classId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch subjects + class name in parallel
    const fetchSubjects = axios.get(`/api/classes/${classId}/subjects`);
    const fetchClasses = axios.get('/api/classes');

    Promise.all([fetchSubjects, fetchClasses])
      .then(([subRes, clsRes]) => {
        setSubjects(subRes.data);
        const cls = clsRes.data.find(c => c._id === classId);
        if (cls) setClassName(cls.name);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [classId]);

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
          <Link to="/classes">Curriculum</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{className || 'Subjects'}</span>
        </p>
        <h1 className="page-title">{className || 'Subjects'}</h1>
        <p className="page-subtitle">Choose a subject to explore its chapters.</p>
      </motion.div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">Unveiling subjects…</span>
        </div>
      ) : subjects.length === 0 ? (
        <div className="empty-state">
          <Library size={48} className="empty-state-icon" />
          <h3>No subjects yet</h3>
          <p>No subjects have been added to this class.</p>
        </div>
      ) : (
        <motion.div
          className="subjects-grid"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {subjects.map((sub, index) => {
            const { icon: Icon, color } = SUBJECT_ICONS[index % SUBJECT_ICONS.length];
            return (
              <motion.div key={sub._id} variants={item}>
                <Link
                  to={`/subjects/${sub._id}/chapters`}
                  className="subject-card"
                  style={{ '--subject-color': color }}
                >
                  <div className="subject-card-icon">
                    <Icon size={22} />
                  </div>
                  <h2 className="subject-card-name">{sub.name}</h2>
                  <p className="subject-card-meta">View chapters →</p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
