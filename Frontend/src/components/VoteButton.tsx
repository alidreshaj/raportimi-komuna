import { useState } from 'react'
import { ThumbsUp } from 'lucide-react'
import { unvoteReport, voteReport } from '../api/reports'
import { useToast } from '../context/useToast'
import type { CommunityReport, VoteResult } from '../types'
import './VoteButton.css'

interface VoteButtonProps {
  report: CommunityReport
  // Njofton prindin me numrin e ri, që lista të përditësohet pa u ngarkuar përsëri.
  onChange: (result: VoteResult) => void
}

// Butoni "Edhe unë" me numrin e votave. Ndryshon menjëherë (pa pritur serverin) dhe kthehet mbrapsht nëse dështon.
function VoteButton({ report, onChange }: VoteButtonProps) {
  const toast = useToast()
  const [pending, setPending] = useState(false)

  const closed = report.status === 'Resolved'
  const disabled = pending || report.isMine || (closed && !report.hasVoted)

  let hint = 'Edhe unë e kam këtë problem'
  if (report.isMine) hint = 'Ky është raporti yt'
  else if (closed && !report.hasVoted) hint = 'Ky problem u zgjidh'
  else if (report.hasVoted) hint = 'Hiq mbështetjen'

  async function toggle() {
    const wasVoted = report.hasVoted
    setPending(true)
    // Ndryshimi i menjëhershëm: numri dhe gjendja kthehen te vlerat e vërteta kur vjen përgjigja e serverit.
    onChange({ voteCount: report.voteCount + (wasVoted ? -1 : 1), hasVoted: !wasVoted })

    try {
      onChange(await (wasVoted ? unvoteReport(report.id) : voteReport(report.id)))
    } catch (e) {
      onChange({ voteCount: report.voteCount, hasVoted: wasVoted })
      toast.show((e as Error).message, 'error')
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      className={`vote-button${report.hasVoted ? ' vote-button--on' : ''}`}
      aria-pressed={report.hasVoted}
      aria-label={`${hint}. ${report.voteCount} mbështetje.`}
      title={hint}
      disabled={disabled}
      onClick={toggle}
    >
      <ThumbsUp size={17} aria-hidden="true" />
      <span className="vote-button-label">{report.isMine ? 'Yti' : report.hasVoted ? 'E mbështete' : 'Edhe unë'}</span>
      <span className="vote-button-count">{report.voteCount}</span>
    </button>
  )
}

export default VoteButton
