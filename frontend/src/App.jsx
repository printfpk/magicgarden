import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Classes from './pages/Classes';
import Subjects from './pages/Subjects';
import Chapters from './pages/Chapters';
import ChapterDetail from './pages/ChapterDetail';
import Admin from './pages/Admin';
import './App.css';

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      <div className="noise-overlay"></div>
      <CustomCursor />
      {!isAdmin && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/classes/:classId/subjects" element={<Subjects />} />
          <Route path="/subjects/:subjectId/chapters" element={<Chapters />} />
          <Route path="/chapters/:chapterId" element={<ChapterDetail />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
