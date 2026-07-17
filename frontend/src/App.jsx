import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Classes from './pages/Classes';
import Subjects from './pages/Subjects';
import Chapters from './pages/Chapters';
import ChapterDetail from './pages/ChapterDetail';
import Admin from './pages/Admin';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <div className="noise-overlay"></div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/classes/:classId/subjects" element={<Subjects />} />
        <Route path="/subjects/:subjectId/chapters" element={<Chapters />} />
        <Route path="/chapters/:chapterId" element={<ChapterDetail />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
