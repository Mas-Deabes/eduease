import { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts'

// Days for the bar chart
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Draws a circular progress ring using SVG
function ProgressRing({ pct, color = 'var(--blue)' }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={90} height={90}>
      <circle cx={45} cy={45} r={r} fill="none" stroke="var(--border)" strokeWidth={8} />
      <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 45 45)" />
      <text x={45} y={51} textAnchor="middle" fontSize={18} fontWeight={700} fill={color}>
        {pct}%
      </text>
    </svg>
  )
}

// A single stat card showing a number and label
function StatCard({ label, value, sub, color = 'var(--blue)' }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}S
    </div>
  )
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [quizzes, setQuizzes] = useState([])

  // Load this student's quiz results from Firestore
  useEffect(() => {
    if (!user) return
    getDocs(query(collection(db, 'quizResults'), where('studentId', '==', user.uid)))
      .then(snap => setQuizzes(snap.docs.map(d => d.data())))
  }, [user])

  // Calculate average score across all quizzes
  const avg = quizzes.length
    ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length)
    : 0

  // At risk if average is below 40% and at least one quiz has been taken
  const isAtRisk = avg < 40 && quizzes.length > 0

  // Count quizzes completed per day for the bar chart
  const chartData = DAYS.map((day, i) => ({
    day,
    quizzes: quizzes.filter(q => {
      if (!q.completedAt) return false
      return q.completedAt.toDate().getDay() === (i + 1) % 7
    }).length
  }))

  return (
    <div>
      <h1 style={styles.h1}>Dashboard</h1>
      <p style={styles.sub}>Welcome back, {profile?.name?.split(' ')[0] || 'there'}</p>

      {/* Warning banner — only shows if student is at risk */}
      {isAtRisk && (
        <div style={styles.warning}>
          Your quiz average is {avg}% — below the 40% pass threshold. Contact your instructor.
        </div>
      )}

      {/* Four stat cards */}
      <div style={styles.statsRow}>

        <StatCard label="Quiz average" value={`${avg}%`}
          sub={isAtRisk ? 'Below threshold' : quizzes.length > 0 ? 'Passing' : 'No quizzes yet'}
          color={isAtRisk ? 'var(--red)' : 'var(--green)'} />

        <StatCard label="Quizzes done" value={quizzes.length} color="var(--purple)" />

        <StatCard label="Attendance" value={`${profile?.attendanceRate || 0}%`} color="var(--amber)" />

        <StatCard label="Role" value={profile?.role || 'student'} color="var(--blue)" />
        
      </div>

      {/* Charts row */}
      <div style={styles.chartsRow}>

        {/* Bar chart — quiz activity per day */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Quiz activity this week</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="day" axisLine={false} tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Bar dataKey="quizzes" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i}
                    fill={i === new Date().getDay() - 1 ? 'var(--blue)' : 'var(--blue-light)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Progress ring */}
        <div style={{ ...styles.card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={styles.cardTitle}>Overall progress</div>
          <ProgressRing pct={avg} color={isAtRisk ? 'var(--red)' : 'var(--blue)'} />
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {isAtRisk ? 'Keep going!' : quizzes.length > 0 ? 'Great work!' : 'Complete a quiz to start'}
          </div>
        </div>
      </div>

      {/* Recent quiz results */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Recent results</div>
        {quizzes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No quizzes yet. Go to Assignments to start!</p>
        ) : (
          <div style={styles.resultsList}>
            {quizzes.slice(0, 5).map((q, i) => (
              <div key={i} style={styles.resultRow}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{q.quizTitle || 'Quiz'}</div>
                <div style={{
                  ...styles.score,
                  color: q.score >= 40 ? 'var(--green)' : 'var(--red)',
                  background: q.score >= 40 ? 'var(--green-light)' : 'var(--red-light)'
                }}>
                  {q.score}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  h1: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  sub: { color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 },
  warning: {
    display: 'flex', gap: 14, alignItems: 'flex-start',
    background: 'var(--red-light)', border: '1px solid #f5c6c6',
    borderRadius: 12, padding: '14px 18px',
    marginBottom: 20, color: 'var(--red)',
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14, marginBottom: 20
  },
  statCard: {
    background: 'var(--surface)', borderRadius: 'var(--radius)',
    padding: '18px 20px', boxShadow: 'var(--shadow)',
  },
  chartsRow: {
    display: 'grid', gridTemplateColumns: '2fr 1fr',
    gap: 14, marginBottom: 20
  },
  card: {
    background: 'var(--surface)', borderRadius: 'var(--radius)',
    padding: '20px', boxShadow: 'var(--shadow)', marginBottom: 20,
  },
  cardTitle: { fontWeight: 600, fontSize: 15, marginBottom: 16 },
  resultsList: { display: 'flex', flexDirection: 'column', gap: 10 },
  resultRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '10px 14px',
    border: '1px solid var(--border)', borderRadius: 8,
  },
  resultTitle: { fontWeight: 500, fontSize: 14 },
  resultScore: {
    fontWeight: 700, fontSize: 14,
    padding: '4px 12px', borderRadius: 20,
  },
}