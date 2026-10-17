import { useEffect, useState } from 'react'
import { getReport } from '../api/reports'
import type { Report } from '../types'

// Ngarkon një raport sipas numrit. report = null derisa po ngarkohet; error mban mesazhin (p.sh. "Nuk u gjet.").
export function useReport(reportId: number) {
  // Vlerat që mund të llogariten gjatë vizatimit nuk duhen futur te gjendja përmes efektit.
  const validId = Number.isInteger(reportId) && reportId > 0

  const [report, setReport] = useState<Report | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const error = validId ? loadError : 'Adresa e raportit nuk është e vlefshme.'

  useEffect(() => {
    if (!validId) {
      return
    }

    let cancelled = false

    getReport(reportId)
      .then((r) => {
        if (!cancelled) setReport(r)
      })
      .catch((e: Error) => {
        if (!cancelled) setLoadError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [reportId, validId])

  return { report, error }
}
