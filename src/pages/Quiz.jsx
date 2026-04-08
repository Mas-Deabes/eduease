import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

export default function Quiz() {
  const { quizId } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)

  // Load the quiz document from Firestore using the ID from the URL
  useEffect(() => {
    getDoc(doc(db, 'quizzes', quizId)).then(snap => {
      if (snap.exists()) {
        setQuiz({ id: snap.id, ...snap.data() })
      }
      setLoading(false)
    })
  }, [quizId])


  // Record the student's selected answer for the current question
  const handleSelect = (oi) => {
    if (selected !== null) return  // prevent changing answer after selecting
    setSelected(oi)
  }

  // Move to the next question or submit if it was the last one
  const handleNext = () => {
    const newAnswers = [...answers, selected]
    setAnswers(newAnswers)
    setSelected(null)

    if (current + 1 < quiz.questions.length) {
      // More questions remaining — move to next
      setCurrent(c => c + 1)
    } else {
      // Last question — calculate score and save result
      const correct = newAnswers.filter(
        (ans, i) => ans === quiz.questions[i].correct
      ).length

      const pct = Math.round((correct / quiz.questions.length) * 100)
      setScore(pct)
      setSubmitted(true)

      // Save the result to Firestore so it appears on the dashboard
      addDoc(collection(db, 'quizResults'), {
        studentId: user.uid,
        studentName: profile?.name,
        quizId,
        quizTitle: quiz.title,
        score: pct,
        correctCount: correct,
        totalQuestions: quiz.questions.length,
        completedAt: serverTimestamp(),
      })
    }
  }

  if (submitted) {
    const passed = score >= 40
    return (
      <div style={styles.resultPage}>
        <div style={styles.resultCard}>
          <div style={styles.resultEmoji}>
            {score >= 70 ? '🎉' : score >= 40 ? '👍' : '📚'}
          </div>
          <h2 style={styles.resultTitle}>{quiz.title}</h2>
          <div style={{
            ...styles.bigScore,
            color: passed ? 'var(--green)' : 'var(--red)'
          }}>
            {score}%
          </div>
          <div style={styles.resultSub}>
            {answers.filter((a, i) => a === quiz.questions[i].correct).length}
            {' '}/ {quiz.questions.length} correct
          </div>
          {!passed && (
            <div style={styles.resultWarning}>
              You scored below 40%. Consider reviewing this topic and retaking the quiz.
            </div>
          )}
          <button
            onClick={() => navigate('/assignments')}
            style={styles.doneBtn}
          >
            Back to assignments
          </button>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div style={styles.center}>Loading quiz...</div>
  )

  if (!quiz) return (
    <div style={styles.center}>Quiz not found.</div>
  )

  const q = quiz.questions[current]
  const optionLabels = ['A', 'B', 'C', 'D']
  const progress = (current / quiz.questions.length) * 100

  return (
    <div style={styles.quizPage}>

      {/* Progress bar at the top */}
      <div style={styles.progressWrap}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>
      <div style={styles.progressText}>
        Question {current + 1} of {quiz.questions.length}
      </div>

      <div style={styles.quizCard}>
        <div style={styles.quizMeta}>{quiz.title}</div>

        {/* Question text */}
        <div style={styles.questionBox}>
          <div style={styles.questionText}>
            {current + 1}. {q.text}
          </div>
        </div>

        {/* Answer options */}
        <div style={styles.optionsGrid}>
          {q.options.map((opt, oi) => {
            // Determine the colour of each option based on selection state
            let bg = 'var(--surface)'
            let border = 'var(--border)'
            let color = 'var(--text)'

            if (selected !== null) {
              if (oi === q.correct) {
                // Always highlight the correct answer green after selecting
                bg = 'var(--green-light)'
                border = 'var(--green)'
                color = 'var(--green)'
              } else if (oi === selected && selected !== q.correct) {
                // Highlight wrong selection in red
                bg = 'var(--red-light)'
                border = 'var(--red)'
                color = 'var(--red)'
              }
            }

            return (
              <button
                key={oi}
                onClick={() => handleSelect(oi)}
                style={{
                  ...styles.optionBtn,
                  background: bg,
                  borderColor: border,
                  color,
                  cursor: selected !== null ? 'default' : 'pointer',
                }}
              >
                <span style={styles.optionLabel}>{optionLabels[oi]}</span>
                {opt}
              </button>
            )
          })}
        </div>

        {/* Show feedback and next button after selecting */}
        {selected !== null && (
          <div style={styles.feedbackRow}>
            <div style={{
              fontSize: 14, fontWeight: 500,
              color: selected === q.correct ? 'var(--green)' : 'var(--red)'
            }}>
              {selected === q.correct
                ? '✓ Correct!'
                : `✗ Incorrect — correct answer was ${optionLabels[q.correct]}`
              }
            </div>
            <button onClick={handleNext} style={styles.nextBtn}>
              {current + 1 < quiz.questions.length
                ? 'Next question →'
                : 'Submit quiz'
              }
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  center: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', height: '60vh',
    color: 'var(--text-muted)',
  },
  quizPage: { maxWidth: 680, margin: '0 auto' },
  progressWrap: {
    height: 6, background: 'var(--border)',
    borderRadius: 99, overflow: 'hidden', marginBottom: 8,
  },
  progressFill: {
    height: '100%', background: 'var(--blue)',
    borderRadius: 99, transition: 'width .4s',
  },
  progressText: {
    fontSize: 13, color: 'var(--text-muted)',
    textAlign: 'right', marginBottom: 24,
  },
  quizCard: {
    background: 'var(--blue-light)',
    borderRadius: 20, padding: '32px',
    boxShadow: 'var(--shadow-md)',
  },
  quizMeta: {
    fontSize: 13, color: 'var(--blue)',
    fontWeight: 600, marginBottom: 20,
    textTransform: 'uppercase', letterSpacing: '.05em',
  },
  questionBox: {
    background: '#fff', borderRadius: 12,
    padding: '20px 24px', marginBottom: 28,
  },
  questionText: { fontSize: 18, fontWeight: 600, lineHeight: 1.5 },
  optionsGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
  },
  optionBtn: {
    display: 'flex', alignItems: 'center', gap: 12,
    border: '2px solid', borderRadius: 12,
    padding: '16px 18px', fontSize: 15,
    fontWeight: 500, textAlign: 'left',
    transition: 'all .15s',
  },
  optionLabel: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'var(--purple-light)', color: 'var(--purple)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 13, flexShrink: 0,
  },
  feedbackRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 20,
    paddingTop: 16, borderTop: '1px solid rgba(0,0,0,.08)',
  },
  nextBtn: {
    background: 'var(--blue)', color: '#fff',
    border: 'none', borderRadius: 10,
    padding: '12px 24px', fontWeight: 600,
    fontSize: 15, cursor: 'pointer',
  },
  resultPage: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh',
  },
  resultCard: {
    background: 'var(--surface)', borderRadius: 20,
    padding: '40px 48px', boxShadow: 'var(--shadow-md)',
    textAlign: 'center', maxWidth: 400, width: '100%',
  },
  resultEmoji: { fontSize: 48, marginBottom: 12 },
  resultTitle: { fontSize: 18, fontWeight: 700, marginBottom: 16 },
  bigScore: { fontSize: 64, fontWeight: 800, lineHeight: 1 },
  resultSub: {
    fontSize: 16, color: 'var(--text-muted)',
    marginTop: 8, marginBottom: 20,
  },
  resultWarning: {
    background: 'var(--amber-light)', color: 'var(--amber)',
    borderRadius: 10, padding: '12px 16px',
    fontSize: 13, marginBottom: 20,
  },
  doneBtn: {
    background: 'var(--blue)', color: '#fff',
    border: 'none', borderRadius: 10,
    padding: '14px 28px', fontWeight: 600,
    fontSize: 15, cursor: 'pointer', width: '100%',
  },
}