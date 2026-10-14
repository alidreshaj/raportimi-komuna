// Ruajtja e tokenit JWT te shfletuesi. I vetmi vend ku preket localStorage për token.
// Kufizim i njohur: localStorage lexohet nga çdo script i faqes, prandaj një dobësi XSS mund ta vjedhë tokenin.

const KEY = 'token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null // localStorage mund të jetë i bllokuar (p.sh. dritare private)
  }
}

export function saveToken(token: string): void {
  try {
    localStorage.setItem(KEY, token)
  } catch {
    // nuk e ruajmë dot: përdoruesi do të duhet të hyjë përsëri pas rifreskimit
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // asgjë për të bërë
  }
}
