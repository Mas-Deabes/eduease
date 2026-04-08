import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useNavigate } from 'react-router-dom'

export default function Assignments() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Load all active quizzes from Firestore ordered by newest first
  useEffect(() => {
    getDocs(collection(db, 'quizzes'))
      .then(snap => {
        setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <h1 style={styles.h1}>Assignments</h1>
      <p style={styles.sub}>
        All active quizzes from your instructors
      </p>

      {loading && (
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      )}

      {!loading && quizzes.length === 0 && (
        <div style={styles.empty}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            No assignments yet
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Your instructor has not posted any quizzes yet.
          </div>
        </div>
      )}

      <div style={styles.list}>
        {quizzes.map(quiz => {
          const created = quiz.createdAt?.toDate?.() || new Date()
          const dateStr = created.toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
          })
          const qCount = quiz.questions?.length || 0

          return (
            <div key={quiz.id} style={styles.card}>
              <div style={styles.cardLeft}>
                <div style={styles.iconWrap}>📝</div>
                <div>
                  <div style={styles.quizTitle}>{quiz.title}</div>
                  <div style={styles.quizMeta}>
                    {quiz.module && (
                      <span style={styles.tag}>{quiz.module}</span>
                    )}
                    <span style={styles.metaItem}>
                      by {quiz.instructorName || 'Instructor'}
                    </span>
                    <span style={styles.metaItem}>
                      · {qCount} question{qCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
              <div style={styles.cardRight}>
                <div style={styles.dateLabel}>
                  🕐 Posted {dateStr}
                </div>
                <button
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                  style={styles.startBtn}
                >
                  Start quiz →
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  h1: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  sub: { color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 },
  empty: {
    textAlign: 'center', padding: '60px 20px',
    background: 'var(--surface)', borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    background: 'var(--surface)', borderRadius: 'var(--radius)',
    padding: '18px 20px', boxShadow: 'var(--shadow)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: 16,
  },
  cardLeft: { display: 'flex', alignItems: 'center', gap: 14, flex: 1 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 10,
    background: 'var(--blue-light)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 22, flexShrink: 0,
  },
  quizTitle: { fontWeight: 600, fontSize: 16, marginBottom: 4 },
  quizMeta: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  tag: {
    fontSize: 12, background: 'var(--purple-light)',
    color: 'var(--purple)', borderRadius: 20,
    padding: '2px 10px', fontWeight: 500,
  },
  metaItem: { fontSize: 13, color: 'var(--text-muted)' },
  cardRight: { display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 },
  dateLabel: {
    display: 'flex', alignItems: 'center',
    gap: 6, fontSize: 13, color: 'var(--text-muted)',
  },
  startBtn: {
    background: 'var(--blue)', color: '#fff',
    border: 'none', borderRadius: 8, padding: '10px 20px',
    fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
}