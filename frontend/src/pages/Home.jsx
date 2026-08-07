import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, AlarmClock, Bookmark, Home as HomeIcon, PlaySquare, FolderDown, FileText, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../mobile-home.css';

const SUBJECT_COLORS = [
  { bg: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', text: '#333', icon: '📐' },
  { bg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', text: '#333', icon: '🧪' },
  { bg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', text: '#333', icon: '⚛️' },
  { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', text: '#333', icon: '🧬' },
];

const CLASS_COLORS = [
  { bg: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', text: '#FFF' },
  { bg: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)', text: '#FFF' },
  { bg: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)', text: '#FFF' },
  { bg: 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)', text: '#FFF' }
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [activeSubject, setActiveSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const clsRes = await axios.get('/api/classes');
        setClasses(clsRes.data);
        if (clsRes.data.length > 0) {
          const firstClass = clsRes.data[0];
          setActiveClass(firstClass);
          
          const subRes = await axios.get(`/api/classes/${firstClass._id}/subjects`);
          setSubjects(subRes.data);
          
          if (subRes.data.length > 0) {
            setActiveSubject(subRes.data[0]);
            const chapRes = await axios.get(`/api/subjects/${subRes.data[0]._id}/chapters`);
            setChapters(chapRes.data);
          } else {
            setChapters([]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleClassClick = async (cls) => {
    setActiveClass(cls);
    setActiveSubject(null);
    setChapters([]);
    try {
      const subRes = await axios.get(`/api/classes/${cls._id}/subjects`);
      setSubjects(subRes.data);
      if (subRes.data.length > 0) {
        setActiveSubject(subRes.data[0]);
        const chapRes = await axios.get(`/api/subjects/${subRes.data[0]._id}/chapters`);
        setChapters(chapRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubjectClick = async (subject) => {
    setActiveSubject(subject);
    try {
      const res = await axios.get(`/api/subjects/${subject._id}/chapters`);
      setChapters(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
        {/* CLASSES */}
        <section className="classes-section">
          <h2 className="section-title">All Classes</h2>
          <div className="subjects-scroll-row">
            {loading ? (
              [1, 2, 3, 4].map(n => (
                <div key={`cls-skel-${n}`} className="skeleton-card">
                  <div className="skeleton-icon"></div>
                  <div>
                    <div className="skeleton-text" style={{ marginBottom: '6px' }}></div>
                    <div className="skeleton-text short"></div>
                  </div>
                </div>
              ))
            ) : classes.length > 0 ? (
              classes.map((cls, idx) => {
                const isActive = activeClass?._id === cls._id;
                const style = CLASS_COLORS[idx % CLASS_COLORS.length];
                return (
                  <button 
                    key={cls._id} 
                    className={`subject-card ${isActive ? 'active' : ''}`}
                    style={{ 
                      background: style.bg, 
                      color: style.text
                    }}
                    onClick={() => handleClassClick(cls)}
                  >
                    <div className="subject-icon-wrap" style={{ fontSize: '1.5rem' }}>🎓</div>
                    <div className="subject-name">{cls.name}</div>
                    <div className="subject-start">Class {cls.level} <ChevronRight size={12} /></div>
                  </button>
                );
              })
            ) : (
              <div style={{ padding: '1rem', color: '#999' }}>No classes found.</div>
            )}
          </div>
        </section>

        {/* SUBJECTS */}
        <section className="subjects-section" style={{ marginTop: '1rem' }}>
          <h2 className="section-title">Subjects</h2>
          
          <div className="subjects-scroll-row">
            {loading ? (
              [1, 2, 3, 4].map(n => (
                <div key={`sub-skel-${n}`} className="skeleton-card" style={{ alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <div className="skeleton-icon" style={{ width: '40px', height: '40px' }}></div>
                  <div className="skeleton-text" style={{ width: '80%' }}></div>
                </div>
              ))
            ) : subjects.length > 0 ? (
              subjects.map((sub, idx) => {
                const style = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
                const isActive = activeSubject?._id === sub._id;
                return (
                  <button 
                    key={sub._id} 
                    className={`subject-card ${isActive ? 'active' : ''}`}
                    style={{ 
                      background: style.bg,
                      color: '#111',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '0.5rem',
                      textAlign: 'center'
                    }}
                    onClick={() => handleSubjectClick(sub)}
                  >
                    <div className="subject-icon-wrap" style={{ fontSize: '2rem' }}>{style.icon}</div>
                    <div className="subject-name" style={{ textTransform: 'capitalize', fontSize: '1rem', fontWeight: 'bold', whiteSpace: 'normal', overflow: 'visible' }}>
                      {sub.name || sub.title || 'Unknown'}
                    </div>
                  </button>
                );
              })
            ) : (
              <div style={{ padding: '1rem', color: '#999' }}>No subjects found.</div>
            )}
          </div>
        </section>

        {/* CHAPTERS */}
        <section className="chapters-section">
          {loading ? (
            <div className="chapters-list">
              {[1, 2, 3, 4].map(n => (
                <div key={`chap-skel-${n}`} className="skeleton-chapter">
                  <div className="skeleton-text short" style={{ height: '16px', marginBottom: '8px' }}></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text" style={{ width: '80%' }}></div>
                </div>
              ))}
            </div>
          ) : chapters.length > 0 ? (
            <div className="chapters-list">
              {chapters.map((chap, idx) => (
                <Link to={`/chapters/${chap._id}`} key={chap._id} className="chapter-card">
                  <div className="chapter-info">
                    <h3>Chapter: {String(chap.order || idx + 1).padStart(2, '0')}</h3>
                    <p className="chapter-desc">{chap.title}</p>
                    {chap.summary && <p className="chapter-sub-desc">{chap.summary.substring(0, 50)}...</p>}
                  </div>
                  <div className="chapter-bookmark">
                    <Bookmark size={28} color="#9333EA" fill="#9333EA" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
              No chapters available for this subject.
            </div>
          )}
      </section>
    </>
  );
}
