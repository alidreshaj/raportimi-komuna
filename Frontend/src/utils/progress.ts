// Një numërues i vogël i punëve në vazhdim (kërkesa te serveri, ndërrim faqeje). Shiriti lart e lexon me useSyncExternalStore.
let pending = 0
let snapshot = { busy: false }
const listeners = new Set<() => void>()

function emit(): void {
  const busy = pending > 0
  if (busy !== snapshot.busy) {
    snapshot = { busy }
    listeners.forEach((listener) => listener())
  }
}

export function startProgress(): void {
  pending += 1
  emit()
}

export function stopProgress(): void {
  pending = Math.max(0, pending - 1)
  emit()
}

// Një "puls" i shkurtër (p.sh. kur ndërron faqja), edhe pse nuk ka kërkesë te serveri.
export function pulseProgress(ms = 350): void {
  startProgress()
  window.setTimeout(stopProgress, ms)
}

export function subscribeProgress(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getProgressSnapshot(): { busy: boolean } {
  return snapshot
}
