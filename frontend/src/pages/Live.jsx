import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, ChevronLeft } from 'lucide-react';
import { LIVE_PLAYLISTS } from '../data/livePlaylists';

export default function Live() {
  const [activeClass, setActiveClass] = useState('All');
  const [activeVideo, setActiveVideo] = useState(null);

  // Group or filter by class
  const classes = ['All', ...Array.from(new Set(LIVE_PLAYLISTS.map(p => `Class ${p.classLevel}`)))].sort();
  
  const filteredPlaylists = activeClass === 'All' 
    ? LIVE_PLAYLISTS 
    : LIVE_PLAYLISTS.filter(p => `Class ${p.classLevel}` === activeClass);

  const handlePlay = (playlist) => {
    try {
      const urlObj = new URL(playlist.url);
      const listId = urlObj.searchParams.get('list');
      if (listId) {
        setActiveVideo({
          ...playlist,
          embedUrl: `https://www.youtube.com/embed/videoseries?list=${listId}`
        });
      }
    } catch(e) {
      console.error("Invalid URL");
    }
  };

  return (
    <div className="page-container" style={{ padding: '1.5rem 1.25rem', paddingBottom: '120px' }}>
      <AnimatePresence mode="wait">
        {activeVideo ? (
          <motion.div
            key="player"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}
          >
            <button 
              onClick={() => setActiveVideo(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#FFF',
                border: '1.5px solid #E2E8F0',
                padding: '0.6rem 1rem',
                borderRadius: '30px',
                fontWeight: 700,
                color: '#333',
                cursor: 'pointer',
                width: 'fit-content',
                boxShadow: '0 4px 12px rgba(149, 157, 165, 0.1)'
              }}
            >
              <ChevronLeft size={20} /> Back to Live Classes
            </button>

            <div style={{ background: '#FFF', borderRadius: '24px', padding: '1rem', boxShadow: '0 8px 24px rgba(149, 157, 165, 0.1)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.6rem', background: '#F1F5F9', borderRadius: '10px', color: '#64748B' }}>
                  Class {activeVideo.classLevel}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.6rem', background: '#F0FDF4', borderRadius: '10px', color: '#16A34A' }}>
                  {activeVideo.subject}
                </span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', marginBottom: '1rem' }}>
                {activeVideo.title}
              </h2>
              
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '16px', background: '#000' }}>
                <iframe 
                  src={activeVideo.embedUrl} 
                  title={activeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#A855F7', padding: '0.8rem', borderRadius: '18px', color: '#fff', display: 'flex', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)' }}>
                <PlayCircle size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111' }}>Live Classes</h1>
                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.1rem', fontWeight: 500 }}>Watch all Magic Study Garden videos</p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="subjects-scroll-row" style={{ padding: '0 0 1.5rem 0', gap: '0.75rem', margin: '0 -1.25rem', paddingLeft: '1.25rem', paddingRight: '1.25rem' }}>
              {classes.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveClass(c)}
                  style={{
                    flex: '0 0 auto',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '30px',
                    border: activeClass === c ? '1.5px solid transparent' : '1.5px solid #E2E8F0',
                    background: activeClass === c ? '#A855F7' : '#FFF',
                    color: activeClass === c ? '#FFF' : '#333',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                    boxShadow: activeClass === c ? '0 4px 12px rgba(168, 85, 247, 0.3)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Playlist Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {filteredPlaylists.map((playlist, idx) => {
                // Assign a gradient based on subject
                let gradient = 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)';
                if (playlist.subject === 'Science') gradient = 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)';
                if (playlist.subject === 'English') gradient = 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)';
                
                return (
                  <motion.div
                    key={playlist.id}
                    onClick={() => handlePlay(playlist)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      background: '#FFF',
                      padding: '1.25rem',
                      borderRadius: '24px',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      color: 'inherit',
                      boxShadow: '0 8px 24px rgba(149, 157, 165, 0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                    whileHover={{ y: -4, scale: 1.01, boxShadow: '0 14px 28px rgba(149, 157, 165, 0.15)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div style={{
                      background: gradient,
                      width: '60px',
                      height: '60px',
                      borderRadius: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      flexShrink: 0,
                      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3)'
                    }}>
                      <PlayCircle size={28} />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.6rem', background: '#F1F5F9', borderRadius: '10px', color: '#64748B' }}>
                          Class {playlist.classLevel}
                        </span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.25rem 0.6rem', background: '#F0FDF4', borderRadius: '10px', color: '#16A34A' }}>
                          {playlist.subject}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {playlist.title}
                      </h3>
                      <p style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {playlist.description}
                      </p>
                    </div>
                    
                    <div style={{ color: '#CBD5E1' }}>
                      <PlayCircle size={24} strokeWidth={2.5} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
