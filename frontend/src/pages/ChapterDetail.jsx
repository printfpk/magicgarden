import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  FileText, PlayCircle, BookOpen, List, HelpCircle,
  ExternalLink, ChevronDown, Dot, Clock, MessageSquare, StickyNote
} from 'lucide-react';

const TABS = [
  { id: 'summary', label: 'Summary', icon: BookOpen },
  { id: 'notes', label: 'Short Notes', icon: StickyNote },
  { id: 'qa', label: 'Q & A', icon: HelpCircle },
  { id: 'resources', label: 'Resources', icon: ExternalLink },
];

function QAItem({ qa, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`qa-item ${open ? 'open' : ''}`}>
      <div className="qa-question" onClick={() => setOpen(!open)}>
        <span className="qa-q-number">Q{index + 1}.</span>
        <span className="qa-q-text">{qa.question}</span>
        <ChevronDown size={16} className={`qa-chevron ${open ? 'open' : ''}`} />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="qa-answer"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="qa-answer-inner">{qa.answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChapterDetail() {
  const { chapterId } = useParams();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    axios.get(`/api/chapters/${chapterId}`)
      .then(res => setChapter(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [chapterId]);

  if (loading) {
    return (
      <div className="loading-container" style={{ paddingTop: '12rem' }}>
        <div className="loading-spinner" />
        <span className="loading-text">Reading scrolls…</span>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h3>Chapter not found</h3>
        </div>
      </div>
    );
  }

  const hasNotes = chapter.shortNotes && chapter.shortNotes.length > 0;
  const hasQA = chapter.questions && chapter.questions.length > 0;
  const hasResources = chapter.pdfLink || chapter.youtubeLink;

  const visibleTabs = TABS.filter(tab => {
    if (tab.id === 'notes') return hasNotes;
    if (tab.id === 'qa') return hasQA;
    if (tab.id === 'resources') return hasResources;
    return true;
  });

  return (
    <div className="page-container" style={{ paddingTop: '8rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="chapter-detail-layout"
      >
        {/* Main Content */}
        <div className="chapter-detail-main">
          {/* Chapter Header */}
          <div className="chapter-meta-header">
            <p className="chapter-breadcrumb">
              <Link to="/classes">Curriculum</Link>
              <span style={{ margin: '0 0.5rem', color: 'var(--text-faint)' }}>/</span>
              {chapter.subjectId && (
                <>
                  <span style={{ color: 'var(--text-muted)' }}>{chapter.subjectId.name}</span>
                  <span style={{ margin: '0 0.5rem', color: 'var(--text-faint)' }}>/</span>
                </>
              )}
              <span style={{ color: 'var(--text-faint)' }}>{chapter.title}</span>
            </p>

            {chapter.subjectId && (
              <div className="subject-tag">
                <BookOpen size={11} />
                {chapter.subjectId.name}
              </div>
            )}

            <h1 className="chapter-main-title">{chapter.title}</h1>
          </div>

          {/* Tabs */}
          <div className="chapter-tabs">
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`chapter-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Panels */}
          <AnimatePresence mode="wait">
            {activeTab === 'summary' && (
              <motion.div
                key="summary"
                className="tab-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {chapter.summary ? (
                  <div className="summary-content">
                    {chapter.summary.split('\n\n').map((para, i) => (
                      <p key={i} style={{ marginBottom: i < chapter.summary.split('\n\n').length - 1 ? '1.25rem' : 0 }}>
                        {para}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>
                      No summary has been written for this chapter yet.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'notes' && (
              <motion.div
                key="notes"
                className="tab-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="short-notes-list">
                  {chapter.shortNotes.map((note, i) => (
                    <div key={i} className="short-note-item">
                      <Dot size={20} className="note-bullet" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'qa' && (
              <motion.div
                key="qa"
                className="tab-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="qa-accordion">
                  {chapter.questions.map((qa, i) => (
                    <QAItem key={i} qa={qa} index={i} />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'resources' && (
              <motion.div
                key="resources"
                className="tab-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="resources-grid">
                  {chapter.pdfLink && (
                    <a
                      href={chapter.pdfLink}
                      target="_blank"
                      rel="noreferrer"
                      className="resource-card"
                    >
                      <div className="resource-card-icon pdf">
                        <FileText size={20} />
                      </div>
                      <div className="resource-card-info">
                        <h4>PDF Notes</h4>
                        <p>Download and read offline</p>
                      </div>
                      <ExternalLink size={16} className="resource-card-arrow" />
                    </a>
                  )}
                  {chapter.youtubeLink && (
                    <a
                      href={chapter.youtubeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="resource-card"
                    >
                      <div className="resource-card-icon youtube">
                        <PlayCircle size={20} />
                      </div>
                      <div className="resource-card-info">
                        <h4>Video Lesson</h4>
                        <p>Watch on YouTube</p>
                      </div>
                      <ExternalLink size={16} className="resource-card-arrow" />
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar */}
        <aside className="chapter-sidebar">
          <div className="sidebar-panel">
            <p className="sidebar-panel-title">Chapter Info</p>
            <div className="sidebar-stat">
              <span className="sidebar-stat-label">Subject</span>
              <span className="sidebar-stat-value">{chapter.subjectId?.name || '—'}</span>
            </div>
            {hasNotes && (
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Short Notes</span>
                <span className="sidebar-stat-value">{chapter.shortNotes.length}</span>
              </div>
            )}
            {hasQA && (
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Q&amp;A Pairs</span>
                <span className="sidebar-stat-value">{chapter.questions.length}</span>
              </div>
            )}
            <div className="sidebar-stat">
              <span className="sidebar-stat-label">Resources</span>
              <span className="sidebar-stat-value">
                {[chapter.pdfLink, chapter.youtubeLink].filter(Boolean).length} available
              </span>
            </div>
          </div>

          {chapter.subjectId && (
            <div className="sidebar-panel">
              <p className="sidebar-panel-title">Navigation</p>
              <Link
                to={`/subjects/${chapter.subjectId._id}/chapters`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  color: 'var(--accent-gold)',
                  padding: '0.5rem 0',
                }}
              >
                <List size={14} />
                All chapters in this subject
              </Link>
            </div>
          )}
        </aside>
      </motion.div>
    </div>
  );
}
