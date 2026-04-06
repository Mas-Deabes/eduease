import { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

function ProgressRing({ pct, color = 'var(--blue)' }) {
  const size = 90
  const stroke = 8
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <svg width={size} height={size}>
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke="var(--border)"
        strokeWidth={stroke}
      />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text
        x={size/2} y={size/2 + 6}
        textAnchor="middle"
        fontSize={18} fontWeight={700}
        fill={color}
      >
        {pct}%
      </text>
    </svg>
  )
}

function StatCard({ label, value, sub, color = 'var(--blue)' }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>
        {value}
      </div>
      <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const q = query(
        collection(db, 'quizResults'),
        where('studentId', '==', user.uid)
      )
      const snap = await getDocs(q)
      setQuizzes(snap.docs.map(d => d.data()))
      setLoading(false)
    }
    load()
  }, [user])

  const quizAvg = quizzes.length
    ? Math.round(quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length)
    : 0

  const isAtRisk = quizAvg < 40 && quizzes.length > 0

  const studyData = DAYS.map((day, i) => ({
    day,
    quizzes: quizzes.filter(q => {
      if (!q.completedAt) return false
      const d = q.completedAt.toDate()
      return d.getDay() === (i + 1) % 7
    }).length
  }))

  return (
    <div>
      <h1 style={styles.h1}>Dashboard</h1>
      <p style={styles.sub}>
        Welcome back, {profile?.name?.split(' ')[0] || 'there'} 👋
      </p>

      {isAtRisk && (
        <div style={styles.warning}>
          <span>⚠️</span>
          <div>
            <div style={{ fontWeight: 600 }}>You may be falling behind</div>
            <div style={{ fontSize: 13, marginTop: 2 }}>
              Your quiz average is {quizAvg}% — below the 40% pass threshold.
              Contact your instructor for support.
            </div>
          </div>
        </div>
      )}

      <div style={styles.statsRow}>
        <StatCard
          label="Quiz average"
          value={`${quizAvg}%`}
          sub={isAtRisk ? 'Below pass threshold' : quizzes.length > 0 ? 'Passing' : 'No quizzes yet'}
          color={isAtRisk ? 'var(--red)' : 'var(--green)'}
        />
        <StatCard
          label="Quizzes completed"
          value={quizzes.length}
          color="var(--purple)"
        />
        <StatCard
          label="Attendance rate"
          value={`${profile?.attendanceRate || 0}%`}
          color="var(--amber)"
        />
        <StatCard
          label="Role"
          value={profile?.role || 'student'}
          color="var(--blue)"
        />
      </div>

      <div style={styles.chartsRow}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Quiz activity this week</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={studyData} barSize={28}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'var(--blue-light)' }}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  fontSize: 13
                }}
              />
              <Bar dataKey="quizzes" radius={[4, 4, 0, 0]}>
                {studyData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === new Date().getDay() - 1
                      ? 'var(--blue)'
                      : 'var(--blue-light)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          ...styles.card,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12
        }}>
          <div style={styles.cardTitle}>Overall progress</div>
          <ProgressRing
            pct={quizAvg}
            color={isAtRisk ? 'var(--red)' : 'var(--blue)'}
          />
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            {isAtRisk
              ? 'Keep going!'
              : quizzes.length > 0
                ? 'Great work!'
                : 'Complete a quiz to start'
            }
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Recent quiz results</div>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</p>
        ) : quizzes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            No quizzes completed yet. Head to Assignments to get started!
          </p>
        ) : (
          <div style={styles.resultsList}>
            {quizzes.slice(0, 5).map((q, i) => (
              <div key={i} style={styles.resultRow}>
                <div style={styles.resultTitle}>{q.quizTitle || 'Quiz'}</div>
                <div style={{
                  ...styles.resultScore,
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