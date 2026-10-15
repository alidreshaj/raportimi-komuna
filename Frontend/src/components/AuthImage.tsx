import { useEffect, useState } from 'react'
import { fetchImageBlob } from '../api/images'
import './AuthImage.css'

interface AuthImageProps {
  // Adresa relative e foto-s nga API-ja, p.sh. /api/reports/5/images/12
  url: string
  alt: string
}

// Shfaq një foto të mbrojtur. <img src> nuk dërgon dot tokenin, prandaj e marrim me fetch (me token),
// e kthejmë në adresë të përkohshme (blob:...) dhe e vendosim te <img>.
function AuthImage({ url, alt }: AuthImageProps) {
  const [src, setSrc] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null

    fetchImageBlob(url)
      .then((blob) => {
        if (cancelled) return // komponenti u mbyll para se foto të mbërrinte: mos krijo adresë
        objectUrl = URL.createObjectURL(blob)
        setSrc(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl) // liron memorien
    }
  }, [url])

  if (failed) {
    return <div className="auth-image auth-image--state">Fotoja nuk u ngarkua.</div>
  }

  if (!src) {
    return <div className="auth-image auth-image--state">Po ngarkohet...</div>
  }

  return <img className="auth-image" src={src} alt={alt} />
}

export default AuthImage
