import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, ArrowRight, Layers } from 'lucide-react';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function Chapters() {
  const { subjectId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const chapRes = await axios.get(`/api/subjects/${subjectId}/chapters`);
        setChapters(chapRes.data);

        // Fetch all classes, then their subjects, to find this subject's name
        const clsRes = await axios.get('/api/classes');
        setClassInfo(clsRes.data);

        // Find subject name by fetching subjects for each class until we find ours
        for (const cls of clsRes.data) {
          const subRes = await axios.get(`/api/classes/${cls._id}/subjects`);
          const found = subRes.data.find(s => s._id === subjectId);
          if (found) {
            setSubjectName(found.name);
            break;
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [subjectId]);

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
          <span>{subjectName || 'Chapters'}</span>
        </p>
        <h1 className="page-title">{subjectName || 'Chapters'}</h1>
        <p className="page-subtitle">
          {chapters.length > 0
            ? `${chapters.length} chapter${chapters.length !== 1 ? 's' : ''} available`
            : 'Explore the chapters in this subject.'}
        </p>
      </motion.div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <span className="loading-text">Opening the book…</span>
        </div>
      ) : chapters.length === 0 ? (
        <div className="empty-state">
          <Layers size={48} className="empty-state-icon" />
          <h3>No chapters yet</h3>
          <p>The admin hasn't added any chapters to this subject.</p>
        </div>
      ) : (
        <motion.div
          className="chapters-list"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {chapters.map((chapter, index) => (
            <motion.div key={chapter._id} variants={item}>
              <Link
                to={`/chapters/${chapter._id}`}
                className="chapter-list-item"
              >
                <span className="chapter-item-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="chapter-item-title">{chapter.title}</span>
                <ArrowRight size={16} className="chapter-item-arrow" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
