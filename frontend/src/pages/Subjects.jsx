import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight } from 'lucide-react';
import '../mobile-home.css';

const SUBJECT_COLORS = [
  { bg: '#F2C7C7', text: '#333', icon: '📐' },
  { bg: '#FFFFFF', text: '#333', icon: '🧪' },
  { bg: '#D5F3D8', text: '#333', icon: '⚛️' },
  { bg: '#FFB7C5', text: '#333', icon: '🧬' },
];

export default function Subjects() {
  const { classId } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    <div style={{ padding: '1.25rem' }}>
      <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.5rem' }}>
        <Link to="/classes" style={{ color: '#999', textDecoration: 'none' }}>Classes</Link> / {className}
      </p>
      <h2 className="section-title">Subjects</h2>
      
      {loading ? (
        <div style={{ color: '#999' }}>Loading subjects...</div>
      ) : subjects.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
          gap: '1rem', 
          marginTop: '1rem' 
        }}>
          {subjects.map((sub, idx) => {
            const style = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
            return (
              <button 
                key={sub._id} 
                style={{ 
                  backgroundColor: style.bg, 
                  color: style.text,
                  opacity: 1,
                  transform: 'scale(1)',
                  transition: 'all 0.2s ease-in-out',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textAlign: 'center',
                  border: '1.5px solid #111',
                  boxShadow: '2px 2px 0px rgba(0,0,0,1)',
                  borderRadius: '20px',
                  padding: '1rem',
                  height: '130px',
                  cursor: 'pointer',
                  width: '100%'
                }}
                onClick={() => navigate(`/subjects/${sub._id}/chapters`)}
              >
                <div style={{ fontSize: '2rem' }}>{style.icon}</div>
                <div style={{ textTransform: 'capitalize', fontSize: '1rem', fontWeight: 'bold' }}>
                  {sub.name || sub.title || 'Unknown Subject'}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8, display: 'flex', alignItems: 'center' }}>
                  Let's start <ChevronRight size={12} />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ color: '#999', marginTop: '1rem' }}>No subjects available.</div>
      )}
    </div>
  );
}
