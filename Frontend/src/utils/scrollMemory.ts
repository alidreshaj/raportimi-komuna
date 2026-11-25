// Kujton sa ishte zhvendosur faqja për çdo hyrje të historikut (`location.key` i React Router),
// që butoni "Mbrapa" të të kthejë aty ku ishe, jo në krye të listës.
// Mbahen vetëm hyrjet e fundit, që kujtesa mos rritet pa fund gjatë një sesioni të gjatë.
export const MAX_ENTRIES = 50

export function createScrollMemory(max = MAX_ENTRIES) {
  const positions = new Map<string, number>()

  return {
    save(key: string, y: number) {
      // Fshihet dhe shtohet përsëri, që hyrja të dalë e fundit (më e reja) te radha e Map-it.
      positions.delete(key)
      positions.set(key, Math.max(0, Math.round(y)))
      while (positions.size > max) {
        const oldest = positions.keys().next().value as string
        positions.delete(oldest)
      }
    },
    get(key: string): number | undefined {
      return positions.get(key)
    },
    get size() {
      return positions.size
    },
  }
}
