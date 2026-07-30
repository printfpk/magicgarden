import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, AlarmClock, Bookmark, Home as HomeIcon, PlaySquare, FolderDown, FileText } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import '../mobile-home.css';

export default function MobileLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [alarmsOpen, setAlarmsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <div className="mobile-home-container">
      {/* TOP BAR */}
      <header className="mobile-header" style={{ position: 'relative' }}>
        <button className="icon-btn" style={{ color: '#FF7E67' }} onClick={() => { setMenuOpen(!menuOpen); setAlarmsOpen(false); setNotificationsOpen(false); }}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        <div className="header-right-icons" style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
          <button className="icon-btn text-purple" onClick={() => { setAlarmsOpen(!alarmsOpen); setNotificationsOpen(false); setMenuOpen(false); }}>
            <AlarmClock size={24} />
          </button>
          <button className="icon-btn text-purple relative" onClick={() => { setNotificationsOpen(!notificationsOpen); setAlarmsOpen(false); setMenuOpen(false); }}>
            <Bell size={24} />
            <span className="notification-dot"></span>
          </button>

          <AnimatePresence>
            {alarmsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: '40px',
                  backgroundColor: '#FFF',
                  borderRadius: '12px',
                  boxShadow: '4px 4px 0px rgba(0,0,0,1)',
                  border: '1.5px solid #111',
                  padding: '1.25rem',
                  zIndex: 1000,
                  minWidth: '220px'
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#111' }}>Alarms</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>No upcoming alarms.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: '0',
                  backgroundColor: '#FFF',
                  borderRadius: '12px',
                  boxShadow: '4px 4px 0px rgba(0,0,0,1)',
                  border: '1.5px solid #111',
                  padding: '1.25rem',
                  zIndex: 1000,
                  minWidth: '220px'
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#111' }}>Notifications</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>You're all caught up!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute',
                top: '70px',
                left: '1.25rem',
                backgroundColor: '#FFF',
                borderRadius: '12px',
                boxShadow: '4px 4px 0px rgba(0,0,0,1)',
                border: '1.5px solid #111',
                padding: '1rem',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                minWidth: '200px'
              }}
            >
              <Link to="/classes" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setMenuOpen(false)}>
                <FolderDown size={18} /> Curriculum
              </Link>
              <a href="/#about" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setMenuOpen(false)}>
                <FileText size={18} /> The Garden
              </a>
              <Link to="/admin" style={{ textDecoration: 'none', color: '#A855F7', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setMenuOpen(false)}>
                <PlaySquare size={18} /> Admin Portal
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MAIN CONTENT OUTLET */}
      <main className="mobile-main-content">
        <Outlet />
        
        {/* Spacer for bottom nav */}
        <div style={{ height: '100px' }}></div>
      </main>

      {/* BOTTOM NAV */}
      <nav className="mobile-bottom-nav">
        <Link to="/test" className="nav-item" style={{ color: isActive('/test') ? '#A855F7' : 'inherit', textDecoration: 'none' }}>
          <FileText size={20} />
          <span>Test</span>
        </Link>
        <Link to="/bookmarks" className="nav-item" style={{ color: isActive('/bookmarks') ? '#A855F7' : 'inherit', textDecoration: 'none' }}>
          <Bookmark size={20} />
          <span>Bookmarks</span>
        </Link>
        
        <div className="nav-item-center-wrap">
          <Link to="/" className="nav-item-center" style={{ backgroundColor: isActive('/') ? '#9333EA' : '#A855F7' }}>
            <HomeIcon size={24} color="#FFF" />
          </Link>
        </div>

        <Link to="/download" className="nav-item" style={{ color: isActive('/download') ? '#A855F7' : 'inherit', textDecoration: 'none' }}>
          <FolderDown size={20} />
          <span>Download</span>
        </Link>
        <Link to="/live" className="nav-item" style={{ color: isActive('/live') ? '#A855F7' : 'inherit', textDecoration: 'none' }}>
          <PlaySquare size={20} />
          <span>Live</span>
        </Link>
      </nav>
    </div>
  );
}
