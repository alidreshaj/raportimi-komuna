import { useEffect, useState } from 'react'

// A duhet të luhet animacioni i hyrjes? Po, por vetëm herën e parë që shfaqen elementë te lista (një dritare e shkurtër pas shfaqjes):
// kur ndryshon filtri ose faqja, kartat e reja nuk rihyjnë me animacion (nuk lodhin syrin).
// Përdoret kështu: <ul className={enter ? 'report-list--enter' : ''}>
export function useEnterOnce(hasItems: boolean): boolean {
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!hasItems || done) return
    // Animacioni zgjat nën 600 ms; pas kësaj klasa nuk nevojitet më.
    const timer = window.setTimeout(() => setDone(true), 700)
    return () => window.clearTimeout(timer)
  }, [hasItems, done])

  return hasItems && !done
}
