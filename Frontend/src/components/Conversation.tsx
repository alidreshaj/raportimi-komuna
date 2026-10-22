import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import type { FormEvent } from 'react'
import { addComment, getComments } from '../api/comments'
import { useAuth } from '../context/useAuth'
import type { CommentItem } from '../types'
import { formatDateTime } from '../utils/format'
import './Conversation.css'

const MAX_LENGTH = 1000 // njësoj si te backend-i (CreateCommentDto)

// Biseda e një raporti: mesazhet mes qytetarit dhe komunës, dhe forma për të shkruar një mesazh të ri.
// Merr vetëm numrin e raportit dhe e ngarkon vetë bisedën, kështu e ripërdorim edhe te paneli i adminit.
function Conversation({ reportId }: { reportId: number }) {
  const { user } = useAuth()

  // null = ende po ngarkohet; [] = ngarkuar dhe bosh.
  const [comments, setComments] = useState<CommentItem[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  const [text, setText] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let cancelled = false

    getComments(reportId)
      .then((list) => {
        if (!cancelled) setComments(list)
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [reportId, attempt])

  function retry() {
    setLoadError(null)
    setComments(null)
    setAttempt((n) => n + 1)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!text.trim()) {
      setSendError('Shkruaj një mesazh.')
      return
    }

    setSendError(null)
    setSending(true)

    try {
      const created = await addComment(reportId, text.trim())
      // Serveri e ktheu mesazhin e krijuar: e shtojmë te lista pa e rikarkuar gjithçka.
      setComments((prev) => [...(prev ?? []), created])
      setText('')
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Ndodhi një gabim. Provo përsëri.')
    } finally {
      setSending(false)
    }
  }

  // Etiketa e autorit: "Ti" për mesazhet e mia, "Komuna" për adminin, përndryshe emri i qytetarit.
  function authorLabel(comment: CommentItem): string {
    if (comment.authorRole === user?.role) return 'Ti'
    return comment.authorRole === 'Admin' ? 'Komuna' : comment.authorName
  }

  return (
    <section className="conversation" aria-labelledby="conversation-title">
      <h2 id="conversation-title" className="conversation-title">
        Biseda me komunën
      </h2>

      {/* Po ngarkohet */}
      {!comments && !loadError && (
        <p className="conversation-note" role="status">
          Po ngarkohet biseda...
        </p>
      )}

      {/* Gabim */}
      {loadError && (
        <div className="conversation-note">
          <p className="form-error" role="alert">
            {loadError}
          </p>
          <button type="button" className="btn-outline" onClick={retry}>
            Provo përsëri
          </button>
        </div>
      )}

      {/* Bosh */}
      {comments && comments.length === 0 && (
        <p className="conversation-note">Nuk ka mesazhe ende. Shkruaj të parin më poshtë.</p>
      )}

      {/* Mesazhet */}
      {comments && comments.length > 0 && (
        <ul className="messages">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className={`message ${comment.authorRole === 'Admin' ? 'message--municipality' : 'message--citizen'}`}
            >
              <span className="message-meta">
                <strong>{authorLabel(comment)}</strong> · {formatDateTime(comment.createdAt)}
              </span>
              <div className="message-bubble">{comment.text}</div>
            </li>
          ))}
        </ul>
      )}

      {/* Forma e mesazhit të ri */}
      <form className="message-form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="message">Shkruaj një mesazh</label>
          <textarea
            id="message"
            rows={3}
            maxLength={MAX_LENGTH}
            placeholder="Shkruaj këtu..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <span className="field-hint">
            {text.length}/{MAX_LENGTH}
          </span>
        </div>

        {sendError && (
          <p className="form-error" role="alert">
            {sendError}
          </p>
        )}

        <div className="message-form-actions">
          <button type="submit" className="btn btn-primary" disabled={sending}>
            {!sending && <Send size={16} aria-hidden="true" />}
            {sending ? 'Duke dërguar...' : 'Dërgo'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default Conversation
