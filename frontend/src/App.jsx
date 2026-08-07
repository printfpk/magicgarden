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
import MobileLayout from './components/MobileLayout';
import Test from './pages/Test';
import Bookmarks from './pages/Bookmarks';
import Download from './pages/Download';
import Live from './pages/Live';
import './App.css';

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isHome = location.pathname === '/';

  return (
    <div className="app-container">
      <div className="noise-overlay"></div>
      <CustomCursor />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<MobileLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/classes/:classId/subjects" element={<Subjects />} />
            <Route path="/subjects/:subjectId/chapters" element={<Chapters />} />
            <Route path="/test" element={<Test />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/download" element={<Download />} />
            <Route path="/live" element={<Live />} />
            <Route path="/chapters/:chapterId" element={<ChapterDetail />} />
          </Route>
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
