import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

export default function QuizCreator() {
  const { user, profile } = useAuth()
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', '', ''], correct: 0 }
  ])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correct: 0 }])
  }

  const updateText = (qi, value) => {
    const updated = [...questions]
    updated[qi].text = value
    setQuestions(updated)
  }

  const updateOption = (qi, oi, value) => {
    const updated = [...questions]
    updated[qi].options[oi] = value
    setQuestions(updated)
  }

  const setCorrect = (qi, oi) => {
    const updated = [...questions]
    updated[qi].correct = oi
    setQuestions(updated)
  }

  const handleSave = async () => {
    if (!title.trim()) { alert('Please enter a title'); return }
    setSaving(true)
    await addDoc(collection(db, 'quizzes'), {
      title,
      questions,
      instructorName: profile?.name,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      active: true,
    })
    setTitle('')
    setQuestions([{ text: '', options: ['', '', '', ''], correct: 0 }])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <h1 style={styles.h1}>Quiz Creator</h1>
      <p style={styles.sub}>Create a quiz for your students</p>

      {saved && (
        <div style={styles.success}>
          Quiz published! Students can see it in Assignments.
        </div>
      )}

      <div style={styles.card}>
        <label style={styles.label}>Quiz title</label>
        <input
          style={styles.input}
          placeholder="Week 1 - Python Basics"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      {questions.map((q, qi) => (
        <div key={qi} style={styles.card}>
          <div style={styles.qTitle}>Question {qi + 1}</div>

          <label style={styles.label}>Question text</label>
          <input
            style={styles.input}
            placeholder="Type your question..."
            value={q.text}
            onChange={e => updateText(qi, e.target.value)}
          />

          <div style={{ marginTop: 14 }}>
            <label style={styles.label}>
              Options - click the button to mark the correct answer
            </label>
            {q.options.map((opt, oi) => (
              <div key={oi} style={styles.optRow}>
                <button
                  onClick={() => setCorrect(qi, oi)}
                  style={{
                    ...styles.circle,
                    ...(q.correct === oi ? styles.circleActive : {})
                  }}
                >
                  {q.correct === oi ? 'OK' : 'O'}
                </button>
                <input
                  style={{ ...styles.input, flex: 1 }}
                  placeholder={`Option ${['A','B','C','D'][oi]}`}
                  value={opt}
                  onChange={e => updateOption(qi, oi, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={styles.actions}>
        <button onClick={addQuestion} style={styles.addBtn}>
          + Add question
        </button>
        <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
          {saving ? 'Publishing...' : 'Publish quiz'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  h1: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  sub: { color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 },
  success: {
    background: 'var(--green-light)', color: 'var(--green)',
    borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 14,
  },
  card: {
    background: 'var(--surface)', borderRadius: 'var(--radius)',
    padding: '20px', boxShadow: 'var(--shadow)',
    marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8,
  },
  qTitle: { fontWeight: 600, fontSize: 15, color: 'var(--blue)', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: 500 },
  input: {
    padding: '10px 14px', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit',
  },
  optRow: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 },
  circle: {
    width: 36, height: 28, borderRadius: 6,
    border: '2px solid var(--border)', background: '#fff',
    fontSize: 12, cursor: 'pointer', flexShrink: 0,
  },
  circleActive: {
    border: '2px solid var(--green)',
    color: 'var(--green)', background: 'var(--green-light)',
  },
  actions: { display: 'flex', justifyContent: 'space-between', marginTop: 4 },
  addBtn: {
    background: 'var(--blue-light)', color: 'var(--blue)',
    border: 'none', borderRadius: 8, padding: '12px 22px',
    fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
  saveBtn: {
    background: 'var(--blue)', color: '#fff',
    border: 'none', borderRadius: 8, padding: '12px 28px',
    fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
}