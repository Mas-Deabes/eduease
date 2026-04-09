import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function InstructorOverview() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    // Get all students from the users collection
    const studentSnap = await getDocs(
      query(collection(db, 'users'), where('role', '==', 'student'))
    )

    // Get all quiz results
    const resultSnap = await getDocs(collection(db, 'quizResults'))
    const allResults = resultSnap.docs.map(d => d.data())

    // For each student work out their average quiz score
    const data = studentSnap.docs.map(d => {
      const student = { id: d.id, ...d.data() }
      const results = allResults.filter(r => r.studentId === student.id)
      const avg = results.length
        ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
        : null
      return { ...student, avg, quizCount: results.length }
    })

    setStudents(data)
    setLoading(false)
  }

  return (
    <div>
      <h1 style={styles.h1}>Students Overview</h1>
      <p style={styles.sub}>See how your students are performing</p>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading...</p>}

      <div style={styles.list}>
        {students.map(student => {
          const isAtRisk = student.avg !== null && student.avg < 40

          return (
            <div
              key={student.id}
              style={{
                ...styles.row,
                borderLeft: `4px solid ${isAtRisk ? 'var(--red)' : 'var(--blue)'}`,
              }}
            >
              {/* Avatar showing first letter of student name */}
              <div style={{
                ...styles.avatar,
                background: isAtRisk ? 'var(--red-light)' : 'var(--blue-light)',
                color: isAtRisk ? 'var(--red)' : 'var(--blue)',
              }}>
                {student.name?.[0]?.toUpperCase() || '?'}
              </div>

              {/* Student name and email */}
              <div style={{ flex: 1 }}>
                <div style={styles.name}>{student.name}</div>
                <div style={styles.email}>{student.email}</div>
              </div>

              {/* Quiz average score */}
              <div style={styles.stat}>
                <div style={{
                  fontWeight: 700, fontSize: 18,
                  color: isAtRisk ? 'var(--red)' : 'var(--green)'
                }}>
                  {student.avg !== null ? `${student.avg}%` : 'No quizzes'}
                </div>
                <div style={styles.statLabel}>
                  {student.quizCount} quizzes done
                </div>
              </div>

              {/* At risk badge - only shows if average is below 40% */}
              {isAtRisk && (
                <span style={styles.badge}>⚠ At risk</span>
              )}

              {/* Contact button - opens email client */}
              
                <a href={`mailto:${student.email}`}
                style={styles.contactBtn}
              >
                Contact
              </a>
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
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  row: {
    display: 'flex', alignItems: 'center', gap: 16,
    background: 'var(--surface)', borderRadius: 10,
    padding: '16px 20px', boxShadow: 'var(--shadow)',
  },
  avatar: {
    width: 40, height: 40, borderRadius: '50%',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: 700,
    fontSize: 16, flexShrink: 0,
  },
  name: { fontWeight: 600, fontSize: 15 },
  email: { fontSize: 12, color: 'var(--text-muted)' },
  stat: { textAlign: 'center', minWidth: 100 },
  statLabel: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 },
  badge: {
    fontSize: 12, fontWeight: 600,
    background: 'var(--red-light)', color: 'var(--red)',
    borderRadius: 20, padding: '4px 10px',
  },
  contactBtn: {
    background: 'var(--blue)', color: '#fff',
    borderRadius: 8, padding: '8px 16px',
    fontSize: 13, fontWeight: 600,
    textDecoration: 'none',
  },
}