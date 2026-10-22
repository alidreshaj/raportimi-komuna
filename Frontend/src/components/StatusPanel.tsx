import { useState } from 'react'
import { CircleCheck, CircleX, Play } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { updateReportStatus } from '../api/reports'
import type { Report, ReportStatus } from '../types'
import ConfirmDialog from './ConfirmDialog'
import StatusBadge from './StatusBadge'

const MAX_REASON = 1000 // njësoj si te backend-i (UpdateStatusDto)

// Veprimet e lejuara nga secili status. Pasqyron rrugët e backend-it: New → InProgress → Resolved, ose New → Rejected.
// Backend-i i kontrollon prapë (409), por këtu shfaqim vetëm butonat që kanë kuptim.
const NEXT_STEPS: Record<ReportStatus, ReportStatus[]> = {
  New: ['InProgress', 'Rejected'],
  InProgress: ['Resolved'],
  Resolved: [],
  Rejected: [],
}

const ACTION_LABELS: Partial<Record<ReportStatus, string>> = {
  InProgress: 'Merre në shqyrtim',
  Resolved: 'Shëno si të zgjidhur',
  Rejected: 'Refuzo raportin',
}

const ACTION_ICONS: Partial<Record<ReportStatus, LucideIcon>> = {
  InProgress: Play,
  Resolved: CircleCheck,
  Rejected: CircleX,
}

interface StatusPanelProps {
  report: Report
  // Thirret me raportin e përditësuar kur statusi ndryshon me sukses.
  onChanged: (report: Report) => void
}

// Paneli me të cilin admini ndryshon statusin. Refuzimi kërkon arsye (qytetari e sheh si koment).
function StatusPanel({ report, onChanged }: StatusPanelProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)

  const nextSteps = NEXT_STEPS[report.status]

  async function change(status: ReportStatus, why?: string): Promise<boolean> {
    setBusy(true)
    try {
      const updated = await updateReportStatus(report.id, status, why)
      onChanged(updated)
      return true
    } catch (e) {
      // P.sh. 409 nëse statusi ndryshoi ndërkohë, ose 400 nga validimi.
      const message = e instanceof Error ? e.message : 'Ndodhi një gabim. Provo përsëri.'
      if (status === 'Rejected') setReasonError(message)
      else setError(message)
      return false
    } finally {
      setBusy(false)
    }
  }

  function handleStep(status: ReportStatus) {
    setError(null)
    if (status === 'Rejected') {
      setReason('')
      setReasonError(null)
      setRejectOpen(true)
    } else {
      void change(status)
    }
  }

  async function handleReject() {
    if (!reason.trim()) {
      setReasonError('Shkruaj arsyen e refuzimit. Qytetari do ta shohë.')
      return
    }
    setReasonError(null)
    if (await change('Rejected', reason)) {
      setRejectOpen(false)
    }
  }

  return (
    <section className="detail-card">
      <h2 className="detail-side-title">Ndrysho statusin</h2>
      <div>
        <StatusBadge status={report.status} />
      </div>

      {nextSteps.length > 0 ? (
        <div className="detail-actions">
          {nextSteps.map((step) => {
            const Icon = ACTION_ICONS[step]
            return (
              <button
                key={step}
                type="button"
                className={step === 'Rejected' ? 'btn btn-danger-outline' : 'btn btn-primary'}
                disabled={busy}
                onClick={() => handleStep(step)}
              >
                {Icon && <Icon size={17} aria-hidden="true" />}
                {ACTION_LABELS[step]}
              </button>
            )
          })}
        </div>
      ) : (
        <p className="detail-actions-note">
          Raporti është i mbyllur dhe statusi nuk mund të ndryshohet më. Mund të vazhdosh bisedën.
        </p>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={rejectOpen}
        title="Të refuzohet raporti?"
        message="Qytetari do ta shohë arsyen te biseda. Pasi të refuzohet, raporti mbyllet dhe nuk kthehet më."
        confirmLabel="Refuzo raportin"
        busyLabel="Duke refuzuar..."
        busy={busy}
        error={reasonError}
        onConfirm={handleReject}
        onCancel={() => setRejectOpen(false)}
      >
        <div className="field">
          <label htmlFor="reject-reason">Arsyeja</label>
          <textarea
            id="reject-reason"
            rows={4}
            maxLength={MAX_REASON}
            placeholder="P.sh. Problemi nuk është në juridiksionin e komunës."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <span className="field-hint">
            {reason.length}/{MAX_REASON}
          </span>
        </div>
      </ConfirmDialog>
    </section>
  )
}

export default StatusPanel
