import FingerprintJS from '@fingerprintjs/fingerprintjs'

let cachedFingerprint: string | null = null
let fpPromise: Promise<string> | null = null

export async function getDeviceFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint
  if (fpPromise) return fpPromise

  fpPromise = FingerprintJS.load()
    .then(fp => fp.get())
    .then(result => {
      cachedFingerprint = result.visitorId
      return cachedFingerprint!
    })

  return fpPromise
}
