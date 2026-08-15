import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import axios from 'axios';
import { LayoutDashboard, BookOpen, Library, Layers, LogOut,
  Plus, Pencil, Trash2, X, ChevronDown, Check, AlertCircle,
  GraduationCap, Menu, FileText, HelpCircle, Maximize2, Minimize2, ArrowLeft, ShoppingCart
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Block Editor Component ────────────────────────────────────────────────
function BlockEditor({ value, onChange, token, isFullscreen }) {
  const editor = useCreateBlockNote({
    uploadFile: async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api(token).post('/api/admin/upload-image', formData);
      return res.data.url;
    }
  });

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (value) {
        const blocks = await editor.tryParseHTMLToBlocks(value);
        if (isMounted) {
          editor.replaceBlocks(editor.document, blocks);
        }
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const handleChange = async () => {
    const html = await editor.blocksToHTMLLossy(editor.document);
    onChange(html);
  };

  return (
    <div style={{ 
      height: isFullscreen ? 'calc(100vh - 200px)' : '300px', 
      overflowY: 'auto',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '1rem',
      background: 'var(--bg-main)'
    }}>
      <BlockNoteView editor={editor} onChange={handleChange} theme="light" />
    </div>
  );
}

// ─── Axios helper ────────────────────────────────────────────────────────────
const api = (token) => axios.create({
  headers: { Authorization: `Bearer ${token}` },
});

// ─── Toast notification ───────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.95 }}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        background: type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(61, 158, 122, 0.12)',
        border: `1px solid ${type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(61,158,122,0.3)'}`,
        color: type === 'error' ? '#ef4444' : '#3d9e7a',
        fontSize: '0.875rem',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
      {message}
    </motion.div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <motion.div
        className="admin-modal"
        style={{ maxWidth: 400 }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <h3>Confirm Deletion</h3>
          <button className="modal-close-btn" onClick={onCancel}><X size={18} /></button>
        </div>
        <div className="admin-modal-body">
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{message}</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn-danger" style={{ padding: '0.65rem 1.25rem' }} onClick={onConfirm}>
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CLASSES PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function ClassesPanel({ token, showToast }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', level: '' });
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api(token).get('/api/admin/classes');
      setClasses(res.data);
    } catch { showToast('Failed to load classes', 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(null); setForm({ name: '', level: '' }); setShowForm(true); };
  const openEdit = (cls) => { setEditing(cls); setForm({ name: cls.name, level: cls.level }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api(token).put(`/api/admin/classes/${editing._id}`, form);
        showToast('Class updated!');
      } else {
        await api(token).post('/api/admin/classes', form);
        showToast('Class created!');
      }
      setShowForm(false);
      load();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save class', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api(token).delete(`/api/admin/classes/${id}`);
      showToast('Class deleted!');
      load();
    } catch { showToast('Failed to delete class', 'error'); }
    finally { setConfirm(null); }
  };

  return (
    <>
      <div className="admin-panel-header">
        <div>
          <h2 className="admin-panel-title">Classes</h2>
          <p className="admin-panel-subtitle">Manage grade levels and class names</p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={{ fontSize: '0.8rem' }}>
          <Plus size={15} /> Add Class
        </button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="loading-spinner" /></div>
      ) : (
        <motion.div className="admin-table-wrapper" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} transition={{duration:0.4, delay:0.1}}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Name</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '3rem' }}>No classes yet. Add one above.</td></tr>
              ) : (
                classes.map(cls => (
                  <tr key={cls._id}>
                    <td style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>{cls.level}</td>
                    <td style={{ color: 'var(--text-main)', fontWeight: 500 }}>{cls.name}</td>
                    <td>{new Date(cls.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <button className="table-btn" onClick={() => openEdit(cls)}><Pencil size={13} /> Edit</button>
                        <button className="table-btn danger" onClick={() => setConfirm(cls._id)}><Trash2 size={13} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
            <motion.div
              className="admin-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h3>{editing ? 'Edit Class' : 'Add Class'}</h3>
                <button className="modal-close-btn" onClick={() => setShowForm(false)}><X size={18} /></button>
              </div>
              <form className="admin-modal-body" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Class Name *</label>
                      <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Class X" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Level (Number) *</label>
                      <input className="form-input" type="number" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} placeholder="e.g. 10" required />
                    </div>
                  </div>
                </div>
                <div className="form-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem' }}>{editing ? 'Save Changes' : 'Create Class'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Delete */}
      <AnimatePresence>
        {confirm && <ConfirmDialog message="Are you sure you want to delete this class? This cannot be undone." onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SUBJECTS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function SubjectsPanel({ token, showToast }) {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filterClass, setFilterClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', classId: '' });
  const [confirm, setConfirm] = useState(null);

  const loadClasses = useCallback(async () => {
    const res = await api(token).get('/api/admin/classes');
    setClasses(res.data);
  }, [token]);

  const loadSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterClass ? `/api/admin/subjects?classId=${filterClass}` : '/api/admin/subjects';
      const res = await api(token).get(url);
      setSubjects(res.data);
    } catch { showToast('Failed to load subjects', 'error'); }
    finally { setLoading(false); }
  }, [token, filterClass]);

  useEffect(() => { loadClasses(); }, [loadClasses]);
  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  const openAdd = () => { setEditing(null); setForm({ name: '', classId: filterClass || '' }); setShowForm(true); };
  const openEdit = (sub) => { setEditing(sub); setForm({ name: sub.name, classId: sub.classId?._id || sub.classId }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api(token).put(`/api/admin/subjects/${editing._id}`, form);
        showToast('Subject updated!');
      } else {
        await api(token).post('/api/admin/subjects', form);
        showToast('Subject created!');
      }
      setShowForm(false);
      loadSubjects();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save subject', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api(token).delete(`/api/admin/subjects/${id}`);
      showToast('Subject deleted!');
      loadSubjects();
    } catch { showToast('Failed to delete', 'error'); }
    finally { setConfirm(null); }
  };

  return (
    <>
      <div className="admin-panel-header">
        <div>
          <h2 className="admin-panel-title">Subjects</h2>
          <p className="admin-panel-subtitle">Manage subjects within each class</p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={{ fontSize: '0.8rem' }}>
          <Plus size={15} /> Add Subject
        </button>
      </div>

      <div className="admin-filter-bar">
        <select className="filter-select" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
          <option value="">All Classes</option>
          {classes.map(c => <option key={c._id} value={c._id}>Class {c.level} — {c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-container"><div className="loading-spinner" /></div>
      ) : (
        <motion.div className="admin-table-wrapper" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} transition={{duration:0.4, delay:0.1}}>
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Class</th><th>Created</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '3rem' }}>No subjects found.</td></tr>
              ) : (
                subjects.map(sub => (
                  <tr key={sub._id}>
                    <td style={{ color: 'var(--text-main)', fontWeight: 500 }}>{sub.name}</td>
                    <td>{sub.classId?.name ? `Class ${sub.classId.level} — ${sub.classId.name}` : '—'}</td>
                    <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <button className="table-btn" onClick={() => openEdit(sub)}><Pencil size={13} /> Edit</button>
                        <button className="table-btn danger" onClick={() => setConfirm(sub._id)}><Trash2 size={13} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
          <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
            <motion.div className="admin-modal" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editing ? 'Edit Subject' : 'Add Subject'}</h3>
                <button className="modal-close-btn" onClick={() => setShowForm(false)}><X size={18} /></button>
              </div>
              <form className="admin-modal-body" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Subject Name *</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mathematics" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Class *</label>
                    <select className="form-select" value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })} required>
                      <option value="">Select a class</option>
                      {classes.map(c => <option key={c._id} value={c._id}>Class {c.level} — {c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem' }}>{editing ? 'Save Changes' : 'Create Subject'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirm && <ConfirmDialog message="Delete this subject? All its chapters will become orphaned." onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CHAPTERS PANEL
// ═══════════════════════════════════════════════════════════════════════════════

const EMPTY_CHAPTER = {
  title: '', subjectId: '', order: 0,
  pdfLink: '', youtubeLink: ''
};

function ChapterForm({ initial, subjects, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_CHAPTER);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="admin-modal-body">
        <div className="form-grid">
          {/* Basic Info */}
          <div className="form-grid-2">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Chapter Title *</label>
              <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. The Cell and Its Organelles" required />
            </div>
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <select className="form-select" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} required>
                <option value="">Select subject</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.classId ? `(Class ${s.classId.level})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Order / Chapter No.</label>
              <input className="form-input" type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} placeholder="1" min="0" />
            </div>
          </div>



          {/* Resources */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">PDF Link</label>
              <input className="form-input" value={form.pdfLink} onChange={e => setForm({ ...form, pdfLink: e.target.value })} placeholder="https://…" type="url" />
            </div>
            <div className="form-group">
              <label className="form-label">YouTube Link</label>
              <input className="form-input" value={form.youtubeLink} onChange={e => setForm({ ...form, youtubeLink: e.target.value })} placeholder="https://youtube.com/…" type="url" />
            </div>
          </div>
        </div>

        <div className="form-modal-footer">
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem' }}>Save Chapter</button>
        </div>
      </div>
    </form>
  );
}

function ChaptersPanel({ token, showToast }) {
  const [chapters, setChapters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterSubject, setFilterSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const loadSubjects = useCallback(async () => {
    const res = await api(token).get('/api/admin/subjects');
    setSubjects(res.data);
  }, [token]);

  const loadChapters = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterSubject ? `/api/admin/chapters?subjectId=${filterSubject}` : '/api/admin/chapters';
      const res = await api(token).get(url);
      setChapters(res.data);
    } catch { showToast('Failed to load chapters', 'error'); }
    finally { setLoading(false); }
  }, [token, filterSubject]);

  useEffect(() => { loadSubjects(); }, [loadSubjects]);
  useEffect(() => { loadChapters(); }, [loadChapters]);

  const handleSubmit = async (formData) => {
    try {
      if (editing) {
        await api(token).put(`/api/admin/chapters/${editing._id}`, formData);
        showToast('Chapter updated!');
      } else {
        await api(token).post('/api/admin/chapters', formData);
        showToast('Chapter created!');
      }
      setShowForm(false);
      setEditing(null);
      loadChapters();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save chapter', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api(token).delete(`/api/admin/chapters/${id}`);
      showToast('Chapter deleted!');
      loadChapters();
    } catch { showToast('Failed to delete', 'error'); }
    finally { setConfirm(null); }
  };

  const openEdit = (ch) => {
    setEditing(ch);
    setShowForm(true);
  };

  const getEditInitial = (ch) => ({
    title: ch.title,
    subjectId: ch.subjectId?._id || ch.subjectId,
    order: ch.order || 0,
    pdfLink: ch.pdfLink || '',
    youtubeLink: ch.youtubeLink || '',
  });

  return (
    <>
      <div className="admin-panel-header">
        <div>
          <h2 className="admin-panel-title">Chapters</h2>
          <p className="admin-panel-subtitle">Create and manage chapter content — summaries, notes, Q&amp;A</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }} style={{ fontSize: '0.8rem' }}>
          <Plus size={15} /> Add Chapter
        </button>
      </div>

      <div className="admin-filter-bar">
        <select className="filter-select" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
          <option value="">All Subjects</option>
          {subjects.map(s => (
            <option key={s._id} value={s._id}>
              {s.name} {s.classId ? `(Class ${s.classId.level})` : ''}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-container"><div className="loading-spinner" /></div>
      ) : (
        <motion.div className="admin-table-wrapper" initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} transition={{duration:0.4, delay:0.1}}>
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>Title</th><th>Subject</th><th>Notes</th><th>Q&amp;A</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {chapters.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-faint)', padding: '3rem' }}>No chapters found.</td></tr>
              ) : (
                chapters.map((ch, idx) => (
                  <tr key={ch._id}>
                    <td style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)' }}>{ch.order || idx + 1}</td>
                    <td style={{ color: 'var(--text-main)', fontWeight: 500, maxWidth: 280 }}>{ch.title}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{ch.subjectId?.name || '—'}</td>
                    <td style={{ color: 'var(--text-faint)' }}>{ch.shortNotes?.length || 0}</td>
                    <td style={{ color: 'var(--text-faint)' }}>{ch.questions?.length || 0}</td>
                    <td>
                      <div className="table-actions">
                        <button className="table-btn" onClick={() => openEdit(ch)}><Pencil size={13} /> Edit</button>
                        <button className="table-btn danger" onClick={() => setConfirm(ch._id)}><Trash2 size={13} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Chapter Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="admin-modal-overlay" onClick={() => { setShowForm(false); setEditing(null); }}>
            <motion.div
              className="admin-modal large"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="admin-modal-header">
                <h3>{editing ? `Edit: ${editing.title}` : 'Add Chapter'}</h3>
                <button className="modal-close-btn" onClick={() => { setShowForm(false); setEditing(null); }}><X size={18} /></button>
              </div>
              <ChapterForm
                initial={editing ? getEditInitial(editing) : EMPTY_CHAPTER}
                subjects={subjects}
                onSubmit={handleSubmit}
                onCancel={() => { setShowForm(false); setEditing(null); }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirm && <ConfirmDialog message="Delete this chapter permanently? This action cannot be undone." onConfirm={() => handleDelete(confirm)} onCancel={() => setConfirm(null)} />}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  NOTES PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function NotesPanel({ token, showToast }) {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // index of note being edited, or -1 for new
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    api(token).get('/api/admin/classes').then(res => setClasses(res.data));
  }, [token]);

  useEffect(() => {
    if (selectedClass) {
      api(token).get(`/api/admin/subjects?classId=${selectedClass}`).then(res => setSubjects(res.data));
    } else {
      setSubjects([]);
      setSelectedSubject('');
      setSelectedChapter('');
    }
  }, [selectedClass, token]);

  useEffect(() => {
    if (selectedSubject) {
      setLoading(true);
      api(token).get(`/api/admin/chapters?subjectId=${selectedSubject}`)
        .then(res => setChapters(res.data))
        .finally(() => setLoading(false));
    } else {
      setChapters([]);
      setSelectedChapter('');
    }
  }, [selectedSubject, token]);

  const activeChapter = chapters.find(c => c._id === selectedChapter);

  const handleSaveNote = async () => {
    if (!activeChapter || !noteText.trim()) return;
    try {
      const newNotes = [...(activeChapter.shortNotes || [])];
      if (editing === -1) {
        newNotes.push(noteText);
      } else {
        newNotes[editing] = noteText;
      }
      const updated = await api(token).put(`/api/admin/chapters/${selectedChapter}`, { shortNotes: newNotes });
      setChapters(chapters.map(c => c._id === selectedChapter ? updated.data : c));
      showToast('Note saved!');
      setEditing(null);
      setNoteText('');
    } catch {
      showToast('Failed to save note', 'error');
    }
  };

  const handleDeleteNote = async (idx) => {
    if (!activeChapter) return;
    try {
      const newNotes = [...(activeChapter.shortNotes || [])];
      newNotes.splice(idx, 1);
      const updated = await api(token).put(`/api/admin/chapters/${selectedChapter}`, { shortNotes: newNotes });
      setChapters(chapters.map(c => c._id === selectedChapter ? updated.data : c));
      showToast('Note deleted!');
    } catch {
      showToast('Failed to delete note', 'error');
    }
  };

  const handleQuickAddSubject = async () => {
    if (!selectedClass) return;
    const name = window.prompt("Enter new subject name:");
    if (!name || !name.trim()) return;
    try {
      const res = await api(token).post('/api/admin/subjects', { name, classId: selectedClass });
      setSubjects([...subjects, res.data]);
      setSelectedSubject(res.data._id);
      showToast('Subject created!');
    } catch {
      showToast('Failed to create subject', 'error');
    }
  };

  const handleQuickAddChapter = async () => {
    if (!selectedSubject) return;
    const title = window.prompt("Enter new chapter title:");
    if (!title || !title.trim()) return;
    try {
      const res = await api(token).post('/api/admin/chapters', { 
        title, 
        subjectId: selectedSubject,
        order: chapters.length + 1
      });
      setChapters([...chapters, res.data]);
      setSelectedChapter(res.data._id);
      showToast('Chapter created!');
    } catch {
      showToast('Failed to create chapter', 'error');
    }
  };

  return (
    <>
      <div className="admin-panel-header">
        <div>
          <h2 className="admin-panel-title">Notes</h2>
          <p className="admin-panel-subtitle">Manage short notes for specific chapters</p>
        </div>
      </div>

      <div className="admin-filter-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select className="filter-select" value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSubject(''); setSelectedChapter(''); }}>
            <option value="">Select a Class...</option>
            {classes.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select className="filter-select" value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedChapter(''); }} disabled={!selectedClass}>
            <option value="">Select a Subject...</option>
            {subjects.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          {selectedClass && (
            <button className="btn-secondary" style={{ padding: '0.4rem 0.6rem', minWidth: 'auto' }} onClick={handleQuickAddSubject} title="Add Subject">
              <Plus size={16} />
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select className="filter-select" value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} disabled={!selectedSubject || loading}>
            <option value="">Select a Chapter...</option>
            {chapters.map(c => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
          {selectedSubject && (
            <button className="btn-secondary" style={{ padding: '0.4rem 0.6rem', minWidth: 'auto' }} onClick={handleQuickAddChapter} title="Add Chapter">
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>

      {loading && <div className="loading-container"><div className="loading-spinner" /></div>}

      {activeChapter && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-main)' }}>Notes for: {activeChapter.title}</h3>
            <button className="btn-primary" onClick={() => { setEditing(-1); setNoteText(''); }} style={{ fontSize: '0.8rem' }}>
              <Plus size={15} /> Add Note
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {(!activeChapter.shortNotes || activeChapter.shortNotes.length === 0) ? (
              <p style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>No notes found for this chapter.</p>
            ) : (
              activeChapter.shortNotes.map((note, idx) => (
                <motion.div key={idx}
                  initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} transition={{duration:0.3, delay:idx*0.05}} 
                  style={{
                  background: 'var(--admin-surface)',
                  border: '1px solid rgba(255,255,255,0.6)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  boxShadow: 'var(--admin-shadow)',
                  backdropFilter: 'var(--admin-glass-blur)',
                  WebkitBackdropFilter: 'var(--admin-glass-blur)'
                }}>
                  <div style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, flex: 1, minWidth: 0 }} className="rich-text-content" dangerouslySetInnerHTML={{ __html: note }} />
                  <div className="table-actions">
                    <button className="table-btn" onClick={() => { setEditing(idx); setNoteText(note); }}><Pencil size={13} /></button>
                    <button className="table-btn danger" onClick={() => handleDeleteNote(idx)}><Trash2 size={13} /></button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Note Modal */}
      <AnimatePresence>
        {editing !== null && (
          <div className="admin-modal-overlay" onClick={() => setEditing(null)} style={isFullscreen ? { padding: 0 } : {}}>
            <motion.div
              className="admin-modal"
              data-lenis-prevent="true"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={isFullscreen ? { maxWidth: '100%', width: '100vw', height: '100vh', margin: 0, borderRadius: 0, display: 'flex', flexDirection: 'column' } : {}}
            >
              <div className="admin-modal-header">
                <h3>{editing === -1 ? 'Add Note' : 'Edit Note'}</h3>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button type="button" className="modal-close-btn" onClick={() => setIsFullscreen(!isFullscreen)}>
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                  <button type="button" className="modal-close-btn" onClick={() => setEditing(null)}><X size={18} /></button>
                </div>
              </div>
              <div className="admin-modal-body" style={isFullscreen ? { flex: 1, display: 'flex', flexDirection: 'column' } : {}}>
                <div className="form-group" style={isFullscreen ? { flex: 1, display: 'flex', flexDirection: 'column' } : {}}>
                  <label className="form-label">Note Content</label>
                  <BlockEditor value={noteText} onChange={setNoteText} token={token} isFullscreen={isFullscreen} />
                </div>
                <div className="form-modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
                  <button type="button" className="btn-primary" onClick={handleSaveNote}>Save Note</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Q&A PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function QAPanel({ token, showToast }) {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // index of Q&A being edited, or -1 for new
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qaForm, setQaForm] = useState({ question: '', answer: '' });

  useEffect(() => {
    api(token).get('/api/admin/classes').then(res => setClasses(res.data));
  }, [token]);

  useEffect(() => {
    if (selectedClass) {
      api(token).get(`/api/admin/subjects?classId=${selectedClass}`).then(res => setSubjects(res.data));
    } else {
      setSubjects([]);
      setSelectedSubject('');
      setSelectedChapter('');
    }
  }, [selectedClass, token]);

  useEffect(() => {
    if (selectedSubject) {
      setLoading(true);
      api(token).get(`/api/admin/chapters?subjectId=${selectedSubject}`)
        .then(res => setChapters(res.data))
        .finally(() => setLoading(false));
    } else {
      setChapters([]);
      setSelectedChapter('');
    }
  }, [selectedSubject, token]);

  const activeChapter = chapters.find(c => c._id === selectedChapter);

  const handleSaveQA = async () => {
    if (!activeChapter || !qaForm.question.trim() || !qaForm.answer.trim()) return;
    try {
      const newQA = [...(activeChapter.questions || [])];
      if (editing === -1) {
        newQA.push(qaForm);
      } else {
        newQA[editing] = qaForm;
      }
      const updated = await api(token).put(`/api/admin/chapters/${selectedChapter}`, { questions: newQA });
      setChapters(chapters.map(c => c._id === selectedChapter ? updated.data : c));
      showToast('Q&A saved!');
      setEditing(null);
      setQaForm({ question: '', answer: '' });
    } catch {
      showToast('Failed to save Q&A', 'error');
    }
  };

  const handleDeleteQA = async (idx) => {
    if (!activeChapter) return;
    try {
      const newQA = [...(activeChapter.questions || [])];
      newQA.splice(idx, 1);
      const updated = await api(token).put(`/api/admin/chapters/${selectedChapter}`, { questions: newQA });
      setChapters(chapters.map(c => c._id === selectedChapter ? updated.data : c));
      showToast('Q&A deleted!');
    } catch {
      showToast('Failed to delete Q&A', 'error');
    }
  };

  const handleQuickAddSubject = async () => {
    if (!selectedClass) return;
    const name = window.prompt("Enter new subject name:");
    if (!name || !name.trim()) return;
    try {
      const res = await api(token).post('/api/admin/subjects', { name, classId: selectedClass });
      setSubjects([...subjects, res.data]);
      setSelectedSubject(res.data._id);
      showToast('Subject created!');
    } catch {
      showToast('Failed to create subject', 'error');
    }
  };

  const handleQuickAddChapter = async () => {
    if (!selectedSubject) return;
    const title = window.prompt("Enter new chapter title:");
    if (!title || !title.trim()) return;
    try {
      const res = await api(token).post('/api/admin/chapters', { 
        title, 
        subjectId: selectedSubject,
        order: chapters.length + 1
      });
      setChapters([...chapters, res.data]);
      setSelectedChapter(res.data._id);
      showToast('Chapter created!');
    } catch {
      showToast('Failed to create chapter', 'error');
    }
  };

  return (
    <>
      <div className="admin-panel-header">
        <div>
          <h2 className="admin-panel-title">Question & Answers</h2>
          <p className="admin-panel-subtitle">Manage Q&A pairs for specific chapters</p>
        </div>
      </div>

      <div className="admin-filter-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select className="filter-select" value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSubject(''); setSelectedChapter(''); }}>
            <option value="">Select a Class...</option>
            {classes.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select className="filter-select" value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedChapter(''); }} disabled={!selectedClass}>
            <option value="">Select a Subject...</option>
            {subjects.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          {selectedClass && (
            <button className="btn-secondary" style={{ padding: '0.4rem 0.6rem', minWidth: 'auto' }} onClick={handleQuickAddSubject} title="Add Subject">
              <Plus size={16} />
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <select className="filter-select" value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} disabled={!selectedSubject || loading}>
            <option value="">Select a Chapter...</option>
            {chapters.map(c => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
          {selectedSubject && (
            <button className="btn-secondary" style={{ padding: '0.4rem 0.6rem', minWidth: 'auto' }} onClick={handleQuickAddChapter} title="Add Chapter">
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>

      {loading && <div className="loading-container"><div className="loading-spinner" /></div>}

      {activeChapter && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-main)' }}>Q&A for: {activeChapter.title}</h3>
            <button className="btn-primary" onClick={() => { setEditing(-1); setQaForm({ question: '', answer: '' }); }} style={{ fontSize: '0.8rem' }}>
              <Plus size={15} /> Add Q&A
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {(!activeChapter.questions || activeChapter.questions.length === 0) ? (
              <p style={{ color: 'var(--text-faint)', fontStyle: 'italic' }}>No Q&A found for this chapter.</p>
            ) : (
              activeChapter.questions.map((qa, idx) => (
                <motion.div key={idx}
                  initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} transition={{duration:0.3, delay:idx*0.05}} 
                  style={{
                  background: 'var(--admin-surface)',
                  border: '1px solid rgba(255,255,255,0.6)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  boxShadow: 'var(--admin-shadow)',
                  backdropFilter: 'var(--admin-glass-blur)',
                  WebkitBackdropFilter: 'var(--admin-glass-blur)'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 600 }}>Q: {qa.question}</h4>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }} className="rich-text-content">
                      <strong style={{ marginRight: '0.5rem' }}>A:</strong>
                      <span dangerouslySetInnerHTML={{ __html: qa.answer }} />
                    </div>
                  </div>
                  <div className="table-actions">
                    <button className="table-btn" onClick={() => { setEditing(idx); setQaForm(qa); }}><Pencil size={13} /></button>
                    <button className="table-btn danger" onClick={() => handleDeleteQA(idx)}><Trash2 size={13} /></button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {editing !== null && (
          <div className="admin-modal-overlay" onClick={() => setEditing(null)} style={isFullscreen ? { padding: 0 } : {}}>
            <motion.div
              className="admin-modal"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={isFullscreen ? { maxWidth: '100%', width: '100vw', height: '100vh', margin: 0, borderRadius: 0, display: 'flex', flexDirection: 'column' } : {}}
            >
              <div className="admin-modal-header">
                <h3>{editing === -1 ? 'Add Q&A' : 'Edit Q&A'}</h3>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button type="button" className="modal-close-btn" onClick={() => setIsFullscreen(!isFullscreen)}>
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                  <button type="button" className="modal-close-btn" onClick={() => setEditing(null)}><X size={18} /></button>
                </div>
              </div>
              <div className="admin-modal-body" style={isFullscreen ? { flex: 1, display: 'flex', flexDirection: 'column' } : {}}>
                <div className="form-group">
                  <label className="form-label">Question</label>
                  <input className="form-input" value={qaForm.question} onChange={e => setQaForm({ ...qaForm, question: e.target.value })} placeholder="Type question..." />
                </div>
                <div className="form-group" style={isFullscreen ? { flex: 1, display: 'flex', flexDirection: 'column', marginTop: '1rem' } : { marginTop: '1rem' }}>
                  <label className="form-label">Answer</label>
                  <BlockEditor value={qaForm.answer} onChange={(val) => setQaForm({ ...qaForm, answer: val })} token={token} isFullscreen={isFullscreen} />
                </div>
                <div className="form-modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
                  <button type="button" className="btn-primary" onClick={handleSaveQA}>Save Q&A</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DASHBOARD OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard({ token }) {
  const [stats, setStats] = useState({ classes: 0, subjects: 0, chapters: 0 });

  useEffect(() => {
    Promise.all([
      api(token).get('/api/admin/classes'),
      api(token).get('/api/admin/subjects'),
      api(token).get('/api/admin/chapters'),
    ]).then(([c, s, ch]) => {
      setStats({ classes: c.data.length, subjects: s.data.length, chapters: ch.data.length });
    }).catch(() => {});
  }, [token]);

  const statCards = [
    { label: 'Classes', value: stats.classes, icon: GraduationCap, color: '#b48600', bg: 'linear-gradient(135deg, rgba(180, 134, 0, 0.12) 0%, rgba(180, 134, 0, 0.02) 100%)', border: 'rgba(180, 134, 0, 0.2)' },
    { label: 'Subjects', value: stats.subjects, icon: Library, color: '#1c7a54', bg: 'linear-gradient(135deg, rgba(28, 122, 84, 0.12) 0%, rgba(28, 122, 84, 0.02) 100%)', border: 'rgba(28, 122, 84, 0.2)' },
    { label: 'Chapters', value: stats.chapters, icon: Layers, color: '#4f46e5', bg: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(79, 70, 229, 0.02) 100%)', border: 'rgba(79, 70, 229, 0.2)' },
  ];

  return (
    <div>
      <div className="admin-panel-header">
        <div>
          <h2 className="admin-panel-title">Dashboard</h2>
          <p className="admin-panel-subtitle">Overview of your study garden</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div 
              key={card.label} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              style={{
                background: card.bg || 'var(--admin-surface)',
                border: `1px solid ${card.border || 'var(--admin-border)'}`,
                borderRadius: 16,
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: 'var(--admin-shadow)',
                backdropFilter: 'var(--admin-glass-blur)',
                WebkitBackdropFilter: 'var(--admin-glass-blur)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: card.color, fontWeight: 600 }}>{card.label}</span>
                <Icon size={20} style={{ color: card.color }} />
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', color: 'var(--text-main)', lineHeight: 1 }}>{card.value}</span>
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        style={{
          background: 'var(--admin-surface)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          borderRadius: 16,
          padding: '2rem',
          color: 'var(--text-faint)',
          fontSize: '0.9rem',
          lineHeight: 1.7,
          boxShadow: 'var(--admin-shadow)',
          backdropFilter: 'var(--admin-glass-blur)',
          WebkitBackdropFilter: 'var(--admin-glass-blur)',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>Quick Guide</h3>
        <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'decimal' }}>
          <li>Start by creating <strong style={{ color: 'var(--text-muted)' }}>Classes</strong> (e.g. "Class X").</li>
          <li>Add <strong style={{ color: 'var(--text-muted)' }}>Subjects</strong> and assign each to a class.</li>
          <li>Create <strong style={{ color: 'var(--text-muted)' }}>Chapters</strong> with rich content — summaries, short notes, Q&amp;A pairs, PDF and video links.</li>
          <li>Students will immediately see your content on the public site.</li>
        </ol>
      </motion.div>
    </div>
  );
}

// ─── Store Panel ─────────────────────────────────────────────────────────────
function StorePanel({ token, showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: '',
    image: '', qrCodeImage: '', isActive: true
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api(token).get('/api/admin/store-items');
      setItems(res.data);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to fetch store items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [token]);

  const handleOpenForm = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title, description: item.description, price: item.price,
        category: item.category, image: item.image || '', qrCodeImage: item.qrCodeImage || '',
        isActive: item.isActive
      });
    } else {
      setEditingItem(null);
      setFormData({ title: '', description: '', price: '', category: '', image: '', qrCodeImage: '', isActive: true });
    }
    setFormOpen(true);
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('image', file);
    
    try {
      showToast(`Uploading ${field === 'image' ? 'cover' : 'QR code'}...`, 'info');
      const res = await api(token).post('/api/admin/upload-image', uploadData);
      setFormData(prev => ({ ...prev, [field]: res.data.url }));
      showToast('Image uploaded successfully', 'success');
    } catch (err) {
      showToast('Image upload failed', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api(token).put(`/api/admin/store-items/${editingItem._id}`, formData);
        showToast('Store item updated successfully', 'success');
      } else {
        await api(token).post('/api/admin/store-items', formData);
        showToast('Store item created successfully', 'success');
      }
      setFormOpen(false);
      fetchItems();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save store item', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this store item?')) return;
    try {
      await api(token).delete(`/api/admin/store-items/${id}`);
      showToast('Store item deleted successfully', 'success');
      fetchItems();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete store item', 'error');
    }
  };

  if (loading) return <div className="admin-loading"><div className="spinner"></div></div>;

  return (
    <div className="panel-container">
      <div className="panel-header">
        <div>
          <h2>Store Items</h2>
          <p className="panel-subtitle">Manage resources available in the Buy tab</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenForm()}>
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="data-grid">
        {items.map(item => (
          <div key={item._id} className="data-card">
            <div className="card-content" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {item.image ? (
                <img src={item.image} alt={item.title} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
              ) : (
                <div style={{ width: '60px', height: '80px', background: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart size={24} color="#ccc" />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem' }}>{item.title}</h3>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>₹{item.price}</span>
                </div>
                <span className="badge" style={{ marginBottom: '0.5rem' }}>{item.category}</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.description}
                </p>
                <div style={{ fontSize: '0.75rem', color: item.isActive ? '#10b981' : '#ef4444' }}>
                  {item.isActive ? 'Active (Visible)' : 'Inactive (Hidden)'}
                </div>
              </div>
            </div>
            <div className="card-actions">
              <button className="action-btn edit" onClick={() => handleOpenForm(item)}><Pencil size={14} /> Edit</button>
              <button className="action-btn delete" onClick={() => handleDelete(item._id)}><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="empty-state">No store items found.</div>}
      </div>

      <AnimatePresence>
        {formOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" style={{ maxWidth: '600px' }} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
              <div className="modal-header">
                <h3>{editingItem ? 'Edit Store Item' : 'New Store Item'}</h3>
                <button className="close-btn" onClick={() => setFormOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="modal-body form-grid">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" className="form-input" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                
                <div className="form-group">
                  <label>Category (e.g., Class 10)</label>
                  <input type="text" className="form-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required />
                </div>
                
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea className="form-input" rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required></textarea>
                </div>

                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" className="form-input" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required min="0" />
                </div>
                
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} style={{ width: '1.2rem', height: '1.2rem' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Active (Visible to users)</span>
                  </label>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-delicate)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <label>Cover Image (Thumbnail)</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    {formData.image && <img src={formData.image} alt="Cover" style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />}
                    <div style={{ flex: 1 }}>
                      <input type="file" className="form-input" onChange={(e) => handleImageUpload(e, 'image')} accept="image/*" />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: '0.5rem 0 0' }}>Or enter URL:</p>
                      <input type="text" className="form-input" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." style={{ marginTop: '0.25rem' }} />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-delicate)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <label>Custom QR Code Image (Payment)</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    {formData.qrCodeImage && <img src={formData.qrCodeImage} alt="QR Code" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />}
                    <div style={{ flex: 1 }}>
                      <input type="file" className="form-input" onChange={(e) => handleImageUpload(e, 'qrCodeImage')} accept="image/*" />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', margin: '0.5rem 0 0' }}>Or enter URL:</p>
                      <input type="text" className="form-input" value={formData.qrCodeImage} onChange={e => setFormData({ ...formData, qrCodeImage: e.target.value })} placeholder="https://..." style={{ marginTop: '0.25rem' }} />
                    </div>
                  </div>
                </div>

                <div className="modal-footer" style={{ gridColumn: '1 / -1' }}>
                  <button type="button" className="btn-secondary" onClick={() => setFormOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">{editingItem ? 'Save Changes' : 'Create Item'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN ADMIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken'));
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activePanel, setActivePanel] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await axios.post('/api/admin/login', loginForm);
      setToken(res.data.token);
      localStorage.setItem('adminToken', res.data.token);
    } catch {
      setLoginError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  // ── Login Screen ─────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="admin-login-page" style={{ position: 'relative' }}>
        <Link 
          to="/" 
          style={{ 
            position: 'absolute', 
            top: '2rem', 
            left: '2rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: 'var(--text-main)', 
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 500
          }}
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <motion.div
          className="admin-login-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="admin-login-logo">Magic Study Garden</p>
          <p className="admin-login-sub">Admin Portal</p>

          <form className="admin-login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                type="text"
                value={loginForm.username}
                onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                placeholder="admin"
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {loginError && <div className="admin-error">{loginError}</div>}

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
              Enter Portal
            </button>
          </form>
        </motion.div>
      </div>
    );
  }


// ── Admin Dashboard ──────────────────────────────────────────────────────────
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'classes', label: 'Classes', icon: GraduationCap },
    { id: 'subjects', label: 'Subjects', icon: Library },
    { id: 'chapters', label: 'Chapters', icon: Layers },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'qa', label: 'Q&A', icon: HelpCircle },
    { id: 'store', label: 'Store', icon: ShoppingCart },
  ];

  const renderPanel = () => {
    switch (activePanel) {
      case 'classes':   return <ClassesPanel token={token} showToast={showToast} />;
      case 'subjects':  return <SubjectsPanel token={token} showToast={showToast} />;
      case 'chapters':  return <ChaptersPanel token={token} showToast={showToast} />;
      case 'notes':     return <NotesPanel token={token} showToast={showToast} />;
      case 'qa':        return <QAPanel token={token} showToast={showToast} />;
      case 'store':     return <StorePanel token={token} showToast={showToast} />;
      default:          return <Dashboard token={token} />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="admin-sidebar-brand" style={{ marginBottom: 0 }}>Magic Study Garden</p>
          <button 
            onClick={handleLogout} 
            className="admin-sidebar-sub"
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#ef4444', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0,
              fontWeight: 600
            }}
          >
            <LogOut size={14} />
            LOGOUT
          </button>
        </div>

        <nav className="admin-sidebar-nav">
          <p className="sidebar-nav-label">Navigation</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`sidebar-nav-item ${activePanel === id ? 'active' : ''}`}
              onClick={() => { setActivePanel(id); setMobileMenuOpen(false); }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>


      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <button className="admin-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="admin-topbar-title" style={{ flex: 1, paddingLeft: '1rem' }}>
            {NAV_ITEMS.find(n => n.id === activePanel)?.label || 'Admin'}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }} className="admin-user-status">
            Logged in as admin
          </span>
        </div>

        <div className="admin-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {renderPanel()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
