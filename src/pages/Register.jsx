import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { Link, useNavigate } from 'react-router-dom'
import { auth, db } from '../lib/firebase'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const role = 'student'
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role,
        createdAt: serverTimestamp(),
        attendanceRate: 0,
        quizAvg: 0,
      })
      navigate('/dashboard')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered.')
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logoRow}>
          <div style={styles.logoMark}>E</div>
          <span style={styles.logoText}>EduEase</span>
        </div>

        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.sub}>Join EduEase today</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.field}>
            <label style={styles.label}>Full name</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              style={styles.input}
              placeholder="Your full name"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.input}
              placeholder="id@university.ac.uk"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Min. 6 characters"
            />
          </div>

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>

        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>

      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #e8f0fe 0%, #f4f6fb 60%, #ede7f6 100%)',
    padding: 16,
  },

  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 8px 40px rgba(26,115,232,.12)',
  },

  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoMark: {
    width: 36, height: 36, borderRadius: 10,
    background: 'var(--blue)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 18,
  },

  logoText: { fontWeight: 700, fontSize: 20 },
  title: { fontSize: 22, fontWeight: 600, marginBottom: 4 },
  sub: { color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 },
  error: {
    background: 'var(--red-light)', color: 'var(--red)',
    borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16,
  },

  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500 },
  input: {
    padding: '10px 14px', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 14, outline: 'none',
  },

  btn: {
    background: 'var(--blue)', color: '#fff',
    padding: '12px', borderRadius: 8,
    fontSize: 15, fontWeight: 600,
    marginTop: 4, border: 'none', cursor: 'pointer',
  },

  footer: { textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 },
  link: { color: 'var(--blue)', fontWeight: 500 },
}