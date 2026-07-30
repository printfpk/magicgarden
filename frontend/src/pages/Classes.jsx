import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight } from 'lucide-react';
import '../mobile-home.css';

const CLASS_COLORS = [
  { bg: '#E35336', text: '#FFF' },
  { bg: '#F5F5DC', text: '#333' },
  { bg: '#F4A460', text: '#FFF' },
  { bg: '#A0522D', text: '#FFF' }
];

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/classes')
      .then(res => setClasses(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '1.25rem' }}>
      <h2 className="section-title">Curriculum</h2>
      
      {loading ? (
        <div style={{ color: '#999' }}>Loading classes...</div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
          gap: '1rem', 
          marginTop: '1rem' 
        }}>
          {classes.map((cls, idx) => {
            const style = CLASS_COLORS[idx % CLASS_COLORS.length];
            return (
              <button 
                key={cls._id} 
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
                onClick={() => navigate(`/classes/${cls._id}/subjects`)}
              >
                <div style={{ fontSize: '2rem' }}>🎓</div>
                <div style={{ textTransform: 'capitalize', fontSize: '1rem', fontWeight: 'bold' }}>
                  {cls.name}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8, display: 'flex', alignItems: 'center' }}>
                  Class {cls.level} <ChevronRight size={12} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
