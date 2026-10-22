import { KOSOVO_BOUNDARY } from '../data/kosovoBoundary'

// A bie pika brenda kufirit të Kosovës? Metoda "rrezja": nga pika hedhim një vijë drejt lindjes dhe numërojmë sa herë
// e pret kufirin. Numër tek = brenda, numër çift = jashtë. Pa bibliotekë, sepse kufiri është një poligon i vetëm pa vrima.
export function isInsideKosovo(latitude: number, longitude: number): boolean {
  let inside = false

  for (let i = 0, j = KOSOVO_BOUNDARY.length - 1; i < KOSOVO_BOUNDARY.length; j = i++) {
    const [lat1, lng1] = KOSOVO_BOUNDARY[i]
    const [lat2, lng2] = KOSOVO_BOUNDARY[j]

    const crossesLatitude = lat1 > latitude !== lat2 > latitude
    if (crossesLatitude && longitude < ((lng2 - lng1) * (latitude - lat1)) / (lat2 - lat1) + lng1) {
      inside = !inside
    }
  }

  return inside
}
