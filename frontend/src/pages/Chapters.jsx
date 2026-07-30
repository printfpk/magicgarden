import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { Bookmark } from 'lucide-react';
import '../mobile-home.css';

export default function Chapters() {
  const { subjectId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const chapRes = await axios.get(`/api/subjects/${subjectId}/chapters`);
        setChapters(chapRes.data);

        // Fetch all classes, then their subjects, to find this subject's name
        const clsRes = await axios.get('/api/classes');

        // Find subject name by fetching subjects for each class until we find ours
        for (const cls of clsRes.data) {
          const subRes = await axios.get(`/api/classes/${cls._id}/subjects`);
          const found = subRes.data.find(s => s._id === subjectId);
          if (found) {
            setSubjectName(found.name);
            break;
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [subjectId]);

  return (
    <div style={{ padding: '1.25rem' }}>
      <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '0.5rem' }}>
        <Link to="/classes" style={{ color: '#999', textDecoration: 'none' }}>Classes</Link> / {subjectName || 'Subject'}
      </p>
      <h2 className="section-title">Chapters</h2>

      <section className="chapters-section" style={{ marginTop: '1rem' }}>
        {loading ? (
          <div style={{ color: '#999' }}>Loading chapters...</div>
        ) : chapters.length > 0 ? (
          <div className="chapters-list">
            {chapters.map((chap, idx) => (
              <Link to={`/chapters/${chap._id}`} key={chap._id} className="chapter-card" style={{ textDecoration: 'none' }}>
                <div className="chapter-info">
                  <h3>Chapter: {String(chap.order || idx + 1).padStart(2, '0')}</h3>
                  <p className="chapter-desc">{chap.title}</p>
                  {chap.summary && <p className="chapter-sub-desc">{chap.summary.substring(0, 50)}...</p>}
                </div>
                <div className="chapter-bookmark">
                  <Bookmark size={28} color="#9333EA" fill="#9333EA" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ color: '#999', marginTop: '1rem' }}>
            No chapters available for this subject.
          </div>
        )}
      </section>
    </div>
  );
}
