import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

export default function Modules() {
  const { profile } = useAuth()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const isInstructor = profile?.role === 'instructor'

  // Fetch all modules from Firestore
  const loadModules = async () => {
    const snap = await getDocs(collection(db, 'modules'))
    setModules(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => {
    loadModules()
  }, [])

  // Save a new module to Firestore
  const handleCreate = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await addDoc(collection(db, 'modules'), {
        name: name.trim(),
        description: description.trim(),
        instructor: profile?.name,
        progress: 0,
        createdAt: serverTimestamp(),
      })
      setName('')
      setDescription('')
      setShowForm(false)
      loadModules()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>Modules</h1>
          <p style={styles.sub}>All your enrolled courses</p>
        </div>
        {/* Only instructors can see the create button */}
        {isInstructor && (
          <button
            onClick={() => setShowForm(v => !v)}
            style={styles.createBtn}
          >
            {showForm ? 'Cancel' : '+ Create module'}
          </button>
        )}
      </div>

      {/* Create module form — only visible when showForm is true */}
      {showForm && (
        <div style={styles.formCard}>
          <div style={styles.cardTitle}>New module</div>
          <div style={styles.fieldRow}>
            <div style={styles.field}>
              <label style={styles.label}>Module name</label>
              <input
                style={styles.input}
                placeholder="e.g. Introduction to Python"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <input
                style={styles.input}
                placeholder="Brief description..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            style={styles.saveBtn}
          >
            {saving ? 'Creating...' : 'Create module'}
          </button>
        </div>
      )}

      {loading && (
        <p style={{ color: 'var(--text-muted)' }}>Loading modules...</p>
      )}

      {!loading && modules.length === 0 && (
        <div style={styles.empty}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>No modules yet</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {isInstructor
              ? 'Create your first module above.'
              : 'Your instructor has not created any modules yet.'}
          </div>
        </div>
      )}

      {/* Module cards grid */}
      <div style={styles.grid}>
        {modules.map(m => (
          <div key={m.id} style={styles.moduleCard}>
            <div style={styles.moduleTop}>
              <span style={styles.moduleIcon}>📘</span>
              <div style={styles.moduleTitle}>{m.name}</div>
            </div>
            {m.description && (
              <div style={styles.moduleDesc}>{m.description}</div>
            )}
            <div style={styles.moduleInstructor}>
              👤 {m.instructor || 'Instructor'}
            </div>
            {/* Progress bar showing module completion */}
            <div style={styles.progressWrap}>
              <div style={{
                ...styles.progressFill,
                width: `${m.progress || 0}%`
              }} />
            </div>
            <div style={styles.progressLabel}>
              {m.progress || 0}% complete
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24,
  },
  h1: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  sub: { color: 'var(--text-muted)', fontSize: 14 },
  createBtn: {
    background: 'var(--blue)', color: '#fff',
    border: 'none', borderRadius: 8,
    padding: '10px 20px', fontWeight: 600,
    fontSize: 14, cursor: 'pointer',
  },
  formCard: {
    background: 'var(--surface)', borderRadius: 'var(--radius)',
    padding: '20px', boxShadow: 'var(--shadow)',
    marginBottom: 20, display: 'flex',
    flexDirection: 'column', gap: 14,
  },
  cardTitle: { fontWeight: 600, fontSize: 15 },
  fieldRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500 },
  input: {
    padding: '10px 14px', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 14, outline: 'none',
    fontFamily: 'inherit',
  },
  saveBtn: {
    background: 'var(--blue)', color: '#fff',
    border: 'none', borderRadius: 8,
    padding: '10px 20px', fontWeight: 600,
    fontSize: 14, cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  empty: {
    textAlign: 'center', padding: '60px 20px',
    background: 'var(--surface)', borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  moduleCard: {
    background: 'var(--surface)', borderRadius: 'var(--radius)',
    padding: '20px', boxShadow: 'var(--shadow)',
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  moduleTop: { display: 'flex', alignItems: 'center', gap: 10 },
  moduleIcon: { fontSize: 28 },
  moduleTitle: { fontWeight: 600, fontSize: 15 },
  moduleDesc: { fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 },
  moduleInstructor: { fontSize: 12, color: 'var(--text-muted)' },
  progressWrap: {
    height: 5, background: 'var(--blue-light)',
    borderRadius: 99, overflow: 'hidden', marginTop: 4,
  },
  progressFill: {
    height: '100%', background: 'var(--blue)', borderRadius: 99,
  },
  progressLabel: { fontSize: 11, color: 'var(--text-muted)' },
}