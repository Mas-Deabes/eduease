import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

// Converts a Firebase timestamp into a human readable string like "5m ago"
function timeAgo(ts) {
  if (!ts) return ''
  const diff = Math.floor((Date.now() - ts.toDate()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function Discussions() {
  const { user, profile } = useAuth()
  const [posts, setPosts] = useState([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Listen for new posts in real time using onSnapshot
  useEffect(() => {
    const q = query(collection(db, 'discussions'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsubscribe()
  }, [])

  // Save a new post to Firestore
  const handlePost = async (isAnonymous) => {
    if (!title.trim() || !body.trim()) return
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'discussions'), {
        title: title.trim(),
        body: body.trim(),
        isAnonymous,
        authorId: user.uid,
        authorName: isAnonymous ? 'Anonymous' : profile?.name || 'Student',
        createdAt: serverTimestamp(),
        replies: 0,
      })
      setTitle('')
      setBody('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 style={styles.h1}>Discussions</h1>
      <p style={styles.sub}>Ask questions and support your peers</p>

      {/* List of posts */}
      <div style={styles.list}>
        {posts.length === 0 && (
          <div style={styles.empty}>No discussions yet. Be the first to post!</div>
        )}

        {posts.map(post => (
          <div key={post.id} style={styles.card}>

            {/* Author row */}
            <div style={styles.authorRow}>
              <div style={{
                ...styles.avatar,
                background: post.isAnonymous ? 'var(--border)' : 'var(--blue-light)',
                color: post.isAnonymous ? 'var(--text-muted)' : 'var(--blue)',
              }}>
                {post.isAnonymous ? '?' : post.authorName?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={styles.authorName}>
                  {post.authorName}
                  {post.isAnonymous && <span style={styles.badge}>Anonymous</span>}
                </div>
                <div style={styles.time}>{timeAgo(post.createdAt)}</div>
              </div>
            </div>

            {/* Post content */}
            <div style={styles.postTitle}>{post.title}</div>
            <div style={styles.postBody}>{post.body}</div>

          </div>
        ))}
      </div>

      {/* Compose box */}
      <div style={styles.compose}>
        <div style={styles.composeTitle}>Post a discussion</div>

        <input
          style={styles.input}
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={120}
        />

        <textarea
          style={styles.textarea}
          placeholder="What do you want to discuss?"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
        />

        <div style={styles.btnRow}>
          <button
            disabled={submitting || !title.trim() || !body.trim()}
            onClick={() => handlePost(false)}
            style={styles.btnPrimary}
          >
            Post publicly
          </button>
          <button
            disabled={submitting || !title.trim() || !body.trim()}
            onClick={() => handlePost(true)}
            style={styles.btnAnon}
          >
            Post anonymously
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  h1: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  sub: { color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 },
  list: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 },
  empty: { color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '40px 0' },
  card: {
    background: 'var(--surface)', borderRadius: 'var(--radius)',
    padding: '18px 20px', boxShadow: 'var(--shadow)',
  },
  authorRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: {
    width: 34, height: 34, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 15, flexShrink: 0,
  },
  authorName: { fontWeight: 600, fontSize: 14 },
  badge: {
    marginLeft: 8, fontSize: 11, background: 'var(--border)',
    borderRadius: 20, padding: '2px 8px', color: 'var(--text-muted)',
  },
  time: { fontSize: 12, color: 'var(--text-muted)' },
  postTitle: { fontWeight: 600, fontSize: 16, marginBottom: 6 },
  postBody: { fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 },
  compose: {
    background: 'var(--surface)', borderRadius: 'var(--radius)',
    padding: '20px', boxShadow: 'var(--shadow)',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  composeTitle: { fontWeight: 600, fontSize: 15 },
  input: {
    padding: '10px 14px', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 14, outline: 'none',
    width: '100%', fontFamily: 'inherit',
  },
  textarea: {
    padding: '10px 14px', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 14, outline: 'none',
    resize: 'vertical', width: '100%', fontFamily: 'inherit',
  },
  btnRow: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  btnPrimary: {
    background: 'var(--blue)', color: '#fff',
    border: 'none', borderRadius: 8, padding: '10px 20px',
    fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
  btnAnon: {
    background: 'var(--border)', color: 'var(--text)',
    border: 'none', borderRadius: 8, padding: '10px 20px',
    fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
}