import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

function timeAgo(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = Math.floor((Date.now() - d) / 1000)
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

  useEffect(() => {
    const q = query(
      collection(db, 'discussions'),
      orderBy('createdAt', 'desc')
    )
    const unsubscribe = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsubscribe()
  }, [])

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
        upvotes: 0,
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
      <p style={styles.sub}>Ask questions, share knowledge, support your peers</p>

      <div style={styles.postList}>
        {posts.length === 0 && (
          <div style={styles.empty}>No discussions yet — be the first to post!</div>
        )}
        {posts.map(post => (
          <div key={post.id} style={styles.postCard}>
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
                  {post.isAnonymous && (
                    <span style={styles.anonBadge}>Anonymous</span>
                  )}
                </div>
                <div style={styles.timeAgo}>{timeAgo(post.createdAt)}</div>
              </div>
            </div>
            <div style={styles.postTitle}>{post.title}</div>
            <div style={styles.postBody}>{post.body}</div>
            <div style={styles.postFooter}>
              <span style={styles.replyCount}>💬 {post.replies || 0} replies</span>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.compose}>
        <div style={styles.cardTitle}>Post a discussion</div>
        <input
          style={styles.input}
          placeholder="Title — what's your question or topic?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={120}
        />
        <textarea
          style={styles.textarea}
          placeholder="Give more detail — the more context the better…"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
        />
        <div style={styles.composeFooter}>
          <div style={styles.anonNote}>
            💡 Post anonymously to avoid fear of judgment
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
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
    </div>
  )
}

const styles = {
  h1: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  sub: { color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 },
  postList: {
    display: 'flex', flexDirection: 'column',
    gap: 12, marginBottom: 24
  },
  empty: {
    color: 'var(--text-muted)', fontSize: 14,
    textAlign: 'center', padding: '40px 0'
  },
  postCard: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    padding: '18px 20px',
    boxShadow: 'var(--shadow)',
  },
  authorRow: {
    display: 'flex', alignItems: 'center',
    gap: 10, marginBottom: 10
  },
  avatar: {
    width: 34, height: 34, borderRadius: '50%',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700, fontSize: 15, flexShrink: 0,
  },
  authorName: { fontWeight: 600, fontSize: 14 },
  anonBadge: {
    marginLeft: 8, fontSize: 11,
    background: 'var(--border)',
    borderRadius: 20, padding: '2px 8px',
    color: 'var(--text-muted)',
  },
  timeAgo: { fontSize: 12, color: 'var(--text-muted)' },
  postTitle: { fontWeight: 600, fontSize: 16, marginBottom: 6 },
  postBody: {
    fontSize: 14, color: 'var(--text-muted)',
    lineHeight: 1.6, marginBottom: 14
  },
  postFooter: {
    display: 'flex', gap: 16, alignItems: 'center',
    borderTop: '1px solid var(--border)', paddingTop: 10
  },
  voteBtn: {
    background: 'var(--blue-light)', color: 'var(--blue)',
    border: 'none', borderRadius: 6,
    padding: '4px 12px', fontSize: 13,
    fontWeight: 600, cursor: 'pointer',
  },
  replyCount: { fontSize: 13, color: 'var(--text-muted)' },
  compose: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    padding: '20px', boxShadow: 'var(--shadow)',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  cardTitle: { fontWeight: 600, fontSize: 15 },
  input: {
    padding: '10px 14px',
    border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 14,
    outline: 'none', width: '100%',
    fontFamily: 'inherit',
  },
  textarea: {
    padding: '10px 14px',
    border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 14,
    outline: 'none', resize: 'vertical',
    width: '100%', fontFamily: 'inherit',
  },
  composeFooter: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: 10
  },
  anonNote: { fontSize: 13, color: 'var(--text-muted)' },
  btnPrimary: {
    background: 'var(--blue)', color: '#fff',
    border: 'none', borderRadius: 8,
    padding: '10px 20px', fontWeight: 600,
    fontSize: 14, cursor: 'pointer',
  },
  btnAnon: {
    background: 'var(--border)', color: 'var(--text)',
    border: 'none', borderRadius: 8,
    padding: '10px 20px', fontWeight: 600,
    fontSize: 14, cursor: 'pointer',
  },
}