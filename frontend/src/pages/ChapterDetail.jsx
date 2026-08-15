import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  FileText, PlayCircle, BookOpen, List, HelpCircle,
  ExternalLink, ChevronDown, Dot, Clock, MessageSquare, StickyNote, Share2,
  Link as LinkIcon, Check, X
} from 'lucide-react';

const TABS = [
  { id: 'notes', label: 'Short Notes', icon: StickyNote },
  { id: 'qa', label: 'Q & A', icon: HelpCircle },
  { id: 'resources', label: 'Resources', icon: ExternalLink },
];

const AnimatedShare = ({ shareText, url }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isExpanded]);

  const handleShare = (e, platform) => {
    e.stopPropagation();
    const text = encodeURIComponent(shareText);
    const link = encodeURIComponent(url);

    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${text}%20${link}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${link}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${link}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(`${shareText} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    if (platform !== 'copy') setIsExpanded(false);
  };

  const WhatsappIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
  );

  const TwitterIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );

  const FacebookIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );

  return (
    <div ref={containerRef} style={{ position: 'relative', width: 32, height: 32, marginLeft: 'auto', flexShrink: 0, zIndex: isExpanded ? 10 : 1 }}>
      <motion.div
        className="animated-share"
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setIsExpanded(false)}
        onClick={() => setIsExpanded(!isExpanded)}
        animate={{ 
          width: isExpanded ? 'auto' : 32,
          backgroundColor: isExpanded ? 'var(--bg-primary)' : 'transparent',
          boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
          borderColor: isExpanded ? 'var(--border-medium)' : 'transparent'
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          display: 'flex',
          alignItems: 'center',
          height: 32,
          borderRadius: 16,
          overflow: 'hidden',
          cursor: 'pointer',
          border: '1px solid transparent',
        }}
      >
        <motion.div
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isExpanded ? 'var(--text-main)' : 'var(--text-muted)',
            flexShrink: 0,
          }}
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? <X size={14} /> : <Share2 size={14} />}
        </motion.div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', paddingRight: '0.5rem', overflow: 'hidden' }}
            >
              <motion.button 
                whileHover={{ scale: 1.1, color: '#25D366' }} 
                onClick={(e) => handleShare(e, 'whatsapp')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
                title="WhatsApp"
              >
                <WhatsappIcon />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1, color: '#1DA1F2' }} 
                onClick={(e) => handleShare(e, 'twitter')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
                title="Twitter"
              >
                <TwitterIcon />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1, color: '#1877F2' }} 
                onClick={(e) => handleShare(e, 'facebook')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
                title="Facebook"
              >
                <FacebookIcon />
              </motion.button>
              <motion.div style={{ width: 1, height: 12, background: 'var(--border-delicate)', margin: '0 0.25rem' }} />
              <motion.button 
                whileHover={{ scale: 1.1, color: 'var(--text-main)' }} 
                onClick={(e) => handleShare(e, 'copy')}
                style={{ background: 'none', border: 'none', color: copied ? 'var(--accent-emerald)' : 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
                title="Copy Link"
              >
                {copied ? <Check size={14} /> : <LinkIcon size={14} />}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

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
            <div className="qa-answer-inner rich-text-content" dangerouslySetInnerHTML={{ __html: qa.answer }} />
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
  const [activeTab, setActiveTab] = useState('notes');

  useEffect(() => {
    axios.get(`/api/chapters/${chapterId}`)
      .then(res => setChapter(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [chapterId]);

  useEffect(() => {
    if (chapter) {
      const hasNotes = chapter.shortNotes && chapter.shortNotes.length > 0;
      const hasQA = chapter.questions && chapter.questions.length > 0;
      const hasResources = chapter.pdfLink || chapter.youtubeLink;
      if (hasNotes) setActiveTab('notes');
      else if (hasQA) setActiveTab('qa');
      else if (hasResources) setActiveTab('resources');
    }
  }, [chapter]);

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
    <div className="page-container" style={{ padding: '2rem 1rem' }}>
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
                    <div key={i} className="short-note-item" style={{ alignItems: 'flex-start' }}>
                      <Dot size={20} className="note-bullet" style={{ marginTop: '0.2rem' }} />
                      <div className="rich-text-content" dangerouslySetInnerHTML={{ __html: note }} style={{ flex: 1 }} />
                      <AnimatedShare 
                        shareText={`${note.replace(/<[^>]*>?/gm, '')}\n\n— Magic Study Garden\n`}
                        url={window.location.href}
                      />
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
