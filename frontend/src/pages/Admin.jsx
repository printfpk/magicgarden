import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  LayoutDashboard, BookOpen, Library, Layers, LogOut,
  Plus, Pencil, Trash2, X, ChevronDown, Check, AlertCircle,
  GraduationCap
} from 'lucide-react';

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
        <div className="admin-table-wrapper">
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
        </div>
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
        <div className="admin-table-wrapper">
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
        </div>
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
  summary: '', shortNotes: [''], pdfLink: '', youtubeLink: '',
  questions: [{ question: '', answer: '' }],
};

function ChapterForm({ initial, subjects, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_CHAPTER);

  // Short notes helpers
  const updateNote = (i, val) => {
    const notes = [...form.shortNotes];
    notes[i] = val;
    setForm({ ...form, shortNotes: notes });
  };
  const addNote = () => setForm({ ...form, shortNotes: [...form.shortNotes, ''] });
  const removeNote = (i) => setForm({ ...form, shortNotes: form.shortNotes.filter((_, idx) => idx !== i) });

  // Q&A helpers
  const updateQA = (i, field, val) => {
    const qs = [...form.questions];
    qs[i] = { ...qs[i], [field]: val };
    setForm({ ...form, questions: qs });
  };
  const addQA = () => setForm({ ...form, questions: [...form.questions, { question: '', answer: '' }] });
  const removeQA = (i) => setForm({ ...form, questions: form.questions.filter((_, idx) => idx !== i) });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter empty notes / Q&A
    const cleanedNotes = form.shortNotes.filter(n => n.trim() !== '');
    const cleanedQA = form.questions.filter(q => q.question.trim() !== '' && q.answer.trim() !== '');
    onSubmit({ ...form, shortNotes: cleanedNotes, questions: cleanedQA });
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

          {/* Summary */}
          <div className="form-group">
            <label className="form-label">Summary</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: 160 }}
              value={form.summary}
              onChange={e => setForm({ ...form, summary: e.target.value })}
              placeholder="Write a detailed chapter summary. Use blank lines to separate paragraphs."
            />
          </div>

          {/* Short Notes */}
          <div className="form-group">
            <label className="form-label">Short Notes (Bullet Points)</label>
            <div className="notes-builder">
              {form.shortNotes.map((note, i) => (
                <div key={i} className="note-input-row">
                  <input
                    value={note}
                    onChange={e => updateNote(i, e.target.value)}
                    placeholder={`Note ${i + 1}…`}
                  />
                  {form.shortNotes.length > 1 && (
                    <button type="button" className="note-remove-btn" onClick={() => removeNote(i)}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="add-note-btn" onClick={addNote}>
                <Plus size={14} /> Add Note
              </button>
            </div>
          </div>

          {/* Q&A */}
          <div className="form-group">
            <label className="form-label">Questions & Answers</label>
            <div className="qa-builder">
              {form.questions.map((qa, i) => (
                <div key={i} className="qa-builder-item">
                  <div className="qa-item-header">
                    <span className="qa-item-label">Q{i + 1}</span>
                    {form.questions.length > 1 && (
                      <button type="button" className="note-remove-btn" onClick={() => removeQA(i)}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <input
                    className="form-input"
                    value={qa.question}
                    onChange={e => updateQA(i, 'question', e.target.value)}
                    placeholder="Question…"
                  />
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: 80 }}
                    value={qa.answer}
                    onChange={e => updateQA(i, 'answer', e.target.value)}
                    placeholder="Answer…"
                  />
                </div>
              ))}
              <button type="button" className="add-note-btn" onClick={addQA}>
                <Plus size={14} /> Add Question
              </button>
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
    summary: ch.summary || '',
    shortNotes: ch.shortNotes?.length ? ch.shortNotes : [''],
    pdfLink: ch.pdfLink || '',
    youtubeLink: ch.youtubeLink || '',
    questions: ch.questions?.length ? ch.questions : [{ question: '', answer: '' }],
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
        <div className="admin-table-wrapper">
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
        </div>
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
    { label: 'Classes', value: stats.classes, icon: GraduationCap, color: '#D4AF37' },
    { label: 'Subjects', value: stats.subjects, icon: Library, color: '#3d9e7a' },
    { label: 'Chapters', value: stats.chapters, icon: Layers, color: '#818cf8' },
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
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{
              background: 'var(--admin-surface)',
              border: '1px solid var(--admin-border)',
              borderRadius: 10,
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-faint)' }}>{card.label}</span>
                <Icon size={18} style={{ color: card.color }} />
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--text-main)', lineHeight: 1 }}>{card.value}</span>
            </div>
          );
        })}
      </div>

      <div style={{
        background: 'var(--admin-surface)',
        border: '1px solid var(--admin-border)',
        borderRadius: 10,
        padding: '2rem',
        color: 'var(--text-faint)',
        fontSize: '0.9rem',
        lineHeight: 1.7,
      }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>Quick Guide</h3>
        <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'decimal' }}>
          <li>Start by creating <strong style={{ color: 'var(--text-muted)' }}>Classes</strong> (e.g. "Class X").</li>
          <li>Add <strong style={{ color: 'var(--text-muted)' }}>Subjects</strong> and assign each to a class.</li>
          <li>Create <strong style={{ color: 'var(--text-muted)' }}>Chapters</strong> with rich content — summaries, short notes, Q&amp;A pairs, PDF and video links.</li>
          <li>Students will immediately see your content on the public site.</li>
        </ol>
      </div>
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
      <div className="admin-login-page">
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
  ];

  const renderPanel = () => {
    switch (activePanel) {
      case 'classes':   return <ClassesPanel token={token} showToast={showToast} />;
      case 'subjects':  return <SubjectsPanel token={token} showToast={showToast} />;
      case 'chapters':  return <ChaptersPanel token={token} showToast={showToast} />;
      default:          return <Dashboard token={token} />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <p className="admin-sidebar-brand">Magic Study Garden</p>
          <p className="admin-sidebar-sub">Content Manager</p>
        </div>

        <nav className="admin-sidebar-nav">
          <p className="sidebar-nav-label">Navigation</p>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`sidebar-nav-item ${activePanel === id ? 'active' : ''}`}
              onClick={() => setActivePanel(id)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="sidebar-nav-item" onClick={handleLogout} style={{ color: '#ef4444', width: '100%' }}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-topbar">
          <span className="admin-topbar-title">
            {NAV_ITEMS.find(n => n.id === activePanel)?.label || 'Admin'}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>
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
